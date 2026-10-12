<section class="sr-section">
    <div class="wrap">
        <div class="sr-kpi-grid">
            <div class="sr-kpi">
                <span class="label">Ausgegeben gesamt</span>
                <div class="value"><?= fmtEur($totalSpend) ?></div>
                <div class="sub">über <?= count($campaigns) ?> Kampagnen</div>
            </div>
            <div class="sr-kpi highlight">
                <span class="label">Leads</span>
                <div class="value"><?= fmtNum($totalLeads) ?></div>
            </div>
            <div class="sr-kpi">
                <span class="label">CPL</span>
                <div class="value"><?= $blendedCpl !== null ? fmtEur($blendedCpl) : '—' ?></div>
            </div>
        </div>

        <div class="funnel-groups">
            <?php foreach ($funnelGroups as $group): ?>
                <?php
                $funnelSpend = array_sum(array_column($group['campaigns'], 'spend'));
                $funnelLeads = array_sum(array_column($group['campaigns'], 'perspective_leads'));
                $extra = $funnelExtraLeads[$group['funnel']] ?? null;
                if ($extra) {
                    $funnelLeads += count($extra['dates']);
                }
                ?>
                <div>
                    <div class="funnel-head">
                        <div class="camp-id">
                            <span class="fh-label">Funnel</span>
                            <a href="<?= htmlspecialchars($group['funnelUrl']) ?>" target="_blank" rel="noopener noreferrer">
                                <?= htmlspecialchars($group['funnel']) ?> ↗
                            </a>
                            <span class="sub" style="font-size:11px;color:var(--muted);">
                                · <?= count($group['campaigns']) ?> <?= count($group['campaigns']) === 1 ? 'Kampagne' : 'Kampagnen' ?>
                            </span>
                        </div>
                        <span class="fh-sum"><?= fmtEur($funnelSpend) ?> · <?= fmtNum($funnelLeads) ?> Leads</span>
                    </div>
                    <div class="funnel-campaigns">
                        <?php foreach ($group['campaigns'] as $campaign): ?>
                            <?php renderCampaign($campaign, $commentsByEntity, $pdo, $author); ?>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<?php
function bestAdImage(array $ads): ?array
{
    $candidates = array_filter($ads, fn($a) => $a['image'] && ($a['perspective_leads'] ?? 0) > 0);
    if (!$candidates) {
        return null;
    }
    usort($candidates, fn($a, $b) => ($b['perspective_leads'] ?? 0) <=> ($a['perspective_leads'] ?? 0));
    return $candidates[array_key_first($candidates)];
}

function renderCampaign(array $campaign, array $commentsByEntity, PDO $pdo, string $author): void
{
    $isActive = $campaign['status'] === 'active';
    $bodyId = 'body-' . $campaign['id'];
    $best = bestAdImage($campaign['ads']);
    $comments = $commentsByEntity['campaign:' . $campaign['id']] ?? [];
    ?>
    <div class="camp">
        <div class="camp-head-row">
            <?php if ($best): ?>
                <div class="camp-thumb"><img src="<?= htmlspecialchars($best['image']) ?>" alt=""></div>
            <?php endif; ?>
            <button type="button" class="camp-head" data-toggle-body="<?= htmlspecialchars($bodyId) ?>">
                <div class="camp-top">
                    <div class="camp-id">
                        <span class="camp-dot <?= $isActive ? 'active' : 'off' ?>"></span>
                        <span class="camp-name"><?= htmlspecialchars($campaign['name']) ?></span>
                        <span class="camp-badge <?= $isActive ? 'active' : 'off' ?>"><?= $isActive ? 'Aktiv' : 'Aus' ?></span>
                        <?php if ($campaign['incomplete']): ?>
                            <span class="camp-badge incomplete">Unvollständig</span>
                        <?php endif; ?>
                    </div>
                    <span class="camp-toggle">Anzeigen anzeigen ▾</span>
                </div>
                <div class="camp-stats">
                    <div class="camp-stat"><div class="v"><?= htmlspecialchars($campaign['objective']) ?></div><div class="l">Ziel</div></div>
                    <div class="camp-stat"><div class="v"><?= fmtNum($campaign['meta_results']) ?></div><div class="l">Meta-Ergebnisse</div>
                        <?php if ($campaign['meta_cost_per_result'] !== null): ?><div class="s"><?= fmtEur($campaign['meta_cost_per_result']) ?> / Ergebnis</div><?php endif; ?>
                    </div>
                    <div class="camp-stat"><div class="v"><?= fmtNum($campaign['perspective_leads']) ?></div><div class="l">Perspective-Leads</div></div>
                    <div class="camp-stat"><div class="v"><?= $campaign['perspective_leads'] > 0 ? fmtEur($campaign['spend'] / $campaign['perspective_leads']) : '—' ?></div><div class="l">CPL</div></div>
                    <div class="camp-stat"><div class="v"><?= fmtEur($campaign['spend']) ?></div><div class="l">Ausgegeben</div><div class="s"><?= fmtEur($campaign['daily_budget']) ?> / Tag</div></div>
                    <div class="camp-stat"><div class="v"><?= fmtNum($campaign['reach']) ?></div><div class="l">Reichweite</div></div>
                    <div class="camp-stat"><div class="v"><?= fmtNum($campaign['impressions']) ?></div><div class="l">Impressionen</div></div>
                </div>
                <?php if ($campaign['lead_status_neu'] !== null): ?>
                    <div class="camp-meta">
                        <span style="text-transform:uppercase;font-weight:800;font-size:10px;color:var(--fog);">Lead-Status:</span>
                        <?php if ($campaign['lead_status_abschluss']): ?><span><?= $campaign['lead_status_abschluss'] ?> Abschluss</span><?php endif; ?>
                        <span><?= $campaign['lead_status_neu'] ?> Neu</span>
                        <span><?= $campaign['lead_status_nicht_erreicht'] ?> Nicht erreicht</span>
                        <span><?= $campaign['lead_status_disqualifiziert'] ?> Disqualifiziert</span>
                    </div>
                <?php endif; ?>
                <div class="camp-meta"><span><?= htmlspecialchars($campaign['delivery']) ?></span> · <span><?= $campaign['recommendations'] ?> Empfehlungen</span></div>
            </button>
        </div>

        <div class="camp-body" id="<?= htmlspecialchars($bodyId) ?>" hidden>
            <?php if ($campaign['note']): ?>
                <p class="camp-note"><?= htmlspecialchars($campaign['note']) ?></p>
            <?php endif; ?>

            <div class="edit-field">
                <form method="post">
                    <input type="hidden" name="action" value="edit_field">
                    <input type="hidden" name="campaign_id" value="<?= htmlspecialchars($campaign['id']) ?>">
                    <input type="hidden" name="field" value="note">
                    <label style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--muted);">Notiz bearbeiten</label>
                    <textarea name="value"><?= htmlspecialchars($campaign['note'] ?? '') ?></textarea>
                    <div class="edit-row">
                        <button type="submit">Notiz speichern</button>
                    </div>
                </form>
                <form method="post" style="margin-top:8px;">
                    <input type="hidden" name="action" value="edit_field">
                    <input type="hidden" name="campaign_id" value="<?= htmlspecialchars($campaign['id']) ?>">
                    <input type="hidden" name="field" value="status">
                    <input type="hidden" name="value" value="<?= $isActive ? 'off' : 'active' ?>">
                    <button type="submit" style="background:var(--koralle);"><?= $isActive ? 'Als "Aus" markieren' : 'Als "Aktiv" markieren' ?></button>
                </form>
                <?php renderEditLog($pdo, 'campaign', $campaign['id']); ?>
            </div>

            <?php renderComments($comments, 'campaign', $campaign['id']); ?>

            <div class="ad-grid" style="margin-top:16px;">
                <?php foreach ($campaign['ads'] as $ad): ?>
                    <?php renderAd($ad, $commentsByEntity['ad:' . $ad['id']] ?? []); ?>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
    <?php
}

function renderAd(array $ad, array $comments): void
{
    $periodLeads = $ad['perspective_leads'];
    ?>
    <div class="ad-card">
        <?php if ($ad['image']): ?>
            <button type="button" data-lightbox="<?= htmlspecialchars($ad['image']) ?>" data-alt="<?= htmlspecialchars($ad['name']) ?>"
                    style="display:block;width:100%;padding:0;border:none;background:none;cursor:zoom-in;">
                <img class="ad-thumb-img" src="<?= htmlspecialchars($ad['image']) ?>" alt="<?= htmlspecialchars($ad['name']) ?>">
            </button>
        <?php else: ?>
            <div class="ad-thumb"></div>
        <?php endif; ?>
        <div class="ad-name"><?= htmlspecialchars($ad['name']) ?></div>
        <?php if ($ad['badge']): ?><span class="ad-badge"><?= htmlspecialchars($ad['badge']) ?></span><?php endif; ?>
        <?php if ($ad['video_url']): ?>
            <a class="ad-video-link" href="<?= htmlspecialchars($ad['video_url']) ?>" target="_blank" rel="noopener noreferrer">▶ Video ansehen</a>
        <?php endif; ?>
        <div class="ad-stats">
            <div><div class="v"><?= fmtNum($ad['meta_results']) ?></div><div class="l">Meta-Ergebnisse</div></div>
            <div><div class="v"><?= $periodLeads !== null ? fmtNum($periodLeads) : '—' ?></div><div class="l">Perspective-Leads</div></div>
            <div><div class="v"><?= fmtEur($ad['spend']) ?></div><div class="l">Ausgegeben</div></div>
            <div><div class="v"><?= $ad['meta_cost_per_result'] !== null ? fmtEur($ad['meta_cost_per_result']) : '—' ?></div><div class="l">Pro Ergebnis</div></div>
            <div><div class="v"><?= fmtNum($ad['reach']) ?></div><div class="l">Reichweite</div></div>
            <div><div class="v"><?= fmtNum($ad['impressions']) ?></div><div class="l">Impressionen</div></div>
        </div>
        <?php renderComments($comments, 'ad', $ad['id']); ?>
    </div>
    <?php
}

function renderComments(array $comments, string $entityType, string $entityId): void
{
    ?>
    <div class="comments">
        <h4>Feedback<?= $comments ? ' (' . count($comments) . ')' : '' ?></h4>
        <?php foreach ($comments as $c): ?>
            <div class="comment">
                <div class="meta"><?= htmlspecialchars($c['author_name']) ?> · <?= timeAgo($c['created_at']) ?></div>
                <?= nl2br(htmlspecialchars($c['body'])) ?>
            </div>
        <?php endforeach; ?>
        <form class="comment-form" method="post">
            <input type="hidden" name="action" value="add_comment">
            <input type="hidden" name="entity_type" value="<?= htmlspecialchars($entityType) ?>">
            <input type="hidden" name="entity_id" value="<?= htmlspecialchars($entityId) ?>">
            <textarea name="body" placeholder="Feedback hinzufügen…" required></textarea>
            <button type="submit">Senden</button>
        </form>
    </div>
    <?php
}

function renderEditLog(PDO $pdo, string $entityType, string $entityId): void
{
    $log = fetchEditLog($pdo, $entityType, $entityId);
    if (!$log) {
        return;
    }
    ?>
    <div class="edit-log">
        <?php foreach ($log as $entry): ?>
            <?= htmlspecialchars($entry['author_name']) ?> hat „<?= htmlspecialchars($entry['field']) ?>" geändert (<?= timeAgo($entry['created_at']) ?>)<br>
        <?php endforeach; ?>
    </div>
    <?php
}
