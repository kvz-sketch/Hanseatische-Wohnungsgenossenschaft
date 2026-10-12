<?php
/**
 * One-time (or re-run-to-reset) seed of real Performance Marketing Report
 * data, transcribed from src/data/performanceReport.ts (commit d03c572,
 * 2026-10-12 — the last real Meta + live-Perspective refresh). Re-running
 * this wipes and reloads campaigns/ads/lead_dates/funnel_extra_leads, but
 * never touches comments or edit_log, so colleague feedback and edits
 * survive a reseed.
 *
 * Usage: php seed.php   (or visit seed.php?key=... once deployed — see
 * the guard below; remove/rotate that key after running in production).
 */

require __DIR__ . '/db.php';

$isCli = PHP_SAPI === 'cli';
if (!$isCli) {
    $config = getConfig();
    $key = $_GET['key'] ?? '';
    if (!hash_equals($config['dashboard_password'], $key)) {
        http_response_code(403);
        exit('Forbidden — run via CLI or pass ?key=<dashboard password>.');
    }
    header('Content-Type: text/plain; charset=utf-8');
}

migrate();
$pdo = getDb();

$pdo->exec('DELETE FROM lead_dates');
$pdo->exec('DELETE FROM funnel_extra_lead_dates');
$pdo->exec('DELETE FROM funnel_extra_leads');
$pdo->exec('DELETE FROM ads');
$pdo->exec('DELETE FROM campaigns');

$insertCampaign = $pdo->prepare(
    'INSERT INTO campaigns (id, name, status, objective, daily_budget, spend, reach, impressions, delivery,
        recommendations, meta_results, meta_cost_per_result, perspective_leads, perspective_funnel,
        perspective_funnel_url, lead_status_neu, lead_status_nicht_erreicht, lead_status_disqualifiziert,
        lead_status_abschluss, incomplete, note, sort_order)
     VALUES (:id, :name, :status, :objective, :daily_budget, :spend, :reach, :impressions, :delivery,
        :recommendations, :meta_results, :meta_cost_per_result, :perspective_leads, :perspective_funnel,
        :perspective_funnel_url, :lead_status_neu, :lead_status_nicht_erreicht, :lead_status_disqualifiziert,
        :lead_status_abschluss, :incomplete, :note, :sort_order)'
);

$insertAd = $pdo->prepare(
    'INSERT INTO ads (id, campaign_id, name, badge, image, video_url, meta_results, meta_cost_per_result,
        spend, reach, impressions, perspective_leads, sort_order)
     VALUES (:id, :campaign_id, :name, :badge, :image, :video_url, :meta_results, :meta_cost_per_result,
        :spend, :reach, :impressions, :perspective_leads, :sort_order)'
);

$insertLeadDate = $pdo->prepare('INSERT INTO lead_dates (ad_id, lead_date) VALUES (:ad_id, :lead_date)');

$insertFunnelExtra = $pdo->prepare('INSERT INTO funnel_extra_leads (funnel, note) VALUES (:funnel, :note)');
$insertFunnelExtraDate = $pdo->prepare(
    'INSERT INTO funnel_extra_lead_dates (funnel, lead_date) VALUES (:funnel, :lead_date)'
);

function img(string $file): string
{
    return 'assets/ads/' . $file;
}

// campaign id => [prefixed ad id => real file name], used only to resolve
// $img() calls below without repeating the full path every time.
$campaigns = require __DIR__ . '/seed-data.php';

$campaignSort = 0;
foreach ($campaigns as $campaign) {
    $insertCampaign->execute([
        'id' => $campaign['id'],
        'name' => $campaign['name'],
        'status' => $campaign['status'],
        'objective' => $campaign['objective'],
        'daily_budget' => $campaign['dailyBudget'],
        'spend' => $campaign['spend'],
        'reach' => $campaign['reach'],
        'impressions' => $campaign['impressions'],
        'delivery' => $campaign['delivery'],
        'recommendations' => $campaign['recommendations'],
        'meta_results' => $campaign['metaResults'],
        'meta_cost_per_result' => $campaign['metaCostPerResult'],
        'perspective_leads' => $campaign['perspectiveLeads'],
        'perspective_funnel' => $campaign['perspectiveFunnel'],
        'perspective_funnel_url' => $campaign['perspectiveFunnelUrl'],
        'lead_status_neu' => $campaign['leadStatus']['neu'] ?? null,
        'lead_status_nicht_erreicht' => $campaign['leadStatus']['nichtErreicht'] ?? null,
        'lead_status_disqualifiziert' => $campaign['leadStatus']['disqualifiziert'] ?? null,
        'lead_status_abschluss' => $campaign['leadStatus']['abschluss'] ?? null,
        'incomplete' => !empty($campaign['incomplete']) ? 1 : 0,
        'note' => $campaign['note'] ?? null,
        'sort_order' => $campaignSort++,
    ]);

    $adSort = 0;
    foreach ($campaign['ads'] as $ad) {
        $insertAd->execute([
            'id' => $campaign['id'] . ':' . $ad['id'],
            'campaign_id' => $campaign['id'],
            'name' => $ad['name'],
            'badge' => $ad['badge'] ?? null,
            'image' => isset($ad['image']) ? img($ad['image']) : null,
            'video_url' => $ad['videoUrl'] ?? null,
            'meta_results' => $ad['metaResults'],
            'meta_cost_per_result' => $ad['metaCostPerResult'],
            'spend' => $ad['spend'],
            'reach' => $ad['reach'],
            'impressions' => $ad['impressions'],
            'perspective_leads' => $ad['perspectiveLeads'] ?? null,
            'sort_order' => $adSort++,
        ]);

        foreach ($ad['leadDates'] ?? [] as $date) {
            $insertLeadDate->execute(['ad_id' => $campaign['id'] . ':' . $ad['id'], 'lead_date' => $date]);
        }
    }
}

foreach (require __DIR__ . '/seed-funnel-extra.php' as $funnel => $extra) {
    $insertFunnelExtra->execute(['funnel' => $funnel, 'note' => $extra['note']]);
    foreach ($extra['dates'] as $date) {
        $insertFunnelExtraDate->execute(['funnel' => $funnel, 'lead_date' => $date]);
    }
}

echo "Seed complete: " . count($campaigns) . " campaigns.\n";
