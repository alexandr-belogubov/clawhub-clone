-- ClawHub Complete Database Schema
-- Run as postgres user: sudo -u postgres psql -d clawhub -f schema.sql

-- Drop existing tables (CASCADE to remove dependencies)
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clawhub_skills CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    provider VARCHAR(50) DEFAULT 'email',
    google_id VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clawhub_skills table (main catalog)
CREATE TABLE clawhub_skills (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(500) NOT NULL UNIQUE,
    name VARCHAR(500) NOT NULL,
    author VARCHAR(500) NOT NULL,
    description TEXT,
    downloads INTEGER DEFAULT 0,
    installs INTEGER DEFAULT 0,
    stars INTEGER DEFAULT 0,
    tags TEXT[],
    categories TEXT[],
    github_url TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',
    url TEXT NOT NULL,
    bookmarks_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_skills table (for user-submitted skills)
CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(500) NOT NULL,
    name VARCHAR(500) NOT NULL,
    author VARCHAR(500) NOT NULL,
    description TEXT,
    github_url TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',
    tags TEXT[],
    categories TEXT[],
    status VARCHAR(50) DEFAULT 'pending',
    moderation_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderated_at TIMESTAMP,
    moderator_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(slug, user_id)
);

-- Create bookmarks table
CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_slug VARCHAR(500) REFERENCES clawhub_skills(slug) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_slug)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_status ON user_skills(status);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_skill_slug ON bookmarks(skill_slug);
CREATE INDEX idx_clawhub_skills_slug ON clawhub_skills(slug);
CREATE INDEX idx_clawhub_skills_views ON clawhub_skills(views DESC);
CREATE INDEX idx_clawhub_skills_created_at ON clawhub_skills(created_at DESC);
CREATE INDEX idx_clawhub_skills_name ON clawhub_skills(name ASC);
CREATE INDEX idx_skills_author ON clawhub_skills(author);
CREATE INDEX idx_skills_categories ON clawhub_skills USING gin(categories);
CREATE INDEX idx_skills_tags ON clawhub_skills USING gin(tags);

-- Create trigger function for bookmarks_count auto-update
CREATE OR REPLACE FUNCTION update_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE clawhub_skills SET bookmarks_count = bookmarks_count - 1 
        WHERE slug = OLD.skill_slug;
        RETURN OLD;
    ELSE
        UPDATE clawhub_skills SET bookmarks_count = bookmarks_count + 1 
        WHERE slug = NEW.skill_slug;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bookmarks_count
DROP TRIGGER IF EXISTS bookmarks_count_trigger ON bookmarks;
CREATE TRIGGER bookmarks_count_trigger
AFTER INSERT OR DELETE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION update_bookmarks_count();

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO alexander;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO alexander;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO alexander;

-- Reset search_path for alexander user
ALTER ROLE alexander SET search_path = public;
