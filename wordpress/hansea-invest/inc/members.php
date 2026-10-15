<?php
/**
 * Member accounts: plain WordPress users with the subscriber role.
 */

defined( 'ABSPATH' ) || exit;

/** Fields the React app gets about the logged-in member. */
function hansea_member_payload( WP_User $user ) {
	return array(
		'firstName' => $user->first_name,
		'lastName'  => $user->last_name,
		'email'     => $user->user_email,
		'createdAt' => mysql_to_rfc3339( $user->user_registered ),
	);
}

/** Members (anyone who can't edit posts) stay out of wp-admin. */
add_action( 'admin_init', function () {
	if ( wp_doing_ajax() || current_user_can( 'edit_posts' ) ) {
		return;
	}
	wp_safe_redirect( home_url( '/mitglieder/' ) );
	exit;
} );

/** After a WordPress login (e.g. following a password reset) members land in their dashboard. */
add_filter( 'login_redirect', function ( $redirect_to, $requested, $user ) {
	if ( $user instanceof WP_User && ! user_can( $user, 'edit_posts' ) ) {
		return home_url( '/mitglieder/' );
	}
	return $redirect_to;
}, 10, 3 );

/** After logging out through wp-login.php, go back to the landing page. */
add_filter( 'logout_redirect', function () {
	return home_url( '/' );
} );

/** Brand the WordPress login screen that handles password resets. */
add_action( 'login_enqueue_scripts', function () {
	?>
	<style>
		body.login { background: #f5f5f5; }
		.login h1 a { background-image: url(<?php echo esc_url( get_template_directory_uri() . '/dist/icon.svg' ); ?>); background-size: contain; width: 72px; height: 72px; }
		.login .button-primary { background: #ddb851; border-color: #ddb851; color: #141a46; }
		.login .button-primary:hover, .login .button-primary:focus { background: #c6a248; border-color: #c6a248; color: #141a46; }
		.login #backtoblog a, .login #nav a { color: #141a46; }
	</style>
	<?php
} );

add_filter( 'login_headerurl', function () {
	return home_url( '/' );
} );
