<?php
/**
 * One-time change, then deletes itself: Mitgliederliste access for Johnieka
 * Holtzhausen (jh@gerlachgroup.de), role "Mitgliederverwaltung" (inc/crm.php).
 * - Account with that email exists: the role is added; its other roles stay.
 * - No account yet: one is created, and she gets an email to set her
 *   password. Two-factor login is set up at the first login.
 * The outcome is kept in the option hansea_oneoff_staff_jh_result. (Never write
 * files into mu-plugins: WordPress loads every PHP file there.)
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	// After inc/crm.php has created the roles (init, priority 10)
	if ( ! get_role( 'mitgliederverwaltung' ) || ! function_exists( 'hansea_welcome_link' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_oneoff_staff_jh_lock', time(), '', 'no' ) ) {
		return;
	}
	$email = 'jh@gerlachgroup.de';
	$user  = get_user_by( 'email', $email );

	if ( $user ) {
		$user->add_role( 'mitgliederverwaltung' );
		$note = sprintf( 'existing account %d, roles now: %s', $user->ID, implode( ', ', get_userdata( $user->ID )->roles ) );
	} else {
		$id = wp_insert_user( array(
			'user_login'   => 'johnieka.holtzhausen',
			'user_email'   => $email,
			'user_pass'    => wp_generate_password( 32, true, true ),
			'first_name'   => 'Johnieka',
			'last_name'    => 'Holtzhausen',
			'display_name' => 'Johnieka Holtzhausen',
			'role'         => 'mitgliederverwaltung',
		) );
		if ( is_wp_error( $id ) ) {
			$note = 'could not create account: ' . $id->get_error_message();
		} else {
			$link = hansea_welcome_link( get_userdata( $id ) );
			$sent = ! is_wp_error( $link ) && wp_mail( $email, 'Ihr Zugang zur Mitgliederliste der Hanseatischen Invest eG', hansea_email_html( array(
				'eyebrow'   => 'Mitgliederverwaltung',
				'title'     => 'Ihr Zugang zur Mitgliederliste',
				'preheader' => 'Ihr Zugang zur Mitgliederliste der Hanseatischen Invest eG.',
				'html'      => array(
					'Guten Tag Frau Holtzhausen,',
					'für Sie ist ein Zugang zur Mitgliederliste der Hanseatischen Invest eG eingerichtet. Dort verwalten Sie Mitglieder, Anträge, Anteile, Kündigungen und Dokumente.',
					'<strong>Ihre Zugangsdaten</strong><br>Anmeldeseite: <a href="' . esc_url( home_url( '/login/' ) ) . '" style="color:#141A46;">' . esc_html( preg_replace( '~^https?://~', '', home_url( '/login/' ) ) ) . '</a><br>Benutzername: ' . esc_html( $email ) . '<br>Passwort: legen Sie über den Button unten selbst fest',
					'Bei der ersten Anmeldung richten Sie die Zwei-Faktor-Anmeldung mit einer Authenticator-App ein.',
				),
				'button'    => array( 'label' => 'Passwort festlegen', 'url' => $link ),
				'note'      => hansea_welcome_note(),
			) ), array( 'Content-Type: text/html; charset=UTF-8' ) );
			$note = sprintf( 'created account %d (role mitgliederverwaltung), password email %s', $id, $sent ? 'sent' : 'NOT sent' );
		}
	}

	update_option( 'hansea_oneoff_staff_jh_result', gmdate( 'c' ) . ' ' . $note, false );
	delete_option( 'hansea_oneoff_staff_jh_lock' );
	@unlink( __FILE__ );
}, 20 );
