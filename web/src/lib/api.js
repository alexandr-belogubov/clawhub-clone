const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function getSkills(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/skills?${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch skills');
  return res.json();
}

export async function getSkill(slug) {
  const res = await fetch(`${API_URL}/api/skills/${slug}`, { cache: 'no-store' });
  if (!res.ok) return { skill: null, related: [] };
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_URL}/api/skills/meta/categories`, { cache: 'no-store' });
  if (!res.ok) return { categories: [] };
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_URL}/api/skills/meta/stats`, { cache: 'no-store' });
  if (!res.ok) return { stats: null };
  return res.json();
}
