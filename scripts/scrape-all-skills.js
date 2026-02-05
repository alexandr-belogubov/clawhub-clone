#!/usr/bin/env node
/**
 * Full ClawHub Skills Scraper
 * Parses ALL skills from clawhub.ai via infinite scroll
 * 
 * Usage: node scripts/scrape-all-skills.js
 * 
 * Prerequisites:
 *   npm install puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = '/root/.openclaw/workspace/mission-control/artifacts/developer/all-clawhub-skills-full.json';
const URL = 'https://clawhub.ai/skills';

async function scrapeAllSkills() {
  console.log('🚀 Starting ClawHub skills scrape...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('📄 Loading page...');
  await page.goto(URL, { waitUntil: 'networkidle0' });
  
  await page.waitForSelector('a[href^="/"]', { timeout: 10000 });
  console.log('✅ Page loaded');
  
  let prevCount = 0;
  let scrollCount = 0;
  let noChangeCount = 0;
  const maxScrolls = 500;
  const maxNoChange = 10;
  
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  
  console.log('📜 Scrolling and loading more skills...\n');
  
  while (scrollCount < maxScrolls && noChangeCount < maxNoChange) {
    const buttons = await page.$$('button');
    let loadMore = null;
    
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('Scroll to load more')) {
        loadMore = btn;
        break;
      }
    }
    
    if (loadMore) {
      await loadMore.click();
      await sleep(1500);
      scrollCount++;
      
      const currentSkills = await page.$$('a[href^="/"]');
      const newCount = currentSkills.length;
      
      if (newCount > prevCount) {
        console.log(`  [${scrollCount}] Found ${newCount} skill links (+${newCount - prevCount})`);
        prevCount = newCount;
        noChangeCount = 0;
      } else {
        noChangeCount++;
      }
    } else {
      await page.evaluate(() => window.scrollBy(0, 1500));
      await sleep(800);
      scrollCount++;
      
      const currentSkills = await page.$$('a[href^="/"]');
      const newCount = currentSkills.length;
      
      if (newCount > prevCount) {
        console.log(`  [${scrollCount}] Found ${newCount} skill links (+${newCount - prevCount})`);
        prevCount = newCount;
        noChangeCount = 0;
      } else {
        noChangeCount++;
      }
    }
  }
  
  if (noChangeCount >= maxNoChange) {
    console.log('\n✅ Reached end of content');
  }
  
  console.log(`\n📊 Total scrolls: ${scrollCount}`);
  console.log(`📊 Total skill links found: ${prevCount}`);
  
  console.log('\n🔍 Parsing skill data...');
  
  const skills = await page.evaluate(() => {
    const cards = document.querySelectorAll('a[href^="/"]');
    const skills = [];
    
    cards.forEach(card => {
      const href = card.getAttribute('href') || '';
      const parts = href.split('/').filter(p => p.trim());
      
      if (parts.length === 2) {
        const author = parts[0];
        const slug = parts[1];
        
        if (slug.includes('?') || slug.includes('#') || author.includes('.')) return;
        
        const text = card.textContent || '';
        
        const downloadMatch = text.match(/⤓\s*(\d+)/);
        const installMatch = text.match(/⤒\s*(\d+)/);
        const starMatch = text.match(/★\s*(\d+)/);
        const versionMatch = text.match(/v\s*(\d+\.?\d*)/);
        
        const nameMatch = text.match(/^\s*([^\/\n]+)/);
        const name = nameMatch ? nameMatch[1].trim() : slug;
        
        const descMatch = text.match(/v\s*[\d.]+\s*(.+)/s);
        let description = descMatch ? descMatch[1].trim() : '';
        description = description.replace(/⤓\s*\d+/g, '').replace(/⤒\s*\d+/g, '').replace(/★\s*\d+/g, '').trim();
        
        skills.push({
          slug,
          name,
          author,
          downloads: parseInt(downloadMatch?.[1]) || 0,
          installs: parseInt(installMatch?.[1]) || 0,
          stars: parseInt(starMatch?.[1]) || 0,
          description,
          version: versionMatch?.[1] || '1.0.0',
          url: `https://clawhub.ai${href}`
        });
      }
    });
    
    return skills;
  });
  
  await browser.close();
  
  const uniqueSkills = skills.filter((skill, index, self) => 
    index === self.findIndex(s => s.slug === skill.slug)
  );
  
  const stats = {
    total: uniqueSkills.length,
    totalDownloads: uniqueSkills.reduce((sum, s) => sum + s.downloads, 0),
    totalInstalls: uniqueSkills.reduce((sum, s) => sum + s.installs, 0),
    totalStars: uniqueSkills.reduce((sum, s) => sum + s.stars, 0),
    parsedAt: new Date().toISOString(),
    source: URL,
    scrollIterations: scrollCount
  };
  
  const output = {
    version: '2.0',
    stats,
    skills: uniqueSkills.sort((a, b) => b.downloads - a.downloads)
  };
  
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log('\n✅ Scraping complete!');
  console.log(`📁 Saved to: ${OUTPUT_FILE}`);
  console.log(`📊 Total unique skills: ${uniqueSkills.length}`);
  console.log(`📥 Total downloads: ${stats.totalDownloads}`);
  console.log(`📤 Total installs: ${stats.totalInstalls}`);
  console.log(`⭐ Total stars: ${stats.totalStars}`);
  
  console.log('\n🏆 Top 10 skills:');
  uniqueSkills.slice(0, 10).forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.name} (${s.downloads} ⤓) - ${s.author}`);
  });
  
  return output;
}

if (require.main === module) {
  scrapeAllSkills()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = { scrapeAllSkills };
