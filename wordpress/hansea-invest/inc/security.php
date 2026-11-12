<?php
/**
 * Hardening for the whole site:
 * - XML-RPC off (its system.multicall allows hundreds of password guesses per request).
 * - Login throttling on every login path (wp-login.php, the theme's REST
 *   login, anything that calls wp_signon): per IP, and a lockout per account
 *   after repeated failures.
 * - Security headers (HSTS, framing, MIME sniffing, referrer) and REST CORS
 *   limited to the site itself.
 * - Shorter sessions for staff (they can read members' bank data).
 * - No PHP version header, no WordPress readme in the web root.
 */

defined( 'ABSPATH' ) || exit;

/** Failed logins allowed per window, per IP and per account. */
const HANSEA_LOGIN_MAX_IP      = 20;
const HANSEA_LOGIN_MAX_ACCOUNT = 10;
const HANSEA_LOGIN_WINDOW      = 15 * MINUTE_IN_SECONDS;

/* ---------------------------------------------------------------------------
 * XML-RPC
 * ------------------------------------------------------------------------ */

add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'xmlrpc_methods', '__return_empty_array' ); // also removes system.multicall
add_filter( 'wp_headers', function ( $headers ) {
	unset( $headers['X-Pingback'] );
	return $headers;
} );
add_action( 'init', function () {
	if ( defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST ) {
		status_header( 403 );
		exit;
	}
}, 0 );

/* ---------------------------------------------------------------------------
 * Login throttling
 * ------------------------------------------------------------------------ */

function hansea_client_ip() {
	return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
}

/** Account key for a login name or email (unknown names are counted too, so they look the same). */
function hansea_login_account_key( $login ) {
	$login = strtolower( trim( (string) $login ) );
	$user  = is_email( $login ) ? get_user_by( 'email', $login ) : get_user_by( 'login', $login );
	return 'hansea_lf_acct_' . md5( $user ? 'id:' . $user->ID : 'name:' . $login );
}

function hansea_login_ip_key() {
	return 'hansea_lf_ip_' . md5( hansea_client_ip() );
}

/**
 * Refuse while the IP or the account is locked. Runs last: earlier steps
 * (password check at 20, two-factor at 50) could otherwise turn an error
 * back into a user.
 */
add_filter( 'authenticate', function ( $user, $username ) {
	if ( '' === (string) $username ) {
		return $user;
	}
	if ( (int) get_transient( hansea_login_ip_key() ) >= HANSEA_LOGIN_MAX_IP
		|| (int) get_transient( hansea_login_account_key( $username ) ) >= HANSEA_LOGIN_MAX_ACCOUNT ) {
		return new WP_Error( 'hansea_locked', 'Zu viele fehlgeschlagene Anmeldeversuche. Bitte warten Sie 15 Minuten und versuchen Sie es dann erneut.' );
	}
	// Same answer for an unknown account and a wrong password, so logins can't be probed
	if ( is_wp_error( $user ) && array_intersect( $user->get_error_codes(), array( 'invalid_username', 'invalid_email', 'incorrect_password' ) ) ) {
		return new WP_Error( 'hansea_login_failed', '<strong>Fehler:</strong> E-Mail-Adresse, Benutzername oder Passwort ist nicht korrekt.' );
	}
	return $user;
}, 99, 2 );

add_action( 'wp_login_failed', function ( $username ) {
	foreach ( array( hansea_login_ip_key(), hansea_login_account_key( $username ) ) as $key ) {
		set_transient( $key, (int) get_transient( $key ) + 1, HANSEA_LOGIN_WINDOW );
	}
} );

// A successful login clears the account's counter.
add_action( 'wp_login', function ( $login ) {
	delete_transient( hansea_login_account_key( $login ) );
} );

/* ---------------------------------------------------------------------------
 * Headers
 * ------------------------------------------------------------------------ */

function hansea_security_headers() {
	if ( headers_sent() ) {
		return;
	}
	header_remove( 'X-Powered-By' );
	if ( is_ssl() ) {
		header( 'Strict-Transport-Security: max-age=31536000' );
	}
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( "Content-Security-Policy: frame-ancestors 'self'" );
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: camera=(), microphone=(), geolocation=()' );
}
add_action( 'send_headers', 'hansea_security_headers' );
add_action( 'login_init', 'hansea_security_headers' );
add_action( 'admin_init', 'hansea_security_headers' );

// REST: headers too, and CORS only for the site itself (WordPress echoes any Origin by default).
add_action( 'rest_api_init', function () {
	remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
	add_filter( 'rest_pre_serve_request', function ( $served ) {
		hansea_security_headers();
		$origin = get_http_origin();
		$own    = wp_parse_url( home_url(), PHP_URL_SCHEME ) . '://' . wp_parse_url( home_url(), PHP_URL_HOST );
		if ( $origin && $origin === $own ) {
			header( 'Access-Control-Allow-Origin: ' . $own );
			header( 'Access-Control-Allow-Credentials: true' );
			header( 'Vary: Origin', false );
		}
		return $served;
	} );
}, 15 );

/* ---------------------------------------------------------------------------
 * Sessions and leftovers
 * ------------------------------------------------------------------------ */

/** Staff (CRM, Aufsichtsrat, editors) stay signed in for at most 12 hours, members as before. */
add_filter( 'auth_cookie_expiration', function ( $seconds, $user_id ) {
	return user_can( $user_id, 'hansea_crm' ) || user_can( $user_id, 'edit_posts' ) ? min( $seconds, 12 * HOUR_IN_SECONDS ) : $seconds;
}, 10, 2 );

/** WordPress's readme.html shows the version; core updates put it back, so remove it again after each. */
function hansea_remove_readme() {
	$file = ABSPATH . 'readme.html';
	if ( file_exists( $file ) ) {
		@unlink( $file );
	}
}
add_action( 'upgrader_process_complete', 'hansea_remove_readme' );
add_action( 'init', function () {
	if ( get_option( 'hansea_readme_removed' ) !== get_bloginfo( 'version' ) ) {
		hansea_remove_readme();
		update_option( 'hansea_readme_removed', get_bloginfo( 'version' ), false );
	}
} );
