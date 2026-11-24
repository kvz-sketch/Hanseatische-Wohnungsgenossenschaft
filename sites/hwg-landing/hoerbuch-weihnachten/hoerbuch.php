<?php
/**
 * Weihnachts-Hörbuch: takes the form on index.html, emails the requester the
 * download link, notifies the team and appends the lead to a CSV file that
 * lives outside public_html.
 *
 * Answers JSON to fetch() requests and redirects plain form posts (no JS) to
 * danke.html.
 */

// ---- Configuration --------------------------------------------------------
// Download link of the audiobook (zip of the MP3s or a streaming page). Must be
// set before the campaign starts; until then the requester gets no link.
const HOERBUCH_URL = 'https://HIER-DOWNLOAD-LINK-EINTRAGEN';
const TEAM_EMAIL   = 'info@gerlachgroup.de';
// Sender must be a mailbox on the sending domain (SPF/DKIM), e.g. one set up in hPanel.
const FROM_EMAIL   = 'info@hanseatische-wohnungsgenossenschaft.de';
const FROM_NAME    = 'Stephan Gerlach · Hanseatische Wohnungsgenossenschaft';
// Two levels up from public_html/<folder>/ = the account's home, not served.
define('LEADS_CSV', dirname(__DIR__, 2) . '/leads-hoerbuch-weihnachten.csv');
// ---------------------------------------------------------------------------

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function respond(bool $ok, string $error = '', int $status = 200): void {
    global $wantsJson;
    if ($wantsJson) {
        http_response_code($ok ? 200 : $status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: ' . ($ok ? 'danke.html' : 'index.html#lead-form'), true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: index.html', true, 303);
    exit;
}

// Bots: filled honeypot, or posted under 3 seconds after the page loaded.
// They get a success answer so they do not retry.
$ts = (int) ($_POST['ts'] ?? 0);
if (!empty($_POST['website']) || ($ts > 0 && time() - $ts < 3)) {
    respond(true);
}

$clean = fn(string $v, int $max) => mb_substr(trim(preg_replace('/[\r\n\t]+/', ' ', $v)), 0, $max);
$vorname = $clean((string) ($_POST['vorname'] ?? ''), 80);
$email   = $clean((string) ($_POST['email'] ?? ''), 160);
$quelle  = $clean((string) ($_POST['quelle'] ?? ''), 400);
$consent = ($_POST['einwilligung'] ?? '') === 'ja';

if ($vorname === '') respond(false, 'Bitte geben Sie Ihren Vornamen ein.', 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', 422);
if (!$consent) respond(false, 'Bitte bestätigen Sie die Einwilligung.', 422);

$now = date('Y-m-d H:i:s');

// Store the lead (with consent time stamp, for proof of consent).
$fh = @fopen(LEADS_CSV, 'a');
if ($fh) {
    if (flock($fh, LOCK_EX)) {
        if (filesize(LEADS_CSV) === 0) {
            fputcsv($fh, ['zeit', 'vorname', 'email', 'einwilligung', 'quelle', 'ip_gekuerzt']);
        }
        $ip = preg_replace('/\.\d+$/', '.0', $_SERVER['REMOTE_ADDR'] ?? ''); // last octet dropped
        // Leading = + - @ would make spreadsheet apps run formulas.
        $safe = fn($v) => preg_match('/^[=+\-@]/', $v) ? "'" . $v : $v;
        fputcsv($fh, [$now, $safe($vorname), $safe($email), 'ja', $safe($quelle), $ip]);
        flock($fh, LOCK_UN);
    }
    fclose($fh);
}

$encode = fn(string $s) => '=?UTF-8?B?' . base64_encode($s) . '?=';
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: ' . $encode(FROM_NAME) . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . TEAM_EMAIL,
];

// Until HOERBUCH_URL is set, nobody gets a placeholder link: the requester is
// told the link follows shortly and the team is asked to send it by hand.
$hasLink = strpos(HOERBUCH_URL, 'HIER-') === false;
$linkText = $hasLink
    ? "Hier ist Ihr Hörbuch „Immobilien-Investitionen leicht gemacht“:\n" . HOERBUCH_URL . "\n\n"
    : "Ihr Hörbuch „Immobilien-Investitionen leicht gemacht“ ist reserviert – den Download-Link senden wir Ihnen in Kürze per E-Mail.\n\n";

// 1) Requester: the download link.
$body = "Hallo {$vorname},\n\n"
      . "vielen Dank für Ihr Interesse – und frohe Weihnachten!\n\n"
      . $linkText
      . "Ich wünsche Ihnen viel Freude beim Zuhören und ein paar ruhige Tage zwischen den Jahren.\n"
      . "Wenn Sie danach Fragen zu Ihrer eigenen Kapitalanlage haben, buchen Sie gern ein kostenloses Erstgespräch:\n"
      . "https://calendly.com/dpp-gerlachgroup/30min-erstgesprach-gig\n\n"
      . "Herzliche Grüße\n"
      . "Stephan Gerlach\n"
      . "Hanseatische Wohnungsgenossenschaft · Gerlach Immobilien Gruppe\n\n"
      . "--\n"
      . "Gerlach Verwaltungs- und Beteiligungsges.mbH · Langenhorner Chaussee 155 · 22415 Hamburg\n"
      . "Sie erhalten diese E-Mail, weil Sie das Hörbuch angefordert haben. Keine weiteren E-Mails gewünscht? "
      . "Antworten Sie einfach mit „Abmelden“.\n";
$sent = mail($email, $encode('Ihr Weihnachtsgeschenk: das Hörbuch von Stephan Gerlach 🎁'), $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);

// 2) Team notification.
$team = "Neuer Lead (Weihnachts-Hörbuch)\n\n"
      . "Zeit:     {$now}\nVorname:  {$vorname}\nE-Mail:   {$email}\nQuelle:   " . ($quelle ?: '–') . "\n"
      . "Einwilligung Werbe-E-Mails: ja\n"
      . ($hasLink ? '' : "\nACHTUNG: HOERBUCH_URL ist noch nicht gesetzt – bitte Download-Link manuell senden.\n");
mail(TEAM_EMAIL, $encode('Lead Hörbuch: ' . $vorname), $team, implode("\r\n", $headers), '-f' . FROM_EMAIL);

if (!$sent) {
    respond(false, 'Die E-Mail konnte gerade nicht gesendet werden. Bitte versuchen Sie es in ein paar Minuten erneut.', 500);
}
respond(true);
