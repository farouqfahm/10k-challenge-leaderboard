export default function StatsCard({ icon, label, value, subValue, color = 'primary', highlight = false }) {
  const colors = {
    primary: {
      bg: 'from-primary-500/10 to-primary-600/5',
      border: 'border-primary-500/20',
      text: 'text-primary-400',
    },
    blue: {
      bg: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
    },
    purple: {
      bg: 'from-purple-500/10 to-purple-600/5',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
    gold: {
      bg: 'from-yellow-500/15 to-amber-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
    },
    red: {
      bg: 'from-red-500/10 to-red-600/5',
      border: 'border-red-500/20',
      text: 'text-red-400',
    },
  }

  const colorStyle = colors[color] || colors.primary

  return (
    <div className={`relative glass-card bg-gradient-to-br ${colorStyle.bg} border ${colorStyle.border} overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      {/* Glow effect on highlight */}
      {highlight && (
        <div className={`absolute inset-0 bg-gradient-to-br ${colorStyle.bg} opacity-50 blur-xl`} />
      )}
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
          <span className="text-xs text-dark-400 uppercase tracking-wider font-semibold">{label}</span>
        </div>
        <p className={`text-3xl font-bold text-white number-highlight ${highlight ? colorStyle.text : ''}`}>
          {value}
        </p>
        {subValue && (
          <p className="text-sm text-dark-500 mt-1.5">{subValue}</p>
        )}
      </div>
    </div>
  )
}
