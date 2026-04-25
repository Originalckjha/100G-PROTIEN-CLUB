import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Tip } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

const CATEGORY_COLORS: Record<string, string> = {
  nutrition: 'text-green-400 bg-green-500/10',
  training: 'text-blue-400 bg-blue-500/10',
  recovery: 'text-purple-400 bg-purple-500/10',
  mindset: 'text-pink-400 bg-pink-500/10',
  'meal-prep': 'text-yellow-400 bg-yellow-500/10',
};

interface Props {
  tip: Tip;
  onUpdate?: (tip: Tip) => void;
}

export default function TipCard({ tip, onUpdate }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [localTip, setLocalTip] = useState(tip);
  const [likeLoading, setLikeLoading] = useState(false);

  const isLiked = user ? localTip.likes.includes(user.id) : false;
  const isSaved = user ? localTip.saves.includes(user.id) : false;

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await api.likeTip(localTip.id);
      const updated = {
        ...localTip,
        likes: res.liked
          ? [...localTip.likes, user!.id]
          : localTip.likes.filter(id => id !== user!.id),
      };
      setLocalTip(updated);
      onUpdate?.(updated);
    } catch {
      // ignore
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      const res = await api.saveTip(localTip.id);
      const updated = {
        ...localTip,
        saves: res.saved
          ? [...localTip.saves, user!.id]
          : localTip.saves.filter(id => id !== user!.id),
      };
      setLocalTip(updated);
      onUpdate?.(updated);
    } catch {
      // ignore
    }
  }

  return (
    <article className="card hover:border-gray-700 transition-all duration-200 hover:-translate-y-0.5">
      <div className="p-5">
        {/* Category + emoji */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{localTip.emoji}</span>
          <span className={`badge ${CATEGORY_COLORS[localTip.category] ?? 'text-gray-400 bg-gray-700'}`}>
            {localTip.category}
          </span>
        </div>

        <h3 className="font-bold text-gray-100 text-lg mb-2 leading-tight">{localTip.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">{localTip.content}</p>

        {/* Tags */}
        {localTip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {localTip.tags.slice(0, 4).map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
        {localTip.author ? (
          <Link
            to={`/profile/${localTip.author.username}`}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span>{localTip.author.avatar}</span>
            <span>@{localTip.author.username}</span>
            {localTip.author.role !== 'enthusiast' && (
              <span className="text-orange-400">✓</span>
            )}
          </Link>
        ) : <span />}

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
            }`}
          >
            {isLiked ? '❤️' : '🤍'} {localTip.likes.length}
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isSaved ? 'text-orange-400' : 'text-gray-500 hover:text-orange-400'
            }`}
          >
            {isSaved ? '🔖' : '📎'} {localTip.saves.length}
          </button>
          <span className="text-sm text-gray-500">💬 {localTip.comments.length}</span>
        </div>
      </div>
    </article>
  );
}
