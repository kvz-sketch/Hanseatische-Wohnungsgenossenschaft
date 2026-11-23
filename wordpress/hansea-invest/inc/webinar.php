<?php
/**
 * Webinar band on the landing page: [hansea_webinar].
 *
 * Shows the next webinar until HANSEA_WEBINAR['hide_at'] (Europe/Berlin);
 * after that the shortcode renders nothing, so the band disappears on its
 * own. For the next webinar change the values below (and the image in
 * elementor/webinar/).
 */

defined( 'ABSPATH' ) || exit;

const HANSEA_WEBINAR = array(
	'title'   => 'Immobilienbeteiligung ohne Aufwand',
	'lead'    => 'Beteiligen Sie sich an unserem Geschäftsmodell und profitieren Sie von 7 % Rendite p.a.',
	'text'    => 'Wie Sie mit der Hanseatischen Invest eG 7 % Rendite p.a. erzielen: attraktiv, transparent, genossenschaftlich.',
	'date'    => 'Montag, 30.11.2026',
	'time'    => '16:00 – 16:45 Uhr',
	'host'    => 'Cornelia Richter',
	'url'     => 'https://www.eventbrite.de/e/7-rendite-pa-auf-genossenschaftsanteile-der-hanseatischen-invest-eg-tickets-2005025593524?aff=Media',
	'image'   => 'elementor/webinar/webinar-2026-11-30.webp',
	'hide_at' => '2026-11-30 17:00',
);

/** True while the webinar band should be shown. */
function hansea_webinar_active() {
	$hide = date_create_immutable( HANSEA_WEBINAR['hide_at'], new DateTimeZone( 'Europe/Berlin' ) );
	return $hide && time() < $hide->getTimestamp();
}

add_shortcode( 'hansea_webinar', function () {
	if ( ! hansea_webinar_active() ) {
		return '';
	}
	$w   = HANSEA_WEBINAR;
	$img = get_template_directory_uri() . '/' . $w['image'];
	ob_start();
	?>
	<section class="hs-webinar" aria-labelledby="hs-webinar-title">
		<div class="hs-webinar__inner">
			<a class="hs-webinar__media" href="<?php echo esc_url( $w['url'] ); ?>" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
				<img src="<?php echo esc_url( $img ); ?>" alt="" width="1206" height="936" loading="lazy" decoding="async">
			</a>
			<div class="hs-webinar__body">
				<p class="hs-webinar__eyebrow">Live-Webinar</p>
				<h2 id="hs-webinar-title" class="hs-webinar__title"><?php echo esc_html( $w['title'] ); ?></h2>
				<p class="hs-webinar__lead"><?php echo esc_html( $w['lead'] ); ?></p>
				<p class="hs-webinar__text"><?php echo esc_html( $w['text'] ); ?></p>
				<dl class="hs-webinar__facts">
					<div><dt>Datum</dt><dd><?php echo esc_html( $w['date'] ); ?></dd></div>
					<div><dt>Zeit</dt><dd><?php echo esc_html( $w['time'] ); ?></dd></div>
					<div><dt>Mit</dt><dd><?php echo esc_html( $w['host'] ); ?></dd></div>
				</dl>
				<a class="hs-webinar__cta" href="<?php echo esc_url( $w['url'] ); ?>" target="_blank" rel="noopener">Jetzt anmelden<span class="hs-sr-only"> (Eventbrite, öffnet in neuem Fenster)</span></a>
			</div>
		</div>
	</section>
	<?php
	return ob_get_clean();
} );
