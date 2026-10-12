<!doctype html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Performance Marketing Report — GIG Marketing Dashboard</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<header class="topbar">
    <div class="topbar-inner">
        <span class="brand">Performance Marketing Report</span>
        <span class="who">Angemeldet als <strong><?= htmlspecialchars($author) ?></strong>
            <a href="?logout=1">Abmelden</a>
        </span>
    </div>
</header>

<section class="sr-hero">
    <div class="wrap">
        <span class="kicker">Gerlach Immobilien Gruppe · Intern</span>
        <div class="sr-hero-row">
            <h1>Performance Marketing Report</h1>
            <span class="sr-period">Stand: <?= htmlspecialchars($asOf) ?></span>
        </div>
    </div>
</section>

<?php if ($flash): ?>
    <div class="wrap"><p class="flash"><?= htmlspecialchars($flash) ?></p></div>
<?php endif; ?>
