<?php
/**
 * Objekte funnel: takes the request from anfrage.html, appends it to a CSV
 * outside public_html, notifies the team and sends the requester a short
 * confirmation. Answers JSON to fetch() requests.
 */

// ---- Configuration --------------------------------------------------------
const TEAM_EMAIL = 'info@gerlachgroup.de';
// Sender must be a mailbox on the sending domain (SPF/DKIM).
const FROM_EMAIL = 'info@hanseatische-wohnungsgenossenschaft.de';
const FROM_NAME  = 'Hanseatische Wohnungsgenossenschaft';
// Two levels up from public_html/objekte/ = the account's home, not served.
define('LEADS_CSV', dirname(__DIR__, 2) . '/leads-objekte-v2.csv');
// ---------------------------------------------------------------------------

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function respond(bool $ok, string $error = '', int $status = 200): void {
    global $wantsJson;
    if ($wantsJson) {
        http_response_code($ok ? 200 : $status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: anfrage.html', true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: anfrage.html', true, 303);
    exit;
}

// Bots: filled honeypot, or sent under 5 seconds after the page loaded.
// They get a success answer so they do not retry.
$ts = (int) ($_POST['ts'] ?? 0);
if (!empty($_POST['website']) || ($ts > 0 && time() - $ts < 5)) {
    respond(true);
}

$clean = fn($v, int $max) => is_string($v) ? mb_substr(trim(preg_replace('/[\r\n\t]+/', ' ', $v)), 0, $max) : '';
$list  = function ($v, array $allowed): array {
    if (!is_array($v)) return [];
    return array_values(array_intersect($allowed, array_map('strval', $v)));
};

$ziele = $list($_POST['ziele'] ?? [], [
    'Langfristig Vermögen aufbauen', 'Zusätzliche Mieteinnahmen erzielen', 'Für das Rentenalter vorsorgen',
    'Steuerliche Möglichkeiten prüfen', 'Investieren ohne eigene Verwaltung', 'Zunächst informieren',
]);
$einkommenOpts    = ['Unter 3.000 €', '3.000–3.999 €', '4.000–4.999 €', '5.000–6.999 €', '7.000 € oder mehr'];
$eigenkapitalOpts = ['Unter 10.000 €', '10.000–24.999 €', '25.000–49.999 €', '50.000–99.999 €', '100.000 € oder mehr', 'Zunächst besprechen'];
$einkommen    = in_array($_POST['einkommen'] ?? '', $einkommenOpts, true) ? $_POST['einkommen'] : '';
$eigenkapital = in_array($_POST['eigenkapital'] ?? '', $eigenkapitalOpts, true) ? $_POST['eigenkapital'] : '';
$zeiten = $list($_POST['erreichbarkeit'] ?? [], [
    'Vormittags (9–12 Uhr)', 'Mittags (12–14 Uhr)', 'Nachmittags (14–17 Uhr)', 'Abends (17–19 Uhr)',
]);

$vorname  = $clean($_POST['vorname'] ?? '', 80);
$nachname = $clean($_POST['nachname'] ?? '', 80);
$email    = $clean($_POST['email'] ?? '', 160);
$telefon  = $clean($_POST['telefon'] ?? '', 40);
$quelle   = $clean($_POST['quelle'] ?? '', 400);
$verarbeitung = ($_POST['verarbeitung'] ?? '') === 'ja';
$consent  = ($_POST['einwilligung'] ?? '') === 'ja';

if ($vorname === '' || $nachname === '') respond(false, 'Bitte gib deinen Vor- und Nachnamen ein.', 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 'Bitte gib eine gültige E-Mail-Adresse ein.', 422);
if (strlen(preg_replace('/\D/', '', $telefon)) < 6) respond(false, 'Bitte gib eine gültige Telefonnummer ein.', 422);
if (!$verarbeitung) respond(false, 'Bitte stimme der Verarbeitung deiner Daten zu, damit wir deine Anfrage bearbeiten können.', 422);

$now = date('Y-m-d H:i:s');
$zieleText  = $ziele ? implode('; ', $ziele) : '–';
$zeitenText = $zeiten ? implode('; ', $zeiten) : 'keine Angabe';

// Store the request (with consent time stamp, for proof of consent).
$stored = false;
$fh = @fopen(LEADS_CSV, 'a');
if ($fh) {
    if (flock($fh, LOCK_EX)) {
        if (filesize(LEADS_CSV) === 0) {
            fputcsv($fh, ['zeit', 'vorname', 'nachname', 'email', 'telefon', 'ziele', 'nettoeinkommen', 'eigenkapital', 'erreichbarkeit', 'einwilligung_verarbeitung', 'einwilligung_marketing', 'quelle', 'ip_gekuerzt'], ',', '"', '');
        }
        $ip = preg_replace('/\.\d+$/', '.0', $_SERVER['REMOTE_ADDR'] ?? ''); // last octet dropped
        // Leading = + - @ would make spreadsheet apps run formulas.
        $safe = fn($v) => preg_match('/^[=+\-@]/', $v) ? "'" . $v : $v;
        $row = array_map($safe, [$now, $vorname, $nachname, $email, $telefon, $zieleText, $einkommen, $eigenkapital, $zeitenText, 'ja', $consent ? 'ja' : 'nein', $quelle]);
        $row[] = $ip;
        fputcsv($fh, $row, ',', '"', '');
        $stored = true;
        flock($fh, LOCK_UN);
    }
    fclose($fh);
}

$encode = fn(string $s) => '=?UTF-8?B?' . base64_encode($s) . '?=';
$headers = fn(string $replyTo) => implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: ' . $encode(FROM_NAME) . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . $replyTo,
]);

// 1) Team notification (reply goes straight to the requester).
$team = "Neue Anfrage über objekte.hanseatische-wohnungsgenossenschaft.de\n\n"
      . "Zeit:            {$now}\n"
      . "Name:            {$vorname} {$nachname}\n"
      . "E-Mail:          {$email}\n"
      . "Telefon:         {$telefon}\n"
      . "Erreichbar:      {$zeitenText}\n\n"
      . "Ziele:           {$zieleText}\n"
      . "Nettoeinkommen:  " . ($einkommen ?: '–') . "\n"
      . "Eigenkapital:    " . ($eigenkapital ?: '–') . "\n\n"
      . "Einwilligung Marketing-E-Mails: " . ($consent ? 'ja' : 'nein') . "\n"
      . "Quelle:          " . ($quelle ?: '–') . "\n";
$teamSent = mail(TEAM_EMAIL, $encode("Anfrage Objekte: {$vorname} {$nachname}"), $team, $headers($email), '-f' . FROM_EMAIL);

// 2) Confirmation to the requester.
$body = "Hallo {$vorname},\n\n"
      . "vielen Dank für deine Anfrage. Wir haben deine Angaben erhalten und melden uns persönlich bei dir"
      . ($zeiten ? " (bevorzugt: " . implode(', ', $zeiten) . ")" : '') . ", um deine Ziele und passende Immobilienangebote zu besprechen.\n\n"
      . "Du hast vorab Fragen? Antworte einfach auf diese E-Mail oder ruf uns an: +49 40 22862372-0.\n\n"
      . "Herzliche Grüße\n"
      . "Dein Team der Hanseatischen Wohnungsgenossenschaft\n"
      . "Gerlach Immobilien Gruppe\n\n"
      . "--\n"
      . "Gerlach Verwaltungs- und Beteiligungsges.mbH · Langenhorner Chaussee 155 · 22415 Hamburg\n"
      . ($consent ? "Keine weiteren E-Mails gewünscht? Antworte einfach mit „Abmelden“.\n" : "");
mail($email, $encode('Deine Anfrage ist bei uns eingegangen'), $body, $headers(TEAM_EMAIL), '-f' . FROM_EMAIL);

if (!$teamSent && !$stored) {
    respond(false, 'Das hat leider nicht geklappt. Bitte versuche es gleich noch einmal oder ruf uns an: +49 40 22862372-0.', 500);
}
respond(true);
