import { Link } from 'react-router-dom'
import './styles/HowItWorksPage.css'

function HowItWorksTutors() {
  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="how-hero-section how-hero-tutors">
        <div className="how-hero-overlay">
          <h1 className="how-hero-title">
            SHARE YOUR <span className="how-hero-highlight">EXPERTISE</span>
          </h1>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="how-content-section">
        <div className="how-content-container">
          <h2 className="how-subtitle">Three Steps. Start Teaching Today.</h2>
          <p className="how-description">
            Growth Tutoring connects passionate educators with students who need your help. Build your tutoring business, set your own rates, and make a real difference in students' lives. Here's how it works:
          </p>
          
          {/* Step 1 */}
          <div className="how-step-section">
            <div className="how-step-number-large">1</div>
            <h3 className="how-step-title-large">Create Your Profile</h3>
            <p className="how-step-description-large">
              Sign up and create a professional profile showcasing your expertise, teaching style, and qualifications. Set your hourly rate and specify the subjects you're passionate about teaching.
            </p>
            <p className="how-step-description-large">
              Upload your credentials, share your teaching philosophy, and let students know what makes you unique. Your profile is your chance to shine and attract the right students.
            </p>
            
            {/* Profile preview */}
            <div className="how-profile-preview">
              <div className="how-profile-header">
                <div className="how-profile-avatar-large">YOU</div>
                <div className="how-profile-details">
                  <h4>Your Name</h4>
                  <div className="how-profile-subjects">Mathematics • Physics • Chemistry</div>
                  <div className="how-profile-rate">$45/hour</div>
                </div>
              </div>
              <div className="how-profile-bio">
                "I have 5+ years of experience helping students excel in STEM subjects. My teaching style is patient, clear, and focused on building confidence..."
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="how-step-section">
            <div className="how-step-number-large">2</div>
            <h3 className="how-step-title-large">Get Matched With Students</h3>
            <p className="how-step-description-large">
              Students searching for tutors in your subjects will find your profile. You'll receive booking requests from learners who are excited to work with you.
            </p>
            <p className="how-step-description-large">
              Communicate with potential students through our secure messaging system. Discuss their goals, answer questions, and schedule your first session—all within our platform.
            </p>
            
            {/* Notification mockup */}
            <div className="how-notification-mockup">
              <div className="how-notification">
                <div className="how-notification-icon">📬</div>
                <div className="how-notification-content">
                  <strong>New booking request!</strong>
                  <p>Sarah M. wants to book a calculus session this Friday at 4 PM</p>
                </div>
              </div>
              <div className="how-notification">
                <div className="how-notification-icon">💬</div>
                <div className="how-notification-content">
                  <strong>New message</strong>
                  <p>Alex K.: "Can you help me prepare for my chemistry exam?"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="how-step-section">
            <div className="how-step-number-large">3</div>
            <h3 className="how-step-title-large">Teach and Earn</h3>
            <p className="how-step-description-large">
              Conduct your sessions online or in-person—whatever works best for you and your students. Use your preferred teaching methods and materials to help students succeed.
            </p>
            <p className="how-step-description-large">
              Growth Tutoring handles all payment processing securely. Get paid after each session, track your earnings, and watch your tutoring business grow. Focus on teaching while we handle the rest.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="how-benefits-section">
            <h3 className="how-benefits-title">Join our community of professional educators.</h3>
            
            <div className="how-benefits-grid">
              <div className="how-benefit-card">
                <div className="how-benefit-icon">💰</div>
                <h4 className="how-benefit-title">SET YOUR OWN RATES.</h4>
                <p className="how-benefit-text">You decide what your time is worth. Keep 85% of what you earn.</p>
              </div>
              
              <div className="how-benefit-card">
                <div className="how-benefit-icon">📅</div>
                <h4 className="how-benefit-title">FLEXIBLE SCHEDULE.</h4>
                <p className="how-benefit-text">Work when you want, where you want. You're in control.</p>
              </div>
              
              <div className="how-benefit-card">
                <div className="how-benefit-icon">🎓</div>
                <h4 className="how-benefit-title">MAKE AN IMPACT.</h4>
                <p className="how-benefit-text">Help students achieve their goals and build lasting success.</p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="how-guarantee-section">
            <div className="how-guarantee-badge">
              <div className="how-guarantee-icon">✓</div>
            </div>
            <h3 className="how-guarantee-title">We're here to support you.</h3>
            <p className="how-guarantee-text">
              Get access to our tutor support team, secure payment processing, and tools to help you succeed.
            </p>
          </div>

          {/* CTA Button */}
          <div className="how-cta-section">
            <Link to="/signup/tutor" className="how-cta-button">
              Become a Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HowItWorksTutors