import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '../utils/api'

export default function EarningsChart({ dailyEarnings }) {
  const chartData = useMemo(() => {
    if (!dailyEarnings || dailyEarnings.length === 0) return []

    // Fill in missing dates and calculate cumulative
    const sorted = [...dailyEarnings].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    let cumulative = 0
    return sorted.map(day => {
      cumulative += day.earnings
      const date = new Date(day.date)
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        earnings: day.earnings,
        cumulative,
        deals: day.deals,
      }
    })
  }, [dailyEarnings])

  if (chartData.length === 0) {
    return (
      <div className="glass-card">
        <h3 className="text-lg font-semibold mb-4">📈 Earnings Over Time</h3>
        <div className="h-64 flex items-center justify-center text-dark-500">
          No earnings data yet. Close your first deal!
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-3 shadow-xl">
        <p className="font-medium text-white mb-1">{label}</p>
        <p className="text-primary-400 text-sm">
          Daily: {formatCurrency(payload[0]?.value || 0)}
        </p>
        <p className="text-dark-400 text-sm">
          Total: {formatCurrency(payload[1]?.value || 0)}
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <h3 className="text-lg font-semibold mb-4">📈 Earnings Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#334155' }}
              tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#colorEarnings)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorCumulative)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
          <span className="text-dark-400">Daily Earnings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-dark-400">Cumulative Total</span>
        </div>
      </div>
    </div>
  )
}
