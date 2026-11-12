<?php
/**
 * One-time changes, then deletes itself:
 * 1. Header of the Elementor landing page: the gold button becomes
 *    "Mitglieder-Login" (→ /login/); the separate login text button goes.
 *    Only the header container is touched, other edits stay as they are.
 * 2. Creates the member account for Kai Raila (subscriber, no email sent).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! did_action( 'elementor/loaded' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_oneoff_login_lock', time(), '', 'no' ) ) {
		return;
	}

	// 1. Header button
	$pages = get_posts( array( 'post_type' => 'page', 'meta_key' => 'hansea_landing', 'numberposts' => 1, 'fields' => 'ids' ) );
	if ( $pages ) {
		$page_id   = (int) $pages[0];
		$raw       = (string) get_post_meta( $page_id, '_elementor_data', true );
		$untouched = md5( $raw ) === get_post_meta( $page_id, 'hansea_landing_hash', true );
		$data      = json_decode( $raw, true );

		$edit_header = function ( array $elements ) use ( &$edit_header ) {
			$out = array();
			foreach ( $elements as $el ) {
				$is_button = ( $el['widgetType'] ?? '' ) === 'button';
				$text      = $el['settings']['text'] ?? '';
				if ( $is_button && 'Mitglieder-Login' === $text && ( $el['settings']['background_color'] ?? '' ) === 'transparent' ) {
					continue; // drop the separate text button
				}
				if ( $is_button && 'Jetzt informieren' === $text ) {
					$el['settings']['text']        = 'Mitglieder-Login';
					$el['settings']['link']['url'] = '/login/';
				}
				if ( ! empty( $el['elements'] ) ) {
					$el['elements'] = $edit_header( $el['elements'] );
				}
				$out[] = $el;
			}
			return $out;
		};

		if ( is_array( $data ) ) {
			foreach ( $data as $i => $section ) {
				if ( false !== strpos( (string) ( $section['settings']['css_classes'] ?? '' ), 'hs-header' ) ) {
					$data[ $i ]['elements'] = $edit_header( $section['elements'] );
				}
			}
			$encoded = wp_json_encode( $data );
			update_post_meta( $page_id, '_elementor_data', wp_slash( $encoded ) );
			if ( $untouched ) {
				update_post_meta( $page_id, 'hansea_landing_hash', md5( $encoded ) );
			}
			delete_post_meta( $page_id, '_elementor_css' );
		}
	}

	// 2. Member account
	$email = 'kr@gerlachgroup.de';
	if ( ! email_exists( $email ) ) {
		do {
			$login = 'mitglied_' . strtolower( wp_generate_password( 10, false, false ) );
		} while ( username_exists( $login ) );
		wp_insert_user( array(
			'user_login'   => $login,
			'user_email'   => $email,
			'user_pass'    => wp_generate_password( 32, true, true ),
			'first_name'   => 'Kai',
			'last_name'    => 'Raila',
			'display_name' => 'Kai Raila',
			'role'         => 'subscriber',
		) );
	}

	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	delete_option( 'hansea_oneoff_login_lock' );
	@unlink( __FILE__ );
}, 20 );
