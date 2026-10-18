<?php
/**
 * The Beitrittserklärung as signed in DocuSign (HTML, converted to PDF by DocuSign).
 * Included by hansea_beitritt_document() with $user (WP_User) and $data.
 *
 * ENTWURF: the wording must be approved by the legal advisers and checked
 * against the Satzung (Nachschusspflicht, Kündigungsfrist, Eintrittsgeld)
 * before the production environment is switched on.
 *
 * The white /hs_sig/ and /hs_date/ markers are DocuSign anchors for the
 * signature and date fields; keep them in the document.
 */

defined( 'ABSPATH' ) || exit;

$hs_name    = trim( $user->first_name . ' ' . $user->last_name );
$hs_birth   = DateTime::createFromFormat( '!Y-m-d', $data['birthDate'] );
$hs_units   = (int) $data['units'];
$hs_total   = hansea_euro( $hs_units * HANSEA_SHARE_PRICE );
$hs_address = $data['street'] . ', ' . $data['zip'] . ' ' . $data['city'];
?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<style>
	body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #141a46; margin: 40px 48px; }
	h1 { font-family: Georgia, 'Times New Roman', serif; font-weight: normal; font-size: 24pt; margin: 0 0 4px; }
	.sub { color: #555; font-size: 10pt; margin: 0 0 28px; }
	.draft { border: 2px solid #c0392b; color: #c0392b; padding: 8px 12px; font-weight: bold; margin-bottom: 24px; }
	table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
	th { text-align: left; width: 34%; font-weight: normal; color: #555; padding: 6px 0; border-bottom: 1px solid #e7e8ec; vertical-align: top; }
	td { padding: 6px 0; border-bottom: 1px solid #e7e8ec; }
	h2 { font-size: 12pt; margin: 24px 0 8px; }
	p { margin: 0 0 10px; }
	.small { font-size: 9pt; color: #555; }
	.anchor { color: #ffffff; font-size: 8pt; }
	.sign { margin-top: 40px; width: 100%; }
	.sign td { border: 0; vertical-align: bottom; padding: 0 24px 0 0; width: 50%; }
	.line { border-top: 1px solid #141a46; padding-top: 4px; font-size: 9pt; color: #555; }
</style>
</head>
<body>
	<?php if ( hansea_docusign_is_demo() ) : ?>
		<div class="draft">ENTWURF / TESTUMGEBUNG – nicht rechtsgültig. Text noch nicht von der Rechtsberatung freigegeben.</div>
	<?php endif; ?>

	<h1>Beitrittserklärung</h1>
	<p class="sub">Hanseatische Invest eG · Langenhorner Chaussee 155 · 22415 Hamburg · Amtsgericht Hamburg, GnR 1175</p>

	<h2>Angaben zur Person</h2>
	<table>
		<tr><th>Name</th><td><?php echo esc_html( $hs_name ); ?></td></tr>
		<tr><th>Geburtsdatum</th><td><?php echo esc_html( $hs_birth ? $hs_birth->format( 'd.m.Y' ) : $data['birthDate'] ); ?></td></tr>
		<tr><th>Anschrift</th><td><?php echo esc_html( $hs_address ); ?></td></tr>
		<tr><th>E-Mail</th><td><?php echo esc_html( $user->user_email ); ?></td></tr>
		<?php if ( '' !== $data['phone'] ) : ?>
			<tr><th>Telefon</th><td><?php echo esc_html( $data['phone'] ); ?></td></tr>
		<?php endif; ?>
	</table>

	<h2>Beitritt und Beteiligung</h2>
	<p>
		Ich erkläre hiermit meinen Beitritt zur Hanseatischen Invest eG und beteilige mich mit
		<strong><?php echo esc_html( $hs_units ); ?> Geschäftsanteilen</strong> zu je <?php echo esc_html( hansea_euro( HANSEA_SHARE_PRICE ) ); ?>,
		insgesamt <strong><?php echo esc_html( $hs_total ); ?></strong>.
	</p>
	<p>
		Ich verpflichte mich, die nach Gesetz und Satzung geschuldeten Einzahlungen auf die Geschäftsanteile zu leisten.
		[Regelung zur Nachschusspflicht gemäß Satzung einfügen.]
	</p>
	<p>
		Die Satzung der Genossenschaft in der aktuellen Fassung, den Risikohinweis und die Datenschutzhinweise habe ich vor
		Abgabe dieser Erklärung erhalten.
	</p>

	<h2>Risikohinweis</h2>
	<p class="small">
		Genossenschaftsanteile sind eine unternehmerische Beteiligung. Die Zielrendite von 7 % p.a. ist nicht garantiert.
		Es besteht das Risiko des Verlusts bis zum Totalverlust der Einlage. Es besteht keine gesetzliche Einlagensicherung.
		Eine Kündigung ist nur nach den Fristen der Satzung möglich.
	</p>

	<table class="sign">
		<tr>
			<td><span class="anchor">/hs_date/</span><div class="line">Datum</div></td>
			<td><span class="anchor">/hs_sig/</span><div class="line">Unterschrift <?php echo esc_html( $hs_name ); ?></div></td>
		</tr>
	</table>

	<p class="small" style="margin-top:32px">
		Die Mitgliedschaft entsteht mit der Zulassung durch die Genossenschaft und der Eintragung in die Mitgliederliste (§ 15 GenG).
	</p>
</body>
</html>
