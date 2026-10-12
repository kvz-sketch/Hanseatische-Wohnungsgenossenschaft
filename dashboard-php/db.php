<?php

function getConfig(): array
{
    static $config = null;
    if ($config === null) {
        $config = require __DIR__ . '/config.php';
    }
    return $config;
}

function getDb(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $config = getConfig();
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];

    if ($config['db_driver'] === 'mysql') {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=utf8mb4',
            $config['db_host'],
            $config['db_name']
        );
        $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], $options);
    } else {
        $dir = dirname($config['db_path']);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $pdo = new PDO('sqlite:' . $config['db_path'], null, null, $options);
        $pdo->exec('PRAGMA foreign_keys = ON');
    }

    return $pdo;
}

/**
 * Applies sql/schema.sql. The schema file is written in plain, engine-neutral
 * SQL (no AUTO_INCREMENT, no ENUM) so it runs unchanged on both engines via
 * one small substitution: SQLite accepts "INTEGER PRIMARY KEY" as its rowid
 * alias directly, but MySQL needs AUTO_INCREMENT added for the same
 * behavior — everything else (TEXT, REAL, INDEX, REFERENCES as a comment-only
 * hint) is accepted by both.
 */
function migrate(): void
{
    $config = getConfig();
    $sql = file_get_contents(__DIR__ . '/sql/schema.sql');
    // Strip "-- ..." comment lines before splitting on ";" — PDO::exec()
    // (especially the SQLite driver) doesn't reliably skip over comment
    // text that happens to contain a semicolon-free sentence spanning the
    // split.
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);

    if ($config['db_driver'] === 'mysql') {
        $sql = preg_replace(
            '/(\w+)\s+INTEGER PRIMARY KEY/',
            '$1 INTEGER PRIMARY KEY AUTO_INCREMENT',
            $sql
        );
    }

    $pdo = getDb();
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        $pdo->exec($statement);
    }
}
