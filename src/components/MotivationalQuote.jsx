import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function MotivationalQuote() {
  const [quote, setQuote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuote()
  }, [])

  async function loadQuote() {
    try {
      const data = await api.getQuote()
      setQuote(data.quote)
    } catch (error) {
      setQuote("The only limit to your earnings is your imagination. 💭")
    } finally {
      setLoading(false)
    }
  }

  async function refreshQuote() {
    setLoading(true)
    await loadQuote()
  }

  if (loading) {
    return (
      <div className="glass-card animate-pulse">
        <div className="h-4 bg-dark-800 rounded w-3/4"></div>
      </div>
    )
  }

  return (
    <div className="glass-card bg-gradient-to-br from-primary-500/10 to-dark-900">
      <div className="flex items-start gap-4">
        <span className="text-3xl">💡</span>
        <div className="flex-1">
          <p className="text-lg text-dark-200 italic">"{quote}"</p>
        </div>
        <button
          onClick={refreshQuote}
          className="text-dark-500 hover:text-white transition-colors p-1"
          title="Get new quote"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  )
}
