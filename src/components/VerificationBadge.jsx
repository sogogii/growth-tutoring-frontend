import './styles/VerificationBadge.css';

const TIER_CONFIG = {
  TIER_1: {
    count: 1,
    color: '#3b82f6',
    label: 'ID Verified',
    description: 'Basic identity verification completed',
  },
  TIER_2: {
    count: 2,
    color: '#3b82f6',  
    label: 'Background Checked',
    description: 'Complete background check passed',
  },
  TIER_3: {
    count: 3,
    color: '#3b82f6',  
    label: 'Premium Verified',
    description: 'Enhanced verification with credentials confirmed',
  },
};

function CheckIcon({ color }) {
  return (
    <svg
      className="verification-check-icon"
      viewBox="0 0 26 26"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="13" cy="13" r="11" fill={color} stroke="white" strokeWidth="2.5" />
      <path
        d="M7 13 L11 17 L19 9"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VerificationBadge({ tier }) {
  if (!tier) return null;

  const config = TIER_CONFIG[tier] || TIER_CONFIG.TIER_1;

  return (
    <div className="verification-badge-wrapper">
      <div className="verification-checks">
        {Array.from({ length: config.count }).map((_, i) => (
          <span
            key={i}
            className="verification-check-slot"
            style={{ zIndex: config.count - i, marginLeft: i === 0 ? 0 : '-9px' }}
          >
            <CheckIcon color={config.color} />
          </span>
        ))}
      </div>

      <div className="verification-tooltip">
        <div className="verification-tooltip-title">{config.label}</div>
        <div className="verification-tooltip-description">{config.description}</div>
        <div className="verification-tooltip-arrow" />
      </div>
    </div>
  );
}

export default VerificationBadge;