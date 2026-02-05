#!/usr/bin/env node

/**
 * ClawHub CLI - Install skills from command line
 * 
 * Usage:
 *   npx clawhub install <skill-slug>
 *   npx clawhub search <query>
 *   npx clawhub list
 */

import { execSync } from 'child_process';
import readline from 'readline';

const API_BASE = 'http://localhost:3001/api';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'install':
      await installSkill(args[1]);
      break;
    case 'search':
      await searchSkills(args.slice(1).join(' '));
      break;
    case 'list':
      await listSkills();
      break;
    case 'help':
    default:
      showHelp();
  }
}

async function installSkill(slug: string | undefined) {
  if (!slug) {
    console.error('❌ Please specify a skill to install');
    console.log('Usage: npx clawhub install <skill-slug>');
    process.exit(1);
  }

  console.log(`⬇️  Installing ${slug}...`);
  
  try {
    // In production, this would:
    // 1. Fetch skill metadata from API
    // 2. Clone/download the skill repo
    // 3. Install dependencies
    // 4. Register with OpenClaw
    
    console.log(`✅ Successfully installed ${slug}!`);
    console.log('');
    console.log('Next steps:');
    console.log(`  1. Restart OpenClaw: openclaw restart`);
    console.log(`  2. Enable the skill in your config`);
  } catch (error) {
    console.error(`❌ Failed to install ${slug}:`, error);
    process.exit(1);
  }
}

async function searchSkills(query: string) {
  console.log(`🔍 Searching for "${query}"...`);
  // In production: call API search endpoint
  console.log('Search results would appear here');
}

async function listSkills() {
  console.log('📦 Available skills:');
  // In production: call API to get skills list
  console.log('  - google-slides');
  console.log('  - mailchimp');
  console.log('  - klaviyo');
  console.log('  - browser-automation');
  console.log('  - deep-research');
}

function showHelp() {
  console.log(`
🦞 ClawHub CLI

Commands:
  install <slug>   Install a skill by its slug
  search <query>    Search for skills
  list             List all available skills
  help             Show this help message

Examples:
  npx clawhub install google-slides
  npx clawhub search email
  npx clawhub list

For more information, visit: https://clawhub.dev
`);
}

main().catch(console.error);
