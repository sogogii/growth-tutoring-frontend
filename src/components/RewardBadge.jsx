import './styles/RewardBadge.css'

const BADGE_CONFIG = {
  GREAT_SESSION: {
    icon: '⭐',
    label: 'Great Session',
    description: 'Scored 8 or above this session',
    colorClass: 'gold',
  },
  CONSISTENT_LEARNER: {
    icon: '🔥',
    label: 'Consistent Learner',
    description: '5-session streak with strong performance',
    colorClass: 'orange',
  },
  IMPROVEMENT_TREND: {
    icon: '📈',
    label: 'On the Rise',
    description: 'Three sessions of improving scores',
    colorClass: 'green',
  },
}

export default function RewardBadge({ eventType, awardedAt, size = 'md' }) {
  const config = BADGE_CONFIG[eventType] || {
    icon: '🏅',
    label: eventType,
    description: '',
    colorClass: 'gray',
  }

  return (
    <div className={`reward-badge reward-badge-${config.colorClass} reward-badge-${size}`}>
      <span className="reward-badge-icon">{config.icon}</span>
      <div className="reward-badge-body">
        <span className="reward-badge-label">{config.label}</span>
        {size !== 'sm' && (
          <span className="reward-badge-desc">{config.description}</span>
        )}
        {awardedAt && size !== 'sm' && (
          <span className="reward-badge-date">{awardedAt}</span>
        )}
      </div>
    </div>
  )
}