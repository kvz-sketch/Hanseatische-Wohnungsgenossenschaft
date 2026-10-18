<?php
/**
 * REST endpoints used by the login page and the dashboard:
 * POST /wp-json/hansea/v1/login, /logout. Accounts are created by the team
 * (inc/welcome.php); there is no self-registration.
 */

defined( 'ABSPATH' ) || exit;

const HANSEA_MIN_PASSWORD_LENGTH = 8;

/** Simple per-IP throttle; true while the visitor is under the limit. */
function hansea_rate_limit( $action, $max, $window ) {
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$key = 'hansea_rl_' . md5( $action . '|' . $ip );
	$hit = (int) get_transient( $key );
	if ( $hit >= $max ) {
		return false;
	}
	set_transient( $key, $hit + 1, $window );
	return true;
}

function hansea_error( $code, $message, $status ) {
	return new WP_Error( $code, $message, array( 'status' => $status ) );
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'hansea/v1', '/login', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_login',
		'permission_callback' => '__return_true',
	) );
	register_rest_route( 'hansea/v1', '/logout', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_logout',
		'permission_callback' => '__return_true',
	) );
} );

function hansea_rest_login( WP_REST_Request $request ) {
	if ( ! hansea_rate_limit( 'login', 10, 15 * MINUTE_IN_SECONDS ) ) {
		return hansea_error( 'hansea_throttled', 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.', 429 );
	}

	$email    = sanitize_email( (string) $request->get_param( 'email' ) );
	$password = (string) $request->get_param( 'password' );
	// Same answer for an unknown email and a wrong password
	$fail = hansea_error( 'hansea_login_failed', 'E-Mail-Adresse oder Passwort ist nicht korrekt.', 401 );

	$user = $email ? get_user_by( 'email', $email ) : false;
	if ( ! $user ) {
		return $fail;
	}
	$signed_in = wp_signon( array(
		'user_login'    => $user->user_login,
		'user_password' => $password,
		'remember'      => true,
	), is_ssl() );
	if ( is_wp_error( $signed_in ) ) {
		return $fail;
	}

	return rest_ensure_response( array( 'member' => hansea_member_payload( $signed_in ) ) );
}

function hansea_rest_logout() {
	if ( is_user_logged_in() ) {
		wp_logout();
	}
	return rest_ensure_response( array( 'ok' => true ) );
}
