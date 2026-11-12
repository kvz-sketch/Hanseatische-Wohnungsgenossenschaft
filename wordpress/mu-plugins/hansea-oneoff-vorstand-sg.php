<?php
/**
 * One-time change, then deletes itself: Vorstand access for Stephan Gerlach
 * (sg@gerlachgroup.de). He decides on ordentliche Mitglieder in the
 * Mitgliederliste (role "Vorstand", inc/crm.php).
 * - Account with that email exists: the role Vorstand is added; its other
 *   roles (e.g. administrator) stay.
 * - No account yet: one is created with the role Vorstand, and he gets an
 *   email to set his password. Two-factor login is set up at the first login.
 * The outcome is noted in hansea-oneoff-vorstand-result.php next to this file
 * (no output on the web).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	// After inc/crm.php has created the roles (init, priority 10)
	if ( ! get_role( 'vorstand' ) || ! function_exists( 'hansea_welcome_link' ) ) {
		return;
	}
	if ( ! add_option( 'hansea_oneoff_vorstand_sg_lock', time(), '', 'no' ) ) {
		return;
	}
	$email = 'sg@gerlachgroup.de';
	$user  = get_user_by( 'email', $email );
	$note  = '';

	if ( $user ) {
		$user->add_role( 'vorstand' );
		if ( ! $user->first_name && ! $user->last_name ) {
			wp_update_user( array( 'ID' => $user->ID, 'first_name' => 'Stephan', 'last_name' => 'Gerlach' ) );
		}
		$note = sprintf( 'existing account %d, roles now: %s', $user->ID, implode( ', ', get_userdata( $user->ID )->roles ) );
	} else {
		$id = wp_insert_user( array(
			'user_login'   => 'stephan.gerlach',
			'user_email'   => $email,
			'user_pass'    => wp_generate_password( 32, true, true ),
			'first_name'   => 'Stephan',
			'last_name'    => 'Gerlach',
			'display_name' => 'Stephan Gerlach',
			'role'         => 'vorstand',
		) );
		if ( is_wp_error( $id ) ) {
			$note = 'could not create account: ' . $id->get_error_message();
		} else {
			$user = get_userdata( $id );
			$link = hansea_welcome_link( $user );
			$sent = ! is_wp_error( $link ) && wp_mail( $email, 'Ihr Zugang zur Mitgliederliste der Hanseatischen Invest eG', hansea_email_html( array(
				'eyebrow'   => 'Vorstand',
				'title'     => 'Ihr Zugang zur Mitgliederliste',
				'preheader' => 'Zugang zur Mitgliederliste: Zustimmung zu ordentlichen Mitgliedern.',
				'html'      => array(
					'Guten Tag Herr Gerlach,',
					'für Sie ist ein Zugang zur Mitgliederliste der Hanseatischen Invest eG eingerichtet. Über ordentliche Mitglieder entscheidet der Vorstand: Sie erhalten eine E-Mail, sobald Ihnen eine Aufnahme, Kündigung oder ein Ausscheiden zur Zustimmung vorliegt, und stimmen in der Mitgliederliste ab.',
					'<strong>Ihre Zugangsdaten</strong><br>Anmeldeseite: <a href="' . esc_url( home_url( '/login/' ) ) . '" style="color:#141A46;">' . esc_html( preg_replace( '~^https?://~', '', home_url( '/login/' ) ) ) . '</a><br>Benutzername: ' . esc_html( $email ) . '<br>Passwort: legen Sie über den Button unten selbst fest',
					'Bei der ersten Anmeldung richten Sie die Zwei-Faktor-Anmeldung mit einer Authenticator-App ein.',
				),
				'button'    => array( 'label' => 'Passwort festlegen', 'url' => $link ),
				'note'      => hansea_welcome_note(),
			) ), array( 'Content-Type: text/html; charset=UTF-8' ) );
			$note = sprintf( 'created account %d (role vorstand), password email %s', $id, $sent ? 'sent' : 'NOT sent' );
		}
	}

	@file_put_contents( __DIR__ . '/hansea-oneoff-vorstand-result.php', "<?php exit; // " . gmdate( 'c' ) . ' ' . str_replace( array( "\n", '?>' ), ' ', $note ) . "\n" );
	delete_option( 'hansea_oneoff_vorstand_sg_lock' );
	@unlink( __FILE__ );
}, 20 );
