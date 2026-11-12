<?php
/**
 * One-time change on the live landing page, then deletes itself:
 * 1. Removes the dashes (–) from the copy (same replacements as
 *    scripts/dash-replacements.json, used for the redesign).
 * 2. Moves the sponsoring section directly below "Über uns", renames it
 *    "Hansea Invest Sponsoring" (anchor #sponsoring) and adds "Sponsoring"
 *    after "Über uns" in the header and footer navigation.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! did_action( 'elementor/loaded' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_oneoff_sponsoring_lock', time(), '', 'no' ) ) {
		return;
	}

	$pairs   = json_decode( <<<'JSON'
[
 ["Prüfungsverband – ein Modell, das es in Deutschland seit über 150 Jahren gibt.", "Prüfungsverband. Dieses Modell gibt es in Deutschland seit über 150 Jahren."],
 ["In konkreten Häusern – mit Adresse und Fotos.", "In konkreten Häusern, mit Adresse und Fotos."],
 ["Geld vieler Mitglieder – so sind Sie schon ab 10.000 € dabei.", "Geld vieler Mitglieder. So sind Sie schon ab 10.000 € dabei."],
 ["ausgezahlt in vier Raten – nicht garantiert.", "ausgezahlt in vier Raten, aber nicht garantiert."],
 ["Reale Häuser, geprüfte Genossenschaft – und trotzdem eine unternehmerische Beteiligung.", "Reale Häuser, geprüfte Genossenschaft und trotzdem eine unternehmerische Beteiligung."],
 ["sanieren und verkaufen – mit einer angestrebten Verzinsung", "sanieren und verkaufen, mit einer angestrebten Verzinsung"],
 ["Mehrwerte zu schaffen – für unsere Mitglieder", "Mehrwerte zu schaffen: für unsere Mitglieder"],
 ["7&nbsp;% p.a. – jetzt informieren und investieren.", "7&nbsp;% p.a. Jetzt informieren und investieren."],
 ["7 % p.a. – jetzt informieren und investieren.", "7 % p.a. Jetzt informieren und investieren."],
 ["funktionieren – transparent und ohne Verwaltungsaufwand.", "funktionieren: transparent und ohne Verwaltungsaufwand."],
 ["Weiteranlage – 7&nbsp;% p.a. im Rahmen", "Weiteranlage: 7&nbsp;% p.a. im Rahmen"],
 ["Weiteranlage – 7 % p.a. im Rahmen", "Weiteranlage: 7 % p.a. im Rahmen"]
]

JSON
		, true );
	$page_id = (int) get_option( 'page_on_front' );
	$raw     = $page_id ? (string) get_post_meta( $page_id, '_elementor_data', true ) : '';
	$data    = json_decode( $raw, true );

	if ( is_array( $data ) && is_array( $pairs ) ) {
		$untouched = md5( $raw ) === get_post_meta( $page_id, 'hansea_landing_hash', true );

		// 1. Text: every string value in the page data
		$fix = function ( $value ) use ( &$fix, $pairs ) {
			if ( is_array( $value ) ) {
				return array_map( $fix, $value );
			}
			if ( ! is_string( $value ) ) {
				return $value;
			}
			foreach ( $pairs as $pair ) {
				$value = str_replace( $pair[0], $pair[1], $value );
			}
			return $value;
		};
		$data = $fix( $data );

		// Navigation: "Sponsoring" after "Über uns"
		$nav = function ( array $elements ) use ( &$nav ) {
			foreach ( $elements as $i => $el ) {
				if ( 'icon-list' === ( $el['widgetType'] ?? '' ) ) {
					$items = $el['settings']['icon_list'] ?? array();
					$urls  = array_map( function ( $it ) { return $it['link']['url'] ?? ''; }, $items );
					$pos   = array_search( '#ueber-uns', $urls, true );
					if ( false !== $pos && ! in_array( '#sponsoring', $urls, true ) ) {
						$new             = $items[ $pos ];
						$new['_id']      = substr( md5( uniqid( '', true ) ), 0, 7 );
						$new['text']     = 'Sponsoring';
						$new['link']['url'] = '#sponsoring';
						array_splice( $items, $pos + 1, 0, array( $new ) );
						$elements[ $i ]['settings']['icon_list'] = $items;
					}
				}
				if ( ! empty( $el['elements'] ) ) {
					$elements[ $i ]['elements'] = $nav( $el['elements'] );
				}
			}
			return $elements;
		};
		$data = $nav( $data );

		// 2. Sponsoring section: find, rename, move below "Über uns"
		$has_title = function ( $el, $title ) use ( &$has_title ) {
			if ( ( $el['settings']['title'] ?? '' ) === $title ) {
				return true;
			}
			foreach ( (array) ( $el['elements'] ?? array() ) as $child ) {
				if ( $has_title( $child, $title ) ) {
					return true;
				}
			}
			return false;
		};
		$rename = function ( array $el ) use ( &$rename ) {
			if ( ( $el['settings']['title'] ?? '' ) === 'Wir sponsern Ihr Team' ) {
				$el['settings']['title'] = 'Hansea Invest Sponsoring';
			}
			foreach ( (array) ( $el['elements'] ?? array() ) as $k => $child ) {
				$el['elements'][ $k ] = $rename( $child );
			}
			return $el;
		};
		$sponsor = null;
		foreach ( $data as $i => $section ) {
			if ( $has_title( $section, 'Wir sponsern Ihr Team' ) ) {
				$sponsor = $rename( $section );
				$sponsor['settings']['_element_id'] = 'sponsoring';
				array_splice( $data, $i, 1 );
				break;
			}
		}
		if ( $sponsor ) {
			$at = count( $data );
			foreach ( $data as $i => $section ) {
				if ( 'ueber-uns' === ( $section['settings']['_element_id'] ?? '' ) ) {
					$at = $i + 1;
					break;
				}
			}
			array_splice( $data, $at, 0, array( $sponsor ) );
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
	delete_option( 'hansea_oneoff_sponsoring_lock' );
	@unlink( __FILE__ );
}, 20 );
