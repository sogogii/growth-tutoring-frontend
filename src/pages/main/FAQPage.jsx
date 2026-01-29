import { useState } from 'react'
import './styles/FAQPage.css'

const FAQ_DATA = [
  {
    category: 'General / About Growth Tutoring',
    questions: [
      {
        question: 'What is Growth Tutoring?',
        answer: 'Growth Tutoring is an online marketplace that connects students with qualified tutors across various subjects. We provide a platform for scheduling sessions, secure messaging, and safe payment processing, making it easy to find the perfect tutor for your learning needs.'
      },
      {
        question: 'How does Growth Tutoring work?',
        answer: 'Students can browse tutor profiles, view ratings and reviews, and send session requests to tutors they like. Once a tutor accepts, you can message them, schedule your session, and make payment securely through our platform. After the session, both parties can leave reviews to help build trust in our community.'
      },
      {
        question: 'Is Growth Tutoring available in my area?',
        answer: 'Growth Tutoring serves students nationwide! We offer both online and in-person tutoring options. For online sessions, you can connect with tutors from anywhere. For in-person tutoring, availability depends on tutors in your local area.'
      },
      {
        question: 'What subjects and grade levels do you support?',
        answer: 'We support K-12 subjects including Math, English, Science (Physics, Chemistry, Biology), Foreign Languages, and more. We also offer specialized services like Special Needs Tutoring and Pre-College Counseling. Our tutors work with students from elementary school through college level.'
      }
    ]
  },
  {
    category: 'For Students',
    questions: [
      {
        question: 'How do I find a tutor?',
        answer: 'After creating your account, use our search and filter tools to find tutors by subject, hourly rate, rating, and availability. You can view detailed profiles including education, experience, reviews, and teaching style to find the perfect match.'
      },
      {
        question: 'How do I book a tutoring session?',
        answer: 'Once you find a tutor you like, click "Request Session" on their profile. Fill out the session details including subject, date, time, duration, and session type (online or in-person). The tutor will review your request and either accept or decline it.'
      },
      {
        question: 'Can I message a tutor before booking?',
        answer: 'Yes! Our platform includes a built-in messaging system. You can send messages to tutors to ask questions about their teaching style, availability, or specific topics before sending a session request.'
      },
      {
        question: 'What if I need to cancel or reschedule a session?',
        answer: 'If you need to cancel or reschedule, please contact your tutor through our messaging system as soon as possible. Cancellation policies may vary by tutor, so we recommend discussing this during your initial conversation. For refund information, please see our payment policies below.'
      },
      {
        question: 'How do I know if a tutor is qualified?',
        answer: 'All tutor profiles include verified education credentials, subject expertise, teaching experience, and student reviews. We encourage tutors to undergo our verification process, which includes education verification and background checks. Look for the "Verified" badge on tutor profiles.'
      },
      {
        question: 'Can I see reviews from other students?',
        answer: 'Yes! Each tutor profile displays ratings and written reviews from previous students. Reviews include ratings for communication, knowledge, teaching ability, and overall experience. This helps you make an informed decision when choosing a tutor.'
      },
      {
        question: 'What happens if I\'m not satisfied with a session?',
        answer: 'Your satisfaction is important to us. If you have concerns about a session, please contact us at support@growthtutoring.org within 48 hours of the session. We will review your concern and work to find a fair resolution, which may include a partial or full refund.'
      },
      {
        question: 'Are sessions online or in-person?',
        answer: 'Both! When requesting a session, you can choose between online or in-person tutoring. Online sessions typically use video conferencing platforms like Zoom or Google Meet. In-person sessions take place at a mutually agreed-upon location (library, coffee shop, student\'s home, etc.).'
      }
    ]
  },
  {
    category: 'For Tutors',
    questions: [
      {
        question: 'How do I become a tutor on Growth Tutoring?',
        answer: 'Click "Become a Tutor" to create your tutor account. Complete your profile with education, subjects you teach, teaching experience, and set your hourly rate (up to $150/hour). Upload verification documents like diplomas or transcripts to build trust with students. Once approved, you can start receiving session requests!'
      },
      {
        question: 'How do I set my availability?',
        answer: 'In your tutor dashboard, navigate to the "Availability" section where you can set your weekly schedule. Mark which days and times you\'re available for sessions. You can update this anytime, and students will only see your available time slots when requesting sessions.'
      },
      {
        question: 'How do I set my hourly rate?',
        answer: 'When creating your profile, you can set your hourly rate based on your experience and subject expertise. Rates are capped at $150/hour. You can adjust your rate at any time from your profile settings. We recommend researching similar tutors to price competitively.'
      },
      {
        question: 'How do I get paid?',
        answer: 'When a student books a session, payment is processed through our secure platform using Stripe. After the session is completed, funds are transferred to your account minus the platform commission. Currently, payouts are processed manually - we will contact you to arrange payment transfer.'
      },
      {
        question: 'When do I receive payment after a session?',
        answer: 'Payments are processed after each completed session. Our team manually processes payouts on a regular schedule. You will receive an email notification when your payment is ready for transfer. We are working on automated payout features for future releases.'
      },
      {
        question: 'What happens if a student cancels?',
        answer: 'If a student cancels before payment is processed, the session request is simply removed and no payment is charged. If payment was already processed, refund policies apply based on timing and circumstances. Please communicate with students through our messaging system to clarify any cancellation concerns.'
      },
      {
        question: 'How does the review system work?',
        answer: 'After each session, both students and tutors can leave reviews. Students rate tutors on communication, knowledge, teaching ability, and overall experience. These reviews appear on your profile and help build your reputation. Maintaining high ratings helps attract more students!'
      },
      {
        question: 'Can I offer both online and in-person sessions?',
        answer: 'Yes! You can specify your preferences in your profile. When students send session requests, they indicate whether they want online or in-person tutoring. You can accept requests based on your preference and availability for each session type.'
      }
    ]
  },
  {
    category: 'Payments & Fees',
    questions: [
      {
        question: 'How much does Growth Tutoring cost?',
        answer: 'Costs vary by tutor and their hourly rates (up to $150/hour). In addition to the tutor\'s rate, Growth Tutoring charges a small platform fee to maintain and improve our services. The total cost is clearly displayed before you confirm any session request.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. All payment information is encrypted and securely stored.'
      },
      {
        question: 'When am I charged for a session?',
        answer: 'When you send a session request, we authorize your payment method to ensure funds are available. However, you are only charged once the tutor accepts your session request. If the tutor declines, no charge is made to your card.'
      },
      {
        question: 'What is your cancellation/refund policy?',
        answer: 'Cancellation and refund policies depend on the timing and circumstances. If you cancel before the tutor accepts, no charge is made. For cancellations after acceptance, please contact us at support@growthtutoring.org within 48 hours of the session. We review each case individually to determine appropriate refunds.'
      },
      {
        question: 'What fees does Growth Tutoring charge?',
        answer: 'Growth Tutoring charges a commission on each session to maintain the platform and provide excellent service. For the first three sessions between any student-tutor pair, we charge 30%. After that, the commission is 20% for online sessions and 15% for in-person sessions. Additionally, there is a $5 platform fee per session.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use Stripe, a leading payment processor trusted by millions of businesses worldwide. All payment data is encrypted with industry-standard SSL/TLS protocols. We never store your full credit card information on our servers - Stripe handles all sensitive payment data securely.'
      },
      {
        question: 'How do refunds work?',
        answer: 'If a refund is approved, it will be processed back to your original payment method within 5-10 business days. The exact timing depends on your bank or card issuer. You will receive an email confirmation when the refund is processed. For questions about refunds, contact support@growthtutoring.org.'
      }
    ]
  },
  {
    category: 'Account & Technical',
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign Up" in the top right corner and choose whether you want to register as a Student or Tutor. Fill out the registration form with your basic information. You\'ll receive a verification email - click the link to activate your account and start using Growth Tutoring!'
      },
      {
        question: 'I didn\'t receive my verification email. What should I do?',
        answer: 'First, check your spam or junk folder. If you still don\'t see it, log into your account and click "Resend Verification Email" on the dashboard. If you continue having issues, contact us at support@growthtutoring.org and we\'ll help activate your account manually.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'On the login page, click "Forgot Password?" Enter your email address and we\'ll send you a password reset link. Click the link and follow the instructions to create a new password. If you don\'t receive the email, check your spam folder or contact support.'
      },
      {
        question: 'Can I update my profile information?',
        answer: 'Yes! Log into your account and go to your Profile Settings. You can update your name, email, profile picture, education, subjects (for tutors), bio, and other information at any time. Changes are saved immediately and reflected across the platform.'
      },
      {
        question: 'How does the messaging system work?',
        answer: 'Our built-in messaging system allows students and tutors to communicate directly. Access your messages from the navigation menu. You can send text messages, discuss session details, and coordinate schedules. All conversations are saved and searchable for your convenience.'
      },
      {
        question: 'Is my personal information safe?',
        answer: 'Yes. We take privacy seriously and protect your personal information with industry-standard security measures. We never share your email, phone number, or payment information with third parties without your consent. For more details, please read our Privacy Policy.'
      }
    ]
  }
]

function FAQPage() {
  const [openItems, setOpenItems] = useState({})

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="faq-hero">
        <div className="faq-hero-content">
          <h1 className="faq-hero-title">Frequently Asked Questions</h1>
          <p className="faq-hero-subtitle">
            Find answers to common questions about Growth Tutoring
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="faq-container">

        {/* FAQ Categories */}
        {FAQ_DATA.map((category, categoryIndex) => (
          <section key={categoryIndex} className="faq-category">
            <div className="faq-category-header">
              <h2 className="faq-category-title">{category.category}</h2>
              <div className="faq-category-line"></div>
            </div>

            <div className="faq-questions">
              {category.questions.map((item, questionIndex) => {
                const isOpen = openItems[`${categoryIndex}-${questionIndex}`]
                return (
                  <div key={questionIndex} className="faq-item">
                    <button
                      className={`faq-question ${isOpen ? 'active' : ''}`}
                      onClick={() => toggleItem(categoryIndex, questionIndex)}
                    >
                      <span>{item.question}</span>
                      <svg
                        className={`faq-icon ${isOpen ? 'rotate' : ''}`}
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* Bottom Contact Section */}
        <section className="faq-bottom-section">
          <h3 className="faq-bottom-title">Still have questions?</h3>
          <p className="faq-bottom-text">
            Our support team is here to help! Reach out to us at <a href="mailto:support@growthtutoring.org">support@growthtutoring.org</a> and we'll get back to you as soon as possible.
          </p>
        </section>

      </div>
    </div>
  )
}

export default FAQPage