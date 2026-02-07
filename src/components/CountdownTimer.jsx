import { useState, useEffect } from 'react'

export default function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const end = new Date(endDate)
    const now = new Date()
    const difference = end - now

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (timeLeft.expired) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <p className="text-3xl font-bold gradient-text-gold">Challenge Complete!</p>
        <p className="text-dark-400 mt-2">Time to celebrate the results</p>
      </div>
    )
  }

  const TimeBlock = ({ value, label, highlight }) => (
    <div className="flex flex-col items-center">
      <div className={`relative bg-dark-800/80 border border-dark-700/50 rounded-2xl w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center overflow-hidden ${highlight ? 'border-primary-500/30' : ''}`}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        
        <span className={`relative text-3xl sm:text-4xl font-bold number-highlight ${highlight ? 'text-primary-400' : 'text-white'}`}>
          {String(value).padStart(2, '0')}
        </span>
        
        {/* Bottom reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-dark-900/50 to-transparent" />
      </div>
      <span className="text-xs sm:text-sm text-dark-500 mt-3 uppercase tracking-widest font-medium">{label}</span>
    </div>
  )

  const Separator = () => (
    <div className="flex flex-col gap-3 px-1 sm:px-2 pt-4">
      <div className="w-2 h-2 rounded-full bg-dark-600" />
      <div className="w-2 h-2 rounded-full bg-dark-600" />
    </div>
  )

  return (
    <div className="flex items-start justify-center gap-1 sm:gap-2">
      <TimeBlock value={timeLeft.days} label="Days" highlight={timeLeft.days <= 7} />
      <Separator />
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <Separator />
      <TimeBlock value={timeLeft.minutes} label="Minutes" />
      <div className="hidden sm:contents">
        <Separator />
        <TimeBlock value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  )
}
