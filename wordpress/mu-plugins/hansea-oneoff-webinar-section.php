<?php
/**
 * One-time change on the live landing page, then deletes itself: adds a
 * full-width section (anchor #webinar) with the shortcode [hansea_webinar]
 * directly below the hero, before #sportvereine. The section has no padding
 * of its own, so it takes no space once the webinar is over and the
 * shortcode renders nothing (inc/webinar.php). A page that already has the
 * shortcode is not touched. The outcome is kept in the option
 * hansea_oneoff_webinar_section_result.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! did_action( 'elementor/loaded' ) || ! shortcode_exists( 'hansea_webinar' ) ) {
		return; // Elementor or the theme update not there yet: try again on the next request
	}
	if ( ! add_option( 'hansea_oneoff_webinar_section_lock', time(), '', 'no' ) ) {
		return;
	}
	$page_id = (int) get_option( 'page_on_front' );
	$raw     = $page_id ? (string) get_post_meta( $page_id, '_elementor_data', true ) : '';
	$data    = json_decode( $raw, true );
	$note    = 'no Elementor data on the front page';

	if ( is_array( $data ) && false !== strpos( $raw, '[hansea_webinar]' ) ) {
		$note = 'shortcode already on the page, nothing changed';
	} elseif ( is_array( $data ) ) {
		$untouched = md5( $raw ) === get_post_meta( $page_id, 'hansea_landing_hash', true );
		$id        = function () {
			return substr( md5( uniqid( '', true ) ), 0, 7 );
		};
		$zero      = array( 'unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '0', 'left' => '0', 'isLinked' => true );
		$section   = array(
			'id'       => $id(),
			'elType'   => 'container',
			'isInner'  => false,
			'settings' => array(
				'content_width'  => 'full',
				'flex_direction' => 'column',
				'padding'        => $zero,
				'padding_mobile' => $zero,
				'margin'         => $zero,
				'flex_gap'       => array( 'unit' => 'px', 'size' => 0, 'column' => '0', 'row' => '0', 'isLinked' => true ),
				'_element_id'    => 'webinar',
				'css_classes'    => 'hs-webinar-slot',
			),
			'elements' => array(
				array(
					'id'         => $id(),
					'elType'     => 'widget',
					'widgetType' => 'shortcode',
					'settings'   => array( 'shortcode' => '[hansea_webinar]' ),
					'elements'   => array(),
				),
			),
		);
		$at = null;
		foreach ( $data as $i => $el ) {
			if ( 'sportvereine' === ( $el['settings']['_element_id'] ?? '' ) ) {
				$at = $i;
				break;
			}
		}
		if ( null === $at ) {
			$at   = min( 2, count( $data ) ); // fallback: after header and hero
			$note = 'inserted at position 2 (#sportvereine not found)';
		} else {
			$note = 'inserted before #sportvereine';
		}
		array_splice( $data, $at, 0, array( $section ) );

		$encoded = wp_json_encode( $data );
		update_post_meta( $page_id, '_elementor_data', wp_slash( $encoded ) );
		if ( $untouched ) {
			update_post_meta( $page_id, 'hansea_landing_hash', md5( $encoded ) );
		}
		delete_post_meta( $page_id, '_elementor_css' );
		if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
			\Elementor\Plugin::$instance->files_manager->clear_cache();
		}
	}

	update_option( 'hansea_oneoff_webinar_section_result', gmdate( 'c' ) . ' ' . $note, false );
	delete_option( 'hansea_oneoff_webinar_section_lock' );
	@unlink( __FILE__ );
}, 20 );
