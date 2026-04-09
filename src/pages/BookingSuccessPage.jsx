import { useLocation, useNavigate } from 'react-router-dom'
import './styles/BookingSuccessPage.css'

function BookingSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const { message } = location.state || {}

  return (
    <div className="booking-success-page">
      <div className="success-container">

        {/* Icon */}
        <div className="success-icon-wrapper">
          <div className="success-icon">✓</div>
        </div>

        {/* Title */}
        <h1 className="success-title">Booking Request Sent!</h1>
        <p className="success-subtitle">
          {message || 'Your session request has been sent successfully.'}
        </p>

        {/* Steps */}
        <div className="success-steps">
          <h3 className="steps-title">What happens next?</h3>
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Tutor Review</strong>
              <span>The tutor will review your request and respond within 24 hours.</span>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Payment on Hold</strong>
              <span>Your payment is authorized but not charged yet.</span>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>If Accepted</strong>
              <span>Payment is processed and your session is confirmed.</span>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>If Declined</strong>
              <span>Authorization is released and you won't be charged.</span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="success-notice">
          You'll receive an email notification when the tutor responds.
        </div>

        {/* Buttons */}
        <div className="success-actions">
          <button
            className="success-btn-primary"
            onClick={() => navigate('/my-sessions')}
          >
            View My Bookings
          </button>
          <button
            className="success-btn-secondary"
            onClick={() => navigate('/tutors')}
          >
            Browse More Tutors
          </button>
        </div>

      </div>
    </div>
  )
}

export default BookingSuccessPage