import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import MacroBadge from './MacroBadge.tsx';

const CATEGORY_COLORS: Record<string, string> = {
  breakfast: 'text-yellow-400 bg-yellow-500/10',
  lunch: 'text-green-400 bg-green-500/10',
  dinner: 'text-blue-400 bg-blue-500/10',
  snack: 'text-purple-400 bg-purple-500/10',
  shake: 'text-pink-400 bg-pink-500/10',
  dessert: 'text-rose-400 bg-rose-500/10',
};

interface Props {
  recipe: Recipe;
  onUpdate?: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onUpdate }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [localRecipe, setLocalRecipe] = useState(recipe);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const isLiked = user ? localRecipe.likes.includes(user.id) : false;
  const isSaved = user ? localRecipe.saves.includes(user.id) : false;

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await api.likeRecipe(localRecipe.id);
      const updated = {
        ...localRecipe,
        likes: res.liked
          ? [...localRecipe.likes, user!.id]
          : localRecipe.likes.filter(id => id !== user!.id),
      };
      setLocalRecipe(updated);
      onUpdate?.(updated);
    } catch {
      // ignore
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated || saveLoading) return;
    setSaveLoading(true);
    try {
      const res = await api.saveRecipe(localRecipe.id);
      const updated = {
        ...localRecipe,
        saves: res.saved
          ? [...localRecipe.saves, user!.id]
          : localRecipe.saves.filter(id => id !== user!.id),
      };
      setLocalRecipe(updated);
      onUpdate?.(updated);
    } catch {
      // ignore
    } finally {
      setSaveLoading(false);
    }
  }

  const totalTime = localRecipe.prepTime + localRecipe.cookTime;

  return (
    <Link to={`/recipes/${localRecipe.id}`} className="card group hover:border-gray-700 transition-all duration-200 hover:-translate-y-0.5 block">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{localRecipe.emoji}</span>
            <div>
              <h3 className="font-bold text-gray-100 group-hover:text-orange-400 transition-colors leading-tight">
                {localRecipe.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${CATEGORY_COLORS[localRecipe.category] ?? 'text-gray-400 bg-gray-700'}`}>
                  {localRecipe.category}
                </span>
                {totalTime > 0 && (
                  <span className="text-xs text-gray-500">⏱ {totalTime} min</span>
                )}
              </div>
            </div>
          </div>
          {/* Protein highlight */}
          <div className="shrink-0 text-center bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2">
            <div className="text-xl font-black text-orange-400">{localRecipe.macros.protein}g</div>
            <div className="text-xs text-orange-400/70">protein</div>
          </div>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{localRecipe.description}</p>

        <MacroBadge macros={localRecipe.macros} size="sm" />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {localRecipe.author && (
            <Link
              to={`/profile/${localRecipe.author.username}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span>{localRecipe.author.avatar}</span>
              <span>@{localRecipe.author.username}</span>
              {localRecipe.author.role !== 'enthusiast' && (
                <span className="text-orange-400">✓</span>
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3" onClick={e => e.preventDefault()}>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
            }`}
          >
            {isLiked ? '❤️' : '🤍'} {localRecipe.likes.length}
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isSaved ? 'text-orange-400' : 'text-gray-500 hover:text-orange-400'
            }`}
          >
            {isSaved ? '🔖' : '📎'} {localRecipe.saves.length}
          </button>
          <span className="text-sm text-gray-500">
            💬 {localRecipe.comments.length}
          </span>
        </div>
      </div>
    </Link>
  );
}
