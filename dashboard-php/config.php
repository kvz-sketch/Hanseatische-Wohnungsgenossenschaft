<?php
/**
 * All configuration comes from environment variables so the same code runs
 * locally (SQLite, for development/testing) and on netcup (MySQL, in
 * production) without any file needing to change between the two.
 *
 * Required in production (set these in .env.php, see .env.php.example):
 *   DB_DRIVER            'mysql' or 'sqlite' (default: 'sqlite')
 *   DB_HOST, DB_NAME, DB_USER, DB_PASS   (mysql only)
 *   DB_PATH                              (sqlite only, default: __DIR__.'/data/dashboard.sqlite')
 *   DASHBOARD_PASSWORD   the shared password colleagues use to log in
 */

// A local, git-ignored file for real secrets — never commit real passwords.
$envFile = __DIR__ . '/.env.php';
if (is_file($envFile)) {
    require $envFile;
}

function env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }
    return $default;
}

return [
    'db_driver' => env('DB_DRIVER', 'sqlite'),
    'db_host' => env('DB_HOST'),
    'db_name' => env('DB_NAME'),
    'db_user' => env('DB_USER'),
    'db_pass' => env('DB_PASS'),
    'db_path' => env('DB_PATH', __DIR__ . '/data/dashboard.sqlite'),
    'dashboard_password' => env('DASHBOARD_PASSWORD', 'change-me'),
];
