import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import './styles/AddPaymentMethodForm.css'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  },
  hidePostalCode: false
}

function AddPaymentMethodForm({ onSubmit, processing, isFirstCard }) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [error, setError] = useState(null)
  const [setAsDefault, setSetAsDefault] = useState(isFirstCard)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setError(null)

    try {
      // Create payment method with Stripe
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      })

      if (stripeError) {
        setError(stripeError.message)
        return
      }

      // Save to backend
      const result = await onSubmit(paymentMethod.id, setAsDefault)

      if (!result.success) {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || 'Failed to add payment method')
    }
  }

  return (
    <form className="add-payment-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Card Information</label>
        <div className="card-element-wrapper">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {!isFirstCard && (
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
            />
            <span>Set as default payment method</span>
          </label>
        </div>
      )}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        className="submit-btn"
        disabled={!stripe || processing}
      >
        {processing ? 'Adding Card...' : 'Add Card'}
      </button>

      <p className="form-notice">
        Your card will not be charged when you add it. It will only be used for future bookings.
      </p>
    </form>
  )
}

export default AddPaymentMethodForm