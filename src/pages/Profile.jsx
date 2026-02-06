import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, formatCurrency, formatDate } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import StatsCard from '../components/StatsCard'
import EarningsChart from '../components/EarningsChart'
import { AchievementGrid } from '../components/AchievementBadge'

export default function Profile() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [dailyEarnings, setDailyEarnings] = useState([])
  const [achievements, setAchievements] = useState([])
  const [allBadges, setAllBadges] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  const isOwnProfile = currentUser?.id === parseInt(userId)

  useEffect(() => {
    loadProfile()
  }, [userId])

  async function loadProfile() {
    setLoading(true)
    try {
      const [statsData, badgesData, salesData, allBadgesData] = await Promise.all([
        api.getUserStats(userId),
        api.getUserAchievements(userId),
        api.getUserSales(userId, 20),
        api.getAllBadges(),
      ])
      
      setUserData(statsData.user)
      setDailyEarnings(statsData.dailyEarnings)
      setAchievements(badgesData.achievements)
      setAllBadges(allBadgesData.badges)
      setSales(salesData.sales)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-dark-900 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-dark-900 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-dark-900 rounded-2xl"></div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <Link to="/" className="text-primary-400 hover:underline">
          Back to Leaderboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Leaderboard
      </Link>

      {/* Profile header */}
      <div className="glass-card">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-xl"
            style={{ 
              backgroundColor: userData.avatar_color,
              boxShadow: `0 10px 40px ${userData.avatar_color}40`,
            }}
          >
            {userData.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold flex items-center justify-center sm:justify-start gap-3">
              {userData.name}
              {isOwnProfile && (
                <span className="text-sm bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full">You</span>
              )}
            </h1>
            <p className="text-dark-400 mt-1">
              Rank #{userData.rank} · Joined {formatDate(userData.created_at)}
            </p>
            
            {/* Progress bar */}
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-400">{Math.round(userData.progress_percent)}% to goal</span>
                <span className="font-semibold">
                  {formatCurrency(userData.total_earnings)} / {formatCurrency(userData.goal)}
                </span>
              </div>
              <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    userData.progress_percent >= 100
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                      : 'bg-gradient-to-r from-primary-400 to-primary-600'
                  }`}
                  style={{ width: `${Math.min(userData.progress_percent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak badge */}
          {userData.streak > 0 && (
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4 text-center">
              <span className="text-3xl">🔥</span>
              <p className="text-2xl font-bold text-orange-400">{userData.streak}</p>
              <p className="text-xs text-dark-400 uppercase tracking-wider">Day Streak</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon="💰"
          label="Total Earnings"
          value={formatCurrency(userData.total_earnings)}
          color="primary"
        />
        <StatsCard
          icon="📊"
          label="Total Deals"
          value={userData.total_deals}
          color="blue"
        />
        <StatsCard
          icon="🏆"
          label="Current Rank"
          value={`#${userData.rank}`}
          color="amber"
        />
        <StatsCard
          icon="🎯"
          label="Remaining"
          value={formatCurrency(Math.max(0, userData.goal - userData.total_earnings))}
          subValue={userData.progress_percent >= 100 ? '🎉 GOAL REACHED!' : 'to $10K'}
          color={userData.progress_percent >= 100 ? 'amber' : 'purple'}
        />
      </div>

      {/* Achievements */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🏅</span>
          Achievements ({achievements.length}/{allBadges.length})
        </h2>
        <AchievementGrid badges={allBadges} userAchievements={achievements} size="md" />
      </div>

      {/* Charts and sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart dailyEarnings={dailyEarnings} />
        
        {/* Recent sales */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📝</span>
            Recent Sales
          </h2>
          
          {sales.length === 0 ? (
            <div className="text-center py-8 text-dark-500">
              <p>No sales yet</p>
              {isOwnProfile && (
                <Link to="/add-sale" className="text-primary-400 hover:underline text-sm mt-2 inline-block">
                  Log your first sale →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
                >
                  <div>
                    <p className="font-medium">{sale.description}</p>
                    <p className="text-sm text-dark-500">{formatDate(sale.created_at)}</p>
                  </div>
                  <span className="text-primary-400 font-bold">
                    +{formatCurrency(sale.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
