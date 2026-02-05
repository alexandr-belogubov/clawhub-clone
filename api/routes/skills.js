const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const SKILLS_FILE = path.join(__dirname, '../data/skills.json');

// Get all skills
router.get('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
    const { q, category, sort = 'downloads', order = 'desc', page = 1, limit = 20 } = req.query;
    
    let skills = [...data.skills];
    
    // Filter by search query
    if (q) {
      const query = q.toLowerCase();
      skills = skills.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some(t => t.toLowerCase().includes(query)) ||
        s.author.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (category) {
      skills = skills.filter(s => s.categories?.includes(category));
    }
    
    // Sort
    const sortField = sort === 'installs' ? 'installs' : sort === 'stars' ? 'stars' : 'downloads';
    skills.sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    // Pagination
    const start = (page - 1) * limit;
    const paginated = skills.slice(start, start + parseInt(limit));
    
    res.json({
      skills: paginated,
      total: skills.length,
      page: parseInt(page),
      totalPages: Math.ceil(skills.length / limit),
      stats: data.stats
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get single skill by slug
router.get('/:slug', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
    const skill = data.skills.find(s => s.slug === req.params.slug);
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    // Get related skills (same category or same author)
    const related = data.skills
      .filter(s => s.slug !== skill.slug && (
        s.categories?.some(c => skill.categories?.includes(c)) ||
        s.author === skill.author
      ))
      .slice(0, 4);
    
    res.json({ skill, related });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get categories
router.get('/meta/categories', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
    const categories = {};
    
    data.skills.forEach(skill => {
      (skill.categories || []).forEach(cat => {
        if (!categories[cat]) {
          categories[cat] = { name: cat, count: 0 };
        }
        categories[cat].count++;
      });
    });
    
    res.json({ categories: Object.values(categories) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get stats
router.get('/meta/stats', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
    res.json({ stats: data.stats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
