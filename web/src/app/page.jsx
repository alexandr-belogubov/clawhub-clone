'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Download, Star, Filter, ArrowRight } from 'lucide-react';

export default function Home() {
  const [skills, setSkills] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, [search, selectedCategory]);

  async function fetchSkills() {
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const res = await fetch(`http://localhost:3001/api/skills?${params}`);
      const data = await res.json();
      setSkills(data.skills || []);
      setStats(data.stats || null);
    } catch (e) {
      console.error('Failed to fetch skills:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('http://localhost:3001/api/skills/meta/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-blue-400">Claw</span>Hub Clone
          </h1>
          <a
            href="https://github.com/alexandr-belogubov/clawhub-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Discover OpenClaw Skills
        </h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          A better skill marketplace for OpenClaw. Browse, search, and install
          skills to supercharge your AI agents.
        </p>
        
        {/* Search */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Skills</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.totalDownloads}</div>
              <div className="text-sm text-gray-400">Downloads</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalStars}</div>
              <div className="text-sm text-gray-400">Stars</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{categories.length}</div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-4 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={18} className="text-gray-400" />
                <h3 className="font-bold">Categories</h3>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    !selectedCategory ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                  }`}
                >
                  All Skills
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex justify-between ${
                      selectedCategory === cat.name ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                    }`}
                  >
                    <span className="capitalize">{cat.name}</span>
                    <span className="text-gray-400 text-sm">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Skills Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : skills.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No skills found. Try a different search.
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">{skills.length} skills</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map(skill => (
                    <Link
                      key={skill.slug}
                      href={`/skill/${skill.slug}`}
                      className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold group-hover:text-blue-400 transition">
                          {skill.name}
                        </h3>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                          v{skill.version}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {skill.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>by {skill.author}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Download size={14} /> {skill.downloads}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" /> {skill.stars}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 py-8 text-center text-gray-500">
        <p>Built with ❤️ for the OpenClaw community</p>
      </footer>
    </div>
  );
}
