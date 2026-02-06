export default function StatsCard({ icon, label, value, subValue, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
  }

  return (
    <div className={`glass-card bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-dark-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subValue && <p className="text-sm text-dark-500 mt-1">{subValue}</p>}
    </div>
  )
}
