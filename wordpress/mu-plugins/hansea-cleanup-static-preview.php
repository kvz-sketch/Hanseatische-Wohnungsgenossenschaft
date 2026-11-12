<?php
/**
 * One-time cleanup: removes the files a static preview deploy left in the web
 * root (they would shadow the theme's /login/ and /mitglieder/ routes), then
 * deletes itself. Only removes entries that match that build.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	$root    = untrailingslashit( ABSPATH );
	$is_ours = static function ( $file, $needle ) {
		return is_file( $file ) && false !== strpos( (string) file_get_contents( $file ), $needle );
	};
	$rmtree  = static function ( $dir ) use ( &$rmtree ) {
		if ( ! is_dir( $dir ) || is_link( $dir ) ) {
			return;
		}
		foreach ( array_diff( scandir( $dir ), array( '.', '..' ) ) as $entry ) {
			$path = $dir . '/' . $entry;
			is_dir( $path ) && ! is_link( $path ) ? $rmtree( $path ) : unlink( $path );
		}
		rmdir( $dir );
	};

	if ( $is_ours( $root . '/login/index.html', '/src/login.tsx' ) || $is_ours( $root . '/login/index.html', 'Mitglieder-Login' ) ) {
		$rmtree( $root . '/login' );
	}
	if ( $is_ours( $root . '/mitglieder/index.html', 'Mitgliederbereich' ) ) {
		$rmtree( $root . '/mitglieder' );
	}
	if ( $is_ours( $root . '/index.html', 'Hanseatische Invest eG' ) ) {
		unlink( $root . '/index.html' );
	}
	if ( is_dir( $root . '/assets' ) && glob( $root . '/assets/main-*.js' ) ) {
		$rmtree( $root . '/assets' );
	}
	if ( is_file( $root . '/video/hansea-erklaerfilm.mp4' ) ) {
		$rmtree( $root . '/video' );
	}
	foreach ( array( 'icon.svg', 'site.zip' ) as $file ) {
		if ( is_file( $root . '/' . $file ) ) {
			unlink( $root . '/' . $file );
		}
	}

	unlink( __FILE__ );
} );
