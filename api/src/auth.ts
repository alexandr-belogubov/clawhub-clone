import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import pg from 'pg';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(helmet());
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  host: process.env.DB_HOST || '165.232.135.139',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'clawhub',
  user: process.env.DB_USER || 'alexander',
  password: process.env.DB_PASSWORD || 'epArThiEGoSt',
  max: 20,
});

// Auth middleware
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, provider) 
       VALUES ($1, $2, $3, 'email') 
       RETURNING id, email, name`,
      [email, hashPassword(password), name || email.split('@')[0]]
    );
    
    const user = result.rows[0];
    const token = generateToken();
    
    res.json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT id, email, name, avatar_url, role FROM users WHERE email = $1 AND password_hash = $2 AND is_active',
      [email, hashPassword(password)]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const token = generateToken();
    
    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Simple token storage (in production, use sessions/JWT)
    const result = await pool.query(
      'SELECT id, email, name, avatar_url, role FROM users WHERE id = $1',
      [parseInt(token) || 0]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Auth check failed' });
  }
});

// Google OAuth (simplified)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, email, name, avatarUrl } = req.body;
    
    let result = await pool.query('SELECT id, email, name, avatar_url, role FROM users WHERE google_id = $1', [googleId]);
    
    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO users (email, name, avatar_url, google_id, provider) 
         VALUES ($1, $2, $3, $4, 'google') 
         RETURNING id, email, name, avatar_url, role`,
        [email, name, avatarUrl, googleId]
      );
    }
    
    const user = result.rows[0];
    const token = generateToken();
    
    res.json({ user, token });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google auth failed' });
  }
});

// ============ BOOKMARKS ROUTES ============

// Get user bookmarks
app.get('/api/bookmarks', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || req.query.userId || 0);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const result = await pool.query(
      `SELECT s.*, b.created_at as bookmarked_at
       FROM bookmarks b
       JOIN clawhub_skills s ON s.slug = b.skill_slug
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    
    res.json({ bookmarks: result.rows });
  } catch (err) {
    console.error('Get bookmarks error:', err);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

// Add bookmark
app.post('/api/bookmarks', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || 0);
    const { slug } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    await pool.query(
      'INSERT INTO bookmarks (user_id, skill_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, slug]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Add bookmark error:', err);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// Remove bookmark
app.delete('/api/bookmarks/:slug', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || 0);
    const { slug } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    await pool.query('DELETE FROM bookmarks WHERE user_id = $1 AND skill_slug = $2', [userId, slug]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Remove bookmark error:', err);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// Check if bookmarked
app.get('/api/bookmarks/:slug/check', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || req.query.userId || 0);
    const { slug } = req.params;
    
    const result = await pool.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND skill_slug = $2',
      [userId, slug]
    );
    
    res.json({ bookmarked: result.rows.length > 0 });
  } catch (err) {
    console.error('Check bookmark error:', err);
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
});

// ============ USER SKILLS ROUTES ============

// Submit a skill
app.post('/api/user-skills', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || 0);
    const { name, description, githubUrl, version, tags, categories } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const result = await pool.query(
      `INSERT INTO user_skills (user_id, slug, name, author, description, github_url, version, tags, categories)
       VALUES ($1, $2, $3, (SELECT name FROM users WHERE id = $1), $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, slug, name, description, githubUrl, version || '1.0.0', tags || [], categories || []]
    );
    
    res.json({ skill: result.rows[0] });
  } catch (err) {
    console.error('Submit skill error:', err);
    res.status(500).json({ error: 'Failed to submit skill' });
  }
});

// Get user's skills
app.get('/api/user-skills', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || req.query.userId || 0);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const result = await pool.query(
      'SELECT * FROM user_skills WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({ skills: result.rows });
  } catch (err) {
    console.error('Get user skills error:', err);
    res.status(500).json({ error: 'Failed to get skills' });
  }
});

// Update user's skill
app.put('/api/user-skills/:id', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || 0);
    const { id } = req.params;
    const { name, description, githubUrl, version, tags, categories } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const result = await pool.query(
      `UPDATE user_skills 
       SET name = $1, description = $2, github_url = $3, version = $4, tags = $5, categories = $6, status = 'pending', updated_at = NOW()
       WHERE id = $7 AND user_id = $8 AND status = 'pending'
       RETURNING *`,
      [name, description, githubUrl, version, tags || [], categories || [], parseInt(id), userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found or cannot be edited' });
    }
    
    res.json({ skill: result.rows[0] });
  } catch (err) {
    console.error('Update skill error:', err);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// Delete user's skill
app.delete('/api/user-skills/:id', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || 0);
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    await pool.query('DELETE FROM user_skills WHERE id = $1 AND user_id = $2 AND status = \'pending\'', [parseInt(id), userId]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Delete skill error:', err);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// ============ MODERATION ROUTES ============

// Get pending skills (moderators only)
app.get('/api/moderation/pending', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || 0);
    
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0 || !['moderator', 'admin'].includes(user.rows[0].role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await pool.query(
      `SELECT us.*, u.name as author_name, u.email as author_email
       FROM user_skills us
       JOIN users u ON u.id = us.user_id
       WHERE us.status = 'pending'
       ORDER BY us.submitted_at ASC`
    );
    
    res.json({ skills: result.rows });
  } catch (err) {
    console.error('Get pending error:', err);
    res.status(500).json({ error: 'Failed to get pending skills' });
  }
});

// Approve/reject skill
app.post('/api/moderation/:id', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] || 0);
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' | 'reject'
    
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0 || !['moderator', 'admin'].includes(user.rows[0].role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    const skill = await pool.query('SELECT * FROM user_skills WHERE id = $1', [parseInt(id)]);
    if (skill.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    const s = skill.rows[0];
    
    if (action === 'approve') {
      // Add to main skills table
      await pool.query(
        `INSERT INTO clawhub_skills (slug, name, author, description, github_url, version, tags, categories, url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [s.slug, s.name, s.author, s.description, s.github_url, s.version, s.tags, s.categories, `https://clawhub.ai/${s.author}/${s.slug}`]
      );
    }
    
    await pool.query(
      `UPDATE user_skills SET status = $1, moderation_notes = $2, moderated_at = NOW(), moderator_id = $3 WHERE id = $4`,
      [status, notes, userId, parseInt(id)]
    );
    
    res.json({ success: true, status });
  } catch (err) {
    console.error('Moderation error:', err);
    res.status(500).json({ error: 'Moderation failed' });
  }
});

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`ClawHub API (Auth + Bookmarks) running on port ${PORT}`);
});

export { app };
