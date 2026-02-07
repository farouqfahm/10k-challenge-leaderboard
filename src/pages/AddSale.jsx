import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, formatCurrency } from '../utils/api'

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000]

const DESCRIPTIONS = [
  'Software license',
  'Consulting',
  'Subscription',
  'Enterprise deal',
  'Support contract',
  'Training',
]

export default function AddSale() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(null)

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      const data = await api.addSale(numAmount, description || 'Sale')
      
      setSuccess({
        amount: numAmount,
        newAchievements: data.newAchievements,
        totalEarnings: data.userStats.total_earnings,
      })

      // Clear form
      setAmount('')
      setDescription('')

      // Redirect after brief celebration
      setTimeout(() => {
        navigate('/')
      }, 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="glass-card relative overflow-hidden">
          {/* Celebration effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-emerald-500/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold mb-3">Sale Logged!</h2>
            <p className="text-5xl font-bold gradient-text mb-6">
              +{formatCurrency(success.amount)}
            </p>
            
            <div className="bg-dark-800/50 rounded-xl p-4 mb-6">
              <p className="text-dark-400 text-sm">Total earnings</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(success.totalEarnings)}</p>
            </div>
            
            {success.newAchievements?.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-6">
                <p className="text-amber-400 font-semibold mb-3 flex items-center justify-center gap-2">
                  <span className="text-xl">🏆</span>
                  New Achievement{success.newAchievements.length > 1 ? 's' : ''}!
                </p>
                <div className="flex justify-center gap-6">
                  {success.newAchievements.map((badge) => (
                    <div key={badge.id} className="text-center">
                      <span className="text-4xl block mb-2">{badge.emoji}</span>
                      <p className="text-sm font-medium text-white">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-dark-500 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Redirecting to leaderboard...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-8 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Leaderboard
      </Link>

      <div className="glass-card">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <span className="text-3xl">💰</span>
          Log a Sale
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-dark-300">
              Sale Amount
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-400 text-2xl font-bold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input w-full pl-12 text-3xl font-bold h-16"
                placeholder="0"
                min="1"
                step="0.01"
                required
                autoFocus
              />
            </div>

            {/* Quick amounts */}
            <div className="flex flex-wrap gap-2 mt-4">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    amount === quickAmount.toString()
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-dark-800/60 text-dark-300 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  {formatCurrency(quickAmount)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-dark-300">
              Description <span className="text-dark-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full"
              placeholder="What did you sell?"
              maxLength={100}
            />

            {/* Quick descriptions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {DESCRIPTIONS.map((desc) => (
                <button
                  key={desc}
                  type="button"
                  onClick={() => setDescription(desc)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    description === desc
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'bg-dark-800/60 text-dark-400 hover:bg-dark-700 hover:text-dark-300'
                  }`}
                >
                  {desc}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !amount}
            className="btn-primary w-full text-lg py-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Log {amount ? formatCurrency(parseFloat(amount)) : ''} Sale
                <span className="text-xl">🚀</span>
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Tips */}
      <div className="glass-card mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="relative">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Pro Tips
          </h3>
          <ul className="text-sm text-dark-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">•</span>
              Log sales as you close them to maintain your streak
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">•</span>
              Every sale counts — small wins add up fast!
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">•</span>
              Close a $1K+ deal to earn the "Whale Hunter" badge 🐳
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
