<?php
/**
 * One-time change, then deletes itself: sets the Google Analytics 4
 * measurement ID (Einstellungen → Google Analytics). GA loads only after a
 * visitor accepts the consent banner (inc/analytics.php).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	update_option( 'hansea_ga_id', 'G-2VLDBCG7FD' );
	@unlink( __FILE__ );
} );
