<?php
/**
 * Hansea Invest theme.
 *
 * The pages are a React build in dist/ (see vite.wordpress.config.ts in the
 * repository). This theme routes /, /login/ and /mitglieder/ to those
 * bundles, protects the members' area and provides the REST endpoints for
 * login, logout, the lead forms and the membership declaration (DocuSign).
 */

defined( 'ABSPATH' ) || exit;

define( 'HANSEA_THEME_VERSION', '1.10.10' );

require_once __DIR__ . '/inc/views.php';
require_once __DIR__ . '/inc/members.php';
require_once __DIR__ . '/inc/rest.php';
require_once __DIR__ . '/inc/leads.php';
require_once __DIR__ . '/inc/elementor.php';
require_once __DIR__ . '/inc/password.php';
require_once __DIR__ . '/inc/email.php';
require_once __DIR__ . '/inc/welcome.php';
require_once __DIR__ . '/inc/docusign.php';
require_once __DIR__ . '/inc/beitritt.php';
require_once __DIR__ . '/inc/analytics.php';

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
} );

// Impressum, Datenschutz, Cookie-Richtlinie (template "Rechtliches")
add_action( 'wp_enqueue_scripts', function () {
	if ( is_page_template( 'templates/legal.php' ) ) {
		wp_enqueue_style( 'hansea-legal', get_template_directory_uri() . '/legal.css', array( 'hansea-elementor' ), HANSEA_THEME_VERSION );
	}
}, 20 );

// Browser-tab titles: "Seite | Hanseatische Invest eG" (no dash)
add_filter( 'document_title_separator', function () {
	return '|';
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

/**
 * No blog: posts, archives, feeds and search lead to the landing page, so
 * WordPress's default post list can never show up instead of the site.
 */
add_action( 'template_redirect', function () {
	if ( is_admin() || hansea_current_view() ) {
		return;
	}
	if ( is_singular( 'post' ) || is_archive() || is_search() || is_feed() || ( is_home() && ! is_front_page() ) || is_paged() ) {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
}, 5 );

