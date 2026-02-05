'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EYE_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
    <path d="M184 448h48c4.4 0 8-3.6 8-8V72c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v368c0 4.4 3.6 8 8 8z" />
    <path d="M88 448h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8H88c-4.4 0-8 3.6-8 8v144c0 4.4 3.6 8 8 8z" />
    <path d="M280.1 448h47.8c4.5 0 8.1-3.6 8.1-8.1V232.1c0-4.5-3.6-8.1-8.1-8.1h-47.8c-4.5 0-8.1 3.6-8.1 8.1v207.8c0 4.5 3.6 8.1 8.1 8.1z" />
    <path d="M368 136.1v303.8c0 4.5 3.6 8.1 8.1 8.1h47.8c4.5 0 8.1-3.6 8.1-8.1V136.1c0-4.5-3.6-8.1-8.1-8.1h-47.8c-4.5 0-8.1 3.6-8.1 8.1z" />
  </svg>
);

export default function BookmarksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchBookmarks(JSON.parse(userData).id);
  }, []);

  async function fetchBookmarks(userId) {
    try {
      const res = await fetch(`http://localhost:4001/api/bookmarks?userId=${userId}`);
      const data = await res.json();
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function removeBookmark(slug) {
    try {
      await fetch(`http://localhost:4001/api/bookmarks/${slug}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': user.id.toString() }
      });
      setBookmarks(prev => prev.filter(b => b.slug !== slug));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              <span className="text-blue-400">Claw</span>Hub
            </Link>
            <span className="text-gray-500">/</span>
            <span className="font-bold">Bookmarks</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/add-skill" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">+ Add Skill</Link>
            <Link href="/my-skills" className="text-gray-400 hover:text-white">My Skills</Link>
            <span className="text-gray-400">|</span>
            <span>{user.name}</span>
            <button onClick={() => { localStorage.clear(); router.push('/'); }} className="text-red-400 hover:text-red-300">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Bookmarks</h1>
            <p className="text-gray-400">Skills you've saved for later</p>
          </div>
          <span className="bg-gray-800 px-4 py-2 rounded-lg">{bookmarks.length} bookmarks</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔖</div>
            <h2 className="text-2xl font-bold mb-2">No bookmarks yet</h2>
            <p className="text-gray-400 mb-6">Start exploring and save skills you're interested in.</p>
            <Link href="/" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-medium transition">
              Browse Skills
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map(skill => (
              <div key={skill.slug} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition group">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/skill/${skill.slug}`} className="font-bold hover:text-blue-400 transition">
                    {skill.name}
                  </Link>
                  <button
                    onClick={() => removeBookmark(skill.slug)}
                    className="text-gray-500 hover:text-red-400 transition"
                    title="Remove bookmark"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{skill.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDate(skill.created_at)}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">{EYE_ICON} {skill.views?.toLocaleString()}</span>
                    <span className="text-gray-400">by {skill.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
