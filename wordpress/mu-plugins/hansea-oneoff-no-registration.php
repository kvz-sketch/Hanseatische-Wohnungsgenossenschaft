<?php
/**
 * One-time change, then deletes itself: removes the "Konto erstellen" link
 * from the footer of the Elementor landing page (members no longer register
 * themselves; the team creates accounts and sends a welcome email). Only that
 * list item is touched, other edits stay as they are.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! did_action( 'elementor/loaded' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_oneoff_noreg_lock', time(), '', 'no' ) ) {
		return;
	}

	$pages = get_posts( array( 'post_type' => 'page', 'meta_key' => 'hansea_landing', 'numberposts' => 1, 'fields' => 'ids' ) );
	if ( $pages ) {
		$page_id   = (int) $pages[0];
		$raw       = (string) get_post_meta( $page_id, '_elementor_data', true );
		$untouched = md5( $raw ) === get_post_meta( $page_id, 'hansea_landing_hash', true );
		$data      = json_decode( $raw, true );

		$strip = function ( array $elements ) use ( &$strip ) {
			foreach ( $elements as $i => $el ) {
				if ( ( $el['widgetType'] ?? '' ) === 'icon-list' && ! empty( $el['settings']['icon_list'] ) ) {
					$elements[ $i ]['settings']['icon_list'] = array_values( array_filter(
						$el['settings']['icon_list'],
						function ( $item ) {
							return 'Konto erstellen' !== ( $item['text'] ?? '' );
						}
					) );
				}
				if ( ! empty( $el['elements'] ) ) {
					$elements[ $i ]['elements'] = $strip( $el['elements'] );
				}
			}
			return $elements;
		};

		if ( is_array( $data ) ) {
			$encoded = wp_json_encode( $strip( $data ) );
			update_post_meta( $page_id, '_elementor_data', wp_slash( $encoded ) );
			if ( $untouched ) {
				update_post_meta( $page_id, 'hansea_landing_hash', md5( $encoded ) );
			}
			delete_post_meta( $page_id, '_elementor_css' );
		}
	}

	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	delete_option( 'hansea_oneoff_noreg_lock' );
	@unlink( __FILE__ );
}, 20 );
