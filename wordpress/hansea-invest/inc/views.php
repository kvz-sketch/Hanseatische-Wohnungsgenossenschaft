<?php
/**
 * Routing and rendering of the React pages.
 */

defined( 'ABSPATH' ) || exit;

const HANSEA_VIEWS = array(
	'home'       => array(
		'entry'       => 'src/main.tsx',
		'title'       => 'Investieren in reale Wohnimmobilien',
		'description' => 'Genossenschaftliche Beteiligung an realen Wohnimmobilien. Unternehmerisch, transparent, nachvollziehbar. Bis zu 7 % p.a. Zielrendite, nicht garantiert.',
	),
	'login'      => array(
		'entry' => 'src/login.tsx',
		'title' => 'Mitglieder-Login',
	),
	'mitglieder' => array(
		'entry' => 'src/mitglieder.tsx',
		'title' => 'Mitgliederbereich',
	),
);

// Bump when the rewrite rules change so they are flushed once.
const HANSEA_REWRITE_VERSION = '1';

add_action( 'init', function () {
	add_rewrite_rule( '^login/?$', 'index.php?hansea_view=login', 'top' );
	add_rewrite_rule( '^mitglieder/?$', 'index.php?hansea_view=mitglieder', 'top' );

	if ( get_option( 'hansea_rewrite_version' ) !== HANSEA_REWRITE_VERSION ) {
		flush_rewrite_rules( false );
		update_option( 'hansea_rewrite_version', HANSEA_REWRITE_VERSION );
	}
} );

add_filter( 'query_vars', function ( $vars ) {
	$vars[] = 'hansea_view';
	return $vars;
} );

/** The view for the current request, or null for regular WordPress content. */
function hansea_current_view() {
	$view = get_query_var( 'hansea_view' );
	if ( $view && isset( HANSEA_VIEWS[ $view ] ) ) {
		return $view;
	}
	return is_front_page() ? 'home' : null;
}

// Access rules: members' area needs a login, the login page doesn't.
add_action( 'template_redirect', function () {
	$view = hansea_current_view();
	if ( 'mitglieder' === $view && ! is_user_logged_in() ) {
		wp_safe_redirect( home_url( '/login/' ) );
		exit;
	}
	if ( 'login' === $view && is_user_logged_in() ) {
		wp_safe_redirect( home_url( '/mitglieder/' ) );
		exit;
	}
	if ( in_array( $view, array( 'login', 'mitglieder' ), true ) ) {
		nocache_headers();
	}
} );

add_filter( 'template_include', function ( $template ) {
	$view = hansea_current_view();
	if ( $view ) {
		hansea_render_view( $view );
		exit;
	}
	return $template;
} );

add_filter( 'document_title_parts', function ( $parts ) {
	$view = hansea_current_view() ?? 'home';
	$parts['title'] = HANSEA_VIEWS[ $view ]['title'];
	return $parts;
} );

// The app has its own header; keep the toolbar off the front end.
add_filter( 'show_admin_bar', function ( $show ) {
	return is_admin() ? $show : false;
} );

/** Vite manifest of the dist/ build. */
function hansea_manifest() {
	static $manifest = null;
	if ( null === $manifest ) {
		$file     = get_template_directory() . '/dist/.vite/manifest.json';
		$manifest = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : array();
	}
	return $manifest;
}

/** CSS files of a manifest chunk and everything it imports. */
function hansea_chunk_css( $key, &$seen = array() ) {
	$manifest = hansea_manifest();
	if ( isset( $seen[ $key ] ) || ! isset( $manifest[ $key ] ) ) {
		return array();
	}
	$seen[ $key ] = true;
	$css          = $manifest[ $key ]['css'] ?? array();
	foreach ( $manifest[ $key ]['imports'] ?? array() as $import ) {
		$css = array_merge( $css, hansea_chunk_css( $import, $seen ) );
	}
	return array_values( array_unique( $css ) );
}

/** Data the React app reads from window.HANSEA. */
function hansea_app_config() {
	return array(
		'restUrl'         => esc_url_raw( rest_url() ),
		'nonce'           => wp_create_nonce( 'wp_rest' ),
		'member'          => is_user_logged_in() ? hansea_member_payload( wp_get_current_user() ) : null,
		'lostPasswordUrl' => wp_lostpassword_url( home_url( '/login/' ) ),
	);
}

function hansea_render_view( $view ) {
	$manifest = hansea_manifest();
	$entry    = HANSEA_VIEWS[ $view ]['entry'];
	$dist     = get_template_directory_uri() . '/dist/';

	// Only our own styles; WordPress block styles would leak into the app.
	add_action( 'wp_enqueue_scripts', function () {
		wp_dequeue_style( 'wp-block-library' );
		wp_dequeue_style( 'global-styles' );
		wp_dequeue_style( 'classic-theme-styles' );
	}, 100 );
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );

	foreach ( hansea_chunk_css( $entry ) as $i => $css ) {
		wp_enqueue_style( 'hansea-' . $view . '-' . $i, $dist . $css, array(), null );
	}
	?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#141a46">
	<?php if ( ! empty( HANSEA_VIEWS[ $view ]['description'] ) ) : ?>
	<meta name="description" content="<?php echo esc_attr( HANSEA_VIEWS[ $view ]['description'] ); ?>">
	<?php else : ?>
	<meta name="robots" content="noindex">
	<?php endif; ?>
	<link rel="icon" href="<?php echo esc_url( $dist . 'favicon.ico' ); ?>" sizes="32x32">
	<link rel="icon" type="image/svg+xml" href="<?php echo esc_url( $dist . 'icon.svg' ); ?>">
	<?php wp_head(); ?>
	<script>window.HANSEA = <?php echo wp_json_encode( hansea_app_config() ); ?>;</script>
	<?php if ( isset( $manifest[ $entry ]['file'] ) ) : ?>
	<script type="module" src="<?php echo esc_url( $dist . $manifest[ $entry ]['file'] ); ?>"></script>
	<?php endif; ?>
</head>
<body <?php body_class( 'hansea-' . $view ); ?>>
	<?php wp_body_open(); ?>
	<div id="root"></div>
	<?php if ( empty( $manifest ) ) : ?>
	<p style="font-family:sans-serif;padding:2rem">Das Theme ist installiert, aber der Build in <code>dist/</code> fehlt.</p>
	<?php endif; ?>
	<?php wp_footer(); ?>
</body>
</html>
	<?php
}
