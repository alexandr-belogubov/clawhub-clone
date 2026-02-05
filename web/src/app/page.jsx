'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';

const EYE_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
    <path d="M184 448h48c4.4 0 8-3.6 8-8V72c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v368c0 4.4 3.6 8 8 8z" />
    <path d="M88 448h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8H88c-4.4 0-8 3.6-8 8v144c0 4.4 3.6 8 8 8z" />
    <path d="M280.1 448h47.8c4.5 0 8.1-3.6 8.1-8.1V232.1c0-4.5-3.6-8.1-8.1-8.1h-47.8c-4.5 0-8.1 3.6-8.1 8.1v207.8c0 4.5 3.6 8.1 8.1 8.1z" />
    <path d="M368 136.1v303.8c0 4.5 3.6 8.1 8.1 8.1h47.8c4.5 0 8.1-3.6 8.1-8.1V136.1c0-4.5-3.6-8.1-8.1-8.1h-47.8c-4.5 0-8.1 3.6-8.1 8.1z" />
  </svg>
);

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('views');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const loadMoreRef = useRef(null);
  const isInitialMount = useRef(true);

  const LIMIT = 50;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchSkills(0, true);
    } else {
      const timer = setTimeout(() => {
        fetchSkills(0, true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, selectedCategory, sortBy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && offset > 0) {
          fetchSkills(offset, false);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [offset, hasMore, loading]);

  async function fetchSkills(newOffset, isReset) {
    if (loading && !isReset) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('sort', sortBy);
      params.append('limit', LIMIT.toString());
      params.append('offset', newOffset.toString());
      
      const res = await fetch(`http://localhost:4001/api/skills?${params}`);
      const data = await res.json();
      
      const newSkills = data.skills || [];
      
      if (isReset) {
        setSkills(newSkills);
      } else {
        setSkills(prev => [...prev, ...newSkills]);
      }
      
      setOffset(newOffset + LIMIT);
      setHasMore(newSkills.length === LIMIT);
    } catch (e) {
      console.error('Failed to fetch skills:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('http://localhost:4001/api/skills/stats');
      const data = await res.json();
      setStats(data.stats || { total: 0, views: 0 });
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('http://localhost:4001/api/skills/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
  }

  function handleLogout() {
    localStorage.clear();
    setUser(null);
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-blue-400">Claw</span>Hub
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/bookmarks" className="text-gray-400 hover:text-white">Bookmarks</Link>
                <Link href="/my-skills" className="text-gray-400 hover:text-white">My Skills</Link>
                <Link href="/add-skill" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">+ Add Skill</Link>
                <span className="text-gray-400">|</span>
                <span>{user.name}</span>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
              </>
            ) : (
              <Link href="/auth" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">Sign In</Link>
            )}
            <a href="https://github.com/alexandr-belogubov/clawhub-clone" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white ml-4">GitHub</a>
          </div>
        </div>
      </header>

      <section className="py-16 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Discover OpenClaw Skills</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          A better skill marketplace for OpenClaw. Browse, search, and install skills to supercharge your AI agents.
        </p>
        
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

      {stats && (
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.total?.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Skills</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.views?.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Views</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{categories.length}</div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-4 sticky top-32">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={18} className="text-gray-400" />
                <h3 className="font-bold">Categories</h3>
              </div>
              <div className="space-y-2 mb-6">
                <button onClick={() => setSelectedCategory('')} className={`w-full text-left px-3 py-2 rounded-lg transition ${!selectedCategory ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>All Skills</button>
                {categories.map(cat => (
                  <button key={cat.name} onClick={() => setSelectedCategory(cat.name)} className={`w-full text-left px-3 py-2 rounded-lg transition flex justify-between ${selectedCategory === cat.name ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
                    <span className="capitalize">{cat.name}</span>
                    <span className="text-gray-400 text-sm">{cat.count}</span>
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h3 className="font-bold mb-4">Sort By</h3>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option value="views">Most Popular</option>
                  <option value="recent">Newest</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            {loading && skills.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Loading skills...</div>
            ) : skills.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No skills found. Try a different search.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map(skill => (
                    <Link key={skill.slug} href={`/skill/${skill.slug}`} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold group-hover:text-blue-400 transition">{skill.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{skill.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Released {formatRelativeTime(skill.created_at)}</span>
                        <span className="flex items-center gap-1">{EYE_ICON} {skill.views?.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {hasMore && (
                  <div ref={loadMoreRef} className="py-8 text-center">
                    <span className="text-gray-400">Loading more...</span>
                  </div>
                )}
                
                {!hasMore && skills.length > 0 && (
                  <div className="py-8 text-center text-gray-500">All {skills.length.toLocaleString()} skills loaded</div>
                )}
              </>
            )}
          </main>
        </div>
      </section>

      <footer className="border-t border-gray-700 py-8 text-center text-gray-500">
        <p>Built with ❤️ for the OpenClaw community</p>
      </footer>
    </div>
  );
}
