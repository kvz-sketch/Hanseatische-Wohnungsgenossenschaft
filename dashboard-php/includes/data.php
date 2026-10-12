<?php

/** All campaigns with their ads and lead dates nested, ordered for display. */
function fetchCampaigns(PDO $pdo): array
{
    $campaigns = $pdo->query('SELECT * FROM campaigns ORDER BY sort_order')->fetchAll();
    $ads = $pdo->query('SELECT * FROM ads ORDER BY campaign_id, sort_order')->fetchAll();
    $leadDates = $pdo->query('SELECT ad_id, lead_date FROM lead_dates ORDER BY lead_date')->fetchAll();

    $datesByAd = [];
    foreach ($leadDates as $row) {
        $datesByAd[$row['ad_id']][] = $row['lead_date'];
    }

    $adsByCampaign = [];
    foreach ($ads as $ad) {
        $ad['leadDates'] = $datesByAd[$ad['id']] ?? [];
        $adsByCampaign[$ad['campaign_id']][] = $ad;
    }

    foreach ($campaigns as &$campaign) {
        $campaign['ads'] = $adsByCampaign[$campaign['id']] ?? [];
    }

    return $campaigns;
}

/** Groups campaigns by perspective_funnel, preserving campaign order. */
function groupByFunnel(array $campaigns): array
{
    $groups = [];
    foreach ($campaigns as $campaign) {
        $key = $campaign['perspective_funnel'];
        if (!isset($groups[$key])) {
            $groups[$key] = [
                'funnel' => $key,
                'funnelUrl' => $campaign['perspective_funnel_url'],
                'campaigns' => [],
            ];
        }
        $groups[$key]['campaigns'][] = $campaign;
    }
    return array_values($groups);
}

function fetchFunnelExtraLeads(PDO $pdo): array
{
    $rows = $pdo->query('SELECT * FROM funnel_extra_leads')->fetchAll();
    $dates = $pdo->query('SELECT funnel, lead_date FROM funnel_extra_lead_dates')->fetchAll();
    $datesByFunnel = [];
    foreach ($dates as $row) {
        $datesByFunnel[$row['funnel']][] = $row['lead_date'];
    }
    $result = [];
    foreach ($rows as $row) {
        $result[$row['funnel']] = ['note' => $row['note'], 'dates' => $datesByFunnel[$row['funnel']] ?? []];
    }
    return $result;
}

function fetchComments(PDO $pdo, string $entityType, string $entityId): array
{
    $stmt = $pdo->prepare(
        'SELECT * FROM comments WHERE entity_type = :t AND entity_id = :id ORDER BY created_at ASC'
    );
    $stmt->execute(['t' => $entityType, 'id' => $entityId]);
    return $stmt->fetchAll();
}

/** All comments, keyed by "entityType:entityId" — avoids one query per ad/campaign. */
function fetchAllCommentsGrouped(PDO $pdo): array
{
    $rows = $pdo->query('SELECT * FROM comments ORDER BY created_at ASC')->fetchAll();
    $grouped = [];
    foreach ($rows as $row) {
        $grouped[$row['entity_type'] . ':' . $row['entity_id']][] = $row;
    }
    return $grouped;
}

function fetchEditLog(PDO $pdo, string $entityType, string $entityId): array
{
    $stmt = $pdo->prepare(
        'SELECT * FROM edit_log WHERE entity_type = :t AND entity_id = :id ORDER BY created_at DESC LIMIT 5'
    );
    $stmt->execute(['t' => $entityType, 'id' => $entityId]);
    return $stmt->fetchAll();
}

function addComment(PDO $pdo, string $entityType, string $entityId, string $author, string $body): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO comments (entity_type, entity_id, author_name, body, created_at) VALUES (:t, :id, :a, :b, :c)'
    );
    $stmt->execute([
        't' => $entityType,
        'id' => $entityId,
        'a' => $author,
        'b' => $body,
        'c' => gmdate('c'),
    ]);
}

const EDITABLE_CAMPAIGN_FIELDS = ['note', 'status'];

function editCampaignField(PDO $pdo, string $campaignId, string $field, string $newValue, string $author): bool
{
    if (!in_array($field, EDITABLE_CAMPAIGN_FIELDS, true)) {
        return false;
    }
    if ($field === 'status' && !in_array($newValue, ['active', 'off'], true)) {
        return false;
    }

    $stmt = $pdo->prepare('SELECT ' . $field . ' FROM campaigns WHERE id = :id');
    $stmt->execute(['id' => $campaignId]);
    $old = $stmt->fetchColumn();
    if ($old === false) {
        return false;
    }

    $update = $pdo->prepare("UPDATE campaigns SET $field = :v WHERE id = :id");
    $update->execute(['v' => $newValue, 'id' => $campaignId]);

    $log = $pdo->prepare(
        'INSERT INTO edit_log (entity_type, entity_id, field, old_value, new_value, author_name, created_at)
         VALUES (:t, :id, :f, :o, :n, :a, :c)'
    );
    $log->execute([
        't' => 'campaign',
        'id' => $campaignId,
        'f' => $field,
        'o' => $old,
        'n' => $newValue,
        'a' => $author,
        'c' => gmdate('c'),
    ]);

    return true;
}

function fmtEur(?float $v): string
{
    if ($v === null) {
        return '—';
    }
    return number_format($v, 2, ',', '.') . ' €';
}

function fmtNum(?int $v): string
{
    if ($v === null) {
        return '—';
    }
    return number_format($v, 0, ',', '.');
}

function timeAgo(string $iso): string
{
    $diff = time() - strtotime($iso);
    if ($diff < 60) {
        return 'gerade eben';
    }
    if ($diff < 3600) {
        return floor($diff / 60) . ' Min.';
    }
    if ($diff < 86400) {
        return floor($diff / 3600) . ' Std.';
    }
    return floor($diff / 86400) . ' Tage';
}
