import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import './styles/PaymentForm.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function PaymentForm({ onCreateSessionRequest, sessionRequestData, amount }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return // Stripe hasn't loaded yet
    }

    setProcessing(true)
    setError(null)

    try {
      // Step 1: Create session request and payment intent (if not already created)
      let sessionData = sessionRequestData
      if (!sessionData) {
        sessionData = await onCreateSessionRequest()
      }

      const { paymentIntentId } = sessionData

      // Step 2: Confirm payment with card details
      const cardElement = elements.getElement(CardElement)

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentId,
        {
          payment_method: {
            card: cardElement,
          },
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      // Step 3: Verify payment was authorized (not captured yet)
      if (paymentIntent.status === 'requires_capture') {
        setSuccess(true)
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          navigate('/booking-success', {
            state: {
              sessionRequestId: sessionData.sessionRequest.id,
              message: 'Your session request has been sent! Payment will be processed when the tutor accepts.'
            }
          })
        }, 2000)
      } else {
        throw new Error('Payment authorization failed')
      }

    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed. Please try again.')
      setProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label htmlFor="card-element">Card Information</label>
        <div className="card-element-wrapper">
          <CardElement id="card-element" options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="payment-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="payment-success">
          <span className="success-icon">✅</span>
          Payment authorized successfully! Redirecting...
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || success}
        className="btn-pay"
      >
        {processing ? 'Processing...' : success ? 'Success!' : `Authorize ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)}`}
      </button>

      <p className="payment-disclaimer">
        🔒 Your payment information is securely processed by Stripe. 
        We never see or store your card details.
      </p>
    </form>
  )
}

export default PaymentForm