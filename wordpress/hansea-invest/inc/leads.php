<?php
/**
 * Lead forms (callback request, contact form): each request is stored as an
 * "Anfrage" in wp-admin and emailed to the site's admin address.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	register_post_type( 'hansea_lead', array(
		'labels'          => array(
			'name'          => 'Anfragen',
			'singular_name' => 'Anfrage',
			'all_items'     => 'Alle Anfragen',
		),
		'public'          => false,
		'show_ui'         => true,
		'menu_icon'       => 'dashicons-phone',
		'menu_position'   => 25,
		'supports'        => array( 'title', 'editor' ),
		'capability_type' => 'post',
		'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
		'map_meta_cap'    => true,
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'hansea/v1', '/lead', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_lead',
		'permission_callback' => '__return_true',
	) );
} );

/** Longest value stored per field (characters). */
const HANSEA_LEAD_MAX_LENGTH = 200;
/** A person needs at least this long to fill in a form; faster submissions are bots. */
const HANSEA_LEAD_MIN_SECONDS = 3;

/**
 * Signed time stamp put into each form when it is shown ("t.signature").
 * The server checks it on submit, so a bot can't skip the waiting time.
 */
function hansea_lead_token() {
	$time = (string) time();
	return $time . '.' . substr( hash_hmac( 'sha256', 'hansea_lead|' . $time, wp_salt( 'nonce' ) ), 0, 32 );
}

/** Seconds since the form was shown, or null for a missing or forged token. */
function hansea_lead_token_age( $token ) {
	$parts = explode( '.', (string) $token );
	if ( 2 !== count( $parts ) || ! ctype_digit( $parts[0] ) ) {
		return null;
	}
	$expected = substr( hash_hmac( 'sha256', 'hansea_lead|' . $parts[0], wp_salt( 'nonce' ) ), 0, 32 );
	return hash_equals( $expected, $parts[1] ) ? time() - (int) $parts[0] : null;
}

const HANSEA_LEAD_FIELDS = array(
	'firstName' => 'Vorname',
	'lastName'  => 'Nachname',
	'email'     => 'E-Mail',
	'phone'     => 'Telefon',
	'slot'      => 'Zeitfenster',
	'source'    => 'Erfahren über',
	'page'      => 'Seite',
);

function hansea_rest_lead( WP_REST_Request $request ) {
	if ( ! hansea_rate_limit( 'lead', 5, HOUR_IN_SECONDS ) ) {
		return hansea_error( 'hansea_throttled', 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.', 429 );
	}

	// Bots: the hidden "website" field is filled, or the form was sent faster than a person can.
	// They get the normal answer, but nothing is stored or emailed.
	$age = hansea_lead_token_age( $request->get_param( 'token' ) );
	if ( null === $age ) {
		return hansea_error( 'hansea_token', 'Bitte laden Sie die Seite neu und senden Sie das Formular dann erneut.', 400 );
	}
	if ( '' !== trim( (string) $request->get_param( 'website' ) ) || $age < HANSEA_LEAD_MIN_SECONDS ) {
		return rest_ensure_response( array( 'ok' => true ) );
	}

	$type = (string) $request->get_param( 'type' );
	if ( ! in_array( $type, array( 'callback', 'contact' ), true ) ) {
		return hansea_error( 'hansea_invalid', 'Unbekannte Anfrage.', 400 );
	}

	$lines = array();
	foreach ( HANSEA_LEAD_FIELDS as $key => $label ) {
		$value = mb_substr( sanitize_text_field( (string) $request->get_param( $key ) ), 0, HANSEA_LEAD_MAX_LENGTH );
		if ( '' !== $value ) {
			$lines[] = $label . ': ' . $value;
		}
	}
	$phone = mb_substr( sanitize_text_field( (string) $request->get_param( 'phone' ) ), 0, 40 );
	if ( '' === $phone || strlen( preg_replace( '/\D/', '', $phone ) ) < 6 ) {
		return hansea_error( 'hansea_invalid', 'Bitte geben Sie eine Telefonnummer an.', 400 );
	}
	$email = trim( (string) $request->get_param( 'email' ) );
	if ( '' !== $email && ! is_email( $email ) ) {
		return hansea_error( 'hansea_invalid', 'Bitte prüfen Sie die E-Mail-Adresse.', 400 );
	}
	if ( is_user_logged_in() ) {
		$lines[] = 'Mitgliedskonto: ' . wp_get_current_user()->user_email;
	}

	$title = ( 'callback' === $type ? 'Rückruf' : 'Kontaktanfrage' ) . ' · ' . $phone;
	$body  = implode( "\n", $lines );

	$post_id = wp_insert_post( array(
		'post_type'    => 'hansea_lead',
		'post_status'  => 'private',
		'post_title'   => $title,
		'post_content' => $body,
	) );
	if ( is_wp_error( $post_id ) || ! $post_id ) {
		return hansea_error( 'hansea_failed', 'Die Anfrage konnte nicht gespeichert werden.', 500 );
	}

	wp_mail(
		get_option( 'admin_email' ),
		'Neue Anfrage: ' . $title,
		$body . "\n\n" . admin_url( 'post.php?post=' . $post_id . '&action=edit' )
	);

	return rest_ensure_response( array( 'ok' => true ) );
}
