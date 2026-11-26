<?php
/**
 * One-time change, then deletes itself: full access for Cornelia Richter
 * (cr@gerlachgroup.de): Mitgliederliste (role "Mitgliederverwaltung") and
 * Mitgliederportal (role subscriber). With both roles she can use both
 * (inc/crm.php, hansea_crm_staff_only). Her other roles stay; no email is
 * sent to an existing account.
 * - No account yet: created as in Benutzer → Mitglied anlegen (with the
 *   welcome email to set the password), then given the second role.
 * The outcome is kept in the option hansea_oneoff_full_access_cr_result.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	// After inc/crm.php has created the roles (init, priority 10)
	if ( ! get_role( 'mitgliederverwaltung' ) || ! function_exists( 'hansea_create_member_account' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_oneoff_full_access_cr_lock', time(), '', 'no' ) ) {
		return;
	}
	$email = 'cr@gerlachgroup.de';
	$user  = get_user_by( 'email', $email );
	$note  = '';

	if ( ! $user ) {
		$id = hansea_create_member_account( 'Cornelia', 'Richter', $email );
		if ( is_wp_error( $id ) ) {
			$note = 'could not create account: ' . $id->get_error_message();
		} else {
			$user = get_userdata( $id );
			$note = 'created account ' . $id . ', welcome email ' . ( hansea_send_welcome( $user ) ? 'sent' : 'NOT sent' ) . '; ';
		}
	}
	if ( $user ) {
		$user->add_role( 'subscriber' );
		$user->add_role( 'mitgliederverwaltung' );
		$note .= sprintf( 'account %d, roles now: %s', $user->ID, implode( ', ', get_userdata( $user->ID )->roles ) );
	}

	update_option( 'hansea_oneoff_full_access_cr_result', gmdate( 'c' ) . ' ' . $note, false );
	delete_option( 'hansea_oneoff_full_access_cr_lock' );
	@unlink( __FILE__ );
}, 20 );
