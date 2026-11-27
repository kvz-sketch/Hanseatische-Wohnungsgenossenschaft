<?php
/**
 * One-time update, then deletes itself: the Meta-Pixel on the Leitfaden pages
 * (hanseainvest.de/leitfaden/) in the live Cookie-Richtlinie and
 * Datenschutzerklärung, the same text as in the theme's legal/ folder. Each
 * change replaces one exact passage; a passage that was edited in wp-admin is
 * left as it is (and noted). A page that already mentions the Meta-Pixel is
 * not touched. The outcome is kept in hansea_oneoff_legal_meta_pixel_result.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_legal_meta_pixel_lock', time(), '', 'no' ) ) {
		return;
	}
	$pairs = json_decode( <<<'JSON'
{
 "cookie-richtlinie": [
  [
   "Marketing- oder Tracking-Cookies für Werbung setzen wir nicht ein.",
   "Marketing-Cookies (Meta-Pixel) setzen wir nur auf den Seiten unseres Leitfadens (hanseainvest.de/leitfaden/) und nur, wenn Sie dort zustimmen."
  ],
  [
   "<h3>Marketing-Cookies</h3>\n<p>Wir verwenden keine Marketing- oder Tracking-Cookies für Werbung.</p>",
   "<h3>Marketing-Cookies (nur mit Ihrer Zustimmung, nur auf den Leitfaden-Seiten)</h3>\n<p>Auf den Seiten unseres Leitfadens (hanseainvest.de/leitfaden/) nutzen wir mit Ihrer Zustimmung den Meta-Pixel der Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland. Damit messen wir, wie viele Besucherinnen und Besucher über unsere Anzeigen auf Facebook und Instagram auf die Seite kommen und den Leitfaden anfordern, und steuern unsere Anzeigen entsprechend aus. Ohne Zustimmung wird der Meta-Pixel nicht geladen. Rechtsgrundlage ist Ihre Einwilligung (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). Auf allen anderen Seiten von hanseainvest.de setzen wir keine Marketing-Cookies.</p>\n<table class=\"hs-legal-table\">\n<thead><tr><th>Name</th><th>Zweck</th><th>Speicherdauer</th></tr></thead>\n<tbody>\n<tr><td>_fbp</td><td>Unterscheidet Besucherinnen und Besucher für die Erfolgsmessung von Anzeigen (Meta)</td><td>3 Monate</td></tr>\n<tr><td>_fbc</td><td>Speichert den Klick auf eine Anzeige, wenn Sie über eine Anzeige kommen (Meta)</td><td>3 Monate</td></tr>\n</tbody>\n</table>"
  ],
  [
   "<tr><td>hansea_consent</td><td>Speichert Ihre Auswahl im Cookie-Hinweis</td><td>12 Monate</td></tr>",
   "<tr><td>hansea_consent</td><td>Speichert Ihre Auswahl im Cookie-Hinweis</td><td>12 Monate</td></tr>\n<tr><td>hansea_marketing</td><td>Speichert Ihre Auswahl im Cookie-Hinweis der Leitfaden-Seiten</td><td>12 Monate</td></tr>"
  ],
  [
   "Bei einem Widerruf löschen wir die Statistik-Cookies auf Ihrem Gerät.",
   "Bei einem Widerruf löschen wir die Statistik- bzw. Marketing-Cookies auf Ihrem Gerät."
  ],
  [
   "Stand: Oktober 2026",
   "Stand: November 2026"
  ]
 ],
 "datenschutz": [
  [
   "\n<h2>7. Eingebundene Inhalte und externe Links</h2>",
   "\n<h3>Meta-Pixel (nur auf den Leitfaden-Seiten)</h3>\n<p>Auf den Seiten unseres Leitfadens (hanseainvest.de/leitfaden/) nutzen wir, wenn Sie zustimmen, den Meta-Pixel. Anbieter ist die Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland („Meta“).</p>\n<p>Der Meta-Pixel teilt Meta mit, dass Sie eine Leitfaden-Seite aufgerufen und nach dem Absenden des Formulars die Seite mit dem Leitfaden erreicht haben. Dabei werden Ihre IP-Adresse, Angaben zu Browser und Gerät, die aufgerufene Seite und Cookie-Kennungen übertragen. Meta kann diese Daten Ihrem Facebook- oder Instagram-Konto zuordnen, wenn Sie dort angemeldet sind. Wir nutzen die Auswertungen, um den Erfolg unserer Anzeigen zu messen und sie gezielter auszuspielen. Die Angaben aus dem Formular selbst erhält Meta über den Pixel nicht.</p>\n<p>Für die Erhebung und Übermittlung der Daten an Meta sind wir und Meta gemeinsam verantwortlich (Art. 26 DSGVO); die Vereinbarung dazu finden Sie unter <a href=\"https://www.facebook.com/legal/controller_addendum\" target=\"_blank\" rel=\"noopener\">https://www.facebook.com/legal/controller_addendum</a>. Für die weitere Verarbeitung ist Meta allein verantwortlich. Die Daten können in die USA übertragen werden; Meta ist nach dem EU-US Data Privacy Framework zertifiziert.</p>\n<p>Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Ohne Ihre Zustimmung wird der Meta-Pixel nicht geladen. Sie können Ihre Einwilligung jederzeit über „Cookie-Einstellungen“ am Ende der Leitfaden-Seiten widerrufen. Mehr zum Datenschutz bei Meta: <a href=\"https://www.facebook.com/privacy/policy/\" target=\"_blank\" rel=\"noopener\">https://www.facebook.com/privacy/policy/</a>.</p>\n\n<h2>7. Eingebundene Inhalte und externe Links</h2>"
  ],
  [
   "<h2>6. Analyse</h2>",
   "<h2>6. Analyse und Erfolgsmessung von Anzeigen</h2>"
  ],
  [
   "Stand: Oktober 2026",
   "Stand: November 2026"
  ]
 ]
}
JSON
		, true );
	$notes = array();
	foreach ( (array) $pairs as $slug => $list ) {
		$page = get_page_by_path( $slug, OBJECT, 'page' );
		if ( ! $page ) {
			$notes[] = "$slug: page not found";
			continue;
		}
		$content = $page->post_content;
		if ( false !== strpos( $content, 'Meta-Pixel' ) ) {
			$notes[] = "$slug: already mentions the Meta-Pixel";
			continue;
		}
		$done = 0;
		foreach ( $list as $pair ) {
			if ( 1 === substr_count( $content, $pair[0] ) ) {
				$content = str_replace( $pair[0], $pair[1], $content );
				$done++;
			} else {
				$notes[] = "$slug: passage not found: " . mb_substr( $pair[0], 0, 40 );
			}
		}
		if ( $done ) {
			kses_remove_filters(); // keep tables and link attributes as written
			wp_update_post( array( 'ID' => $page->ID, 'post_content' => $content ) );
			kses_init();
		}
		$notes[] = "$slug: $done of " . count( $list ) . ' changes';
	}
	update_option( 'hansea_oneoff_legal_meta_pixel_result', gmdate( 'c' ) . ' ' . implode( ' | ', $notes ), false );
	delete_option( 'hansea_oneoff_legal_meta_pixel_lock' );
	@unlink( __FILE__ );
}, 20 );
