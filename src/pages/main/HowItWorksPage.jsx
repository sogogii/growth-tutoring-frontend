import { useParams } from 'react-router-dom'
import './styles/HowItWorksPage.css'

function HowItWorksPage() {
  const { variant } = useParams()
  
  // Default to 'students' if no variant specified
  const pageType = variant || 'students'
  
  const getContent = () => {
    switch(pageType) {
      case 'students':
        return {
          heroTitle: 'FIND YOUR PERFECT',
          heroHighlight: 'TUTOR',
          subtitle: 'Three Steps. One Perfect Match.',
          description: 'Growth Tutoring is the best way to find quality tutoring. No matter what subject you need help with, we\'ll help you find, book sessions and stay in touch with the perfect tutor. You can spend more time learning, and we\'ll handle the rest. Here\'s how it works:',
          steps: [
            {
              number: '1',
              title: 'Tell us what you need',
              description: 'Share your learning goals, subject, and availability. We\'ll match you with qualified tutors who fit your needs.'
            },
            {
              number: '2',
              title: 'Review and choose',
              description: 'Browse tutor profiles, read reviews, and compare rates. Book a session with the tutor that\'s right for you.'
            },
            {
              number: '3',
              title: 'Start learning',
              description: 'Meet with your tutor online or in-person. Track your progress and achieve your academic goals.'
            }
          ]
        }
      case 'tutors':
        return {
          heroTitle: 'SHARE YOUR',
          heroHighlight: 'EXPERTISE',
          subtitle: 'Three Steps. Start Teaching Today.',
          description: 'Growth Tutoring connects passionate educators with students who need your help. Build your tutoring business, set your own rates, and make a real difference in students\' lives. Here\'s how it works:',
          steps: [
            {
              number: '1',
              title: 'Create your profile',
              description: 'Sign up and tell us about your expertise, teaching style, and availability. Set your hourly rate and preferred subjects.'
            },
            {
              number: '2',
              title: 'Get matched with students',
              description: 'Students will find you through our platform. Receive booking requests and connect with learners who need your skills.'
            },
            {
              number: '3',
              title: 'Teach and earn',
              description: 'Conduct sessions, track your students\' progress, and get paid for making a difference in their education.'
            }
          ]
        }
      case 'cip':
        return {
          heroTitle: 'COMMUNITY IMPACT',
          heroHighlight: 'PROGRAM',
          subtitle: 'Quality Education for Everyone.',
          description: 'The Community Impact Program provides grant-supported tutoring and mentoring for students who qualify. We believe every student deserves access to quality education, regardless of financial circumstances. Here\'s how it works:',
          steps: [
            {
              number: '1',
              title: 'Apply for the program',
              description: 'Submit your application and provide documentation of financial need. Our team reviews applications on a rolling basis.'
            },
            {
              number: '2',
              title: 'Get approved',
              description: 'Once approved, you\'ll gain access to our network of dedicated tutors who volunteer their time for the program.'
            },
            {
              number: '3',
              title: 'Start your journey',
              description: 'Connect with your assigned tutor and begin your learning journey with full support from Growth Tutoring.'
            }
          ]
        }
      default:
        return getContent() // Return students content as default
    }
  }
  
  const content = getContent()
  
  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="how-hero-section">
        <div className="how-hero-overlay">
          <h1 className="how-hero-title">
            {content.heroTitle} <span className="how-hero-highlight">{content.heroHighlight}</span>
          </h1>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="how-content-section">
        <div className="how-content-container">
          <h2 className="how-subtitle">{content.subtitle}</h2>
          <p className="how-description">{content.description}</p>
          
          {/* Steps */}
          <div className="how-steps">
            {content.steps.map((step) => (
              <div key={step.number} className="how-step-card">
                <div className="how-step-number">{step.number}</div>
                <h3 className="how-step-title">{step.title}</h3>
                <p className="how-step-description">{step.description}</p>
              </div>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="how-cta-section">
            <a href="/signup" className="how-cta-button">
              {pageType === 'tutors' ? 'Become a Tutor' : 
               pageType === 'cip' ? 'Apply Now' : 
               'Find a Tutor'}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HowItWorksPage