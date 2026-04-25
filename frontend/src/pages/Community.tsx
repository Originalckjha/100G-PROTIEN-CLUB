import { useState, useEffect } from 'react';
import type { PublicUser } from '../types.ts';
import { api } from '../api/client.ts';
import UserCard from '../components/UserCard.tsx';

const ROLE_FILTERS = [
  { value: 'all', label: 'All Members' },
  { value: 'influencer', label: '⭐ Influencers' },
  { value: 'trainer', label: '🎯 Trainers' },
  { value: 'enthusiast', label: '🏃 Enthusiasts' },
];

export default function Community() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchesRole = role === 'all' || u.role === role;
    const matchesSearch = !search.trim() ||
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.bio.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  }).sort((a, b) => b.followers - a.followers);

  const influencers = users.filter(u => u.role === 'influencer').sort((a, b) => b.followers - a.followers);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-100">👥 Community</h1>
        <p className="text-gray-400 mt-1">Connect with fitness enthusiasts and top influencers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main grid */}
        <div className="lg:col-span-3">
          {/* Filters */}
          <div className="card p-4 mb-5 space-y-3">
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
            />
            <div className="flex gap-2 flex-wrap">
              {ROLE_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setRole(value)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    role === value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-14 h-14 bg-gray-800 rounded-full" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-gray-800 rounded w-2/3" />
                      <div className="h-3 bg-gray-800 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-12 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-300">No members found</h3>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(u => (
                  <UserCard key={u.id} user={u} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar — Top Influencers */}
        <aside className="space-y-5">
          <div className="card p-5">
            <h2 className="font-bold text-gray-200 mb-4">⭐ Top Influencers</h2>
            <div className="space-y-3">
              {influencers.slice(0, 5).map((u, i) => (
                <div key={u.id} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-5 text-center ${i < 3 ? 'text-orange-400' : 'text-gray-600'}`}>
                    #{i + 1}
                  </span>
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-lg border border-gray-700">
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-200 truncate">{u.displayName}</div>
                    <div className="text-xs text-gray-500">
                      {u.followers >= 1000 ? `${(u.followers / 1000).toFixed(0)}K` : u.followers} followers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Club values */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-200 mb-4">🏆 Club Values</h2>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                '100g protein daily, minimum',
                'Share knowledge freely',
                'Support every member\'s journey',
                'Science-backed advice only',
                'Real food, real results',
              ].map(v => (
                <li key={v} className="flex gap-2">
                  <span className="text-orange-500 shrink-0">✓</span>
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
