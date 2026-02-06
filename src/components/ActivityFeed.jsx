import { useState, useEffect, useCallback } from 'react'
import { api, timeAgo, formatCurrency } from '../utils/api'
import { useWebSocketEvent } from '../context/WebSocketContext'

const TYPE_ICONS = {
  sale: '💰',
  joined: '🚀',
  achievement: '🏆',
  message: '💬',
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
      message: `${payload.userName} closed a ${formatCurrency(payload.amount)} deal! 💰`,
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
          <div key={i} className="h-12 bg-dark-800 rounded mb-2"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="glass-card">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>⚡</span>
        Live Activity
      </h2>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {feed.length === 0 ? (
          <p className="text-dark-500 text-center py-8">No activity yet. Be the first!</p>
        ) : (
          feed.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors"
            >
              <span className="text-xl">{TYPE_ICONS[item.type] || '📢'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-dark-200 break-words">{item.message}</p>
                <p className="text-xs text-dark-500 mt-1">{timeAgo(item.created_at)}</p>
              </div>
              {item.amount && (
                <span className="text-primary-400 font-semibold text-sm">
                  +{formatCurrency(item.amount)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
