#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * Runs the database schema migration from database/schema.sql
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import pg from 'pg';

// Load environment variables from .env file
config();

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database connection from environment variables
// Remove quotes from env vars if present
const getEnvVar = (key, defaultValue) => {
  const value = process.env[key] || defaultValue;
  return typeof value === 'string' ? value.replace(/^["']|["']$/g, '') : value;
};

const dbConfig = {
  host: getEnvVar('DB_HOST', 'localhost'),
  port: parseInt(getEnvVar('DB_PORT', '5432'), 10),
  database: getEnvVar('DB_NAME', 'refgrow'),
  user: getEnvVar('DB_USER', 'alexander'),
  password: getEnvVar('DB_PASSWORD', ''),
};

async function migrate() {
  console.log('🔄 Starting database migration...');
  console.log(`   Connecting to ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}...`);

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read schema file
    const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema
    console.log('📝 Executing schema...');
    await client.query(schema);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
