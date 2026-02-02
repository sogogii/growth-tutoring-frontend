import './styles/PrivacyPolicyPage.css'

function PrivacyPolicyPage() {
  return (
    <div className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <h1 className="privacy-hero-title">Privacy Policy</h1>
          <p className="privacy-hero-subtitle">
            <strong>Effective Date:</strong> 01/31/2026 &nbsp;|&nbsp; 
            <strong>Last Updated:</strong> 01/31/2026 &nbsp;|&nbsp; 
            <strong>Version:</strong> 1.0
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="privacy-container">
        <div className="privacy-content">
          
          <section className="privacy-section">
            <h2>1. Introduction</h2>
            <p>
              Growth Tutoring LLC ("Company," "we," "us," or "our") operates the Growth Tutoring platform 
              at growthtutoringhq.com. This Privacy Policy explains how we collect, use, disclose, and protect 
              your personal information when you use our tutoring marketplace platform.
            </p>
            <p>
              By using our platform, you agree to the collection and use of information in accordance with 
              this Privacy Policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Information We Collect</h2>
            
            <h3>Personal Information You Provide</h3>
            <p>When you create an account or use our services, we collect:</p>
            
            <p><strong>For All Users:</strong></p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Physical address</li>
              <li>Birthday/Date of birth</li>
              <li>Account credentials (username, password)</li>
              <li>Profile photo (optional)</li>
            </ul>

            <p><strong>For Students/Parents:</strong></p>
            <ul>
              <li>Student age and grade level</li>
              <li>Learning needs and academic goals</li>
              <li>Educational history</li>
              <li>Emergency contact information</li>
            </ul>

            <p><strong>For Tutors:</strong></p>
            <ul>
              <li>Educational background and credentials</li>
              <li>Teaching subjects and specializations</li>
              <li>Years of experience</li>
              <li>Professional certifications</li>
              <li>Background check results</li>
              <li>Bank account information (for payments)</li>
              <li>Social Security Number or Tax ID (for tax reporting)</li>
            </ul>

            <h3>Payment Information</h3>
            <ul>
              <li>Credit card details (processed securely through Stripe)</li>
              <li>Billing address</li>
              <li>Payment history and transaction records</li>
            </ul>
            <p>
              We do not store full credit card numbers on our servers. Payment processing is handled by 
              our PCI-compliant third-party payment processor, Stripe.
            </p>

            <h3>Session and Communication Data</h3>
            <ul>
              <li>Session booking details (date, time, subject, duration)</li>
              <li>Messages between students and tutors</li>
              <li>Progress reports and session notes</li>
              <li>Ratings and reviews</li>
              <li>Session attendance records</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use collected information for the following purposes:</p>

            <h3>Service Delivery</h3>
            <ul>
              <li>Create and manage user accounts</li>
              <li>Match students with appropriate tutors</li>
              <li>Facilitate session scheduling and booking</li>
              <li>Process payments and send receipts</li>
              <li>Enable communication between students and tutors</li>
              <li>Provide progress reports and learning analytics</li>
            </ul>

            <h3>Platform Improvement</h3>
            <ul>
              <li>Improve user experience and platform functionality</li>
              <li>Analyze usage patterns and trends</li>
              <li>Develop new features and services</li>
              <li>Conduct research and analytics</li>
            </ul>

            <h3>Safety and Security</h3>
            <ul>
              <li>Perform background checks on tutors</li>
              <li>Verify user identity</li>
              <li>Prevent fraud and abuse</li>
              <li>Enforce our Terms of Service</li>
              <li>Protect against security threats</li>
              <li>Resolve disputes</li>
            </ul>

            <h3>Communication</h3>
            <ul>
              <li>Send booking confirmations and reminders</li>
              <li>Provide customer support</li>
              <li>Send platform updates and announcements</li>
              <li>Share educational content and tips</li>
              <li>Marketing communications (with your consent)</li>
            </ul>

            <h3>Legal Compliance</h3>
            <ul>
              <li>Comply with legal obligations</li>
              <li>Respond to legal requests and court orders</li>
              <li>Enforce our agreements</li>
              <li>Protect our rights and property</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. How We Share Your Information</h2>
            <p>We share your information only in the following circumstances:</p>

            <h3>With Tutors and Students</h3>
            <p>When you book a session, we share necessary information between parties:</p>
            <ul>
              <li><strong>Students receive:</strong> Tutor name, photo, credentials, contact information</li>
              <li><strong>Tutors receive:</strong> Student name, grade level, learning goals, contact information</li>
            </ul>

            <h3>Service Providers</h3>
            <p>We share information with trusted third-party service providers who assist us:</p>
            <ul>
              <li><strong>Payment Processing:</strong> Stripe (payment processing)</li>
              <li><strong>Background Checks:</strong> Checkr (tutor screening)</li>
              <li><strong>Communication:</strong> Email service providers (Gmail/SMTP)</li>
              <li><strong>Cloud Hosting:</strong> AWS (data storage and hosting)</li>
              <li><strong>Analytics:</strong> Usage analytics tools</li>
              <li><strong>Customer Support:</strong> Support ticketing systems</li>
            </ul>
            <p>
              These providers are contractually obligated to protect your information and may only use it 
              to provide services to us.
            </p>

            <h3>Legal Requirements</h3>
            <p>We may disclose information when required by law:</p>
            <ul>
              <li>In response to subpoenas, court orders, or legal process</li>
              <li>To comply with government or regulatory requests</li>
              <li>To protect our rights, property, or safety</li>
              <li>To protect the rights, property, or safety of our users or the public</li>
              <li>To detect, prevent, or investigate fraud, security, or technical issues</li>
              <li>In connection with child safety concerns</li>
            </ul>

            <h3>Business Transfers</h3>
            <p>
              If Growth Tutoring is acquired, merged, or undergoes a business reorganization, your information 
              may be transferred to the acquiring entity.
            </p>

            <h3>With Your Consent</h3>
            <p>We may share information for other purposes with your explicit consent.</p>
          </section>

          <section className="privacy-section">
            <h2>5. Information We Do NOT Share</h2>
            <p>We will NEVER:</p>
            <ul>
              <li>Sell your personal information to third parties</li>
              <li>Share student academic data with advertisers</li>
              <li>Use student information for targeted advertising</li>
              <li>Share your information with marketing companies without consent</li>
              <li>Publicly disclose private session details or academic performance</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>6. Data Security</h2>
            <p>We implement reasonable security measures to protect your information:</p>

            <h3>Technical Safeguards</h3>
            <ul>
              <li>SSL/TLS encryption for data in transit</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Secure password storage (hashed and salted)</li>
              <li>Regular security audits and updates</li>
              <li>Firewall protection and intrusion detection</li>
              <li>Access controls and authentication</li>
            </ul>

            <h3>Administrative Safeguards</h3>
            <ul>
              <li>Employee confidentiality agreements</li>
              <li>Limited access to personal information</li>
              <li>Background checks for employees with data access</li>
              <li>Regular security training</li>
            </ul>

            <h3>Physical Safeguards</h3>
            <ul>
              <li>Secure data centers with restricted access</li>
              <li>Environmental controls and monitoring</li>
            </ul>

            <p>
              <strong>Important:</strong> No system is 100% secure. While we strive to protect your 
              information, we cannot guarantee absolute security. You are responsible for maintaining the 
              confidentiality of your account credentials.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Children's Privacy (COPPA Compliance)</h2>
            <p>Growth Tutoring provides services to students of all ages, including children under 13.</p>

            <h3>Parental Consent</h3>
            <p>We comply with the Children's Online Privacy Protection Act (COPPA):</p>
            <ul>
              <li>We require verifiable parental consent before collecting information from children under 13</li>
              <li>Parents must create accounts on behalf of children under 13</li>
              <li>Parents can review, update, or delete their child's information at any time</li>
            </ul>

            <h3>Information from Children</h3>
            <p>We collect only the minimum necessary information from children:</p>
            <ul>
              <li>Name and grade level</li>
              <li>Learning needs and academic goals</li>
              <li>Session attendance and progress</li>
            </ul>

            <h3>Parental Rights</h3>
            <p>Parents have the right to:</p>
            <ul>
              <li>Review information collected from their child</li>
              <li>Request deletion of their child's information</li>
              <li>Refuse further collection of their child's information</li>
              <li>Receive information about our practices regarding children's data</li>
            </ul>
            <p>To exercise these rights, contact us at: info@growthtutoringhq.com</p>
          </section>

          <section className="privacy-section">
            <h2>8. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>

            <h3>Access and Portability</h3>
            <ul>
              <li>Request a copy of your personal information</li>
              <li>Export your data in a portable format</li>
            </ul>

            <h3>Correction</h3>
            <ul>
              <li>Update or correct inaccurate information</li>
              <li>Complete incomplete information</li>
            </ul>

            <h3>Deletion</h3>
            <ul>
              <li>Request deletion of your account and personal information</li>
              <li>Subject to legal retention requirements</li>
            </ul>

            <h3>Restriction</h3>
            <ul>
              <li>Request limitation on processing of your information</li>
              <li>Object to certain uses of your data</li>
            </ul>

            <h3>Opt-Out</h3>
            <ul>
              <li>Unsubscribe from marketing emails</li>
              <li>Opt out of certain data collection practices</li>
            </ul>

            <h3>Non-Discrimination</h3>
            <p>We will not discriminate against you for exercising your privacy rights.</p>

            <h3>California Residents (CCPA Rights)</h3>
            <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act:</p>
            <ul>
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of sale of personal information (we do not sell information)</li>
              <li>Right to deletion of personal information</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>

            <p>
              <strong>To Exercise Your Rights:</strong> Email us at info@growthtutoringhq.com with your 
              request. We will verify your identity before fulfilling your request.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Cookies and Tracking Technologies</h2>
            
            <h3>What Are Cookies?</h3>
            <p>
              Cookies are small text files stored on your device that help us recognize you and remember 
              your preferences.
            </p>

            <h3>How We Use Cookies</h3>
            <p><strong>Essential Cookies:</strong></p>
            <ul>
              <li>Authentication and account management</li>
              <li>Security and fraud prevention</li>
              <li>Session management</li>
            </ul>

            <p><strong>Functional Cookies:</strong></p>
            <ul>
              <li>Remember your preferences</li>
              <li>Enable platform features</li>
              <li>Personalize your experience</li>
            </ul>

            <p><strong>Analytics Cookies:</strong></p>
            <ul>
              <li>Understand how users interact with our platform</li>
              <li>Measure website performance</li>
              <li>Improve user experience</li>
            </ul>

            <h3>Your Cookie Choices</h3>
            <p>
              Most browsers allow you to control cookies through settings. However, disabling cookies may 
              limit your ability to use certain features of our platform.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Data Retention</h2>
            <p>We retain your information for as long as necessary to:</p>
            <ul>
              <li>Provide our services</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce our agreements</li>
            </ul>

            <h3>Retention Periods</h3>
            <ul>
              <li><strong>Active Accounts:</strong> Information retained while account is active</li>
              <li><strong>Inactive Accounts:</strong> Deleted after 3 years of inactivity</li>
              <li><strong>Financial Records:</strong> Retained for 7 years for tax and accounting purposes</li>
              <li><strong>Session Records:</strong> Retained for 3 years</li>
              <li><strong>Background Checks:</strong> Retained for duration of tutor's active status</li>
            </ul>
            <p>After retention periods expire, we securely delete or anonymize your information.</p>
          </section>

          <section className="privacy-section">
            <h2>11. International Data Transfers</h2>
            <p>
              Growth Tutoring is based in the United States. If you access our platform from outside the 
              U.S., your information will be transferred to, stored, and processed in the United States.
            </p>
            <p>
              By using our platform, you consent to the transfer of your information to the United States, 
              which may have different data protection laws than your country.
            </p>
          </section>

          <section className="privacy-section">
            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be effective when posted 
              on this page with an updated "Last Updated" date.
            </p>

            <h3>Notification of Material Changes</h3>
            <p>For material changes, we will:</p>
            <ul>
              <li>Email you at your registered email address</li>
              <li>Display a prominent notice on our platform</li>
              <li>Provide 30 days advance notice when possible</li>
            </ul>
            <p>
              Your continued use of our platform after changes constitutes acceptance of the updated 
              Privacy Policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>13. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy 
              practices:
            </p>
            <p>
              <strong>Email:</strong> info@growthtutoringhq.com<br />
              <strong>Phone:</strong> +1 (949) 232-0738
            </p>
            <p>
              <strong>Response Time:</strong> We will respond to privacy inquiries within 7 business days.
            </p>
          </section>

          <section className="privacy-section">
            <h2>14. Do Not Track Signals</h2>
            <p>
              Our platform does not currently respond to "Do Not Track" browser signals. We will update 
              this policy if we implement Do Not Track signal recognition in the future.
            </p>
          </section>

          <div className="privacy-footer">
            <p>
              <strong>Thank you for trusting Growth Tutoring with your information.</strong> We are 
              committed to protecting your privacy and providing a safe, secure learning environment.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage