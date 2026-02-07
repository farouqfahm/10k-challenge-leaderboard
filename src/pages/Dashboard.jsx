import { useState, useEffect, useCallback } from 'react'
import { api, formatCurrency } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useWebSocketEvent } from '../context/WebSocketContext'
import LeaderboardCard from '../components/LeaderboardCard'
import CountdownTimer from '../components/CountdownTimer'
import ActivityFeed from '../components/ActivityFeed'
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
      <div className="space-y-8 animate-pulse">
        <div className="h-48 bg-dark-900/50 rounded-3xl"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-dark-900/50 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-dark-900/50 rounded-2xl"></div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-dark-900/50 rounded-2xl"></div>
            <div className="h-64 bg-dark-900/50 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero section with countdown */}
      <div className="relative glass-card overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              Challenge Active
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              <span className="gradient-text">$10K</span> in 30 Days
            </h2>
            <p className="text-dark-400 text-lg">Time remaining to crush your goals</p>
          </div>
          <CountdownTimer endDate={challenge?.end_date || '2026-03-02'} />
        </div>
      </div>

      {/* Your stats summary */}
      {currentUserStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon="🏆"
            label="Your Rank"
            value={`#${currentUserStats.rank}`}
            subValue={`of ${leaderboard.length} challenger${leaderboard.length !== 1 ? 's' : ''}`}
            color="amber"
          />
          <StatsCard
            icon="💰"
            label="Your Earnings"
            value={formatCurrency(currentUserStats.total_earnings)}
            subValue={`${Math.round(currentUserStats.progress_percent)}% to goal`}
            color="primary"
            highlight={currentUserStats.progress_percent >= 50}
          />
          <StatsCard
            icon="📊"
            label="Deals Closed"
            value={currentUserStats.total_deals}
            subValue={`${currentUserStats.days_active} day${currentUserStats.days_active !== 1 ? 's' : ''} active`}
            color="blue"
          />
          <StatsCard
            icon="🎯"
            label="To Goal"
            value={formatCurrency(Math.max(0, (challenge?.goal || 10000) - currentUserStats.total_earnings))}
            subValue={currentUserStats.progress_percent >= 100 ? '🎉 CRUSHED IT!' : 'remaining'}
            color={currentUserStats.progress_percent >= 100 ? 'gold' : 'purple'}
            highlight={currentUserStats.progress_percent >= 100}
          />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">🏅</span> 
              <span>Leaderboard</span>
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-dark-400">
                <span className="text-white font-semibold">{leaderboard.length}</span> challenger{leaderboard.length !== 1 ? 's' : ''}
              </span>
              <span className="w-1 h-1 rounded-full bg-dark-600" />
              <span className="text-dark-400">
                <span className="text-primary-400 font-semibold">{formatCurrency(totalEarnings)}</span> total
              </span>
            </div>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="glass-card text-center py-16">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">No challengers yet!</h3>
              <p className="text-dark-400">Be the first to join and start logging sales.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <LeaderboardCard
                  key={player.id}
                  user={player}
                  isCurrentUser={player.id === user?.id}
                  animationDelay={index * 50}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <MotivationalQuote />
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
