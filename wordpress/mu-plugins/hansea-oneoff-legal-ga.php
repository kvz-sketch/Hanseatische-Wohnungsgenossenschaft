<?php
/**
 * One-time update, then deletes itself: replaces the text of the pages
 * Datenschutz and Cookie-Richtlinie with the versions in the theme's legal/
 * folder (Google Analytics with consent). A page that was edited in wp-admin
 * since it was created is left as it is.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_legal_ga_lock', time(), '', 'no' ) ) {
		return;
	}
	$dir = get_template_directory() . '/legal/';
	foreach ( array( 'datenschutz', 'cookie-richtlinie' ) as $slug ) {
		$content = (string) @file_get_contents( $dir . $slug . '.html' );
		$page    = get_page_by_path( $slug, OBJECT, 'page' );
		if ( '' === $content || ! $page ) {
			delete_option( 'hansea_oneoff_legal_ga_lock' );
			return; // theme files or pages not there yet: try again on the next request
		}
		if ( $page->post_modified_gmt === $page->post_date_gmt ) {
			wp_update_post( array( 'ID' => $page->ID, 'post_content' => $content ) );
		}
	}
	delete_option( 'hansea_oneoff_legal_ga_lock' );
	@unlink( __FILE__ );
}, 20 );
