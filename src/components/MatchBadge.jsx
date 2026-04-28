import './styles/MatchBadge.css'

export default function MatchBadge({ score, reason }) {
  const pct = Math.round(score * 100)

  const tier =
    pct >= 85 ? 'excellent' :
    pct >= 65 ? 'good' : 'fair'

  return (
    <div className={`match-badge match-badge-${tier}`}>
      <div className="match-badge-score">
        <span className="match-badge-pct">{pct}%</span>
        <span className="match-badge-label">match</span>
      </div>
      {reason && <p className="match-badge-reason">{reason}</p>}
    </div>
  )
}