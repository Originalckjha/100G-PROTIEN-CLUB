import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Post } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import PostCard from '../components/PostCard.tsx';

export default function Feed() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api.getPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim() || posting) return;
    setPosting(true);
    try {
      const post = await api.createPost({ content: newPost.trim(), type: 'general' });
      setPosts(prev => [post, ...prev]);
      setNewPost('');
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 p-8 mb-8">
        <div className="relative z-10">
          <div className="text-5xl mb-3">💪</div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            100G Protein Club
          </h1>
          <p className="text-orange-100 text-lg max-w-xl">
            The ultimate community for fitness enthusiasts & influencers sharing high-protein recipes, tips, and transformations.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="bg-white text-orange-600 font-bold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                  Join Free
                </Link>
                <Link to="/recipes" className="bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-white/30 transition-colors">
                  Browse Recipes
                </Link>
              </>
            ) : (
              <>
                <Link to="/recipes/new" className="bg-white text-orange-600 font-bold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                  Share Recipe
                </Link>
                <Link to="/tips/new" className="bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-white/30 transition-colors">
                  Post a Tip
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="absolute -right-8 -top-8 text-[10rem] opacity-10 select-none">🥩</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post composer */}
          {isAuthenticated && user ? (
            <form onSubmit={handlePost} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xl border border-gray-700 shrink-0">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder="Share your fitness journey, progress, or thoughts with the community..."
                    rows={3}
                    className="input resize-none text-sm"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => navigate('/recipes/new')} className="btn-ghost text-xs">
                        🍽️ Recipe
                      </button>
                      <button type="button" onClick={() => navigate('/tips/new')} className="btn-ghost text-xs">
                        💡 Tip
                      </button>
                    </div>
                    <button type="submit" disabled={!newPost.trim() || posting} className="btn-primary text-sm">
                      {posting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-gray-400 text-sm mb-3">Join the community to share your journey</p>
              <div className="flex justify-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Join Free</Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-1/3" />
                      <div className="h-3 bg-gray-800 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-800 rounded" />
                    <div className="h-3 bg-gray-800 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={updated => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Quick stats */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-200 mb-4">📊 Club Stats</h2>
            <div className="space-y-3">
              {[
                { label: 'Members', value: '2,847', emoji: '👥' },
                { label: 'Recipes shared', value: '1,204', emoji: '🍽️' },
                { label: 'Tips posted', value: '689', emoji: '💡' },
                { label: 'Avg daily protein', value: '142g', emoji: '💪' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {emoji} {label}
                  </span>
                  <span className="font-bold text-gray-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-200 mb-4">🔥 Trending</h2>
            <div className="space-y-2">
              {[
                { to: '/recipes?sort=popular', label: 'Most-liked recipes' },
                { to: '/recipes?category=breakfast', label: 'Breakfast ideas' },
                { to: '/tips?category=nutrition', label: 'Nutrition tips' },
                { to: '/tips?category=meal-prep', label: 'Meal prep guides' },
                { to: '/community', label: 'Top influencers' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="block text-sm text-gray-400 hover:text-orange-400 py-1.5 border-b border-gray-800 last:border-0 transition-colors"
                >
                  → {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Protein goal reminder */}
          <div className="card p-5 bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-500/20">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-bold text-orange-400 mb-1">Daily Protein Goal</h3>
            <p className="text-sm text-gray-400">
              Aim for <span className="font-bold text-orange-400">100g+ protein</span> every day. Spread it across 3-4 meals for optimal muscle protein synthesis.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
