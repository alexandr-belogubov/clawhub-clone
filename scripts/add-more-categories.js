#!/usr/bin/env node
/**
 * Add more categories to all skills based on keyword analysis
 */

import fs from 'fs';
import pg from 'pg';

const SKILLS_FILE = '/root/.openclaw/workspace/mission-control/artifacts/developer/all-clawhub-skills-full.json';

// Enhanced category rules
const CATEGORY_RULES = {
  ai: ['ai', 'agent', 'llm', 'gpt', 'claude', 'openai', 'anthropic', 'gemini', 'ollama', 'model', 'chat', 'reasoning', 'autonomy', 'personality', 'cognition'],
  automation: ['automation', 'auto', 'workflow', 'task', 'schedule', 'cron', 'trigger', 'bot', 'scraper', 'browser', 'webhook', 'job'],
  communication: ['telegram', 'discord', 'slack', 'email', 'gmail', 'outlook', 'whatsapp', 'signal', 'imessage', 'sms', 'chat', 'messaging', 'messenger'],
  social: ['twitter', 'x', 'instagram', 'tiktok', 'facebook', 'linkedin', 'social', 'post', 'tweet', 'threads', 'mastodon'],
  development: ['github', 'git', 'code', 'coding', 'programming', 'file', 'filesystem', 'shell', 'cli', 'terminal', 'vscode', 'debug', 'test', 'dev'],
  marketing: ['marketing', 'seo', 'ads', 'content', 'copywriting', 'campaign', 'audience', 'subscriber', 'newsletter'],
  research: ['search', 'research', 'web', 'perplexity', 'exa', 'tavily', 'google', 'bing', 'news', 'summarize', 'summary', 'scrape', 'crawl'],
  productivity: ['calendar', 'note', 'notion', 'obsidian', 'todo', 'task', 'reminder', 'organize', 'time', 'schedule', 'project', 'organizer'],
  media: ['image', 'video', 'audio', 'youtube', 'spotify', 'music', 'picture', 'photo', 'caption', 'voice', 'tts', 'stt', 'transcribe', 'generate'],
  finance: ['crypto', 'bitcoin', 'ethereum', 'solana', 'defi', 'trading', 'stock', 'price', 'token', 'nft', 'wallet', 'balance', 'financial'],
  data: ['database', 'sql', 'postgres', 'mongodb', 'data', 'csv', 'excel', 'sheet', 'analytics', 'api', 'http', 'fetch', 'etl'],
  cloud: ['aws', 'azure', 'gcp', 'google cloud', 'cloudflare', 'vercel', 'netlify', 'serverless', 'lambda', 'cloud'],
  security: ['security', 'auth', 'oauth', 'password', 'token', 'encrypt', 'identity', 'did', 'verification', 'secure'],
  mobile: ['ios', 'android', 'apple', 'iphone', 'ipad', 'app store', 'play store', 'mobile'],
  integrations: ['integration', 'connect', 'link', 'sync', 'import', 'export', 'zapier', 'make', 'integrate', 'hook'],
  design: ['design', 'ui', 'ux', 'figma', 'image', 'generate', 'create', 'art', 'logo', 'creative'],
  business: ['business', 'crm', 'sales', 'lead', 'customer', 'erp', 'invoice', 'payment', 'billing', 'subscription'],
  health: ['health', 'fitness', 'medical', 'wellness', 'diet', 'exercise', 'sleep', 'heart', 'track'],
  education: ['education', 'learn', 'course', 'tutorial', 'teach', 'student', 'school', 'university', 'training'],
  travel: ['travel', 'flight', 'hotel', 'booking', 'trip', 'vacation', 'map', 'location', 'gps', 'weather'],
  food: ['food', 'recipe', 'cooking', 'restaurant', 'nutrition', 'meal', 'diet', 'kitchen'],
  entertainment: ['entertainment', 'game', 'gaming', 'movie', 'film', 'tv', 'streaming', 'anime', 'book'],
  news: ['news', 'headline', 'rss', 'feed', 'newspaper', 'magazine', 'article', 'blog'],
  tools: ['tool', 'utility', 'helper', 'misc', 'other', 'various']
};

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
  
  if (categories.size === 0) {
    categories.add('tools');
  }
  
  return Array.from(categories);
}

async function addCategories() {
  console.log('🚀 Adding enhanced categories to all skills...\n');
  
  const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
  const skills = data.skills;
  
  console.log(`📊 Total skills: ${skills.length}\n`);
  
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
      const categories = inferCategories(skill);
      
      try {
        await client.query(`UPDATE clawhub_skills SET categories = $1 WHERE slug = $2`, [categories, skill.slug]);
        updated++;
        
        if (updated % 200 === 0) {
          console.log(`  Updated: ${updated}/${skills.length}`);
        }
      } catch (err) {
        errors++;
      }
    }
    
    console.log('\n✅ Done!');
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    
    console.log('\n📊 New Category Distribution:');
    const result = await client.query(`
      SELECT category, COUNT(*) as count
      FROM (SELECT UNNEST(categories) as category FROM clawhub_skills) sub
      GROUP BY category ORDER BY count DESC
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
