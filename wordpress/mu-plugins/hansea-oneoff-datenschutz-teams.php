<?php
/**
 * One-time change, then deletes itself: adds the section "Gesprächsmitschriften
 * bei Beratungs- und Vertriebsgesprächen" (Microsoft Teams transcripts) to the
 * live Datenschutzerklärung (/datenschutz/), at the end of "4. Datenerfassung
 * auf dieser Website", as in the theme's legal/datenschutz.html. The rest of
 * the page stays as it is. Skipped if the section is already there or the
 * heading of section 5 is not found. The outcome is kept in the option
 * hansea_oneoff_datenschutz_teams_result. (Never write files into mu-plugins:
 * WordPress loads every PHP file there.)
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_datenschutz_teams_lock', time(), '', 'no' ) ) {
		return;
	}
	$block  = '<h3>Gesprächsmitschriften bei Beratungs- und Vertriebsgesprächen</h3>
<p><strong>Umfang und Zweck der Datenerhebung</strong></p>
<p>Führen Sie mit uns ein Beratungs- oder Vertriebsgespräch über Microsoft Teams, kann nach Bedarf eine automatische Textmitschrift (Transkript) des Gesprächs erstellt werden. Dabei wird ausschließlich der gesprochene Inhalt in Textform festgehalten. Eine Ton- oder Videoaufzeichnung findet nicht statt.</p>
<p>Verarbeitet werden die Gesprächsinhalte in Textform, der Name beziehungsweise Anzeigename der Teilnehmenden sowie Zeitpunkt und Dauer des Gesprächs.</p>
<p>Zweck der Verarbeitung ist allein die interne Dokumentation Ihres Anliegens, damit wir Ihre Angaben vollständig und korrekt erfassen und die weitere Bearbeitung nachvollziehbar gestalten können.</p>
<p>Eine Analyse von Stimme, Stimmung oder Emotionen findet nicht statt. Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne des Art. 22 DSGVO erfolgt nicht. Die Mitschriften werden nicht zum Training von Systemen künstlicher Intelligenz verwendet.</p>
<p><strong>Rechtsgrundlage und Freiwilligkeit</strong></p>
<p>Die Verarbeitung erfolgt ausschließlich auf Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Wir fragen Sie vor Beginn der Mitschrift ausdrücklich, ob Sie damit einverstanden sind.</p>
<p>Die Mitschrift ist freiwillig. Stimmen Sie nicht zu, führen wir das Gespräch ohne Mitschrift; Nachteile entstehen Ihnen dadurch nicht. Sie können Ihre Einwilligung jederzeit und ohne Angabe von Gründen widerrufen, auch während des laufenden Gesprächs. Wir beenden die Mitschrift dann unverzüglich und löschen sie. Die bis zum Widerruf erfolgte Verarbeitung bleibt rechtmäßig.</p>
<p><strong>Empfänger</strong></p>
<p>Zugriff auf die Mitschrift haben ausschließlich die an dem Gespräch beteiligten Mitarbeitenden sowie deren unmittelbare Fachvorgesetzte.</p>
<p>Die Transkriptionsfunktion wird innerhalb unserer Microsoft-365-Umgebung bereitgestellt. Auftragsverarbeiter im Sinne des Art. 28 DSGVO ist insoweit die Microsoft Ireland Operations Limited, One Microsoft Place, South County Business Park, Leopardstown, Dublin 18, Irland. Mit Microsoft besteht ein Auftragsverarbeitungsvertrag. Die Verarbeitung erfolgt innerhalb der EU-Datengrenze von Microsoft. Eine Weitergabe an sonstige Dritte findet nicht statt.</p>
<p><strong>Aufbewahrungsdauer der Daten</strong></p>
<p>Die Mitschrift wird gelöscht, sobald der Gesprächsinhalt in unser Kundensystem übernommen wurde, spätestens jedoch nach 30 Tagen. Widerrufen Sie Ihre Einwilligung, erfolgt die Löschung unverzüglich.</p>
<p>Die übernommene inhaltliche Zusammenfassung unterliegt den allgemeinen Aufbewahrungsfristen; zwingende gesetzliche Aufbewahrungspflichten bleiben unberührt.</p>';
	$anchor = '<h2>5. Mitgliedschaft und Mitgliederbereich</h2>';
	$page   = get_page_by_path( 'datenschutz', OBJECT, 'page' );
	if ( ! $page ) {
		$note = 'page /datenschutz/ not found';
	} elseif ( false !== strpos( $page->post_content, 'Gesprächsmitschriften bei Beratungs- und Vertriebsgesprächen' ) ) {
		$note = 'already there';
	} elseif ( 1 !== substr_count( $page->post_content, $anchor ) ) {
		$note = 'heading of section 5 not found, skipped';
	} else {
		wp_update_post( wp_slash( array( 'ID' => $page->ID, 'post_content' => str_replace( $anchor, $block . "\n" . $anchor, $page->post_content ) ) ) );
		$note = 'added';
	}
	update_option( 'hansea_oneoff_datenschutz_teams_result', gmdate( 'c' ) . ' ' . $note, false );
	delete_option( 'hansea_oneoff_datenschutz_teams_lock' );
	@unlink( __FILE__ );
}, 20 );
