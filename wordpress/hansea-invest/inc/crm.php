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

	// Role and capability, once per version.
	if ( get_option( 'hansea_crm_roles' ) !== '1' ) {
		add_role( 'mitgliederverwaltung', 'Mitgliederverwaltung', array( 'read' => true, HANSEA_CRM_CAP => true ) );
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			$admin->add_cap( HANSEA_CRM_CAP );
		}
		update_option( 'hansea_crm_roles', '1' );
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
		array( $id . '/approve', 'POST', 'hansea_crm_rest_approve' ),
		array( $id . '/reject', 'POST', 'hansea_crm_rest_reject' ),
		array( $id . '/portal', 'POST', 'hansea_crm_rest_portal' ),
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

/**
 * Zulassung: Aufsichtsrat approved. Assigns the next Mitgliedsnummer (if the
 * Antrag has none), opens the portal and sends the welcome email.
 */
function hansea_crm_rest_approve( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$r  = hansea_crm_record( $post->ID );
	$ar = sanitize_text_field( (string) $request->get_param( 'ar' ) );
	if ( 'antrag' !== $r['status'] ) {
		return hansea_error( 'hansea_crm_status', 'Dieser Antrag ist schon entschieden.', 409 );
	}
	if ( '' === $ar ) {
		return hansea_error( 'hansea_crm_ar', 'Bitte das zustimmende Aufsichtsratsmitglied angeben.', 422 );
	}
	$date = hansea_crm_date( (string) $request->get_param( 'datum' ) ) ?: current_time( 'Y-m-d' );

	$r['status']           = 'zugelassen';
	$r['zulassung_status'] = 'zugestimmt';
	$r['zulassung_ar']     = $ar;
	$r['zulassung_datum']  = $date;
	$r['nr']               = $r['nr'] ?: hansea_crm_next_nr();
	foreach ( $r['zeichnungen'] as $i => $z ) {
		if ( '' === $z['zugelassen'] ) {
			$r['zeichnungen'][ $i ] = array_merge( $z, array( 'zugelassen' => $date, 'ar' => $ar, 'ar_status' => 'zugestimmt' ) );
		}
	}
	$saved = hansea_crm_save( $r, $post->ID );
	if ( is_wp_error( $saved ) ) {
		return $saved;
	}
	hansea_crm_log( $post->ID, 'Zugelassen', sprintf( 'Mitgliedsnummer %d, Zustimmung Aufsichtsrat: %s', $r['nr'], $ar ) );

	$portal = $request->get_param( 'portal' ) === false ? 'Kein Portal-Zugang angelegt.' : hansea_crm_open_portal( $post->ID );
	return rest_ensure_response( array(
		'member'  => hansea_crm_detail( $post->ID ),
		'message' => 'Zugelassen als Mitglied Nr. ' . $r['nr'] . '. ' . ( is_wp_error( $portal ) ? $portal->get_error_message() : $portal ),
	) );
}

function hansea_crm_rest_reject( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$r = hansea_crm_record( $post->ID );
	if ( 'antrag' !== $r['status'] ) {
		return hansea_error( 'hansea_crm_status', 'Dieser Antrag ist schon entschieden.', 409 );
	}
	$grund                 = sanitize_textarea_field( (string) $request->get_param( 'grund' ) );
	$r['status']           = 'abgelehnt';
	$r['zulassung_status'] = 'abgelehnt';
	$r['zulassung_ar']     = sanitize_text_field( (string) $request->get_param( 'ar' ) );
	$r['zulassung_datum']  = hansea_crm_date( (string) $request->get_param( 'datum' ) ) ?: current_time( 'Y-m-d' );
	if ( '' !== $grund ) {
		$r['bemerkungen'] = trim( $r['bemerkungen'] . "\n\nAblehnung: " . $grund );
	}
	$saved = hansea_crm_save( $r, $post->ID );
	if ( is_wp_error( $saved ) ) {
		return $saved;
	}
	hansea_crm_log( $post->ID, 'Abgelehnt', $grund );
	return rest_ensure_response( array( 'member' => hansea_crm_detail( $post->ID ), 'message' => 'Antrag abgelehnt.' ) );
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
