import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl shrink-0">
          <span className="text-2xl">💪</span>
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent hidden sm:block">
            100G Protein Club
          </span>
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent sm:hidden">
            100G
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {[
            { to: '/', label: '🏠 Feed', exact: true },
            { to: '/recipes', label: '🍽️ Recipes', exact: false },
            { to: '/tips', label: '💡 Tips', exact: false },
            { to: '/community', label: '👥 Community', exact: false },
          ].map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && user ? (
            <>
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-lg">{user.avatar}</span>
                <span className="hidden sm:block">{user.displayName}</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Join Free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
