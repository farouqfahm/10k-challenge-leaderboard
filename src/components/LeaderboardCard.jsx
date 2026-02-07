import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/api'

const RANK_STYLES = {
  1: {
    gradient: 'from-yellow-400 via-amber-400 to-yellow-500',
    shadow: 'shadow-amber-500/40',
    glow: 'amber',
    emoji: '🥇',
  },
  2: {
    gradient: 'from-gray-300 via-slate-300 to-gray-400',
    shadow: 'shadow-slate-400/30',
    glow: 'slate',
    emoji: '🥈',
  },
  3: {
    gradient: 'from-orange-400 via-amber-600 to-orange-500',
    shadow: 'shadow-orange-500/30',
    glow: 'orange',
    emoji: '🥉',
  },
}

export default function LeaderboardCard({ user, isCurrentUser, animationDelay = 0 }) {
  const isTop3 = user.rank <= 3
  const rankStyle = RANK_STYLES[user.rank]
  const isGoalReached = user.progress_percent >= 100
  
  return (
    <Link
      to={`/profile/${user.id}`}
      className={`group glass-card-hover flex items-center gap-4 ${
        isCurrentUser ? 'ring-2 ring-primary-500/40 bg-primary-500/5' : ''
      } ${isTop3 ? 'py-5' : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Rank */}
      <div className="flex-shrink-0">
        {isTop3 ? (
          <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${rankStyle.gradient} ${rankStyle.shadow} shadow-lg flex items-center justify-center`}>
            <span className="text-2xl drop-shadow-md">{rankStyle.emoji}</span>
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${rankStyle.gradient} blur-lg opacity-40`} />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-dark-800/80 border border-dark-700/50 flex items-center justify-center">
            <span className="text-xl font-bold text-dark-400">#{user.rank}</span>
          </div>
        )}
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
            style={{ 
              backgroundColor: user.avatar_color,
              boxShadow: `0 4px 20px -4px ${user.avatar_color}50`
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          {isGoalReached && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-xs shadow-lg">
              ✓
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold truncate flex items-center gap-2">
            <span className="group-hover:text-primary-400 transition-colors">{user.name}</span>
            {isCurrentUser && (
              <span className="text-xs bg-primary-500/20 text-primary-400 px-2.5 py-0.5 rounded-full font-medium">
                You
              </span>
            )}
          </h3>
          <p className="text-sm text-dark-500">
            {user.total_deals} deal{user.total_deals !== 1 ? 's' : ''} · {user.days_active} day{user.days_active !== 1 ? 's' : ''} active
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="hidden md:block flex-1 max-w-[200px]">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium text-dark-300">{Math.round(user.progress_percent)}%</span>
          <span className="text-dark-500">{formatCurrency(user.goal)}</span>
        </div>
        <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isGoalReached
                ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500'
                : 'bg-gradient-to-r from-primary-500 to-emerald-500'
            }`}
            style={{ width: `${Math.min(user.progress_percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Earnings */}
      <div className="text-right pl-4">
        <p className={`text-xl font-bold number-highlight ${
          isGoalReached ? 'gradient-text-gold' : 'text-primary-400'
        }`}>
          {formatCurrency(user.total_earnings)}
        </p>
        {isGoalReached && (
          <span className="text-xs text-amber-400 font-medium">Goal reached! 🎉</span>
        )}
      </div>

      {/* Hover arrow */}
      <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-dark-800/0 group-hover:bg-dark-800 transition-all duration-300">
        <svg className="w-4 h-4 text-dark-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
