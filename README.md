# ClawHub Clone

A better, more practical skill marketplace for OpenClaw than clawhub.ai

## Features

### Phase 1: MVP
- ✅ Beautiful, modern UI (dark/light mode)
- ✅ Advanced search (by category, downloads, ratings, tags)
- ✅ One-click install (CLI + Web)
- ✅ Skill ratings & reviews
- ✅ Installation statistics
- ✅ GitHub integration for updates
- ✅ README preview
- ✅ Author profiles

### Phase 2: Enhanced
- [ ] AI-powered recommendations
- [ ] Skill categories & tagging system
- [ ] Popular/trending sections
- [ ] Weekly top skills
- [ ] Installation count leaderboard
- [ ] Search by use case

### Phase 3: Community
- [ ] Skill bundles/packages
- [ ] Featured collections
- [ ] Skill of the week
- [ ] Community favorites
- [ ] Usage analytics dashboard

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run db:migrate

# Start development
npm run dev
```

## Project Structure

```
clawhub-clone/
├── api/           # Node.js API server
├── web/           # Next.js web UI
├── cli/           # CLI tool for installation
├── database/      # PostgreSQL schema
├── scripts/       # Utility scripts
└── README.md
```

## Tech Stack

- **Backend:** Node.js, Express/Fastify
- **Database:** PostgreSQL
- **Frontend:** Next.js, Tailwind CSS
- **Infrastructure:** Vercel/Cloudflare
- **Authentication:** GitHub OAuth

## API Endpoints

### Skills
- `GET /api/skills` - List all skills
- `GET /api/skills/:slug` - Get skill details
- `POST /api/skills/:slug/install` - Install a skill

### Search
- `GET /api/search` - Search skills

### Reviews
- `GET /api/skills/:slug/reviews` - Get reviews
- `POST /api/skills/:slug/reviews` - Add review

## License

MIT
