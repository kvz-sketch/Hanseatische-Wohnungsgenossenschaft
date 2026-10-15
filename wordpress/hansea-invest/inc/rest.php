<?php
/**
 * REST endpoints used by the login page and the dashboard:
 * POST /wp-json/hansea/v1/register, /login, /logout.
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
	register_rest_route( 'hansea/v1', '/register', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_register',
		'permission_callback' => '__return_true',
	) );
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

function hansea_rest_register( WP_REST_Request $request ) {
	if ( ! hansea_rate_limit( 'register', 5, HOUR_IN_SECONDS ) ) {
		return hansea_error( 'hansea_throttled', 'Zu viele Versuche. Bitte versuchen Sie es in einer Stunde erneut.', 429 );
	}

	$first    = sanitize_text_field( (string) $request->get_param( 'firstName' ) );
	$last     = sanitize_text_field( (string) $request->get_param( 'lastName' ) );
	$email    = sanitize_email( (string) $request->get_param( 'email' ) );
	$password = (string) $request->get_param( 'password' );
	$consent  = (bool) $request->get_param( 'consent' );

	if ( '' === $first || '' === $last ) {
		return hansea_error( 'hansea_invalid', 'Bitte geben Sie Vor- und Nachnamen ein.', 400 );
	}
	if ( ! is_email( $email ) ) {
		return hansea_error( 'hansea_invalid', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', 400 );
	}
	if ( strlen( $password ) < HANSEA_MIN_PASSWORD_LENGTH ) {
		return hansea_error( 'hansea_invalid', sprintf( 'Das Passwort muss mindestens %d Zeichen lang sein.', HANSEA_MIN_PASSWORD_LENGTH ), 400 );
	}
	if ( ! $consent ) {
		return hansea_error( 'hansea_invalid', 'Bitte bestätigen Sie die Datenschutzhinweise.', 400 );
	}
	if ( email_exists( $email ) ) {
		return hansea_error( 'hansea_exists', 'Für diese E-Mail-Adresse gibt es bereits ein Konto. Bitte melden Sie sich an.', 409 );
	}

	// Members sign in with their email; the username is just a unique handle.
	do {
		$login = 'mitglied_' . strtolower( wp_generate_password( 10, false, false ) );
	} while ( username_exists( $login ) );

	$user_id = wp_insert_user( array(
		'user_login'   => $login,
		'user_email'   => $email,
		'user_pass'    => $password,
		'first_name'   => $first,
		'last_name'    => $last,
		'display_name' => trim( $first . ' ' . $last ),
		'role'         => 'subscriber',
	) );
	if ( is_wp_error( $user_id ) ) {
		return hansea_error( 'hansea_failed', 'Das Konto konnte nicht erstellt werden. Bitte versuchen Sie es erneut.', 500 );
	}
	update_user_meta( $user_id, 'hansea_privacy_consent', current_time( 'mysql', true ) );

	wp_set_current_user( $user_id );
	wp_set_auth_cookie( $user_id, true, is_ssl() );

	return rest_ensure_response( array( 'member' => hansea_member_payload( get_userdata( $user_id ) ) ) );
}

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
