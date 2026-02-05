import { Router, Request, Response } from 'express';

const router = Router();

router.get('/:skillId', (req: Request, res: Response) => {
  // Mock reviews
  res.json({ reviews: [] });
});

router.post('/:skillId', (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  res.status(201).json({ 
    message: 'Review created',
    review: {
      id: `rev_${Date.now()}`,
      skill_id: req.params.skillId,
      rating,
      comment,
      created_at: new Date().toISOString()
    }
  });
});

export { router as reviewsRouter };
