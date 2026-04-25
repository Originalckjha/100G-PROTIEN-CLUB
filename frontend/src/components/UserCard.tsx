import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PublicUser } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

const ROLE_STYLES: Record<string, string> = {
  influencer: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  trainer: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  enthusiast: 'text-green-400 bg-green-500/10 border-green-500/20',
};

interface Props {
  user: PublicUser;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function UserCard({ user: profileUser }: Props) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [followers, setFollowers] = useState(profileUser.followers);
  const [isFollowing, setIsFollowing] = useState(
    currentUser ? profileUser.following?.includes(currentUser.id) : false
  );
  const [loading, setLoading] = useState(false);

  const isOwnProfile = currentUser?.id === profileUser.id;

  async function handleFollow() {
    if (!isAuthenticated || loading || isOwnProfile) return;
    setLoading(true);
    try {
      const res = await api.followUser(profileUser.id);
      setIsFollowing(res.following);
      setFollowers(res.followers);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Link to={`/profile/${profileUser.username}`} className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-3xl border-2 border-gray-700">
            {profileUser.avatar}
          </div>
          <div>
            <div className="font-bold text-gray-100 hover:text-orange-400 transition-colors">
              {profileUser.displayName}
            </div>
            <div className="text-sm text-gray-500">@{profileUser.username}</div>
            <span className={`badge border mt-1 ${ROLE_STYLES[profileUser.role]}`}>
              {profileUser.role === 'influencer' ? '⭐ ' : profileUser.role === 'trainer' ? '🎯 ' : '🏃 '}
              {profileUser.role}
            </span>
          </div>
        </Link>

        {!isOwnProfile && isAuthenticated && (
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
              isFollowing
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {profileUser.bio && (
        <p className="text-sm text-gray-400 leading-relaxed">{profileUser.bio}</p>
      )}

      <div className="flex items-center gap-4 text-sm">
        <div className="text-center">
          <div className="font-bold text-gray-100">{formatCount(followers)}</div>
          <div className="text-gray-500 text-xs">Followers</div>
        </div>
        <div className="h-8 w-px bg-gray-800" />
        <div className="text-center">
          <div className="font-bold text-gray-100">{formatCount(profileUser.following?.length ?? 0)}</div>
          <div className="text-gray-500 text-xs">Following</div>
        </div>
      </div>

      {profileUser.badges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profileUser.badges.map(badge => (
            <span key={badge} className="badge bg-gray-800 text-gray-400 text-xs">
              🏅 {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
