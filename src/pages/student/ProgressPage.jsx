import { useState, useEffect } from 'react'
import RewardBadge from '../../components/RewardBadge'
import './styles/ProgressPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export default function ProgressPage({ currentUser }) {
  const studentId  = currentUser?.userId
  const subscribed = currentUser?.subscribed || false

  const [reports, setReports]   = useState([])
  const [rewards, setRewards]   = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!studentId) return
    Promise.all([
      fetch(`${API_BASE}/api/reports/student/${studentId}?subscribed=${subscribed}`, { credentials: 'include' }),
      fetch(`${API_BASE}/api/reports/rewards/${studentId}`, { credentials: 'include' }),
    ])
      .then(async ([rRes, rwRes]) => {
        if (!rRes.ok) throw new Error('Failed to load reports')
        const rData = await rRes.json()
        const rwData = rwRes.ok ? await rwRes.json() : []
        setReports(rData.reports || [])
        setTotal(rData.total || 0)
        setRewards(rwData)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [studentId, subscribed])

  const avgScore = reports.length
    ? Math.round(reports.reduce((acc, r) => acc + r.performanceScore, 0) / reports.length * 10) / 10
    : null

  if (loading) return <div className="progress-page"><p className="progress-loading">Loading your progress…</p></div>
  if (error)   return <div className="progress-page"><p className="progress-error">{error}</p></div>

  return (
    <div className="progress-page">
      <div className="progress-container">

        {/* Header */}
        <div className="progress-header">
          <span className="progress-ai-badge">AI Progress Report</span>
          <h1 className="progress-title">Your learning journey</h1>
          <p className="progress-subtitle">
            AI-generated session reports from your tutor, updated after each session.
          </p>
        </div>

        {/* Stats row */}
        {reports.length > 0 && (
          <div className="progress-stats">
            <div className="progress-stat">
              <span className="progress-stat-num">{reports.length}</span>
              <span className="progress-stat-label">Sessions reported</span>
            </div>
            <div className="progress-stat">
              <span className="progress-stat-num">{avgScore}/10</span>
              <span className="progress-stat-label">Average performance</span>
            </div>
            <div className="progress-stat">
              <span className="progress-stat-num">{rewards.length}</span>
              <span className="progress-stat-label">Rewards earned</span>
            </div>
          </div>
        )}

        {/* Rewards strip */}
        {rewards.length > 0 && (
          <section className="progress-section">
            <h2 className="progress-section-title">Rewards & achievements</h2>
            <div className="progress-rewards-row">
              {rewards.slice(0, 6).map(r => (
                <RewardBadge
                  key={r.id}
                  eventType={r.eventType}
                  awardedAt={r.awardedAt}
                  size="sm"
                />
              ))}
            </div>
          </section>
        )}

        {/* Free tier gate */}
        {!subscribed && total > 5 && (
          <div className="progress-gate">
            <span className="progress-gate-icon">🔒</span>
            <div>
              <p className="progress-gate-title">You have {total} total reports</p>
              <p className="progress-gate-text">
                Upgrade to a subscription to unlock all reports and long-term progress tracking.
              </p>
            </div>
            <button className="progress-gate-btn">Upgrade</button>
          </div>
        )}

        {/* Report timeline */}
        <section className="progress-section">
          <h2 className="progress-section-title">Session reports</h2>

          {reports.length === 0 ? (
            <div className="progress-empty">
              <p>No reports yet. Reports appear here after each tutoring session.</p>
            </div>
          ) : (
            <div className="progress-timeline">
              {reports.map(report => {
                const isOpen = expanded === report.id
                const rewardsForReport = rewards.filter(r => r.sessionReportId === report.id)
                return (
                  <div key={report.id} className="progress-card">
                    <div
                      className="progress-card-header"
                      onClick={() => setExpanded(isOpen ? null : report.id)}
                    >
                      <div className="progress-card-left">
                        <div className={`progress-score ${
                          report.performanceScore >= 8 ? 'great' :
                          report.performanceScore >= 5 ? 'good' : 'needs-work'
                        }`}>
                          {report.performanceScore}/10
                        </div>
                        <div>
                          <p className="progress-card-date">{report.createdAt}</p>
                          <p className="progress-card-tutor">by {report.tutorName}</p>
                          {report.subjectsCovered?.length > 0 && (
                            <p className="progress-card-subjects">
                              {report.subjectsCovered.join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="progress-card-right">
                        {rewardsForReport.map(r => (
                          <RewardBadge key={r.id} eventType={r.eventType} size="sm" />
                        ))}
                        <span className="progress-expand-icon">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="progress-card-body">
                        {report.aiNarrative && (
                          <div className="progress-narrative">
                            <p className="progress-narrative-label">Session summary</p>
                            <p className="progress-narrative-text">{report.aiNarrative}</p>
                          </div>
                        )}
                        {report.freeText && (
                          <div className="progress-notes">
                            <p className="progress-narrative-label">Tutor notes</p>
                            <p className="progress-notes-text">{report.freeText}</p>
                          </div>
                        )}
                        {report.challenges?.length > 0 && (
                          <div className="progress-challenges">
                            <p className="progress-narrative-label">Areas to work on</p>
                            <div className="progress-chip-row">
                              {report.challenges.map(c => (
                                <span key={c} className="progress-chip">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}