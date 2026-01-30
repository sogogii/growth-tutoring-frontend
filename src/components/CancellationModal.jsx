import React, { useState, useEffect } from 'react'
import './styles/CancellationModal.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const CancellationModal = ({ 
  session, 
  userRole, // 'student' or 'tutor'
  onClose, 
  onSuccess 
}) => {
  const [refundPreview, setRefundPreview] = useState(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Only fetch refund preview for students
    if (userRole === 'student') {
      fetchRefundPreview()
    } else {
      setLoading(false)
    }
  }, [session.id])

  const fetchRefundPreview = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/session-requests/${session.id}/refund-preview`,
        { credentials: 'include' }
      )

      if (!res.ok) {
        throw new Error('Failed to fetch refund preview')
      }

      const data = await res.json()
      setRefundPreview(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmCancellation = async () => {
    if (userRole === 'tutor' && !reason.trim()) {
      alert('Please provide a reason for cancellation')
      return
    }

    if (!confirm('Are you sure you want to cancel this session?')) {
      return
    }

    setCancelling(true)

    try {
      const endpoint = userRole === 'student' 
        ? `${API_BASE}/api/session-requests/${session.id}/cancel-confirmed`
        : `${API_BASE}/api/session-requests/tutor/sessions/${session.id}/cancel`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: reason || 'No reason provided' })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to cancel session')
      }

      const data = await res.json()
      
      alert(
        userRole === 'student'
          ? `Session cancelled. You will receive a ${data.refundPercentage}% refund.`
          : 'Session cancelled. Student will receive a full refund.'
      )
      
      onSuccess()
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setCancelling(false)
    }
  }

  const formatCurrency = (cents) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cancellation-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Cancel Session</h2>

        {/* Session Details */}
        <div className="session-summary">
          <h3>Session Details</h3>
          <p>
            <strong>
              {userRole === 'student' 
                ? `Tutor: ${session.tutorFirstName} ${session.tutorLastName}`
                : `Student: ${session.studentFirstName} ${session.studentLastName}`
              }
            </strong>
          </p>
          <p><strong>Subject:</strong> {session.subject}</p>
          <p><strong>Date & Time:</strong> {formatDateTime(session.requestedStart)}</p>
        </div>

        {/* Refund Preview (Student Only) */}
        {userRole === 'student' && (
          <>
            {loading ? (
              <div className="loading-spinner">Loading refund information...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : refundPreview && (
              <div className="refund-preview">
                <h3>Refund Information</h3>
                
                <div className="refund-policy-box">
                  <p className="policy-text">{refundPreview.refundPolicy}</p>
                  
                  <div className="refund-breakdown">
                    <div className="refund-row">
                      <span>Original Charge:</span>
                      <span>{formatCurrency(refundPreview.totalAmountCents)}</span>
                    </div>
                    <div className="refund-row highlight">
                      <span><strong>Refund Amount:</strong></span>
                      <span className="refund-amount">
                        <strong>{formatCurrency(refundPreview.refundAmountCents)}</strong>
                        <span className="refund-percentage"> ({refundPreview.refundPercentage}%)</span>
                      </span>
                    </div>
                  </div>

                  <p className="time-remaining">
                    Time until session: <strong>{refundPreview.hoursUntilSession} hours</strong>
                  </p>
                </div>

                {refundPreview.refundPercentage === 0 && (
                  <div className="warning-box">
                    <p>⚠️ <strong>No refund available.</strong> You are cancelling less than 2 hours before the session.</p>
                  </div>
                )}

                {refundPreview.refundPercentage === 70 && (
                  <div className="info-box">
                    <p>ℹ️ A 30% cancellation fee applies when cancelling 2-24 hours before the session.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Tutor Cancellation Warning */}
        {userRole === 'tutor' && (
          <div className="tutor-cancellation-warning">
            <div className="warning-box">
              <p>⚠️ <strong>Important:</strong> The student will receive a 100% refund when you cancel a session.</p>
              <p>Frequent cancellations may affect your tutor rating and visibility.</p>
            </div>
          </div>
        )}

        {/* Cancellation Reason */}
        <div className="cancellation-reason">
          <label htmlFor="reason">
            Reason for cancellation {userRole === 'tutor' && <span className="required">*</span>}
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              userRole === 'student' 
                ? 'Optional: Let us know why you need to cancel'
                : 'Please provide a reason for cancelling this session'
            }
            rows="3"
            required={userRole === 'tutor'}
          />
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={cancelling}
          >
            Keep Session
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleConfirmCancellation}
            disabled={cancelling || loading}
          >
            {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancellationModal