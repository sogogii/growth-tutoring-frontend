import { useState } from 'react'
import './styles/SavedPaymentMethodCard.css'

const cardIcons = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
  discover: '💳',
  default: '💳'
}

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

  return (
    <div className={`payment-method-card ${paymentMethod.isDefault ? 'default' : ''}`}>
      {/* Left Side - Card Info */}
      <div className="card-info-section">
        <div className="card-brand">
          <span className="card-icon">
            {cardIcons[paymentMethod.cardBrand] || cardIcons.default}
          </span>
          <span className="brand-name">
            {paymentMethod.cardBrand.charAt(0).toUpperCase() + 
             paymentMethod.cardBrand.slice(1)}
          </span>
        </div>

        <div className="card-details">
          <div className="card-number">
            •••• •••• •••• {paymentMethod.cardLast4}
          </div>
          <div className="card-expiry">
            Expires {String(paymentMethod.cardExpMonth).padStart(2, '0')}/{paymentMethod.cardExpYear}
          </div>
        </div>
      </div>

      {/* Middle - Nickname */}
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
              <button className="save-btn" onClick={handleSaveNickname}>
                Save
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="nickname-display">
            {paymentMethod.nickname ? (
              <span className="nickname-text">"{paymentMethod.nickname}"</span>
            ) : (
              <span className="nickname-placeholder">No nickname</span>
            )}
            <button 
              className="edit-nickname-btn"
              onClick={() => setIsEditingNickname(true)}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Right Side - Actions */}
      <div className="card-actions">
        {paymentMethod.isDefault ? (
          <span className="default-badge">Default</span>
        ) : (
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
  )
}

export default SavedPaymentMethodCard