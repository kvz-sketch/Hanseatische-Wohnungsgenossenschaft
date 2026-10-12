<?php
session_start();

require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/includes/data.php';

migrate();

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'));
    exit;
}

requireLogin();

$pdo = getDb();
$author = currentAuthorName();
$flash = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'add_comment') {
        $entityType = $_POST['entity_type'] ?? '';
        $entityId = $_POST['entity_id'] ?? '';
        $body = trim($_POST['body'] ?? '');
        if (in_array($entityType, ['campaign', 'ad'], true) && $entityId !== '' && $body !== '') {
            addComment($pdo, $entityType, $entityId, $author, $body);
            $flash = 'Feedback gespeichert.';
        }
    } elseif ($action === 'edit_field') {
        $campaignId = $_POST['campaign_id'] ?? '';
        $field = $_POST['field'] ?? '';
        $value = trim($_POST['value'] ?? '');
        if ($campaignId !== '' && editCampaignField($pdo, $campaignId, $field, $value, $author)) {
            $flash = 'Änderung gespeichert.';
        }
    }

    // POST-redirect-GET so a page reload never resubmits the form.
    $qs = $flash ? '?saved=1' : '';
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?') . $qs . (isset($_GET['open']) ? ($qs ? '&' : '?') . 'open=' . urlencode($_GET['open']) : ''));
    exit;
}

if (isset($_GET['saved'])) {
    $flash = 'Gespeichert.';
}

$campaigns = fetchCampaigns($pdo);
$funnelGroups = groupByFunnel($campaigns);
$funnelExtraLeads = fetchFunnelExtraLeads($pdo);
$commentsByEntity = fetchAllCommentsGrouped($pdo);

$totalSpend = array_sum(array_column($campaigns, 'spend'));
$totalLeads = array_sum(array_column($campaigns, 'perspective_leads'));
foreach ($funnelExtraLeads as $extra) {
    $totalLeads += count($extra['dates']);
}
$blendedCpl = $totalLeads > 0 ? $totalSpend / $totalLeads : null;

$asOf = '12. Oktober 2026';

require __DIR__ . '/includes/header.php';
require __DIR__ . '/includes/report.php';
require __DIR__ . '/includes/footer.php';
