# ClawHub Scripts

Scripts for scraping, importing, and deploying skill data.

## Prerequisites

```bash
npm install
```

Requires PostgreSQL running locally with database `clawhub` and user with access.

## Setup Database

```bash
# Create database (run as postgres user)
sudo -u postgres createdb clawhub
sudo -u postgres createuser root -P
# password: root
sudo -u postgres psql -c "GRANT ALL ON DATABASE clawhub TO root;"
sudo -u postgres psql -c "GRANT ALL ON SCHEMA public TO root;" clawhub
```

## Available Scripts

### 1. Scrape all skills from clawhub.ai

```bash
npm run scrape
```

Scrapes all 1200+ skills with infinite scroll. Saves to `api/data/skills.json`.

### 2. Parse descriptions

```bash
npm run parse
```

Fetches descriptions for all skills (parallel batch requests).

### 3. Import to PostgreSQL

```bash
npm run db:import
```

Imports skills from `api/data/skills.json` to PostgreSQL.

### 4. Sync skills (API)

```bash
npm run sync:skills
```

Syncs skills from database to API JSON files.

### 5. Database migrate

```bash
npm run db:migrate
```

Runs database migrations.

## Remote Access

### Option 1: ngrok (public URL)

On server:
```bash
# Install ngrok first
./start-with-tunnel.sh

# Output:
# 🌐 Public URL: https://abcd-1234.ngrok.io
```

Open the ngrok URL in your browser.

### Option 2: SSH Tunnel (from your Mac)

On your Mac:
```bash
# Make script executable
chmod +x tunnel-ssh.sh

# Edit script and set your server IP
# Then run:
./tunnel-ssh.sh

# Open http://localhost:3000 in browser
```

### Start/Stop Server

```bash
# Start with public access
./start-with-tunnel.sh

# Stop everything
./stop.sh
```

## Environment Variables

Create `.env` file:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=clawhub
PGUSER=root
PGPASSWORD=root
```

## Direct Usage

```bash
# Scrape skills
node scripts/scrape-all-skills.js

# Parse descriptions
node scripts/parse-descriptions-batch.js

# Import to PostgreSQL
node scripts/import-to-postgres.js
```
