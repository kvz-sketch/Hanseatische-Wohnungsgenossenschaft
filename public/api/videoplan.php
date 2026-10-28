<?php
// Videoplan & Freigaben — shared storage for the dashboard page of the same
// name (src/pages/VideoPlan.tsx). Plain PHP + SQLite, no credentials.
//
// The database lives OUTSIDE public_html (domains/<domain>/videoplan-data/),
// so a full static redeploy of the site never touches it, and it can't be
// downloaded over HTTP. Only if that folder isn't writable does it fall back
// to api/.data/ next to this file, which .htaccess denies.
//
//   GET  videoplan.php                       → { items, feedback }
//   POST videoplan.php  {action:"create",   item}
//                       {action:"update",   id, item}       (partial item)
//                       {action:"delete",   id}             (soft delete, logged)
//                       {action:"feedback", itemId, author, text}
//                       {action:"unlock"}                (checks the edit password)
//                       {action:"availability", day, status, note, author}
//                            Cutter availability for one day: "verfuegbar", "schnitt"
//                            (editing day, no shoot possible) or "" to clear it.
//   GET  videoplan.php?health=1              → storage diagnostics
//
// Viewing and feedback are open to every visitor. create / update / delete
// need the team edit password in the X-Edit-Password header. Only its bcrypt
// hash is stored, in the data folder outside the web root. To set or change
// it, upload api/videoplan-password.php containing
//   <?php return '<password_hash(...) output>';
// — the next request moves the hash into the data folder and deletes that
// file. With no password configured, editing is refused (fails closed).
// After 10 wrong passwords from one IP within 15 minutes, that IP is locked
// out for the rest of the window.
//
// Every write is also logged with its full before/after state in `log`,
// deletes are soft, and writes are rate-limited per IP.

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const STATUSES = ['ungeplant', 'geplant', 'schnitt', 'freigabe', 'freigegeben'];
const CATEGORIES = ['shoot', 'schnitt', 'meeting', 'creative', 'sonstiges'];
const PRIORITIES = ['', 'hoch', 'mittel', 'niedrig'];
const AVAILABILITY = ['verfuegbar', 'schnitt'];
const BRIEF_FIELDS = [
    'projekt', 'ziel', 'botschaft', 'zielgruppe', 'location', 'ansprechpartner', 'crew',
    'talent', 'shotlist', 'equipment', 'formate', 'deadline', 'notizen',
];
const MAX_WRITES_PER_MINUTE = 40;
const MAX_FAILED_UNLOCKS = 10;
const FAILED_UNLOCK_WINDOW = 900;

function fail(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function dataDir(): string
{
    static $dir = null;
    if ($dir !== null) {
        return $dir;
    }
    // Local development only: `VIDEOPLAN_DATA_DIR=/tmp/x php -S …`.
    $override = getenv('VIDEOPLAN_DATA_DIR');
    if ($override) {
        if (!is_dir($override)) @mkdir($override, 0700, true);
        return $dir = $override;
    }
    // On Hostinger this file lives at ~/domains/<domain>/public_html/api/.
    // The data sits once per hosting account (~/videoplan-data), outside every
    // web root, so all domains serving this dashboard (e.g. the temporary
    // *.hostingersite.com one and marketing.gerlach-group.de) share the same
    // calendar, feedback and edit password.
    $domainsDir = dirname(__DIR__, 3);
    if (basename($domainsDir) === 'domains') {
        $shared = dirname($domainsDir) . '/videoplan-data';
        if ((is_dir($shared) || @mkdir($shared, 0700, true)) && is_writable($shared)) {
            migrateLegacyData($domainsDir, $shared);
            return $dir = $shared;
        }
    }
    $outside = dirname(__DIR__, 2) . '/videoplan-data';
    if ((is_dir($outside) || @mkdir($outside, 0700, true)) && is_writable($outside)) {
        return $dir = $outside;
    }
    $inside = __DIR__ . '/.data';
    if (!is_dir($inside) && !@mkdir($inside, 0700, true)) {
        fail(500, 'Speicherort nicht beschreibbar.');
    }
    if (!file_exists($inside . '/.htaccess')) {
        file_put_contents($inside . '/.htaccess', "Require all denied\n");
    }
    return $dir = $inside;
}

/**
 * One-time move from the earlier per-domain location
 * (~/domains/<domain>/videoplan-data) into the shared account-level folder.
 * Takes the most recently used per-domain store; does nothing once the
 * shared folder holds a database or password.
 */
function migrateLegacyData(string $domainsDir, string $shared): void
{
    if (is_file($shared . '/videoplan.sqlite') || is_file($shared . '/edit-password.hash')) {
        return;
    }
    $candidates = glob($domainsDir . '/*/videoplan-data', GLOB_ONLYDIR) ?: [];
    usort($candidates, fn ($a, $b) => (int) @filemtime($b) <=> (int) @filemtime($a));
    foreach ($candidates as $legacy) {
        $files = ['videoplan.sqlite', 'videoplan.sqlite-wal', 'videoplan.sqlite-shm', 'edit-password.hash'];
        if (!is_file($legacy . '/videoplan.sqlite') && !is_file($legacy . '/edit-password.hash')) {
            continue;
        }
        foreach ($files as $f) {
            if (is_file($legacy . '/' . $f)) {
                @copy($legacy . '/' . $f, $shared . '/' . $f);
                @chmod($shared . '/' . $f, 0600);
            }
        }
        return;
    }
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo) {
        return $pdo;
    }
    $pdo = new PDO('sqlite:' . dataDir() . '/videoplan.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA busy_timeout = 5000');
    $pdo->exec('CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        author TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        at TEXT NOT NULL,
        action TEXT NOT NULL,
        target_id TEXT NOT NULL,
        author TEXT,
        before_json TEXT,
        after_json TEXT
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS writes (ip_hash TEXT NOT NULL, at INTEGER NOT NULL)');
    // Cutter availability per day (added Oct 2026; additive, existing data untouched).
    $pdo->exec('CREATE TABLE IF NOT EXISTS availability (
        day TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT \'\',
        updated_at TEXT NOT NULL,
        updated_by TEXT
    )');
    return $pdo;
}

function now(): string
{
    return gmdate('Y-m-d\TH:i:s\Z');
}

function newId(): string
{
    return bin2hex(random_bytes(8));
}

function str($v, int $max): string
{
    if ($v === null) {
        return '';
    }
    if (!is_string($v) && !is_numeric($v)) {
        fail(400, 'Ungültiger Wert.');
    }
    $s = trim((string) $v);
    return mb_substr($s, 0, $max);
}

/** "2026-10-16T09:00" (local wall time, no zone) or null. */
function dateTime($v): ?string
{
    if ($v === null || $v === '') {
        return null;
    }
    if (!is_string($v) || !preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $v)) {
        fail(400, 'Ungültiges Datum.');
    }
    return $v;
}

/** Any web link (http/https only, so no javascript: or data: URLs end up in an href). */
function linkUrl($v): string
{
    $url = str($v, 1000);
    if (!preg_match('#^https?://#i', $url) || filter_var($url, FILTER_VALIDATE_URL) === false) {
        fail(400, 'Bitte einen gültigen Link verwenden, der mit https:// beginnt.');
    }
    return $url;
}

/** Merges a (partial) item from the client onto $base and validates the result. */
function cleanItem(array $in, array $base): array
{
    $item = $base;
    if (array_key_exists('title', $in)) $item['title'] = str($in['title'], 200);
    if (array_key_exists('status', $in)) $item['status'] = (string) $in['status'];
    if (array_key_exists('category', $in)) $item['category'] = (string) $in['category'];
    if (array_key_exists('start', $in)) $item['start'] = dateTime($in['start']);
    if (array_key_exists('end', $in)) $item['end'] = dateTime($in['end']);
    if (array_key_exists('allDay', $in)) $item['allDay'] = (bool) $in['allDay'];
    if (array_key_exists('brief', $in)) {
        if (!is_array($in['brief'])) fail(400, 'Ungültiges Briefing.');
        $brief = [];
        foreach (BRIEF_FIELDS as $f) {
            $brief[$f] = str($in['brief'][$f] ?? '', 8000);
        }
        $item['brief'] = $brief;
    }
    if (array_key_exists('links', $in)) {
        if (!is_array($in['links']) || count($in['links']) > 20) fail(400, 'Ungültige Links.');
        $links = [];
        foreach ($in['links'] as $l) {
            if (!is_array($l) || trim((string) ($l['url'] ?? '')) === '') continue;
            $links[] = ['url' => linkUrl($l['url']), 'label' => str($l['label'] ?? '', 120)];
        }
        $item['links'] = $links;
    }
    if (array_key_exists('priority', $in)) {
        $item['priority'] = (string) $in['priority'];
        if (!in_array($item['priority'], PRIORITIES, true)) fail(400, 'Ungültige Priorität.');
    }
    if (array_key_exists('updatedBy', $in)) $item['updatedBy'] = str($in['updatedBy'], 80);

    if (($item['title'] ?? '') === '') fail(400, 'Bitte einen Titel angeben.');
    if (!in_array($item['status'] ?? '', STATUSES, true)) fail(400, 'Ungültiger Status.');
    if (!in_array($item['category'] ?? '', CATEGORIES, true)) fail(400, 'Ungültige Kategorie.');
    if (!empty($item['start']) && !empty($item['end']) && $item['end'] < $item['start']) {
        fail(400, 'Das Ende liegt vor dem Beginn.');
    }
    // A planned entry needs a date; an unplanned one has none.
    if ($item['status'] === 'geplant' && empty($item['start'])) fail(400, 'Ein geplanter Termin braucht ein Datum.');
    if ($item['status'] === 'ungeplant') {
        $item['start'] = null;
        $item['end'] = null;
    }
    return $item;
}

function loadItem(string $id): array
{
    $st = db()->prepare('SELECT * FROM items WHERE id = ? AND deleted_at IS NULL');
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) fail(404, 'Eintrag nicht gefunden.');
    return $row;
}

function toClient(array $row): array
{
    return json_decode($row['data'], true) + [
        'id' => $row['id'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}

function logWrite(string $action, string $id, ?string $author, $before, $after): void
{
    db()->prepare('INSERT INTO log (at, action, target_id, author, before_json, after_json) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([
            now(), $action, $id, $author,
            $before === null ? null : json_encode($before, JSON_UNESCAPED_UNICODE),
            $after === null ? null : json_encode($after, JSON_UNESCAPED_UNICODE),
        ]);
}

function ipHash(): string
{
    return hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|videoplan');
}

/** bcrypt hash of the edit password, or null if none is configured yet. */
function editPasswordHash(): ?string
{
    $file = dataDir() . '/edit-password.hash';
    // One-time hand-over: a freshly uploaded api/videoplan-password.php
    // replaces the stored hash and is then deleted from the web root.
    $bootstrap = __DIR__ . '/videoplan-password.php';
    if (is_file($bootstrap)) {
        $new = include $bootstrap;
        if (is_string($new) && str_starts_with($new, '$2y$') && strlen($new) >= 60) {
            file_put_contents($file, $new, LOCK_EX);
            @chmod($file, 0600);
        }
        @unlink($bootstrap);
    }
    $hash = is_file($file) ? trim((string) file_get_contents($file)) : '';
    return $hash !== '' ? $hash : null;
}

function requireEditor(): void
{
    $hash = editPasswordHash();
    if ($hash === null) {
        fail(503, 'Bearbeiten ist noch nicht eingerichtet (kein Team-Passwort hinterlegt).');
    }
    $pdo = db();
    $pdo->exec('CREATE TABLE IF NOT EXISTS auth_failures (ip_hash TEXT NOT NULL, at INTEGER NOT NULL)');
    $pdo->prepare('DELETE FROM auth_failures WHERE at < ?')->execute([time() - FAILED_UNLOCK_WINDOW]);
    $st = $pdo->prepare('SELECT COUNT(*) FROM auth_failures WHERE ip_hash = ?');
    $st->execute([ipHash()]);
    if ((int) $st->fetchColumn() >= MAX_FAILED_UNLOCKS) {
        fail(429, 'Zu viele falsche Passwörter. Bitte in 15 Minuten erneut versuchen.');
    }
    $given = (string) ($_SERVER['HTTP_X_EDIT_PASSWORD'] ?? '');
    if ($given === '' || !password_verify($given, $hash)) {
        if ($given !== '') {
            $pdo->prepare('INSERT INTO auth_failures (ip_hash, at) VALUES (?, ?)')->execute([ipHash(), time()]);
        }
        fail(403, $given === '' ? 'Zum Bearbeiten bitte das Team-Passwort eingeben.' : 'Falsches Passwort.');
    }
}

function rateLimit(): void
{
    $ip = ipHash();
    $pdo = db();
    $pdo->prepare('DELETE FROM writes WHERE at < ?')->execute([time() - 60]);
    $st = $pdo->prepare('SELECT COUNT(*) FROM writes WHERE ip_hash = ?');
    $st->execute([$ip]);
    if ((int) $st->fetchColumn() >= MAX_WRITES_PER_MINUTE) {
        fail(429, 'Zu viele Änderungen in kurzer Zeit. Bitte kurz warten.');
    }
    $pdo->prepare('INSERT INTO writes (ip_hash, at) VALUES (?, ?)')->execute([$ip, time()]);
}

function listAll(): array
{
    $items = array_map('toClient', db()->query('SELECT * FROM items WHERE deleted_at IS NULL ORDER BY created_at')->fetchAll());
    $feedback = db()->query(
        'SELECT f.id, f.item_id AS itemId, f.author, f.text, f.created_at AS createdAt FROM feedback f
         JOIN items i ON i.id = f.item_id AND i.deleted_at IS NULL ORDER BY f.created_at'
    )->fetchAll();
    $availability = db()->query(
        'SELECT day, status, note FROM availability ORDER BY day'
    )->fetchAll();
    return ['items' => $items, 'feedback' => $feedback, 'availability' => $availability];
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        if (isset($_GET['health'])) {
            $dir = dataDir();
            db();
            echo json_encode([
                'ok' => true,
                'php' => PHP_VERSION,
                'storage' => str_ends_with($dir, '/.data') ? 'api/.data' : (str_starts_with($dir, dirname(__DIR__, 2) . '/') ? 'per-domain' : 'account-shared'),
            ]);
            exit;
        }
        echo json_encode(listAll() + ['editingConfigured' => editPasswordHash() !== null], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($method !== 'POST') fail(405, 'Methode nicht erlaubt.');

    $raw = file_get_contents('php://input', false, null, 0, 200000);
    $body = json_decode($raw ?: '', true);
    if (!is_array($body)) fail(400, 'Ungültige Anfrage.');
    rateLimit();
    $pdo = db();
    $action = (string) ($body['action'] ?? '');
    if (in_array($action, ['create', 'update', 'delete', 'unlock', 'availability'], true)) {
        requireEditor();
    }

    if ($action === 'unlock') {
        echo json_encode(['ok' => true]);
    } elseif ($action === 'create') {
        $base = ['title' => '', 'status' => 'ungeplant', 'category' => 'shoot', 'start' => null, 'end' => null,
            'allDay' => false, 'brief' => array_fill_keys(BRIEF_FIELDS, ''), 'links' => [], 'priority' => '', 'updatedBy' => ''];
        $item = cleanItem(is_array($body['item'] ?? null) ? $body['item'] : [], $base);
        $item['createdBy'] = $item['updatedBy'];
        $id = newId();
        $at = now();
        $pdo->prepare('INSERT INTO items (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)')
            ->execute([$id, json_encode($item, JSON_UNESCAPED_UNICODE), $at, $at]);
        logWrite('create', $id, $item['updatedBy'], null, $item);
        echo json_encode(['item' => toClient(loadItem($id))], JSON_UNESCAPED_UNICODE);
    } elseif ($action === 'update') {
        $row = loadItem(str($body['id'] ?? '', 40));
        $before = json_decode($row['data'], true);
        $item = cleanItem(is_array($body['item'] ?? null) ? $body['item'] : [], $before);
        $pdo->prepare('UPDATE items SET data = ?, updated_at = ? WHERE id = ?')
            ->execute([json_encode($item, JSON_UNESCAPED_UNICODE), now(), $row['id']]);
        logWrite('update', $row['id'], $item['updatedBy'] ?? null, $before, $item);
        echo json_encode(['item' => toClient(loadItem($row['id']))], JSON_UNESCAPED_UNICODE);
    } elseif ($action === 'delete') {
        $row = loadItem(str($body['id'] ?? '', 40));
        $pdo->prepare('UPDATE items SET deleted_at = ? WHERE id = ?')->execute([now(), $row['id']]);
        logWrite('delete', $row['id'], str($body['author'] ?? '', 80), json_decode($row['data'], true), null);
        echo json_encode(['ok' => true]);
    } elseif ($action === 'availability') {
        $day = (string) ($body['day'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $day)) fail(400, 'Ungültiges Datum.');
        $status = (string) ($body['status'] ?? '');
        if ($status !== '' && !in_array($status, AVAILABILITY, true)) fail(400, 'Ungültige Verfügbarkeit.');
        $author = str($body['author'] ?? '', 80);
        $note = str($body['note'] ?? '', 200);
        $st = $pdo->prepare('SELECT status, note FROM availability WHERE day = ?');
        $st->execute([$day]);
        $before = $st->fetch() ?: null;
        if ($status === '') {
            $pdo->prepare('DELETE FROM availability WHERE day = ?')->execute([$day]);
        } else {
            $pdo->prepare('INSERT INTO availability (day, status, note, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(day) DO UPDATE SET status = excluded.status, note = excluded.note,
                updated_at = excluded.updated_at, updated_by = excluded.updated_by')
                ->execute([$day, $status, $note, now(), $author]);
        }
        logWrite('availability', $day, $author, $before, $status === '' ? null : ['status' => $status, 'note' => $note]);
        echo json_encode(['ok' => true]);
    } elseif ($action === 'feedback') {
        $row = loadItem(str($body['itemId'] ?? '', 40));
        $author = str($body['author'] ?? '', 80);
        $text = str($body['text'] ?? '', 4000);
        if ($author === '' || $text === '') fail(400, 'Bitte Name und Feedback angeben.');
        $id = newId();
        $at = now();
        $pdo->prepare('INSERT INTO feedback (id, item_id, author, text, created_at) VALUES (?, ?, ?, ?, ?)')
            ->execute([$id, $row['id'], $author, $text, $at]);
        logWrite('feedback', $row['id'], $author, null, ['id' => $id, 'text' => $text]);
        echo json_encode(['feedback' => ['id' => $id, 'itemId' => $row['id'], 'author' => $author, 'text' => $text, 'createdAt' => $at]], JSON_UNESCAPED_UNICODE);
    } else {
        fail(400, 'Unbekannte Aktion.');
    }
} catch (Throwable $e) {
    error_log('videoplan: ' . $e->getMessage());
    fail(500, 'Serverfehler. Bitte später erneut versuchen.');
}
