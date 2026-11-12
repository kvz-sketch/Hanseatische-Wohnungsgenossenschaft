<?php
/**
 * One-time switch, then deletes itself: the redesigned landing page
 * ("Startseite – neues Design", /neues-design/) becomes the front page as
 * "Startseite" (/startseite/). The previous front page is kept as a private
 * draft "Startseite (altes Design)" so it can be restored in wp-admin
 * (Seiten → Startseite (altes Design) → Veröffentlichen, then Einstellungen →
 * Lesen → Startseite).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_switch_lock', time(), '', 'no' ) ) {
		return;
	}

	$new = get_posts( array( 'post_type' => 'page', 'post_status' => 'any', 'meta_key' => 'hansea_landing_preview', 'numberposts' => 1, 'fields' => 'ids' ) );
	$new = $new ? (int) $new[0] : 0;
	$old = (int) get_option( 'page_on_front' );

	if ( $new && $new !== $old ) {
		if ( $old ) {
			wp_update_post( array(
				'ID'          => $old,
				'post_title'  => 'Startseite (altes Design)',
				'post_name'   => 'startseite-altes-design',
				'post_status' => 'draft',
			) );
			delete_post_meta( $old, 'hansea_landing' );
			update_post_meta( $old, 'hansea_landing_previous', 1 );
		}

		wp_update_post( array(
			'ID'          => $new,
			'post_title'  => 'Startseite',
			'post_name'   => 'startseite',
			'post_status' => 'publish',
		) );
		delete_post_meta( $new, 'hansea_landing_preview' ); // also lifts its noindex
		update_post_meta( $new, 'hansea_landing', 1 );      // the landing page from now on

		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $new );
	}

	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	delete_option( 'hansea_oneoff_switch_lock' );
	@unlink( __FILE__ );
}, 30 );
