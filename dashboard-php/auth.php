<?php

function isLoggedIn(): bool
{
    return !empty($_SESSION['authed']) && !empty($_SESSION['author_name']);
}

function currentAuthorName(): string
{
    return $_SESSION['author_name'] ?? '';
}

function requireLogin(): void
{
    if (isLoggedIn()) {
        return;
    }

    $error = null;
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $config = getConfig();
        $password = $_POST['password'] ?? '';
        $name = trim($_POST['name'] ?? '');

        if ($name === '') {
            $error = 'Bitte einen Namen eingeben.';
        } elseif (!hash_equals($config['dashboard_password'], $password)) {
            $error = 'Falsches Passwort.';
        } else {
            $_SESSION['authed'] = true;
            $_SESSION['author_name'] = $name;
            header('Location: ' . $_SERVER['REQUEST_URI']);
            exit;
        }
    }

    http_response_code(401);
    renderLoginForm($error);
    exit;
}

function renderLoginForm(?string $error): void
{
    ?>
    <!doctype html>
    <html lang="de">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Anmelden — GIG Marketing Dashboard</title>
        <link rel="stylesheet" href="assets/style.css">
    </head>
    <body class="login-body">
        <form class="login-card" method="post">
            <span class="kicker">Gerlach Immobilien Gruppe · Intern</span>
            <h1>Marketing Dashboard</h1>
            <?php if ($error): ?>
                <p class="login-error"><?= htmlspecialchars($error) ?></p>
            <?php endif; ?>
            <label>
                Dein Name
                <input type="text" name="name" required autofocus value="<?= htmlspecialchars($_POST['name'] ?? '') ?>">
            </label>
            <label>
                Passwort
                <input type="password" name="password" required>
            </label>
            <button type="submit">Anmelden</button>
        </form>
    </body>
    </html>
    <?php
}
