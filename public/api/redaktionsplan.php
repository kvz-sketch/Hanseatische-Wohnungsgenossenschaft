<?php
// Redaktionsplan — shared storage for the planner at /tools/redaktionsplan/.
// Plain PHP + SQLite, same storage and password model as api/videoplan.php.
//
// Data and uploaded files live OUTSIDE every web root (~/redaktionsplan-data),
// so a static redeploy of the dashboard never touches them.
//
//   GET  redaktionsplan.php                 → { rev, docs:{posts,stories,videos,linkedin,config}, editingConfigured }
//   GET  redaktionsplan.php?rev=N           → { rev, unchanged:true } if nothing changed since N
//   GET  redaktionsplan.php?file=<id>       → an uploaded image or video
//   GET  redaktionsplan.php?health=1        → storage diagnostics
//   POST JSON {action:"unlock"}                       checks the edit password
//   POST JSON {action:"set", col, id, data}           create or replace one document
//   POST JSON {action:"delete", col, id}              delete one document (logged)
//   POST JSON {action:"delfile", id}                  delete one uploaded file
//   POST multipart action=upload, file=<file>         → { id }
//
// Viewing is open (like the Videoplan); every write needs the team edit
// password in the X-Edit-Password header. The planner uses the SAME team
// password as the Videoplan (~/videoplan-data/edit-password.hash). A separate
// one can be set by uploading api/redaktionsplan-password.php containing
//   <?php return '<password_hash(...) output>';
// which is moved into the data folder on the next request and deleted.
//
// First run: if api/redaktionsplan-seed/ exists and the database is empty,
// its seed.json and files are imported once, then the folder is removed.

declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

const COLLECTIONS = ['posts', 'stories', 'videos', 'linkedin', 'config'];
const MAX_WRITES_PER_MINUTE = 240;
const MAX_FAILED_UNLOCKS = 10;
const FAILED_UNLOCK_WINDOW = 900;
const MAX_DOC_BYTES = 262144;
const MAX_FILE_BYTES = 52428800;
const MIME_EXT = [
    'image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif',
    'video/mp4' => 'mp4', 'video/webm' => 'webm', 'video/quicktime' => 'mov',
];

function fail(int $code, string $message): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function out(array $data): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** ~ (the hosting account home) when running under ~/domains/<domain>/public_html/api, else null. */
function accountDir(): ?string
{
    $domainsDir = dirname(__DIR__, 3);
    return basename($domainsDir) === 'domains' ? dirname($domainsDir) : null;
}

function dataDir(): string
{
    static $dir = null;
    if ($dir !== null) return $dir;
    $override = getenv('REDAKTIONSPLAN_DATA_DIR');
    if ($override) {
        if (!is_dir($override)) @mkdir($override, 0700, true);
        return $dir = $override;
    }
    $acc = accountDir();
    if ($acc !== null) {
        $shared = $acc . '/redaktionsplan-data';
        if ((is_dir($shared) || @mkdir($shared, 0700, true)) && is_writable($shared)) return $dir = $shared;
    }
    $outside = dirname(__DIR__, 2) . '/redaktionsplan-data';
    if ((is_dir($outside) || @mkdir($outside, 0700, true)) && is_writable($outside)) return $dir = $outside;
    $inside = __DIR__ . '/.rp-data';
    if (!is_dir($inside) && !@mkdir($inside, 0700, true)) fail(500, 'Speicherort nicht beschreibbar.');
    if (!file_exists($inside . '/.htaccess')) file_put_contents($inside . '/.htaccess', "Require all denied\n");
    return $dir = $inside;
}

function filesDir(): string
{
    $d = dataDir() . '/files';
    if (!is_dir($d)) @mkdir($d, 0700, true);
    return $d;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;
    $pdo = new PDO('sqlite:' . dataDir() . '/redaktionsplan.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA busy_timeout = 5000');
    $pdo->exec('CREATE TABLE IF NOT EXISTS docs (col TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (col, id))');
    $pdo->exec('CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, mime TEXT NOT NULL, name TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, action TEXT NOT NULL, col TEXT, target_id TEXT NOT NULL, before_json TEXT, after_json TEXT)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS writes (ip_hash TEXT NOT NULL, at INTEGER NOT NULL)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS auth_failures (ip_hash TEXT NOT NULL, at INTEGER NOT NULL)');
    $pdo->exec("INSERT OR IGNORE INTO meta (k, v) VALUES ('rev', '0')");
    return $pdo;
}

function cut(string $s, int $n): string { return function_exists('mb_substr') ? mb_substr($s, 0, $n) : substr($s, 0, $n); }
function now(): string { return gmdate('Y-m-d\TH:i:s\Z'); }
function rev(): int { return (int) db()->query("SELECT v FROM meta WHERE k = 'rev'")->fetchColumn(); }
function bumpRev(): int
{
    db()->exec("UPDATE meta SET v = CAST(v AS INTEGER) + 1 WHERE k = 'rev'");
    return rev();
}
function ipHash(): string { return hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|redaktionsplan'); }

function validCol($c): string
{
    if (!is_string($c) || !in_array($c, COLLECTIONS, true)) fail(400, 'Unbekannte Sammlung.');
    return $c;
}
function validId($id): string
{
    if (!is_string($id) || !preg_match('/^[A-Za-z0-9_-]{1,80}$/', $id)) fail(400, 'Ungültige ID.');
    return $id;
}
function validFileId($id): string
{
    if (!is_string($id) || !preg_match('/^[0-9a-f]{32}$/', $id)) fail(400, 'Ungültige Datei-ID.');
    return $id;
}

function logWrite(string $action, ?string $col, string $id, $before, $after): void
{
    db()->prepare('INSERT INTO log (at, action, col, target_id, before_json, after_json) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([now(), $action, $col, $id,
            $before === null ? null : (is_string($before) ? $before : json_encode($before, JSON_UNESCAPED_UNICODE)),
            $after === null ? null : (is_string($after) ? $after : json_encode($after, JSON_UNESCAPED_UNICODE))]);
}

/** bcrypt hash of the edit password: own one first, else the Videoplan team password. */
function editPasswordHash(): ?string
{
    $own = dataDir() . '/edit-password.hash';
    $bootstrap = __DIR__ . '/redaktionsplan-password.php';
    if (is_file($bootstrap)) {
        $new = include $bootstrap;
        if (is_string($new) && str_starts_with($new, '$2y$') && strlen($new) >= 60) {
            file_put_contents($own, $new, LOCK_EX);
            @chmod($own, 0600);
        }
        @unlink($bootstrap);
    }
    $candidates = [$own];
    $acc = accountDir();
    if ($acc !== null) $candidates[] = $acc . '/videoplan-data/edit-password.hash';
    $candidates[] = dirname(__DIR__, 2) . '/videoplan-data/edit-password.hash';
    $candidates[] = __DIR__ . '/.data/edit-password.hash';
    foreach ($candidates as $f) {
        if (is_file($f)) {
            $h = trim((string) @file_get_contents($f));
            if ($h !== '') return $h;
        }
    }
    return null;
}

function requireEditor(): void
{
    $hash = editPasswordHash();
    if ($hash === null) fail(503, 'Bearbeiten ist noch nicht eingerichtet (kein Team-Passwort hinterlegt).');
    $pdo = db();
    $pdo->prepare('DELETE FROM auth_failures WHERE at < ?')->execute([time() - FAILED_UNLOCK_WINDOW]);
    $st = $pdo->prepare('SELECT COUNT(*) FROM auth_failures WHERE ip_hash = ?');
    $st->execute([ipHash()]);
    if ((int) $st->fetchColumn() >= MAX_FAILED_UNLOCKS) fail(429, 'Zu viele falsche Passwörter. Bitte in 15 Minuten erneut versuchen.');
    $given = (string) ($_SERVER['HTTP_X_EDIT_PASSWORD'] ?? '');
    if ($given === '' || !password_verify($given, $hash)) {
        if ($given !== '') $pdo->prepare('INSERT INTO auth_failures (ip_hash, at) VALUES (?, ?)')->execute([ipHash(), time()]);
        fail(403, $given === '' ? 'Zum Bearbeiten bitte das Team-Passwort eingeben.' : 'Falsches Passwort.');
    }
}

function rateLimit(): void
{
    $pdo = db();
    $pdo->prepare('DELETE FROM writes WHERE at < ?')->execute([time() - 60]);
    $st = $pdo->prepare('SELECT COUNT(*) FROM writes WHERE ip_hash = ?');
    $st->execute([ipHash()]);
    if ((int) $st->fetchColumn() >= MAX_WRITES_PER_MINUTE) fail(429, 'Zu viele Änderungen in kurzer Zeit. Bitte kurz warten.');
    $pdo->prepare('INSERT INTO writes (ip_hash, at) VALUES (?, ?)')->execute([ipHash(), time()]);
}

function rrmdir(string $dir): void
{
    if (!is_dir($dir)) return;
    foreach (scandir($dir) ?: [] as $f) {
        if ($f === '.' || $f === '..') continue;
        $p = $dir . '/' . $f;
        is_dir($p) ? rrmdir($p) : @unlink($p);
    }
    @rmdir($dir);
}

/** One-time import of the data moved over from the claude.ai planner. */
function importSeed(): void
{
    $seedDir = __DIR__ . '/redaktionsplan-seed';
    if (!is_dir($seedDir)) return;
    $pdo = db();
    $empty = (int) $pdo->query('SELECT COUNT(*) FROM docs')->fetchColumn() === 0;
    $seed = json_decode((string) @file_get_contents($seedDir . '/seed.json'), true);
    if ($empty && is_array($seed)) {
        $pdo->beginTransaction();
        $at = now();
        $ins = $pdo->prepare('INSERT OR REPLACE INTO docs (col, id, data, updated_at) VALUES (?, ?, ?, ?)');
        foreach (($seed['docs'] ?? []) as $col => $docs) {
            if (!in_array($col, COLLECTIONS, true) || !is_array($docs)) continue;
            foreach ($docs as $id => $data) {
                if (!is_string($id) || !preg_match('/^[A-Za-z0-9_-]{1,80}$/', $id) || !is_array($data)) continue;
                $ins->execute([$col, $id, json_encode($data, JSON_UNESCAPED_UNICODE), $at]);
            }
        }
        $fins = $pdo->prepare('INSERT OR REPLACE INTO files (id, mime, name, size, created_at) VALUES (?, ?, ?, ?, ?)');
        foreach (($seed['files'] ?? []) as $fid => $meta) {
            if (!is_string($fid) || !preg_match('/^[0-9a-f]{32}$/', $fid)) continue;
            $src = $seedDir . '/files/' . $fid;
            if (!is_file($src)) continue;
            $dst = filesDir() . '/' . $fid;
            if (!@copy($src, $dst)) continue;
            @chmod($dst, 0600);
            $fins->execute([$fid, (string) ($meta['mime'] ?? 'image/png'), cut((string) ($meta['name'] ?? $fid), 200), (int) filesize($dst), $at]);
        }
        logWrite('import', null, 'seed', null, ['docs' => array_map('count', $seed['docs'] ?? []), 'files' => count($seed['files'] ?? [])]);
        $pdo->exec("UPDATE meta SET v = CAST(v AS INTEGER) + 1 WHERE k = 'rev'");
        $pdo->commit();
    }
    rrmdir($seedDir);
}

function listAll(): array
{
    $docs = array_fill_keys(COLLECTIONS, []);
    foreach (db()->query('SELECT col, id, data FROM docs')->fetchAll() as $r) {
        $docs[$r['col']][$r['id']] = json_decode($r['data'], true);
    }
    foreach ($docs as $k => $v) if (!$v) $docs[$k] = new stdClass();
    return $docs;
}

function serveFile(string $id): void
{
    $st = db()->prepare('SELECT * FROM files WHERE id = ?');
    $st->execute([$id]);
    $f = $st->fetch();
    $path = filesDir() . '/' . $id;
    if (!$f || !is_file($path)) fail(404, 'Datei nicht gefunden.');
    $size = filesize($path);
    header('Content-Type: ' . $f['mime']);
    header('Cache-Control: public, max-age=31536000, immutable');
    header('Accept-Ranges: bytes');
    header('Content-Disposition: inline; filename="' . preg_replace('/[^A-Za-z0-9._-]/', '_', $f['name']) . '"');
    $start = 0;
    $end = $size - 1;
    if (isset($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $m)) {
        if ($m[1] !== '') $start = (int) $m[1];
        if ($m[2] !== '') $end = min((int) $m[2], $size - 1);
        if ($m[1] === '' && $m[2] !== '') { $start = max(0, $size - (int) $m[2]); $end = $size - 1; }
        if ($start > $end || $start >= $size) { http_response_code(416); header("Content-Range: bytes */$size"); exit; }
        http_response_code(206);
        header("Content-Range: bytes $start-$end/$size");
    }
    header('Content-Length: ' . ($end - $start + 1));
    $fh = fopen($path, 'rb');
    fseek($fh, $start);
    $left = $end - $start + 1;
    while ($left > 0 && !feof($fh)) {
        $chunk = fread($fh, (int) min(65536, $left));
        echo $chunk;
        $left -= strlen($chunk);
    }
    fclose($fh);
    exit;
}

try {
    importSeed();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        if (isset($_GET['file'])) serveFile(validFileId((string) $_GET['file']));
        if (isset($_GET['health'])) {
            $dir = dataDir();
            db();
            out(['ok' => true, 'php' => PHP_VERSION, 'storage' => str_ends_with($dir, '/.rp-data') ? 'api/.rp-data' : 'outside-webroot',
                'editingConfigured' => editPasswordHash() !== null]);
        }
        $r = rev();
        if (isset($_GET['rev']) && (int) $_GET['rev'] === $r) out(['rev' => $r, 'unchanged' => true]);
        out(['rev' => $r, 'docs' => listAll(), 'editingConfigured' => editPasswordHash() !== null]);
    }
    if ($method !== 'POST') fail(405, 'Methode nicht erlaubt.');

    rateLimit();
    requireEditor();
    $pdo = db();

    // Multipart upload
    if (str_starts_with((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'multipart/form-data')) {
        if (($_POST['action'] ?? '') !== 'upload' || !isset($_FILES['file'])) fail(400, 'Ungültiger Upload.');
        $up = $_FILES['file'];
        if (($up['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) fail(400, 'Upload fehlgeschlagen (Code ' . (int) $up['error'] . ').');
        if ($up['size'] > MAX_FILE_BYTES) fail(413, 'Datei ist größer als 50 MB.');
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($up['tmp_name']) ?: '';
        if (!isset(MIME_EXT[$mime])) fail(415, 'Nur Bilder (PNG, JPG, WebP, GIF) und Videos (MP4, WebM, MOV).');
        $id = bin2hex(random_bytes(16));
        $dst = filesDir() . '/' . $id;
        if (!move_uploaded_file($up['tmp_name'], $dst)) fail(500, 'Datei konnte nicht gespeichert werden.');
        @chmod($dst, 0600);
        $name = cut((string) preg_replace('/[\x00-\x1F]/', '', (string) ($up['name'] ?? $id)), 200);
        $pdo->prepare('INSERT INTO files (id, mime, name, size, created_at) VALUES (?, ?, ?, ?, ?)')
            ->execute([$id, $mime, $name, (int) $up['size'], now()]);
        logWrite('upload', null, $id, null, ['name' => $name, 'mime' => $mime, 'size' => (int) $up['size']]);
        out(['id' => $id]);
    }

    $raw = file_get_contents('php://input', false, null, 0, MAX_DOC_BYTES + 4096);
    $body = json_decode($raw ?: '', true);
    if (!is_array($body)) fail(400, 'Ungültige Anfrage.');
    $action = (string) ($body['action'] ?? '');

    if ($action === 'unlock') {
        out(['ok' => true]);
    } elseif ($action === 'set') {
        $col = validCol($body['col'] ?? null);
        $id = validId($body['id'] ?? null);
        if (!is_array($body['data'] ?? null)) fail(400, 'Ungültige Daten.');
        $json = json_encode($body['data'], JSON_UNESCAPED_UNICODE);
        if (strlen($json) > MAX_DOC_BYTES) fail(413, 'Eintrag ist zu groß.');
        $st = $pdo->prepare('SELECT data FROM docs WHERE col = ? AND id = ?');
        $st->execute([$col, $id]);
        $before = $st->fetchColumn();
        $pdo->beginTransaction();
        $pdo->prepare('INSERT INTO docs (col, id, data, updated_at) VALUES (?, ?, ?, ?)
            ON CONFLICT(col, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at')
            ->execute([$col, $id, $json, now()]);
        logWrite('set', $col, $id, $before === false ? null : $before, $json);
        $r = bumpRev();
        $pdo->commit();
        out(['ok' => true, 'rev' => $r]);
    } elseif ($action === 'delete') {
        $col = validCol($body['col'] ?? null);
        $id = validId($body['id'] ?? null);
        $st = $pdo->prepare('SELECT data FROM docs WHERE col = ? AND id = ?');
        $st->execute([$col, $id]);
        $before = $st->fetchColumn();
        $pdo->beginTransaction();
        $pdo->prepare('DELETE FROM docs WHERE col = ? AND id = ?')->execute([$col, $id]);
        logWrite('delete', $col, $id, $before === false ? null : $before, null);
        $r = bumpRev();
        $pdo->commit();
        out(['ok' => true, 'rev' => $r]);
    } elseif ($action === 'delfile') {
        $id = validFileId($body['id'] ?? null);
        $pdo->prepare('DELETE FROM files WHERE id = ?')->execute([$id]);
        @unlink(filesDir() . '/' . $id);
        logWrite('delfile', null, $id, null, null);
        out(['ok' => true]);
    } else {
        fail(400, 'Unbekannte Aktion.');
    }
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
    error_log('redaktionsplan: ' . $e->getMessage());
    fail(500, 'Serverfehler. Bitte später erneut versuchen.');
}
