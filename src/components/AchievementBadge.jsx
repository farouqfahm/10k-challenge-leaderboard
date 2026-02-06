export default function AchievementBadge({ badge, unlocked = false, size = 'md' }) {
  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  }

  return (
    <div
      className={`relative group ${unlocked ? 'cursor-pointer' : 'cursor-default'}`}
      title={unlocked ? `${badge.name}: ${badge.description}` : `🔒 ${badge.name}: ${badge.description}`}
    >
      <div
        className={`${sizes[size]} rounded-2xl flex items-center justify-center transition-all duration-300 ${
          unlocked
            ? 'bg-dark-800 shadow-lg hover:scale-110 hover:shadow-xl'
            : 'bg-dark-900 opacity-40 grayscale'
        }`}
        style={{
          boxShadow: unlocked ? `0 4px 20px ${badge.color}30` : 'none',
          border: unlocked ? `2px solid ${badge.color}` : '2px solid transparent',
        }}
      >
        <span className={unlocked ? '' : 'opacity-50'}>{badge.emoji}</span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-dark-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
        <p className="font-semibold text-sm">{badge.name}</p>
        <p className="text-xs text-dark-400">{badge.description}</p>
        {!unlocked && <p className="text-xs text-yellow-500 mt-1">🔒 Locked</p>}
      </div>
    </div>
  )
}

export function AchievementGrid({ badges, userAchievements, size = 'md' }) {
  const unlockedIds = new Set(userAchievements.map(a => a.id || a.badge_id))

  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((badge) => (
        <AchievementBadge
          key={badge.id}
          badge={badge}
          unlocked={unlockedIds.has(badge.id)}
          size={size}
        />
      ))}
    </div>
  )
}
