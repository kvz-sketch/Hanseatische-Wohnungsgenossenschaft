<?php
/**
 * One-time change, then deletes itself: two additions to the live
 * Datenschutzerklärung (page /datenschutz/), as in the theme's
 * legal/datenschutz.html:
 * - Hosting: the servers are in an EU data centre (Frankfurt am Main).
 * - New section "Zugriffsschutz und Zwei-Faktor-Anmeldung".
 * Only the exact passages are changed, so edits made in wp-admin elsewhere in
 * the page stay. If a passage has been edited, that change is skipped. The
 * outcome is kept in the option hansea_oneoff_datenschutz_result. (Never write
 * files into mu-plugins: WordPress loads every PHP file there.)
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_datenschutz_lock', time(), '', 'no' ) ) {
		return;
	}
	$page = get_page_by_path( 'datenschutz', OBJECT, 'page' );
	$done = array();
	if ( $page ) {
		$content = $page->post_content;
		$changes = array(
			'hosting'     => array(
				'gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden,',
				'gehostet. Die Server stehen in einem Rechenzentrum in der Europäischen Union (Frankfurt am Main, Deutschland). Die personenbezogenen Daten, die auf dieser Website erfasst werden,',
			),
			'zwei-faktor' => array(
				'<h3>Widerspruch gegen Werbe-E-Mails</h3>',
				"<h3>Zugriffsschutz und Zwei-Faktor-Anmeldung</h3>\n<p>Auf die Daten unserer Mitglieder haben nur die damit betrauten Mitarbeiterinnen und Mitarbeiter sowie Vorstand und Aufsichtsrat der Genossenschaft Zugriff. Ihre Anmeldung ist durch eine Zwei-Faktor-Authentifizierung geschützt: Neben dem Passwort ist ein zeitbasierter Einmalcode aus einer Authenticator-App nötig. Bankverbindung, Steuer-Identifikationsnummer und Dokumente wie die Beitrittserklärung speichern wir zusätzlich verschlüsselt. Zugriffe auf diese Daten werden protokolliert.</p>\n<h3>Widerspruch gegen Werbe-E-Mails</h3>",
			),
		);
		foreach ( $changes as $key => list( $old, $new ) ) {
			if ( false !== strpos( $content, $new ) ) {
				$done[] = $key . ': already there';
			} elseif ( 1 === substr_count( $content, $old ) ) {
				$content = str_replace( $old, $new, $content );
				$done[]  = $key . ': changed';
			} else {
				$done[] = $key . ': passage not found, skipped';
			}
		}
		if ( $content !== $page->post_content ) {
			wp_update_post( wp_slash( array( 'ID' => $page->ID, 'post_content' => $content ) ) );
		}
	} else {
		$done[] = 'page /datenschutz/ not found';
	}
	update_option( 'hansea_oneoff_datenschutz_result', gmdate( 'c' ) . ' ' . implode( '; ', $done ), false );
	delete_option( 'hansea_oneoff_datenschutz_lock' );
	@unlink( __FILE__ );
}, 20 );
