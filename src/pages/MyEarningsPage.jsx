import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/MyEarningsPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function MyEarningsPage() {
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
  
  const [earnings, setEarnings] = useState([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Date filter states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (currentUser.role !== 'TUTOR') {
      navigate('/')
      return
    }
    loadEarnings()
  }, [])

  const loadEarnings = async (start = '', end = '') => {
    try {
      setLoading(true)
      setError(null)
      
      let url = `${API_BASE}/api/payments/tutor/${currentUser.userId}/earnings`
      
      // Add date params if provided
      const params = new URLSearchParams()
      if (start) params.append('startDate', start)
      if (end) params.append('endDate', end)
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load earnings')
      
      const data = await res.json()
      setEarnings(data.earnings || [])
      setTotalEarnings(data.totalEarnings || 0)
      setTotalSessions(data.totalSessions || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setIsFiltering(false)
    }
  }

  const handleFilter = () => {
    setIsFiltering(true)
    loadEarnings(startDate, endDate)
  }

  const handleClearFilter = () => {
    setStartDate('')
    setEndDate('')
    setIsFiltering(true)
    loadEarnings()
  }

  const displayedEarnings = earnings.filter(earning => {
    // Check if the session is cancelled by fetching its status
    // For now, we rely on backend only returning CAPTURED payments
    return true; // Backend should handle this
  });

  const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num)
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A'
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })
  }

  const formatCommissionRate = (rate) => {
    if (!rate) return '0%'
    const percentage = (parseFloat(rate) * 100).toFixed(0)
    return `${percentage}%`
  }

  // Guard: Not logged in
  if (!currentUser) {
    return (
      <div className="earnings-page">
        <div className="earnings-container">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h2>Please Log In</h2>
            <p>You need to be logged in to view earnings.</p>
          </div>
        </div>
      </div>
    )
  }

  // Guard: Not a tutor
  if (currentUser.role !== 'TUTOR') {
    return (
      <div className="earnings-page">
        <div className="earnings-container">
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h2>Tutors Only</h2>
            <p>Only tutors can view earnings.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="earnings-page">
        <div className="earnings-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading earnings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="earnings-page">
        <div className="earnings-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Earnings</h3>
            <p>{error}</p>
            <button onClick={() => loadEarnings()} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="earnings-page">
      <div className="earnings-container">
        {/* Page Header */}
        <div className="earnings-header">
          <h1>My Earnings</h1>
          <p>Track your tutoring income and completed sessions</p>
        </div>

        {/* Summary Cards */}
        <div className="earnings-summary">
          <div className="summary-card total-earnings">
            <div className="summary-content">
              <h3>Total Net Earnings</h3>
              <p className="summary-value">{formatCurrency(totalEarnings)}</p>
              <p className="summary-note">After commission</p>
            </div>
          </div>

          <div className="summary-card total-sessions">
            <div className="summary-content">
              <h3>Completed Sessions</h3>
              <p className="summary-value">{totalSessions}</p>
            </div>
          </div>

          <div className="summary-card avg-earnings">
            <div className="summary-content">
              <h3>Average Per Session</h3>
              <p className="summary-value">
                {totalSessions > 0 
                  ? formatCurrency(totalEarnings / totalSessions)
                  : '$0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="earnings-filter">
          <h3>Filter by Date Range</h3>
          <div className="filter-inputs">
            <div className="filter-input-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="filter-input-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <button
                onClick={handleFilter}
                className="btn-filter"
                disabled={isFiltering}
              >
                {isFiltering ? 'Filtering...' : 'Apply Filter'}
              </button>
              <button
                onClick={handleClearFilter}
                className="btn-clear-filter"
                disabled={isFiltering || (!startDate && !endDate)}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Earnings List */}
        <div className="earnings-list-section">
          <h3>Payment History</h3>

          {earnings.length === 0 ? (
            <div className="empty-earnings">
              <div className="empty-icon">📭</div>
              <h4>No Earnings Yet</h4>
              <p>Completed sessions will appear here once payment is captured.</p>
            </div>
          ) : (
            <div className="earnings-table-wrapper">
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Session ID</th>
                    <th>Format</th>
                    <th>Duration</th>
                    <th>Hourly Rate</th>
                    <th>Base Amount</th>
                    <th>Commission</th>
                    <th>Net Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map(earning => (
                    <tr key={earning.paymentId}>
                      <td>{formatDateTime(earning.capturedAt)}</td>
                      <td>
                        #{earning.sessionRequestId}
                        {earning.sessionNumber && earning.sessionNumber <= 3 && (
                          <span className="probationary-badge" title="Probationary Period">
                            P{earning.sessionNumber}
                          </span>
                        )}
                      </td>
                      <td className="session-format">
                        {earning.sessionFormat === 'IN_PERSON' ? (
                          <span className="format-badge in-person">In-Person</span>
                        ) : earning.sessionFormat === 'ONLINE' ? (
                          <span className="format-badge online">Online</span>
                        ) : (
                          <span className="format-badge unknown">Unknown</span>
                        )}
                      </td>
                      <td>{earning.durationMinutes} min</td>
                      <td>{formatCurrency(earning.hourlyRate)}/hr</td>
                      <td className="base-amount">
                        {formatCurrency(earning.baseAmount)}
                      </td>
                      <td className="commission-breakdown">
                        <div className="commission-info">
                          <span className="commission-rate">
                            {formatCommissionRate(earning.commissionRate)}
                          </span>
                          <span className="commission-amount">
                            -{formatCurrency(earning.commissionAmount)}
                          </span>
                        </div>
                      </td>
                      <td className="net-earnings">
                        <strong>{formatCurrency(earning.netEarnings)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="7" className="total-label">Total Net Earnings</td>
                    <td className="total-amount">
                      <strong>{formatCurrency(totalEarnings)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Commission Info */}
          {earnings.length > 0 && (
            <div className="commission-info-box">
              <h4>Commission Structure</h4>
              <ul>
                <li><strong>First 3 sessions ever:</strong> 30% commission (probationary period)</li>
                <li><strong>Online tutoring</strong> (after first 3): 20% commission</li>
                <li><strong>In-person tutoring</strong> (after first 3): 15% commission</li>
              </ul>
              <p className="note">
                <strong>Note:</strong> The probationary period applies to your first 3 sessions overall, 
                not per student. Base Amount = Your hourly rate × session hours (excludes $5 platform fee).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyEarningsPage