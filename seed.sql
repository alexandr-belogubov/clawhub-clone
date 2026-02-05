-- ClawHub Skills Data Seed
-- Run AFTER schema.sql to populate initial skills

-- Disable triggers temporarily for faster import
ALTER TABLE bookmarks DISABLE TRIGGER bookmarks_count_trigger;

-- Copy skills data from CSV
COPY clawhub_skills (
    id, slug, name, author, description, downloads, installs, stars,
    tags, categories, github_url, version, url,
    bookmarks_count, views, created_at, updated_at
) FROM '/tmp/skills_data.csv' WITH (FORMAT csv, HEADER true);

-- Re-enable triggers
ALTER TABLE bookmarks ENABLE TRIGGER bookmarks_count_trigger;

-- Verify data
SELECT COUNT(*) as total_skills FROM clawhub_skills;
