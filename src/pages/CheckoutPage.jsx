import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from '../components/PaymentForm'
import './styles/CheckoutPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Initialize Stripe - REPLACE WITH YOUR PUBLISHABLE KEY
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const {
    tutorUserId,
    tutorName,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    subject,
    message,
    sessionFormat,
    studentUserId,
  } = location.state || {}

  const [priceInfo, setPriceInfo] = useState(null)
  const [sessionRequestData, setSessionRequestData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tutorUserId || !selectedDate || !selectedStartTime || !selectedEndTime) {
      navigate('/tutors')
      return
    }
    calculatePrice()
  }, [])

  const calculatePrice = async () => {
    try {
      const startDateTime = new Date(selectedDate)
      startDateTime.setHours(selectedStartTime.hour, selectedStartTime.minute, 0, 0)

      const endDateTime = new Date(selectedDate)
      endDateTime.setHours(selectedEndTime.hour, selectedEndTime.minute, 0, 0)

      const res = await fetch(
        `${API_BASE}/api/payments/calculate-price?` +
        `tutorUserId=${tutorUserId}&` +
        `startTime=${startDateTime.toISOString()}&` +
        `endTime=${endDateTime.toISOString()}`
      )

      if (!res.ok) throw new Error('Failed to calculate price')

      const data = await res.json()
      setPriceInfo(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleCreateSessionRequest = async () => {
    try {
      const startDateTime = new Date(selectedDate)
      startDateTime.setHours(selectedStartTime.hour, selectedStartTime.minute, 0, 0)

      const endDateTime = new Date(selectedDate)
      endDateTime.setHours(selectedEndTime.hour, selectedEndTime.minute, 0, 0)

      const studentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const res = await fetch(
        `${API_BASE}/api/session-requests?studentUserId=${studentUserId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tutorUserId,
            requestedStart: startDateTime.toISOString(),
            requestedEnd: endDateTime.toISOString(),
            studentTimezone,
            subject: subject?.trim() || null,
            message: message?.trim() || null,
            sessionFormat: sessionFormat || 'ONLINE',
          }),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to create session request')
      }

      const data = await res.json()
      setSessionRequestData(data)
      return data
    } catch (err) {
      console.error('Session request error:', err)
      throw err
    }
  }

  const formatCurrency = (cents) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  if (loading) return <div className="checkout-page"><h1>Loading...</h1></div>
  if (error) return <div className="checkout-page"><h1>Error: {error}</h1></div>

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Complete Your Booking</h1>

        {/* Session Details */}
        <div className="checkout-section">
          <h2>Session Details</h2>
          <div className="detail-row">
            <span className="detail-label">Tutor:</span>
            <span className="detail-value">{tutorName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">
              {selectedStartTime.time12} - {selectedEndTime.time12}
            </span>
          </div>
          {subject && (
            <div className="detail-row">
              <span className="detail-label">Subject:</span>
              <span className="detail-value">{subject}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Format:</span>
            <span className="detail-value">
              {sessionFormat === 'IN_PERSON' ? 'In-Person' : 'Online'}
            </span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="checkout-section price-breakdown">
          <h2>Price Breakdown</h2>
          <div className="price-row">
            <span>Hourly Rate:</span>
            <span>${priceInfo?.hourlyRate}</span>
          </div>
          <div className="price-row">
            <span>Duration:</span>
            <span>{priceInfo?.durationHours} hours</span>
          </div>
          <div className="price-row total">
            <span>Total:</span>
            <span className="total-amount">
              {formatCurrency(priceInfo?.amountCents)}
            </span>
          </div>
        </div>

        {/* Important Notice */}
        <div className="checkout-notice">
          <h3>💳 Payment Authorization</h3>
          <p>
            Your payment method will be <strong>authorized</strong> but{' '}
            <strong>not charged</strong> immediately. The payment will only be
            processed after the tutor accepts your session request.
          </p>
          <p>
            If the tutor declines or you cancel the request, the authorization
            will be released and you won't be charged.
          </p>
        </div>

        {/* Payment Form */}
        <div className="checkout-section">
          <h2>Payment Information</h2>
          <Elements stripe={stripePromise}>
            <PaymentForm
              onCreateSessionRequest={handleCreateSessionRequest}
              sessionRequestData={sessionRequestData}
              amount={priceInfo?.amountCents}
            />
          </Elements>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage