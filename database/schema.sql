-- ClawHub Clone Database Schema
-- PostgreSQL

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    readme TEXT,
    downloads INTEGER DEFAULT 0,
    installs INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    github_url VARCHAR(500),
    repository_url VARCHAR(500),
    version VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    skill_id VARCHAR(255) REFERENCES skills(id) ON DELETE CASCADE,
    author VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100)
);

-- Installations tracking
CREATE TABLE IF NOT EXISTS installations (
    id SERIAL PRIMARY KEY,
    skill_id VARCHAR(255) REFERENCES skills(id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_skills_slug ON skills(slug);
CREATE INDEX idx_skills_author ON skills(author);
CREATE INDEX idx_skills_tags ON skills USING GIN(tags);
CREATE INDEX idx_skills_categories ON skills USING GIN(categories);
CREATE INDEX idx_skills_rating ON skills(rating DESC);
CREATE INDEX idx_skills_downloads ON skills(downloads DESC);
CREATE INDEX idx_skills_installs ON skills(installs DESC);
CREATE INDEX idx_reviews_skill_id ON reviews(skill_id);
CREATE INDEX idx_installations_skill_id ON installations(skill_id);
