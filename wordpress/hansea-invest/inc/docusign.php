<?php
/**
 * DocuSign eSignature connection (JWT grant, server-to-server).
 *
 * Credentials are entered under Einstellungen → DocuSign in wp-admin, or set
 * as constants in wp-config.php (constants win, e.g.
 * define( 'HANSEA_DOCUSIGN_PRIVATE_KEY', '-----BEGIN RSA PRIVATE KEY-----…' );).
 * They are never part of the theme or the repository.
 *
 * See docs/DOCUSIGN.md in the repository for the setup steps.
 */

defined( 'ABSPATH' ) || exit;

/** Setting key => [label, constant, secret]. Secrets are write-only in the form. */
const HANSEA_DOCUSIGN_SETTINGS = array(
	'environment'        => array( 'Umgebung', 'HANSEA_DOCUSIGN_ENVIRONMENT', false ),
	'integration_key'    => array( 'Integration Key', 'HANSEA_DOCUSIGN_INTEGRATION_KEY', false ),
	'user_id'            => array( 'API-Benutzer-ID (User ID)', 'HANSEA_DOCUSIGN_USER_ID', false ),
	'account_id'         => array( 'API Account ID', 'HANSEA_DOCUSIGN_ACCOUNT_ID', false ),
	'private_key'        => array( 'RSA Private Key', 'HANSEA_DOCUSIGN_PRIVATE_KEY', true ),
	'hmac_secret'        => array( 'Connect-HMAC-Schlüssel', 'HANSEA_DOCUSIGN_HMAC_SECRET', true ),
	'signature_provider' => array( 'Signaturanbieter (QES)', 'HANSEA_DOCUSIGN_SIGNATURE_PROVIDER', false ),
);

function hansea_docusign_setting( $key ) {
	$constant = HANSEA_DOCUSIGN_SETTINGS[ $key ][1];
	if ( defined( $constant ) ) {
		return trim( (string) constant( $constant ) );
	}
	$value = trim( (string) get_option( 'hansea_docusign_' . $key, '' ) );
	return ( 'environment' === $key && 'production' !== $value ) ? 'demo' : $value;
}

function hansea_docusign_is_demo() {
	return 'production' !== hansea_docusign_setting( 'environment' );
}

/** True when everything needed to talk to DocuSign is entered. */
function hansea_docusign_configured() {
	foreach ( array( 'integration_key', 'user_id', 'private_key' ) as $key ) {
		if ( '' === hansea_docusign_setting( $key ) ) {
			return false;
		}
	}
	return true;
}

function hansea_docusign_oauth_host() {
	return hansea_docusign_is_demo() ? 'account-d.docusign.com' : 'account.docusign.com';
}

/** Where DocuSign sends the admin back after granting consent (register it in the app as redirect URI). */
function hansea_docusign_redirect_uri() {
	return admin_url( 'options-general.php?page=hansea-docusign' );
}

function hansea_docusign_webhook_url() {
	return rest_url( 'hansea/v1/docusign/webhook' );
}

/** One-time consent link for the API user ("signature impersonation"). */
function hansea_docusign_consent_url() {
	return 'https://' . hansea_docusign_oauth_host() . '/oauth/auth?' . http_build_query( array(
		'response_type' => 'code',
		'scope'         => 'signature impersonation',
		'client_id'     => hansea_docusign_setting( 'integration_key' ),
		'redirect_uri'  => hansea_docusign_redirect_uri(),
	), '', '&', PHP_QUERY_RFC3986 );
}

function hansea_base64url( $data ) {
	return rtrim( strtr( base64_encode( $data ), '+/', '-_' ), '=' );
}

/** Cache key that changes when the credentials change. */
function hansea_docusign_cache_key( $what ) {
	return 'hansea_ds_' . $what . '_' . md5( hansea_docusign_setting( 'environment' ) . hansea_docusign_setting( 'integration_key' ) . hansea_docusign_setting( 'user_id' ) . hansea_docusign_setting( 'account_id' ) );
}

/** Access token via JWT grant, cached until shortly before it expires. */
function hansea_docusign_token() {
	if ( ! hansea_docusign_configured() ) {
		return new WP_Error( 'hansea_docusign_unconfigured', 'DocuSign ist noch nicht eingerichtet.' );
	}
	$cache = hansea_docusign_cache_key( 'token' );
	$token = get_transient( $cache );
	if ( $token ) {
		return $token;
	}

	$key = openssl_pkey_get_private( str_replace( '\n', "\n", hansea_docusign_setting( 'private_key' ) ) );
	if ( ! $key ) {
		return new WP_Error( 'hansea_docusign_key', 'Der RSA Private Key ist ungültig.' );
	}
	$now    = time();
	$header = hansea_base64url( wp_json_encode( array( 'alg' => 'RS256', 'typ' => 'JWT' ) ) );
	$claims = hansea_base64url( wp_json_encode( array(
		'iss'   => hansea_docusign_setting( 'integration_key' ),
		'sub'   => hansea_docusign_setting( 'user_id' ),
		'aud'   => hansea_docusign_oauth_host(),
		'iat'   => $now,
		'exp'   => $now + HOUR_IN_SECONDS,
		'scope' => 'signature impersonation',
	) ) );
	if ( ! openssl_sign( $header . '.' . $claims, $signature, $key, OPENSSL_ALGO_SHA256 ) ) {
		return new WP_Error( 'hansea_docusign_key', 'Die Anmeldung bei DocuSign konnte nicht signiert werden.' );
	}

	$response = wp_remote_post( 'https://' . hansea_docusign_oauth_host() . '/oauth/token', array(
		'timeout' => 20,
		'body'    => array(
			'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			'assertion'  => $header . '.' . $claims . '.' . hansea_base64url( $signature ),
		),
	) );
	if ( is_wp_error( $response ) ) {
		return $response;
	}
	$body = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( empty( $body['access_token'] ) ) {
		$error = $body['error'] ?? 'unbekannter Fehler';
		if ( 'consent_required' === $error ) {
			return new WP_Error( 'hansea_docusign_consent', 'Die Zustimmung für die API-Nutzung fehlt noch (Einstellungen → DocuSign → „Zustimmung erteilen“).' );
		}
		return new WP_Error( 'hansea_docusign_auth', 'DocuSign-Anmeldung fehlgeschlagen: ' . $error );
	}
	set_transient( $cache, $body['access_token'], max( 60, (int) ( $body['expires_in'] ?? 3600 ) - 300 ) );
	return $body['access_token'];
}

/** The account to work in: ['id', 'name', 'base'] where base is the REST URL for the account. */
function hansea_docusign_account() {
	$cache   = hansea_docusign_cache_key( 'account' );
	$account = get_transient( $cache );
	if ( $account ) {
		return $account;
	}
	$token = hansea_docusign_token();
	if ( is_wp_error( $token ) ) {
		return $token;
	}
	$response = wp_remote_get( 'https://' . hansea_docusign_oauth_host() . '/oauth/userinfo', array(
		'timeout' => 20,
		'headers' => array( 'Authorization' => 'Bearer ' . $token ),
	) );
	if ( is_wp_error( $response ) ) {
		return $response;
	}
	$info   = json_decode( wp_remote_retrieve_body( $response ), true );
	$wanted = hansea_docusign_setting( 'account_id' );
	foreach ( (array) ( $info['accounts'] ?? array() ) as $candidate ) {
		if ( $wanted ? $candidate['account_id'] === $wanted : ! empty( $candidate['is_default'] ) ) {
			$account = array(
				'id'   => $candidate['account_id'],
				'name' => $candidate['account_name'] ?? '',
				'base' => rtrim( $candidate['base_uri'], '/' ) . '/restapi/v2.1/accounts/' . $candidate['account_id'],
			);
			set_transient( $cache, $account, DAY_IN_SECONDS );
			return $account;
		}
	}
	return new WP_Error( 'hansea_docusign_account', $wanted ? 'Das DocuSign-Konto mit dieser Account ID ist für den API-Benutzer nicht verfügbar.' : 'Kein DocuSign-Konto gefunden.' );
}

/**
 * Call the eSignature REST API.
 *
 * @param string     $method GET, POST or PUT.
 * @param string     $path   Path below the account, e.g. '/envelopes'.
 * @param array|null $body   JSON body.
 * @param bool       $raw    Return the raw body (documents) instead of decoded JSON.
 * @return array|string|WP_Error
 */
function hansea_docusign_request( $method, $path, $body = null, $raw = false ) {
	$account = hansea_docusign_account();
	if ( is_wp_error( $account ) ) {
		return $account;
	}
	$args = array(
		'method'  => $method,
		'timeout' => 30,
		'headers' => array(
			'Authorization' => 'Bearer ' . hansea_docusign_token(),
			'Accept'        => $raw ? 'application/pdf' : 'application/json',
		),
	);
	if ( null !== $body ) {
		$args['headers']['Content-Type'] = 'application/json';
		$args['body']                    = wp_json_encode( $body );
	}
	$response = wp_remote_request( $account['base'] . $path, $args );
	if ( is_wp_error( $response ) ) {
		return $response;
	}
	$code = wp_remote_retrieve_response_code( $response );
	$data = wp_remote_retrieve_body( $response );
	if ( $code < 200 || $code >= 300 ) {
		$error = json_decode( $data, true );
		return new WP_Error( 'hansea_docusign_api', 'DocuSign: ' . ( $error['message'] ?? $error['errorCode'] ?? 'HTTP ' . $code ) );
	}
	return $raw ? $data : (array) json_decode( $data, true );
}

/* ---------------------------------------------------------------------------
 * Settings page: Einstellungen → DocuSign
 * ------------------------------------------------------------------------ */

add_action( 'admin_menu', function () {
	add_options_page( 'DocuSign', 'DocuSign', 'manage_options', 'hansea-docusign', 'hansea_docusign_settings_page' );
} );

add_action( 'admin_post_hansea_docusign_save', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Keine Berechtigung.' );
	}
	check_admin_referer( 'hansea_docusign_save' );

	foreach ( HANSEA_DOCUSIGN_SETTINGS as $key => list( , , $secret ) ) {
		$field = 'hansea_docusign_' . $key;
		if ( ! isset( $_POST[ $field ] ) ) {
			continue;
		}
		$value = trim( wp_unslash( (string) $_POST[ $field ] ) );
		if ( 'private_key' === $key ) {
			$value = sanitize_textarea_field( $value );
		} else {
			$value = sanitize_text_field( $value );
		}
		// Secret fields are left empty to keep the stored value.
		if ( $secret && '' === $value && empty( $_POST[ $field . '_clear' ] ) ) {
			continue;
		}
		update_option( $field, $value, false );
	}
	delete_transient( hansea_docusign_cache_key( 'token' ) );
	delete_transient( hansea_docusign_cache_key( 'account' ) );

	wp_safe_redirect( add_query_arg( 'hansea_notice', 'saved', hansea_docusign_redirect_uri() ) );
	exit;
} );

add_action( 'admin_post_hansea_docusign_test', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Keine Berechtigung.' );
	}
	check_admin_referer( 'hansea_docusign_test' );
	delete_transient( hansea_docusign_cache_key( 'token' ) );
	delete_transient( hansea_docusign_cache_key( 'account' ) );

	$account = hansea_docusign_account();
	set_transient( 'hansea_ds_test_' . get_current_user_id(), is_wp_error( $account )
		? array( 'ok' => false, 'message' => $account->get_error_message() )
		: array( 'ok' => true, 'message' => sprintf( 'Verbindung steht: Konto „%s“ (%s).', $account['name'], $account['id'] ) ), 60 );

	wp_safe_redirect( add_query_arg( 'hansea_notice', 'tested', hansea_docusign_redirect_uri() ) );
	exit;
} );

function hansea_docusign_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$notice = isset( $_GET['hansea_notice'] ) ? sanitize_key( $_GET['hansea_notice'] ) : '';
	?>
	<div class="wrap">
		<h1>DocuSign</h1>
		<p>Digitale Unterschrift der Beitrittserklärung im Mitgliederbereich. Eingegangene Erklärungen finden Sie unter <a href="<?php echo esc_url( admin_url( 'edit.php?post_type=hansea_beitritt' ) ); ?>">Beitrittserklärungen</a>.</p>

		<?php if ( 'saved' === $notice ) : ?>
			<div class="notice notice-success"><p>Gespeichert.</p></div>
		<?php elseif ( 'tested' === $notice ) : ?>
			<?php $result = get_transient( 'hansea_ds_test_' . get_current_user_id() ); ?>
			<?php if ( $result ) : ?>
				<div class="notice notice-<?php echo $result['ok'] ? 'success' : 'error'; ?>"><p><?php echo esc_html( $result['message'] ); ?></p></div>
			<?php endif; ?>
		<?php elseif ( isset( $_GET['code'] ) ) : ?>
			<div class="notice notice-success"><p>Zustimmung erteilt. Testen Sie jetzt die Verbindung.</p></div>
		<?php endif; ?>

		<h2>Status</h2>
		<p>
			<?php if ( hansea_docusign_configured() ) : ?>
				<strong>Eingerichtet</strong> · Umgebung: <?php echo hansea_docusign_is_demo() ? 'Demo (Testkonto, Unterschriften nicht rechtsgültig)' : '<strong>Produktion</strong>'; ?>
			<?php else : ?>
				<strong>Noch nicht eingerichtet.</strong> Bis dahin speichert der Mitgliederbereich Beitrittserklärungen ohne Unterschrift und meldet sie per E-Mail.
			<?php endif; ?>
		</p>

		<h2>Zugangsdaten</h2>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="hansea_docusign_save">
			<?php wp_nonce_field( 'hansea_docusign_save' ); ?>
			<table class="form-table" role="presentation">
				<?php foreach ( HANSEA_DOCUSIGN_SETTINGS as $key => list( $label, $constant, $secret ) ) : ?>
					<?php
					$field  = 'hansea_docusign_' . $key;
					$locked = defined( $constant );
					$value  = hansea_docusign_setting( $key );
					?>
					<tr>
						<th scope="row"><label for="<?php echo esc_attr( $field ); ?>"><?php echo esc_html( $label ); ?></label></th>
						<td>
							<?php if ( $locked ) : ?>
								<p><em>In wp-config.php gesetzt (<?php echo esc_html( $constant ); ?>).</em></p>
							<?php elseif ( 'environment' === $key ) : ?>
								<select id="<?php echo esc_attr( $field ); ?>" name="<?php echo esc_attr( $field ); ?>">
									<option value="demo" <?php selected( $value, 'demo' ); ?>>Demo (account-d.docusign.com)</option>
									<option value="production" <?php selected( $value, 'production' ); ?>>Produktion (account.docusign.com)</option>
								</select>
							<?php elseif ( 'private_key' === $key ) : ?>
								<textarea id="<?php echo esc_attr( $field ); ?>" name="<?php echo esc_attr( $field ); ?>" rows="6" cols="70" class="code" autocomplete="off" placeholder="<?php echo $value ? 'Hinterlegt. Zum Ersetzen neuen Schlüssel einfügen.' : '-----BEGIN RSA PRIVATE KEY----- …'; ?>"></textarea>
							<?php elseif ( $secret ) : ?>
								<input id="<?php echo esc_attr( $field ); ?>" name="<?php echo esc_attr( $field ); ?>" type="password" class="regular-text" autocomplete="new-password" placeholder="<?php echo $value ? 'Hinterlegt. Zum Ersetzen neu eingeben.' : ''; ?>">
							<?php else : ?>
								<input id="<?php echo esc_attr( $field ); ?>" name="<?php echo esc_attr( $field ); ?>" type="text" class="regular-text code" value="<?php echo esc_attr( $value ); ?>" autocomplete="off">
							<?php endif; ?>

							<?php if ( $secret && $value && ! $locked ) : ?>
								<label style="display:block;margin-top:4px"><input type="checkbox" name="<?php echo esc_attr( $field ); ?>_clear" value="1"> Entfernen</label>
							<?php endif; ?>
							<?php if ( 'account_id' === $key ) : ?>
								<p class="description">Leer lassen, um das Standardkonto des API-Benutzers zu verwenden.</p>
							<?php elseif ( 'hmac_secret' === $key ) : ?>
								<p class="description">Optional. Wenn gesetzt, werden nur signierte Statusmeldungen von DocuSign angenommen.</p>
							<?php elseif ( 'signature_provider' === $key ) : ?>
								<p class="description">Optional. Nur für qualifizierte elektronische Signatur (QES); den genauen Namen nennt DocuSign bei der Freischaltung. Leer = einfache elektronische Signatur.</p>
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
			</table>
			<?php submit_button( 'Speichern' ); ?>
		</form>

		<h2>In DocuSign eintragen</h2>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">Redirect URI</th>
				<td><code><?php echo esc_html( hansea_docusign_redirect_uri() ); ?></code><p class="description">Unter Apps and Keys → Ihre App → Additional settings → Redirect URIs.</p></td>
			</tr>
			<tr>
				<th scope="row">Webhook (Connect)</th>
				<td><code><?php echo esc_html( hansea_docusign_webhook_url() ); ?></code><p class="description">Wird automatisch mit jedem Umschlag übergeben; nichts weiter einzurichten.</p></td>
			</tr>
		</table>

		<?php if ( hansea_docusign_configured() ) : ?>
			<h2>Verbindung</h2>
			<p>
				<a class="button" href="<?php echo esc_url( hansea_docusign_consent_url() ); ?>">1. Zustimmung erteilen</a>
				<span class="description">Einmalig, mit dem Login des API-Benutzers.</span>
			</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="hansea_docusign_test">
				<?php wp_nonce_field( 'hansea_docusign_test' ); ?>
				<?php submit_button( '2. Verbindung testen', 'secondary', 'submit', false ); ?>
			</form>
		<?php endif; ?>
	</div>
	<?php
}
