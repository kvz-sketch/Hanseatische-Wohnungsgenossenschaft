<?php
/**
 * One-time import of the Hansea Invest landing page into Elementor.
 *
 * Waits until Elementor is active, then: imports the landing images into the
 * media library, creates the "Startseite" page from the theme's
 * elementor/landing.json (Elementor Canvas template), makes it the front
 * page, sets the brand colors and fonts in the Elementor kit, turns off
 * Elementor's default colors/fonts and Google Fonts (the theme self-hosts
 * them), and deletes itself.
 *
 * Re-running with a newer landing.json updates the page only while it is
 * still exactly what the last import wrote; once someone edits it in
 * Elementor, their version is kept.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! did_action( 'elementor/loaded' ) ) {
		return; // try again on the next request
	}
	// One import at a time if two first requests arrive together
	if ( ! add_option( 'hansea_landing_import_lock', time(), '', 'no' ) ) {
		if ( time() - (int) get_option( 'hansea_landing_import_lock' ) < 120 ) {
			return;
		}
		update_option( 'hansea_landing_import_lock', time(), 'no' );
	}

	$existing = get_posts( array(
		'post_type'   => 'page',
		'post_status' => 'any',
		'meta_key'    => 'hansea_landing',
		'numberposts' => 1,
		'fields'      => 'ids',
	) );

	$page_id   = $existing ? (int) $existing[0] : 0;
	$hash      = $page_id ? (string) get_post_meta( $page_id, 'hansea_landing_hash', true ) : '';
	// The very first import stored no fingerprint; treat it as unedited.
	$untouched = $page_id && ( '' === $hash || md5( (string) get_post_meta( $page_id, '_elementor_data', true ) ) === $hash );

	if ( ! $page_id || $untouched ) {
		$dir  = get_template_directory() . '/elementor';
		$json = (string) @file_get_contents( $dir . '/landing.json' );
		if ( '' === $json ) {
			delete_option( 'hansea_landing_import_lock' );
			return;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		// Import each referenced image once; reuse earlier imports.
		preg_match_all( '/\{\{IMG:([^}]+)\}\}/', $json, $m );
		foreach ( array_unique( $m[1] ) as $file ) {
			$found = get_posts( array(
				'post_type'   => 'attachment',
				'meta_key'    => 'hansea_source',
				'meta_value'  => $file,
				'numberposts' => 1,
				'fields'      => 'ids',
			) );
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
			delete_option( 'hansea_landing_import_lock' );
			return;
		}

		if ( ! $page_id ) {
			$page_id = wp_insert_post( array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => 'Startseite',
				'post_name'    => 'startseite',
				'post_content' => '',
			) );
		}
		if ( ! $page_id || is_wp_error( $page_id ) ) {
			delete_option( 'hansea_landing_import_lock' );
			return;
		}

		update_post_meta( $page_id, 'hansea_landing', 1 );
		update_post_meta( $page_id, '_wp_page_template', 'elementor_canvas' );
		update_post_meta( $page_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $page_id, '_elementor_template_type', 'wp-page' );
		update_post_meta( $page_id, '_elementor_version', defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : '' );
		$encoded = wp_json_encode( $data );
		update_post_meta( $page_id, '_elementor_data', wp_slash( $encoded ) );
		update_post_meta( $page_id, 'hansea_landing_hash', md5( $encoded ) );
		delete_post_meta( $page_id, '_elementor_css' ); // regenerate the page's CSS
		update_post_meta( $page_id, '_elementor_page_settings', array( 'hide_title' => 'yes' ) );

		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $page_id );
	}

	// Brand defaults for anything the team builds in Elementor
	update_option( 'elementor_disable_color_schemes', 'yes' );
	update_option( 'elementor_disable_typography_schemes', 'yes' );
	update_option( 'elementor_google_font', '0' );

	$kit_id = (int) get_option( 'elementor_active_kit' );
	if ( $kit_id ) {
		$settings = get_post_meta( $kit_id, '_elementor_page_settings', true );
		$settings = is_array( $settings ) ? $settings : array();
		$settings['system_colors'] = array(
			array( '_id' => 'primary', 'title' => 'Navy', 'color' => '#141A46' ),
			array( '_id' => 'secondary', 'title' => 'Gold', 'color' => '#DDB851' ),
			array( '_id' => 'text', 'title' => 'Text', 'color' => '#2A2F52' ),
			array( '_id' => 'accent', 'title' => 'Koralle', 'color' => '#F97768' ),
		);
		$settings['custom_colors'] = array(
			array( '_id' => 'hsgold7', 'title' => 'Gold dunkel', 'color' => '#A9863A' ),
			array( '_id' => 'hsgold4', 'title' => 'Gold hell', 'color' => '#E6C978' ),
			array( '_id' => 'hsgrey', 'title' => 'Hellgrau', 'color' => '#F5F5F5' ),
			array( '_id' => 'hscream', 'title' => 'Creme', 'color' => '#FBF6E7' ),
		);
		$settings['system_typography'] = array(
			array( '_id' => 'primary', 'title' => 'Überschrift', 'typography_typography' => 'custom', 'typography_font_family' => 'Cormorant Garamond', 'typography_font_weight' => '400' ),
			array( '_id' => 'secondary', 'title' => 'Unterzeile', 'typography_typography' => 'custom', 'typography_font_family' => 'Inter', 'typography_font_weight' => '600' ),
			array( '_id' => 'text', 'title' => 'Fließtext', 'typography_typography' => 'custom', 'typography_font_family' => 'Inter', 'typography_font_weight' => '400' ),
			array( '_id' => 'accent', 'title' => 'Button', 'typography_typography' => 'custom', 'typography_font_family' => 'Inter', 'typography_font_weight' => '600' ),
		);
		$settings['container_width'] = array( 'unit' => 'px', 'size' => 1180, 'sizes' => array() );
		update_post_meta( $kit_id, '_elementor_page_settings', $settings );
	}

	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}

	delete_option( 'hansea_landing_import_lock' );
	@unlink( __FILE__ );
}, 20 );
