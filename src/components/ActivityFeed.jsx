import { useState, useEffect, useCallback } from 'react'
import { api, timeAgo, formatCurrency } from '../utils/api'
import { useWebSocketEvent } from '../context/WebSocketContext'

const TYPE_CONFIG = {
  sale: { icon: '💰', color: 'text-primary-400' },
  joined: { icon: '🚀', color: 'text-blue-400' },
  achievement: { icon: '🏆', color: 'text-amber-400' },
  message: { icon: '💬', color: 'text-purple-400' },
}

export default function ActivityFeed() {
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeed()
  }, [])

  async function loadFeed() {
    try {
      const data = await api.getFeed(15)
      setFeed(data.feed)
    } catch (error) {
      console.error('Failed to load feed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Listen for real-time updates
  const handleSaleAdded = useCallback((payload) => {
    const newItem = {
      id: Date.now(),
      type: 'sale',
      message: `${payload.userName} closed a ${formatCurrency(payload.amount)} deal!`,
      amount: payload.amount,
      created_at: payload.timestamp,
      user_id: payload.userId,
      user_name: payload.userName,
    }
    setFeed(prev => [newItem, ...prev].slice(0, 15))
  }, [])

  const handleAchievement = useCallback((payload) => {
    payload.achievements.forEach(badge => {
      const newItem = {
        id: Date.now() + Math.random(),
        type: 'achievement',
        message: `${payload.userName} unlocked "${badge.name}" ${badge.emoji}`,
        created_at: new Date().toISOString(),
        user_id: payload.userId,
        user_name: payload.userName,
      }
      setFeed(prev => [newItem, ...prev].slice(0, 15))
    })
  }, [])

  useWebSocketEvent('SALE_ADDED', handleSaleAdded)
  useWebSocketEvent('ACHIEVEMENT_UNLOCKED', handleAchievement)

  if (loading) {
    return (
      <div className="glass-card animate-pulse">
        <div className="h-6 bg-dark-800 rounded w-32 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-dark-800/50 rounded-xl mb-2"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="glass-card">
      <h2 className="text-lg font-semibold mb-5 flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <span>Live Activity</span>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-dark-500">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          Real-time
        </div>
      </h2>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {feed.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 opacity-50">🦗</div>
            <p className="text-dark-500">No activity yet</p>
            <p className="text-dark-600 text-sm mt-1">Be the first to log a sale!</p>
          </div>
        ) : (
          feed.map((item, index) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.sale
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-dark-800/30 hover:bg-dark-800/60 transition-all duration-200 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-lg flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  {config.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-200 break-words leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-xs text-dark-500 mt-1.5">{timeAgo(item.created_at)}</p>
                </div>
                {item.amount && (
                  <span className={`${config.color} font-semibold text-sm flex-shrink-0`}>
                    +{formatCurrency(item.amount)}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
