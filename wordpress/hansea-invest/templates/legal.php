<?php
/**
 * Template Name: Rechtliches
 *
 * Impressum, Datenschutz, Cookie-Richtlinie: logo header, one readable text
 * column (content edited as a normal page in wp-admin) and a small footer.
 * Styles: legal.css.
 */

defined( 'ABSPATH' ) || exit;

$hs_links = array(
	'/impressum/'           => 'Impressum',
	'/datenschutz/'         => 'Datenschutz',
	'/cookie-richtlinie/'   => 'Cookie-Richtlinie',
	'#cookie-einstellungen' => 'Cookie-Einstellungen', // reopens the consent banner (inc/analytics.php)
);
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#141a46">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'hs-legal-page' ); ?>>
	<?php wp_body_open(); ?>
	<header class="hs-legal-header">
		<div class="hs-legal-wrap hs-legal-header__inner">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="hs-legal-logo" aria-label="Hanseatische Invest eG, zur Startseite">
				<img src="<?php echo esc_url( get_template_directory_uri() . '/elementor/images/logo-navy.svg' ); ?>" alt="" width="72" height="52">
			</a>
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="hs-legal-back">Zur Startseite</a>
		</div>
	</header>

	<main class="hs-legal-wrap hs-legal-main">
		<?php while ( have_posts() ) : the_post(); ?>
			<h1><?php the_title(); ?></h1>
			<div class="hs-legal-content">
				<?php the_content(); ?>
			</div>
		<?php endwhile; ?>
	</main>

	<footer class="hs-legal-footer">
		<div class="hs-legal-wrap hs-legal-footer__inner">
			<p>Hanseatische Invest eG · Langenhorner Chaussee 155 · 22415 Hamburg</p>
			<nav aria-label="Rechtliches">
				<?php foreach ( $hs_links as $hs_url => $hs_label ) : ?>
					<a href="<?php echo esc_url( home_url( $hs_url ) ); ?>"><?php echo esc_html( $hs_label ); ?></a>
				<?php endforeach; ?>
			</nav>
		</div>
	</footer>
	<?php wp_footer(); ?>
</body>
</html>
