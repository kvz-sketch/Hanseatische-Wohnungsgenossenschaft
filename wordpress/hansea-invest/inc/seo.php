<?php
/**
 * Search engines and link previews for the public pages (front page and the
 * legal pages): meta description, Open Graph / Twitter tags and the
 * Organization data Google shows for the company. The React views print
 * their own description (inc/views.php); the members' area stays noindex.
 *
 * Old addresses of the previous Wix site that Google still knows redirect
 * permanently to their new pages.
 */

defined( 'ABSPATH' ) || exit;

const HANSEA_SEO_DESCRIPTIONS = array(
	'front'             => 'Genossenschaftliche Beteiligung an realen Wohnimmobilien. Unternehmerisch, transparent, nachvollziehbar. Bis zu 7 % p.a. Zielrendite, nicht garantiert.',
	'impressum'         => 'Impressum der Hanseatische Invest eG, Langenhorner Chaussee 155, 22415 Hamburg. Amtsgericht Hamburg, GnR 1175.',
	'datenschutz'       => 'Datenschutzerklärung der Hanseatische Invest eG: welche Daten wir verarbeiten, wozu und welche Rechte Sie haben.',
	'cookie-richtlinie' => 'Cookie-Richtlinie der Hanseatische Invest eG: welche Cookies die Website verwendet und wie Sie Ihre Einwilligung ändern.',
);

/** Old Wix paths (without trailing slash) => new path. */
const HANSEA_OLD_URLS = array(
	'/privacy-policy'   => '/impressum/',
	'/privacy-policy-1' => '/datenschutz/',
);

/** Key into HANSEA_SEO_DESCRIPTIONS for the current request, or null. */
function hansea_seo_page() {
	if ( function_exists( 'hansea_current_view' ) && hansea_current_view() ) {
		return null; // React views handle their own head
	}
	if ( is_front_page() ) {
		return 'front';
	}
	$slug = is_page() ? get_post_field( 'post_name', get_queried_object_id() ) : '';
	return isset( HANSEA_SEO_DESCRIPTIONS[ $slug ] ) ? $slug : null;
}

add_action( 'wp_head', function () {
	$page = hansea_seo_page();
	if ( ! $page ) {
		return;
	}
	$description = HANSEA_SEO_DESCRIPTIONS[ $page ];
	$url         = 'front' === $page ? home_url( '/' ) : get_permalink();
	$title       = wp_get_document_title();
	$image       = get_template_directory_uri() . '/elementor/images/og-hanseainvest.jpg';
	$tags        = array(
		array( 'name', 'description', $description ),
		array( 'property', 'og:type', 'website' ),
		array( 'property', 'og:locale', 'de_DE' ),
		array( 'property', 'og:site_name', 'Hanseatische Invest eG' ),
		array( 'property', 'og:title', $title ),
		array( 'property', 'og:description', $description ),
		array( 'property', 'og:url', $url ),
		array( 'property', 'og:image', $image ),
		array( 'property', 'og:image:width', '1200' ),
		array( 'property', 'og:image:height', '630' ),
		array( 'name', 'twitter:card', 'summary_large_image' ),
	);
	foreach ( $tags as list( $attr, $key, $value ) ) {
		printf( "<meta %s=\"%s\" content=\"%s\">\n", $attr, esc_attr( $key ), esc_attr( $value ) );
	}
	if ( 'front' === $page ) {
		$org = array(
			'@context'  => 'https://schema.org',
			'@type'     => 'Organization',
			'name'      => 'Hanseatische Invest eG',
			'legalName' => 'Hanseatische Invest eG',
			'url'       => home_url( '/' ),
			'logo'      => get_template_directory_uri() . '/elementor/images/logo-hanseainvest-600.png',
			'email'     => 'mitgliederservice@hanseainvest.de',
			'address'   => array(
				'@type'           => 'PostalAddress',
				'streetAddress'   => 'Langenhorner Chaussee 155',
				'postalCode'      => '22415',
				'addressLocality' => 'Hamburg',
				'addressCountry'  => 'DE',
			),
		);
		echo '<script type="application/ld+json">' . wp_json_encode( $org, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
	}
}, 2 );

// Old Wix addresses: permanent redirect instead of "not found".
add_action( 'template_redirect', function () {
	if ( ! is_404() ) {
		return;
	}
	$path = untrailingslashit( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ) );
	if ( isset( HANSEA_OLD_URLS[ $path ] ) ) {
		wp_safe_redirect( home_url( HANSEA_OLD_URLS[ $path ] ), 301 );
		exit;
	}
}, 1 );
