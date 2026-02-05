'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ALL_CATEGORIES = [
  'ai', 'automation', 'communication', 'social', 'development', 'marketing',
  'research', 'productivity', 'media', 'finance', 'data', 'cloud', 'security',
  'mobile', 'integrations', 'design', 'business', 'health', 'education',
  'travel', 'food', 'entertainment', 'news', 'tools'
];

export default function AddSkillPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, []);

  function toggleCategory(cat) {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:4001/api/user-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({
          name,
          description,
          githubUrl,
          version,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          categories
        })
      });
      
      if (!res.ok) throw new Error('Failed to submit skill');
      
      setSuccess(true);
      setTimeout(() => router.push('/my-skills'), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl p-8 text-center max-w-md">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Skill Submitted!</h2>
          <p className="text-gray-400 mb-4">
            Your skill has been submitted for moderation. We'll review it shortly.
          </p>
          <p className="text-sm text-gray-500">Redirecting to your skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              <span className="text-blue-400">Claw</span>Hub
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/my-skills" className="text-gray-400 hover:text-white">My Skills</Link>
            <Link href="/bookmarks" className="text-gray-400 hover:text-white">Bookmarks</Link>
            <span className="text-gray-400">|</span>
            <span>{user.name}</span>
            <button onClick={() => { localStorage.clear(); router.push('/'); }} className="text-red-400 hover:text-red-300">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Submit a Skill</h1>
        <p className="text-gray-400 mb-8">Add your skill to the marketplace. It will be reviewed by moderators before publishing.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Skill Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Google Slides Integration"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-32"
                  placeholder="Describe what your skill does..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://github.com/username/skill-name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-40 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="1.0.0"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Categorization</h2>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Categories (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      categories.includes(cat)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., google, slides, presentation, oauth"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 px-8 py-3 rounded-lg font-medium transition"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
            <Link href="/" className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-lg font-medium transition">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
