import { Router, Request, Response } from 'express';
import { getSkills, getSkillBySlug, getCategories, getStats } from '../db.js';

const router = Router();

// Get all skills with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, tag, search, sort = 'downloads', limit = 50, offset = 0 } = req.query;
    
    const skills = await getSkills({
      category: category as string,
      tag: tag as string,
      search: search as string,
      sort: sort as string,
      limit: Number(limit),
      offset: Number(offset)
    });
    
    const total = (await getStats()).total;
    
    res.json({
      skills,
      total,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Get categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get tags
router.get('/tags', async (_req: Request, res: Response) => {
  try {
    const tags = await getTags();
    res.json({ tags });
  } catch (err) {
    console.error('Error fetching tags:', err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await getStats();
    res.json({ stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get single skill
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const skill = await getSkillBySlug(req.params.slug);
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json({ skill });
  } catch (err) {
    console.error('Error fetching skill:', err);
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

export { router as skillsRouter };
