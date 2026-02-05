'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';

const EYE_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
    <path d="M184 448h48c4.4 0 8-3.6 8-8V72c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v368c0 4.4 3.6 8 8 8z" />
    <path d="M88 448h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8H88c-4.4 0-8 3.6-8 8v144c0 4.4 3.6 8 8 8z" />
    <path d="M280.1 448h47.8c4.5 0 8.1-3.6 8.1-8.1V232.1c0-4.5-3.6-8.1-8.1-8.1h-47.8c-4.5 0-8.1 3.6-8.1 8.1v207.8c0 4.5 3.6 8.1 8.1 8.1z" />
    <path d="M368 136.1v303.8c0 4.5 3.6 8.1 8.1 8.1h47.8c4.5 0 8.1-3.6 8.1-8.1V136.1c0-4.5-3.6-8.1-8.1-8.1h-47.8c-4.5 0-8.1 3.6-8.1 8.1z" />
  </svg>
);

export default function SkillPage() {
  const params = useParams();
  const slug = params.slug;
  const [skill, setSkill] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) fetchSkill(slug);
  }, [slug]);

  async function fetchSkill(skillSlug) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://localhost:4001/api/skills/${skillSlug}`);
      if (!res.ok) throw new Error('Skill not found');
      const data = await res.json();
      setSkill(data.skill);
      if (data.skill?.categories?.length > 0) {
        const relatedRes = await fetch(`http://localhost:4001/api/skills?category=${data.skill.categories[0]}&limit=5`);
        const relatedData = await relatedRes.json();
        setRelated((relatedData.skills || []).filter(s => s.slug !== skillSlug));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function copyCommand() {
    navigator.clipboard.writeText(`npx clawhub install ${skill.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-blue-400">Claw</span>Hub Clone
            </Link>
            <a href="https://github.com/alexandr-belogubov/clawhub-clone" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">GitHub</a>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2"><ArrowLeft size={20} /> Back to skills</Link>
          <h1 className="text-2xl mt-8">Skill not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold"><span className="text-blue-400">Claw</span>Hub Clone</Link>
          <a href="https://github.com/alexandr-belogubov/clawhub-clone" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">GitHub</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2"><ArrowLeft size={20} /> Back to all skills</Link>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>by {skill.author}</span>
                    <span>{formatDate(skill.created_at)}</span>
                  </div>
                </div>
                {skill.github_url && (
                  <a href={skill.github_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium transition">View on GitHub</a>
                )}
              </div>
              <p className="text-gray-300 mb-4">{skill.description}</p>
              <div className="flex flex-wrap gap-2">
                {(skill.tags || []).map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-700 rounded-full text-sm">{tag}</span>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Install</h2>
              <div className="flex items-center gap-2">
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm flex-1">
                  <span className="text-green-400">npx</span> clawhub install {skill.slug}
                </div>
                <button onClick={copyCommand} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition flex items-center gap-2">
                  {copied ? <span className="text-green-400">✓</span> : <span>📋</span>}
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {(skill.categories || []).map(cat => (
                  <Link key={cat} href={`/?category=${cat}`} className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30">{cat}</Link>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Views</span>
                  <span className="font-medium flex items-center gap-1">{EYE_ICON} {skill.views?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <span className="font-medium">{skill.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Author</span>
                  <span className="font-medium">{skill.author}</span>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Related Skills</h2>
                <div className="space-y-4">
                  {related.slice(0, 5).map(relatedSkill => (
                    <Link key={relatedSkill.slug} href={`/skill/${relatedSkill.slug}`} className="block p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition">
                      <div className="font-medium mb-1">{relatedSkill.name}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">{EYE_ICON} {relatedSkill.views?.toLocaleString()}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-700 py-8 text-center text-gray-500">
        <p>Built with ❤️ for the OpenClaw community</p>
      </footer>
    </div>
  );
}
