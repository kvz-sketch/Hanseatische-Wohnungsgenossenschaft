<?php
/**
 * Google Analytics 4, loaded only after consent.
 *
 * Settings → Google Analytics takes the measurement ID (G-…); the constant
 * HANSEA_GA_ID in wp-config.php overrides it. Without an ID nothing is
 * loaded and no banner is shown.
 *
 * With an ID, every front-end page gets a small consent banner (Akzeptieren /
 * Ablehnen, equal weight). The choice is stored for 12 months in the
 * first-party cookie hansea_consent ("granted" or "denied"). Google's tag is
 * requested only after "Akzeptieren"; Consent Mode starts with everything
 * denied, and advertising storage stays denied. Any link to
 * #cookie-einstellungen (footer "Cookie-Einstellungen") reopens the banner.
 * Logged-in editors are not tracked.
 */

defined( 'ABSPATH' ) || exit;

/** GA4 measurement ID, or '' when analytics is not set up. */
function hansea_ga_id() {
	$id = defined( 'HANSEA_GA_ID' ) ? (string) HANSEA_GA_ID : (string) get_option( 'hansea_ga_id', '' );
	return preg_match( '/^G-[A-Z0-9]{4,16}$/', $id ) ? $id : '';
}

add_action( 'admin_init', function () {
	register_setting( 'hansea_analytics', 'hansea_ga_id', array(
		'type'              => 'string',
		'sanitize_callback' => function ( $value ) {
			$value = strtoupper( trim( (string) $value ) );
			return preg_match( '/^G-[A-Z0-9]{4,16}$/', $value ) ? $value : '';
		},
		'default'           => '',
	) );
} );

add_action( 'admin_menu', function () {
	add_options_page( 'Google Analytics', 'Google Analytics', 'manage_options', 'hansea-analytics', function () {
		?>
		<div class="wrap">
			<h1>Google Analytics</h1>
			<p>Mess-ID der Google-Analytics-4-Property eintragen (Format <code>G-XXXXXXXXXX</code>, zu finden in Google Analytics unter Verwaltung → Datenstreams). Die Website lädt Google Analytics erst, wenn Besucher im Cookie-Hinweis zustimmen. Ohne Mess-ID wird nichts geladen und kein Cookie-Hinweis gezeigt.</p>
			<?php if ( defined( 'HANSEA_GA_ID' ) ) : ?>
				<p><strong>Die Mess-ID ist in wp-config.php festgelegt (HANSEA_GA_ID) und hat Vorrang.</strong></p>
			<?php endif; ?>
			<form method="post" action="options.php">
				<?php settings_fields( 'hansea_analytics' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="hansea_ga_id">Mess-ID</label></th>
						<td><input name="hansea_ga_id" id="hansea_ga_id" type="text" class="regular-text" placeholder="G-XXXXXXXXXX" value="<?php echo esc_attr( get_option( 'hansea_ga_id', '' ) ); ?>"></td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
			<p>Bitte vor dem Eintragen in Google Analytics: Datenaufbewahrung auf 14 Monate stellen, Google-Signale und Datenfreigabe für Werbung ausschalten und den Auftragsverarbeitungsvertrag (Google Ads Data Processing Terms) akzeptieren.</p>
		</div>
		<?php
	} );
} );

add_action( 'wp_footer', function () {
	$id = hansea_ga_id();
	if ( '' === $id || ( is_user_logged_in() && current_user_can( 'edit_posts' ) ) ) {
		return;
	}
	$cookie_url = home_url( '/cookie-richtlinie/' );
	?>
	<div class="hs-consent" id="hs-consent" role="dialog" aria-modal="false" aria-labelledby="hs-consent-title" hidden>
		<p class="hs-consent__title" id="hs-consent-title">Cookies für Statistik</p>
		<p class="hs-consent__text">Mit Ihrer Zustimmung nutzen wir Google Analytics, um zu verstehen, wie unsere Website genutzt wird. Sie können Ihre Wahl jederzeit unter „Cookie-Einstellungen“ ändern. Mehr dazu in der <a href="<?php echo esc_url( $cookie_url ); ?>">Cookie-Richtlinie</a>.</p>
		<div class="hs-consent__actions">
			<button type="button" data-consent="denied">Ablehnen</button>
			<button type="button" data-consent="granted">Akzeptieren</button>
		</div>
	</div>
	<style>
		.hs-consent { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 9999; max-width: 440px; margin-left: auto; padding: 22px 24px; border-radius: 8px; background: #141a46; color: #e3e4ee; font: 400 14px/1.55 "Inter", system-ui, sans-serif; box-shadow: 0 24px 60px -20px rgba(14, 19, 56, 0.6); }
		.hs-consent[hidden] { display: none; }
		.hs-consent__title { margin: 0 0 6px; color: #fff; font-weight: 700; font-size: 15px; }
		.hs-consent__text { margin: 0 0 16px; }
		.hs-consent__text a { color: #e6c978; }
		.hs-consent__actions { display: flex; gap: 10px; }
		.hs-consent__actions button { flex: 1; padding: 11px 16px; border-radius: 4px; border: 2px solid #ddb851; font: 600 14px/1 "Inter", system-ui, sans-serif; cursor: pointer; }
		.hs-consent__actions [data-consent="denied"] { background: transparent; color: #fff; }
		.hs-consent__actions [data-consent="granted"] { background: #ddb851; color: #141a46; }
		.hs-consent__actions button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
	</style>
	<script>
	(function () {
		var ID = <?php echo wp_json_encode( $id ); ?>;
		var box = document.getElementById('hs-consent');
		window.dataLayer = window.dataLayer || [];
		function gtag() { dataLayer.push(arguments); }
		gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });

		function read() { var m = document.cookie.match(/(?:^|; )hansea_consent=(granted|denied)/); return m ? m[1] : null; }
		function store(v) { document.cookie = 'hansea_consent=' + v + '; Max-Age=' + 60 * 60 * 24 * 365 + '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); }
		function removeGaCookies() {
			document.cookie.split('; ').forEach(function (c) {
				var name = c.split('=')[0];
				if (/^_ga/.test(name)) {
					var host = location.hostname.replace(/^www\./, '');
					['', '; domain=' + host, '; domain=.' + host].forEach(function (d) { document.cookie = name + '=; Max-Age=0; Path=/' + d; });
				}
			});
		}
		var loaded = false;
		function load() {
			gtag('consent', 'update', { analytics_storage: 'granted' });
			if (loaded) return;
			loaded = true;
			var s = document.createElement('script');
			s.async = true;
			s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
			document.head.appendChild(s);
			gtag('js', new Date());
			gtag('config', ID);
		}
		function choose(v) {
			store(v);
			box.hidden = true;
			if (v === 'granted') load();
			else { gtag('consent', 'update', { analytics_storage: 'denied' }); removeGaCookies(); }
		}

		box.addEventListener('click', function (e) {
			var v = e.target.getAttribute && e.target.getAttribute('data-consent');
			if (v) choose(v);
		});
		document.addEventListener('click', function (e) {
			var a = e.target.closest && e.target.closest('a[href$="#cookie-einstellungen"]');
			if (!a) return;
			e.preventDefault();
			box.hidden = false;
			box.querySelector('button').focus();
		});

		var choice = read();
		if (choice === 'granted') load();
		else if (!choice) box.hidden = false;
	})();
	</script>
	<?php
}, 50 );
