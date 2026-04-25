import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  post: Post;
  onUpdate?: (post: Post) => void;
}

export default function PostCard({ post, onUpdate }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [localPost, setLocalPost] = useState(post);
  const [loading, setLoading] = useState(false);

  const isLiked = user ? localPost.likes.includes(user.id) : false;

  async function handleLike() {
    if (!isAuthenticated || loading) return;
    setLoading(true);
    try {
      const res = await api.likePost(localPost.id);
      const updated = {
        ...localPost,
        likes: res.liked
          ? [...localPost.likes, user!.id]
          : localPost.likes.filter(id => id !== user!.id),
      };
      setLocalPost(updated);
      onUpdate?.(updated);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="card p-5">
      {/* Author */}
      <div className="flex items-start gap-3 mb-4">
        {localPost.author ? (
          <>
            <Link to={`/profile/${localPost.author.username}`}>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xl border border-gray-700 hover:border-orange-500 transition-colors">
                {localPost.author.avatar}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/profile/${localPost.author.username}`}
                  className="font-semibold text-gray-100 hover:text-orange-400 transition-colors text-sm"
                >
                  {localPost.author.displayName}
                </Link>
                {localPost.author.role !== 'enthusiast' && (
                  <span className="text-orange-400 text-xs">✓</span>
                )}
                <span className="text-gray-600 text-xs">@{localPost.author.username}</span>
                <span className="text-gray-700 text-xs">·</span>
                <span className="text-gray-600 text-xs">{formatDate(localPost.createdAt)}</span>
              </div>
              {localPost.author.badges && localPost.author.badges.length > 0 && (
                <span className="text-xs text-orange-400/70">{localPost.author.badges[0]}</span>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Content */}
      <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-4">{localPost.content}</p>

      {/* Linked recipe */}
      {localPost.recipe && (
        <Link
          to={`/recipes/${localPost.recipe.id}`}
          className="flex items-center gap-3 bg-gray-800 rounded-xl p-3 mb-4 hover:bg-gray-750 hover:border-orange-500/30 border border-gray-700 transition-colors"
        >
          <span className="text-3xl">{localPost.recipe.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-100 truncate">{localPost.recipe.title}</div>
            <div className="text-xs text-gray-500 capitalize">{localPost.recipe.category} · {localPost.recipe.macros.protein}g protein</div>
          </div>
          <span className="text-orange-400 text-sm">→</span>
        </Link>
      )}

      {/* Linked tip */}
      {localPost.tip && (
        <div className="bg-gray-800 rounded-xl p-3 mb-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{localPost.tip.emoji}</span>
            <span className="text-xs badge bg-gray-700 text-gray-400">{localPost.tip.category}</span>
          </div>
          <div className="font-semibold text-sm text-gray-100">{localPost.tip.title}</div>
          <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{localPost.tip.content}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
          }`}
        >
          {isLiked ? '❤️' : '🤍'}
          <span>{localPost.likes.length}</span>
        </button>
      </div>
    </article>
  );
}
