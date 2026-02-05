-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  provider VARCHAR(50) DEFAULT 'email', -- 'email', 'google'
  google_id VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'moderator', 'admin'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User skills (submitted for moderation)
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
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  moderation_notes TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  moderated_at TIMESTAMP,
  moderator_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, user_id)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  skill_slug VARCHAR(500) REFERENCES clawhub_skills(slug) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill_slug)
);

-- Add bookmarks count to clawhub_skills
ALTER TABLE clawhub_skills ADD COLUMN bookmarks_count INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_status ON user_skills(status);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_skill_slug ON bookmarks(skill_slug);

-- Function to update bookmarks count
CREATE OR REPLACE FUNCTION update_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clawhub_skills SET bookmarks_count = bookmarks_count + 1 WHERE slug = NEW.skill_slug;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clawhub_skills SET bookmarks_count = bookmarks_count - 1 WHERE slug = OLD.skill_slug;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for bookmarks count
DROP TRIGGER IF EXISTS bookmarks_count_trigger ON bookmarks;
CREATE TRIGGER bookmarks_count_trigger
AFTER INSERT OR DELETE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION update_bookmarks_count();

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(name, '[^a-z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;
