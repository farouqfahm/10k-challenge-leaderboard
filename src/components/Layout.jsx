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
    <div className="min-h-screen bg-dark-950 bg-grid">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-emerald-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-105">
                  <span className="drop-shadow-md">$</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400 to-emerald-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">$10K Challenge</h1>
                <p className="text-xs text-dark-400 font-medium">30 Days to Glory</p>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  location.pathname === '/'
                    ? 'bg-primary-500/15 text-primary-400 shadow-lg shadow-primary-500/10'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800/60'
                }`}
              >
                Leaderboard
              </Link>
              <Link
                to="/add-sale"
                className="btn-primary flex items-center gap-2 py-2.5 px-5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline font-semibold">Log Sale</span>
              </Link>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              {/* Connection indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary-400' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`} />
                <span className="text-xs text-dark-500 hidden sm:inline">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              {/* User avatar */}
              <Link
                to={`/profile/${user?.id}`}
                className="flex items-center gap-3 hover:bg-dark-800/60 rounded-xl px-3 py-2 transition-all duration-300"
              >
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
                    style={{ 
                      backgroundColor: user?.avatar_color || '#22c55e',
                      boxShadow: `0 4px 20px -4px ${user?.avatar_color || '#22c55e'}40`
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="hidden sm:block font-medium">{user?.name?.split(' ')[0]}</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-dark-400 hover:text-white p-2.5 rounded-xl hover:bg-dark-800/60 transition-all duration-300"
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
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-dark-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-center text-dark-500 text-sm">
            Built with 💚 for the grind
          </p>
        </div>
      </footer>
    </div>
  )
}
