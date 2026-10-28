<?php
/**
 * Mitglieder-CRM (/mitgliederliste/): the member register of the
 * Genossenschaft, for staff only.
 *
 * Access needs the capability hansea_crm: the role "Mitgliederverwaltung"
 * has it, and so do administrators. Each member is a private post of the
 * type hansea_mitglied. Its fields are stored in the meta hansea_crm.
 * IBAN, Steuer-ID and Kirchensteuer are kept in the meta hansea_crm_secret,
 * encrypted with libsodium. The key is in a PHP file outside the theme
 * (see hansea_crm_key()), or in the constant HANSEA_CRM_KEY. The API
 * returns these values only masked. Revealing them is logged.
 *
 * Every change is logged with who and when (meta hansea_crm_log).
 *
 * Approving an Antrag assigns the next Mitgliedsnummer. It also creates
 * the portal account and sends the welcome email (inc/welcome.php).
 * Approved members who have no account get one through
 * "Portal-Zugang einrichten".
 */

defined( 'ABSPATH' ) || exit;

const HANSEA_CRM_TYPE = 'hansea_mitglied';
const HANSEA_CRM_CAP  = 'hansea_crm';
/** Aufsichtsrat members: vote on Beschlüsse (role "Aufsichtsrat"). */
const HANSEA_AR_CAP = 'hansea_ar';
/** Votes a Beschluss needs: every member of the Aufsichtsrat, and at least this many. */
const HANSEA_AR_SIZE = 3;
/** Target interest on paid-in capital, p.a. (not guaranteed). */
const HANSEA_CRM_ZINS = 0.07;

/** Text fields of a member record. */
const HANSEA_CRM_TEXT = array(
	'firma', 'anrede', 'vorname', 'nachname', 'strasse', 'plz', 'ort', 'land', 'telefon', 'email',
	'zulassung_ar', 'bundesland', 'kontoinhaber', 'empfehler', 'aus_grund', 'aus_ar',
);
/** Date fields (Y-m-d). */
const HANSEA_CRM_DATES = array( 'geburtstag', 'zulassung_datum', 'kuendbar_zu', 'aus_eintragung', 'aus_datum' );
/** Fields with a fixed set of values; the first one is the default. */
const HANSEA_CRM_CHOICES = array(
	'status'           => array( 'antrag', 'zugelassen', 'abgelehnt', 'ausgeschieden' ),
	'art'              => array( 'i', 'o' ),
	'zulassung_status' => array( 'offen', 'zugestimmt', 'abgelehnt' ),
	'aus_ar_status'    => array( '', 'offen', 'zugestimmt', 'abgelehnt' ),
);
/** Rows of the list fields: field => type ('text', 'date', 'number', 'ar'). */
const HANSEA_CRM_LISTS = array(
	'zeichnungen'  => array( 'zugelassen' => 'date', 'anteile' => 'number', 'ar' => 'text', 'ar_status' => 'ar', 'zahlung' => 'date', 'betrag' => 'number', 'zins_ende' => 'date', 'zins_zahlung' => 'date' ),
	'kuendigungen' => array( 'datum' => 'date', 'anteile' => 'number', 'zum' => 'date', 'betrag' => 'number', 'ar' => 'text', 'ar_status' => 'ar' ),
	'bonus'        => array( 'projekt' => 'text', 'anteile' => 'number', 'betrag' => 'number', 'auszahlung' => 'date' ),
	// Interest paid out: date, end of the interest period, gross amount, tax withheld.
	'zinszahlungen' => array( 'datum' => 'date', 'zeitraum' => 'date', 'betrag' => 'number', 'steuer' => 'number' ),
);
/** Encrypted fields. */
const HANSEA_CRM_SECRETS = array( 'iban', 'steuer_id', 'kirchensteuer' );

/* ---------------------------------------------------------------------------
 * Role, post type, routing
 * ------------------------------------------------------------------------ */

add_action( 'init', function () {
	register_post_type( HANSEA_CRM_TYPE, array(
		'label'           => 'Mitglieder (CRM)',
		'public'          => false,
		'show_ui'         => false,
		'show_in_rest'    => false,
		'rewrite'         => false,
		'query_var'       => false,
		'supports'        => array( 'title' ),
		'capability_type' => 'post',
	) );

	// Roles and capabilities, once per version.
	if ( get_option( 'hansea_crm_roles' ) !== '2' ) {
		add_role( 'mitgliederverwaltung', 'Mitgliederverwaltung', array( 'read' => true, HANSEA_CRM_CAP => true ) );
		add_role( 'aufsichtsrat', 'Aufsichtsrat', array( 'read' => true, HANSEA_CRM_CAP => true, HANSEA_AR_CAP => true ) );
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			$admin->add_cap( HANSEA_CRM_CAP );
		}
		update_option( 'hansea_crm_roles', '2' );
	}
} );

/**
 * Staff who only manage members (no editors, no member account of their
 * own): they land in the CRM, not in wp-admin or the members' area. Someone
 * with both roles (subscriber + Mitgliederverwaltung) can use both.
 */
function hansea_crm_staff_only( $user = null ) {
	$user = $user ?: wp_get_current_user();
	return $user instanceof WP_User && $user->exists() && user_can( $user, HANSEA_CRM_CAP ) && ! user_can( $user, 'edit_posts' ) && ! in_array( 'subscriber', (array) $user->roles, true );
}

add_filter( 'login_redirect', function ( $redirect_to, $requested, $user ) {
	return $user instanceof WP_User && hansea_crm_staff_only( $user ) ? home_url( '/mitgliederliste/' ) : $redirect_to;
}, 20, 3 );

/* ---------------------------------------------------------------------------
 * Encryption
 * ------------------------------------------------------------------------ */

/**
 * The 32-byte key. HANSEA_CRM_KEY (64 hex characters) in wp-config.php wins.
 * Otherwise the key lives in hansea-crm-key.php next to the WordPress folder
 * (outside the web root where the host allows it), else in wp-content. The
 * file is created on first use. Without the key the encrypted fields can't
 * be read, so the file belongs in the server backup.
 */
function hansea_crm_key() {
	static $key = null;
	if ( null !== $key ) {
		return $key;
	}
	if ( defined( 'HANSEA_CRM_KEY' ) && preg_match( '/^[0-9a-f]{64}$/i', HANSEA_CRM_KEY ) ) {
		return $key = hex2bin( HANSEA_CRM_KEY );
	}
	$files = array( dirname( untrailingslashit( ABSPATH ) ) . '/hansea-crm-key.php', WP_CONTENT_DIR . '/hansea-crm-key.php' );
	foreach ( $files as $file ) {
		if ( is_readable( $file ) ) {
			$hex = include $file;
			if ( is_string( $hex ) && preg_match( '/^[0-9a-f]{64}$/i', $hex ) ) {
				return $key = hex2bin( $hex );
			}
		}
	}
	$hex = bin2hex( random_bytes( SODIUM_CRYPTO_SECRETBOX_KEYBYTES ) );
	foreach ( $files as $file ) {
		if ( ! is_writable( dirname( $file ) ) ) {
			continue;
		}
		$handle = @fopen( $file, 'x' ); // fails if another request just created it
		if ( ! $handle ) {
			$existing = @include $file;
			if ( is_string( $existing ) && preg_match( '/^[0-9a-f]{64}$/i', $existing ) ) {
				return $key = hex2bin( $existing );
			}
			continue;
		}
		fwrite( $handle, "<?php\n// Schlüssel für die verschlüsselten Felder im Mitglieder-CRM. Nicht löschen, mit sichern.\nreturn '{$hex}';\n" );
		fclose( $handle );
		@chmod( $file, 0600 );
		return $key = hex2bin( $hex );
	}
	return $key = false;
}

function hansea_crm_encrypt( array $values ) {
	$key = hansea_crm_key();
	if ( ! $key ) {
		return new WP_Error( 'hansea_crm_key', 'Der Schlüssel für verschlüsselte Felder fehlt.', array( 'status' => 500 ) );
	}
	$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
	return 'v1:' . base64_encode( $nonce . sodium_crypto_secretbox( wp_json_encode( $values ), $nonce, $key ) );
}

/** Decrypted secret fields of a member (empty strings when none are stored). */
function hansea_crm_secrets( $post_id ) {
	$empty  = array_fill_keys( HANSEA_CRM_SECRETS, '' );
	$stored = (string) get_post_meta( $post_id, 'hansea_crm_secret', true );
	$key    = hansea_crm_key();
	if ( '' === $stored || ! $key || 0 !== strpos( $stored, 'v1:' ) ) {
		return $empty;
	}
	$raw   = base64_decode( substr( $stored, 3 ) );
	$plain = sodium_crypto_secretbox_open( substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), $key );
	$data  = false === $plain ? null : json_decode( $plain, true );
	return is_array( $data ) ? array_merge( $empty, array_intersect_key( $data, $empty ) ) : $empty;
}

/** Shows only the end of a value: "•••• 4011". */
function hansea_crm_mask( $value, $visible = 4 ) {
	$value = preg_replace( '/\s+/', '', (string) $value );
	if ( '' === $value ) {
		return '';
	}
	return strlen( $value ) <= $visible ? '••••' : '•••• ' . substr( $value, -$visible );
}

/* ---------------------------------------------------------------------------
 * Records
 * ------------------------------------------------------------------------ */

function hansea_crm_date( $value ) {
	$value = trim( (string) $value );
	if ( preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', $value, $m ) && checkdate( (int) $m[2], (int) $m[3], (int) $m[1] ) ) {
		return $value;
	}
	if ( preg_match( '/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/', $value, $m ) && checkdate( (int) $m[2], (int) $m[1], (int) $m[3] ) ) {
		return sprintf( '%04d-%02d-%02d', $m[3], $m[2], $m[1] );
	}
	return '';
}

function hansea_crm_number( $value ) {
	if ( null === $value || '' === $value ) {
		return null;
	}
	$value = is_string( $value ) ? str_replace( array( '.', ',' ), array( '', '.' ), preg_replace( '/[^\d,.\-]/', '', $value ) ) : $value;
	return is_numeric( $value ) ? round( (float) $value, 2 ) : null;
}

/** Cleans a record sent by the app or the import; unknown keys are dropped. */
function hansea_crm_sanitize( array $in ) {
	$out = array();
	foreach ( HANSEA_CRM_TEXT as $field ) {
		$out[ $field ] = sanitize_text_field( (string) ( $in[ $field ] ?? '' ) );
	}
	$out['email'] = sanitize_email( $out['email'] );
	foreach ( HANSEA_CRM_DATES as $field ) {
		$out[ $field ] = hansea_crm_date( $in[ $field ] ?? '' );
	}
	foreach ( HANSEA_CRM_CHOICES as $field => $choices ) {
		$value         = (string) ( $in[ $field ] ?? '' );
		$out[ $field ] = in_array( $value, $choices, true ) ? $value : $choices[0];
	}
	$out['bemerkungen'] = sanitize_textarea_field( (string) ( $in['bemerkungen'] ?? '' ) );
	$out['freistellung'] = hansea_crm_number( $in['freistellung'] ?? null );
	$nr        = isset( $in['nr'] ) && '' !== $in['nr'] && null !== $in['nr'] ? absint( $in['nr'] ) : 0;
	$out['nr'] = $nr > 0 ? $nr : null;

	foreach ( HANSEA_CRM_LISTS as $list => $columns ) {
		$out[ $list ] = array();
		foreach ( (array) ( $in[ $list ] ?? array() ) as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$clean = array();
			foreach ( $columns as $column => $type ) {
				$value = $row[ $column ] ?? '';
				if ( 'date' === $type ) {
					$clean[ $column ] = hansea_crm_date( $value );
				} elseif ( 'number' === $type ) {
					$clean[ $column ] = hansea_crm_number( $value );
				} elseif ( 'ar' === $type ) {
					$clean[ $column ] = in_array( $value, HANSEA_CRM_CHOICES['zulassung_status'], true ) ? $value : '';
				} else {
					$clean[ $column ] = sanitize_text_field( (string) $value );
				}
			}
			if ( array_filter( $clean, function ( $v ) { return null !== $v && '' !== $v; } ) ) {
				$out[ $list ][] = $clean;
			}
		}
	}
	return $out;
}

function hansea_crm_record( $post_id ) {
	$record = get_post_meta( $post_id, 'hansea_crm', true );
	return hansea_crm_sanitize( is_array( $record ) ? $record : array() );
}

function hansea_crm_name( array $r ) {
	$name = trim( $r['vorname'] . ' ' . $r['nachname'] );
	return '' !== $name ? $name : ( $r['firma'] ?: 'Ohne Namen' );
}

/** Writes a record (and, if given, the secret fields). Returns the post ID. */
function hansea_crm_save( array $record, $post_id = 0, ?array $secrets = null ) {
	$record = hansea_crm_sanitize( $record );
	$postarr = array(
		'post_type'   => HANSEA_CRM_TYPE,
		'post_status' => 'private',
		'post_title'  => hansea_crm_name( $record ),
	);
	if ( $post_id ) {
		$postarr['ID'] = $post_id;
		$post_id       = wp_update_post( $postarr, true );
	} else {
		$post_id = wp_insert_post( $postarr, true );
	}
	if ( is_wp_error( $post_id ) ) {
		return $post_id;
	}
	update_post_meta( $post_id, 'hansea_crm', wp_slash( $record ) );
	if ( null !== $secrets ) {
		$values = array();
		foreach ( HANSEA_CRM_SECRETS as $field ) {
			$values[ $field ] = sanitize_text_field( (string) ( $secrets[ $field ] ?? '' ) );
		}
		$values['iban'] = strtoupper( preg_replace( '/\s+/', '', $values['iban'] ) );
		$encrypted      = hansea_crm_encrypt( $values );
		if ( is_wp_error( $encrypted ) ) {
			return $encrypted;
		}
		update_post_meta( $post_id, 'hansea_crm_secret', $encrypted );
	}
	return $post_id;
}

function hansea_crm_log( $post_id, $action, $detail = '' ) {
	$user = wp_get_current_user();
	add_post_meta( $post_id, 'hansea_crm_log', array(
		'time'   => gmdate( 'c' ),
		'user'   => $user->exists() ? ( $user->display_name ?: $user->user_login ) : 'System',
		'action' => $action,
		'detail' => $detail,
	) );
}

/** Portal account of a member: none, created, invited (with date). */
function hansea_crm_portal( $post_id ) {
	$user = get_userdata( (int) get_post_meta( $post_id, 'hansea_crm_user', true ) );
	if ( ! $user ) {
		return array( 'status' => 'keiner' );
	}
	$sent = (string) get_user_meta( $user->ID, 'hansea_welcome_sent', true );
	return array(
		'status'  => $sent ? 'eingeladen' : 'angelegt',
		'email'   => $user->user_email,
		'invited' => $sent ? mysql_to_rfc3339( $sent ) : null,
	);
}

/** Anteile and capital: subscribed, cancelled, and still held today. */
function hansea_crm_totals( array $r ) {
	$anteile = 0;
	$kapital = 0;
	foreach ( $r['zeichnungen'] as $z ) {
		$anteile += (float) $z['anteile'];
		$kapital += (float) $z['betrag'];
	}
	$gekuendigt = 0;
	$ausgezahlt = 0;
	$today      = current_time( 'Y-m-d' );
	foreach ( $r['kuendigungen'] as $k ) {
		$gekuendigt += (float) $k['anteile'];
		if ( $k['zum'] && $k['zum'] <= $today ) {
			$ausgezahlt += (float) $k['anteile'];
		}
	}
	return array(
		'anteile'    => $anteile,
		'kapital'    => $kapital,
		'gekuendigt' => $gekuendigt,
		'aktiv'      => max( 0, $anteile - $ausgezahlt ),
	);
}

/** Short row for the list. */
function hansea_crm_summary( WP_Post $post ) {
	$r = hansea_crm_record( $post->ID );
	return array_merge( array(
		'id'               => $post->ID,
		'nr'               => $r['nr'],
		'name'             => hansea_crm_name( $r ),
		'firma'            => $r['firma'],
		'ort'              => $r['ort'],
		'email'            => $r['email'],
		'art'              => $r['art'],
		'status'           => $r['status'],
		'zulassung_status' => $r['zulassung_status'],
		'zulassung_datum'  => $r['zulassung_datum'],
		'empfehler'        => $r['empfehler'],
		'bonus'            => $r['bonus'],
		'portal'           => hansea_crm_portal( $post->ID )['status'],
		'updated'          => mysql_to_rfc3339( $post->post_modified_gmt ),
	), hansea_crm_totals( $r ) );
}

/** Full record for the detail page; secrets masked. */
function hansea_crm_detail( $post_id ) {
	$secrets = hansea_crm_secrets( $post_id );
	$log     = array_reverse( (array) get_post_meta( $post_id, 'hansea_crm_log' ) );
	return array(
		'id'      => (int) $post_id,
		'record'  => hansea_crm_record( $post_id ),
		'masked'  => array(
			'iban'          => hansea_crm_mask( $secrets['iban'] ),
			'steuer_id'     => hansea_crm_mask( $secrets['steuer_id'], 3 ),
			'kirchensteuer' => '' === $secrets['kirchensteuer'] ? '' : '••••',
		),
		'portal'  => hansea_crm_portal( $post_id ),
		'totals'  => hansea_crm_totals( hansea_crm_record( $post_id ) ),
		'next'    => hansea_crm_next_interest( hansea_crm_record( $post_id ), current_time( 'Y-m-d' ) ),
		'log'     => array_values( $log ),
		'documents' => hansea_crm_documents( $post_id ),
		'beschluesse' => array_map( 'hansea_crm_beschluss_public', hansea_crm_beschluesse( $post_id ) ),
	);
}

function hansea_crm_next_nr() {
	$max = 0;
	foreach ( get_posts( array( 'post_type' => HANSEA_CRM_TYPE, 'post_status' => 'private', 'numberposts' => -1, 'fields' => 'ids' ) ) as $id ) {
		$max = max( $max, (int) hansea_crm_record( $id )['nr'] );
	}
	return $max + 1;
}

/**
 * Creates the member's portal account (or links an existing member account
 * with the same email) and sends the welcome email.
 *
 * @return string|WP_Error Message for the team.
 */
function hansea_crm_open_portal( $post_id ) {
	$r = hansea_crm_record( $post_id );
	if ( 'zugelassen' !== $r['status'] ) {
		return new WP_Error( 'hansea_crm_status', 'Nur zugelassene Mitglieder erhalten einen Portal-Zugang.', array( 'status' => 409 ) );
	}
	if ( ! is_email( $r['email'] ) ) {
		return new WP_Error( 'hansea_crm_email', 'Für den Portal-Zugang fehlt eine gültige E-Mail-Adresse.', array( 'status' => 422 ) );
	}
	$user = get_userdata( (int) get_post_meta( $post_id, 'hansea_crm_user', true ) );
	if ( ! $user ) {
		$user = get_user_by( 'email', $r['email'] );
		if ( $user && ( user_can( $user, 'edit_posts' ) || user_can( $user, HANSEA_CRM_CAP ) ) ) {
			return new WP_Error( 'hansea_crm_staff', 'Diese E-Mail-Adresse gehört zu einem Mitarbeiterkonto. Bitte eine andere Adresse eintragen.', array( 'status' => 409 ) );
		}
		if ( ! $user ) {
			$first   = $r['vorname'] ?: $r['firma'];
			$user_id = hansea_create_member_account( $first, $r['nachname'], $r['email'] );
			if ( is_wp_error( $user_id ) ) {
				return new WP_Error( 'hansea_crm_account', 'Das Konto konnte nicht angelegt werden.', array( 'status' => 500 ) );
			}
			$user = get_userdata( $user_id );
		}
		update_post_meta( $post_id, 'hansea_crm_user', $user->ID );
		update_user_meta( $user->ID, 'hansea_crm_member', $post_id );
	}
	if ( ! hansea_send_welcome( $user ) ) {
		hansea_crm_log( $post_id, 'Portal-Zugang angelegt', 'Willkommensmail konnte nicht gesendet werden' );
		return 'Portal-Konto angelegt, aber die Willkommensmail konnte nicht gesendet werden. Bitte erneut versuchen.';
	}
	hansea_crm_log( $post_id, 'Portal-Zugang eingerichtet', 'Willkommensmail an ' . $user->user_email );
	return 'Portal-Zugang eingerichtet. Die Willkommensmail ist an ' . $user->user_email . ' unterwegs.';
}

/* ---------------------------------------------------------------------------
 * REST API: /wp-json/hansea/v1/crm/…
 * ------------------------------------------------------------------------ */

function hansea_crm_can() {
	return current_user_can( HANSEA_CRM_CAP );
}

/** The member post for a request, or a 404 error. */
function hansea_crm_post( WP_REST_Request $request ) {
	$post = get_post( (int) $request['id'] );
	return $post && HANSEA_CRM_TYPE === $post->post_type ? $post : hansea_error( 'hansea_crm_missing', 'Mitglied nicht gefunden.', 404 );
}

add_action( 'rest_api_init', function () {
	$id = '/crm/members/(?P<id>\d+)';
	$routes = array(
		array( '/crm/members', 'GET', 'hansea_crm_rest_list' ),
		array( '/crm/members', 'POST', 'hansea_crm_rest_create' ),
		array( $id, 'GET', 'hansea_crm_rest_get' ),
		array( $id, 'POST', 'hansea_crm_rest_update' ),
		array( $id . '/reveal', 'POST', 'hansea_crm_rest_reveal' ),
		array( $id . '/beschluss', 'POST', 'hansea_crm_rest_beschluss_create' ),
		array( $id . '/beschluss/(?P<bid>[a-f0-9]{16})/vote', 'POST', 'hansea_crm_rest_beschluss_vote' ),
		array( $id . '/beschluss/(?P<bid>[a-f0-9]{16})/cancel', 'POST', 'hansea_crm_rest_beschluss_cancel' ),
		array( '/crm/beschluesse', 'GET', 'hansea_crm_rest_beschluesse' ),
		array( $id . '/portal', 'POST', 'hansea_crm_rest_portal' ),
		array( $id . '/documents', 'POST', 'hansea_crm_rest_document_upload' ),
		array( $id . '/documents/(?P<doc>[a-f0-9]{32})', 'GET', 'hansea_crm_rest_document_get' ),
	);
	foreach ( $routes as list( $route, $method, $callback ) ) {
		register_rest_route( 'hansea/v1', $route, array(
			'methods'             => $method,
			'callback'            => $callback,
			'permission_callback' => 'hansea_crm_can',
		) );
	}
} );

// No caching of member data anywhere.
add_filter( 'rest_post_dispatch', function ( $response, $server, $request ) {
	if ( 0 === strpos( $request->get_route(), '/hansea/v1/crm' ) ) {
		$response->header( 'Cache-Control', 'no-store, private' );
	}
	return $response;
}, 10, 3 );

function hansea_crm_rest_list() {
	$posts = get_posts( array( 'post_type' => HANSEA_CRM_TYPE, 'post_status' => 'private', 'numberposts' => -1 ) );
	return rest_ensure_response( array_map( 'hansea_crm_summary', $posts ) );
}

function hansea_crm_rest_get( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	return is_wp_error( $post ) ? $post : rest_ensure_response( hansea_crm_detail( $post->ID ) );
}

/** New Antrag: status antrag, no number yet. */
function hansea_crm_rest_create( WP_REST_Request $request ) {
	$record = (array) $request->get_param( 'record' );
	if ( '' === trim( ( $record['nachname'] ?? '' ) . ( $record['firma'] ?? '' ) ) ) {
		return hansea_error( 'hansea_crm_name', 'Bitte mindestens Nachname oder Firma angeben.', 422 );
	}
	$record = array_merge( $record, array( 'status' => 'antrag', 'zulassung_status' => 'offen', 'nr' => null ) );
	$post_id = hansea_crm_save( $record, 0, (array) $request->get_param( 'secrets' ) );
	if ( is_wp_error( $post_id ) ) {
		return $post_id;
	}
	hansea_crm_log( $post_id, 'Antrag angelegt' );
	return rest_ensure_response( hansea_crm_detail( $post_id ) );
}

/** Saves the edited record; secret fields only when sent (null = unchanged). */
function hansea_crm_rest_update( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$before = hansea_crm_record( $post->ID );
	$after  = hansea_crm_sanitize( (array) $request->get_param( 'record' ) );
	if ( null !== $after['nr'] && $after['nr'] !== $before['nr'] ) {
		foreach ( get_posts( array( 'post_type' => HANSEA_CRM_TYPE, 'post_status' => 'private', 'numberposts' => -1, 'fields' => 'ids', 'exclude' => array( $post->ID ) ) ) as $other ) {
			if ( hansea_crm_record( $other )['nr'] === $after['nr'] ) {
				return hansea_error( 'hansea_crm_nr', 'Die Mitgliedsnummer ' . $after['nr'] . ' ist schon vergeben.', 409 );
			}
		}
	}

	$sent    = $request->get_param( 'secrets' );
	$secrets = null;
	$changed = array();
	if ( is_array( $sent ) ) {
		$current = hansea_crm_secrets( $post->ID );
		foreach ( HANSEA_CRM_SECRETS as $field ) {
			if ( array_key_exists( $field, $sent ) && null !== $sent[ $field ] && (string) $sent[ $field ] !== $current[ $field ] ) {
				$current[ $field ] = (string) $sent[ $field ];
				$changed[]         = hansea_crm_label( $field );
			}
		}
		$secrets = $changed ? $current : null;
	}
	foreach ( $after as $field => $value ) {
		if ( $value !== $before[ $field ] ) {
			$changed[] = hansea_crm_label( $field );
		}
	}
	if ( ! $changed ) {
		return rest_ensure_response( hansea_crm_detail( $post->ID ) );
	}
	$saved = hansea_crm_save( $after, $post->ID, $secrets );
	if ( is_wp_error( $saved ) ) {
		return $saved;
	}
	hansea_crm_log( $post->ID, 'Geändert', implode( ', ', $changed ) );
	return rest_ensure_response( hansea_crm_detail( $post->ID ) );
}

function hansea_crm_rest_reveal( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	hansea_crm_log( $post->ID, 'Bank- und Steuerdaten angezeigt' );
	return rest_ensure_response( hansea_crm_secrets( $post->ID ) );
}

/** "Portal-Zugang einrichten" (or resend the welcome email). */
function hansea_crm_rest_portal( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$result = hansea_crm_open_portal( $post->ID );
	if ( is_wp_error( $result ) ) {
		return $result;
	}
	return rest_ensure_response( array( 'member' => hansea_crm_detail( $post->ID ), 'message' => $result ) );
}

/** Field names in the log. */
function hansea_crm_label( $field ) {
	$labels = array(
		'nr' => 'Mitgliedsnummer', 'art' => 'Art', 'status' => 'Status', 'firma' => 'Firma', 'anrede' => 'Anrede',
		'vorname' => 'Vorname', 'nachname' => 'Nachname', 'strasse' => 'Straße', 'plz' => 'PLZ', 'ort' => 'Ort',
		'land' => 'Land', 'telefon' => 'Telefon', 'email' => 'E-Mail', 'geburtstag' => 'Geburtstag',
		'zulassung_datum' => 'Tag der Zulassung', 'zulassung_status' => 'Zustimmung Aufsichtsrat',
		'zulassung_ar' => 'Zustimmender Aufsichtsrat', 'bundesland' => 'Bundesland', 'freistellung' => 'Freistellungsauftrag',
		'kontoinhaber' => 'Kontoinhaber', 'kuendbar_zu' => 'Kündigung möglich zu', 'empfehler' => 'Empfehler',
		'bemerkungen' => 'Bemerkungen', 'aus_eintragung' => 'Ausscheiden: Eintragung', 'aus_grund' => 'Ausscheiden: Grund',
		'aus_datum' => 'Tag des Ausscheidens', 'aus_ar_status' => 'Ausscheiden: Zustimmung AR', 'aus_ar' => 'Ausscheiden: AR',
		'zeichnungen' => 'Anteile und Zahlungen', 'kuendigungen' => 'Kündigungen', 'bonus' => 'Zeichnungsbonus', 'zinszahlungen' => 'Zinszahlungen',
		'iban' => 'IBAN', 'steuer_id' => 'Steuer-ID', 'kirchensteuer' => 'Kirchensteuer',
	);
	return $labels[ $field ] ?? $field;
}

/* ---------------------------------------------------------------------------
 * Members' area: the logged-in member's own figures
 * ------------------------------------------------------------------------ */

/** CRM post linked to a portal account (both sides must point at each other), or 0. */
function hansea_crm_member_of( WP_User $user ) {
	$post_id = (int) get_user_meta( $user->ID, 'hansea_crm_member', true );
	$post    = $post_id ? get_post( $post_id ) : null;
	return $post && HANSEA_CRM_TYPE === $post->post_type && (int) get_post_meta( $post_id, 'hansea_crm_user', true ) === $user->ID ? $post_id : 0;
}

/** Days from $from to $to, both counted (as in the Zinsliste). */
function hansea_crm_days( $from, $to ) {
	return (int) ( new DateTime( $from ) )->diff( new DateTime( $to ) )->format( '%r%a' ) + 1;
}

/**
 * Next interest payment (target, 7 % p.a.), from the payments in the record:
 * a subscription earns pro rata from its payment until its first interest
 * end, then a quarter's interest each quarter. Cancelled shares earn until
 * their date. Paid by the 14th after the quarter (15 January for Q4).
 * Quarters that already have a recorded Zinszahlung are skipped.
 *
 * @return array{date:string, amount:float, period:string}|null
 */
function hansea_crm_next_interest( array $r, $today ) {
	// Start with the previous quarter: its payment can still be ahead.
	$end = new DateTime( $today );
	$end->setDate( (int) $end->format( 'Y' ), (int) ceil( $end->format( 'n' ) / 3 ) * 3 - 3, 1 );
	$end->modify( 'last day of this month' );

	for ( $i = 0; $i < 6; $i++, $end->modify( 'first day of +3 months' )->modify( 'last day of this month' ) ) {
		$q        = $end->format( 'Y-m-d' );
		$prev_end = ( clone $end )->modify( 'first day of -3 months' )->modify( 'last day of this month' )->format( 'Y-m-d' );
		$pay      = ( clone $end )->modify( '12' === $end->format( 'm' ) ? '+15 days' : '+14 days' )->format( 'Y-m-d' );
		if ( $pay < $today || in_array( $q, array_column( $r['zinszahlungen'], 'zeitraum' ), true ) ) {
			continue;
		}
		$amount = 0.0;
		foreach ( $r['zeichnungen'] as $z ) {
			if ( ! $z['betrag'] || ! $z['zahlung'] || $z['zahlung'] > $q ) {
				continue;
			}
			// First period: from the payment to its first interest end (by default the quarter it was paid in).
			$first_end = $z['zins_ende'] ?: ( $z['zahlung'] > $prev_end ? $q : $prev_end );
			if ( $first_end > $q ) {
				continue; // still running, paid in one sum at its end
			}
			$amount += $first_end === $q
				? $z['betrag'] * HANSEA_CRM_ZINS * hansea_crm_days( $z['zahlung'], $q ) / 365
				: $z['betrag'] * HANSEA_CRM_ZINS / 4;
		}
		// Cancelled shares stop earning on their date.
		foreach ( $r['kuendigungen'] as $k ) {
			if ( ! $k['zum'] || $k['zum'] >= $q || ! $k['betrag'] ) {
				continue;
			}
			$amount -= $k['zum'] <= $prev_end
				? $k['betrag'] * HANSEA_CRM_ZINS / 4
				: $k['betrag'] * HANSEA_CRM_ZINS * ( hansea_crm_days( $k['zum'], $q ) - 1 ) / 365;
		}
		if ( $amount > 0.005 ) {
			return array( 'date' => $pay, 'amount' => round( $amount, 2 ), 'period' => $q );
		}
	}
	return null;
}

/** What the members' area shows: shares, capital and interest of the logged-in member; null without a CRM record. */
function hansea_crm_portfolio( WP_User $user ) {
	$post_id = hansea_crm_member_of( $user );
	if ( ! $post_id ) {
		return null;
	}
	$r      = hansea_crm_record( $post_id );
	$t      = hansea_crm_totals( $r );
	$today  = current_time( 'Y-m-d' );
	$paid   = 0;
	$open   = array();
	foreach ( $r['kuendigungen'] as $k ) {
		if ( $k['zum'] && $k['zum'] <= $today ) {
			$paid += (float) $k['betrag'];
		} else {
			$open[] = array( 'anteile' => $k['anteile'], 'zum' => $k['zum'] );
		}
	}
	$einlage = max( 0, $t['kapital'] - $paid );
	return array(
		'nr'           => $r['nr'],
		'since'        => $r['zulassung_datum'],
		'anteile'      => $t['aktiv'],
		'einlage'      => $einlage,
		'zinsenJahr'   => round( $einlage * HANSEA_CRM_ZINS, 2 ),
		'ausgezahlt'   => round( array_sum( array_column( $r['zinszahlungen'], 'betrag' ) ), 2 ),
		'zinszahlungen' => $r['zinszahlungen'],
		'next'         => hansea_crm_next_interest( $r, $today ),
		'zeichnungen'  => array_map( function ( $z ) {
			return array( 'anteile' => $z['anteile'], 'betrag' => $z['betrag'], 'zahlung' => $z['zahlung'] );
		}, $r['zeichnungen'] ),
		'kuendigungen' => $open,
	);
}

/* ---------------------------------------------------------------------------
 * Documents (signed Beitrittserklärung etc.): encrypted files outside the
 * web root where possible, listed in the meta hansea_crm_doc.
 * ------------------------------------------------------------------------ */

const HANSEA_CRM_DOC_MAX = 15 * MB_IN_BYTES;

/** Folder for the encrypted files; created with a deny-all .htaccess in case it is web-reachable. */
function hansea_crm_files_dir() {
	foreach ( array( dirname( untrailingslashit( ABSPATH ) ) . '/hansea-crm-files', WP_CONTENT_DIR . '/hansea-crm-files' ) as $dir ) {
		if ( is_dir( $dir ) || ( is_writable( dirname( $dir ) ) && wp_mkdir_p( $dir ) ) ) {
			if ( ! file_exists( $dir . '/.htaccess' ) ) {
				@file_put_contents( $dir . '/.htaccess', "Require all denied\nDeny from all\n" );
				@file_put_contents( $dir . '/index.php', "<?php // Silence.\n" );
			}
			return $dir;
		}
	}
	return '';
}

function hansea_crm_documents( $post_id ) {
	$docs = array();
	foreach ( (array) get_post_meta( $post_id, 'hansea_crm_doc' ) as $doc ) {
		if ( is_array( $doc ) && isset( $doc['id'] ) ) {
			$docs[] = array_intersect_key( $doc, array_flip( array( 'id', 'name', 'size', 'time', 'user' ) ) );
		}
	}
	return $docs;
}

function hansea_crm_rest_document_upload( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$file = $request->get_file_params()['file'] ?? null;
	if ( ! $file || UPLOAD_ERR_OK !== ( $file['error'] ?? 1 ) || ! is_uploaded_file( $file['tmp_name'] ) ) {
		return hansea_error( 'hansea_crm_upload', 'Die Datei ist nicht angekommen. Bitte erneut versuchen.', 400 );
	}
	if ( $file['size'] > HANSEA_CRM_DOC_MAX ) {
		return hansea_error( 'hansea_crm_upload', 'Die Datei ist zu groß (höchstens 15 MB).', 413 );
	}
	$data = (string) file_get_contents( $file['tmp_name'] );
	if ( 0 !== strpos( $data, '%PDF' ) ) {
		return hansea_error( 'hansea_crm_upload', 'Bitte eine PDF-Datei hochladen.', 415 );
	}
	$key = hansea_crm_key();
	$dir = hansea_crm_files_dir();
	if ( ! $key || ! $dir ) {
		return hansea_error( 'hansea_crm_upload', 'Der Speicherort für Dokumente ist nicht verfügbar.', 500 );
	}
	$id    = bin2hex( random_bytes( 16 ) );
	$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
	if ( false === file_put_contents( $dir . '/' . $id . '.bin', $nonce . sodium_crypto_secretbox( $data, $nonce, $key ) ) ) {
		return hansea_error( 'hansea_crm_upload', 'Das Dokument konnte nicht gespeichert werden.', 500 );
	}
	$name = sanitize_file_name( (string) $file['name'] ) ?: 'Dokument.pdf';
	$user = wp_get_current_user();
	add_post_meta( $post->ID, 'hansea_crm_doc', array(
		'id'   => $id,
		'name' => $name,
		'size' => (int) $file['size'],
		'time' => gmdate( 'c' ),
		'user' => $user->display_name ?: $user->user_login,
	) );
	hansea_crm_log( $post->ID, 'Dokument hochgeladen', $name );
	return rest_ensure_response( hansea_crm_detail( $post->ID ) );
}

/** Streams a decrypted document to the browser (logged). */
function hansea_crm_rest_document_get( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$doc = null;
	foreach ( hansea_crm_documents( $post->ID ) as $d ) {
		if ( $d['id'] === $request['doc'] ) {
			$doc = $d;
		}
	}
	$raw = $doc ? @file_get_contents( hansea_crm_files_dir() . '/' . $doc['id'] . '.bin' ) : false;
	$key = hansea_crm_key();
	$pdf = $raw && $key ? sodium_crypto_secretbox_open( substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), $key ) : false;
	if ( false === $pdf ) {
		return hansea_error( 'hansea_crm_missing', 'Dokument nicht gefunden.', 404 );
	}
	hansea_crm_log( $post->ID, 'Dokument geöffnet', $doc['name'] );
	nocache_headers();
	header( 'Content-Type: application/pdf' );
	header( 'Content-Disposition: inline; filename="' . str_replace( '"', '', $doc['name'] ) . '"' );
	header( 'Content-Length: ' . strlen( $pdf ) );
	header( 'X-Content-Type-Options: nosniff' );
	echo $pdf; // phpcs:ignore WordPress.Security.EscapeOutput -- binary PDF
	exit;
}


/* ---------------------------------------------------------------------------
 * Beschlüsse of the Aufsichtsrat: every member must agree (three votes).
 *
 * Staff put a decision to the Aufsichtsrat ("vorlegen"): admitting an Antrag,
 * further shares (a row of Anteile und Zahlungen), a Kündigung (a row) or
 * Ausscheiden. Each Aufsichtsrat member votes in their own name. All agree:
 * the decision takes effect (Zulassung: number, status, portal invite if
 * asked). One rejection: rejected. Stored in the meta hansea_crm_beschluesse.
 * ------------------------------------------------------------------------ */

const HANSEA_BESCHLUSS_TYPES = array(
	'zulassung'   => 'Aufnahme als Mitglied',
	'zeichnung'   => 'Weitere Geschäftsanteile',
	'kuendigung'  => 'Kündigung von Geschäftsanteilen',
	'ausscheiden' => 'Ausscheiden',
);

/** Users of the Aufsichtsrat (role Aufsichtsrat), sorted by name. */
function hansea_crm_ar_members() {
	return get_users( array( 'role' => 'aufsichtsrat', 'orderby' => 'display_name' ) );
}

function hansea_crm_ar_name( WP_User $user ) {
	return $user->last_name ?: $user->display_name;
}

function hansea_crm_beschluesse( $post_id ) {
	$list = get_post_meta( $post_id, 'hansea_crm_beschluesse', true );
	return is_array( $list ) ? $list : array();
}

/** A Beschluss as the app sees it, with who may still vote. */
function hansea_crm_beschluss_public( array $b ) {
	$me    = get_current_user_id();
	$votes = array();
	foreach ( $b['voters'] as $uid => $name ) {
		$v       = $b['votes'][ $uid ] ?? null;
		$votes[] = array( 'name' => $name, 'vote' => $v['vote'] ?? '', 'time' => $v['time'] ?? '', 'note' => $v['note'] ?? '' );
	}
	return array(
		'id'      => $b['id'],
		'type'    => $b['type'],
		'title'   => $b['title'],
		'ref'     => $b['ref'],
		'status'  => $b['status'],
		'created' => $b['created'],
		'by'      => $b['by'],
		'portal'  => ! empty( $b['portal'] ),
		'closed'  => $b['closed'] ?? '',
		'votes'   => $votes,
		'canVote' => 'offen' === $b['status'] && isset( $b['voters'][ $me ] ) && ! isset( $b['votes'][ $me ] ) && current_user_can( HANSEA_AR_CAP ),
	);
}

function hansea_crm_beschluss_save( $post_id, array $list ) {
	update_post_meta( $post_id, 'hansea_crm_beschluesse', $list );
}

/** "Dem Aufsichtsrat vorlegen". */
function hansea_crm_rest_beschluss_create( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$type = (string) $request->get_param( 'type' );
	$ref  = (int) $request->get_param( 'ref' );
	if ( ! isset( HANSEA_BESCHLUSS_TYPES[ $type ] ) ) {
		return hansea_error( 'hansea_crm_type', 'Unbekannte Art des Beschlusses.', 422 );
	}
	$ar = hansea_crm_ar_members();
	if ( count( $ar ) < HANSEA_AR_SIZE ) {
		return hansea_error( 'hansea_crm_ar', sprintf( 'Es sind erst %d von %d Aufsichtsratsmitgliedern mit eigenem Zugang angelegt (Rolle „Aufsichtsrat“).', count( $ar ), HANSEA_AR_SIZE ), 409 );
	}
	$r    = hansea_crm_record( $post->ID );
	$list = hansea_crm_beschluesse( $post->ID );
	foreach ( $list as $b ) {
		if ( 'offen' === $b['status'] && $b['type'] === $type && $b['ref'] === $ref ) {
			return hansea_error( 'hansea_crm_open', 'Dazu liegt dem Aufsichtsrat schon ein offener Beschluss vor.', 409 );
		}
	}

	$name  = hansea_crm_name( $r );
	$title = HANSEA_BESCHLUSS_TYPES[ $type ] . ': ' . $name;
	if ( 'zulassung' === $type ) {
		if ( 'antrag' !== $r['status'] ) {
			return hansea_error( 'hansea_crm_status', 'Nur offene Anträge können zur Aufnahme vorgelegt werden.', 409 );
		}
		$units = array_sum( array_map( function ( $z ) { return (float) $z['anteile']; }, $r['zeichnungen'] ) );
		$title .= $units ? sprintf( ' (%s %s)', hansea_crm_units( $units ), 1.0 === (float) $units ? 'Anteil' : 'Anteile' ) : '';
		$r['zulassung_status'] = 'offen';
	} elseif ( 'zeichnung' === $type || 'kuendigung' === $type ) {
		$rows = 'zeichnung' === $type ? 'zeichnungen' : 'kuendigungen';
		if ( ! isset( $r[ $rows ][ $ref ] ) ) {
			return hansea_error( 'hansea_crm_ref', 'Diese Zeile gibt es nicht (mehr). Bitte neu laden.', 404 );
		}
		$row    = $r[ $rows ][ $ref ];
		$title .= sprintf( ' (%s %s', hansea_crm_units( (float) $row['anteile'] ), 1.0 === (float) $row['anteile'] ? 'Anteil' : 'Anteile' ) . ( 'kuendigung' === $type && $row['zum'] ? ' zum ' . mysql2date( 'd.m.Y', $row['zum'] ) : '' ) . ')';
		$r[ $rows ][ $ref ]['ar_status'] = 'offen';
	} else {
		if ( 'zugelassen' !== $r['status'] ) {
			return hansea_error( 'hansea_crm_status', 'Nur zugelassene Mitglieder können ausscheiden.', 409 );
		}
		$r['aus_ar_status'] = 'offen';
	}

	$voters = array();
	foreach ( $ar as $u ) {
		$voters[ $u->ID ] = hansea_crm_ar_name( $u );
	}
	$user   = wp_get_current_user();
	$list[] = array(
		'id'      => bin2hex( random_bytes( 8 ) ),
		'type'    => $type,
		'ref'     => $ref,
		'title'   => $title,
		'status'  => 'offen',
		'created' => gmdate( 'c' ),
		'by'      => $user->display_name ?: $user->user_login,
		'portal'  => 'zulassung' === $type && false !== $request->get_param( 'portal' ),
		'voters'  => $voters,
		'votes'   => array(),
	);
	hansea_crm_save( $r, $post->ID );
	hansea_crm_beschluss_save( $post->ID, $list );
	hansea_crm_log( $post->ID, 'Dem Aufsichtsrat vorgelegt', $title );
	hansea_crm_notify_ar( $ar, $title, $post->ID );
	return rest_ensure_response( array( 'member' => hansea_crm_detail( $post->ID ), 'message' => 'Dem Aufsichtsrat vorgelegt. ' . implode( ', ', $voters ) . ' wurden per E-Mail benachrichtigt.' ) );
}

function hansea_crm_units( $n ) {
	return rtrim( rtrim( number_format( (float) $n, 2, ',', '.' ), '0' ), ',' );
}

/** Short email to the Aufsichtsrat with a link to the decision. */
function hansea_crm_notify_ar( array $users, $title, $post_id ) {
	$link = home_url( '/mitgliederliste/#/mitglied/' . $post_id );
	foreach ( $users as $u ) {
		wp_mail( $u->user_email, 'Zur Zustimmung: ' . $title, hansea_email_html( array(
			'eyebrow' => 'Aufsichtsrat',
			'title'   => 'Ein Beschluss wartet auf Ihre Zustimmung',
			'html'    => array( esc_html( $title ), 'Alle Mitglieder des Aufsichtsrats müssen zustimmen. Bitte melden Sie sich an und stimmen Sie in der Mitgliederliste ab.' ),
			'button'  => array( 'label' => 'Zum Beschluss', 'url' => $link ),
		) ), array( 'Content-Type: text/html; charset=UTF-8' ) );
	}
}

/** One Aufsichtsrat member votes. The last agreeing vote applies the decision. */
function hansea_crm_rest_beschluss_vote( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	if ( ! current_user_can( HANSEA_AR_CAP ) ) {
		return hansea_error( 'hansea_crm_ar', 'Nur Mitglieder des Aufsichtsrats können abstimmen.', 403 );
	}
	$vote = (string) $request->get_param( 'vote' );
	if ( ! in_array( $vote, array( 'zugestimmt', 'abgelehnt' ), true ) ) {
		return hansea_error( 'hansea_crm_vote', 'Bitte zustimmen oder ablehnen.', 422 );
	}
	$me   = get_current_user_id();
	$list = hansea_crm_beschluesse( $post->ID );
	$i    = array_search( (string) $request['bid'], array_column( $list, 'id' ), true );
	if ( false === $i ) {
		return hansea_error( 'hansea_crm_missing', 'Beschluss nicht gefunden.', 404 );
	}
	$b = $list[ $i ];
	if ( 'offen' !== $b['status'] ) {
		return hansea_error( 'hansea_crm_closed', 'Über diesen Beschluss ist schon entschieden.', 409 );
	}
	if ( ! isset( $b['voters'][ $me ] ) || isset( $b['votes'][ $me ] ) ) {
		return hansea_error( 'hansea_crm_vote', isset( $b['votes'][ $me ] ) ? 'Sie haben schon abgestimmt.' : 'Sie gehören nicht zu den Abstimmenden dieses Beschlusses.', 409 );
	}
	$note              = sanitize_textarea_field( (string) $request->get_param( 'note' ) );
	$b['votes'][ $me ] = array( 'vote' => $vote, 'time' => gmdate( 'c' ), 'note' => $note );
	hansea_crm_log( $post->ID, 'Aufsichtsrat: ' . ( 'zugestimmt' === $vote ? 'Zustimmung' : 'Ablehnung' ), $b['title'] . ( $note ? ' – ' . $note : '' ) );

	$message = 'zugestimmt' === $vote ? 'Ihre Zustimmung ist gespeichert.' : 'Ihre Ablehnung ist gespeichert.';
	$agreed  = count( array_filter( $b['votes'], function ( $v ) { return 'zugestimmt' === $v['vote']; } ) );
	if ( 'abgelehnt' === $vote ) {
		$b['status'] = 'abgelehnt';
	} elseif ( $agreed === count( $b['voters'] ) ) {
		$b['status'] = 'zugestimmt';
	}
	if ( 'offen' !== $b['status'] ) {
		$b['closed'] = gmdate( 'c' );
	}
	$list[ $i ] = $b;
	hansea_crm_beschluss_save( $post->ID, $list );
	if ( 'offen' !== $b['status'] ) {
		$message .= ' ' . hansea_crm_beschluss_apply( $post->ID, $b );
	} else {
		$message .= sprintf( ' %d von %d Stimmen liegen vor.', count( $b['votes'] ), count( $b['voters'] ) );
	}
	return rest_ensure_response( array( 'member' => hansea_crm_detail( $post->ID ), 'message' => $message ) );
}

/** Applies a decided Beschluss to the record. Returns a message for the team. */
function hansea_crm_beschluss_apply( $post_id, array $b ) {
	$r      = hansea_crm_record( $post_id );
	$ok     = 'zugestimmt' === $b['status'];
	$names  = implode( ', ', $b['voters'] );
	$date   = current_time( 'Y-m-d' );
	$portal = '';
	switch ( $b['type'] ) {
		case 'zulassung':
			$r['zulassung_status'] = $b['status'];
			$r['zulassung_ar']     = $names;
			$r['zulassung_datum']  = $date;
			if ( $ok ) {
				$r['status'] = 'zugelassen';
				$r['nr']     = $r['nr'] ?: hansea_crm_next_nr();
				foreach ( $r['zeichnungen'] as $i => $z ) {
					if ( '' === $z['zugelassen'] ) {
						$r['zeichnungen'][ $i ] = array_merge( $z, array( 'zugelassen' => $date, 'ar' => $names, 'ar_status' => 'zugestimmt' ) );
					}
				}
			} else {
				$r['status'] = 'abgelehnt';
			}
			break;
		case 'zeichnung':
		case 'kuendigung':
			$rows = 'zeichnung' === $b['type'] ? 'zeichnungen' : 'kuendigungen';
			if ( isset( $r[ $rows ][ $b['ref'] ] ) ) {
				$r[ $rows ][ $b['ref'] ]['ar_status'] = $b['status'];
				$r[ $rows ][ $b['ref'] ]['ar']        = $names;
				if ( $ok && 'zeichnung' === $b['type'] && '' === $r[ $rows ][ $b['ref'] ]['zugelassen'] ) {
					$r[ $rows ][ $b['ref'] ]['zugelassen'] = $date;
				}
			}
			break;
		case 'ausscheiden':
			$r['aus_ar_status'] = $b['status'];
			$r['aus_ar']        = $names;
			if ( $ok ) {
				$r['status']         = 'ausgeschieden';
				$r['aus_eintragung'] = $r['aus_eintragung'] ?: $date;
			}
			break;
	}
	hansea_crm_save( $r, $post_id );
	hansea_crm_log( $post_id, $ok ? 'Beschluss gefasst' : 'Beschluss abgelehnt', $b['title'] . ' – Aufsichtsrat: ' . $names );

	if ( $ok && 'zulassung' === $b['type'] ) {
		$portal = ! empty( $b['portal'] ) ? hansea_crm_open_portal( $post_id ) : 'Kein Portal-Zugang angelegt.';
		return 'Alle haben zugestimmt: Mitglied Nr. ' . $r['nr'] . ' ist zugelassen. ' . ( is_wp_error( $portal ) ? $portal->get_error_message() : $portal );
	}
	return $ok ? 'Alle haben zugestimmt, der Beschluss ist gefasst.' : 'Der Beschluss ist abgelehnt.';
}

/** Staff withdraw an open Beschluss (e.g. put to the Aufsichtsrat by mistake). */
function hansea_crm_rest_beschluss_cancel( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$list = hansea_crm_beschluesse( $post->ID );
	$i    = array_search( (string) $request['bid'], array_column( $list, 'id' ), true );
	if ( false === $i || 'offen' !== $list[ $i ]['status'] ) {
		return hansea_error( 'hansea_crm_closed', 'Nur offene Beschlüsse können zurückgezogen werden.', 409 );
	}
	$list[ $i ]['status'] = 'zurückgezogen';
	$list[ $i ]['closed'] = gmdate( 'c' );
	hansea_crm_beschluss_save( $post->ID, $list );

	$b = $list[ $i ];
	$r = hansea_crm_record( $post->ID );
	if ( 'zeichnung' === $b['type'] && isset( $r['zeichnungen'][ $b['ref'] ] ) ) {
		$r['zeichnungen'][ $b['ref'] ]['ar_status'] = '';
	} elseif ( 'kuendigung' === $b['type'] && isset( $r['kuendigungen'][ $b['ref'] ] ) ) {
		$r['kuendigungen'][ $b['ref'] ]['ar_status'] = '';
	} elseif ( 'ausscheiden' === $b['type'] ) {
		$r['aus_ar_status'] = '';
	}
	hansea_crm_save( $r, $post->ID );
	hansea_crm_log( $post->ID, 'Vorlage zurückgezogen', $b['title'] );
	return rest_ensure_response( array( 'member' => hansea_crm_detail( $post->ID ), 'message' => 'Vorlage zurückgezogen.' ) );
}

/** Open Beschlüsse of all members (inbox of the Aufsichtsrat). */
function hansea_crm_rest_beschluesse() {
	$out = array();
	foreach ( get_posts( array( 'post_type' => HANSEA_CRM_TYPE, 'post_status' => 'private', 'numberposts' => -1, 'fields' => 'ids', 'meta_key' => 'hansea_crm_beschluesse' ) ) as $id ) {
		foreach ( hansea_crm_beschluesse( $id ) as $b ) {
			if ( 'offen' === $b['status'] ) {
				$out[] = array_merge( hansea_crm_beschluss_public( $b ), array( 'member' => $id, 'name' => get_the_title( $id ), 'documents' => hansea_crm_documents( $id ) ) );
			}
		}
	}
	usort( $out, function ( $a, $b ) { return strcmp( $a['created'], $b['created'] ); } );
	return rest_ensure_response( array(
		'items' => $out,
		'ar'    => array_map( 'hansea_crm_ar_name', hansea_crm_ar_members() ),
		'size'  => HANSEA_AR_SIZE,
	) );
}
