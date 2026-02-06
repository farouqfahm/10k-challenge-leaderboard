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
      <div className="text-center">
        <p className="text-2xl font-bold text-amber-400">🎉 Challenge Complete!</p>
      </div>
    )
  }

  const TimeBlock = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-dark-800 rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center border border-dark-700">
        <span className="text-2xl sm:text-3xl font-bold text-white">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-dark-400 mt-2 uppercase tracking-wider">{label}</span>
    </div>
  )

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="text-2xl text-dark-600 font-bold">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="text-2xl text-dark-600 font-bold">:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className="text-2xl text-dark-600 font-bold hidden sm:block">:</span>
      <div className="hidden sm:block">
        <TimeBlock value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  )
}
