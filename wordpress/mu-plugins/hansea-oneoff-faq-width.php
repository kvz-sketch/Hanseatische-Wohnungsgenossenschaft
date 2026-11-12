<?php
/**
 * One-time change, then deletes itself: the FAQ section of the live landing
 * page uses the full content width (1180px) like the other sections and is
 * aligned left instead of a centred 860px column; questions and answers get
 * 24px inner padding. Only the FAQ section is touched.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! did_action( 'elementor/loaded' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_oneoff_faq_lock', time(), '', 'no' ) ) {
		return;
	}

	$page_id = (int) get_option( 'page_on_front' );
	$raw     = $page_id ? (string) get_post_meta( $page_id, '_elementor_data', true ) : '';
	$data    = json_decode( $raw, true );

	if ( is_array( $data ) ) {
		$untouched = md5( $raw ) === get_post_meta( $page_id, 'hansea_landing_hash', true );
		foreach ( $data as $i => $section ) {
			if ( 'faq' !== ( $section['settings']['_element_id'] ?? '' ) ) {
				continue;
			}
			unset( $data[ $i ]['settings']['flex_align_items'] ); // was: centre the column
			foreach ( $data[ $i ]['elements'] as $j => $col ) {
				// The 860px column becomes full width
				$data[ $i ]['elements'][ $j ]['settings']['width']        = array( 'unit' => '%', 'size' => 100, 'sizes' => array() );
				$data[ $i ]['elements'][ $j ]['settings']['width_mobile'] = array( 'unit' => '%', 'size' => 100, 'sizes' => array() );
				foreach ( (array) ( $col['elements'] ?? array() ) as $k => $el ) {
					if ( 'accordion' === ( $el['widgetType'] ?? '' ) ) {
						$pad = function ( $t, $r, $b, $l ) {
							return array( 'unit' => 'px', 'top' => "$t", 'right' => "$r", 'bottom' => "$b", 'left' => "$l", 'isLinked' => false );
						};
						$data[ $i ]['elements'][ $j ]['elements'][ $k ]['settings']['title_padding']   = $pad( 22, 24, 22, 24 );
						$data[ $i ]['elements'][ $j ]['elements'][ $k ]['settings']['content_padding'] = $pad( 0, 24, 24, 24 );
					}
				}
			}
		}
		$encoded = wp_json_encode( $data );
		update_post_meta( $page_id, '_elementor_data', wp_slash( $encoded ) );
		if ( $untouched ) {
			update_post_meta( $page_id, 'hansea_landing_hash', md5( $encoded ) );
		}
		delete_post_meta( $page_id, '_elementor_css' );
	}

	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	delete_option( 'hansea_oneoff_faq_lock' );
	@unlink( __FILE__ );
}, 20 );
