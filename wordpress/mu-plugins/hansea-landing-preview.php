<?php
/**
 * Creates (or refreshes) the page "Startseite – neues Design" at /neues-design/
 * from the theme's elementor/landing.json, so the redesigned landing page can
 * be reviewed next to the live one. The live front page is not touched.
 * Re-running refreshes the preview only while nobody has edited it in
 * Elementor. Deletes itself when done.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! did_action( 'elementor/loaded' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_landing_preview_lock', time(), '', 'no' ) ) {
		if ( time() - (int) get_option( 'hansea_landing_preview_lock' ) < 120 ) {
			return;
		}
		update_option( 'hansea_landing_preview_lock', time(), 'no' );
	}
	$done = function () {
		delete_option( 'hansea_landing_preview_lock' );
		@unlink( __FILE__ );
	};

	$dir  = get_template_directory() . '/elementor';
	$json = (string) @file_get_contents( $dir . '/landing.json' );
	if ( '' === $json ) {
		delete_option( 'hansea_landing_preview_lock' );
		return;
	}

	$existing = get_posts( array( 'post_type' => 'page', 'post_status' => 'any', 'meta_key' => 'hansea_landing_preview', 'numberposts' => 1, 'fields' => 'ids' ) );
	$page_id  = $existing ? (int) $existing[0] : 0;
	if ( $page_id ) {
		$hash = (string) get_post_meta( $page_id, 'hansea_landing_hash', true );
		if ( md5( (string) get_post_meta( $page_id, '_elementor_data', true ) ) !== $hash ) {
			$done(); // edited in Elementor: keep it
			return;
		}
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	// Images: reuse earlier imports, import new ones once
	preg_match_all( '/\{\{IMG:([^}]+)\}\}/', $json, $m );
	foreach ( array_unique( $m[1] ) as $file ) {
		$found  = get_posts( array( 'post_type' => 'attachment', 'meta_key' => 'hansea_source', 'meta_value' => $file, 'numberposts' => 1, 'fields' => 'ids' ) );
		$att_id = $found ? $found[0] : 0;
		if ( ! $att_id && is_readable( $dir . '/images/' . $file ) ) {
			$tmp = wp_tempnam( $file );
			copy( $dir . '/images/' . $file, $tmp );
			$att_id = media_handle_sideload( array( 'name' => $file, 'tmp_name' => $tmp ), 0 );
			if ( is_wp_error( $att_id ) ) {
				@unlink( $tmp );
				$att_id = 0;
			} else {
				update_post_meta( $att_id, 'hansea_source', $file );
			}
		}
		$url  = $att_id ? (string) wp_get_attachment_url( $att_id ) : get_template_directory_uri() . '/elementor/images/' . $file;
		$json = str_replace(
			array( '{{IMG:' . $file . '}}', '"{{IMGID:' . $file . '}}"' ),
			array( esc_url_raw( $url ), $att_id ? (string) (int) $att_id : '""' ),
			$json
		);
	}
	$json = str_replace( '{{THEME}}', esc_url_raw( get_template_directory_uri() . '/elementor' ), $json );
	$data = json_decode( $json, true );
	if ( ! is_array( $data ) ) {
		$done();
		return;
	}

	if ( ! $page_id ) {
		$page_id = wp_insert_post( array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Startseite – neues Design',
			'post_name'    => 'neues-design',
			'post_content' => '',
		) );
	}
	if ( ! $page_id || is_wp_error( $page_id ) ) {
		$done();
		return;
	}

	update_post_meta( $page_id, 'hansea_landing_preview', 1 );
	update_post_meta( $page_id, '_wp_page_template', 'elementor_canvas' );
	update_post_meta( $page_id, '_elementor_edit_mode', 'builder' );
	update_post_meta( $page_id, '_elementor_template_type', 'wp-page' );
	update_post_meta( $page_id, '_elementor_version', defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : '' );
	$encoded = wp_json_encode( $data );
	update_post_meta( $page_id, '_elementor_data', wp_slash( $encoded ) );
	update_post_meta( $page_id, 'hansea_landing_hash', md5( $encoded ) );
	update_post_meta( $page_id, '_elementor_page_settings', array( 'hide_title' => 'yes' ) );
	delete_post_meta( $page_id, '_elementor_css' );

	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	$done();
}, 20 );
