<?php
/**
 * Elementor support: brand fonts and styles on Elementor pages, and the
 * [hansea_kontakt] contact form (Elementor's free version has no form widget).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {
	if ( hansea_current_view() ) {
		return; // React pages bring their own styles
	}
	wp_enqueue_style(
		'hansea-elementor',
		get_template_directory_uri() . '/elementor/hansea-elementor.css',
		array(),
		HANSEA_THEME_VERSION
	);
	if ( ! hansea_motion_enabled() ) {
		return;
	}
	wp_enqueue_script(
		'hansea-motion',
		get_template_directory_uri() . '/elementor/hansea-motion.js',
		array(),
		HANSEA_THEME_VERSION,
		array( 'in_footer' => true )
	);
} );

/** The design preview page stays out of search engines. */
add_filter( 'wp_robots', function ( $robots ) {
	if ( is_singular( 'page' ) && get_post_meta( get_queried_object_id(), 'hansea_landing_preview', true ) ) {
		$robots['noindex']  = true;
		$robots['nofollow'] = true;
	}
	return $robots;
} );

/** Scroll animations run on the public pages, not in the Elementor editor or its preview. */
function hansea_motion_enabled() {
	return ! hansea_current_view() && ! is_admin() && ! isset( $_GET['elementor-preview'] ) && ! isset( $_GET['elementor_library'] );
}

/**
 * Turn the animations on before the page paints (so content doesn't flash),
 * unless the visitor prefers reduced motion. If the script hasn't run after
 * 2.5 s (blocked, failed), everything is shown.
 */
add_action( 'wp_head', function () {
	if ( ! hansea_motion_enabled() ) {
		return;
	}
	echo "<script>(function(d){if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('hs-motion');setTimeout(function(){if(!window.hsMotionReady)d.classList.remove('hs-motion')},2500)})(document.documentElement)</script>\n";
}, 1 );

/** Contact form posting to the theme's lead endpoint (stored under "Anfragen"). */
add_shortcode( 'hansea_kontakt', function () {
	$sources = array( 'Empfehlung', 'Google / Suche', 'Social Media', 'Webinar', 'Buch', 'Presse', 'Makler', 'Sonstiges' );
	$id      = 'hs-kontakt-' . wp_rand( 1000, 9999 );
	ob_start();
	?>
	<form class="hs-form" id="<?php echo esc_attr( $id ); ?>" novalidate>
		<div class="hs-form__row">
			<div><label for="<?php echo esc_attr( $id ); ?>-first">Vorname*</label><input id="<?php echo esc_attr( $id ); ?>-first" name="firstName" autocomplete="given-name" required></div>
			<div><label for="<?php echo esc_attr( $id ); ?>-last">Nachname*</label><input id="<?php echo esc_attr( $id ); ?>-last" name="lastName" autocomplete="family-name" required></div>
		</div>
		<div><label for="<?php echo esc_attr( $id ); ?>-email">Email*</label><input id="<?php echo esc_attr( $id ); ?>-email" name="email" type="email" autocomplete="email" required></div>
		<div>
			<label for="<?php echo esc_attr( $id ); ?>-source">Wie haben Sie von uns erfahren?</label>
			<select id="<?php echo esc_attr( $id ); ?>-source" name="source">
				<option value="">Bitte wählen</option>
				<?php foreach ( $sources as $source ) : ?>
					<option><?php echo esc_html( $source ); ?></option>
				<?php endforeach; ?>
			</select>
		</div>
		<div><label for="<?php echo esc_attr( $id ); ?>-phone">Telefonnummer*</label><input id="<?php echo esc_attr( $id ); ?>-phone" name="phone" type="tel" autocomplete="tel" required></div>
		<div class="hs-form__hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
		<p class="hs-form__error" role="alert" hidden></p>
		<button type="submit">Anfrage senden</button>
		<p class="hs-form__note">* Pflichtfelder. Ihre Angaben verwenden wir nur zur Bearbeitung Ihrer Anfrage. <a href="<?php echo esc_url( home_url( '/datenschutz/' ) ); ?>">Datenschutzhinweise</a></p>
	</form>
	<script>
	(function () {
		var form = document.getElementById(<?php echo wp_json_encode( $id ); ?>);
		if (!form) return;
		var endpoint = <?php echo wp_json_encode( esc_url_raw( rest_url( 'hansea/v1/lead' ) ) ); ?>;
		var error = form.querySelector('.hs-form__error');
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var data = {};
			new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
			if (data.website) return; // bots fill the hidden field
			var bad = [];
			if (!data.firstName) bad.push('firstName');
			if (!data.lastName) bad.push('lastName');
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) bad.push('email');
			if (data.phone.replace(/\D/g, '').length < 6) bad.push('phone');
			form.querySelectorAll('input').forEach(function (el) { el.removeAttribute('aria-invalid'); });
			bad.forEach(function (name) { form.querySelector('[name="' + name + '"]').setAttribute('aria-invalid', 'true'); });
			if (bad.length) { error.textContent = 'Bitte füllen Sie die markierten Felder aus.'; error.hidden = false; return; }
			error.hidden = true;
			var button = form.querySelector('button');
			button.disabled = true; button.textContent = 'Wird gesendet …';
			fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ type: 'contact', firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, source: data.source, page: location.pathname })
			}).then(function (res) {
				if (!res.ok) throw new Error(res.status);
				form.innerHTML = '<div class="hs-form__done" role="status"><strong>Vielen Dank für Ihre Anfrage.</strong>Wir melden uns zeitnah bei Ihnen.</div>';
			}).catch(function () {
				error.textContent = 'Das hat nicht geklappt. Bitte versuchen Sie es noch einmal.'; error.hidden = false;
				button.disabled = false; button.textContent = 'Anfrage senden';
			});
		});
	})();
	</script>
	<?php
	return ob_get_clean();
} );
