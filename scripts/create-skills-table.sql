-- ClawHub Skills Database Schema
-- Run: psql -d your_database -f scripts/create-skills-table.sql

-- Drop existing table
DROP TABLE IF EXISTS clawhub_skills CASCADE;

-- Create skills table
CREATE TABLE clawhub_skills (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    downloads INTEGER DEFAULT 0,
    installs INTEGER DEFAULT 0,
    stars INTEGER DEFAULT 0,
    description TEXT,
    tags TEXT[], -- PostgreSQL array
    categories TEXT[],
    github_url VARCHAR(500),
    version VARCHAR(50) DEFAULT '1.0.0',
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_skills_slug ON clawhub_skills(slug);
CREATE INDEX idx_skills_author ON clawhub_skills(author);
CREATE INDEX idx_skills_downloads ON clawhub_skills(downloads DESC);
CREATE INDEX idx_skills_name ON clawhub_skills(name);
CREATE INDEX idx_skills_tags ON clawhub_skills USING GIN(tags);
CREATE INDEX idx_skills_categories ON clawhub_skills USING GIN(categories);

-- Full text search index
CREATE INDEX idx_skills_search ON clawhub_skills USING GIN(
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || author)
);

-- Insert skills from JSON
\echo 'Loading skills data...'

\i /root/.openclaw/workspace/mission-control/artifacts/developer/all-clawhub-skills-full.json

-- Note: This file is for reference. Actual import done via Node.js script below.
