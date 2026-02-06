import { useState, useEffect, useCallback } from 'react'
import { api, formatCurrency } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useWebSocketEvent } from '../context/WebSocketContext'
import LeaderboardCard from '../components/LeaderboardCard'
import CountdownTimer from '../components/CountdownTimer'
import ActivityFeed from '../components/ActivityFeed'
import TrashTalk from '../components/TrashTalk'
import MotivationalQuote from '../components/MotivationalQuote'
import StatsCard from '../components/StatsCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    try {
      const data = await api.getLeaderboard()
      setLeaderboard(data.leaderboard)
      setChallenge(data.challenge)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update leaderboard on real-time events
  const handleSaleAdded = useCallback((payload) => {
    setLeaderboard(prev => {
      const updated = prev.map(u => {
        if (u.id === payload.userId) {
          return {
            ...u,
            total_earnings: payload.totalEarnings,
            total_deals: payload.totalDeals,
            progress_percent: Math.min((payload.totalEarnings / (challenge?.goal || 10000)) * 100, 100),
          }
        }
        return u
      })
      // Re-sort by earnings
      return updated.sort((a, b) => b.total_earnings - a.total_earnings)
        .map((u, i) => ({ ...u, rank: i + 1 }))
    })
  }, [challenge])

  useWebSocketEvent('SALE_ADDED', handleSaleAdded)

  // Calculate totals
  const totalEarnings = leaderboard.reduce((sum, u) => sum + u.total_earnings, 0)
  const totalDeals = leaderboard.reduce((sum, u) => sum + u.total_deals, 0)
  const currentUserStats = leaderboard.find(u => u.id === user?.id)

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-dark-900 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-dark-900 rounded-2xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-dark-900 rounded-2xl"></div>
            <div className="h-48 bg-dark-900 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero section with countdown */}
      <div className="glass-card bg-gradient-to-br from-primary-500/10 via-dark-900 to-purple-500/10">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            🔥 $10K in 30 Days Challenge 🔥
          </h2>
          <p className="text-dark-400">Time remaining to crush it</p>
        </div>
        <CountdownTimer endDate={challenge?.end_date || '2024-03-02'} />
      </div>

      {/* Your stats summary */}
      {currentUserStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            icon="🏆"
            label="Your Rank"
            value={`#${currentUserStats.rank}`}
            subValue={`of ${leaderboard.length} challengers`}
            color="amber"
          />
          <StatsCard
            icon="💰"
            label="Your Earnings"
            value={formatCurrency(currentUserStats.total_earnings)}
            subValue={`${Math.round(currentUserStats.progress_percent)}% to goal`}
            color="primary"
          />
          <StatsCard
            icon="📊"
            label="Your Deals"
            value={currentUserStats.total_deals}
            subValue={`${currentUserStats.days_active} days active`}
            color="blue"
          />
          <StatsCard
            icon="🎯"
            label="To Goal"
            value={formatCurrency(Math.max(0, (challenge?.goal || 10000) - currentUserStats.total_earnings))}
            subValue={currentUserStats.progress_percent >= 100 ? '🎉 CRUSHED IT!' : 'remaining'}
            color={currentUserStats.progress_percent >= 100 ? 'amber' : 'purple'}
          />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🏅</span> Leaderboard
            </h2>
            <div className="text-sm text-dark-400">
              {leaderboard.length} challengers · {formatCurrency(totalEarnings)} total · {totalDeals} deals
            </div>
          </div>
          
          <div className="space-y-3">
            {leaderboard.map((player) => (
              <LeaderboardCard
                key={player.id}
                user={player}
                isCurrentUser={player.id === user?.id}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <MotivationalQuote />
          <ActivityFeed />
          <TrashTalk />
        </div>
      </div>
    </div>
  )
}
