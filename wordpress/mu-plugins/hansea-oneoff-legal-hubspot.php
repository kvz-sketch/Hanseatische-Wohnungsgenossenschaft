<?php
/**
 * One-time update, then deletes itself: adds the section "Kontaktformular
 * (HubSpot)" to the Cookie-Richtlinie page, taken from the theme's
 * legal/cookie-richtlinie.html. It is inserted before "Marketing-Cookies";
 * the rest of the page, including any edits made in wp-admin, stays as it is.
 * A page that already mentions HubSpot is not touched.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_legal_hubspot_lock', time(), '', 'no' ) ) {
		return;
	}
	$anchor = '<h3>Marketing-Cookies</h3>';
	$file   = (string) @file_get_contents( get_template_directory() . '/legal/cookie-richtlinie.html' );
	$page   = get_page_by_path( 'cookie-richtlinie', OBJECT, 'page' );
	$start  = strpos( $file, '<h3>Kontaktformular (HubSpot)</h3>' );
	$end    = strpos( $file, $anchor );
	if ( ! $page || false === $start || false === $end ) {
		delete_option( 'hansea_oneoff_legal_hubspot_lock' );
		return; // theme update or page not there yet: try again on the next request
	}
	$content = $page->post_content;
	if ( false === stripos( $content, 'HubSpot' ) && false !== strpos( $content, $anchor ) ) {
		$content = str_replace( $anchor, substr( $file, $start, $end - $start ) . $anchor, $content );
		$content = str_replace( 'Stand: Oktober 2026', 'Stand: November 2026', $content );
		kses_remove_filters(); // keep the table and link attributes as written
		wp_update_post( array( 'ID' => $page->ID, 'post_content' => $content ) );
		kses_init();
	}
	delete_option( 'hansea_oneoff_legal_hubspot_lock' );
	@unlink( __FILE__ );
}, 20 );
