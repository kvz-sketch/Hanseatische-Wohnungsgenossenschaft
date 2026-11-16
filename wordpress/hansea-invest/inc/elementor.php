<?php
/**
 * Elementor support: brand fonts and styles on Elementor pages, and the
 * [hansea_kontakt] contact form (the HubSpot embed).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {
	if ( hansea_current_view() ) {
		return; // React pages bring their own styles
	}
	wp_enqueue_style(
		'hansea-elementor',
		get_template_directory_uri() . '/elementor/hansea-elementor.css',
		array(),
		HANSEA_THEME_VERSION
	);
	if ( ! hansea_motion_enabled() ) {
		return;
	}
	wp_enqueue_script(
		'hansea-motion',
		get_template_directory_uri() . '/elementor/hansea-motion.js',
		array(),
		HANSEA_THEME_VERSION,
		array( 'in_footer' => true )
	);
} );

/** The design preview page stays out of search engines. */
add_filter( 'wp_robots', function ( $robots ) {
	if ( is_singular( 'page' ) && get_post_meta( get_queried_object_id(), 'hansea_landing_preview', true ) ) {
		$robots['noindex']  = true;
		$robots['nofollow'] = true;
	}
	return $robots;
} );

/** Scroll animations run on the public pages, not in the Elementor editor or its preview. */
function hansea_motion_enabled() {
	return ! hansea_current_view() && ! is_admin() && ! isset( $_GET['elementor-preview'] ) && ! isset( $_GET['elementor_library'] );
}

/**
 * Turn the animations on before the page paints (so content doesn't flash),
 * unless the visitor prefers reduced motion. If the script hasn't run after
 * 2.5 s (blocked, failed), everything is shown.
 */
add_action( 'wp_head', function () {
	if ( ! hansea_motion_enabled() ) {
		return;
	}
	echo "<script>(function(d){if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('hs-motion');setTimeout(function(){if(!window.hsMotionReady)d.classList.remove('hs-motion')},2500)})(document.documentElement)</script>\n";
}, 1 );

/** HubSpot form behind the [hansea_kontakt] contact section. */
const HANSEA_HUBSPOT_FORM = array(
	'portal' => '19607021',
	'form'   => '267d631e-8b36-4e15-bcfe-e5ba855ad77e',
	'region' => 'na1',
);

/** Contact form: the HubSpot embed (submissions land in HubSpot, not under "Anfragen"). */
add_shortcode( 'hansea_kontakt', function () {
	wp_enqueue_script(
		'hansea-hubspot-form',
		'https://js.hsforms.net/forms/embed/' . HANSEA_HUBSPOT_FORM['portal'] . '.js',
		array(),
		null,
		array( 'in_footer' => true, 'strategy' => 'defer' )
	);
	return sprintf(
		'<div class="hs-kontakt"><div class="hs-form-frame" data-region="%s" data-form-id="%s" data-portal-id="%s"></div></div>',
		esc_attr( HANSEA_HUBSPOT_FORM['region'] ),
		esc_attr( HANSEA_HUBSPOT_FORM['form'] ),
		esc_attr( HANSEA_HUBSPOT_FORM['portal'] )
	);
} );
