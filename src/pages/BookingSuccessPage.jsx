import { useLocation, useNavigate } from 'react-router-dom'
import './styles/BookingSuccessPage.css'

function BookingSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { sessionRequestId, message } = location.state || {}

  return (
    <div className="booking-success-page">
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h1>Booking Request Sent!</h1>
        
        <p className="success-message">
          {message || 'Your session request has been sent successfully.'}
        </p>

        <div className="info-box">
          <h3>What happens next?</h3>
          <ol>
            <li>
              <strong>Tutor Review:</strong> The tutor will review your session request and respond within 24 hours.
            </li>
            <li>
              <strong>Payment Authorization:</strong> Your payment method has been authorized but NOT charged yet.
            </li>
            <li>
              <strong>If Accepted:</strong> The tutor accepts → Payment is processed → Session is confirmed!
            </li>
            <li>
              <strong>If Declined:</strong> The tutor declines → Payment authorization is released → You won't be charged.
            </li>
          </ol>
        </div>

        <div className="notice-box">
          <p>
            💡 <strong>Good to know:</strong> You can view and manage your session requests 
            in your dashboard. You'll receive email notifications when the tutor responds.
          </p>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/student-dashboard')}
          >
            View My Bookings
          </button>
          <button 
            className="btn-secondary"
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