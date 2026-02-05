#!/usr/bin/env node
/**
 * Import ClawHub skills to PostgreSQL database (socket connection)
 */

const fs = require('fs');
const { Client } = require('pg');

const SKILLS_FILE = '/root/.openclaw/workspace/mission-control/artifacts/developer/all-clawhub-skills-full.json';

async function importSkills() {
  console.log('🚀 Starting PostgreSQL import...\n');
  
  const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
  const skills = data.skills;
  
  console.log(`📊 Total skills to import: ${skills.length}\n`);
  
  // Connect via socket with password
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'clawhub',
    user: 'root',
    password: 'root'
  });
  
  await client.connect();
  
  try {
    console.log('📋 Creating table...');
    await client.query(`
      DROP TABLE IF EXISTS clawhub_skills CASCADE;
      
      CREATE TABLE clawhub_skills (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(500) NOT NULL UNIQUE,
        name VARCHAR(500) NOT NULL,
        author VARCHAR(500) NOT NULL,
        downloads INTEGER DEFAULT 0,
        installs INTEGER DEFAULT 0,
        stars INTEGER DEFAULT 0,
        description TEXT,
        tags TEXT[],
        categories TEXT[],
        github_url TEXT,
        version VARCHAR(50) DEFAULT '1.0.0',
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_skills_slug ON clawhub_skills(slug);
      CREATE INDEX idx_skills_author ON clawhub_skills(author);
      CREATE INDEX idx_skills_downloads ON clawhub_skills(downloads DESC);
      CREATE INDEX idx_skills_name ON clawhub_skills(name);
      CREATE INDEX idx_skills_tags ON clawhub_skills USING GIN(tags);
      CREATE INDEX idx_skills_categories ON clawhub_skills USING GIN(categories);
    `);
    console.log('✅ Table created\n');
    
    console.log('📥 Inserting skills (batches of 100)...');
    const batchSize = 100;
    
    for (let i = 0; i < skills.length; i += batchSize) {
      const batch = skills.slice(i, i + batchSize);
      
      const values = [];
      const placeholders = [];
      
      batch.forEach((skill, idx) => {
        const offset = idx * 12;
        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12})`
        );
        
        values.push(
          skill.slug,
          skill.name,
          skill.author,
          skill.downloads || 0,
          skill.installs || 0,
          skill.stars || 0,
          skill.description || '',
          skill.tags || [],
          skill.categories || [],
          skill.github_url || '',
          skill.version || '1.0.0',
          skill.url
        );
      });
      
      await client.query(
        `INSERT INTO clawhub_skills 
          (slug, name, author, downloads, installs, stars, description, tags, categories, github_url, version, url)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (slug) DO NOTHING`,
        values
      );
      
      console.log(`  ${Math.min(i + batchSize, skills.length)}/${skills.length}`);
    }
    
    console.log('\n✅ Import complete!');
    
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(downloads) as total_downloads,
        SUM(installs) as total_installs,
        SUM(stars) as total_stars,
        COUNT(*) FILTER (WHERE description IS NOT NULL AND description != '' AND description != 'No description available') as with_description
      FROM clawhub_skills
    `);
    
    console.log('\n📊 Database Stats:');
    console.log(`   Total skills: ${stats.rows[0].total}`);
    console.log(`   Total downloads: ${parseInt(stats.rows[0].total_downloads).toLocaleString()}`);
    console.log(`   Total installs: ${parseInt(stats.rows[0].total_installs).toLocaleString()}`);
    console.log(`   Total stars: ${parseInt(stats.rows[0].total_stars).toLocaleString()}`);
    console.log(`   With descriptions: ${stats.rows[0].with_description}`);
    
    console.log('\n🏆 Top 10:');
    const top10 = await client.query(`
      SELECT name, author, downloads 
      FROM clawhub_skills 
      ORDER BY downloads DESC 
      LIMIT 10
    `);
    
    top10.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.name} (${row.downloads} ⤓) - ${row.author}`);
    });
    
  } finally {
    await client.end();
  }
}

importSkills()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
