import { useState, useEffect } from 'react'
import './styles/MyEarningsPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function MyEarningsPage({ currentUser }) {
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)

  // Date filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    if (currentUser?.userId) {
      loadEarnings()
    }
  }, [currentUser])

  const loadEarnings = async (start = '', end = '') => {
    setLoading(true)
    setError(null)

    try {
      let url = `${API_BASE}/api/payments/tutor/${currentUser.userId}/earnings`
      
      const params = new URLSearchParams()
      if (start) params.append('startDate', start)
      if (end) params.append('endDate', end)
      
      if (params.toString()) {
        url += '?' + params.toString()
      }

      const res = await fetch(url)

      if (!res.ok) {
        throw new Error('Failed to load earnings')
      }

      const data = await res.json()
      setEarnings(data.earnings || [])
      setTotalEarnings(data.totalEarnings || 0)
      setTotalSessions(data.totalSessions || 0)
    } catch (err) {
      console.error('Error loading earnings:', err)
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
    loadEarnings('', '')
  }

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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
              <h3>Total Earnings</h3>
              <p className="summary-value">{formatCurrency(totalEarnings)}</p>
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
            <div className="earnings-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Session ID</th>
                    <th>Duration</th>
                    <th>Hourly Rate</th>
                    <th>Amount Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map(earning => (
                    <tr key={earning.paymentId}>
                      <td>{formatDateTime(earning.capturedAt)}</td>
                      <td>#{earning.sessionRequestId}</td>
                      <td>{earning.durationMinutes} min</td>
                      <td>{formatCurrency(earning.hourlyRate)}/hr</td>
                      <td className="amount-earned">
                        {formatCurrency(earning.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="total-label">Total</td>
                    <td className="total-amount">
                      {formatCurrency(totalEarnings)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyEarningsPage