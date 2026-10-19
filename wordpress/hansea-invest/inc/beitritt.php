<?php
/**
 * Beitrittserklärung (membership declaration) from the members' area.
 *
 * The member fills in the form in the dashboard; the theme generates the
 * declaration with their data, creates a DocuSign envelope and sends the
 * member to DocuSign's signing page (embedded signing, they come back to
 * /mitglieder/). The signed PDF is fetched from DocuSign, stored outside the
 * public uploads and shown in the portal and in wp-admin.
 *
 * Without DocuSign credentials the declaration is stored and emailed to the
 * team as "eingegangen" so the flow can be used before the account exists.
 */

defined( 'ABSPATH' ) || exit;

const HANSEA_SHARE_PRICE = 10000; // one Geschäftsanteil
const HANSEA_MIN_UNITS   = 1;     // 10.000 €
const HANSEA_MAX_UNITS   = 200;   // 2 Mio. €

/** The consent shown with the form; bump the version whenever the text changes. */
const HANSEA_BEITRITT_CONSENT = array(
	'version' => '2026-10-18',
	'text'    => 'Ich habe die Satzung, den Risikohinweis und die Datenschutzhinweise der Hanseatischen Invest eG erhalten und gelesen. Ich bin einverstanden, dass meine Angaben für die Beitrittserklärung an DocuSign übermittelt werden, damit ich sie digital unterschreiben kann.',
);

const HANSEA_BEITRITT_STATUS = array(
	'entwurf'        => 'Unterschrift ausstehend',
	'unterschrieben' => 'Unterschrieben',
	'abgelehnt'      => 'Abgelehnt',
	'storniert'      => 'Storniert',
	'eingegangen'    => 'Eingegangen (ohne digitale Unterschrift)',
);

add_action( 'init', function () {
	register_post_type( 'hansea_beitritt', array(
		'labels'          => array(
			'name'          => 'Beitrittserklärungen',
			'singular_name' => 'Beitrittserklärung',
			'all_items'     => 'Beitrittserklärungen',
			'edit_item'     => 'Beitrittserklärung',
		),
		'public'          => false,
		'show_ui'         => true,
		'menu_icon'       => 'dashicons-media-document',
		'menu_position'   => 26,
		'supports'        => array( 'title' ),
		'capability_type' => 'post',
		'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
		'map_meta_cap'    => true,
	) );
} );

/* ---------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------ */

/** The member's latest declaration post, or null. */
function hansea_beitritt_for_user( $user_id ) {
	$posts = get_posts( array(
		'post_type'      => 'hansea_beitritt',
		'post_status'    => 'private',
		'posts_per_page' => 1,
		'orderby'        => 'date',
		'order'          => 'DESC',
		'meta_key'       => '_hansea_user',
		'meta_value'     => (int) $user_id,
	) );
	return $posts ? $posts[0] : null;
}

function hansea_beitritt_by_envelope( $envelope_id ) {
	$posts = get_posts( array(
		'post_type'      => 'hansea_beitritt',
		'post_status'    => 'private',
		'posts_per_page' => 1,
		'meta_key'       => '_hansea_envelope',
		'meta_value'     => $envelope_id,
	) );
	return $posts ? $posts[0] : null;
}

/** What the dashboard gets about the member's declaration. */
function hansea_beitritt_payload( $post ) {
	if ( ! $post ) {
		return null;
	}
	$signed = get_post_meta( $post->ID, '_hansea_signed_at', true );
	return array(
		'status'      => get_post_meta( $post->ID, '_hansea_status', true ),
		'data'        => (array) get_post_meta( $post->ID, '_hansea_data', true ),
		'submittedAt' => mysql_to_rfc3339( $post->post_date_gmt ),
		'signedAt'    => $signed ? mysql_to_rfc3339( $signed ) : null,
		'hasDocument' => (bool) get_post_meta( $post->ID, '_hansea_pdf', true ),
	);
}

/** Config for window.HANSEA.beitritt (members only). */
function hansea_beitritt_config() {
	if ( ! is_user_logged_in() ) {
		return null;
	}
	return array(
		'signingEnabled' => hansea_docusign_configured(),
		'demo'           => hansea_docusign_is_demo(),
		'consent'        => HANSEA_BEITRITT_CONSENT,
		'minUnits'       => HANSEA_MIN_UNITS,
		'maxUnits'       => HANSEA_MAX_UNITS,
		'sharePrice'     => HANSEA_SHARE_PRICE,
		'application'    => hansea_beitritt_payload( hansea_beitritt_for_user( get_current_user_id() ) ),
	);
}

/** Folder for signed documents, not reachable over the web. */
function hansea_private_dir() {
	$dir = trailingslashit( wp_upload_dir()['basedir'] ) . 'hansea-private';
	if ( ! is_dir( $dir ) ) {
		wp_mkdir_p( $dir );
	}
	if ( ! file_exists( $dir . '/.htaccess' ) ) {
		file_put_contents( $dir . '/.htaccess', "Require all denied\nDeny from all\n" );
		file_put_contents( $dir . '/index.php', "<?php // Silence.\n" );
	}
	return $dir;
}

function hansea_beitritt_pdf_path( $post_id ) {
	$file = get_post_meta( $post_id, '_hansea_pdf', true );
	$path = $file ? hansea_private_dir() . '/' . basename( $file ) : '';
	return $path && is_readable( $path ) ? $path : '';
}

function hansea_euro( $amount ) {
	return number_format( $amount, 0, ',', '.' ) . ' €';
}

/* ---------------------------------------------------------------------------
 * Document and envelope
 * ------------------------------------------------------------------------ */

/** HTML of the declaration; DocuSign converts it to PDF. The white anchors mark the signature fields. */
function hansea_beitritt_document( WP_User $user, array $data ) {
	ob_start();
	include __DIR__ . '/beitritt-dokument.php';
	return (string) ob_get_clean();
}

/** Create the envelope for a declaration; returns the envelope ID. */
function hansea_beitritt_create_envelope( $post_id, WP_User $user, array $data ) {
	$signer = array(
		'email'        => $user->user_email,
		'name'         => trim( $user->first_name . ' ' . $user->last_name ),
		'recipientId'  => '1',
		'routingOrder' => '1',
		'clientUserId' => (string) $user->ID,
		'tabs'         => array(
			'signHereTabs'   => array( array( 'anchorString' => '/hs_sig/', 'anchorUnits' => 'pixels', 'anchorYOffset' => '-6' ) ),
			'dateSignedTabs' => array( array( 'anchorString' => '/hs_date/', 'anchorUnits' => 'pixels', 'anchorYOffset' => '-4' ) ),
		),
	);
	$provider = hansea_docusign_setting( 'signature_provider' );
	if ( '' !== $provider ) {
		$signer['recipientSignatureProviders'] = array( array( 'signatureProviderName' => $provider ) );
	}

	$envelope = hansea_docusign_request( 'POST', '/envelopes', array(
		'emailSubject'      => 'Ihre Beitrittserklärung zur Hanseatischen Invest eG',
		'documents'         => array( array(
			'documentId'     => '1',
			'name'           => 'Beitrittserklärung Hanseatische Invest eG',
			'fileExtension'  => 'html',
			'documentBase64' => base64_encode( hansea_beitritt_document( $user, $data ) ),
		) ),
		'recipients'        => array( 'signers' => array( $signer ) ),
		'customFields'      => array( 'textCustomFields' => array( array( 'name' => 'hansea_beitritt', 'value' => (string) $post_id, 'show' => 'false' ) ) ),
		'eventNotification' => array(
			'url'                  => hansea_docusign_webhook_url(),
			'requireAcknowledgment' => 'true',
			'includeHMAC'          => '' !== hansea_docusign_setting( 'hmac_secret' ) ? 'true' : 'false',
			'eventData'            => array( 'version' => 'restv2.1', 'format' => 'json' ),
			'events'               => array( 'envelope-completed', 'envelope-declined', 'envelope-voided' ),
		),
		'status'            => 'sent',
	) );
	if ( is_wp_error( $envelope ) ) {
		return $envelope;
	}
	return (string) $envelope['envelopeId'];
}

/** One-time signing link (valid a few minutes) for the member's open envelope. */
function hansea_beitritt_signing_url( $post_id, WP_User $user ) {
	$envelope_id = get_post_meta( $post_id, '_hansea_envelope', true );
	$view        = hansea_docusign_request( 'POST', '/envelopes/' . rawurlencode( $envelope_id ) . '/views/recipient', array(
		'returnUrl'            => home_url( '/mitglieder/?beitritt=zurueck' ),
		'authenticationMethod' => 'none',
		'email'                => $user->user_email,
		'userName'             => trim( $user->first_name . ' ' . $user->last_name ),
		'clientUserId'         => (string) $user->ID,
	) );
	return is_wp_error( $view ) ? $view : (string) $view['url'];
}

/** Pull the envelope status from DocuSign (never trusts the caller) and store the PDF once signed. */
function hansea_beitritt_sync( $post ) {
	$envelope_id = get_post_meta( $post->ID, '_hansea_envelope', true );
	$current     = get_post_meta( $post->ID, '_hansea_status', true );
	if ( ! $envelope_id || 'entwurf' !== $current ) {
		return $current;
	}
	$envelope = hansea_docusign_request( 'GET', '/envelopes/' . rawurlencode( $envelope_id ) );
	if ( is_wp_error( $envelope ) ) {
		return $envelope;
	}
	$map    = array( 'completed' => 'unterschrieben', 'declined' => 'abgelehnt', 'voided' => 'storniert' );
	$status = $map[ $envelope['status'] ?? '' ] ?? 'entwurf';
	if ( 'entwurf' === $status ) {
		return $status;
	}

	if ( 'unterschrieben' === $status ) {
		$pdf = hansea_docusign_request( 'GET', '/envelopes/' . rawurlencode( $envelope_id ) . '/documents/combined?certificate=true', null, true );
		if ( is_wp_error( $pdf ) ) {
			return $pdf; // retried on the next sync or webhook
		}
		$file = 'beitritt-' . $post->ID . '-' . wp_generate_password( 20, false, false ) . '.pdf';
		file_put_contents( hansea_private_dir() . '/' . $file, $pdf );
		update_post_meta( $post->ID, '_hansea_pdf', $file );
		update_post_meta( $post->ID, '_hansea_signed_at', gmdate( 'Y-m-d H:i:s', strtotime( $envelope['completedDateTime'] ?? 'now' ) ) );
	}
	update_post_meta( $post->ID, '_hansea_status', $status );
	hansea_beitritt_notify( $post->ID, $status );
	return $status;
}

/** Emails when a declaration is signed or stored without signature. */
function hansea_beitritt_notify( $post_id, $status ) {
	$user  = get_userdata( (int) get_post_meta( $post_id, '_hansea_user', true ) );
	$data  = (array) get_post_meta( $post_id, '_hansea_data', true );
	$admin = admin_url( 'post.php?post=' . $post_id . '&action=edit' );
	if ( ! $user ) {
		return;
	}
	$name   = trim( $user->first_name . ' ' . $user->last_name );
	$amount = hansea_euro( (int) $data['units'] * HANSEA_SHARE_PRICE );

	if ( in_array( $status, array( 'unterschrieben', 'eingegangen' ), true ) ) {
		wp_mail(
			get_option( 'admin_email' ),
			( 'unterschrieben' === $status ? 'Beitrittserklärung unterschrieben: ' : 'Neue Beitrittserklärung (ohne Unterschrift): ' ) . $name,
			"{$name} ({$user->user_email}) · {$data['units']} Anteile · {$amount}\n\n{$admin}"
		);
	}
	if ( 'unterschrieben' === $status ) {
		wp_mail(
			$user->user_email,
			'Ihre Beitrittserklärung ist eingegangen',
			hansea_email_html( array(
				'eyebrow'   => 'Mitgliederbereich',
				'title'     => 'Vielen Dank für Ihre Unterschrift',
				'preheader' => 'Ihre Beitrittserklärung zur Hanseatischen Invest eG ist bei uns eingegangen.',
				'html'      => array(
					esc_html( "Guten Tag {$name}," ),
					esc_html( "Ihre Beitrittserklärung über {$data['units']} Anteile ({$amount}) ist unterschrieben bei uns eingegangen. Das unterschriebene Dokument finden Sie jederzeit in Ihrem Mitgliederbereich." ),
					'Wir prüfen Ihre Angaben und melden uns mit den nächsten Schritten, einschließlich der Bankverbindung für Ihre Einzahlung.',
				),
				'button'    => array( 'label' => 'Zum Mitgliederbereich', 'url' => home_url( '/mitglieder/#beitritt' ) ),
			) ),
			array( 'Content-Type: text/html; charset=UTF-8' )
		);
	}
}

/* ---------------------------------------------------------------------------
 * REST
 * ------------------------------------------------------------------------ */

add_action( 'rest_api_init', function () {
	$member = function () {
		return is_user_logged_in();
	};
	register_rest_route( 'hansea/v1', '/beitritt/start', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_beitritt_start',
		'permission_callback' => $member,
	) );
	register_rest_route( 'hansea/v1', '/beitritt/resume', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_beitritt_resume',
		'permission_callback' => $member,
	) );
	register_rest_route( 'hansea/v1', '/beitritt/sync', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_beitritt_sync',
		'permission_callback' => $member,
	) );
	register_rest_route( 'hansea/v1', '/beitritt/document', array(
		'methods'             => 'GET',
		'callback'            => 'hansea_rest_beitritt_document',
		'permission_callback' => $member,
	) );
	register_rest_route( 'hansea/v1', '/docusign/webhook', array(
		'methods'             => 'POST',
		'callback'            => 'hansea_rest_docusign_webhook',
		'permission_callback' => '__return_true',
	) );
} );

function hansea_rest_beitritt_start( WP_REST_Request $request ) {
	if ( ! hansea_rate_limit( 'beitritt', 10, HOUR_IN_SECONDS ) ) {
		return hansea_error( 'hansea_throttled', 'Zu viele Versuche. Bitte versuchen Sie es später erneut.', 429 );
	}
	$user     = wp_get_current_user();
	$existing = hansea_beitritt_for_user( $user->ID );
	if ( $existing && 'unterschrieben' === get_post_meta( $existing->ID, '_hansea_status', true ) ) {
		return hansea_error( 'hansea_exists', 'Ihre Beitrittserklärung ist bereits unterschrieben.', 409 );
	}

	$data = array(
		'birthDate' => sanitize_text_field( (string) $request->get_param( 'birthDate' ) ),
		'street'    => sanitize_text_field( (string) $request->get_param( 'street' ) ),
		'zip'       => sanitize_text_field( (string) $request->get_param( 'zip' ) ),
		'city'      => sanitize_text_field( (string) $request->get_param( 'city' ) ),
		'phone'     => sanitize_text_field( (string) $request->get_param( 'phone' ) ),
		'units'     => (int) $request->get_param( 'units' ),
	);
	$birth = DateTime::createFromFormat( '!Y-m-d', $data['birthDate'] );
	if ( ! $birth || $birth->format( 'Y-m-d' ) !== $data['birthDate'] || $birth > new DateTime( '-18 years' ) || $birth < new DateTime( '-120 years' ) ) {
		return hansea_error( 'hansea_invalid', 'Bitte prüfen Sie Ihr Geburtsdatum. Der Beitritt ist ab 18 Jahren möglich.', 400 );
	}
	if ( '' === $data['street'] || '' === $data['city'] || ! preg_match( '/^\d{5}$/', $data['zip'] ) ) {
		return hansea_error( 'hansea_invalid', 'Bitte geben Sie Ihre vollständige Anschrift ein.', 400 );
	}
	if ( $data['units'] < HANSEA_MIN_UNITS || $data['units'] > HANSEA_MAX_UNITS ) {
		return hansea_error( 'hansea_invalid', sprintf( 'Bitte wählen Sie zwischen %d und %d Anteilen.', HANSEA_MIN_UNITS, HANSEA_MAX_UNITS ), 400 );
	}
	if ( HANSEA_BEITRITT_CONSENT['version'] !== (string) $request->get_param( 'consentVersion' ) ) {
		return hansea_error( 'hansea_invalid', 'Bitte bestätigen Sie die Hinweise.', 400 );
	}

	// An unsigned envelope with older data is withdrawn before the new one goes out.
	if ( $existing && 'entwurf' === get_post_meta( $existing->ID, '_hansea_status', true ) && hansea_docusign_configured() ) {
		hansea_docusign_request( 'PUT', '/envelopes/' . rawurlencode( get_post_meta( $existing->ID, '_hansea_envelope', true ) ), array(
			'status'       => 'voided',
			'voidedReason' => 'Durch eine neue Beitrittserklärung ersetzt.',
		) );
		update_post_meta( $existing->ID, '_hansea_status', 'storniert' );
	}

	$name    = trim( $user->first_name . ' ' . $user->last_name );
	$post_id = wp_insert_post( array(
		'post_type'   => 'hansea_beitritt',
		'post_status' => 'private',
		'post_title'  => $name . ' · ' . $data['units'] . ' Anteile',
	) );
	if ( is_wp_error( $post_id ) || ! $post_id ) {
		return hansea_error( 'hansea_failed', 'Ihre Angaben konnten nicht gespeichert werden.', 500 );
	}
	update_post_meta( $post_id, '_hansea_user', $user->ID );
	update_post_meta( $post_id, '_hansea_data', $data );
	update_post_meta( $post_id, '_hansea_consent', array(
		'version' => HANSEA_BEITRITT_CONSENT['version'],
		'text'    => HANSEA_BEITRITT_CONSENT['text'],
		'time'    => current_time( 'mysql', true ),
		'page'    => '/mitglieder/',
	) );

	if ( ! hansea_docusign_configured() ) {
		update_post_meta( $post_id, '_hansea_status', 'eingegangen' );
		hansea_beitritt_notify( $post_id, 'eingegangen' );
		return rest_ensure_response( array( 'application' => hansea_beitritt_payload( get_post( $post_id ) ), 'url' => null ) );
	}

	$envelope_id = hansea_beitritt_create_envelope( $post_id, $user, $data );
	if ( is_wp_error( $envelope_id ) ) {
		update_post_meta( $post_id, '_hansea_status', 'eingegangen' );
		update_post_meta( $post_id, '_hansea_error', $envelope_id->get_error_message() );
		hansea_beitritt_notify( $post_id, 'eingegangen' );
		return hansea_error( 'hansea_signing', 'Ihre Angaben sind gespeichert, die Unterschrift ist gerade aber nicht erreichbar. Wir melden uns bei Ihnen.', 502 );
	}
	update_post_meta( $post_id, '_hansea_envelope', $envelope_id );
	update_post_meta( $post_id, '_hansea_status', 'entwurf' );

	$url = hansea_beitritt_signing_url( $post_id, $user );
	if ( is_wp_error( $url ) ) {
		return hansea_error( 'hansea_signing', 'Die Unterschrift konnte nicht geöffnet werden. Bitte versuchen Sie es gleich noch einmal.', 502 );
	}
	return rest_ensure_response( array( 'application' => hansea_beitritt_payload( get_post( $post_id ) ), 'url' => $url ) );
}

function hansea_rest_beitritt_resume() {
	$user = wp_get_current_user();
	$post = hansea_beitritt_for_user( $user->ID );
	if ( ! $post || 'entwurf' !== get_post_meta( $post->ID, '_hansea_status', true ) ) {
		return hansea_error( 'hansea_invalid', 'Es gibt keine offene Beitrittserklärung.', 404 );
	}
	$url = hansea_beitritt_signing_url( $post->ID, $user );
	if ( is_wp_error( $url ) ) {
		return hansea_error( 'hansea_signing', 'Die Unterschrift konnte nicht geöffnet werden. Bitte versuchen Sie es gleich noch einmal.', 502 );
	}
	return rest_ensure_response( array( 'url' => $url ) );
}

function hansea_rest_beitritt_sync() {
	$post = hansea_beitritt_for_user( get_current_user_id() );
	if ( $post ) {
		hansea_beitritt_sync( $post ); // errors leave the status as it is
	}
	return rest_ensure_response( array( 'application' => hansea_beitritt_payload( $post ? get_post( $post->ID ) : null ) ) );
}

function hansea_rest_beitritt_document() {
	$post = hansea_beitritt_for_user( get_current_user_id() );
	$path = $post ? hansea_beitritt_pdf_path( $post->ID ) : '';
	if ( ! $path ) {
		return hansea_error( 'hansea_not_found', 'Dokument nicht gefunden.', 404 );
	}
	hansea_send_pdf( $path, 'Beitrittserklaerung-Hanseatische-Invest.pdf' );
}

function hansea_send_pdf( $path, $filename ) {
	nocache_headers();
	header( 'Content-Type: application/pdf' );
	header( 'Content-Disposition: inline; filename="' . $filename . '"' );
	header( 'Content-Length: ' . filesize( $path ) );
	header( 'X-Content-Type-Options: nosniff' );
	readfile( $path );
	exit;
}

/** DocuSign Connect: only used as a trigger to re-check the envelope with the API. */
function hansea_rest_docusign_webhook( WP_REST_Request $request ) {
	$secret = hansea_docusign_setting( 'hmac_secret' );
	if ( '' !== $secret ) {
		$expected = base64_encode( hash_hmac( 'sha256', $request->get_body(), $secret, true ) );
		$valid    = false;
		foreach ( array( 'x_docusign_signature_1', 'x_docusign_signature_2' ) as $header ) {
			$given = (string) $request->get_header( $header );
			if ( '' !== $given && hash_equals( $expected, $given ) ) {
				$valid = true;
			}
		}
		if ( ! $valid ) {
			return hansea_error( 'hansea_forbidden', 'Invalid signature.', 401 );
		}
	}
	$body        = json_decode( $request->get_body(), true );
	$envelope_id = sanitize_text_field( (string) ( $body['data']['envelopeId'] ?? '' ) );
	$post        = $envelope_id ? hansea_beitritt_by_envelope( $envelope_id ) : null;
	if ( $post ) {
		$result = hansea_beitritt_sync( $post );
		if ( is_wp_error( $result ) ) {
			return hansea_error( 'hansea_retry', 'Retry later.', 503 ); // DocuSign retries
		}
	}
	return rest_ensure_response( array( 'ok' => true ) );
}

/* ---------------------------------------------------------------------------
 * wp-admin: list column, details box, PDF download
 * ------------------------------------------------------------------------ */

add_filter( 'manage_hansea_beitritt_posts_columns', function ( $columns ) {
	return array_slice( $columns, 0, 2, true ) + array( 'hansea_status' => 'Status' ) + array_slice( $columns, 2, null, true );
} );

add_action( 'manage_hansea_beitritt_posts_custom_column', function ( $column, $post_id ) {
	if ( 'hansea_status' === $column ) {
		echo esc_html( HANSEA_BEITRITT_STATUS[ get_post_meta( $post_id, '_hansea_status', true ) ] ?? '–' );
	}
}, 10, 2 );

add_action( 'add_meta_boxes_hansea_beitritt', function () {
	add_meta_box( 'hansea_beitritt_details', 'Angaben', 'hansea_beitritt_details_box', 'hansea_beitritt', 'normal', 'high' );
} );

function hansea_beitritt_details_box( $post ) {
	$user    = get_userdata( (int) get_post_meta( $post->ID, '_hansea_user', true ) );
	$data    = (array) get_post_meta( $post->ID, '_hansea_data', true );
	$consent = (array) get_post_meta( $post->ID, '_hansea_consent', true );
	$status  = get_post_meta( $post->ID, '_hansea_status', true );
	$error   = get_post_meta( $post->ID, '_hansea_error', true );
	$rows    = array(
		'Status'       => HANSEA_BEITRITT_STATUS[ $status ] ?? '–',
		'Name'         => $user ? trim( $user->first_name . ' ' . $user->last_name ) : '–',
		'E-Mail'       => $user ? $user->user_email : '–',
		'Geburtsdatum' => $data['birthDate'] ?? '',
		'Anschrift'    => trim( ( $data['street'] ?? '' ) . ', ' . ( $data['zip'] ?? '' ) . ' ' . ( $data['city'] ?? '' ), ', ' ),
		'Telefon'      => $data['phone'] ?? '',
		'Anteile'      => isset( $data['units'] ) ? $data['units'] . ' × ' . hansea_euro( HANSEA_SHARE_PRICE ) . ' = ' . hansea_euro( $data['units'] * HANSEA_SHARE_PRICE ) : '',
		'Einwilligung' => $consent ? sprintf( 'Version %s, %s UTC: „%s“', $consent['version'], $consent['time'], $consent['text'] ) : '',
		'DocuSign'     => (string) get_post_meta( $post->ID, '_hansea_envelope', true ),
	);
	if ( $error ) {
		$rows['Fehler'] = $error;
	}
	echo '<table class="widefat striped"><tbody>';
	foreach ( $rows as $label => $value ) {
		echo '<tr><th style="width:160px">' . esc_html( $label ) . '</th><td>' . esc_html( $value ) . '</td></tr>';
	}
	echo '</tbody></table>';
	if ( hansea_beitritt_pdf_path( $post->ID ) ) {
		$url = wp_nonce_url( admin_url( 'admin-post.php?action=hansea_beitritt_pdf&post=' . $post->ID ), 'hansea_beitritt_pdf_' . $post->ID );
		echo '<p><a class="button button-primary" href="' . esc_url( $url ) . '" target="_blank" rel="noopener">Unterschriebenes PDF öffnen</a></p>';
	}
}

add_action( 'admin_post_hansea_beitritt_pdf', function () {
	$post_id = isset( $_GET['post'] ) ? (int) $_GET['post'] : 0;
	check_admin_referer( 'hansea_beitritt_pdf_' . $post_id );
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		wp_die( 'Keine Berechtigung.' );
	}
	$path = hansea_beitritt_pdf_path( $post_id );
	if ( ! $path ) {
		wp_die( 'Dokument nicht gefunden.' );
	}
	hansea_send_pdf( $path, 'Beitrittserklaerung-' . $post_id . '.pdf' );
} );
