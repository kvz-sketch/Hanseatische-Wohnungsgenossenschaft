<?php
/**
 * Branded password reset: /passwort-vergessen/ (request + set new password)
 * replaces WordPress's lost-password screens. Uses WordPress's own reset keys
 * (retrieve_password, check_password_reset_key, reset_password).
 */

defined( 'ABSPATH' ) || exit;

function hansea_password_url( $args = array() ) {
	return add_query_arg( $args, home_url( '/passwort-vergessen/' ) );
}

// Every "lost password" link points to our page.
add_filter( 'lostpassword_url', function () {
	return hansea_password_url();
} );

// WordPress's own reset screens forward to ours (keeping key and login).
add_action( 'login_init', function () {
	$action = isset( $_REQUEST['action'] ) ? sanitize_key( wp_unslash( $_REQUEST['action'] ) ) : '';
	if ( in_array( $action, array( 'lostpassword', 'retrievepassword' ), true ) ) {
		wp_safe_redirect( hansea_password_url() );
		exit;
	}
	if ( in_array( $action, array( 'rp', 'resetpass' ), true ) && isset( $_GET['key'], $_GET['login'] ) ) {
		wp_safe_redirect( hansea_password_url( array(
			'key'   => rawurlencode( sanitize_text_field( wp_unslash( $_GET['key'] ) ) ),
			'login' => rawurlencode( sanitize_user( wp_unslash( $_GET['login'] ) ) ),
		) ) );
		exit;
	}
} );

// The reset email itself is built in inc/email.php.

add_action( 'rest_api_init', function () {
	register_rest_route( 'hansea/v1', '/password/request', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_password_request',
		'permission_callback' => '__return_true',
	) );
	register_rest_route( 'hansea/v1', '/password/reset', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_password_reset',
		'permission_callback' => '__return_true',
	) );
} );

function hansea_rest_password_request( WP_REST_Request $request ) {
	if ( ! hansea_rate_limit( 'password_request', 5, HOUR_IN_SECONDS ) ) {
		return hansea_error( 'hansea_throttled', 'Zu viele Anfragen. Bitte versuchen Sie es in einer Stunde erneut.', 429 );
	}
	$email = sanitize_email( (string) $request->get_param( 'email' ) );
	if ( ! is_email( $email ) ) {
		return hansea_error( 'hansea_invalid', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', 400 );
	}
	$user = get_user_by( 'email', $email );
	if ( $user ) {
		retrieve_password( $user->user_login );
	}
	// Same answer whether or not an account exists
	return rest_ensure_response( array( 'ok' => true ) );
}

function hansea_rest_password_reset( WP_REST_Request $request ) {
	if ( ! hansea_rate_limit( 'password_reset', 10, HOUR_IN_SECONDS ) ) {
		return hansea_error( 'hansea_throttled', 'Zu viele Versuche. Bitte versuchen Sie es in einer Stunde erneut.', 429 );
	}
	$login    = sanitize_user( (string) $request->get_param( 'login' ) );
	$key      = sanitize_text_field( (string) $request->get_param( 'key' ) );
	$password = (string) $request->get_param( 'password' );

	$user = check_password_reset_key( $key, $login );
	if ( is_wp_error( $user ) ) {
		return hansea_error( 'hansea_invalid_key', 'Dieser Link ist abgelaufen oder wurde bereits verwendet. Bitte fordern Sie einen neuen an.', 400 );
	}
	if ( strlen( $password ) < HANSEA_MIN_PASSWORD_LENGTH ) {
		return hansea_error( 'hansea_invalid', sprintf( 'Das Passwort muss mindestens %d Zeichen lang sein.', HANSEA_MIN_PASSWORD_LENGTH ), 400 );
	}

	reset_password( $user, $password );
	wp_set_current_user( $user->ID );
	wp_set_auth_cookie( $user->ID, true, is_ssl() );

	return rest_ensure_response( array( 'member' => hansea_member_payload( $user ) ) );
}
