<?php
/**
 * Hansea Invest theme.
 *
 * The pages are a React build in dist/ (see vite.wordpress.config.ts in the
 * repository). This theme routes /, /login/ and /mitglieder/ to those
 * bundles, protects the members' area and provides the REST endpoints for
 * registration, login, logout and the lead forms.
 */

defined( 'ABSPATH' ) || exit;

define( 'HANSEA_THEME_VERSION', '1.2.0' );

require_once __DIR__ . '/inc/views.php';
require_once __DIR__ . '/inc/members.php';
require_once __DIR__ . '/inc/rest.php';
require_once __DIR__ . '/inc/leads.php';
require_once __DIR__ . '/inc/elementor.php';
require_once __DIR__ . '/inc/password.php';

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
} );

/**
 * HTML pages must be revalidated: the host's .htaccess default would let
 * browsers keep a page for a week, hiding every edit made in Elementor.
 * Static assets keep their long cache lifetimes.
 */
add_action( 'send_headers', function () {
	if ( is_admin() || headers_sent() ) {
		return;
	}
	header( 'Cache-Control: no-cache, must-revalidate, max-age=0' );
	header_remove( 'Expires' );
} );
