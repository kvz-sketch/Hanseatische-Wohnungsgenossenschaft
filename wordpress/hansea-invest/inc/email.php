<?php
/**
 * Branded HTML emails. hansea_email_html() renders the Hansea Invest layout
 * (navy header with logo, white card, gold button, footer with address and
 * legal notice). The password reset email uses it directly; every other
 * plain-text email WordPress sends is wrapped in it, and all HTML emails get
 * a plain-text alternative.
 */

defined( 'ABSPATH' ) || exit;

/**
 * @param array $args {
 *   @type string $title     Heading.
 *   @type string $preheader Preview line shown in inbox lists.
 *   @type array  $html      Paragraphs (trusted HTML).
 *   @type array  $button    Optional ['label' => ..., 'url' => ...].
 *   @type string $note      Optional small print below the button (trusted HTML).
 *   @type string $eyebrow   Small label above the heading.
 * }
 */
function hansea_email_html( array $args ) {
	$navy  = '#141A46';
	$gold  = '#DDB851';
	$text  = '#2A2F52';
	$muted = '#7A7D89';
	$logo  = esc_url( get_template_directory_uri() . '/elementor/images/logo-white-email.png' );
	$home  = esc_url( home_url( '/' ) );
	$font  = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";
	$serif = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

	$paragraphs = '';
	foreach ( (array) ( $args['html'] ?? array() ) as $p ) {
		$paragraphs .= '<p style="margin:0 0 16px;font-family:' . $font . ';font-size:16px;line-height:1.6;color:' . $text . ';">' . $p . '</p>';
	}

	$button = '';
	if ( ! empty( $args['button']['url'] ) ) {
		$url    = esc_url( $args['button']['url'] );
		$label  = esc_html( $args['button']['label'] ?? 'Öffnen' );
		$button = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr>'
			. '<td style="border-radius:4px;background:' . $gold . ';" bgcolor="' . $gold . '">'
			. '<a href="' . $url . '" style="display:inline-block;padding:15px 28px;font-family:' . $font . ';font-size:16px;font-weight:600;color:' . $navy . ';text-decoration:none;border-radius:4px;">' . $label . '</a>'
			. '</td></tr></table>'
			. '<p style="margin:0 0 16px;font-family:' . $font . ';font-size:13px;line-height:1.5;color:' . $muted . ';">Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br>'
			. '<a href="' . $url . '" style="color:' . $navy . ';word-break:break-all;">' . esc_html( $args['button']['url'] ) . '</a></p>';
	}

	$note = empty( $args['note'] ) ? '' : '<p style="margin:8px 0 0;font-family:' . $font . ';font-size:13px;line-height:1.5;color:' . $muted . ';">' . $args['note'] . '</p>';
	$pre  = esc_html( $args['preheader'] ?? '' );

	return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
		. '<meta name="color-scheme" content="light"><title>' . esc_html( $args['title'] ?? '' ) . '</title></head>'
		. '<body style="margin:0;padding:0;background:#F5F5F5;">'
		. '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' . $pre . '</div>'
		. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F5;" bgcolor="#F5F5F5"><tr><td align="center" style="padding:32px 16px;">'
		. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">'
		// Header
		. '<tr><td align="center" style="background:' . $navy . ';padding:32px 24px;border-radius:8px 8px 0 0;" bgcolor="' . $navy . '">'
		. '<a href="' . $home . '"><img src="' . $logo . '" width="120" alt="Hansea Invest eG" style="display:block;width:120px;height:auto;border:0;"></a></td></tr>'
		// Body
		. '<tr><td style="background:#FFFFFF;padding:40px 40px 32px;border:1px solid #E7E8EC;border-top:0;" bgcolor="#FFFFFF">'
		. '<p style="margin:0 0 8px;font-family:' . $font . ';font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#A9863A;">' . esc_html( $args['eyebrow'] ?? 'Hanseatische Invest eG' ) . '</p>'
		. '<h1 style="margin:0 0 24px;font-family:' . $serif . ';font-size:30px;line-height:1.2;font-weight:400;color:' . $navy . ';">' . esc_html( $args['title'] ?? '' ) . '</h1>'
		. $paragraphs . $button . $note
		. '</td></tr>'
		// Footer
		. '<tr><td style="background:' . $navy . ';padding:24px 40px;border-radius:0 0 8px 8px;" bgcolor="' . $navy . '">'
		. '<p style="margin:0 0 8px;font-family:' . $font . ';font-size:13px;line-height:1.6;color:#E3E4EE;"><strong style="color:#FFFFFF;">Hanseatische Invest eG</strong><br>Langenhorner Chaussee 155 · 22415 Hamburg<br>mitgliederservice@hanseainvest.de</p>'
		. '<p style="margin:0;font-family:' . $font . ';font-size:11px;line-height:1.5;color:#8A8FB2;">Genossenschaftsanteile sind eine unternehmerische Beteiligung. Die Zielrendite von 7 % p.a. ist nicht garantiert. Verlust bis zum Totalverlust möglich. Keine gesetzliche Einlagensicherung.</p>'
		. '</td></tr></table></td></tr></table></body></html>';
}

/** Password reset: branded email with a button to our /passwort-vergessen/ page. */
add_filter( 'retrieve_password_notification_email', function ( $defaults, $key, $user_login, $user ) {
	$link = hansea_password_url( array( 'key' => $key, 'login' => rawurlencode( $user_login ) ) );
	$name = trim( $user->first_name . ' ' . $user->last_name );

	$defaults['subject'] = 'Ihr Passwort für den Mitgliederbereich';
	$defaults['headers'] = array( 'Content-Type: text/html; charset=UTF-8' );
	$defaults['message'] = hansea_email_html( array(
		'eyebrow'   => 'Mitgliederbereich',
		'title'     => 'Passwort festlegen',
		'preheader' => 'Legen Sie Ihr Passwort für den Mitgliederbereich der Hanseatischen Invest eG fest.',
		'html'      => array(
			esc_html( $name ? "Guten Tag {$name}," : 'Guten Tag,' ),
			'Sie haben ein neues Passwort für Ihren Mitgliederbereich der Hanseatischen Invest eG angefordert. Über den folgenden Button legen Sie es fest; danach sind Sie direkt angemeldet.',
		),
		'button'    => array( 'label' => 'Passwort festlegen', 'url' => $link ),
		'note'      => 'Der Link ist 24 Stunden gültig und kann einmal verwendet werden. Wenn Sie kein neues Passwort angefordert haben, können Sie diese E-Mail ignorieren; Ihr bisheriges Passwort bleibt bestehen.',
	) );
	return $defaults;
}, 10, 4 );

/** Wrap every other plain-text email in the branded layout. */
add_filter( 'wp_mail', function ( $atts ) {
	$headers = is_array( $atts['headers'] ) ? implode( "\n", $atts['headers'] ) : (string) $atts['headers'];
	if ( false !== stripos( $headers, 'text/html' ) ) {
		return $atts;
	}
	$paragraphs = array();
	foreach ( preg_split( "/\n\s*\n/", trim( (string) $atts['message'] ) ) as $block ) {
		$html         = esc_html( $block );
		$html         = preg_replace( '~(https?://[^\s<]+)~', '<a href="$1" style="color:#141A46;word-break:break-all;">$1</a>', $html );
		$paragraphs[] = nl2br( $html );
	}
	$atts['message'] = hansea_email_html( array(
		'title' => preg_replace( '/^\[[^\]]+\]\s*/', '', (string) $atts['subject'] ),
		'html'  => $paragraphs,
	) );
	$atts['headers']   = is_array( $atts['headers'] ) ? $atts['headers'] : array_filter( array( $headers ) );
	$atts['headers'][] = 'Content-Type: text/html; charset=UTF-8';
	return $atts;
} );

/** Plain-text alternative for HTML emails (deliverability, text-only clients). */
add_action( 'phpmailer_init', function ( $mailer ) {
	if ( 'text/html' !== $mailer->ContentType || '' !== $mailer->AltBody ) {
		return;
	}
	$body = preg_replace( '~<div style="display:none[^>]*>.*?</div>~s', '', $mailer->Body );
	$body = preg_replace( '~<a href="([^"]+)"[^>]*>(.*?)</a>~s', '$2 ($1)', $body );
	$body = preg_replace( '~<br\s*/?>|</p>|</h1>|</tr>~i', "\n", $body );
	$text = html_entity_decode( wp_strip_all_tags( $body ), ENT_QUOTES, 'UTF-8' );
	$mailer->AltBody = trim( preg_replace( "/\n{3,}/", "\n\n", preg_replace( '/[ \t]+/', ' ', $text ) ) );
} );

/** Sender name on every email. */
add_filter( 'wp_mail_from_name', function () {
	return 'Hanseatische Invest eG';
} );
