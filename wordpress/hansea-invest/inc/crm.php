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
 *
 * Two kinds of members (field art): investierend ('i', the default) and
 * ordentlich ('o'). Ordentliche Mitglieder earn no interest, and decisions
 * about them need the Vorstand (role "Vorstand") instead of the Aufsichtsrat.
 */

defined( 'ABSPATH' ) || exit;

const HANSEA_CRM_TYPE = 'hansea_mitglied';
const HANSEA_CRM_CAP  = 'hansea_crm';
/** Aufsichtsrat members: vote on Beschlüsse (role "Aufsichtsrat"). */
const HANSEA_AR_CAP = 'hansea_ar';
/** Votes a Beschluss needs: every member of the Aufsichtsrat, and at least this many. */
const HANSEA_AR_SIZE = 3;
/** Vorstand (role "Vorstand"): decides on ordentliche Mitglieder instead of the Aufsichtsrat. */
const HANSEA_VORSTAND_CAP = 'hansea_vorstand';
/** Target interest on paid-in capital, p.a. (not guaranteed). */
const HANSEA_CRM_ZINS = 0.07;
/** Account for the members' payments (sent in the confirmation email when a member is admitted). */
/** Approval documents and the Kündigung email start with this release (decisions before it get none); same date in src/crm/approvalPdf.ts. */
const HANSEA_APPROVAL_DOCS_SINCE = '2026-11-12T02:30:00Z';
const HANSEA_PAY_HOLDER = 'Hanseatische Invest eG';
const HANSEA_PAY_IBAN   = 'DE83241510051210544001';
const HANSEA_PAY_BIC    = 'NOLADE21STS';
const HANSEA_PAY_BANK   = 'Sparkasse Stade-Altes Land';

/** Text fields of a member record. */
const HANSEA_CRM_TEXT = array(
	'firma', 'anrede', 'vorname', 'nachname', 'strasse', 'plz', 'ort', 'land', 'telefon', 'email',
	'zulassung_ar', 'bundesland', 'kontoinhaber', 'empfehler', 'aus_grund', 'aus_ar',
);
/** Date fields (Y-m-d). */
const HANSEA_CRM_DATES = array( 'geburtstag', 'eintritt', 'zulassung_datum', 'kuendbar_zu', 'aus_eintragung', 'aus_datum' );
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
	// schreiben: ID of the uploaded Kündigungsschreiben (a document of the member), needed before it goes to the Aufsichtsrat.
	'kuendigungen' => array( 'datum' => 'date', 'anteile' => 'number', 'zum' => 'date', 'betrag' => 'number', 'ar' => 'text', 'ar_status' => 'ar', 'schreiben' => 'text' ),
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
	if ( get_option( 'hansea_crm_roles' ) !== '3' ) {
		add_role( 'mitgliederverwaltung', 'Mitgliederverwaltung', array( 'read' => true, HANSEA_CRM_CAP => true ) );
		add_role( 'aufsichtsrat', 'Aufsichtsrat', array( 'read' => true, HANSEA_CRM_CAP => true, HANSEA_AR_CAP => true ) );
		add_role( 'vorstand', 'Vorstand', array( 'read' => true, HANSEA_CRM_CAP => true, HANSEA_VORSTAND_CAP => true ) );
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			$admin->add_cap( HANSEA_CRM_CAP );
		}
		update_option( 'hansea_crm_roles', '3' );
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

/** Encrypts a string with the CRM key ("v1:" + base64(nonce + box)); '' without a key. */
function hansea_seal( $plain ) {
	$key = hansea_crm_key();
	if ( ! $key ) {
		return '';
	}
	$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
	return 'v1:' . base64_encode( $nonce . sodium_crypto_secretbox( (string) $plain, $nonce, $key ) );
}

/** Decrypts hansea_seal() output; '' when it can't. */
function hansea_unseal( $sealed ) {
	$key = hansea_crm_key();
	if ( ! $key || 0 !== strpos( (string) $sealed, 'v1:' ) ) {
		return '';
	}
	$raw = (string) base64_decode( substr( $sealed, 3 ) );
	if ( ! hansea_sealed_length_ok( $raw ) ) {
		return '';
	}
	$plain = sodium_crypto_secretbox_open( substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), $key );
	return false === $plain ? '' : $plain;
}

/** Long enough to hold nonce and authentication tag (shorter data is damaged; sodium would throw). */
function hansea_sealed_length_ok( $raw ) {
	return is_string( $raw ) && strlen( $raw ) >= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES + SODIUM_CRYPTO_SECRETBOX_MACBYTES;
}

/** Binary file content encrypted with the CRM key (nonce + box), and back. */
function hansea_seal_file( $data ) {
	$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
	return $nonce . sodium_crypto_secretbox( $data, $nonce, hansea_crm_key() );
}

function hansea_unseal_file( $raw ) {
	$key = hansea_crm_key();
	return hansea_sealed_length_ok( $raw ) && $key ? sodium_crypto_secretbox_open( substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), $key ) : false;
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
	$raw   = (string) base64_decode( substr( $stored, 3 ) );
	$plain = hansea_sealed_length_ok( $raw ) ? sodium_crypto_secretbox_open( substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), $key ) : false;
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
		$out[ $field ] = mb_substr( sanitize_text_field( (string) ( $in[ $field ] ?? '' ) ), 0, 200 );
	}
	$out['email'] = sanitize_email( $out['email'] );
	foreach ( HANSEA_CRM_DATES as $field ) {
		$out[ $field ] = hansea_crm_date( $in[ $field ] ?? '' );
	}
	foreach ( HANSEA_CRM_CHOICES as $field => $choices ) {
		$value         = (string) ( $in[ $field ] ?? '' );
		$out[ $field ] = in_array( $value, $choices, true ) ? $value : $choices[0];
	}
	$out['bemerkungen'] = mb_substr( sanitize_textarea_field( (string) ( $in['bemerkungen'] ?? '' ) ), 0, 5000 );
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
					$clean[ $column ] = mb_substr( sanitize_text_field( (string) $value ), 0, 200 );
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

/**
 * Adds an entry to the member's log. $sent: something went to the member
 * (an email, or a document put into their members' area); the member page
 * lists these under "An das Mitglied gesendet".
 */
function hansea_crm_log( $post_id, $action, $detail = '', $sent = false ) {
	$user  = wp_get_current_user();
	$entry = array(
		'time'   => gmdate( 'c' ),
		'user'   => $user->exists() ? ( $user->display_name ?: $user->user_login ) : 'System',
		'action' => $action,
		'detail' => $detail,
	);
	if ( $sent ) {
		$entry['sent'] = true;
	}
	add_post_meta( $post_id, 'hansea_crm_log', $entry );
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

/** Eintrittsdatum: the field, or the day of the Zulassung while it is empty. */
function hansea_crm_eintritt( array $r ) {
	return $r['eintritt'] ?: $r['zulassung_datum'];
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
		'eintritt'         => hansea_crm_eintritt( $r ),
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
 * First interest of a payment received on $zahlung (Y-m-d): interest runs from
 * the next day; the first period ends with the first full quarter after that
 * and is paid by the 14th after it (15 January for Q4), as in the Allgemeine
 * Geschäftsordnung. Returns start, end of the starting quarter (partial: false
 * when interest starts on a quarter's first day), end of the first period,
 * its quarter and the latest payment date.
 */
function hansea_crm_first_interest( $zahlung ) {
	$start   = ( new DateTime( $zahlung ) )->modify( '+1 day' );
	$q       = clone $start;
	$q->setDate( (int) $q->format( 'Y' ), (int) ceil( $q->format( 'n' ) / 3 ) * 3, 1 )->modify( 'last day of this month' );
	$partial = ! ( '01' === $start->format( 'd' ) && 1 === (int) $start->format( 'n' ) % 3 );
	$end     = $partial ? ( clone $q )->modify( 'first day of +3 months' )->modify( 'last day of this month' ) : clone $q;
	$pay   = ( clone $end )->modify( '12' === $end->format( 'm' ) ? '+15 days' : '+14 days' );
	return array(
		'start'        => $start->format( 'Y-m-d' ),
		'partial'      => $partial,
		'quartalsende' => $q->format( 'Y-m-d' ),
		'ende'         => $end->format( 'Y-m-d' ),
		'quartal'      => sprintf( 'Q%d %s', ceil( $end->format( 'n' ) / 3 ), $end->format( 'Y' ) ),
		'zahlung'      => $pay->format( 'Y-m-d' ),
	);
}

/**
 * "Bestätigung Zahlungseingang" to an admitted member after the team has
 * entered the Zahlungseingang of row $i of Anteile und Zahlungen. Wording as
 * given by the Genossenschaft; no interest paragraphs for ordentliche Mitglieder.
 */
function hansea_crm_send_payment_confirmation( $post_id, array $r, $i ) {
	$z = $r['zeichnungen'][ $i ];
	if ( 'zugelassen' !== $r['status'] || ! is_email( $r['email'] ) || ! $z['betrag'] ) {
		return;
	}
	$d     = function ( $ymd ) {
		return $ymd ? mysql2date( 'd.m.Y', $ymd ) : '';
	};
	$eur   = number_format( (float) $z['betrag'], (float) $z['betrag'] === round( (float) $z['betrag'] ) ? 0 : 2, ',', '.' ) . ' €';
	$units = (float) $z['anteile'];
	$name  = trim( $r['vorname'] . ' ' . $r['nachname'] ) ?: hansea_crm_name( $r );
	$html  = array(
		esc_html( 'Hallo ' . $name . ',' ),
		esc_html( $units > 1
			? sprintf( 'vielen Dank für Ihren Zahlungseingang der %s Geschäftsanteile von %s.', hansea_crm_units( $units ), $eur )
			: sprintf( 'vielen Dank für Ihren Zahlungseingang des Geschäftsanteils von %s.', $eur ) ),
		esc_html( sprintf( 'Der Betrag war am %s auf unserem Konto.', $d( $z['zahlung'] ) ) ),
	);
	if ( 'i' === $r['art'] ) {
		$first  = hansea_crm_first_interest( $z['zahlung'] );
		$ende   = $z['zins_ende'] ?: $first['ende'];
		$bis    = $z['zins_zahlung'] ?: $first['zahlung'];
		$quarter = sprintf( 'Q%d %s', ceil( substr( $ende, 5, 2 ) / 3 ), substr( $ende, 0, 4 ) );
		$html[] = esc_html( sprintf( 'Die Verzinsung dieses Betrages startet somit ab %s.', $d( $first['start'] ) )
			. ( $first['partial'] ? sprintf( ' Die ersten anteiligen Zinsen berechnen sich vom %s bis zum %s.', $d( $first['start'] ), $d( $first['quartalsende'] ) ) : '' ) );
		$html[] = esc_html( sprintf( 'Die erste Zinszahlung findet laut Allgemeiner Geschäftsordnung zum Ende des nächsten vollen Quartals (%s) bis spätestens zum %s statt. Sie erhalten dazu eine Auszahlungsbestätigung sowie gleichzeitig die Jahressteuerbescheinigung.', $quarter, $d( $bis ) ) );
	}
	$html[] = 'Für Fragen wenden Sie sich bitte gern an <a href="mailto:mitgliederservice@hanseainvest.de" style="color:#141A46;">mitgliederservice@hanseainvest.de</a>.';
	$html[] = 'Mit freundlichen Grüßen<br><br>Hanseatische Invest eG';
	$sent = wp_mail( $r['email'], 'Hanseatische Invest eG – Bestätigung Zahlungseingang', hansea_email_html( array(
		'eyebrow'   => 'Zahlungseingang',
		'title'     => 'Bestätigung Ihres Zahlungseingangs',
		'preheader' => sprintf( 'Ihr Zahlungseingang von %s am %s.', $eur, $d( $z['zahlung'] ) ),
		'html'      => $html,
		'button'    => array( 'label' => 'Zum Mitgliederbereich', 'url' => home_url( '/login/' ) ),
	) ), array( 'Content-Type: text/html; charset=UTF-8' ) );
	hansea_crm_log( $post_id, $sent ? 'E-Mail: Hanseatische Invest eG – Bestätigung Zahlungseingang' : 'Zahlungsbestätigung nicht gesendet', sprintf( '%s, Eingang am %s, an %s', $eur, $d( $z['zahlung'] ), $r['email'] ) . ( $sent ? '' : ' (E-Mail-Versand fehlgeschlagen)' ), $sent );
}

/**
 * "Bestätigung Ihrer Kündigung" to the member once the Aufsichtsrat (or the
 * Vorstand) has approved it, with the confirmation PDF attached (also in the
 * members' area).
 */
function hansea_crm_send_cancellation_confirmation( $post_id, array $r, array $b, $pdf, $filename ) {
	$k = $r['kuendigungen'][ $b['ref'] ] ?? null;
	if ( ! $k || ! is_email( $r['email'] ) ) {
		hansea_crm_log( $post_id, 'Kündigungsbestätigung nicht gesendet', 'Keine gültige E-Mail-Adresse hinterlegt' );
		return;
	}
	$d    = function ( $ymd ) {
		return $ymd ? mysql2date( 'd.m.Y', $ymd ) : '–';
	};
	$eur  = null === $k['betrag'] ? '–' : number_format( (float) $k['betrag'], (float) $k['betrag'] === round( (float) $k['betrag'] ) ? 0 : 2, ',', '.' ) . ' €';
	$name = trim( $r['vorname'] . ' ' . $r['nachname'] );
	if ( 'Herr' === $r['anrede'] && $r['nachname'] ) {
		$hello = 'Sehr geehrter Herr ' . $r['nachname'] . ',';
	} elseif ( 'Frau' === $r['anrede'] && $r['nachname'] ) {
		$hello = 'Sehr geehrte Frau ' . $r['nachname'] . ',';
	} else {
		$hello = $name ? 'Guten Tag ' . $name . ',' : 'Sehr geehrte Damen und Herren,';
	}
	$who  = 'vorstand' === hansea_crm_gremium( $b )
		? 'der Vorstand hat Ihrer Kündigung zugestimmt.'
		: sprintf( 'alle %s Mitglieder des Aufsichtsrats haben Ihrer Kündigung zugestimmt.', 3 === count( $b['voters'] ) ? 'drei' : count( $b['voters'] ) );
	$html = array(
		esc_html( $hello ),
		esc_html( $who . ' Hiermit bestätigen wir Ihre Kündigung mit folgenden Angaben:' ),
		esc_html( sprintf( 'Mitgliedsnummer: %s', $r['nr'] ) ) . '<br>'
		. esc_html( sprintf( 'Gekündigte Anteile: %s', hansea_crm_units( (float) $k['anteile'] ) ) ) . '<br>'
		. esc_html( 'Betrag: ' . $eur ) . '<br>'
		. esc_html( 'Kündigung eingegangen am: ' . $d( $k['datum'] ) ) . '<br>'
		. esc_html( 'Gekündigt zum: ' . $d( $k['zum'] ) ),
		'Die Bestätigung mit allen Zustimmungen finden Sie im Anhang und in Ihrem Mitgliederbereich unter „Dokumente“.',
		'Für Fragen wenden Sie sich bitte gern an <a href="mailto:mitgliederservice@hanseainvest.de" style="color:#141A46;">mitgliederservice@hanseainvest.de</a>.',
		'Mit freundlichen Grüßen<br><br>Hanseatische Invest eG',
	);
	// wp_mail attaches files from disk: a temporary copy, removed right after sending
	$dir  = trailingslashit( get_temp_dir() ) . 'hansea-' . bin2hex( random_bytes( 8 ) );
	$file = $dir . '/' . ( sanitize_file_name( $filename ) ?: 'Bestaetigung-Kuendigung.pdf' );
	$attachments = ( wp_mkdir_p( $dir ) && false !== file_put_contents( $file, $pdf ) ) ? array( $file ) : array();
	$sent = wp_mail( $r['email'], 'Hanseatische Invest eG – Bestätigung Ihrer Kündigung', hansea_email_html( array(
		'eyebrow'   => 'Kündigung',
		'title'     => 'Bestätigung Ihrer Kündigung',
		'preheader' => sprintf( 'Ihre Kündigung zum %s ist bestätigt.', $d( $k['zum'] ) ),
		'html'      => $html,
		'button'    => array( 'label' => 'Zum Mitgliederbereich', 'url' => home_url( '/login/' ) ),
	) ), array( 'Content-Type: text/html; charset=UTF-8' ), $attachments );
	if ( $attachments ) {
		@unlink( $file );
		@rmdir( $dir );
	}
	hansea_crm_log(
		$post_id,
		$sent ? 'E-Mail: Hanseatische Invest eG – Bestätigung Ihrer Kündigung' : 'Kündigungsbestätigung nicht gesendet',
		sprintf( '%s zum %s, an %s', hansea_crm_units( (float) $k['anteile'] ) . ( 1.0 === (float) $k['anteile'] ? ' Anteil' : ' Anteile' ), $d( $k['zum'] ), $r['email'] ) . ( $sent ? ( $attachments ? ', mit PDF im Anhang' : ', ohne Anhang' ) : ' (E-Mail-Versand fehlgeschlagen)' ),
		$sent
	);
}

/**
 * Email to a member admitted by the Aufsichtsrat (or Vorstand): confirmation
 * of the membership with the Mitgliedsnummer, the payment details for the
 * shares not paid in yet, and the access to the members' area (login and a
 * set-password link). Wording as given by the Genossenschaft.
 *
 * @return array{subject:string, message:string}|WP_Error
 */
function hansea_crm_admission_email( WP_User $user, array $r ) {
	$link = hansea_welcome_link( $user ); // inc/welcome.php
	if ( is_wp_error( $link ) ) {
		return $link;
	}
	$t     = hansea_crm_totals( $r );
	$units = hansea_crm_units( $t['anteile'] );
	$due   = 0;
	$open  = 0;
	foreach ( $r['zeichnungen'] as $z ) {
		if ( '' === $z['zahlung'] ) {
			$due  += (float) $z['betrag'];
			$open += (float) $z['anteile'];
		}
	}
	$eur  = function ( $n ) {
		return number_format( (float) $n, (float) $n === round( (float) $n ) ? 0 : 2, ',', '.' ) . ' €';
	};
	$name = trim( $r['vorname'] . ' ' . $r['nachname'] );
	if ( 'Herr' === $r['anrede'] && $r['nachname'] ) {
		$hello = 'Sehr geehrter Herr ' . $r['nachname'] . ',';
	} elseif ( 'Frau' === $r['anrede'] && $r['nachname'] ) {
		$hello = 'Sehr geehrte Frau ' . $r['nachname'] . ',';
	} elseif ( $name ) {
		$hello = 'Guten Tag ' . $name . ',';
	} else {
		$hello = 'Sehr geehrte Damen und Herren,';
	}
	$html = array(
		esc_html( $hello ),
		esc_html( sprintf( 'vielen Dank für die Beitrittserklärung. Wir bestätigen Ihre Aufnahme mit der Mitgliedsnummer %s.', $r['nr'] ) ),
	);
	if ( $due > 0 ) {
		$html[] = esc_html( sprintf( 'Der Betrag über %s %s in Höhe von %s kann nun überwiesen werden auf das Konto der', $units === hansea_crm_units( $open ) ? 'die' : 'die noch offenen', hansea_crm_units( $open ) . ( 1.0 === (float) $open ? ' Geschäftsanteil' : ' Geschäftsanteile' ), $eur( $due ) ) );
		$html[] = '<strong>' . esc_html( HANSEA_PAY_HOLDER ) . '</strong><br>'
			. 'IBAN: ' . esc_html( HANSEA_PAY_IBAN ) . '<br>'
			. 'BIC: ' . esc_html( HANSEA_PAY_BIC ) . '<br>'
			. 'Bankname: ' . esc_html( HANSEA_PAY_BANK ) . '<br>'
			. 'Betreff: ' . esc_html( sprintf( '%s, %s', $name ?: hansea_crm_name( $r ), $r['nr'] ) );
		$html[] = 'Die Überweisung muss aus rechtlichen Gründen von dem Konto des Mitglieds stammen.';
		$html[] = 'Sobald wir den Zahlungseingang verzeichnen, bestätigen wir wieder per E-Mail binnen 1–3 Werktagen.';
	} elseif ( $t['kapital'] > 0 ) {
		$html[] = esc_html( sprintf( 'Ihre Einzahlung für %s %s ist bereits bei uns eingegangen. Vielen Dank.', $units, 1.0 === (float) $t['anteile'] ? 'Geschäftsanteil' : 'Geschäftsanteile' ) );
	}
	$html[] = 'Ihre Anteile, Zahlungen und Dokumente sehen Sie jederzeit in Ihrem persönlichen Mitgliederbereich.';
	$html[] = hansea_welcome_login_html( $user ); // inc/welcome.php
	$html[] = 'Für Fragen stehen wir Ihnen gerne zur Verfügung.<br><br>Genossenschaftliche Grüße<br>Ihre Hanseatische Invest eG';

	return array(
		'subject' => 'Hanseatische Invest eG – Bestätigung Mitgliedschaft Nr. ' . $r['nr'],
		'message' => hansea_email_html( array(
			'eyebrow'   => 'Mitgliedschaft',
			'title'     => 'Bestätigung Ihrer Mitgliedschaft',
			'preheader' => sprintf( 'Ihre Mitgliedsnummer %s, die Zahlungsdaten und Ihr Zugang zum Mitgliederbereich.', $r['nr'] ),
			'html'      => $html,
			'button'    => array( 'label' => 'Passwort festlegen und anmelden', 'url' => $link ),
			'note'      => hansea_welcome_note(),
		) ),
	);
}

/**
 * Creates the member's portal account (or links an existing member account
 * with the same email) and sends the confirmation email: Mitgliedsnummer,
 * payment details and the access to the members' area.
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
	$email = hansea_crm_admission_email( $user, $r );
	$sent  = ! is_wp_error( $email ) && wp_mail( $user->user_email, $email['subject'], $email['message'], array( 'Content-Type: text/html; charset=UTF-8' ) );
	if ( ! $sent ) {
		hansea_crm_log( $post_id, 'Portal-Zugang angelegt', 'Bestätigungsmail konnte nicht gesendet werden' );
		return 'Portal-Konto angelegt, aber die Bestätigungsmail konnte nicht gesendet werden. Bitte erneut versuchen.';
	}
	update_user_meta( $user->ID, 'hansea_welcome_sent', current_time( 'mysql', true ) );
	hansea_crm_log( $post_id, 'E-Mail: ' . $email['subject'], sprintf( 'An %s: Mitgliedsnummer %s, Zahlungsdaten und Zugang zum Mitgliederbereich', $user->user_email, $r['nr'] ), true );
	return 'Portal-Zugang eingerichtet. Die Bestätigungsmail mit Mitgliedsnummer, Zahlungsdaten und Zugangsdaten ist an ' . $user->user_email . ' unterwegs.';
}

/* ---------------------------------------------------------------------------
 * REST API: /wp-json/hansea/v1/crm/…
 * ------------------------------------------------------------------------ */

/** CRM API access: the capability, and two-factor login set up (inc/twofactor.php). */
function hansea_crm_can() {
	if ( ! current_user_can( HANSEA_CRM_CAP ) ) {
		return false;
	}
	if ( hansea_2fa_missing() ) {
		return new WP_Error( 'hansea_2fa_setup', 'Bitte richten Sie zuerst die Zwei-Faktor-Anmeldung ein (Reiter „Sicherheit“).', array( 'status' => 403 ) );
	}
	return true;
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
		array( '/crm/log', 'GET', 'hansea_crm_rest_log' ),
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

/** Everything that happened, across all members, newest first (tab "Verlauf"). */
function hansea_crm_rest_log() {
	$out = array();
	foreach ( get_posts( array( 'post_type' => HANSEA_CRM_TYPE, 'post_status' => 'private', 'numberposts' => -1 ) ) as $post ) {
		foreach ( (array) get_post_meta( $post->ID, 'hansea_crm_log' ) as $entry ) {
			if ( is_array( $entry ) && isset( $entry['time'] ) ) {
				$out[] = array_merge( array( 'user' => '', 'action' => '', 'detail' => '' ), $entry, array( 'member' => $post->ID, 'name' => $post->post_title ) );
			}
		}
	}
	usort( $out, function ( $a, $b ) { return strcmp( $b['time'], $a['time'] ); } );
	return rest_ensure_response( array_slice( $out, 0, 2000 ) );
}

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
	$record = array_merge( $record, array( 'status' => 'antrag', 'zulassung_status' => 'offen', 'zulassung_ar' => '', 'zulassung_datum' => '', 'nr' => null, 'aus_ar_status' => '', 'aus_ar' => '' ) );
	foreach ( array( 'zeichnungen', 'kuendigungen' ) as $list ) {
		foreach ( (array) ( $record[ $list ] ?? array() ) as $i => $row ) {
			$record[ $list ][ $i ] = array_merge( (array) $row, array( 'ar' => '', 'ar_status' => '' ) ); // decided by the Aufsichtsrat only
		}
	}
	if ( '' !== trim( (string) ( $record['email'] ?? '' ) ) && ! is_email( trim( (string) $record['email'] ) ) ) {
		return hansea_error( 'hansea_crm_email', 'Bitte eine gültige E-Mail-Adresse eingeben.', 422 );
	}
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
	if ( ! current_user_can( 'manage_options' ) ) {
		$after = hansea_crm_protect( $before, $after );
		if ( is_wp_error( $after ) ) {
			return $after;
		}
	}
	if ( '' !== $after['email'] && ! is_email( $after['email'] ) ) {
		return hansea_error( 'hansea_crm_email', 'Bitte eine gültige E-Mail-Adresse eingeben.', 422 );
	}
	// The Art decides who votes; an open Beschluss keeps the voters it was put to
	if ( $after['art'] !== $before['art'] && in_array( 'offen', array_column( hansea_crm_beschluesse( $post->ID ), 'status' ), true ) ) {
		return hansea_error( 'hansea_crm_open', 'Die Art der Mitgliedschaft lässt sich erst ändern, wenn keine Vorlage mehr offen ist. Bitte die Vorlage zurückziehen oder die Entscheidung abwarten.', 409 );
	}
	if ( null !== $after['nr'] && $after['nr'] !== $before['nr'] ) {
		foreach ( get_posts( array( 'post_type' => HANSEA_CRM_TYPE, 'post_status' => 'private', 'numberposts' => -1, 'fields' => 'ids', 'exclude' => array( $post->ID ) ) ) as $other ) {
			if ( hansea_crm_record( $other )['nr'] === $after['nr'] ) {
				return hansea_error( 'hansea_crm_nr', 'Die Mitgliedsnummer ' . $after['nr'] . ' ist schon vergeben.', 409 );
			}
		}
	}

	// Kündigungsschreiben: only documents of this member
	$doc_ids = array_column( hansea_crm_documents( $post->ID ), 'id' );
	foreach ( $after['kuendigungen'] as $i => $row ) {
		if ( '' !== $row['schreiben'] && ! in_array( $row['schreiben'], $doc_ids, true ) ) {
			$after['kuendigungen'][ $i ]['schreiben'] = '';
		}
	}
	// Zahlungseingang newly entered: first interest dates (if empty) and, after saving, the confirmation email
	$paid = array();
	foreach ( $after['zeichnungen'] as $i => $z ) {
		$was = $before['zeichnungen'][ $i ] ?? null;
		if ( '' !== $z['zahlung'] && ( ! $was || '' === $was['zahlung'] ) ) {
			$paid[] = $i;
			if ( 'i' === $after['art'] && '' === $z['zins_ende'] && '' === $z['zins_zahlung'] ) {
				$first = hansea_crm_first_interest( $z['zahlung'] );
				$after['zeichnungen'][ $i ]['zins_ende']    = $first['ende'];
				$after['zeichnungen'][ $i ]['zins_zahlung'] = $first['zahlung'];
			}
		}
	}
	// Any change to an approved Kündigung needs the approval again
	$reapprove = array();
	foreach ( $before['kuendigungen'] as $i => $was ) {
		$now = $after['kuendigungen'][ $i ] ?? null;
		if ( ! $now || 'zugestimmt' !== $was['ar_status'] ) {
			continue;
		}
		foreach ( array( 'datum', 'anteile', 'zum', 'betrag' ) as $key ) {
			if ( $now[ $key ] !== $was[ $key ] ) {
				$after['kuendigungen'][ $i ]['ar_status'] = '';
				$after['kuendigungen'][ $i ]['ar']        = '';
				$reapprove[]                              = $i + 1;
				break;
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
	hansea_crm_log( $post->ID, 'Geändert', implode( ', ', array_unique( $changed ) ) );
	foreach ( $paid as $i ) {
		hansea_crm_send_payment_confirmation( $post->ID, $after, $i );
	}
	if ( $reapprove ) {
		$who = 'vorstand' === hansea_crm_gremium_for( $after ) ? 'des Vorstands' : 'des Aufsichtsrats';
		hansea_crm_log( $post->ID, 'Kündigung geändert', sprintf( 'Zeile %s: die Zustimmung %s muss neu eingeholt werden', implode( ', ', $reapprove ), $who ) );
	}
	return rest_ensure_response( hansea_crm_detail( $post->ID ) );
}

/**
 * Fields only a Beschluss of the Aufsichtsrat (or an administrator) changes:
 * admission, number, Ausscheiden and the approval of each row. Other staff
 * keep the stored values; a row the Aufsichtsrat has decided on can't be
 * removed or swapped (rows are matched by position).
 *
 * @return array|WP_Error
 */
function hansea_crm_protect( array $before, array $after ) {
	foreach ( array( 'status', 'nr', 'zulassung_status', 'zulassung_ar', 'zulassung_datum', 'aus_ar_status', 'aus_ar' ) as $field ) {
		$after[ $field ] = $before[ $field ];
	}
	$identity = array( 'zeichnungen' => array( 'anteile', 'zugelassen' ), 'kuendigungen' => array( 'anteile', 'zum' ) );
	foreach ( $identity as $list => $keys ) {
		foreach ( $after[ $list ] as $i => $row ) {
			$was                        = $before[ $list ][ $i ] ?? null;
			$after[ $list ][ $i ]['ar']        = $was ? $was['ar'] : '';
			$after[ $list ][ $i ]['ar_status'] = $was ? $was['ar_status'] : '';
		}
		foreach ( $before[ $list ] as $i => $was ) {
			if ( '' === $was['ar_status'] ) {
				continue;
			}
			$now = $after[ $list ][ $i ] ?? null;
			if ( $now && 'kuendigungen' === $list && 'zugestimmt' === $was['ar_status'] ) {
				continue; // an approved Kündigung may be changed; it then needs a new approval (hansea_crm_rest_update)
			}
			foreach ( $keys as $key ) {
				if ( ! $now || $now[ $key ] !== $was[ $key ] ) {
					return hansea_error( 'hansea_crm_protected', 'Zeilen, über die Aufsichtsrat oder Vorstand entschieden haben oder die ihnen vorliegen, können nur Administratoren löschen oder bei Anteilen und Datum ändern.', 403 );
				}
			}
		}
	}
	return $after;
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
		'nr' => 'Mitgliedsnummer', 'art' => 'Art', 'eintritt' => 'Eintrittsdatum', 'status' => 'Status', 'firma' => 'Firma', 'anrede' => 'Anrede',
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
 * a subscription earns pro rata from the day after its payment until its first interest
 * end, then a quarter's interest each quarter. Cancelled shares earn until
 * their date. Paid by the 14th after the quarter (15 January for Q4).
 * Quarters that already have a recorded Zinszahlung are skipped. None for
 * ordentliche Mitglieder.
 *
 * @return array{date:string, amount:float, period:string}|null
 */
function hansea_crm_next_interest( array $r, $today ) {
	if ( 'o' === $r['art'] ) {
		return null; // ordentliche Mitglieder earn no interest
	}
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
			// Interest runs from the day after the payment (as in the Bestätigung Zahlungseingang)
			$amount += $first_end === $q
				? $z['betrag'] * HANSEA_CRM_ZINS * ( hansea_crm_days( $z['zahlung'], $q ) - 1 ) / 365
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
		'art'          => $r['art'],
		'since'        => hansea_crm_eintritt( $r ),
		'anteile'      => $t['aktiv'],
		'einlage'      => $einlage,
		'zinsenJahr'   => 'o' === $r['art'] ? 0 : round( $einlage * HANSEA_CRM_ZINS, 2 ),
		'ausgezahlt'   => round( array_sum( array_column( $r['zinszahlungen'], 'betrag' ) ), 2 ),
		'zinszahlungen' => $r['zinszahlungen'],
		'next'         => hansea_crm_next_interest( $r, $today ),
		'zeichnungen'  => array_map( function ( $z ) {
			return array( 'anteile' => $z['anteile'], 'betrag' => $z['betrag'], 'zahlung' => $z['zahlung'] );
		}, $r['zeichnungen'] ),
		'kuendigungen' => $open,
		'documents'    => array_map( function ( $d ) {
			return array( 'id' => $d['id'], 'name' => $d['name'], 'time' => $d['time'] );
		}, hansea_crm_documents( $post_id ) ),
	);
}

/* ---------------------------------------------------------------------------
 * Documents (signed Beitrittserklärung etc.): encrypted files outside the
 * web root where possible, listed in the meta hansea_crm_doc. Every document
 * of a member is also listed in their members' area.
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
			$docs[] = array_merge(
				array( 'kind' => '', 'beschluss' => '' ),
				array_intersect_key( $doc, array_flip( array( 'id', 'name', 'size', 'time', 'user', 'kind', 'beschluss' ) ) )
			);
		}
	}
	return $docs;
}

/**
 * Uploads a PDF to a member. Optional kind:
 * - beitritt: the signed Beitrittserklärung (attached when the Antrag is created)
 * - kuendigung (with ref = row): the filled-in Kündigungsschreiben of that Kündigung
 * - zustimmung (with beschluss = ID): the approval document of an approved Beschluss,
 *   made in the browser (src/crm/approvalPdf.ts); one per Beschluss
 */
function hansea_crm_rest_document_upload( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$kind = (string) $request->get_param( 'kind' );
	$kind = in_array( $kind, array( 'beitritt', 'kuendigung', 'zustimmung' ), true ) ? $kind : '';
	$r    = hansea_crm_record( $post->ID );
	$ref  = (int) $request->get_param( 'ref' );
	$bid  = '';
	if ( 'kuendigung' === $kind ) {
		if ( ! isset( $r['kuendigungen'][ $ref ] ) ) {
			return hansea_error( 'hansea_crm_ref', 'Diese Kündigung gibt es nicht (mehr). Bitte neu laden.', 404 );
		}
		if ( in_array( $r['kuendigungen'][ $ref ]['ar_status'], array( 'offen', 'zugestimmt' ), true ) ) {
			return hansea_error( 'hansea_crm_protected', 'Das Kündigungsschreiben einer vorgelegten oder genehmigten Kündigung lässt sich nicht ersetzen.', 409 );
		}
	} elseif ( 'zustimmung' === $kind ) {
		$bid = (string) $request->get_param( 'beschluss' );
		$b   = null;
		foreach ( hansea_crm_beschluesse( $post->ID ) as $x ) {
			$b = $x['id'] === $bid ? $x : $b;
		}
		if ( ! $b || 'zugestimmt' !== $b['status'] ) {
			return hansea_error( 'hansea_crm_ref', 'Zu diesem Beschluss gibt es keine Zustimmung.', 409 );
		}
		if ( strtotime( $b['closed'] ?? '' ) < strtotime( HANSEA_APPROVAL_DOCS_SINCE ) ) {
			return hansea_error( 'hansea_crm_ref', 'Für Beschlüsse vor der Einführung der Zustimmungsdokumente wird keines erstellt.', 409 );
		}
		if ( in_array( $bid, array_column( hansea_crm_documents( $post->ID ), 'beschluss' ), true ) ) {
			return hansea_error( 'hansea_crm_exists', 'Das Dokument zu dieser Zustimmung liegt schon vor.', 409 );
		}
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
	$id = bin2hex( random_bytes( 16 ) );
	if ( false === file_put_contents( $dir . '/' . $id . '.bin', hansea_seal_file( $data ) ) ) {
		return hansea_error( 'hansea_crm_upload', 'Das Dokument konnte nicht gespeichert werden.', 500 );
	}
	$name = sanitize_file_name( (string) $file['name'] ) ?: 'Dokument.pdf';
	$user = wp_get_current_user();
	add_post_meta( $post->ID, 'hansea_crm_doc', array(
		'id'        => $id,
		'name'      => $name,
		'size'      => (int) $file['size'],
		'time'      => gmdate( 'c' ),
		'user'      => $user->display_name ?: $user->user_login,
		'kind'      => $kind,
		'beschluss' => $bid,
	) );
	if ( 'kuendigung' === $kind ) {
		$r['kuendigungen'][ $ref ]['schreiben'] = $id;
		hansea_crm_save( $r, $post->ID );
		hansea_crm_log( $post->ID, 'Kündigungsschreiben hochgeladen', sprintf( '%s (Kündigung Zeile %d, im Mitgliederbereich sichtbar)', $name, $ref + 1 ), true );
	} else {
		hansea_crm_log( $post->ID, 'zustimmung' === $kind ? 'Zustimmungsdokument abgelegt' : 'Dokument hochgeladen', $name . ' (im Mitgliederbereich sichtbar)', true );
	}
	// An approved Kündigung: the confirmation also goes to the member by email
	if ( 'zustimmung' === $kind && 'kuendigung' === $b['type'] ) {
		hansea_crm_send_cancellation_confirmation( $post->ID, $r, $b, $data, $name );
	}
	return rest_ensure_response( hansea_crm_detail( $post->ID ) );
}

/** Streams a decrypted document to the browser (logged). */
function hansea_crm_rest_document_get( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	return is_wp_error( $post ) ? $post : hansea_crm_send_document( $post->ID, (string) $request['doc'], 'Dokument geöffnet' );
}

/**
 * The member's own documents in the members' area: every PDF attached to
 * their record in the Mitgliederliste (/wp-json/hansea/v1/member/documents/…).
 */
add_action( 'rest_api_init', function () {
	register_rest_route( 'hansea/v1', '/member/documents/(?P<doc>[a-f0-9]{32})', array(
		'methods'             => 'GET',
		'callback'            => function ( WP_REST_Request $request ) {
			$post_id = hansea_crm_member_of( wp_get_current_user() );
			return $post_id ? hansea_crm_send_document( $post_id, (string) $request['doc'], 'Dokument im Mitgliederbereich geöffnet' ) : hansea_error( 'hansea_crm_missing', 'Dokument nicht gefunden.', 404 );
		},
		'permission_callback' => 'is_user_logged_in',
	) );
} );

/** Sends one document of a member as PDF and logs who opened it; a 404 error when it isn't theirs. */
function hansea_crm_send_document( $post_id, $doc_id, $action ) {
	$doc = null;
	foreach ( hansea_crm_documents( $post_id ) as $d ) {
		if ( $d['id'] === $doc_id ) {
			$doc = $d;
		}
	}
	$raw = $doc ? @file_get_contents( hansea_crm_files_dir() . '/' . $doc['id'] . '.bin' ) : false;
	$pdf = hansea_unseal_file( $raw );
	if ( false === $pdf ) {
		return hansea_error( 'hansea_crm_missing', 'Dokument nicht gefunden.', 404 );
	}
	hansea_crm_log( $post_id, $action, $doc['name'] );
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
 *
 * Decisions about ordentliche Mitglieder go to the Vorstand instead (every
 * user with the role "Vorstand" votes; gremium "vorstand" on the Beschluss).
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

/** Users of the Vorstand (role Vorstand), sorted by name. */
function hansea_crm_vorstand_members() {
	return get_users( array( 'role' => 'vorstand', 'orderby' => 'display_name' ) );
}

/** Who decides about a member: 'vorstand' for ordentliche Mitglieder, else 'ar'. */
function hansea_crm_gremium_for( array $r ) {
	return 'o' === $r['art'] ? 'vorstand' : 'ar';
}

/** Gremium of a stored Beschluss (older ones have none: Aufsichtsrat). */
function hansea_crm_gremium( array $b ) {
	return 'vorstand' === ( $b['gremium'] ?? '' ) ? 'vorstand' : 'ar';
}

function hansea_crm_gremium_label( $gremium ) {
	return 'vorstand' === $gremium ? 'Vorstand' : 'Aufsichtsrat';
}

function hansea_crm_gremium_cap( $gremium ) {
	return 'vorstand' === $gremium ? HANSEA_VORSTAND_CAP : HANSEA_AR_CAP;
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
		$votes[] = array( 'name' => $name, 'fullName' => $b['full'][ $uid ] ?? $name, 'vote' => $v['vote'] ?? '', 'time' => $v['time'] ?? '', 'note' => $v['note'] ?? '' );
	}
	return array(
		'id'      => $b['id'],
		'gremium' => hansea_crm_gremium( $b ),
		'type'    => $b['type'],
		'title'   => $b['title'],
		'ref'     => $b['ref'],
		'status'  => $b['status'],
		'created' => $b['created'],
		'by'      => $b['by'],
		'portal'  => ! empty( $b['portal'] ),
		'closed'  => $b['closed'] ?? '',
		'votes'   => $votes,
		'canVote' => 'offen' === $b['status'] && isset( $b['voters'][ $me ] ) && ! isset( $b['votes'][ $me ] ) && current_user_can( hansea_crm_gremium_cap( hansea_crm_gremium( $b ) ) ),
	);
}

function hansea_crm_beschluss_save( $post_id, array $list ) {
	update_post_meta( $post_id, 'hansea_crm_beschluesse', $list );
}

/** "Dem Aufsichtsrat vorlegen" (ordentliche Mitglieder: dem Vorstand). */
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
	$r       = hansea_crm_record( $post->ID );
	$gremium = hansea_crm_gremium_for( $r );
	$label   = hansea_crm_gremium_label( $gremium );
	if ( 'vorstand' === $gremium ) {
		$ar = hansea_crm_vorstand_members();
		if ( ! $ar ) {
			return hansea_error( 'hansea_crm_ar', 'Über ordentliche Mitglieder entscheidet der Vorstand. Es ist noch kein Vorstand mit eigenem Zugang angelegt (Rolle „Vorstand“).', 409 );
		}
	} else {
		$ar = hansea_crm_ar_members();
		if ( count( $ar ) < HANSEA_AR_SIZE ) {
			return hansea_error( 'hansea_crm_ar', sprintf( 'Es sind erst %d von %d Aufsichtsratsmitgliedern mit eigenem Zugang angelegt (Rolle „Aufsichtsrat“).', count( $ar ), HANSEA_AR_SIZE ), 409 );
		}
	}
	$list = hansea_crm_beschluesse( $post->ID );
	foreach ( $list as $b ) {
		if ( 'offen' === $b['status'] && $b['type'] === $type && $b['ref'] === $ref ) {
			return hansea_error( 'hansea_crm_open', 'Dazu liegt schon ein offener Beschluss vor.', 409 );
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
		$row = $r[ $rows ][ $ref ];
		if ( 'kuendigung' === $type && ( '' === $row['schreiben'] || ! in_array( $row['schreiben'], array_column( hansea_crm_documents( $post->ID ), 'id' ), true ) ) ) {
			return hansea_error( 'hansea_crm_schreiben', 'Bitte zuerst das ausgefüllte Kündigungsschreiben zu dieser Kündigung hochladen.', 422 );
		}
		$title .= sprintf( ' (%s %s', hansea_crm_units( (float) $row['anteile'] ), 1.0 === (float) $row['anteile'] ? 'Anteil' : 'Anteile' ) . ( 'kuendigung' === $type && $row['zum'] ? ' zum ' . mysql2date( 'd.m.Y', $row['zum'] ) : '' ) . ')';
		$r[ $rows ][ $ref ]['ar_status'] = 'offen';
	} else {
		if ( 'zugelassen' !== $r['status'] ) {
			return hansea_error( 'hansea_crm_status', 'Nur zugelassene Mitglieder können ausscheiden.', 409 );
		}
		$r['aus_ar_status'] = 'offen';
	}

	$voters = array();
	$full   = array(); // full names for the approval documents
	foreach ( $ar as $u ) {
		$voters[ $u->ID ] = hansea_crm_ar_name( $u );
		$full[ $u->ID ]   = trim( $u->first_name . ' ' . $u->last_name ) ?: $u->display_name;
	}
	$user   = wp_get_current_user();
	$list[] = array(
		'id'      => bin2hex( random_bytes( 8 ) ),
		'gremium' => $gremium,
		'type'    => $type,
		'ref'     => $ref,
		'title'   => $title,
		'status'  => 'offen',
		'created' => gmdate( 'c' ),
		'by'      => $user->display_name ?: $user->user_login,
		'portal'  => 'zulassung' === $type, // admitted members always get their access email
		'voters'  => $voters,
		'full'    => $full,
		'votes'   => array(),
	);
	hansea_crm_save( $r, $post->ID );
	hansea_crm_beschluss_save( $post->ID, $list );
	hansea_crm_log( $post->ID, 'Dem ' . $label . ' vorgelegt', $title );
	hansea_crm_notify_ar( $ar, $title, $post->ID, $gremium );
	$who = implode( ', ', $voters ) . ( 1 === count( $voters ) ? ' wurde' : ' wurden' );
	return rest_ensure_response( array( 'member' => hansea_crm_detail( $post->ID ), 'message' => 'Dem ' . $label . ' vorgelegt. ' . $who . ' per E-Mail benachrichtigt.' ) );
}

function hansea_crm_units( $n ) {
	return rtrim( rtrim( number_format( (float) $n, 2, ',', '.' ), '0' ), ',' );
}

/** Short email to the Aufsichtsrat (or Vorstand) with a link to the decision. */
function hansea_crm_notify_ar( array $users, $title, $post_id, $gremium = 'ar' ) {
	$link = home_url( '/mitgliederliste/#/mitglied/' . $post_id );
	$rule = 'vorstand' === $gremium
		? 'Über ordentliche Mitglieder entscheidet der Vorstand. Bitte melden Sie sich an und stimmen Sie in der Mitgliederliste ab.'
		: 'Alle Mitglieder des Aufsichtsrats müssen zustimmen. Bitte melden Sie sich an und stimmen Sie in der Mitgliederliste ab.';
	foreach ( $users as $u ) {
		wp_mail( $u->user_email, 'Zur Zustimmung: ' . $title, hansea_email_html( array(
			'eyebrow' => hansea_crm_gremium_label( $gremium ),
			'title'   => 'Ein Beschluss wartet auf Ihre Zustimmung',
			'html'    => array( esc_html( $title ), $rule ),
			'button'  => array( 'label' => 'Zum Beschluss', 'url' => $link ),
		) ), array( 'Content-Type: text/html; charset=UTF-8' ) );
	}
}

/** One Aufsichtsrat (or Vorstand) member votes. The last agreeing vote applies the decision. */
function hansea_crm_rest_beschluss_vote( WP_REST_Request $request ) {
	$post = hansea_crm_post( $request );
	if ( is_wp_error( $post ) ) {
		return $post;
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
	$b       = $list[ $i ];
	$gremium = hansea_crm_gremium( $b );
	if ( ! current_user_can( hansea_crm_gremium_cap( $gremium ) ) ) {
		return hansea_error( 'hansea_crm_ar', 'vorstand' === $gremium ? 'Über diesen Beschluss stimmt der Vorstand ab.' : 'Nur Mitglieder des Aufsichtsrats können abstimmen.', 403 );
	}
	if ( 'offen' !== $b['status'] ) {
		return hansea_error( 'hansea_crm_closed', 'Über diesen Beschluss ist schon entschieden.', 409 );
	}
	if ( ! isset( $b['voters'][ $me ] ) || isset( $b['votes'][ $me ] ) ) {
		return hansea_error( 'hansea_crm_vote', isset( $b['votes'][ $me ] ) ? 'Sie haben schon abgestimmt.' : 'Sie gehören nicht zu den Abstimmenden dieses Beschlusses.', 409 );
	}
	$note              = mb_substr( sanitize_textarea_field( (string) $request->get_param( 'note' ) ), 0, 1000 );
	$b['votes'][ $me ] = array( 'vote' => $vote, 'time' => gmdate( 'c' ), 'note' => $note );
	hansea_crm_log( $post->ID, hansea_crm_gremium_label( $gremium ) . ': ' . ( 'zugestimmt' === $vote ? 'Zustimmung' : 'Ablehnung' ), $b['title'] . ( $note ? ' – ' . $note : '' ) );

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
	hansea_crm_log( $post_id, $ok ? 'Beschluss gefasst' : 'Beschluss abgelehnt', $b['title'] . ' – ' . hansea_crm_gremium_label( hansea_crm_gremium( $b ) ) . ': ' . $names );

	$agreed = 1 === count( $b['voters'] ) ? 'Zugestimmt' : 'Alle haben zugestimmt';
	if ( $ok && 'zulassung' === $b['type'] ) {
		$portal = ! empty( $b['portal'] ) ? hansea_crm_open_portal( $post_id ) : 'Kein Portal-Zugang angelegt.';
		return $agreed . ': Mitglied Nr. ' . $r['nr'] . ' ist zugelassen. ' . ( is_wp_error( $portal ) ? $portal->get_error_message() : $portal );
	}
	return $ok ? $agreed . ', der Beschluss ist gefasst.' : 'Der Beschluss ist abgelehnt.';
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

/** Open Beschlüsse of all members (inbox of the Aufsichtsrat and the Vorstand). */
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
		'ar'       => array_map( 'hansea_crm_ar_name', hansea_crm_ar_members() ),
		'size'     => HANSEA_AR_SIZE,
		'vorstand' => array_map( 'hansea_crm_ar_name', hansea_crm_vorstand_members() ),
	) );
}
