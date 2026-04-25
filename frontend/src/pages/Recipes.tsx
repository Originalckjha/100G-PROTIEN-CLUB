import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Recipe, RecipeCategory } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import RecipeCard from '../components/RecipeCard.tsx';

const CATEGORIES: { value: RecipeCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🍽️' },
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🥜' },
  { value: 'shake', label: 'Shake', emoji: '🥤' },
  { value: 'dessert', label: 'Dessert', emoji: '🍮' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Liked' },
  { value: 'protein', label: 'Highest Protein' },
];

export default function Recipes() {
  const { isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<RecipeCategory | 'all'>('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { sort };
    if (category !== 'all') params.category = category;

    api.getRecipes(params)
      .then(setRecipes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, sort]);

  const filtered = search.trim()
    ? recipes.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.includes(search.toLowerCase()))
      )
    : recipes;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-100">🍽️ Recipes</h1>
          <p className="text-gray-400 mt-1">High-protein meals that taste incredible</p>
        </div>
        {isAuthenticated && (
          <Link to="/recipes/new" className="btn-primary">
            + Share Recipe
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search recipes, tags..."
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
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
                </div>
              </div>
              <div className="h-16 bg-gray-800 rounded mb-3" />
              <div className="grid grid-cols-4 gap-1">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-10 bg-gray-800 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">No recipes found</h3>
          <p className="text-gray-500 mb-5">Be the first to share a high-protein recipe!</p>
          {isAuthenticated && (
            <Link to="/recipes/new" className="btn-primary">Share a Recipe</Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} recipe{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onUpdate={updated => setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
