import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import AddPaymentMethodForm from '../components/AddPaymentMethodForm'
import SavedPaymentMethodCard from '../components/SavedPaymentMethodCard'
import './styles/MyPaymentsPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function MyPaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [processingAction, setProcessingAction] = useState(null)

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  const userId = currentUser.userId

  useEffect(() => {
    if (userId) {
      fetchPaymentMethods()
    }
  }, [userId])

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/saved-payment-methods?userId=${userId}`)
      
      if (!res.ok) {
        throw new Error('Failed to load payment methods')
      }

      const data = await res.json()
      setPaymentMethods(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPaymentMethod = async (paymentMethodId, setAsDefault) => {
    try {
      setProcessingAction('adding')
      
      const res = await fetch(`${API_BASE}/api/saved-payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          paymentMethodId,
          setAsDefault
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to add payment method')
      }

      await fetchPaymentMethods()
      setShowAddForm(false)
      setProcessingAction(null)
      
      return { success: true }
    } catch (err) {
      setProcessingAction(null)
      return { success: false, error: err.message }
    }
  }

  const handleSetDefault = async (paymentMethodId) => {
    try {
      setProcessingAction(`default-${paymentMethodId}`)
      
      const res = await fetch(
        `${API_BASE}/api/saved-payment-methods/${paymentMethodId}/set-default?userId=${userId}`,
        { method: 'PUT' }
      )

      if (!res.ok) {
        throw new Error('Failed to set default payment method')
      }

      await fetchPaymentMethods()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingAction(null)
    }
  }

  const handleDelete = async (paymentMethodId) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return
    }

    try {
      setProcessingAction(`delete-${paymentMethodId}`)
      
      const res = await fetch(
        `${API_BASE}/api/saved-payment-methods/${paymentMethodId}?userId=${userId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        throw new Error('Failed to delete payment method')
      }

      await fetchPaymentMethods()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingAction(null)
    }
  }

  const handleUpdateNickname = async (paymentMethodId, nickname) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/saved-payment-methods/${paymentMethodId}/nickname?userId=${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname })
        }
      )

      if (!res.ok) {
        throw new Error('Failed to update nickname')
      }

      await fetchPaymentMethods()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!userId) {
    return (
      <div className="my-payments-page">
        <div className="payments-container">
          <h1 className="page-title">My Payment Methods</h1>
          <div className="error-message">
            Please log in to manage your payment methods.
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="my-payments-page">
        <div className="payments-container">
          <h1 className="page-title">My Payment Methods</h1>
          <div className="loading-message">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-payments-page">
      <div className="payments-container">
        <h1 className="page-title">My Payment Methods</h1>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Saved Cards Section */}
        <div className="payment-section">
          <h2 className="section-title">
            Saved Cards ({paymentMethods.length})
          </h2>
          <div className="section-divider"></div>

          {paymentMethods.length === 0 && !showAddForm ? (
            <div className="empty-section">
              <p>No saved payment methods yet.</p>
            </div>
          ) : (
            <div className="payment-cards-list">
              {paymentMethods.map((method) => (
                <SavedPaymentMethodCard
                  key={method.id}
                  paymentMethod={method}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                  onUpdateNickname={handleUpdateNickname}
                  processing={processingAction}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add New Card */}
        {showAddForm ? (
          <div className="add-card-section">
            <div className="add-card-header">
              <h3>Add New Card</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
                disabled={processingAction === 'adding'}
              >
                ✕
              </button>
            </div>
            
            <Elements stripe={stripePromise}>
              <AddPaymentMethodForm
                onSubmit={handleAddPaymentMethod}
                processing={processingAction === 'adding'}
                isFirstCard={paymentMethods.length === 0}
              />
            </Elements>
          </div>
        ) : (
          <button 
            className="add-card-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add Payment Method
          </button>
        )}
      </div>
    </div>
  )
}

export default MyPaymentsPage