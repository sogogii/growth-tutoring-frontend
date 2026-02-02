import './styles/TermsOfServiceModal.css'

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="tos-modal-overlay" onClick={onClose}>
      <div className="tos-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tos-modal-header">
          <h2>Privacy Policy</h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            How we collect, use, and protect your information
          </p>
          <button className="tos-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="tos-modal-body">
          <div className="tos-content">
            <p className="tos-effective-date">
              <strong>Effective Date:</strong> 01/31/2026<br />
              <strong>Last Updated:</strong> 01/31/2026<br />
              <strong>Version:</strong> 1.0
            </p>

            <section className="tos-section">
              <h3>1. Introduction</h3>
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

            <section className="tos-section">
              <h3>2. Information We Collect</h3>
              
              <h4>Personal Information You Provide</h4>
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

              <h4>Payment Information</h4>
              <ul>
                <li>Credit card details (processed securely through Stripe)</li>
                <li>Billing address</li>
                <li>Payment history and transaction records</li>
              </ul>
              <p>
                We do not store full credit card numbers on our servers. Payment processing is handled by 
                our PCI-compliant third-party payment processor, Stripe.
              </p>

              <h4>Session and Communication Data</h4>
              <ul>
                <li>Session booking details (date, time, subject, duration)</li>
                <li>Messages between students and tutors</li>
                <li>Progress reports and session notes</li>
                <li>Ratings and reviews</li>
                <li>Session attendance records</li>
              </ul>

              <h4>Automatically Collected Information</h4>
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

            <section className="tos-section">
              <h3>3. How We Use Your Information</h3>
              <p>We use your personal information for the following purposes:</p>

              <h4>Platform Services</h4>
              <ul>
                <li>Create and manage your account</li>
                <li>Match students with appropriate tutors</li>
                <li>Facilitate session scheduling and booking</li>
                <li>Process payments and issue refunds</li>
                <li>Enable communication between students and tutors</li>
                <li>Track session attendance and performance</li>
              </ul>

              <h4>Communication</h4>
              <ul>
                <li>Send booking confirmations and reminders</li>
                <li>Notify you of platform updates and changes</li>
                <li>Respond to your questions and support requests</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Notify you of policy or terms changes</li>
              </ul>

              <h4>Safety and Security</h4>
              <ul>
                <li>Conduct background checks on tutors</li>
                <li>Monitor for fraudulent activity</li>
                <li>Investigate policy violations</li>
                <li>Ensure child safety and COPPA compliance</li>
                <li>Protect against security threats</li>
              </ul>

              <h4>Platform Improvement</h4>
              <ul>
                <li>Analyze usage patterns and trends</li>
                <li>Improve matching algorithms</li>
                <li>Enhance user experience and features</li>
                <li>Conduct research and development</li>
              </ul>

              <h4>Legal Compliance</h4>
              <ul>
                <li>Comply with applicable laws and regulations</li>
                <li>Respond to legal requests and court orders</li>
                <li>Enforce our Terms of Service</li>
                <li>Generate tax documents (1099s for tutors)</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>4. How We Share Your Information</h3>

              <h4>With Students and Tutors</h4>
              <p>To facilitate tutoring sessions, we share limited information:</p>
              <ul>
                <li><strong>Students see about tutors:</strong> Name, photo, bio, subjects, experience, ratings, availability</li>
                <li><strong>Tutors see about students:</strong> First name, age/grade level, learning goals, parent/guardian contact info</li>
                <li><strong>After booking:</strong> Both parties receive contact information for scheduling and communication</li>
              </ul>

              <h4>With Service Providers</h4>
              <p>We share information with trusted third-party service providers who assist us in operating our platform:</p>
              <ul>
                <li><strong>Payment Processors:</strong> Stripe (for payment processing)</li>
                <li><strong>Background Check Providers:</strong> For tutor verification</li>
                <li><strong>Cloud Hosting:</strong> AWS (for data storage and platform hosting)</li>
                <li><strong>Email Services:</strong> For sending notifications and communications</li>
                <li><strong>Analytics Providers:</strong> For platform usage analysis</li>
              </ul>
              <p>These providers are contractually obligated to protect your information and use it only for the services they provide to us.</p>

              <h4>For Legal Reasons</h4>
              <p>We may disclose information when required by law or to protect rights and safety:</p>
              <ul>
                <li>In response to subpoenas, court orders, or legal process</li>
                <li>To comply with law enforcement requests</li>
                <li>To protect against fraud, security threats, or illegal activity</li>
                <li>To protect the safety of users, especially minors</li>
                <li>To enforce our Terms of Service or policies</li>
                <li>In connection with a business transaction (merger, acquisition, sale)</li>
              </ul>

              <h4>With Your Consent</h4>
              <p>We may share information for other purposes with your explicit consent.</p>
            </section>

            <section className="tos-section">
              <h3>5. Information We Do NOT Share</h3>
              <p>We will NEVER:</p>
              <ul>
                <li>Sell your personal information to third parties</li>
                <li>Share student academic data with advertisers</li>
                <li>Use student information for targeted advertising</li>
                <li>Share your information with marketing companies without consent</li>
                <li>Publicly disclose private session details or academic performance</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>6. Data Security</h3>
              <p>We implement reasonable security measures to protect your information:</p>

              <h4>Technical Safeguards</h4>
              <ul>
                <li>SSL/TLS encryption for data in transit</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Secure password storage (hashed and salted)</li>
                <li>Regular security audits and updates</li>
                <li>Firewall protection and intrusion detection</li>
                <li>Access controls and authentication</li>
              </ul>

              <h4>Administrative Safeguards</h4>
              <ul>
                <li>Employee confidentiality agreements</li>
                <li>Limited access to personal information</li>
                <li>Background checks for employees with data access</li>
                <li>Regular security training</li>
              </ul>

              <h4>Physical Safeguards</h4>
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

            <section className="tos-section">
              <h3>7. Children's Privacy (COPPA Compliance)</h3>
              <p>Growth Tutoring provides services to students of all ages, including children under 13.</p>

              <h4>Parental Consent</h4>
              <p>We comply with the Children's Online Privacy Protection Act (COPPA):</p>
              <ul>
                <li>We require verifiable parental consent before collecting information from children under 13</li>
                <li>Parents must create accounts on behalf of children under 13</li>
                <li>Parents can review, update, or delete their child's information at any time</li>
              </ul>

              <h4>Information from Children</h4>
              <p>We collect only the minimum necessary information from children:</p>
              <ul>
                <li>Name and grade level</li>
                <li>Learning needs and academic goals</li>
                <li>Session attendance and progress</li>
              </ul>

              <h4>Parental Rights</h4>
              <p>Parents have the right to:</p>
              <ul>
                <li>Review information collected from their child</li>
                <li>Request deletion of their child's information</li>
                <li>Refuse further collection of their child's information</li>
                <li>Receive information about our practices regarding children's data</li>
              </ul>
              <p>To exercise these rights, contact us at: info@growthtutoringhq.com</p>
            </section>

            <section className="tos-section">
              <h3>8. Your Privacy Rights</h3>
              <p>Depending on your location, you may have the following rights:</p>

              <h4>Access and Portability</h4>
              <ul>
                <li>Request a copy of your personal information</li>
                <li>Export your data in a portable format</li>
              </ul>

              <h4>Correction</h4>
              <ul>
                <li>Update or correct inaccurate information</li>
                <li>Complete incomplete information</li>
              </ul>

              <h4>Deletion</h4>
              <ul>
                <li>Request deletion of your account and personal information</li>
                <li>Subject to legal retention requirements</li>
              </ul>

              <h4>Restriction</h4>
              <ul>
                <li>Request limitation on processing of your information</li>
                <li>Object to certain uses of your data</li>
              </ul>

              <h4>Opt-Out</h4>
              <ul>
                <li>Unsubscribe from marketing emails</li>
                <li>Opt out of certain data collection practices</li>
              </ul>

              <h4>Non-Discrimination</h4>
              <p>We will not discriminate against you for exercising your privacy rights.</p>

              <h4>California Residents (CCPA Rights)</h4>
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

            <section className="tos-section">
              <h3>9. Cookies and Tracking Technologies</h3>
              
              <h4>What Are Cookies?</h4>
              <p>
                Cookies are small text files stored on your device that help us recognize you and remember 
                your preferences.
              </p>

              <h4>How We Use Cookies</h4>
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

              <h4>Your Cookie Choices</h4>
              <p>
                Most browsers allow you to control cookies through settings. However, disabling cookies may 
                limit your ability to use certain features of our platform.
              </p>
            </section>

            <section className="tos-section">
              <h3>10. Data Retention</h3>
              <p>We retain your information for as long as necessary to:</p>
              <ul>
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>

              <h4>Retention Periods</h4>
              <ul>
                <li><strong>Active Accounts:</strong> Information retained while account is active</li>
                <li><strong>Inactive Accounts:</strong> Deleted after 3 years of inactivity</li>
                <li><strong>Financial Records:</strong> Retained for 7 years for tax and accounting purposes</li>
                <li><strong>Session Records:</strong> Retained for 3 years</li>
                <li><strong>Background Checks:</strong> Retained for duration of tutor's active status</li>
              </ul>
              <p>After retention periods expire, we securely delete or anonymize your information.</p>
            </section>

            <section className="tos-section">
              <h3>11. International Data Transfers</h3>
              <p>
                Growth Tutoring is based in the United States. If you access our platform from outside the 
                U.S., your information will be transferred to, stored, and processed in the United States.
              </p>
              <p>
                By using our platform, you consent to the transfer of your information to the United States, 
                which may have different data protection laws than your country.
              </p>
            </section>

            <section className="tos-section">
              <h3>12. Changes to This Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. Changes will be effective when posted 
                on this page with an updated "Last Updated" date.
              </p>

              <h4>Notification of Material Changes</h4>
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

            <section className="tos-section">
              <h3>13. Contact Us</h3>
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

            <section className="tos-section">
              <h3>14. Do Not Track Signals</h3>
              <p>
                Our platform does not currently respond to "Do Not Track" browser signals. We will update 
                this policy if we implement Do Not Track signal recognition in the future.
              </p>
            </section>

            <p style={{ marginTop: '32px', fontStyle: 'italic', color: '#6b7280', textAlign: 'center' }}>
              <strong>Thank you for trusting Growth Tutoring with your information.</strong> We are 
              committed to protecting your privacy and providing a safe, secure learning environment.
            </p>
          </div>
        </div>
        
        <div className="tos-modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyModal