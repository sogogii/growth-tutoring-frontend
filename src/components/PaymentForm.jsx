import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import './styles/PaymentForm.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function PaymentForm({ onCreateSessionRequest, amount }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  
  // Saved payment methods
  const [savedMethods, setSavedMethods] = useState([])
  const [selectedMethodId, setSelectedMethodId] = useState(null)
  const [useNewCard, setUseNewCard] = useState(false)
  const [loadingSavedMethods, setLoadingSavedMethods] = useState(true)

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  const userId = currentUser.userId

  useEffect(() => {
    if (userId) {
      fetchSavedPaymentMethods()
    } else {
      setLoadingSavedMethods(false)
      setUseNewCard(true)
    }
  }, [userId])

  const fetchSavedPaymentMethods = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/saved-payment-methods?userId=${userId}`)
      
      if (res.ok) {
        const data = await res.json()
        setSavedMethods(data)
        
        // Auto-select default card if exists
        const defaultCard = data.find(m => m.isDefault)
        if (defaultCard) {
          setSelectedMethodId(defaultCard.id)
          setUseNewCard(false)
        } else if (data.length > 0) {
          setSelectedMethodId(data[0].id)
          setUseNewCard(false)
        } else {
          setUseNewCard(true)
        }
      } else {
        setUseNewCard(true)
      }
    } catch (err) {
      console.error('Failed to load saved cards:', err)
      setUseNewCard(true)
    } finally {
      setLoadingSavedMethods(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError('Payment system is loading. Please wait.')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Step 1: Create session request and get client secret
      const sessionData = await onCreateSessionRequest()
      
      if (!sessionData?.clientSecret) {
        throw new Error('Failed to initialize payment')
      }

      let paymentMethodId

      if (useNewCard) {
        // Create new payment method from card element
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
        })

        if (pmError) {
          throw new Error(pmError.message)
        }

        paymentMethodId = paymentMethod.id
      } else {
        // Use selected saved payment method
        const selectedMethod = savedMethods.find(m => m.id === selectedMethodId)
        if (!selectedMethod) {
          throw new Error('Please select a payment method')
        }
        paymentMethodId = selectedMethod.stripePaymentMethodId
      }

      // Step 2: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        sessionData.clientSecret,
        {
          payment_method: paymentMethodId,
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent.status !== 'requires_capture') {
        throw new Error('Payment authorization failed')
      }

      // Step 3: Confirm payment on backend
      const confirmRes = await fetch(
        `${API_BASE}/api/session-requests/${sessionData.sessionRequest.id}/confirm-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (!confirmRes.ok) {
        const errorText = await confirmRes.text()
        throw new Error(`Failed to confirm booking: ${errorText}`)
      }

      // Success! Navigate to success page
      navigate('/booking-success', {
        state: {
          sessionRequestId: sessionData.sessionRequest.id,
          message: 'Session request sent! Payment authorized.',
        },
      })
      
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
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

  if (loadingSavedMethods) {
    return (
      <div className="payment-form-loading">
        <div className="spinner-small"></div>
        <p>Loading payment options...</p>
      </div>
    )
  }

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      {/* Saved Cards Section */}
      {savedMethods.length > 0 && (
        <div className="saved-cards-section">
          <div className="payment-method-selector">
            <label className="payment-option-label">
              <input
                type="radio"
                name="paymentOption"
                checked={!useNewCard}
                onChange={() => setUseNewCard(false)}
              />
              <span>Use saved card</span>
            </label>

            {!useNewCard && (
              <div className="saved-cards-list">
                {savedMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`saved-card-option ${
                      selectedMethodId === method.id ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedCard"
                      checked={selectedMethodId === method.id}
                      onChange={() => setSelectedMethodId(method.id)}
                    />
                    <div className="saved-card-info">
                      <div className="saved-card-brand">
                        {method.cardBrand.toUpperCase()} ••••{method.cardLast4}
                      </div>
                      <div className="saved-card-expiry">
                        Expires {String(method.cardExpMonth).padStart(2, '0')}/
                        {method.cardExpYear}
                      </div>
                      {method.nickname && (
                        <div className="saved-card-nickname">
                          "{method.nickname}"
                        </div>
                      )}
                      {method.isDefault && (
                        <span className="default-badge-small">Default</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="payment-divider">
            <span>OR</span>
          </div>
        </div>
      )}

      {/* New Card Section */}
      <div className="new-card-section">
        <label className="payment-option-label">
          <input
            type="radio"
            name="paymentOption"
            checked={useNewCard}
            onChange={() => setUseNewCard(true)}
          />
          <span>Use a new card</span>
        </label>

        {useNewCard && (
          <div className="card-input-wrapper">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
            
            {savedMethods.length === 0 && (
              <p className="save-card-notice">
                💡 Your card will be saved for future use
              </p>
            )}
          </div>
        )}
      </div>

      {error && <div className="payment-error">{error}</div>}

      <button
        type="submit"
        className="payment-submit-btn"
        disabled={!stripe || processing || (!useNewCard && !selectedMethodId)}
      >
        {processing ? 'Processing...' : 'Authorize Payment'}
      </button>

      <p className="payment-notice">
        Your card will be authorized but not charged until the tutor accepts your request.
      </p>
    </form>
  )
}

export default PaymentForm