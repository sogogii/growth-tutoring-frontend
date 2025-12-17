import './styles/VerificationBadge.css';

function VerificationBadge({ tier }) {
  if (!tier) return null;
  
  const tierConfig = {
    TIER_1: {
      number: '1',
      label: 'ID Verified',
      description: 'Basic identity verification completed',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#93c5fd'
    },
    TIER_2: {
      number: '2',
      label: 'Background Checked',
      description: 'Complete background check passed',
      color: '#10b981',
      bgColor: '#d1fae5',
      borderColor: '#6ee7b7'
    },
    TIER_3: {
      number: '3',
      label: 'Premium Verified',
      description: 'Enhanced verification with credentials confirmed',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      borderColor: '#c4b5fd'
    }
  };
  
  const config = tierConfig[tier] || tierConfig.TIER_1;
  
  return (
    <div className="verification-badge-wrapper">
      <span 
        className="verification-badge"
        style={{
          color: config.color,
          backgroundColor: config.bgColor,
          border: `2px solid ${config.borderColor}`
        }}
      >
        {config.number}
      </span>
      
      <div className="verification-tooltip">
        <div className="verification-tooltip-title">
          {config.label}
        </div>
        <div className="verification-tooltip-description">
          {config.description}
        </div>
        <div className="verification-tooltip-arrow" />
      </div>
    </div>
  );
}

export default VerificationBadge;