'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_COLORS = {
  pending: 'bg-yellow-600',
  approved: 'bg-green-600',
  rejected: 'bg-red-600'
};

const STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Published',
  rejected: 'Rejected'
};

export default function MySkillsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth');
      return;
    }
    
    const u = JSON.parse(userData);
    setUser(u);
    fetchUserSkills(u.id);
  }, []);

  async function fetchUserSkills(userId) {
    try {
      const res = await fetch(`http://localhost:4002/api/user-skills?userId=${userId}`);
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSkill(id) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      await fetch(`http://localhost:4002/api/user-skills/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': user.id.toString() }
      });
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete skill');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
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
            <span className="font-bold">My Skills</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/add-skill" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">+ Add Skill</Link>
            <Link href="/bookmarks" className="text-gray-400 hover:text-white">Bookmarks</Link>
            <span className="text-gray-400">|</span>
            <span>{user.name}</span>
            <button onClick={() => { localStorage.clear(); router.push('/'); }} className="text-red-400 hover:text-red-300">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Skills</h1>
            <p className="text-gray-400">Manage your submitted skills</p>
          </div>
          <Link href="/add-skill" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-medium transition">
            + Submit New Skill
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading skills...</div>
        ) : skills.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2">No skills submitted yet</h2>
            <p className="text-gray-400 mb-6">Share your first skill with the community.</p>
            <Link href="/add-skill" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-medium transition">
              Submit Your First Skill
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map(skill => (
              <div key={skill.id} className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{skill.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[skill.status]}`}>
                        {STATUS_LABELS[skill.status]}
                      </span>
                    </div>
                    <p className="text-gray-400">{skill.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {skill.status === 'pending' && (
                      <button
                        onClick={() => setEditingSkill(skill)}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
                      >
                        Edit
                      </button>
                    )}
                    {skill.status === 'pending' && (
                      <button
                        onClick={() => deleteSkill(skill.id)}
                        className="text-red-400 hover:text-red-300 px-4 py-2 transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {(skill.categories || []).map(cat => (
                    <span key={cat} className="px-2 py-1 bg-gray-700 rounded text-sm">{cat}</span>
                  ))}
                </div>
                
                <div className="text-sm text-gray-500">
                  Submitted: {formatDate(skill.submitted_at)}
                  {skill.moderated_at && ` • Moderated: ${formatDate(skill.moderated_at)}`}
                  {skill.moderation_notes && <span className="text-yellow-400"> • Note: {skill.moderation_notes}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingSkill && (
        <EditSkillModal
          skill={editingSkill}
          onClose={() => setEditingSkill(null)}
          onSave={(updated) => {
            setSkills(prev => prev.map(s => s.id === updated.id ? updated : s));
            setEditingSkill(null);
          }}
        />
      )}
    </div>
  );
}

function EditSkillModal({ skill, onClose, onSave }) {
  const [name, setName] = useState(skill.name);
  const [description, setDescription] = useState(skill.description);
  const [githubUrl, setGithubUrl] = useState(skill.github_url);
  const [version, setVersion] = useState(skill.version);
  const [tags, setTags] = useState((skill.tags || []).join(', '));
  const [categories, setCategories] = useState(skill.categories || []);
  const [saving, setSaving] = useState(false);

  const ALL_CATEGORIES = [
    'ai', 'automation', 'communication', 'social', 'development', 'marketing',
    'research', 'productivity', 'media', 'finance', 'data', 'cloud', 'security',
    'mobile', 'integrations', 'design', 'business', 'health', 'education',
    'travel', 'food', 'entertainment', 'news', 'tools'
  ];

  function toggleCategory(cat) {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:4002/api/user-skills/${skill.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': skill.user_id.toString()
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
      
      if (!res.ok) throw new Error('Failed to update');
      
      const data = await res.json();
      onSave(data.skill);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Skill</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-24"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">GitHub URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Version</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-40 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-2 py-1 rounded-full text-sm transition ${
                    categories.includes(cat) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 px-6 py-2 rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
