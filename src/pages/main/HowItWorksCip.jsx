import { Link } from 'react-router-dom'
import './styles/HowItWorksPage.css'

function HowItWorksCip() {
  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="how-hero-section how-hero-cip">
        <div className="how-hero-overlay">
          <h1 className="how-hero-title">
            COMMUNITY IMPACT <span className="how-hero-highlight">PROGRAM</span>
          </h1>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="how-content-section">
        <div className="how-content-container">
          <h2 className="how-subtitle">Quality Education for Everyone.</h2>
          <p className="how-description">
            The Community Impact Program provides grant-supported tutoring and mentoring for students who qualify. We believe every student deserves access to quality education, regardless of financial circumstances. Here's how it works:
          </p>
          
          {/* Step 1 */}
          <div className="how-step-section">
            <div className="how-step-number-large">1</div>
            <h3 className="how-step-title-large">Apply for the Program</h3>
            <p className="how-step-description-large">
              Complete our simple application form and provide documentation of financial need. We review applications on a rolling basis and respond quickly to help students get started.
            </p>
            <p className="how-step-description-large">
              Our team is here to help you through the process. We understand that every family's situation is unique, and we're committed to making quality tutoring accessible to all who need it.
            </p>
            
            {/* Application checklist */}
            <div className="how-checklist">
              <div className="how-checklist-item">
                <div className="how-checklist-icon">✓</div>
                <div className="how-checklist-text">Complete online application form</div>
              </div>
              <div className="how-checklist-item">
                <div className="how-checklist-icon">✓</div>
                <div className="how-checklist-text">Submit proof of financial need</div>
              </div>
              <div className="how-checklist-item">
                <div className="how-checklist-icon">✓</div>
                <div className="how-checklist-text">Share your learning goals</div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="how-step-section">
            <div className="how-step-number-large">2</div>
            <h3 className="how-step-title-large">Get Approved</h3>
            <p className="how-step-description-large">
              Once your application is reviewed and approved, you'll gain full access to our network of dedicated tutors who volunteer their time and expertise for the Community Impact Program.
            </p>
            <p className="how-step-description-large">
              We'll match you with a tutor who specializes in the subjects you need help with and fits your schedule. All of our CIP tutors are experienced educators committed to making a difference.
            </p>
            
            {/* Approval notification */}
            <div className="how-approval-mockup">
              <div className="how-approval-header">
                <div className="how-approval-icon">🎉</div>
                <h4>Congratulations!</h4>
              </div>
              <p>You've been accepted into the Community Impact Program. We're excited to support your learning journey!</p>
              <div className="how-approval-next">
                <strong>Next Steps:</strong> We'll connect you with a tutor within 48 hours.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="how-step-section">
            <div className="how-step-number-large">3</div>
            <h3 className="how-step-title-large">Start Your Journey</h3>
            <p className="how-step-description-large">
              Connect with your assigned tutor and begin your learning journey. Meet regularly for one-on-one sessions, work on your goals, and build confidence in your abilities.
            </p>
            <p className="how-step-description-large">
              You'll have the full support of Growth Tutoring throughout your time in the program. Track your progress, celebrate your achievements, and reach your academic potential.
            </p>
          </div>

          {/* Program Benefits */}
          <div className="how-benefits-section">
            <h3 className="how-benefits-title">What's included in the Community Impact Program</h3>
            
            <div className="how-benefits-grid">
              <div className="how-benefit-card">
                <div className="how-benefit-icon">🆓</div>
                <h4 className="how-benefit-title">FREE TUTORING.</h4>
                <p className="how-benefit-text">Access to quality tutors at no cost through our grant program.</p>
              </div>
              
              <div className="how-benefit-card">
                <div className="how-benefit-icon">👨‍🏫</div>
                <h4 className="how-benefit-title">EXPERT TUTORS.</h4>
                <p className="how-benefit-text">Work with experienced educators dedicated to your success.</p>
              </div>
              
              <div className="how-benefit-card">
                <div className="how-benefit-icon">💪</div>
                <h4 className="how-benefit-title">ONGOING SUPPORT.</h4>
                <p className="how-benefit-text">Continuous access to resources and academic guidance.</p>
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div className="how-eligibility-section">
            <h3 className="how-eligibility-title">Who qualifies?</h3>
            <p className="how-eligibility-text">
              The Community Impact Program is designed for students and families facing financial hardship. If you're unsure whether you qualify, we encourage you to apply. Our team reviews each application individually and works to support as many students as possible.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="how-guarantee-section">
            <div className="how-guarantee-badge">
              <div className="how-guarantee-icon">💫</div>
            </div>
            <h3 className="how-guarantee-title">Education is a right, not a privilege.</h3>
            <p className="how-guarantee-text">
              We're committed to breaking down barriers and ensuring every student has the opportunity to succeed.
            </p>
          </div>

          {/* CTA Button */}
          <div className="how-cta-section">
            <Link to="/contact" className="how-cta-button">
              Apply to CIP
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HowItWorksCip