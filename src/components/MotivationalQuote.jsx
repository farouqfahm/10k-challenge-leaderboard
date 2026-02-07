import { useState, useEffect } from 'react'

const QUOTES = [
  { text: "Every sale you close is a step closer to your goal.", author: "The Grind" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Your only limit is your mind.", author: "Unknown" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { text: "The harder you work, the luckier you get.", author: "Gary Player" },
  { text: "Revenue solves all problems.", author: "Jason Fried" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Money follows passion — not the other way around.", author: "David Siteman Garland" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
]

export default function MotivationalQuote() {
  const [quote, setQuote] = useState(QUOTES[0])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Pick a random quote on mount
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
  }, [])

  const getNewQuote = () => {
    setIsAnimating(true)
    setTimeout(() => {
      let newQuote
      do {
        newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
      } while (newQuote.text === quote.text)
      setQuote(newQuote)
      setIsAnimating(false)
    }, 200)
  }

  return (
    <div className="glass-card relative overflow-hidden group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Daily Motivation
          </h2>
          <button
            onClick={getNewQuote}
            className="p-2 rounded-lg hover:bg-dark-800/60 transition-colors text-dark-500 hover:text-white"
            title="Get new quote"
          >
            <svg className={`w-4 h-4 transition-transform ${isAnimating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className={`transition-all duration-200 ${isAnimating ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
          <blockquote className="text-lg text-dark-200 leading-relaxed mb-3 font-medium">
            "{quote.text}"
          </blockquote>
          <cite className="text-sm text-dark-500 not-italic">
            — {quote.author}
          </cite>
        </div>
      </div>
    </div>
  )
}
