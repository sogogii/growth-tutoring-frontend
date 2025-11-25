import { useNavigate } from 'react-router-dom'
import './styles/SignupPage.css' 

function SignupChoicePage() {
  const navigate = useNavigate()

  return (
    <div className="signup-choice-page">
      <h1>Create your account</h1>
      <p className="signup-choice-subtitle">
        Choose how you want to use Growth Tutoring.
      </p>

      <div className="signup-choice-grid">
        <button
          type="button"
          className="signup-choice-card tutor-card"
          onClick={() => navigate('/signup/tutor')}
        >
          <h2>Sign up as Tutor</h2>
          <p>
            Create a tutor profile, set your subjects, and start helping
            students grow.
          </p>
        </button>

        <button
          type="button"
          className="signup-choice-card student-card"
          onClick={() => navigate('/signup/student')}
        >
          <h2>Sign up as Student</h2>
          <p>
            Find the right tutor, track your learning, and reach your goals
            faster.
          </p>
        </button>
      </div>
    </div>
  )
}

export default SignupChoicePage
