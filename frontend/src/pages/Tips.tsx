import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Tip, TipCategory } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import TipCard from '../components/TipCard.tsx';

const CATEGORIES: { value: TipCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '💡' },
  { value: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { value: 'training', label: 'Training', emoji: '🏋️' },
  { value: 'recovery', label: 'Recovery', emoji: '💤' },
  { value: 'mindset', label: 'Mindset', emoji: '🧠' },
  { value: 'meal-prep', label: 'Meal Prep', emoji: '📦' },
];

export default function Tips() {
  const { isAuthenticated } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<TipCategory | 'all'>('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { sort };
    if (category !== 'all') params.category = category;

    api.getTips(params)
      .then(setTips)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, sort]);

  const filtered = search.trim()
    ? tips.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.includes(search.toLowerCase()))
      )
    : tips;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-100">💡 Tips & Knowledge</h1>
          <p className="text-gray-400 mt-1">Expert advice from top fitness pros and coaches</p>
        </div>
        {isAuthenticated && (
          <Link to="/tips/new" className="btn-primary">+ Share Tip</Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search tips..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
        />

        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                category === value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
          <div className="ml-auto">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-gray-800 text-gray-300 text-sm border border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Liked</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-6 bg-gray-800 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-800 rounded w-full mb-2" />
              <div className="h-4 bg-gray-800 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💡</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">No tips found</h3>
          <p className="text-gray-500 mb-5">Share your fitness knowledge with the community!</p>
          {isAuthenticated && (
            <Link to="/tips/new" className="btn-primary">Share a Tip</Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} tip{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(tip => (
              <TipCard
                key={tip.id}
                tip={tip}
                onUpdate={updated => setTips(prev => prev.map(t => t.id === updated.id ? updated : t))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
