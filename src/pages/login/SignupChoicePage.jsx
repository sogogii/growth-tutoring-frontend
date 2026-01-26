import { useNavigate } from 'react-router-dom'
import './styles/SignupPage.css' 

function SignupChoicePage() {
  const navigate = useNavigate()

  return (
    <div className="signup-choice-page">
      <div className="signup-choice-container">
        {/* Header */}
        <div className="signup-choice-header">
          <h1 className="signup-choice-title">Create your account</h1>
          <p className="signup-choice-subtitle">
            Choose how you want to use Growth Tutoring
          </p>
        </div>

        {/* Cards Grid */}
        <div className="signup-choice-grid">
          {/* Tutor Card */}
          <button
            type="button"
            className="signup-choice-card tutor-card"
            onClick={() => navigate('/signup/tutor')}
          >
            <div className="card-top">
              <div className="card-icon tutor-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
            </div>
            <div className="card-content">
              <h2 className="card-title">Sign up as Tutor</h2>
              <p className="card-description">
                Create a tutor profile, set your subjects, and start helping students grow.
              </p>
            </div>
            <div className="card-features">
              <span className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Set your own rates
              </span>
              <span className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Flexible schedule
              </span>
              <span className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Build your business
              </span>
            </div>
            <div className="card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </button>

          {/* Student Card */}
          <button
            type="button"
            className="signup-choice-card student-card"
            onClick={() => navigate('/signup/student')}
          >
            <div className="card-top">
              <div className="card-icon student-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
            </div>
            <div className="card-content">
              <h2 className="card-title">Sign up as Student</h2>
              <p className="card-description">
                Find the right tutor, track your learning, and reach your goals faster.
              </p>
            </div>
            <div className="card-features">
              <span className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Expert tutors
              </span>
              <span className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                All subjects
              </span>
              <span className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Track progress
              </span>
            </div>
            <div className="card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </button>
        </div>

        {/* Footer Link */}
        <div className="signup-choice-footer">
          <p>
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupChoicePage