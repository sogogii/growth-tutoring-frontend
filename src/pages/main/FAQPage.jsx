import { useState } from 'react'
import './styles/FAQPage.css'

const FAQ_DATA = [
  {
    category: 'General / About Growth Tutoring',
    questions: [
      {
        question: 'What is Growth Tutoring?',
        answer: (
          <>
            Growth Tutoring is an online marketplace that connects students with qualified tutors across various subjects. 
            We provide a platform for scheduling sessions, secure messaging, and safe payment processing, 
            making it easy to find the perfect tutor for your learning needs.
          </>
        )
      },
      {
        question: 'How does Growth Tutoring work?',
        answer: (
          <>
            Students can browse tutor profiles, view ratings and reviews, and send session requests to tutors they like. 
            Once a tutor accepts, you can message them, schedule your session, and make payment securely through our platform. 
            After the session, both parties can leave reviews to help build trust in our community.
          </>
        )
      },
      {
        question: 'Is Growth Tutoring available in my area?',
        answer: (
          <>
            Growth Tutoring serves students nationwide! We offer both online and in-person tutoring options. 
            For online sessions, you can connect with tutors from anywhere. 
            For in-person tutoring, availability depends on tutors in your local area.
          </>
        )
      },
      {
        question: 'What subjects and grade levels do you support?',
        answer: (
          <>
            We support K-12 subjects including Math, English, Science (Physics, Chemistry, Biology), Foreign Languages, and more. 
            We also offer specialized services like Special Needs Tutoring and Pre-College Counseling. 
            Our tutors work with students from elementary school through college level.
          </>
        )
      }
    ]
  },
  {
    category: 'For Students',
    questions: [
      {
        question: 'How do I find a tutor?',
        answer: (
          <>
            After creating your account, use our search and filter tools to find tutors by subject, hourly rate, rating, and availability. 
            You can view detailed profiles including education, experience, reviews, and teaching style to find the perfect match.
          </>
        )
      },
      {
        question: 'How do I book a tutoring session?',
        answer: (
          <>
            Once you find a tutor you like, click <strong>Book a Session</strong> on their profile. 
            Fill out the session details including subject, date, time, duration, and session type (online or in-person). 
            The tutor will review your request and either accept or decline it.
          </>
        )
      },
      {
        question: 'Can I message a tutor before booking?',
        answer: (
          <>
            Yes! Our platform includes a built-in messaging system. 
            You can send messages to tutors to ask questions about their teaching style, availability, or specific topics before sending a session request.
          </>
        )
      },
      {
        question: 'What if I need to cancel or reschedule a session?',
        answer: (
          <>
            We understand that schedules change! If you need to cancel, please contact your tutor through our messaging system as soon as possible. 
            If you cancel <strong>24 or more hours before your session</strong>, you'll receive a <strong>full refund (100%)</strong>. 
            If you cancel <strong>between 2-24 hours before your session</strong>, you'll receive a <strong>70% refund</strong> as a <strong>30% cancellation fee</strong> will apply. 
            If you cancel <strong>less than 2 hours before your session</strong>, unfortunately <strong>no refund will be provided</strong>. 
            The cancellation time is based on when you notify your tutor, not when they respond. 
            For rescheduling, please discuss directly with your tutor through our messaging system, keeping in mind that last-minute changes follow the same cancellation policy. 
            If your tutor cancels or doesn't show up, you'll automatically receive a full refund.
          </>
        )
      },
      {
        question: 'What happens after I book a session?',
        answer: (
          <>
            Once the tutor accepts your session request, you'll receive a confirmation email with all the details. 
            You can message your tutor to coordinate any specifics like online meeting links or in-person locations. 
            For online sessions, make sure you have a stable internet connection and any necessary software installed. 
          </>
        )
      },
      {
        question: 'What if I\'m not satisfied with a session?',
        answer: (
          <>
            We want you to have a great experience! If you're not satisfied with a session, please contact us at  
            <strong> info@growthtutoringhq.com</strong> or leave your feedback through our Contact Us page.
            Include details about what went wrong, and we'll review your case individually.
          </>
        )
      },
      {
        question: 'Can I have ongoing sessions with the same tutor?',
        answer: (
          <>
            Absolutely! Many students prefer consistent tutoring relationships. 
            Once you find a tutor you like, you can book multiple sessions and coordinate a regular schedule through our messaging system. 
            This helps build rapport and allows the tutor to better understand your learning needs over time.
          </>
        )
      }
    ]
  },
  {
    category: 'For Tutors',
    questions: [
      {
        question: 'How do I become a tutor on Growth Tutoring?',
        answer: (
          <>
            Click <strong>Sign Up</strong> and select <strong>Tutor</strong> as your account type. 
            Complete your profile with your education, experience, subjects you teach, hourly rate (up to $150), and teaching style. 
            After signing up, your account status will be set to <strong>Pending</strong>. You’ll be able to log in, but your profile will not appear on our website yet.
            Our team carefully reviews each tutor application and conducts an interview. 
            Once approved, your account will be activated and your profile will be published, allowing you to start receiving session requests from students.
          </>
        )
      },
      {
        question: 'How do I get paid?',
        answer: (
          <>
            After you complete a tutoring session, we manually process tutor payments.
            Your earnings (minus the platform commission) are sent to your bank account by our team.
            Transfers typically take 5–7 business days, depending on your bank.
          </>
        )
      },
      {
        question: 'What commission does Growth Tutoring charge?',
        answer: (
          <>
            Growth Tutoring charges a <strong>15% commission for in-person sessions</strong> and a 
            <strong> 20% commission for online sessions</strong>.
            For the first three sessions with a new student, an additional 
            <strong> 10–15% onboarding commission</strong> applies.
            This initial adjustment supports student matching, tutor review, and platform setup.
            After the first three sessions, only the standard commission rate applies.
          </>
        )
      },
      {
        question: 'How do I set my availability?',
        answer: (
          <>
            Go to <strong>My Schedule</strong> to access your tutor dashboard, where you can set your weekly availability by day and time.
            Students can only send session requests during the hours you mark as available.
            You can update your availability at any time to reflect changes in your schedule.
          </>
        )
      },
      {
        question: 'Can I decline a session request?',
        answer: (
          <>
            Yes, you have full control over which sessions you accept. 
            When a student sends a request, review the details and decide whether it fits your schedule and expertise. 
            If you decline, the student is notified and can send requests to other tutors. 
            No payment is processed if you decline a request.
          </>
        )
      },
      {
        question: 'Can I offer both online and in-person sessions?',
        answer: (
          <>
            Yes! You can specify your preferences in your profile. 
            When students send session requests, they indicate whether they want online or in-person tutoring. 
            You can accept requests based on your preference and availability for each session type.
          </>
        )
      }
    ]
  },
  {
    category: 'Payments & Fees',
    questions: [
      {
        question: 'How much does Growth Tutoring cost?',
        answer: (
          <>
            Costs vary by tutor and their hourly rates (up to $150/hour). 
            In addition to the tutor's rate, Growth Tutoring charges a small platform fee to maintain and improve our services. 
            The total cost is clearly displayed before you confirm any session request.
          </>
        )
      },
      {
        question: 'What payment methods do you accept?',
        answer: (
          <>
            We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor. 
            All payment information is encrypted and securely stored.
          </>
        )
      },
      {
        question: 'When am I charged for a session?',
        answer: (
          <>
            When you send a session request, we authorize your payment method to ensure funds are available. 
            However, you are only charged once the tutor accepts your session request. 
            If the tutor declines, no charge is made to your card.
          </>
        )
      },
      {
        question: 'What is your cancellation/refund policy?',
        answer: (
          <>
            If you cancel <strong>24 or more hours before your session</strong>, you'll receive a <strong>full refund (100%)</strong>. 
            If you cancel <strong>between 2-24 hours before your session</strong>, you'll receive a <strong>70% refund</strong> (<strong>30% cancellation fee</strong> applies). 
            If you cancel <strong>less than 2 hours before your session</strong>, <strong>no refund will be provided</strong>. 
            If the tutor cancels or doesn't show up, you'll automatically receive a full refund.
          </>
        )
      },
      {
        question: 'What fees does Growth Tutoring charge?',
        answer: (
          <>
            Growth Tutoring charges a commission on each session to support the platform and provide quality service.  
            The standard commission is <strong>20% for online sessions</strong> and 
            <strong> 15% for in-person sessions</strong>.  
            For the first three sessions between a student and tutor, an additional 
            <strong> 10–15% onboarding commission</strong> applies.  
            Each session also includes a <strong>$5 platform fee</strong>.
          </>
        )

      },
      {
        question: 'Is my payment information secure?',
        answer: (
          <>
            <strong>Absolutely</strong>. We use Stripe, a leading payment processor trusted by millions of businesses worldwide. 
            All payment data is encrypted with industry-standard SSL/TLS protocols. 
            We never store your full credit card information on our servers - Stripe handles all sensitive payment data securely.
          </>
        )
      },
      {
        question: 'How do refunds work?',
        answer: (
          <>
            If a refund is approved, it will be processed back to your original payment method within 5-10 business days. 
            The exact timing depends on your bank or card issuer. 
            You will receive an email confirmation when the refund is processed. 
            For questions about refunds, contact info@growthtutoringhq.com.
          </>
        )
      }
    ]
  },
  {
    category: 'Account & Technical',
    questions: [
      {
        question: 'How do I create an account?',
        answer: (
          <>
            Click <strong>Sign Up</strong> in the top right corner and choose whether you want to register as a Student or Tutor.
            Fill out the registration form with your basic information. 
            You'll receive a verification email - fill in the verification code to activate your account and start using Growth Tutoring!
          </>
        )
      },
      {
        question: 'I didn\'t receive my verification email. What should I do?',
        answer: (
          <>
            First, check your spam or junk folder. 
            If you still don't see it, log into your account and click <strong>Resend Verification Email</strong> on the dashboard. 
            If you continue having issues, contact us at info@growthtutoringhq.com and we'll help activate your account manually.
          </>
        )
      },
      {
        question: 'How do I reset my password?',
        answer: (
          <>
            On the login page, click <strong>Forgot Password?</strong>.
            Enter your email address and we'll send you a password reset link. 
            Click the link and follow the instructions to create a new password. 
            If you don't receive the email, check your spam folder or contact support.
          </>
        )
      },
      {
        question: 'Can I update my profile information?',
        answer: (
          <>
            Yes! Log into your account and go to your Profile Settings. 
            You can update your name, email, profile picture, education, subjects (for tutors), bio, and other information at any time. 
            Changes are saved immediately and reflected across the platform.
          </>
        )
      },
      {
        question: 'How does the messaging system work?',
        answer: (
          <>
            Our built-in messaging system allows students and tutors to communicate directly. 
            Access your messages from the navigation menu. 
            You can send text messages, discuss session details, and coordinate schedules. 
            All conversations are saved and searchable for your convenience.
          </>
        )
      },
      {
        question: 'Is my personal information safe?',
        answer: (
          <>
            Yes. We take privacy seriously and protect your personal information with industry-standard security measures. 
            We never share your email, phone number, or payment information with third parties without your consent. 
            For more details, please read our Privacy Policy.
          </>
        )
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