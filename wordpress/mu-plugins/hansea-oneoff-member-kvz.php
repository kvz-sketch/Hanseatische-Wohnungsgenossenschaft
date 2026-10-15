<?php
/**
 * One-time change, then deletes itself:
 * 1. Admin account hansea-admin and the site's admin email (lead
 *    notifications, system mails) move to katrinvanzyl@gmail.com.
 * 2. Member account for Katrin van Zyl with kvz@gerlachgroup.de.
 * No emails are sent.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_kvz_lock', time(), '', 'no' ) ) {
		return;
	}
	$new_admin_email = 'katrinvanzyl@gmail.com';
	$member_email    = 'kvz@gerlachgroup.de';

	add_filter( 'send_email_change_email', '__return_false' );

	$admin = get_user_by( 'login', 'hansea-admin' );
	if ( $admin && $admin->user_email !== $new_admin_email && ! email_exists( $new_admin_email ) ) {
		wp_update_user( array( 'ID' => $admin->ID, 'user_email' => $new_admin_email ) );
	}
	update_option( 'admin_email', $new_admin_email );
	delete_option( 'new_admin_email' );

	if ( ! email_exists( $member_email ) ) {
		do {
			$login = 'mitglied_' . strtolower( wp_generate_password( 10, false, false ) );
		} while ( username_exists( $login ) );
		wp_insert_user( array(
			'user_login'   => $login,
			'user_email'   => $member_email,
			'user_pass'    => wp_generate_password( 32, true, true ),
			'first_name'   => 'Katrin',
			'last_name'    => 'van Zyl',
			'display_name' => 'Katrin van Zyl',
			'role'         => 'subscriber',
		) );
	}

	delete_option( 'hansea_oneoff_kvz_lock' );
	@unlink( __FILE__ );
} );
