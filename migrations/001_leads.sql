CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    parent_number TEXT NOT NULL,
    message TEXT,
    contact TEXT,
    source_url TEXT,
    event_id TEXT,
    fbc TEXT,
    meta_event_id TEXT,
    meta_success INTEGER,
    meta_error TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_event_id ON leads(event_id);