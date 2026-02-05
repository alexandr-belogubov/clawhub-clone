#!/usr/bin/env node
/**
 * Batch fetch skill descriptions using parallel requests
 * Uses native http with agent keep-alive for performance
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

const SKILLS_FILE = '/root/.openclaw/workspace/mission-control/artifacts/developer/all-clawhub-skills-full.json';
const OUTPUT_FILE = '/root/.openclaw/workspace/mission-control/artifacts/developer/all-clawhub-skills-full.json';
const CONCURRENCY = 20; // Parallel requests
const TIMEOUT = 3000;

const agent = new http.Agent({ keepAlive: true, maxSockets: CONCURRENCY });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: CONCURRENCY });

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { 
      agent: url.startsWith('https') ? httpsAgent : agent,
      timeout: TIMEOUT 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function extractDescription(html) {
  // Meta description
  let match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  if (match) return match[1].trim().substring(0, 300);
  
  // OG description  
  match = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (match) return match[1].trim().substring(0, 300);
  
  // First substantial paragraph
  match = html.match(/<p[^>]*>([^<]{30,300})<\/p>/i);
  if (match) return match[1].trim();
  
  // Main content div
  match = html.match(/<main[^>]*>([^<]{50,400})/i);
  if (match) return match[1].trim().substring(0, 300);
  
  return '';
}

async function batchProcess(items, concurrency) {
  const results = [];
  const queue = [...items];
  const workers = new Set();
  
  return new Promise((resolve) => {
    function worker() {
      if (queue.length === 0) {
        workers.delete(worker);
        if (workers.size === 0) resolve(results);
        return;
      }
      
      const item = queue.shift();
      workers.add(worker);
      
      item()
        .then(result => results.push(result))
        .catch(() => null)
        .finally(() => worker());
    }
    
    for (let i = 0; i < concurrency; i++) worker();
  });
}

async function parseDescriptions() {
  console.log('🚀 Starting batch description parsing...\n');
  
  const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
  const skills = data.skills;
  
  console.log(`📊 Total skills: ${skills.length}`);
  console.log(`🔄 Concurrency: ${CONCURRENCY}\n`);
  
  const startTime = Date.now();
  
  // Create tasks
  const tasks = skills.map((skill, i) => async () => {
    if (skill.description && skill.description.length > 20) {
      return { index: i, description: skill.description };
    }
    
    try {
      const html = await fetchUrl(skill.url);
      const description = extractDescription(html) || 'No description available';
      skill.description = description;
    } catch (e) {
      skill.description = skill.description || 'No description available';
    }
    
    return { index: i, description: skill.description };
  });
  
  // Process in batches
  let processed = 0;
  await batchProcess(tasks, CONCURRENCY);
  
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  
  // Count non-empty descriptions
  const withDesc = skills.filter(s => s.description && s.description.length > 20).length;
  
  // Save
  data.stats.processedAt = new Date().toISOString();
  data.stats.descriptionsWithContent = withDesc;
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  
  console.log('\n✅ Done!');
  console.log(`📁 Saved: ${OUTPUT_FILE}`);
  console.log(`⏱️ Time: ${elapsed}s`);
  console.log(`📝 With descriptions: ${withDesc}/${skills.length}`);
  
  // Sample
  console.log('\n📝 Sample:');
  skills.filter(s => s.description && s.description.length > 20).slice(0, 3).forEach(s => {
    console.log(`  - ${s.name}: ${s.description.substring(0, 70)}...`);
  });
}

parseDescriptions().then(() => process.exit(0)).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
