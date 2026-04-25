import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await api.login(username, password);
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💪</div>
          <h1 className="text-2xl font-black text-gray-100">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to your 100G Protein Club account</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="john_fitness"
                className="input"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium">
                Join free
              </Link>
            </p>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 card p-4">
          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { u: 'john_fitness', label: '💪 Influencer' },
              { u: 'sarah_macros', label: '🥗 Trainer' },
              { u: 'emma_eats', label: '👩‍🍳 Creator' },
              { u: 'mike_lifts', label: '🏋️ Enthusiast' },
            ].map(({ u, label }) => (
              <button
                key={u}
                type="button"
                onClick={() => { setUsername(u); setPassword('password123'); }}
                className="text-left text-xs bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-gray-300 font-medium">{label}</span>
                <div className="text-gray-500">@{u}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">All use password: <code className="bg-gray-800 px-1 rounded">password123</code></p>
        </div>
      </div>
    </div>
  );
}
