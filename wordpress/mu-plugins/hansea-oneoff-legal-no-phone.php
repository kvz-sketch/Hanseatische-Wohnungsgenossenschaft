<?php
/**
 * One-time update, then deletes itself: removes the phone number line from
 * the pages Impressum, Datenschutz and Cookie-Richtlinie (also when they
 * were edited in wp-admin; only that line is touched).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_legal_no_phone_lock', time(), '', 'no' ) ) {
		return;
	}
	foreach ( array( 'impressum', 'datenschutz', 'cookie-richtlinie' ) as $slug ) {
		$page = get_page_by_path( $slug, OBJECT, 'page' );
		if ( ! $page ) {
			continue;
		}
		$content = preg_replace( '~Telefon:\s*<a href="tel:\+4940228623720">\+49 40 22862372-0</a>\s*<br\s*/?>\s*~', '', $page->post_content );
		if ( $content !== $page->post_content ) {
			wp_update_post( array( 'ID' => $page->ID, 'post_content' => $content ) );
		}
	}
	delete_option( 'hansea_oneoff_legal_no_phone_lock' );
	@unlink( __FILE__ );
}, 20 );
