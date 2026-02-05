import Link from 'next/link';
import { ArrowLeft, Download, Star, User, Tag } from 'lucide-react';

export default function SkillPage({ skill, related }) {
  if (!skill) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
            <ArrowLeft size={20} /> Back to skills
          </Link>
          <h1 className="text-2xl mt-8">Skill not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-400">
            ClawHub Clone
          </Link>
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-blue-400">Skills</Link>
            <Link href="https://github.com/alexandr-belogubov/clawhub-clone" className="hover:text-blue-400">GitHub</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8">
          <ArrowLeft size={20} /> Back to all skills
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Skill Header */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <User size={16} /> {skill.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download size={16} /> {skill.downloads} downloads
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400" /> {skill.stars}
                    </span>
                  </div>
                </div>
                <a
                  href={skill.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium transition"
                >
                  View on GitHub
                </a>
              </div>

              <p className="text-gray-300 mb-4">{skill.description}</p>

              <div className="flex flex-wrap gap-2">
                {skill.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Install Command */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Install</h2>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <span className="text-green-400">npx</span> clawhub install {skill.slug}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {skill.categories?.map(cat => (
                  <Link
                    key={cat}
                    href={`/?category=${cat}`}
                    className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Stats Card */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Downloads</span>
                  <span className="font-medium">{skill.downloads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stars</span>
                  <span className="font-medium">{skill.stars}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <span className="font-medium">{skill.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Author</span>
                  <Link href={`/?q=${skill.author}`} className="text-blue-400 hover:text-blue-300">
                    {skill.author}
                  </Link>
                </div>
              </div>
            </div>

            {/* Related Skills */}
            {related && related.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Related Skills</h2>
                <div className="space-y-4">
                  {related.map(relatedSkill => (
                    <Link
                      key={relatedSkill.slug}
                      href={`/skill/${relatedSkill.slug}`}
                      className="block p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition"
                    >
                      <div className="font-medium mb-1">{relatedSkill.name}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <Download size={12} /> {relatedSkill.downloads}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500">
          <p>Built with ❤️ for the OpenClaw community</p>
          <p className="text-sm mt-2">
            <Link href="https://github.com/alexandr-belogubov/clawhub-clone" className="hover:text-white">
              Star on GitHub
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
