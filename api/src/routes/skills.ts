import { Router, Request, Response } from 'express';

const router = Router();

// Mock skills data (would come from database)
const skills = [
  {
    id: 'google-slides',
    name: 'Google Slides',
    slug: 'google-slides',
    author: 'byungkyu',
    description: 'Google Slides API integration',
    downloads: 335,
    installs: 567,
    rating: 4.5,
    tags: ['slides', 'google', 'presentation'],
    categories: ['productivity'],
    github_url: 'https://github.com/byungkyu/google-slides-skill',
    version: '1.2.0',
    updated_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    slug: 'mailchimp',
    author: 'byungkyu',
    description: 'Email marketing integration',
    downloads: 317,
    installs: 412,
    rating: 4.3,
    tags: ['email', 'marketing', 'mailchimp'],
    categories: ['marketing'],
    github_url: 'https://github.com/byungkyu/mailchimp-skill',
    version: '1.0.0',
    updated_at: '2026-01-28T14:00:00Z'
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    slug: 'klaviyo',
    author: 'byungkyu',
    description: 'Email marketing, customer data platform',
    downloads: 312,
    installs: 398,
    rating: 4.2,
    tags: ['email', 'marketing', 'klaviyo', 'crm'],
    categories: ['marketing', 'crm'],
    github_url: 'https://github.com/byungkyu/klaviyo-skill',
    version: '1.1.0',
    updated_at: '2026-02-02T09:00:00Z'
  },
  {
    id: 'browser-automation',
    name: 'Browser Automation',
    slug: 'browser-automation',
    author: 'zaycv',
    description: 'Headless browser CLI automation',
    downloads: 122,
    installs: 156,
    rating: 4.6,
    tags: ['automation', 'browser', 'cli', 'scraping'],
    categories: ['automation'],
    github_url: 'https://github.com/zaycv/browser-automation-skill',
    version: '2.0.0',
    updated_at: '2026-02-03T16:00:00Z'
  },
  {
    id: 'deep-research',
    name: 'Deep Research',
    slug: 'deep-research',
    author: 'we-crafted.com',
    description: 'Complex multi-step research tasks',
    downloads: 37,
    installs: 52,
    rating: 4.8,
    tags: ['research', 'ai', 'analysis'],
    categories: ['research', 'ai'],
    github_url: 'https://github.com/we-crafted/deep-research-skill',
    version: '1.0.0',
    updated_at: '2026-02-04T11:00:00Z'
  }
];

// Get all skills
router.get('/', (req: Request, res: Response) => {
  const { category, tag, search, sort = 'downloads', limit = 20, offset = 0 } = req.query;
  
  let filtered = [...skills];
  
  if (category) {
    filtered = filtered.filter(s => s.categories.includes(category as string));
  }
  
  if (tag) {
    filtered = filtered.filter(s => s.tags.includes(tag as string));
  }
  
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  
  // Sort
  switch (sort) {
    case 'downloads':
      filtered.sort((a, b) => b.downloads - a.downloads);
      break;
    case 'installs':
      filtered.sort((a, b) => b.installs - a.installs);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'recent':
      filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      break;
  }
  
  const total = filtered.length;
  const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    skills: paginated,
    total,
    limit: Number(limit),
    offset: Number(offset)
  });
});

// Get single skill
router.get('/:slug', (req: Request, res: Response) => {
  const skill = skills.find(s => s.slug === req.params.slug);
  
  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' });
  }
  
  res.json({ skill });
});

export { router as skillsRouter };
