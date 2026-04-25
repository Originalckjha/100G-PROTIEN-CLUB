import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Recipe, Comment } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import MacroBadge from '../components/MacroBadge.tsx';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getRecipe(id)
      .then(setRecipe)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-800 rounded w-full mb-2" />
        <div className="h-4 bg-gray-800 rounded w-3/4" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🍽️</div>
        <h2 className="text-2xl font-bold text-gray-300">Recipe not found</h2>
        <Link to="/recipes" className="btn-primary mt-4 inline-block">Browse Recipes</Link>
      </div>
    );
  }

  const isLiked = user ? recipe.likes.includes(user.id) : false;
  const isSaved = user ? recipe.saves.includes(user.id) : false;

  async function handleLike() {
    if (!isAuthenticated || likeLoading || !recipe) return;
    setLikeLoading(true);
    try {
      const res = await api.likeRecipe(recipe.id);
      setRecipe({
        ...recipe,
        likes: res.liked
          ? [...recipe.likes, user!.id]
          : recipe.likes.filter(id => id !== user!.id),
      });
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleSave() {
    if (!isAuthenticated || saveLoading || !recipe) return;
    setSaveLoading(true);
    try {
      const res = await api.saveRecipe(recipe.id);
      setRecipe({
        ...recipe,
        saves: res.saved
          ? [...recipe.saves, user!.id]
          : recipe.saves.filter(id => id !== user!.id),
      });
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || commenting || !recipe) return;
    setCommenting(true);
    try {
      const newComment: Comment = await api.commentRecipe(recipe.id, comment.trim());
      setRecipe({ ...recipe, comments: [...recipe.comments, newComment] });
      setComment('');
    } finally {
      setCommenting(false);
    }
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 inline-block">
        ← Back to Recipes
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-6xl">{recipe.emoji}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-100 leading-tight mb-2">{recipe.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge bg-gray-800 text-gray-300 capitalize">{recipe.category}</span>
              {totalTime > 0 && <span className="text-sm text-gray-500">⏱ {totalTime} min total</span>}
              {recipe.prepTime > 0 && <span className="text-sm text-gray-600">· {recipe.prepTime}m prep</span>}
              {recipe.cookTime > 0 && <span className="text-sm text-gray-600">· {recipe.cookTime}m cook</span>}
              <span className="text-sm text-gray-500">🍽️ {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-gray-400 leading-relaxed">{recipe.description}</p>
          </div>
        </div>

        {/* Macros */}
        <MacroBadge macros={recipe.macros} size="md" />

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-800">
          {recipe.author && (
            <Link
              to={`/profile/${recipe.author.username}`}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors flex-1"
            >
              <span className="text-2xl">{recipe.author.avatar}</span>
              <div>
                <div className="font-semibold text-gray-200">{recipe.author.displayName}</div>
                <div className="text-gray-500 text-xs">@{recipe.author.username}</div>
              </div>
              {recipe.author.role !== 'enthusiast' && (
                <span className="text-orange-400 text-sm">✓</span>
              )}
            </Link>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || likeLoading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isLiked ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {isLiked ? '❤️' : '🤍'} {recipe.likes.length}
            </button>
            <button
              onClick={handleSave}
              disabled={!isAuthenticated || saveLoading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isSaved ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {isSaved ? '🔖' : '📎'} {recipe.saves.length}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        {/* Ingredients */}
        <div className="md:col-span-2 card p-5">
          <h2 className="font-bold text-lg text-gray-200 mb-4">🛒 Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{ing.name}</span>
                <span className="text-gray-500 font-medium">
                  {ing.amount}{ing.unit ? ` ${ing.unit}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="md:col-span-3 card p-5">
          <h2 className="font-bold text-lg text-gray-200 mb-4">📋 Instructions</h2>
          <ol className="space-y-3">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-300 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Comments */}
      <div className="card p-5">
        <h2 className="font-bold text-lg text-gray-200 mb-4">
          💬 Comments ({recipe.comments.length})
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleComment} className="flex gap-3 mb-5">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm border border-gray-700 shrink-0">
              {user?.avatar}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="input text-sm"
              />
              <button type="submit" disabled={!comment.trim() || commenting} className="btn-primary text-sm shrink-0">
                Post
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-5">
            <Link to="/login" className="text-orange-400 hover:text-orange-300">Sign in</Link> to comment
          </p>
        )}

        <div className="space-y-4">
          {recipe.comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm border border-gray-700 shrink-0">
                {c.authorAvatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-300">@{c.authorUsername}</span>
                  <span className="text-xs text-gray-600">
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
          {recipe.comments.length === 0 && (
            <p className="text-sm text-gray-600 text-center py-4">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
