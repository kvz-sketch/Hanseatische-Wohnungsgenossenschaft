<?php
/**
 * One-time change, then deletes itself: Mitgliederliste access, role
 * "Mitgliederverwaltung" (inc/crm.php), for
 * - Cornelia Richter (cr@gerlachgroup.de)
 * - Dane Reichentrog (dr@gerlachgroup.de)
 * For each: an account with that email gets the role added (its other roles
 * stay); otherwise one is created and the person gets an email to set the
 * password. Two-factor login is set up at the first login.
 * The outcome is kept in the option hansea_oneoff_staff_cr_dr_result. (Never
 * write files into mu-plugins: WordPress loads every PHP file there.)
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	// After inc/crm.php has created the roles (init, priority 10)
	if ( ! get_role( 'mitgliederverwaltung' ) || ! function_exists( 'hansea_welcome_link' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_oneoff_staff_cr_dr_lock', time(), '', 'no' ) ) {
		return;
	}
	$people = array(
		array( 'email' => 'cr@gerlachgroup.de', 'login' => 'cornelia.richter', 'first' => 'Cornelia', 'last' => 'Richter' ),
		array( 'email' => 'dr@gerlachgroup.de', 'login' => 'dane.reichentrog', 'first' => 'Dane', 'last' => 'Reichentrog' ),
	);
	$notes = array();

	foreach ( $people as $p ) {
		$email = $p['email'];
		$name  = $p['first'] . ' ' . $p['last'];
		$user  = get_user_by( 'email', $email );

		if ( $user ) {
			$user->add_role( 'mitgliederverwaltung' );
			if ( ! $user->first_name && ! $user->last_name ) {
				wp_update_user( array( 'ID' => $user->ID, 'first_name' => $p['first'], 'last_name' => $p['last'] ) );
			}
			$notes[] = sprintf( '%s: existing account %d, roles now: %s', $email, $user->ID, implode( ', ', get_userdata( $user->ID )->roles ) );
			continue;
		}
		$id = wp_insert_user( array(
			'user_login'   => $p['login'],
			'user_email'   => $email,
			'user_pass'    => wp_generate_password( 32, true, true ),
			'first_name'   => $p['first'],
			'last_name'    => $p['last'],
			'display_name' => $name,
			'role'         => 'mitgliederverwaltung',
		) );
		if ( is_wp_error( $id ) ) {
			$notes[] = $email . ': could not create account: ' . $id->get_error_message();
			continue;
		}
		$link = hansea_welcome_link( get_userdata( $id ) );
		$sent = ! is_wp_error( $link ) && wp_mail( $email, 'Ihr Zugang zur Mitgliederliste der Hanseatischen Invest eG', hansea_email_html( array(
			'eyebrow'   => 'Mitgliederverwaltung',
			'title'     => 'Ihr Zugang zur Mitgliederliste',
			'preheader' => 'Ihr Zugang zur Mitgliederliste der Hanseatischen Invest eG.',
			'html'      => array(
				'Guten Tag ' . esc_html( $name ) . ',',
				'für Sie ist ein Zugang zur Mitgliederliste der Hanseatischen Invest eG eingerichtet. Dort verwalten Sie Mitglieder, Anträge, Anteile, Kündigungen und Dokumente.',
				'<strong>Ihre Zugangsdaten</strong><br>Anmeldeseite: <a href="' . esc_url( home_url( '/login/' ) ) . '" style="color:#141A46;">' . esc_html( preg_replace( '~^https?://~', '', home_url( '/login/' ) ) ) . '</a><br>Benutzername: ' . esc_html( $email ) . '<br>Passwort: legen Sie über den Button unten selbst fest',
				'Bei der ersten Anmeldung richten Sie die Zwei-Faktor-Anmeldung mit einer Authenticator-App ein.',
			),
			'button'    => array( 'label' => 'Passwort festlegen', 'url' => $link ),
			'note'      => hansea_welcome_note(),
		) ), array( 'Content-Type: text/html; charset=UTF-8' ) );
		$notes[] = sprintf( '%s: created account %d (role mitgliederverwaltung), password email %s', $email, $id, $sent ? 'sent' : 'NOT sent' );
	}

	update_option( 'hansea_oneoff_staff_cr_dr_result', gmdate( 'c' ) . ' ' . implode( ' | ', $notes ), false );
	delete_option( 'hansea_oneoff_staff_cr_dr_lock' );
	@unlink( __FILE__ );
}, 20 );
