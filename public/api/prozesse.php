<?php
// Prozesse & Customer Journeys — shared storage for the process boards on the
// dashboard page of the same name (src/pages/Prozesse.tsx). Plain PHP + SQLite.
//
// Boards live in their own database OUTSIDE public_html (~/prozesse-data/),
// so a static redeploy never touches them and they can't be downloaded over
// HTTP. Only if that folder isn't writable does it fall back to
// api/.data-prozesse/ next to this file, which is denied by its own .htaccess.
//
//   GET  prozesse.php                → { boards: [summary…], editingConfigured }
//   GET  prozesse.php?id=<id>        → { board }
//   GET  prozesse.php?health=1       → storage diagnostics
//   POST prozesse.php {action:"create",    board, author}
//                     {action:"save",      id, version, board, author}
//                     {action:"delete",    id, author}           (soft delete, logged)
//                     {action:"unlock"}                          (checks the edit password)
//
// A board is either built here (nodes + edges) or links a Miro board
// (miroUrl), for colleagues who prefer Miro and its Teams integration.
//
// Viewing is open to every visitor; every POST needs the team edit password
// in the X-Edit-Password header. It is the same password as the Videoplan:
// this file only READS the bcrypt hash from the Videoplan's data folder and
// never writes there. With no password configured, editing is refused.
//
// "save" replaces the whole board and must name the version it was based on;
// if a colleague saved in between, it answers 409 with the newer board
// instead of overwriting it. Every write is logged with its before/after
// state, deletes are soft, and writes are rate-limited per IP.

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const NODE_TYPES = ['phase', 'step', 'decision', 'note', 'text', 'frame'];
// A process can also just point to a Miro board instead of being built here.
const MIRO_URL = '#^https://miro\.com/app/(board|live-embed)/[A-Za-z0-9_=-]+/?(\?[^\s"<>\\\\]*)?$#';
const COLORS = ['navy', 'gold', 'koralle', 'green', 'blue', 'grey'];
const MAX_NODES = 600;
const MAX_EDGES = 1200;
const MAX_WRITES_PER_MINUTE = 120;
const MAX_FAILED_UNLOCKS = 10;
const FAILED_UNLOCK_WINDOW = 900;

function fail(int $code, string $message, array $extra = []): void
{
    http_response_code($code);
    echo json_encode(['error' => $message] + $extra, JSON_UNESCAPED_UNICODE);
    exit;
}

/** ~/domains when this file sits at ~/domains/<domain>/public_html/api/, else null. */
function domainsDir(): ?string
{
    $d = dirname(__DIR__, 3);
    return basename($d) === 'domains' ? $d : null;
}

function dataDir(): string
{
    static $dir = null;
    if ($dir !== null) {
        return $dir;
    }
    // Local development only: `PROZESSE_DATA_DIR=/tmp/x php -S …`.
    $override = getenv('PROZESSE_DATA_DIR');
    if ($override) {
        if (!is_dir($override)) @mkdir($override, 0700, true);
        return $dir = $override;
    }
    $domains = domainsDir();
    if ($domains !== null) {
        $shared = dirname($domains) . '/prozesse-data';
        if ((is_dir($shared) || @mkdir($shared, 0700, true)) && is_writable($shared)) {
            return $dir = $shared;
        }
    }
    $inside = __DIR__ . '/.data-prozesse';
    if (!is_dir($inside) && !@mkdir($inside, 0700, true)) {
        fail(500, 'Speicherort nicht beschreibbar.');
    }
    if (!file_exists($inside . '/.htaccess')) {
        file_put_contents($inside . '/.htaccess', "Require all denied\n");
    }
    return $dir = $inside;
}

/** bcrypt hash of the team password, read from the Videoplan's data folder (read-only). */
function editPasswordHash(): ?string
{
    $candidates = [];
    $override = getenv('VIDEOPLAN_DATA_DIR');
    if ($override) $candidates[] = $override;
    $domains = domainsDir();
    if ($domains !== null) $candidates[] = dirname($domains) . '/videoplan-data';
    $candidates[] = dirname(__DIR__, 2) . '/videoplan-data';
    $candidates[] = __DIR__ . '/.data';
    foreach ($candidates as $c) {
        $file = $c . '/edit-password.hash';
        if (is_file($file)) {
            $hash = trim((string) file_get_contents($file));
            if ($hash !== '') return $hash;
        }
    }
    return null;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo) {
        return $pdo;
    }
    $pdo = new PDO('sqlite:' . dataDir() . '/prozesse.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA busy_timeout = 5000');
    $pdo->exec('CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        version INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
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
    $pdo->exec('CREATE TABLE IF NOT EXISTS auth_failures (ip_hash TEXT NOT NULL, at INTEGER NOT NULL)');
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
    return mb_substr(trim((string) $v), 0, $max);
}

/** Free text (descriptions): keeps line breaks, only trims the ends. */
function text($v, int $max): string
{
    return $v === null ? '' : mb_substr(str_replace("\r\n", "\n", (string) (is_string($v) ? $v : '')), 0, $max);
}

function num($v, float $min, float $max): float
{
    if (!is_numeric($v)) fail(400, 'Ungültige Position.');
    return round(max($min, min($max, (float) $v)), 1);
}

function elementId($v): string
{
    $id = str($v, 40);
    if (!preg_match('/^[A-Za-z0-9_-]{1,40}$/', $id)) fail(400, 'Ungültige Element-ID.');
    return $id;
}

/** Validates a whole board from the client and returns the cleaned copy. */
function cleanBoard($in): array
{
    if (!is_array($in)) fail(400, 'Ungültiger Prozess.');
    $title = str($in['title'] ?? '', 120);
    if ($title === '') fail(400, 'Bitte einen Namen für den Prozess angeben.');
    $nodesIn = $in['nodes'] ?? [];
    $edgesIn = $in['edges'] ?? [];
    if (!is_array($nodesIn) || !is_array($edgesIn)) fail(400, 'Ungültiger Prozess.');
    if (count($nodesIn) > MAX_NODES) fail(400, 'Zu viele Elemente auf einem Board (max. ' . MAX_NODES . ').');
    if (count($edgesIn) > MAX_EDGES) fail(400, 'Zu viele Verbindungen auf einem Board.');

    $nodes = [];
    foreach ($nodesIn as $n) {
        if (!is_array($n)) fail(400, 'Ungültiges Element.');
        $id = elementId($n['id'] ?? '');
        if (isset($nodes[$id])) fail(400, 'Doppelte Element-ID.');
        $type = (string) ($n['type'] ?? '');
        if (!in_array($type, NODE_TYPES, true)) fail(400, 'Ungültiger Elementtyp.');
        $color = (string) ($n['color'] ?? 'navy');
        if (!in_array($color, COLORS, true)) $color = 'navy';
        $nodes[$id] = [
            'id' => $id,
            'type' => $type,
            'x' => num($n['x'] ?? 0, -100000, 100000),
            'y' => num($n['y'] ?? 0, -100000, 100000),
            'w' => num($n['w'] ?? 200, 40, 6000),
            'h' => num($n['h'] ?? 100, 30, 6000),
            'title' => str($n['title'] ?? '', 200),
            'text' => text($n['text'] ?? '', 5000),
            'color' => $color,
        ];
    }
    $edges = [];
    foreach ($edgesIn as $e) {
        if (!is_array($e)) fail(400, 'Ungültige Verbindung.');
        $id = elementId($e['id'] ?? '');
        $from = elementId($e['from'] ?? '');
        $to = elementId($e['to'] ?? '');
        // Connections to removed elements are dropped instead of failing the save.
        if (!isset($nodes[$from], $nodes[$to]) || $from === $to || isset($edges[$id])) continue;
        $edges[$id] = ['id' => $id, 'from' => $from, 'to' => $to, 'label' => str($e['label'] ?? '', 120)];
    }
    $miro = str($in['miroUrl'] ?? '', 500);
    if ($miro !== '' && !preg_match(MIRO_URL, $miro)) {
        fail(400, 'Bitte einen gültigen Miro-Board-Link angeben (https://miro.com/app/board/…).');
    }
    return [
        'title' => $title,
        'description' => text($in['description'] ?? '', 1000),
        'miroUrl' => $miro,
        'nodes' => array_values($nodes),
        'edges' => array_values($edges),
    ];
}

function loadBoard(string $id): array
{
    $st = db()->prepare('SELECT * FROM boards WHERE id = ? AND deleted_at IS NULL');
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) fail(404, 'Prozess nicht gefunden.');
    return $row;
}

function toClient(array $row): array
{
    return json_decode($row['data'], true) + [
        'id' => $row['id'],
        'version' => (int) $row['version'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}

function summary(array $row): array
{
    $b = json_decode($row['data'], true);
    $count = fn (string $type) => count(array_filter($b['nodes'], fn ($n) => $n['type'] === $type));
    return [
        'id' => $row['id'],
        'title' => $b['title'],
        'description' => $b['description'],
        'miroUrl' => $b['miroUrl'] ?? '',
        'phases' => $count('phase'),
        'elements' => count($b['nodes']),
        'updatedBy' => $b['updatedBy'] ?? '',
        'updatedAt' => $row['updated_at'],
        'createdAt' => $row['created_at'],
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
    return hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|prozesse');
}

function requireEditor(): void
{
    $hash = editPasswordHash();
    if ($hash === null) {
        fail(503, 'Bearbeiten ist noch nicht eingerichtet (kein Team-Passwort hinterlegt).');
    }
    $pdo = db();
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

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        if (isset($_GET['health'])) {
            $dir = dataDir();
            db();
            echo json_encode([
                'ok' => true,
                'php' => PHP_VERSION,
                'storage' => str_ends_with($dir, '/.data-prozesse') ? 'api/.data-prozesse' : 'account-shared',
                'editingConfigured' => editPasswordHash() !== null,
            ]);
            exit;
        }
        if (isset($_GET['id'])) {
            echo json_encode(['board' => toClient(loadBoard(str($_GET['id'], 40)))], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $rows = db()->query('SELECT * FROM boards WHERE deleted_at IS NULL ORDER BY updated_at DESC')->fetchAll();
        echo json_encode(['boards' => array_map('summary', $rows), 'editingConfigured' => editPasswordHash() !== null], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($method !== 'POST') fail(405, 'Methode nicht erlaubt.');

    $raw = file_get_contents('php://input', false, null, 0, 2000000);
    $body = json_decode($raw ?: '', true);
    if (!is_array($body)) fail(400, 'Ungültige Anfrage.');
    rateLimit();
    requireEditor();
    $pdo = db();
    $action = (string) ($body['action'] ?? '');
    $author = str($body['author'] ?? '', 80);

    if ($action === 'unlock') {
        echo json_encode(['ok' => true]);
    } elseif ($action === 'create') {
        $board = cleanBoard($body['board'] ?? null) + ['updatedBy' => $author, 'createdBy' => $author];
        $id = newId();
        $at = now();
        $pdo->prepare('INSERT INTO boards (id, data, version, created_at, updated_at) VALUES (?, ?, 1, ?, ?)')
            ->execute([$id, json_encode($board, JSON_UNESCAPED_UNICODE), $at, $at]);
        logWrite('create', $id, $author, null, $board);
        echo json_encode(['board' => toClient(loadBoard($id))], JSON_UNESCAPED_UNICODE);
    } elseif ($action === 'save') {
        $pdo->exec('BEGIN IMMEDIATE');
        $row = loadBoard(str($body['id'] ?? '', 40));
        if ((int) ($body['version'] ?? -1) !== (int) $row['version']) {
            $pdo->exec('ROLLBACK');
            fail(409, 'Dieser Prozess wurde inzwischen von jemand anderem geändert.', ['board' => toClient($row)]);
        }
        $before = json_decode($row['data'], true);
        $board = cleanBoard($body['board'] ?? null) + [
            'updatedBy' => $author,
            'createdBy' => $before['createdBy'] ?? '',
        ];
        $pdo->prepare('UPDATE boards SET data = ?, version = version + 1, updated_at = ? WHERE id = ?')
            ->execute([json_encode($board, JSON_UNESCAPED_UNICODE), now(), $row['id']]);
        logWrite('save', $row['id'], $author, $before, $board);
        $pdo->exec('COMMIT');
        echo json_encode(['board' => toClient(loadBoard($row['id']))], JSON_UNESCAPED_UNICODE);
    } elseif ($action === 'delete') {
        $row = loadBoard(str($body['id'] ?? '', 40));
        $pdo->prepare('UPDATE boards SET deleted_at = ? WHERE id = ?')->execute([now(), $row['id']]);
        logWrite('delete', $row['id'], $author, json_decode($row['data'], true), null);
        echo json_encode(['ok' => true]);
    } else {
        fail(400, 'Unbekannte Aktion.');
    }
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('prozesse: ' . $e->getMessage());
    fail(500, 'Serverfehler. Bitte später erneut versuchen.');
}
