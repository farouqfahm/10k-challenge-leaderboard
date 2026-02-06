import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/api'

const RANK_STYLES = {
  1: 'from-yellow-400 to-amber-600 shadow-amber-500/30',
  2: 'from-gray-300 to-gray-500 shadow-gray-400/30',
  3: 'from-orange-400 to-orange-700 shadow-orange-500/30',
}

const RANK_EMOJIS = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function LeaderboardCard({ user, isCurrentUser }) {
  const isTop3 = user.rank <= 3
  
  return (
    <Link
      to={`/profile/${user.id}`}
      className={`glass-card flex items-center gap-4 hover:border-dark-600 transition-all duration-300 hover:scale-[1.01] ${
        isCurrentUser ? 'ring-2 ring-primary-500/50' : ''
      }`}
    >
      {/* Rank */}
      <div className="flex-shrink-0">
        {isTop3 ? (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${RANK_STYLES[user.rank]} shadow-lg flex items-center justify-center text-2xl`}>
            {RANK_EMOJIS[user.rank]}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center text-xl font-bold text-dark-400">
            {user.rank}
          </div>
        )}
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white flex-shrink-0"
          style={{ backgroundColor: user.avatar_color }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold truncate flex items-center gap-2">
            {user.name}
            {isCurrentUser && (
              <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">You</span>
            )}
          </h3>
          <p className="text-sm text-dark-400">
            {user.total_deals} deals · {user.days_active} days active
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="hidden sm:block flex-1 max-w-[200px]">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-dark-400">{Math.round(user.progress_percent)}%</span>
          <span className="text-dark-500">{formatCurrency(user.goal)}</span>
        </div>
        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              user.progress_percent >= 100
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                : 'bg-gradient-to-r from-primary-400 to-primary-600'
            }`}
            style={{ width: `${Math.min(user.progress_percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Earnings */}
      <div className="text-right">
        <p className={`text-xl font-bold ${
          user.progress_percent >= 100 ? 'text-amber-400' : 'text-primary-400'
        }`}>
          {formatCurrency(user.total_earnings)}
        </p>
        {user.progress_percent >= 100 && (
          <span className="text-xs text-amber-400">🎉 GOAL REACHED!</span>
        )}
      </div>
    </Link>
  )
}
