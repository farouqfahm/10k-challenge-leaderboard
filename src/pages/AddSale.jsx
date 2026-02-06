import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, formatCurrency } from '../utils/api'

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000]

const DESCRIPTIONS = [
  'Software license sale',
  'Consulting package',
  'Annual subscription',
  'Enterprise deal',
  'Support contract',
  'Training workshop',
  'Custom integration',
  'Premium upgrade',
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
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <div className="glass-card bg-gradient-to-br from-primary-500/20 to-dark-900">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold mb-2">Sale Logged!</h2>
          <p className="text-4xl font-bold text-primary-400 mb-4">
            +{formatCurrency(success.amount)}
          </p>
          <p className="text-dark-400 mb-4">
            Total earnings: {formatCurrency(success.totalEarnings)}
          </p>
          
          {success.newAchievements?.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
              <p className="text-amber-400 font-medium mb-2">🏆 New Achievement{success.newAchievements.length > 1 ? 's' : ''}!</p>
              <div className="flex justify-center gap-4">
                {success.newAchievements.map((badge) => (
                  <div key={badge.id} className="text-center">
                    <span className="text-3xl">{badge.emoji}</span>
                    <p className="text-sm font-medium mt-1">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-dark-500 text-sm">Redirecting to leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Leaderboard
      </Link>

      <div className="glass-card">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-3xl">💰</span>
          Log a Sale
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-300">
              Sale Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 text-xl font-bold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input w-full pl-10 text-2xl font-bold"
                placeholder="0"
                min="1"
                step="0.01"
                required
                autoFocus
              />
            </div>

            {/* Quick amounts */}
            <div className="flex flex-wrap gap-2 mt-3">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    amount === quickAmount.toString()
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  {formatCurrency(quickAmount)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-300">
              Description (optional)
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
            <div className="flex flex-wrap gap-2 mt-3">
              {DESCRIPTIONS.slice(0, 4).map((desc) => (
                <button
                  key={desc}
                  type="button"
                  onClick={() => setDescription(desc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    description === desc
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
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
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging...
              </span>
            ) : (
              <>
                Log {amount ? formatCurrency(parseFloat(amount)) : ''} Sale 🚀
              </>
            )}
          </button>
        </form>
      </div>

      {/* Tips */}
      <div className="glass-card mt-6 bg-gradient-to-br from-blue-500/10 to-dark-900 border-blue-500/20">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <span>💡</span>
          Pro Tips
        </h3>
        <ul className="text-sm text-dark-400 space-y-1">
          <li>• Log sales as you close them to maintain your streak</li>
          <li>• Every sale counts — small wins add up!</li>
          <li>• Close a $1K+ deal to earn the "Whale Hunter" badge 🐳</li>
        </ul>
      </div>
    </div>
  )
}
