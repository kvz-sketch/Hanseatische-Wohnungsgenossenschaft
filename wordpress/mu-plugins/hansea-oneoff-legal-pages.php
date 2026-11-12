<?php
/**
 * One-time setup, then deletes itself: creates the pages Impressum
 * (/impressum/), Datenschutz (/datenschutz/) and Cookie-Richtlinie
 * (/cookie-richtlinie/) with the theme template "Rechtliches" and the text
 * from the theme's legal/ folder, and makes Datenschutz the WordPress privacy
 * policy page. An existing page with the same address is left as it is.
 * After that, the texts are edited as normal pages in wp-admin.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_legal_pages_lock', time(), '', 'no' ) ) {
		return;
	}

	$pages = array(
		'impressum'         => 'Impressum',
		'datenschutz'       => 'Datenschutzerklärung',
		'cookie-richtlinie' => 'Cookie-Richtlinie',
	);
	$dir   = get_template_directory() . '/legal/';

	foreach ( $pages as $slug => $title ) {
		$content = (string) @file_get_contents( $dir . $slug . '.html' );
		if ( '' === $content ) {
			delete_option( 'hansea_oneoff_legal_pages_lock' );
			return; // theme files not uploaded yet: try again on the next request
		}
		$existing = get_page_by_path( $slug, OBJECT, 'page' );
		$page_id  = $existing ? (int) $existing->ID : (int) wp_insert_post( array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => $title,
			'post_name'    => $slug,
			'post_content' => $content,
		) );
		if ( $page_id && ! $existing ) {
			update_post_meta( $page_id, '_wp_page_template', 'templates/legal.php' );
		}
		if ( 'datenschutz' === $slug && $page_id ) {
			update_option( 'wp_page_for_privacy_policy', $page_id );
		}
	}

	delete_option( 'hansea_oneoff_legal_pages_lock' );
	@unlink( __FILE__ );
}, 20 );
