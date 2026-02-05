import Link from 'next/link';

interface Skill {
  id: string;
  name: string;
  slug: string;
  author: string;
  description: string;
  downloads: number;
  installs: number;
  rating: number;
  tags: string[];
  categories: string[];
  version: string;
  updated_at: string;
}

async function getSkills() {
  // In production, this would call the API
  const skills: Skill[] = [
    {
      id: 'google-slides',
      name: 'Google Slides',
      slug: 'google-slides',
      author: 'byungkyu',
      description: 'Google Slides API integration for presentations',
      downloads: 335,
      installs: 567,
      rating: 4.5,
      tags: ['slides', 'google', 'presentation'],
      categories: ['productivity'],
      version: '1.2.0',
      updated_at: '2026-02-01T10:00:00Z'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      slug: 'mailchimp',
      author: 'byungkyu',
      description: 'Email marketing integration',
      downloads: 317,
      installs: 412,
      rating: 4.3,
      tags: ['email', 'marketing', 'mailchimp'],
      categories: ['marketing'],
      version: '1.0.0',
      updated_at: '2026-01-28T14:00:00Z'
    },
    {
      id: 'klaviyo',
      name: 'Klaviyo',
      slug: 'klaviyo',
      author: 'byungkyu',
      description: 'Email marketing and customer data platform',
      downloads: 312,
      installs: 398,
      rating: 4.2,
      tags: ['email', 'marketing', 'klaviyo', 'crm'],
      categories: ['marketing', 'crm'],
      version: '1.1.0',
      updated_at: '2026-02-02T09:00:00Z'
    },
    {
      id: 'browser-automation',
      name: 'Browser Automation',
      slug: 'browser-automation',
      author: 'zaycv',
      description: 'Headless browser CLI automation',
      downloads: 122,
      installs: 156,
      rating: 4.6,
      tags: ['automation', 'browser', 'cli', 'scraping'],
      categories: ['automation'],
      version: '2.0.0',
      updated_at: '2026-02-03T16:00:00Z'
    },
    {
      id: 'deep-research',
      name: 'Deep Research',
      slug: 'deep-research',
      author: 'we-crafted.com',
      description: 'Complex multi-step research tasks',
      downloads: 37,
      installs: 52,
      rating: 4.8,
      tags: ['research', 'ai', 'analysis'],
      categories: ['research', 'ai'],
      version: '1.0.0',
      updated_at: '2026-02-04T11:00:00Z'
    }
  ];
  return skills;
}

export default async function HomePage() {
  const skills = await getSkills();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🦞</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">ClawHub</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/search"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600"
              >
                Search
              </Link>
              <Link 
                href="/categories"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600"
              >
                Categories
              </Link>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                CLI Install
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white dark:bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Discover Amazing Skills for OpenClaw
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Browse our curated collection of skills to supercharge your AI assistant. 
            One-click installation with CLI support.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition">
              Browse Skills
            </button>
            <button className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition">
              Submit a Skill
            </button>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Popular Skills</h2>
            <Link href="/skills" className="text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-100 dark:bg-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">50+</div>
              <div className="text-slate-600 dark:text-slate-300">Skills Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">1,000+</div>
              <div className="text-slate-600 dark:text-slate-300">Installations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">4.5</div>
              <div className="text-slate-600 dark:text-slate-300">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">20+</div>
              <div className="text-slate-600 dark:text-slate-300">Contributors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 dark:text-slate-400">
          <p>Built for the OpenClaw community</p>
        </div>
      </footer>
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link 
      href={`/skills/${skill.slug}`}
      className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-primary-500 dark:hover:border-primary-400 transition shadow-sm hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {skill.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            by {skill.author}
          </p>
        </div>
        <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
          <span>⭐</span>
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            {skill.rating}
          </span>
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
        {skill.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {skill.categories.map((cat) => (
          <span 
            key={cat}
            className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"
          >
            {cat}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <div className="flex space-x-4">
          <span>↓ {skill.downloads}</span>
          <span>✓ {skill.installs}</span>
        </div>
        <span>v{skill.version}</span>
      </div>
    </Link>
  );
}
