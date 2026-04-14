ALTER TABLE leads ADD COLUMN parent_first_name TEXT;
ALTER TABLE leads ADD COLUMN parent_last_name TEXT;
ALTER TABLE leads ADD COLUMN student_first_name TEXT;
ALTER TABLE leads ADD COLUMN student_last_name TEXT;
ALTER TABLE leads ADD COLUMN student_experience INTEGER;
ALTER TABLE leads ADD COLUMN student_goals TEXT;
ALTER TABLE leads ADD COLUMN demo_datetime TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_parent_name ON leads(parent_last_name, parent_first_name);
CREATE INDEX IF NOT EXISTS idx_leads_student_name ON leads(student_last_name, student_first_name);
