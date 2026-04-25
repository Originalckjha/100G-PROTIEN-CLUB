import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { TipCategory } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

const CATEGORIES: { value: TipCategory; label: string; emoji: string; desc: string }[] = [
  { value: 'nutrition', label: 'Nutrition', emoji: '🥗', desc: 'Diet, macros, food choices' },
  { value: 'training', label: 'Training', emoji: '🏋️', desc: 'Workout programs, techniques' },
  { value: 'recovery', label: 'Recovery', emoji: '💤', desc: 'Sleep, stretching, rest days' },
  { value: 'mindset', label: 'Mindset', emoji: '🧠', desc: 'Habits, consistency, motivation' },
  { value: 'meal-prep', label: 'Meal Prep', emoji: '📦', desc: 'Batch cooking, planning, storage' },
];

const EMOJIS = ['💡', '🎯', '📈', '⚡', '🔥', '💪', '🧠', '📊', '💧', '😴', '🥗', '📦'];

export default function CreateTip() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<TipCategory>('nutrition');
  const [emoji, setEmoji] = useState('💡');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">Sign in to share tips</h2>
        <div className="flex justify-center gap-3 mt-5">
          <Link to="/login" className="btn-secondary">Sign in</Link>
          <Link to="/register" className="btn-primary">Join Free</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createTip({
        title,
        content,
        category,
        emoji,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      navigate('/tips');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tip');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/tips" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 inline-block">
        ← Back to Tips
      </Link>

      <h1 className="text-2xl font-black text-gray-100 mb-6">💡 Share a Tip</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Emoji */}
        <div className="card p-5">
          <label className="block text-sm font-medium text-gray-400 mb-3">Pick an Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-2xl p-2 rounded-lg transition-colors ${
                  emoji === e ? 'bg-orange-500/20 ring-2 ring-orange-500' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="card p-5">
          <label className="block text-sm font-medium text-gray-400 mb-3">Category *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map(({ value, label, emoji: ce, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`flex items-start gap-3 p-3 rounded-xl text-left transition-colors border ${
                  category === value
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">{ce}</span>
                <div>
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs opacity-60">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. How to hit 100g protein on a budget"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Content * <span className="text-gray-600 font-normal">({content.length} chars)</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your knowledge, experience, and actionable advice. Be specific — the best tips give concrete numbers, steps, or examples."
              rows={8}
              className="input resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Tags <span className="text-gray-600 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. beginner, essentials, protein-timing"
              className="input"
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
          {submitting ? 'Sharing Tip...' : '🚀 Share Tip'}
        </button>
      </form>
    </div>
  );
}
