import { Link } from 'react-router-dom'
import './styles/HowItWorksPage.css'

function HowItWorksStudents() {
  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="how-hero-section how-hero-students">
        <div className="how-hero-overlay">
          <h1 className="how-hero-title">
            FIND YOUR <span className="how-hero-highlight">PERFECT TUTOR</span>
          </h1>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="how-content-section">
        <div className="how-content-container">
          <h2 className="how-subtitle">Three Steps. One Perfect Tutor.</h2>
          <p className="how-description">
            Growth Tutoring is the best way to learn anything. No matter what you're interested in, we'll help you find, book sessions and stay in touch with the perfect tutor. You can spend more time learning, and we'll handle the rest. Here's how it works:
          </p>
          
          {/* Step 1 */}
          <div className="how-step-section">
            <div className="how-step-number-large">1</div>
            <h3 className="how-step-title-large">Pick Your Tutor</h3>
            <p className="how-step-description-large">
              Use Growth Tutoring's tutor search tools to find the tutors that best meet your unique needs. We've vetted each of your options and only show you the best tutors for your search.
            </p>
            <p className="how-step-description-large">
              From there, check their credentials, read what other students are saying about them, and see if they've had a background check or request one.
            </p>
            
            {/* Sample tutor cards */}
            <div className="how-tutor-showcase">
              <div className="how-tutor-sample-card">
                <div className="how-tutor-avatar">A</div>
                <div className="how-tutor-info">
                  <div className="how-tutor-name">Alex K.</div>
                  <div className="how-tutor-rating">★★★★★ (127)</div>
                  <div className="how-tutor-price">$45/hr</div>
                </div>
              </div>
              <div className="how-tutor-sample-card">
                <div className="how-tutor-avatar">S</div>
                <div className="how-tutor-info">
                  <div className="how-tutor-name">Sarah M.</div>
                  <div className="how-tutor-rating">★★★★★ (89)</div>
                  <div className="how-tutor-price">$50/hr</div>
                </div>
              </div>
              <div className="how-tutor-sample-card">
                <div className="how-tutor-avatar">J</div>
                <div className="how-tutor-info">
                  <div className="how-tutor-name">James L.</div>
                  <div className="how-tutor-rating">★★★★★ (156)</div>
                  <div className="how-tutor-price">$40/hr</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="how-step-section">
            <div className="how-step-number-large">2</div>
            <h3 className="how-step-title-large">Chat With Your Tutor</h3>
            <p className="how-step-description-large">
              When you find a tutor you'd like to work with, send them a message right here on our site. Messaging is easy and instant no matter which route you decide to take.
            </p>
            
            {/* Chat mockup */}
            <div className="how-chat-mockup">
              <div className="how-chat-message received">
                <div className="how-chat-avatar">T</div>
                <div className="how-chat-bubble">
                  <p>Hi! I'd love to help you with calculus. When would you like to schedule our first session?</p>
                  <span className="how-chat-time">2:45 PM</span>
                </div>
              </div>
              <div className="how-chat-message sent">
                <div className="how-chat-bubble">
                  <p>Great! How about this Friday at 4 PM?</p>
                  <span className="how-chat-time">2:47 PM</span>
                </div>
              </div>
              <div className="how-chat-message received">
                <div className="how-chat-avatar">T</div>
                <div className="how-chat-bubble">
                  <p>Perfect! I'll send you a calendar invite.</p>
                  <span className="how-chat-time">2:48 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="how-step-section">
            <div className="how-step-number-large">3</div>
            <h3 className="how-step-title-large">Book Your Lesson</h3>
            <p className="how-step-description-large">
              Found someone you want to work with? There's nothing left to do but book your first lesson. And, by the way, you either love your first lesson or the first hour is free thanks to our Good Fit Guarantee.
            </p>
            <p className="how-step-description-large">
              You can learn in-person from the comfort of a coffee shop or online in the comfort of your home. And payments are hassle-free. You only pay after you've had a lesson, and Growth Tutoring securely processes everything for you.
            </p>
          </div>

          {/* Learning Options */}
          <div className="how-learning-options">
            <p className="how-learning-text">
              In person and online 1-1 lessons are the best, most efficient way to reach your goals. Growth Tutoring fits any lifestyle by giving you complete control over your learning experience.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="how-benefits-section">
            <h3 className="how-benefits-title">Learn from the nation's largest community of professional tutors.</h3>
            
            <div className="how-benefits-grid">
              <div className="how-benefit-card">
                <div className="how-benefit-icon">👥</div>
                <h4 className="how-benefit-title">VETTED EXPERTS.</h4>
                <p className="how-benefit-text">More qualified tutors than anywhere else, ready to help.</p>
              </div>
              
              <div className="how-benefit-card">
                <div className="how-benefit-icon">🎯</div>
                <h4 className="how-benefit-title">THE RIGHT FIT.</h4>
                <p className="how-benefit-text">Find an expert who suits your needs and learning style.</p>
              </div>
              
              <div className="how-benefit-card">
                <div className="how-benefit-icon">📈</div>
                <h4 className="how-benefit-title">REAL RESULTS.</h4>
                <p className="how-benefit-text">Reach your goals faster with private, 1-to-1 lessons.</p>
              </div>
            </div>
          </div>

          {/* Good Fit Guarantee */}
          <div className="how-guarantee-section">
            <div className="how-guarantee-badge">
              <div className="how-guarantee-icon">✓</div>
            </div>
            <h3 className="how-guarantee-title">Find the right fit or it's free.</h3>
            <p className="how-guarantee-text">
              We guarantee you'll find the right tutor, or we'll cover the first hour of your lesson.
            </p>
          </div>

          {/* CTA Button */}
          <div className="how-cta-section">
            <Link to="/tutors" className="how-cta-button">
              Find Your Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HowItWorksStudents