-- Performance Marketing Report — PHP/MySQL schema.
--
-- Written to run unchanged on MySQL (production, netcup/Plesk) and SQLite
-- (local dev/testing) via PDO: plain INTEGER PRIMARY KEY, no ENUM, no
-- AUTO_INCREMENT keyword (MySQL infers it from INTEGER PRIMARY KEY with the
-- right engine defaults is NOT true, so see db.php for the one piece that
-- genuinely differs between engines: the CREATE TABLE statements below run
-- through a tiny per-engine string substitution in db.php::migrate().

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  objective TEXT NOT NULL,
  daily_budget REAL NOT NULL,
  spend REAL NOT NULL,
  reach INTEGER NOT NULL,
  impressions INTEGER NOT NULL,
  delivery TEXT NOT NULL,
  recommendations INTEGER NOT NULL DEFAULT 0,
  meta_results INTEGER NOT NULL DEFAULT 0,
  meta_cost_per_result REAL,
  perspective_leads INTEGER NOT NULL DEFAULT 0,
  perspective_funnel TEXT NOT NULL,
  perspective_funnel_url TEXT NOT NULL,
  lead_status_neu INTEGER,
  lead_status_nicht_erreicht INTEGER,
  lead_status_disqualifiziert INTEGER,
  lead_status_abschluss INTEGER,
  incomplete INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  name TEXT NOT NULL,
  badge TEXT,
  image TEXT,
  video_url TEXT,
  meta_results INTEGER,
  meta_cost_per_result REAL,
  spend REAL NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  perspective_leads INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lead_dates (
  id INTEGER PRIMARY KEY,
  ad_id TEXT NOT NULL REFERENCES ads(id),
  lead_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS funnel_extra_leads (
  funnel TEXT PRIMARY KEY,
  note TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS funnel_extra_lead_dates (
  id INTEGER PRIMARY KEY,
  funnel TEXT NOT NULL REFERENCES funnel_extra_leads(funnel),
  lead_date TEXT NOT NULL
);

-- Colleague feedback: one thread per campaign or per ad ("entity_type" +
-- "entity_id"). No foreign key enforced across the two tables since the id
-- can point at either; the app validates the entity exists before inserting.
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'campaign' | 'ad'
  entity_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Every colleague edit to an editable field is logged here as well as
-- applied to the row, so there's a visible history of who changed what.
CREATE TABLE IF NOT EXISTS edit_log (
  id INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'campaign'
  entity_id TEXT NOT NULL,
  field TEXT NOT NULL, -- 'note' | 'status'
  old_value TEXT,
  new_value TEXT,
  author_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ads_campaign ON ads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_lead_dates_ad ON lead_dates(ad_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_edit_log_entity ON edit_log(entity_type, entity_id);
