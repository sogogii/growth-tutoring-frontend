import { useState } from 'react'
import './styles/SavedPaymentMethodCard.css'

function SavedPaymentMethodCard({
  paymentMethod,
  onSetDefault,
  onDelete,
  onUpdateNickname,
  processing
}) {
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nickname, setNickname] = useState(paymentMethod.nickname || '')

  const handleSaveNickname = () => {
    if (nickname.trim() !== paymentMethod.nickname) {
      onUpdateNickname(paymentMethod.id, nickname.trim() || null)
    }
    setIsEditingNickname(false)
  }

  const handleCancelEdit = () => {
    setNickname(paymentMethod.nickname || '')
    setIsEditingNickname(false)
  }

  const isProcessing = (action) => processing === `${action}-${paymentMethod.id}`

  const brandDisplay = paymentMethod.cardBrand.charAt(0).toUpperCase() +
    paymentMethod.cardBrand.slice(1)

  return (
    <div className={`payment-method-card ${paymentMethod.isDefault ? 'default' : ''}`}>
      <div className="card-top-bar" />

      <div className="card-body">
        {/* Header Row */}
        <div className="card-header-row">
          <div className="card-brand-row">

            <span className="brand-name">{brandDisplay}</span>
          </div>
          {paymentMethod.isDefault && (
            <span className="default-badge">✓ Default</span>
          )}
        </div>

        {/* Card Number */}
        <div className="card-number-row">
          <span className="card-dots">•••• •••• ••••</span>
          <span className="card-last4">{paymentMethod.cardLast4}</span>
        </div>
        <div className="card-expiry">
          Expires {String(paymentMethod.cardExpMonth).padStart(2, '0')}/{paymentMethod.cardExpYear}
        </div>

        {/* Nickname */}
        <div className="card-nickname-section">
          {isEditingNickname ? (
            <div className="nickname-edit">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g., Work Card, Personal"
                maxLength={50}
                autoFocus
              />
              <div className="nickname-actions">
                <button className="save-btn" onClick={handleSaveNickname}>Save</button>
                <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="nickname-display">
              {paymentMethod.nickname ? (
                <span className="nickname-text">"{paymentMethod.nickname}"</span>
              ) : (
                <span className="nickname-placeholder">No nickname</span>
              )}
              <button className="edit-nickname-btn" onClick={() => setIsEditingNickname(true)}>
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="card-divider" />

        {/* Actions */}
        <div className="card-actions">
          {!paymentMethod.isDefault && (
            <button
              className="action-btn set-default-btn"
              onClick={() => onSetDefault(paymentMethod.id)}
              disabled={isProcessing('default')}
            >
              {isProcessing('default') ? 'Setting...' : 'Set as Default'}
            </button>
          )}
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(paymentMethod.id)}
            disabled={isProcessing('delete')}
          >
            {isProcessing('delete') ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SavedPaymentMethodCard