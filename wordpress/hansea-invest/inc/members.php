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
		'portfolio' => hansea_crm_portfolio( $user ), // inc/crm.php; null until linked to the Mitgliederliste
		'crm'       => user_can( $user, 'hansea_crm' ), // may open the Mitgliederliste
	);
}

/** Members (anyone who can't edit posts) stay out of wp-admin. */
add_action( 'admin_init', function () {
	if ( wp_doing_ajax() || current_user_can( 'edit_posts' ) ) {
		return;
	}
	wp_safe_redirect( home_url( current_user_can( 'hansea_crm' ) ? '/mitgliederliste/' : '/mitglieder/' ) );
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

/** Brand the WordPress login screen (admin login); added after core's login.css so it wins. */
add_action( 'login_enqueue_scripts', function () {
	$logo = esc_url( get_template_directory_uri() . '/elementor/images/logo-navy.svg' );
	wp_add_inline_style( 'login', "
		body.login { background: #f5f5f5; font-family: Inter, 'Helvetica Neue', Arial, sans-serif; }
		.login h1 a { background-image: url({$logo}); background-size: contain; background-position: center; width: 160px; height: 104px; }
		.login form { border: 1px solid #e7e8ec; border-radius: 8px; box-shadow: none; }
		.login .button-primary { background: #ddb851; border-color: #ddb851; color: #141a46; font-weight: 600; border-radius: 4px; box-shadow: none; text-shadow: none; }
		.login .button-primary:hover, .login .button-primary:focus { background: #c6a248; border-color: #c6a248; color: #141a46; }
		.login input[type=text]:focus, .login input[type=password]:focus { border-color: #141a46; box-shadow: 0 0 0 3px rgba(221,184,81,.45); }
		.login #backtoblog a, .login #nav a, .login .privacy-policy-link { color: #141a46; }
		.login .message, .login .notice { border-left-color: #ddb851; }
		.language-switcher { display: none; }
	" );
} );

add_filter( 'login_headertext', function () {
	return 'Hanseatische Invest eG';
} );

add_filter( 'login_headerurl', function () {
	return home_url( '/' );
} );
