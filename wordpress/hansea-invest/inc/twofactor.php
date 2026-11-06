<?php
/**
 * Two-factor login (TOTP, RFC 6238) for staff: administrators, editors and
 * everyone with the CRM capability (Mitgliederverwaltung, Aufsichtsrat).
 * Members of the portal are not affected.
 *
 * Setup happens in the Mitgliederliste (tab "Sicherheit"): scan the QR code
 * with an authenticator app, confirm one code, keep the recovery codes.
 * Until then the CRM API and wp-admin are closed for that account; the
 * login itself still works so the setup can be done.
 *
 * Every login path asks for the code: wp-login.php (extra field) and the
 * theme's REST login (field appears after the password was correct).
 * The secret is stored encrypted with the CRM key (hansea_seal, inc/crm.php).
 *
 * Lost phone: an administrator resets 2FA under Benutzer (row action
 * "Zwei-Faktor zurücksetzen"), or the member uses a recovery code.
 * Emergency switch: define( 'HANSEA_2FA_DISABLED', true ) in wp-config.php.
 */

defined( 'ABSPATH' ) || exit;

const HANSEA_2FA_ISSUER = 'Hanseatische Invest eG';

function hansea_2fa_required( $user ) {
	if ( defined( 'HANSEA_2FA_DISABLED' ) && HANSEA_2FA_DISABLED ) {
		return false;
	}
	$user = $user instanceof WP_User ? $user : get_userdata( (int) $user );
	return $user && $user->exists() && ( user_can( $user, 'hansea_crm' ) || user_can( $user, 'edit_posts' ) );
}

function hansea_2fa_enabled( $user_id ) {
	return '' !== (string) get_user_meta( $user_id, 'hansea_2fa_secret', true );
}

/** Staff account that still has to set up 2FA. */
function hansea_2fa_missing( $user = null ) {
	$user = $user ?: wp_get_current_user();
	return hansea_2fa_required( $user ) && ! hansea_2fa_enabled( $user->ID );
}

/* ---------------------------------------------------------------------------
 * TOTP
 * ------------------------------------------------------------------------ */

function hansea_base32_encode( $bin ) {
	$alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	$bits     = '';
	foreach ( str_split( $bin ) as $c ) {
		$bits .= str_pad( decbin( ord( $c ) ), 8, '0', STR_PAD_LEFT );
	}
	$out = '';
	foreach ( str_split( $bits, 5 ) as $chunk ) {
		$out .= $alphabet[ bindec( str_pad( $chunk, 5, '0' ) ) ];
	}
	return $out;
}

function hansea_base32_decode( $b32 ) {
	$alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	$bits     = '';
	foreach ( str_split( strtoupper( preg_replace( '/[^A-Za-z2-7]/', '', $b32 ) ) ) as $c ) {
		$bits .= str_pad( decbin( strpos( $alphabet, $c ) ), 5, '0', STR_PAD_LEFT );
	}
	$out = '';
	foreach ( str_split( $bits, 8 ) as $byte ) {
		if ( 8 === strlen( $byte ) ) {
			$out .= chr( bindec( $byte ) );
		}
	}
	return $out;
}

function hansea_totp_at( $secret_bin, $step ) {
	$hash   = hash_hmac( 'sha1', pack( 'N*', 0, $step ), $secret_bin, true );
	$offset = ord( $hash[19] ) & 0x0f;
	$value  = ( ( ord( $hash[ $offset ] ) & 0x7f ) << 24 ) | ( ord( $hash[ $offset + 1 ] ) << 16 ) | ( ord( $hash[ $offset + 2 ] ) << 8 ) | ord( $hash[ $offset + 3 ] );
	return str_pad( (string) ( $value % 1000000 ), 6, '0', STR_PAD_LEFT );
}

/** Time step of a matching code (±30 s tolerance), or false. */
function hansea_totp_match( $secret_b32, $code ) {
	$code = preg_replace( '/\D/', '', (string) $code );
	if ( 6 !== strlen( $code ) ) {
		return false;
	}
	$secret = hansea_base32_decode( $secret_b32 );
	$now    = (int) floor( time() / 30 );
	for ( $i = -1; $i <= 1; $i++ ) {
		if ( hash_equals( hansea_totp_at( $secret, $now + $i ), $code ) ) {
			return $now + $i;
		}
	}
	return false;
}

/** Checks a TOTP or recovery code for a user; a used code can't be used again. */
function hansea_2fa_verify( $user_id, $code ) {
	$secret = hansea_unseal( get_user_meta( $user_id, 'hansea_2fa_secret', true ) );
	$step   = $secret ? hansea_totp_match( $secret, $code ) : false;
	if ( false !== $step ) {
		if ( $step <= (int) get_user_meta( $user_id, 'hansea_2fa_last_step', true ) ) {
			return false; // replay of a code that was already used
		}
		update_user_meta( $user_id, 'hansea_2fa_last_step', $step );
		return true;
	}
	// Recovery code: 10 characters, one-time
	$plain = strtoupper( preg_replace( '/[^A-Za-z0-9]/', '', (string) $code ) );
	if ( 10 !== strlen( $plain ) ) {
		return false;
	}
	$hashes = (array) get_user_meta( $user_id, 'hansea_2fa_recovery', true );
	foreach ( $hashes as $i => $hash ) {
		if ( wp_check_password( $plain, $hash ) ) {
			unset( $hashes[ $i ] );
			update_user_meta( $user_id, 'hansea_2fa_recovery', array_values( $hashes ) );
			return true;
		}
	}
	return false;
}

function hansea_2fa_reset( $user_id ) {
	foreach ( array( 'hansea_2fa_secret', 'hansea_2fa_pending', 'hansea_2fa_recovery', 'hansea_2fa_last_step' ) as $meta ) {
		delete_user_meta( $user_id, $meta );
	}
}

/* ---------------------------------------------------------------------------
 * Login: every path goes through authenticate
 * ------------------------------------------------------------------------ */

/** Code sent with the login: wp-login.php field, or set by the REST login. */
function hansea_2fa_submitted_code() {
	if ( isset( $GLOBALS['hansea_2fa_code'] ) ) {
		return (string) $GLOBALS['hansea_2fa_code'];
	}
	return isset( $_POST['hansea_otp'] ) ? sanitize_text_field( wp_unslash( $_POST['hansea_otp'] ) ) : '';
}

add_filter( 'authenticate', function ( $user ) {
	if ( ! $user instanceof WP_User || ! hansea_2fa_enabled( $user->ID ) || ! hansea_2fa_required( $user ) ) {
		return $user;
	}
	$code = hansea_2fa_submitted_code();
	if ( '' === $code ) {
		return new WP_Error( 'hansea_2fa_required', 'Bitte geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.' );
	}
	if ( ! hansea_2fa_verify( $user->ID, $code ) ) {
		return new WP_Error( 'hansea_2fa_invalid', 'Der Code ist nicht korrekt oder abgelaufen.' );
	}
	return $user;
}, 50 );

add_action( 'login_form', function () {
	?>
	<p>
		<label for="hansea_otp">Code aus der Authenticator-App <span style="font-weight:400">(nur Mitarbeiter)</span></label>
		<input type="text" name="hansea_otp" id="hansea_otp" class="input" inputmode="numeric" autocomplete="one-time-code" size="20" placeholder="123456">
	</p>
	<?php
} );

/* ---------------------------------------------------------------------------
 * Staff without 2FA: CRM API and wp-admin stay closed until it is set up
 * ------------------------------------------------------------------------ */

add_action( 'admin_init', function () {
	if ( wp_doing_ajax() || ! is_user_logged_in() || ! hansea_2fa_missing() ) {
		return;
	}
	wp_safe_redirect( home_url( '/mitgliederliste/#/sicherheit' ) );
	exit;
}, 1 );

/* ---------------------------------------------------------------------------
 * REST: setup in the Mitgliederliste
 * ------------------------------------------------------------------------ */

add_action( 'rest_api_init', function () {
	$staff = function () {
		return is_user_logged_in() && hansea_2fa_required( wp_get_current_user() );
	};
	register_rest_route( 'hansea/v1', '/2fa/setup', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_2fa_setup',
		'permission_callback' => $staff,
	) );
	register_rest_route( 'hansea/v1', '/2fa/enable', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_2fa_enable',
		'permission_callback' => $staff,
	) );
} );

/** New secret (pending until a code confirms it); returns the otpauth URI for the QR code. */
function hansea_rest_2fa_setup() {
	$user = wp_get_current_user();
	if ( hansea_2fa_enabled( $user->ID ) ) {
		return hansea_error( 'hansea_2fa_exists', 'Die Zwei-Faktor-Anmeldung ist bereits eingerichtet.', 409 );
	}
	$secret = hansea_base32_encode( random_bytes( 20 ) );
	$sealed = hansea_seal( $secret );
	if ( '' === $sealed ) {
		return hansea_error( 'hansea_2fa_key', 'Der Schlüssel für die Verschlüsselung fehlt.', 500 );
	}
	update_user_meta( $user->ID, 'hansea_2fa_pending', $sealed );
	$label = rawurlencode( HANSEA_2FA_ISSUER . ':' . $user->user_email );
	return rest_ensure_response( array(
		'secret' => trim( chunk_split( $secret, 4, ' ' ) ),
		'uri'    => 'otpauth://totp/' . $label . '?secret=' . $secret . '&issuer=' . rawurlencode( HANSEA_2FA_ISSUER ) . '&algorithm=SHA1&digits=6&period=30',
	) );
}

/** Confirms the pending secret with a code; returns the recovery codes (shown once). */
function hansea_rest_2fa_enable( WP_REST_Request $request ) {
	if ( ! hansea_rate_limit( '2fa_enable', 10, 15 * MINUTE_IN_SECONDS ) ) {
		return hansea_error( 'hansea_throttled', 'Zu viele Versuche. Bitte warten Sie 15 Minuten.', 429 );
	}
	$user   = wp_get_current_user();
	$secret = hansea_unseal( get_user_meta( $user->ID, 'hansea_2fa_pending', true ) );
	if ( '' === $secret ) {
		return hansea_error( 'hansea_2fa_pending', 'Bitte starten Sie die Einrichtung neu.', 409 );
	}
	$step = hansea_totp_match( $secret, (string) $request->get_param( 'code' ) );
	if ( false === $step ) {
		return hansea_error( 'hansea_2fa_invalid', 'Der Code stimmt nicht. Bitte prüfen Sie die Uhrzeit auf dem Telefon und versuchen Sie es mit dem nächsten Code.', 422 );
	}
	$codes  = array();
	$hashes = array();
	for ( $i = 0; $i < 8; $i++ ) {
		$code     = strtoupper( substr( hansea_base32_encode( random_bytes( 8 ) ), 0, 10 ) );
		$codes[]  = substr( $code, 0, 5 ) . '-' . substr( $code, 5 );
		$hashes[] = wp_hash_password( $code );
	}
	update_user_meta( $user->ID, 'hansea_2fa_secret', get_user_meta( $user->ID, 'hansea_2fa_pending', true ) );
	update_user_meta( $user->ID, 'hansea_2fa_recovery', $hashes );
	update_user_meta( $user->ID, 'hansea_2fa_last_step', $step );
	delete_user_meta( $user->ID, 'hansea_2fa_pending' );
	return rest_ensure_response( array( 'enabled' => true, 'recoveryCodes' => $codes ) );
}

/* ---------------------------------------------------------------------------
 * wp-admin: administrators reset 2FA for someone who lost their phone
 * ------------------------------------------------------------------------ */

add_filter( 'user_row_actions', function ( $actions, $user ) {
	if ( current_user_can( 'manage_options' ) && hansea_2fa_enabled( $user->ID ) ) {
		$url = wp_nonce_url( admin_url( 'admin-post.php?action=hansea_2fa_reset&user=' . $user->ID ), 'hansea_2fa_reset_' . $user->ID );
		$actions['hansea_2fa'] = '<a href="' . esc_url( $url ) . '" onclick="return confirm(\'Zwei-Faktor-Anmeldung zurücksetzen? Die Person muss sie danach neu einrichten.\')">Zwei-Faktor zurücksetzen</a>';
	}
	return $actions;
}, 10, 2 );

add_action( 'admin_post_hansea_2fa_reset', function () {
	$user_id = isset( $_GET['user'] ) ? (int) $_GET['user'] : 0;
	check_admin_referer( 'hansea_2fa_reset_' . $user_id );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Keine Berechtigung.' );
	}
	hansea_2fa_reset( $user_id );
	wp_safe_redirect( admin_url( 'users.php' ) );
	exit;
} );
