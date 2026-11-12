<?php
/**
 * One-time change, then deletes itself: readable titles for the imported
 * landing images (shown as captions in the lightbox instead of file names).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	$titles = array(
		'siegel-top-experte-2026.png'                => 'TOP-Experten-Siegel 2026 (ERFOLG Magazin)',
		'siegel-top-100-coaches-berater-2025.png'    => 'Top 100 Coaches & Berater 2025 (ERFOLG Magazin)',
		'siegel-top-100-unternehmer-2024.png'        => 'Top 100 Unternehmer 2024 (ERFOLG Magazin)',
		'sponsoring-handball-trikot.jpg'             => 'Übergabe des signierten Handball-Trikots mit dem Logo der Hansea Invest eG',
	);
	foreach ( $titles as $file => $title ) {
		$ids = get_posts( array( 'post_type' => 'attachment', 'meta_key' => 'hansea_source', 'meta_value' => $file, 'numberposts' => -1, 'fields' => 'ids' ) );
		// Older imports carry no hansea_source: find them by file name
		$ids = array_merge( $ids, get_posts( array( 'post_type' => 'attachment', 'post_status' => 'inherit', 'numberposts' => -1, 'fields' => 'ids', 'meta_query' => array( array( 'key' => '_wp_attached_file', 'value' => '/' . $file, 'compare' => 'LIKE' ) ) ) ) );
		foreach ( array_unique( $ids ) as $id ) {
			wp_update_post( array( 'ID' => $id, 'post_title' => $title ) );
			update_post_meta( $id, '_wp_attachment_image_alt', $title );
		}
	}
	// Elementor caches rendered widgets: refresh the front page
	$front = (int) get_option( 'page_on_front' );
	if ( $front ) {
		delete_post_meta( $front, '_elementor_element_cache' );
		delete_post_meta( $front, '_elementor_css' );
	}
	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	@unlink( __FILE__ );
}, 20 );
