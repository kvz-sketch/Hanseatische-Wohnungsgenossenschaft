<?php
/**
 * One-time cleanup, then deletes itself: moves WordPress's sample content
 * ("Hello world!" post, "Sample Page") to the trash and makes sure the
 * landing page is the front page.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_sample_lock', time(), '', 'no' ) ) {
		return;
	}
	foreach ( get_posts( array( 'post_type' => 'post', 'post_status' => 'any', 'numberposts' => -1 ) ) as $post ) {
		if ( in_array( $post->post_name, array( 'hello-world', 'hallo-welt' ), true ) ) {
			wp_trash_post( $post->ID );
		}
	}
	foreach ( array( 'sample-page', 'beispiel-seite' ) as $slug ) {
		$page = get_page_by_path( $slug );
		if ( $page && ! get_post_meta( $page->ID, '_elementor_data', true ) ) {
			wp_trash_post( $page->ID );
		}
	}
	$landing = get_posts( array( 'post_type' => 'page', 'post_status' => 'publish', 'meta_key' => 'hansea_landing', 'numberposts' => 1, 'fields' => 'ids' ) );
	if ( $landing ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', (int) $landing[0] );
	}
	delete_option( 'hansea_oneoff_sample_lock' );
	@unlink( __FILE__ );
}, 20 );
