import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { PublicUser, Recipe, Tip } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import RecipeCard from '../components/RecipeCard.tsx';
import TipCard from '../components/TipCard.tsx';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const ROLE_STYLES: Record<string, string> = {
  influencer: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  trainer: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  enthusiast: 'text-green-400 bg-green-500/10 border-green-500/20',
};

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'recipes' | 'tips'>('recipes');
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    Promise.all([
      api.getUser(username),
      api.getRecipes(),
      api.getTips(),
    ])
      .then(([user, allRecipes, allTips]) => {
        setProfile(user);
        setFollowers(user.followers);
        setFollowing(currentUser ? user.following?.includes(currentUser.id) : false);
        setRecipes(allRecipes.filter(r => r.authorId === user.id));
        setTips(allTips.filter(t => t.authorId === user.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username, currentUser]);

  async function handleFollow() {
    if (!isAuthenticated || followLoading || !profile) return;
    setFollowLoading(true);
    try {
      const res = await api.followUser(profile.id);
      setFollowing(res.following);
      setFollowers(res.followers);
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="card p-6 mb-6">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-800 rounded-full" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-6 bg-gray-800 rounded w-1/3" />
              <div className="h-4 bg-gray-800 rounded w-1/4" />
              <div className="h-4 bg-gray-800 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-gray-300">User not found</h2>
        <Link to="/community" className="btn-primary mt-4 inline-block">Browse Community</Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-5xl border-2 border-gray-700 shrink-0">
            {profile.avatar}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-gray-100">{profile.displayName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500 text-sm">@{profile.username}</span>
                  <span className={`badge border ${ROLE_STYLES[profile.role]}`}>
                    {profile.role === 'influencer' ? '⭐' : profile.role === 'trainer' ? '🎯' : '🏃'} {profile.role}
                  </span>
                </div>
              </div>

              {!isOwnProfile && isAuthenticated && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`shrink-0 font-semibold px-5 py-2 rounded-xl transition-colors ${
                    following
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {following ? '✓ Following' : '+ Follow'}
                </button>
              )}
            </div>

            {profile.bio && (
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex items-center gap-6 mt-4">
              <div>
                <span className="font-bold text-gray-100">{formatCount(followers)}</span>
                <span className="text-gray-500 text-sm ml-1.5">Followers</span>
              </div>
              <div>
                <span className="font-bold text-gray-100">{formatCount(profile.following?.length ?? 0)}</span>
                <span className="text-gray-500 text-sm ml-1.5">Following</span>
              </div>
              <div>
                <span className="font-bold text-gray-100">{recipes.length + tips.length}</span>
                <span className="text-gray-500 text-sm ml-1.5">Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800">
            {profile.badges.map(badge => (
              <span key={badge} className="badge bg-gray-800 text-gray-400">
                🏅 {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {[
          { id: 'recipes' as const, label: `🍽️ Recipes (${recipes.length})` },
          { id: 'tips' as const, label: `💡 Tips (${tips.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'recipes' ? (
        recipes.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">🍽️</div>
            <p>No recipes shared yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )
      ) : (
        tips.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">💡</div>
            <p>No tips shared yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tips.map(tip => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
