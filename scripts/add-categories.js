#!/usr/bin/env node
/**
 * Add categories to all skills based on keyword analysis
 */

import fs from 'fs';
import pg from 'pg';

const SKILLS_FILE = '/root/.openclaw/workspace/mission-control/artifacts/developer/all-clawhub-skills-full.json';

// Category keywords mapping
const CATEGORY_RULES = {
  ai: ['ai', 'agent', 'llm', 'gpt', 'claude', 'openai', 'anthropic', 'gemini', 'ollama', 'model', 'chat', 'reasoning', 'autonomy', 'personality'],
  automation: ['automation', 'auto', 'workflow', 'task', 'schedule', 'cron', 'trigger', 'bot', 'scraper', 'browser', 'webhook'],
  communication: ['telegram', 'discord', 'slack', 'email', 'gmail', 'outlook', 'whatsapp', 'signal', 'imessage', 'sms', 'chat'],
  development: ['github', 'git', 'code', 'coding', 'programming', 'file', 'filesystem', 'shell', 'cli', 'terminal', 'vscode', 'debug', 'test'],
  marketing: ['marketing', 'seo', 'ads', 'social', 'twitter', 'x', 'instagram', 'tiktok', 'facebook', 'linkedin', 'content', 'copywriting'],
  research: ['search', 'research', 'web', 'perplexity', 'exa', 'tavily', 'google', 'bing', 'news', 'summarize', 'summary', 'scrape'],
  productivity: ['calendar', 'note', 'notion', 'obsidian', 'todo', 'task', 'reminder', 'organize', 'time', 'schedule', 'project'],
  media: ['image', 'video', 'audio', 'youtube', 'spotify', 'music', 'picture', 'photo', 'caption', 'voice', 'tts', 'stt'],
  finance: ['crypto', 'bitcoin', 'ethereum', 'solana', 'defi', 'trading', 'stock', 'price', 'token', 'nft', 'wallet', 'balance'],
  data: ['database', 'sql', 'postgres', 'mongodb', 'data', 'csv', 'excel', 'sheet', 'analytics', 'api', 'http', 'fetch'],
  cloud: ['aws', 'azure', 'gcp', 'google cloud', 'cloudflare', 'vercel', 'netlify', 'serverless', 'lambda'],
  security: ['security', 'auth', 'oauth', 'password', 'token', 'encrypt', 'identity', 'did', 'verification'],
  mobile: ['ios', 'android', 'apple', 'iphone', 'ipad', 'app store', 'play store'],
  integrations: ['integration', 'connect', 'link', 'sync', 'import', 'export', 'zapier', 'make'],
  design: ['design', 'ui', 'ux', 'figma', 'image', 'generate', 'create', 'art', 'logo'],
  custom: ['custom', 'personal', 'personalize', 'setup', 'config', 'configuration']
};

// Infer category from skill data
function inferCategories(skill) {
  const text = `${skill.name} ${skill.description || ''} ${(skill.tags || []).join(' ')} ${skill.author}`.toLowerCase();
  const categories = new Set();
  
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        categories.add(category);
        break;
      }
    }
  }
  
  // Default to productivity if no category found
  if (categories.size === 0) {
    categories.add('productivity');
  }
  
  return Array.from(categories);
}

async function addCategories() {
  console.log('🚀 Adding categories to all skills...\n');
  
  // Load skills from JSON
  const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
  const skills = data.skills;
  
  console.log(`📊 Total skills: ${skills.length}\n`);
  
  // Connect to remote database
  const client = new pg.Client({
    host: '165.232.135.139',
    port: 5432,
    database: 'clawhub',
    user: 'alexander',
    password: 'epArThiEGoSt'
  });
  
  await client.connect();
  
  try {
    let updated = 0;
    let errors = 0;
    
    console.log('Processing skills...\n');
    
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      
      // Calculate categories
      const categories = inferCategories(skill);
      
      try {
        await client.query(
          `UPDATE clawhub_skills SET categories = $1 WHERE slug = $2`,
          [categories, skill.slug]
        );
        updated++;
        
        if (updated % 100 === 0) {
          console.log(`  Updated: ${updated}/${skills.length}`);
        }
      } catch (err) {
        errors++;
        console.log(`  ❌ ${skill.slug}: ${err.message}`);
      }
    }
    
    console.log('\n✅ Done!');
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    
    // Show category distribution
    console.log('\n📊 Category Distribution:');
    const result = await client.query(`
      SELECT category, COUNT(*) as count
      FROM (
        SELECT UNNEST(categories) as category
        FROM clawhub_skills
      ) sub
      GROUP BY category
      ORDER BY count DESC
    `);
    
    result.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count}`);
    });
    
  } finally {
    await client.end();
  }
}

addCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
