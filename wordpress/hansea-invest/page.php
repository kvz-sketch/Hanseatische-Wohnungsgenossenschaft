<?php
/**
 * Pages (e.g. built with Elementor using the default template): a bare
 * document around the content; Elementor supplies the layout.
 */
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#141a46">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
	<?php wp_body_open(); ?>
	<?php
	while ( have_posts() ) {
		the_post();
		the_content();
	}
	?>
	<?php wp_footer(); ?>
</body>
</html>
