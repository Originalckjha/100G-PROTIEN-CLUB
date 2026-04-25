import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { UserRole } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

const ROLES: { value: UserRole; label: string; emoji: string; desc: string }[] = [
  { value: 'enthusiast', label: 'Fitness Enthusiast', emoji: '🏃', desc: 'I\'m on my fitness journey' },
  { value: 'trainer', label: 'Trainer / Coach', emoji: '🎯', desc: 'I coach and train others' },
  { value: 'influencer', label: 'Content Creator', emoji: '⭐', desc: 'I create fitness content' },
];

const AVATARS = ['🏃', '💪', '🏋️', '🤸', '🧘', '🥊', '🏊', '🚴', '🧗', '⛹️', '👨‍🍳', '👩‍🍳'];

export default function Register() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('enthusiast');
  const [avatar, setAvatar] = useState('🏃');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await api.register({
        username,
        displayName,
        email,
        password,
        role,
        bio,
        avatar,
      });
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💪</div>
          <h1 className="text-2xl font-black text-gray-100">Join 100G Protein Club</h1>
          <p className="text-gray-400 mt-1">Connect with thousands of fitness enthusiasts</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Choose Avatar</label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`text-2xl p-2 rounded-lg transition-colors ${
                      avatar === a ? 'bg-orange-500/20 ring-2 ring-orange-500' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">I am a...</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ROLES.map(({ value, label, emoji, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`p-3 rounded-xl text-left transition-colors border ${
                      role === value
                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="john_fitness"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Display Name *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="John Carter"
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Bio <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell the community about your fitness goals and journey..."
                rows={3}
                className="input resize-none text-sm"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Creating account...' : '🚀 Join the Club'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              Already a member?{' '}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
