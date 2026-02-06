import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWebSocket } from '../context/WebSocketContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const { isConnected } = useWebSocket()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                $
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">$10K Challenge</h1>
                <p className="text-xs text-dark-400">30 Days to Glory</p>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                Leaderboard
              </Link>
              <Link
                to="/add-sale"
                className="btn-primary flex items-center gap-2 py-2 px-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Log Sale</span>
              </Link>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              {/* Connection indicator */}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary-500' : 'bg-red-500'} animate-pulse`} 
                   title={isConnected ? 'Connected' : 'Reconnecting...'} />
              
              {/* User avatar */}
              <Link
                to={`/profile/${user?.id}`}
                className="flex items-center gap-3 hover:bg-dark-800 rounded-xl px-3 py-2 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: user?.avatar_color || '#22c55e' }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block font-medium">{user?.name}</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-dark-400 hover:text-white p-2 rounded-lg hover:bg-dark-800 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
