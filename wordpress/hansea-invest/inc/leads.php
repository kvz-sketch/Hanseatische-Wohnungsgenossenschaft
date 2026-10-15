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

	$type = (string) $request->get_param( 'type' );
	if ( ! in_array( $type, array( 'callback', 'contact' ), true ) ) {
		return hansea_error( 'hansea_invalid', 'Unbekannte Anfrage.', 400 );
	}

	$lines = array();
	foreach ( HANSEA_LEAD_FIELDS as $key => $label ) {
		$value = sanitize_text_field( (string) $request->get_param( $key ) );
		if ( '' !== $value ) {
			$lines[] = $label . ': ' . $value;
		}
	}
	$phone = sanitize_text_field( (string) $request->get_param( 'phone' ) );
	if ( '' === $phone ) {
		return hansea_error( 'hansea_invalid', 'Bitte geben Sie eine Telefonnummer an.', 400 );
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
