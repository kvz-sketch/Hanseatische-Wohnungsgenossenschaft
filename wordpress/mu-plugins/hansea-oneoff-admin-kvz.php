<?php
/**
 * One-time change, then deletes itself: swaps two email addresses.
 * Admin account hansea-admin and the site's admin email (lead notifications,
 * system mails) move to kvz@gerlachgroup.de; the member test account that
 * had that address moves to katrinvanzyl@gmail.com. No emails are sent.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! add_option( 'hansea_oneoff_admin_kvz_lock', time(), '', 'no' ) ) {
		return;
	}
	$work    = 'kvz@gerlachgroup.de';
	$private = 'katrinvanzyl@gmail.com';
	add_filter( 'send_email_change_email', '__return_false' );

	$admin  = get_user_by( 'login', 'hansea-admin' );
	$member = get_user_by( 'email', $work );
	if ( $admin && $member && $member->ID !== $admin->ID && ! user_can( $member, 'edit_posts' ) ) {
		wp_update_user( array( 'ID' => $member->ID, 'user_email' => 'swap-' . $member->ID . '@invalid.example' ) );
		wp_update_user( array( 'ID' => $admin->ID, 'user_email' => $work ) );
		wp_update_user( array( 'ID' => $member->ID, 'user_email' => $private ) );
	} elseif ( $admin && ! $member ) {
		wp_update_user( array( 'ID' => $admin->ID, 'user_email' => $work ) );
	}
	update_option( 'admin_email', $work );
	delete_option( 'new_admin_email' );

	delete_option( 'hansea_oneoff_admin_kvz_lock' );
	@unlink( __FILE__ );
} );
