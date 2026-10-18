<?php
/**
 * Member accounts are created by the team, not by visitors.
 *
 * Benutzer → Mitglied anlegen creates the account and sends the branded
 * welcome email: the member's login (their email address) and a button to
 * set their own password, after which they are signed in. Passwords are
 * never emailed. The users list has "Willkommensmail senden" to resend it,
 * and WordPress's own "Neuen Benutzer benachrichtigen" email is branded the
 * same way.
 */

defined( 'ABSPATH' ) || exit;

/** How long the welcome link stays valid (a reset link is valid for one day). */
const HANSEA_WELCOME_LINK_DAYS = 14;

// No self-registration through WordPress either.
add_filter( 'option_users_can_register', '__return_zero' );

/**
 * Subject and HTML of the welcome email for a user, with a fresh set-password link.
 *
 * @return array{subject:string, message:string}|WP_Error
 */
function hansea_welcome_email( WP_User $user, $note = '' ) {
	$key = get_password_reset_key( $user );
	if ( is_wp_error( $key ) ) {
		return $key;
	}
	// The key's timestamp is moved forward so the link lasts HANSEA_WELCOME_LINK_DAYS
	// days under WordPress's one-day reset expiry; resets stay at one day.
	global $wpdb;
	list( , $hash ) = explode( ':', $wpdb->get_var( $wpdb->prepare( "SELECT user_activation_key FROM {$wpdb->users} WHERE ID = %d", $user->ID ) ), 2 );
	$wpdb->update( $wpdb->users, array( 'user_activation_key' => ( time() + ( HANSEA_WELCOME_LINK_DAYS - 1 ) * DAY_IN_SECONDS ) . ':' . $hash ), array( 'ID' => $user->ID ) );
	clean_user_cache( $user );

	$link  = hansea_password_url( array( 'key' => $key, 'login' => rawurlencode( $user->user_login ), 'willkommen' => 1 ) );
	$name  = trim( $user->first_name . ' ' . $user->last_name );
	$login = esc_url( home_url( '/login/' ) );
	$html  = array(
		esc_html( $name ? "Guten Tag {$name}," : 'Guten Tag,' ),
		'herzlich willkommen bei der Hanseatischen Invest eG. Wir haben Ihren persönlichen Mitgliederbereich eingerichtet. Dort sehen Sie Ihre Anteile, die Projekte, in die Ihr Geld fließt, jede Ausschüttung und Ihre Dokumente.',
	);
	if ( '' !== trim( $note ) ) {
		$html[] = nl2br( esc_html( trim( $note ) ) );
	}
	$html[] = '<strong>Ihre Zugangsdaten</strong><br>'
		. 'Anmeldeseite: <a href="' . $login . '" style="color:#141A46;">' . esc_html( preg_replace( '~^https?://~', '', home_url( '/login/' ) ) ) . '</a><br>'
		. 'Benutzername: ' . esc_html( $user->user_email ) . '<br>'
		. 'Passwort: legen Sie über den Button unten selbst fest';

	return array(
		'subject' => 'Willkommen bei der Hanseatischen Invest eG – Ihr Mitgliederbereich',
		'message' => hansea_email_html( array(
			'eyebrow'   => 'Willkommen',
			'title'     => 'Ihr Mitgliederbereich ist bereit',
			'preheader' => 'Ihre Zugangsdaten für den Mitgliederbereich der Hanseatischen Invest eG.',
			'html'      => $html,
			'button'    => array( 'label' => 'Passwort festlegen und anmelden', 'url' => $link ),
			'note'      => sprintf( 'Der Link ist %d Tage gültig und kann einmal verwendet werden. Danach melden Sie sich jederzeit mit Ihrer E-Mail-Adresse und Ihrem Passwort an; über „Passwort vergessen?“ auf der Anmeldeseite erhalten Sie bei Bedarf einen neuen Link. Fragen? Rufen Sie uns an: +49 40 22862372-0.', HANSEA_WELCOME_LINK_DAYS ),
		) ),
	);
}

function hansea_send_welcome( WP_User $user, $note = '' ) {
	$email = hansea_welcome_email( $user, $note );
	if ( is_wp_error( $email ) ) {
		return false;
	}
	$sent = wp_mail( $user->user_email, $email['subject'], $email['message'], array( 'Content-Type: text/html; charset=UTF-8' ) );
	if ( $sent ) {
		update_user_meta( $user->ID, 'hansea_welcome_sent', current_time( 'mysql', true ) );
	}
	return $sent;
}

/** WordPress's "notify the new user" email gets the same welcome content. */
add_filter( 'wp_new_user_notification_email', function ( $email, $user ) {
	$welcome = hansea_welcome_email( $user );
	if ( is_wp_error( $welcome ) ) {
		return $email;
	}
	update_user_meta( $user->ID, 'hansea_welcome_sent', current_time( 'mysql', true ) );
	return array_merge( $email, $welcome, array( 'headers' => array( 'Content-Type: text/html; charset=UTF-8' ) ) );
}, 10, 2 );

/* ---------------------------------------------------------------------------
 * Benutzer → Mitglied anlegen
 * ------------------------------------------------------------------------ */

add_action( 'admin_menu', function () {
	add_users_page( 'Mitglied anlegen', 'Mitglied anlegen', 'create_users', 'hansea-mitglied', 'hansea_member_create_page' );
} );

add_action( 'admin_post_hansea_member_create', function () {
	if ( ! current_user_can( 'create_users' ) ) {
		wp_die( 'Keine Berechtigung.' );
	}
	check_admin_referer( 'hansea_member_create' );

	$first = sanitize_text_field( wp_unslash( $_POST['first_name'] ?? '' ) );
	$last  = sanitize_text_field( wp_unslash( $_POST['last_name'] ?? '' ) );
	$email = sanitize_email( wp_unslash( $_POST['email'] ?? '' ) );
	$note  = sanitize_textarea_field( wp_unslash( $_POST['note'] ?? '' ) );
	$send  = ! empty( $_POST['send_welcome'] );
	$back  = admin_url( 'users.php?page=hansea-mitglied' );

	if ( '' === $first || '' === $last || ! is_email( $email ) ) {
		wp_safe_redirect( add_query_arg( 'hansea_notice', 'invalid', $back ) );
		exit;
	}
	if ( email_exists( $email ) ) {
		wp_safe_redirect( add_query_arg( 'hansea_notice', 'exists', $back ) );
		exit;
	}
	// Members sign in with their email; the username is just a unique handle.
	do {
		$login = 'mitglied_' . strtolower( wp_generate_password( 10, false, false ) );
	} while ( username_exists( $login ) );

	$user_id = wp_insert_user( array(
		'user_login'   => $login,
		'user_email'   => $email,
		'user_pass'    => wp_generate_password( 32, true, true ), // replaced by the member via the welcome link
		'first_name'   => $first,
		'last_name'    => $last,
		'display_name' => trim( $first . ' ' . $last ),
		'role'         => 'subscriber',
	) );
	if ( is_wp_error( $user_id ) ) {
		wp_safe_redirect( add_query_arg( 'hansea_notice', 'failed', $back ) );
		exit;
	}
	update_user_meta( $user_id, 'hansea_created_by', get_current_user_id() );

	$notice = 'created';
	if ( $send ) {
		$notice = hansea_send_welcome( get_userdata( $user_id ), $note ) ? 'created_sent' : 'created_unsent';
	}
	wp_safe_redirect( add_query_arg( array( 'hansea_notice' => $notice, 'user' => $user_id ), $back ) );
	exit;
} );

function hansea_member_create_page() {
	$notice   = isset( $_GET['hansea_notice'] ) ? sanitize_key( $_GET['hansea_notice'] ) : '';
	$messages = array(
		'invalid'        => array( 'error', 'Bitte Vorname, Nachname und eine gültige E-Mail-Adresse angeben.' ),
		'exists'         => array( 'error', 'Für diese E-Mail-Adresse gibt es bereits ein Konto. Die Willkommensmail können Sie in der Benutzerliste erneut senden.' ),
		'failed'         => array( 'error', 'Das Konto konnte nicht angelegt werden.' ),
		'created'        => array( 'success', 'Mitglied angelegt. Die Willkommensmail können Sie später in der Benutzerliste senden.' ),
		'created_sent'   => array( 'success', 'Mitglied angelegt und Willkommensmail gesendet.' ),
		'created_unsent' => array( 'warning', 'Mitglied angelegt, aber die Willkommensmail konnte nicht gesendet werden. Bitte in der Benutzerliste erneut versuchen.' ),
	);
	?>
	<div class="wrap">
		<h1>Mitglied anlegen</h1>
		<p>Legt den Zugang zum Mitgliederbereich an. Das Mitglied erhält eine Willkommensmail mit seinem Benutzernamen (der E-Mail-Adresse) und einem Link, über den es sein Passwort selbst festlegt.</p>
		<?php if ( isset( $messages[ $notice ] ) ) : ?>
			<div class="notice notice-<?php echo esc_attr( $messages[ $notice ][0] ); ?>"><p><?php echo esc_html( $messages[ $notice ][1] ); ?></p></div>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="hansea_member_create">
			<?php wp_nonce_field( 'hansea_member_create' ); ?>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="hs-first">Vorname</label></th><td><input id="hs-first" name="first_name" type="text" class="regular-text" required></td></tr>
				<tr><th scope="row"><label for="hs-last">Nachname</label></th><td><input id="hs-last" name="last_name" type="text" class="regular-text" required></td></tr>
				<tr><th scope="row"><label for="hs-email">E-Mail-Adresse</label></th><td><input id="hs-email" name="email" type="email" class="regular-text" required><p class="description">Wird zum Benutzernamen für die Anmeldung.</p></td></tr>
				<tr><th scope="row"><label for="hs-note">Persönliche Zeile</label></th><td><textarea id="hs-note" name="note" rows="3" class="large-text" placeholder="Optional, z. B. „Schön, dass wir uns letzte Woche am Telefon kennengelernt haben.“"></textarea><p class="description">Erscheint in der Willkommensmail.</p></td></tr>
				<tr><th scope="row">Willkommensmail</th><td><label><input name="send_welcome" type="checkbox" value="1" checked> Jetzt senden</label></td></tr>
			</table>
			<?php submit_button( 'Mitglied anlegen' ); ?>
		</form>
	</div>
	<?php
}

/* ---------------------------------------------------------------------------
 * Users list: "Willkommensmail senden" and when it was last sent
 * ------------------------------------------------------------------------ */

add_filter( 'user_row_actions', function ( $actions, $user ) {
	if ( current_user_can( 'create_users' ) && ! user_can( $user, 'edit_posts' ) ) {
		$url = wp_nonce_url( admin_url( 'admin-post.php?action=hansea_welcome_send&user=' . $user->ID ), 'hansea_welcome_send_' . $user->ID );
		$actions['hansea_welcome'] = '<a href="' . esc_url( $url ) . '">Willkommensmail senden</a>';
	}
	return $actions;
}, 10, 2 );

add_action( 'admin_post_hansea_welcome_send', function () {
	$user_id = isset( $_GET['user'] ) ? (int) $_GET['user'] : 0;
	check_admin_referer( 'hansea_welcome_send_' . $user_id );
	$user = get_userdata( $user_id );
	if ( ! current_user_can( 'create_users' ) || ! $user || user_can( $user, 'edit_posts' ) ) {
		wp_die( 'Keine Berechtigung.' );
	}
	$sent = hansea_send_welcome( $user );
	wp_safe_redirect( add_query_arg( 'hansea_welcome', $sent ? 'sent' : 'failed', admin_url( 'users.php' ) ) );
	exit;
} );

add_action( 'admin_notices', function () {
	$screen = get_current_screen();
	if ( ! $screen || 'users' !== $screen->id || ! isset( $_GET['hansea_welcome'] ) ) {
		return;
	}
	$ok = 'sent' === $_GET['hansea_welcome'];
	printf( '<div class="notice notice-%s is-dismissible"><p>%s</p></div>', $ok ? 'success' : 'error', $ok ? 'Willkommensmail gesendet.' : 'Die Willkommensmail konnte nicht gesendet werden.' );
} );

add_filter( 'manage_users_columns', function ( $columns ) {
	$columns['hansea_welcome'] = 'Willkommensmail';
	return $columns;
} );

add_filter( 'manage_users_custom_column', function ( $output, $column, $user_id ) {
	if ( 'hansea_welcome' !== $column ) {
		return $output;
	}
	$sent = get_user_meta( $user_id, 'hansea_welcome_sent', true );
	return $sent ? esc_html( wp_date( 'd.m.Y H:i', strtotime( $sent . ' UTC' ) ) ) : '–';
}, 10, 3 );
