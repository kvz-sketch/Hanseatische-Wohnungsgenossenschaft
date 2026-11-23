<?php
/**
 * One-time change, then deletes itself: member account (Mitgliederbereich
 * only, role subscriber) for Kai Raila (kr@gerlachgroup.de), created the
 * same way as Benutzer → Mitglied anlegen: account plus the branded welcome
 * email to set the password. No access to the Mitgliederliste.
 * - Account with that email exists: the role subscriber is added (its other
 *   roles stay), no email is sent.
 * The outcome is kept in the option hansea_oneoff_member_kr_result. (Never
 * write files into mu-plugins: WordPress loads every PHP file there.)
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! function_exists( 'hansea_create_member_account' ) || ! function_exists( 'hansea_send_welcome' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_oneoff_member_kr_lock', time(), '', 'no' ) ) {
		return;
	}
	$email = 'kr@gerlachgroup.de';
	$user  = get_user_by( 'email', $email );

	if ( $user ) {
		$user->add_role( 'subscriber' );
		$note = sprintf( 'existing account %d, roles now: %s', $user->ID, implode( ', ', get_userdata( $user->ID )->roles ) );
	} else {
		$id = hansea_create_member_account( 'Kai', 'Raila', $email );
		if ( is_wp_error( $id ) ) {
			$note = 'could not create account: ' . $id->get_error_message();
		} else {
			$sent = hansea_send_welcome( get_userdata( $id ) );
			$note = sprintf( 'created member account %d, welcome email %s', $id, $sent ? 'sent' : 'NOT sent' );
		}
	}

	update_option( 'hansea_oneoff_member_kr_result', gmdate( 'c' ) . ' ' . $note, false );
	delete_option( 'hansea_oneoff_member_kr_lock' );
	@unlink( __FILE__ );
}, 20 );
