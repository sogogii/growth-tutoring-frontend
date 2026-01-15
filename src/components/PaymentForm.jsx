import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import './styles/PaymentForm.css'

function PaymentForm({ onCreateSessionRequest, amount }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError('Payment system is loading. Please wait.')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Create session request and get client secret
      const sessionData = await onCreateSessionRequest()
      
      if (!sessionData?.clientSecret) {
        throw new Error('Failed to initialize payment')
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        sessionData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent.status === 'requires_capture') {
        navigate('/booking-success', {
          state: {
            sessionRequestId: sessionData.sessionRequest.id,
            message: 'Session request sent! Payment authorized.',
          },
        })
      } else {
        throw new Error('Payment authorization failed')
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="card-element-container">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && <div className="payment-error">{error}</div>}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="payment-submit-btn"
      >
        {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>

      <p className="payment-notice">
        Your card will be authorized but not charged until the tutor accepts.
      </p>
    </form>
  )
}

export default PaymentForm