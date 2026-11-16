<?php
/**
 * One-time change, then deletes itself: the Impressum (/impressum/) gets the
 * section "Handels- und Registerangaben" (with the EUID) before "Kontakt",
 * as in the theme's legal/impressum.html; the short register line
 * "Genossenschaftsregister: GnR 1175 / Registergericht: Amtsgericht Hamburg"
 * goes. The rest of the page stays as it is. Skipped if the section is
 * already there or "Kontakt" is not found. The outcome is kept in the option
 * hansea_oneoff_impressum_register_result. (Never write files into
 * mu-plugins: WordPress loads every PHP file there.)
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_impressum_register_lock', time(), '', 'no' ) ) {
		return;
	}
	$block  = '<h2>Handels- und Registerangaben</h2>' . "\n" . '<p><strong>Firma:</strong> Hanseatische Invest eG<br><strong>Rechtsform:</strong> Eingetragene Genossenschaft (eG)<br><strong>Registerart:</strong> Genossenschaftsregister (GnR)<br><strong>Registergericht:</strong> Amtsgericht Hamburg<br><strong>Registernummer:</strong> GnR 1175<br><strong>Europäische Registerkennung (EUID):</strong> DE-GnR-K1101-1175</p>' . "\n" . '';
	$anchor = '<h2>Kontakt</h2>';
	$page   = get_page_by_path( 'impressum', OBJECT, 'page' );
	if ( ! $page ) {
		$note = 'page /impressum/ not found';
	} elseif ( false !== strpos( $page->post_content, 'Handels- und Registerangaben' ) ) {
		$note = 'already there';
	} elseif ( 1 !== substr_count( $page->post_content, $anchor ) ) {
		$note = 'heading Kontakt not found, skipped';
	} else {
		$content = preg_replace( '~<p>\s*Genossenschaftsregister: GnR 1175\s*<br\s*/?>\s*Registergericht: Amtsgericht Hamburg\s*</p>\s*~', '', $page->post_content, 1, $removed );
		$content = str_replace( $anchor, $block . "\n" . $anchor, $content );
		wp_update_post( wp_slash( array( 'ID' => $page->ID, 'post_content' => $content ) ) );
		$note = 'added' . ( $removed ? ', old register line removed' : ', old register line not found (kept page otherwise)' );
	}
	update_option( 'hansea_oneoff_impressum_register_result', gmdate( 'c' ) . ' ' . $note, false );
	delete_option( 'hansea_oneoff_impressum_register_lock' );
	@unlink( __FILE__ );
}, 20 );
