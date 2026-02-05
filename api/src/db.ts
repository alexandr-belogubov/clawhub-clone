import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || '165.232.135.139',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'clawhub',
  user: process.env.DB_USER || 'alexander',
  password: process.env.DB_PASSWORD || 'epArThiEGoSt',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
  return result;
}

export async function getSkills(options: {
  category?: string;
  tag?: string;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { category, tag, search, sort = 'views', limit = 50, offset = 0 } = options;
  
  let where = 'WHERE 1=1';
  const params: unknown[] = [];
  let paramIndex = 1;
  
  if (category) {
    where += ` AND $${paramIndex} = ANY(categories)`;
    params.push(category);
    paramIndex++;
  }
  
  if (tag) {
    where += ` AND $${paramIndex} = ANY(tags)`;
    params.push(tag);
    paramIndex++;
  }
  
  if (search) {
    where += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  
  // Sort by views by default
  let orderBy = 'views DESC';
  switch (sort) {
    case 'installs':
      orderBy = 'installs DESC';
      break;
    case 'stars':
      orderBy = 'stars DESC';
      break;
    case 'recent':
      orderBy = 'created_at DESC';
      break;
    case 'name':
      orderBy = 'name ASC';
      break;
  }
  
  params.push(limit, offset);
  
  const result = await query(
    `SELECT slug, name, author, views, installs, stars, description, tags, categories, 
            github_url, version, url, created_at, updated_at
     FROM clawhub_skills ${where}
     ORDER BY ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );
  
  return result.rows.map(row => ({
    id: row.slug,
    slug: row.slug,
    name: row.name,
    author: row.author,
    description: row.description,
    views: row.views,
    installs: row.installs,
    rating: row.stars > 0 ? Math.round(row.stars / 10 * 5) / 5 : 0,
    stars: row.stars,
    tags: row.tags || [],
    categories: row.categories || [],
    github_url: row.github_url,
    version: row.version,
    updated_at: row.updated_at,
    created_at: row.created_at
  }));
}

export async function getSkillBySlug(slug: string) {
  // Increment views
  await query(`UPDATE clawhub_skills SET views = views + 1 WHERE slug = $1`, [slug]);
  
  const result = await query(
    `SELECT slug, name, author, views, installs, stars, description, tags, categories,
            github_url, version, url, created_at, updated_at
     FROM clawhub_skills WHERE slug = $1`,
    [slug]
  );
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    author: row.author,
    description: row.description,
    views: row.views,
    installs: row.installs,
    rating: row.stars > 0 ? Math.round(row.stars / 10 * 5) / 5 : 0,
    stars: row.stars,
    tags: row.tags || [],
    categories: row.categories || [],
    github_url: row.github_url,
    version: row.version,
    url: row.url,
    updated_at: row.updated_at,
    created_at: row.created_at
  };
}

export async function getCategories() {
  const result = await query(
    `SELECT DISTINCT UNNEST(categories) as category, COUNT(*) as count
     FROM clawhub_skills GROUP BY category ORDER BY count DESC`
  );
  return result.rows.map(r => ({ name: r.category, count: parseInt(r.count) }));
}

export async function getTags() {
  const result = await query(
    `SELECT DISTINCT UNNEST(tags) as tag, COUNT(*) as count
     FROM clawhub_skills GROUP BY tag ORDER BY count DESC LIMIT 50`
  );
  return result.rows.map(r => ({ name: r.tag, count: parseInt(r.count) }));
}

export async function getStats() {
  const result = await query(
    `SELECT COUNT(*) as total, SUM(views) as views, SUM(installs) as installs
     FROM clawhub_skills`
  );
  return {
    total: parseInt(result.rows[0].total),
    views: parseInt(result.rows[0].views || 0),
    installs: parseInt(result.rows[0].installs || 0)
  };
}

export async function close() {
  await pool.end();
}
