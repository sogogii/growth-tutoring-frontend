import './styles/TermsOfServiceModal.css'

const TutorTermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="tos-modal-overlay" onClick={onClose}>
      <div className="tos-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tos-modal-header">
          <h2>Tutor Terms of Service</h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>Independent Contractor Agreement</p>
          <button className="tos-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="tos-modal-body">
          <div className="tos-content">
            <p className="tos-effective-date">
              <strong>Effective Date:</strong> 01/31/2026<br />
              <strong>Version:</strong> 1.0
            </p>

            <section className="tos-section">
              <p>
                This Tutor Terms of Service Agreement ("Terms") is between Growth Tutoring LLC ("Company," 
                "we," "us," or "our") and you ("Tutor," "you," or "your"). By creating an account, accessing, or 
                using the Growth Tutoring platform, you acknowledge and agree to be bound by these Terms.
              </p>
            </section>

            <section className="tos-section">
              <h3>1. Acceptance of Terms</h3>
              <p>By registering as a tutor on the Growth Tutoring platform, you:</p>
              <ul>
                <li>Confirm you are at least 18 years of age</li>
                <li>Agree to comply with these Terms of Service</li>
                <li>Agree to comply with the separate Independent Contractor Agreement (if applicable)</li>
                <li>Represent that all information provided during registration is accurate and complete</li>
                <li>Consent to receive communications from Growth Tutoring via email, SMS, or platform notifications</li>
              </ul>
              <p>
                These Terms govern your use of the Growth Tutoring platform, website, mobile applications, and 
                related services (collectively, the "Platform").
              </p>
            </section>

            <section className="tos-section">
              <h3>2. Account Registration & Verification</h3>
              
              <h4>Account Creation</h4>
              <ul>
                <li>You may maintain only ONE tutor account per person</li>
                <li>Accounts are non-transferable and may not be shared, sold, or assigned to others</li>
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials</li>
                <li>You must notify us immediately of any unauthorized access to your account</li>
              </ul>

              <h4>Verification Requirements</h4>
              <p>Before becoming active on the platform, you must:</p>
              <ul>
                <li>Complete the tutor application and profile setup</li>
                <li>Pass a background check screening (U.S.-based tutors providing in-person services)</li>
                <li>Provide valid government-issued photo identification</li>
                <li>Submit required tax documentation (W-9 for U.S. tutors, W-8BEN for international tutors)</li>
                <li>Accept and sign the Independent Contractor Agreement</li>
                <li>Verify your email address and phone number</li>
              </ul>

              <h4>Profile Requirements</h4>
              <p>Your tutor profile must:</p>
              <ul>
                <li>Include an accurate bio and qualifications</li>
                <li>Use a clear, professional profile photo of yourself (no logos, graphics, or other individuals)</li>
                <li>Accurately represent your expertise, education, and experience</li>
                <li>Include only truthful information regarding certifications and credentials</li>
                <li>Be kept up-to-date with current availability and rates</li>
              </ul>

              <h4>Prohibited Profile Content:</h4>
              <ul>
                <li>False or misleading credentials</li>
                <li>Contact information (email, phone, social media handles)</li>
                <li>Links to external booking or payment systems</li>
                <li>Sexually suggestive or inappropriate photos</li>
                <li>Copyrighted images you don't have rights to use</li>
                <li>Promotional content for other businesses or services</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>3. Platform Usage & Conduct</h3>
              
              <h4>Permitted Use</h4>
              <p>The Platform is designed to:</p>
              <ul>
                <li>Connect tutors with students and families</li>
                <li>Facilitate scheduling and session management</li>
                <li>Process payments securely</li>
                <li>Enable communication between tutors and clients</li>
                <li>Track progress and performance</li>
              </ul>

              <h4>Required Platform Use</h4>
              <p>You must use the Platform for:</p>
              <ul>
                <li><strong>All booking and scheduling</strong> – Sessions must be booked through the platform</li>
                <li><strong>All payments</strong> – No off-platform payments or private arrangements</li>
                <li><strong>Session-related communication</strong> – Use the platform messaging system for scheduling, confirmations, and session logistics</li>
                <li><strong>Progress reporting</strong> – Submit all progress reports through the platform</li>
              </ul>

              <h4>Prohibited Conduct</h4>
              <p>You may not:</p>
              <ul>
                <li>Bypass the platform to book or accept payment for sessions</li>
                <li>Share your contact information with clients for the purpose of arranging off-platform sessions</li>
                <li>Request or accept payments outside the platform</li>
                <li>Solicit clients to leave the platform or book privately</li>
                <li>Create multiple tutor accounts</li>
                <li>Share your account credentials with others</li>
                <li>Use automated bots, scripts, or scrapers on the Platform</li>
                <li>Attempt to circumvent security features or access restrictions</li>
                <li>Reverse engineer, decompile, or attempt to extract source code from the Platform</li>
                <li>Upload malware, viruses, or malicious code</li>
                <li>Harass, threaten, or abuse clients, students, or Company staff</li>
                <li>Discriminate based on race, religion, gender, sexual orientation, disability, or other protected characteristics</li>
                <li>Engage in any illegal activity through the Platform</li>
                <li>Impersonate another person or entity</li>
                <li>Post false or defamatory content about clients, students, or other tutors</li>
                <li>Use the Platform for any purpose other than legitimate tutoring services</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>4. Scheduling & Session Management</h3>
              
              <h4>Setting Availability</h4>
              <ul>
                <li>You control your own schedule and availability through the Platform</li>
                <li>You must keep your availability calendar accurate and up-to-date</li>
                <li>Blocking off availability does not guarantee you will not receive booking requests for previously scheduled recurring sessions</li>
              </ul>

              <h4>Accepting Sessions</h4>
              <ul>
                <li>You have the right to accept or decline session requests</li>
                <li>Declining requests does not violate these Terms, but consistent acceptance improves your visibility</li>
                <li>Once you accept a session, you are committed to fulfill it according to the cancellation policy</li>
              </ul>

              <h4>Session Formats</h4>
              <p>You may offer:</p>
              <ul>
                <li><strong>Online sessions</strong> – Must have reliable internet connection and appropriate technology</li>
                <li><strong>In-person sessions</strong> – Must comply with local laws and safety guidelines</li>
                <li>Sessions must be conducted professionally and in appropriate settings</li>
              </ul>

              <h4>Technology Requirements for Online Sessions</h4>
              <p>You are responsible for:</p>
              <ul>
                <li>Reliable high-speed internet connection (minimum 10 Mbps recommended)</li>
                <li>Working computer/tablet with camera and microphone</li>
                <li>Video conferencing software (Zoom, Google Meet, or platform-approved alternatives)</li>
                <li>Quiet, well-lit, professional environment</li>
                <li>Backup plans for technology failures</li>
              </ul>
              <p>Company is not liable for lost sessions due to tutor technology issues.</p>
            </section>

            <section className="tos-section">
              <h3>5. Payment Processing</h3>
              
              <h4>How Payment Works</h4>
              <ul>
                <li>Clients pay through the Platform at the time of booking</li>
                <li>Platform processes payments on your behalf</li>
                <li>You receive payment based on the commission structure outlined in your Independent Contractor Agreement</li>
                <li>All payments are subject to applicable platform fees</li>
              </ul>

              <h4>Payment Schedule</h4>
              <ul>
                <li>Payments are processed weekly via direct deposit or other approved method</li>
                <li>You must provide accurate banking/payment information</li>
                <li>Company is not responsible for delays caused by incorrect payment information</li>
              </ul>

              <h4>Refunds & Disputes</h4>
              <ul>
                <li>Client refunds are governed by the cancellation policy</li>
                <li>Payment disputes must be reported within 7 days of the session</li>
                <li>Company reserves the right to withhold payment pending investigation of disputes</li>
                <li>Fraudulent dispute claims may result in account termination</li>
              </ul>

              <h4>Taxes</h4>
              <ul>
                <li>You are solely responsible for all taxes on your earnings</li>
                <li>Company will issue 1099-NEC forms to U.S. tutors earning $600+ annually</li>
                <li>International tutors are responsible for taxes in their home country</li>
                <li>Failure to provide required tax documentation may result in payment holds</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>6. Cancellation & Attendance Policy</h3>
              
              <h4>Tutor-Initiated Cancellations</h4>
              <ul>
                <li>Must provide 24+ hours notice to both client and Company</li>
                <li>Cancellations with less than 24 hours notice result in forfeiture of commission for that session</li>
                <li>Emergency exceptions require documentation and Company approval</li>
                <li>Excessive cancellations may result in account restrictions or termination</li>
              </ul>

              <h4>Late Arrival</h4>
              <ul>
                <li>Must notify client and Company immediately</li>
                <li>No penalty if client agrees to shortened session or reschedule</li>
                <li>Repeated late arrivals without notice subject to progressive discipline</li>
              </ul>

              <h4>No-Shows</h4>
              <ul>
                <li>Unannounced absence = automatic written warning + full client refund</li>
                <li>Second unannounced absence within 3 months = return to probationary commission rate</li>
                <li>Third unannounced absence within 3 months = account termination</li>
                <li>5 total absences in one year = automatic termination</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>7. Progress Reports & Communication</h3>
              
              <h4>Progress Report Requirements</h4>
              <p>After each session, you must:</p>
              <ul>
                <li>Submit a progress report within 48 hours</li>
                <li>Include topics covered, student progress, and recommendations for next session</li>
                <li>Be honest and constructive in your feedback</li>
                <li>Reports are shared with parents/guardians</li>
              </ul>

              <h4>Communication Standards</h4>
              <ul>
                <li>Respond to client messages within 24 hours</li>
                <li>Use professional, respectful language at all times</li>
                <li>Keep all communication relevant to tutoring services</li>
                <li>Use the Platform messaging system for all session-related communication</li>
              </ul>

              <h4>Prohibited Communication</h4>
              <p>You may not:</p>
              <ul>
                <li>Share personal contact information (phone, email, social media)</li>
                <li>Communicate with clients outside the Platform (except during active session logistics - e.g., "I'm running 5 minutes late")</li>
                <li>Connect with students or clients on social media (Instagram, TikTok, Facebook, LinkedIn, etc.)</li>
                <li>Discuss other tutors, clients, or Company matters publicly</li>
                <li>Share confidential student or family information</li>
              </ul>
              <p>
                <strong>Exception:</strong> You may provide a Zoom link or temporary contact method for the sole purpose of 
                conducting the scheduled session, but may not use this for booking future sessions or ongoing communication.
              </p>
            </section>

            <section className="tos-section">
              <h3>8. Quality Standards & Performance</h3>
              
              <h4>Rating System</h4>
              <ul>
                <li>Clients can rate tutors after each session (1-5 stars)</li>
                <li>Ratings are averaged over time and visible on your profile</li>
                <li>You may respond professionally to reviews through the Platform</li>
              </ul>

              <h4>Performance Expectations</h4>
              <ul>
                <li>Average rating below 3.5 stars triggers performance review</li>
                <li>Average rating below 3.0 stars may result in account suspension or termination</li>
                <li>Company may require improvement plans for underperforming tutors</li>
                <li>Consistent 5-star ratings may qualify for featured placement or bonuses</li>
              </ul>

              <h4>Disputes About Ratings</h4>
              <ul>
                <li>You may dispute a rating within 7 days if you believe it is false, defamatory, or violates Terms</li>
                <li>Company will review and may remove ratings that violate policy</li>
                <li>Honest negative reviews are not grounds for removal</li>
                <li>Company may consider session volume, dispute history, and mitigating circumstances</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>9. Safety & Background Checks</h3>
              
              <h4>Background Check Requirements</h4>
              <ul>
                <li>All U.S.-based tutors providing in-person services must pass a background check</li>
                <li>Background checks are conducted through Checkr or similar service</li>
                <li>Checks include criminal history, sex offender registry, and other databases</li>
                <li>Background checks are renewed annually at Company expense</li>
                <li>International tutors must provide valid ID verification</li>
              </ul>

              <h4>Zero Tolerance Policy</h4>
              <p>Immediate termination and potential legal action for:</p>
              <ul>
                <li>Any form of abuse, harassment, or inappropriate behavior toward students</li>
                <li>Sexual misconduct or grooming behavior</li>
                <li>Discrimination or hate speech</li>
                <li>Violence or threats of violence</li>
                <li>Substance abuse during sessions</li>
                <li>Any conduct that endangers student safety</li>
              </ul>

              <h4>Mandatory Reporting</h4>
              <p>If you become aware of:</p>
              <ul>
                <li>Child abuse or neglect</li>
                <li>Student safety concerns</li>
                <li>Threats of self-harm by a student</li>
                <li>Other serious safety issues</li>
              </ul>
              <p>
                You must immediately report to Company and, where legally required, to appropriate authorities.
              </p>
            </section>

            <section className="tos-section">
              <h3>10. Privacy & Confidentiality</h3>
              
              <h4>Student Information Protection</h4>
              <p>You must:</p>
              <ul>
                <li>Keep all student and family information confidential</li>
                <li>Not share student names, contact information, academic details, or family information with third parties</li>
                <li>Secure any written or digital notes containing student information</li>
                <li>Delete or return all client information upon termination</li>
                <li>Comply with applicable privacy laws (FERPA, COPPA, GDPR where applicable)</li>
              </ul>

              <h4>What You May NOT Do:</h4>
              <ul>
                <li>Post about students or sessions on social media</li>
                <li>Share student work samples without written parent consent</li>
                <li>Discuss student performance with anyone other than the student's parent/guardian (through the Platform)</li>
                <li>Use student information for marketing or other purposes</li>
                <li>Store client data on unsecured or public devices</li>
              </ul>

              <h4>Platform Privacy</h4>
              <ul>
                <li>Your use of the Platform is subject to our Privacy Policy</li>
                <li>We collect usage data, session information, and communications for quality and safety</li>
                <li>We may monitor communications to ensure compliance with these Terms</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>11. Non-Solicitation & Platform Loyalty</h3>
              
              <h4>Scope</h4>
              <p>
                All clients you meet through the Growth Tutoring Platform, regardless of how they originally 
                found you, are clients of Growth Tutoring LLC.
              </p>

              <h4>Prohibited Activities</h4>
              <p>
                During your engagement with Growth Tutoring and for 12 months after termination, you may not:
              </p>
              <ul>
                <li>Contact clients directly to offer tutoring services outside the Platform</li>
                <li>Accept private tutoring arrangements with Platform clients</li>
                <li>Encourage or assist clients in booking sessions off-platform</li>
                <li>Share your contact information for the purpose of arranging private sessions</li>
                <li>Book reduced-rate sessions with clients off-platform to circumvent fees</li>
                <li>Refer Platform clients to other tutors or services for commission or compensation</li>
              </ul>

              <h4>Social Media Restrictions</h4>
              <p>You may not:</p>
              <ul>
                <li>Add, follow, friend, or connect with current clients or students on any social media platform</li>
                <li>Accept connection requests from clients or students during active tutoring relationship</li>
                <li>Message clients or students through social media for any reason</li>
              </ul>
              <p>
                <strong>Exception:</strong> You may accept social media connections from former students 6 months after 
                the tutoring relationship has ended AND the 12-month non-solicitation period has expired.
              </p>

              <h4>Liquidated Damages</h4>
              <p>
                If you violate the non-solicitation or platform usage requirements, you agree to pay the Company:
              </p>
              <ul>
                <li><strong>$2,000 USD OR</strong></li>
                <li><strong>20 times your hourly rate per off-platform session, whichever is greater</strong></li>
              </ul>
              <p>
                <strong>Purpose:</strong> This is a reasonable estimate of lost revenue, platform costs, safety 
                compliance burdens, and administrative costs caused by bypassing the Platform.
              </p>

              <h4>Enforcement:</h4>
              <ul>
                <li>Company may immediately suspend or terminate your account</li>
                <li>You forfeit all pending payments and bonuses</li>
                <li>You lose access to dispute resolution and refund protections</li>
                <li>Company may pursue legal action to recover damages</li>
              </ul>

              <h4>Mandatory Reporting</h4>
              <p>If a client requests off-platform sessions or direct payment, you must:</p>
              <ul>
                <li>Decline the request</li>
                <li>Report it to Company within 24 hours through the Platform</li>
                <li>Continue to use the Platform exclusively for all bookings</li>
              </ul>
              <p>
                Failure to report client solicitation attempts may be treated as complicity in violation of this policy.
              </p>
            </section>

            <section className="tos-section">
              <h3>12. Intellectual Property</h3>
              
              <h4>Your Content</h4>
              <p>You retain ownership of:</p>
              <ul>
                <li>Original lesson plans and teaching materials you create</li>
                <li>Personal teaching methods and strategies</li>
                <li>Educational content you develop independently</li>
              </ul>
              <p>By using the Platform, you grant Company a limited license to:</p>
              <ul>
                <li>Display your profile, bio, and qualifications</li>
                <li>Share your progress reports with clients</li>
                <li>Use anonymized performance data for platform improvement</li>
              </ul>

              <h4>Company Property</h4>
              <p>Company retains all rights to:</p>
              <ul>
                <li>Platform technology, software, and code</li>
                <li>Growth Tutoring branding, logos, and trademarks</li>
                <li>Client lists, contact information, and database</li>
                <li>Platform design and user interface</li>
                <li>Aggregated data and analytics</li>
              </ul>

              <h4>Restrictions</h4>
              <p>You may not:</p>
              <ul>
                <li>Use Company trademarks or branding without written permission</li>
                <li>Represent yourself as an employee or agent of Growth Tutoring</li>
                <li>Copy, reproduce, or reverse engineer the Platform</li>
                <li>Extract or scrape client data from the Platform</li>
              </ul>

              <h4>Post-Termination Use</h4>
              <p>After termination, you may:</p>
              <ul>
                <li>Retain and reuse your own original teaching materials</li>
                <li>Reference your tutoring experience on your resume</li>
              </ul>
              <p>You may NOT:</p>
              <ul>
                <li>Use or reference client-specific information, names, or details</li>
                <li>Claim ongoing affiliation with Growth Tutoring</li>
                <li>Use Company branding or trademarks</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>13. Account Suspension & Termination</h3>
              
              <h4>Voluntary Termination</h4>
              <p>You may close your account at any time by:</p>
              <ul>
                <li>Providing 14 days written notice to Company</li>
                <li>Completing all scheduled sessions during notice period OR cooperating with student transitions</li>
                <li>Submitting handoff notes for all active students</li>
                <li>Returning or deleting all client information</li>
              </ul>
              <p>Final payment will be processed within 14 days of your last session.</p>

              <h4>Company-Initiated Suspension</h4>
              <p>Your account may be temporarily suspended for:</p>
              <ul>
                <li>Pending investigation of policy violations</li>
                <li>Disputes or complaints requiring review</li>
                <li>Failure to submit required documentation</li>
                <li>Payment processing issues</li>
                <li>Safety concerns</li>
              </ul>
              <p>During suspension, you cannot:</p>
              <ul>
                <li>Accept new bookings</li>
                <li>Access client information</li>
                <li>Receive payments (held pending resolution)</li>
              </ul>

              <h4>Company-Initiated Termination</h4>
              <p>We may terminate your account immediately for:</p>
              <ul>
                <li>Violation of non-solicitation policy</li>
                <li>Safety violations or misconduct</li>
                <li>Failure to pass or renew background check</li>
                <li>Repeated attendance violations (3 within 3 months)</li>
                <li>Average rating below 3.0</li>
                <li>5 absences within one year</li>
                <li>Fraud or dishonesty</li>
                <li>Breach of confidentiality</li>
                <li>Harassment or discrimination</li>
                <li>Illegal activity</li>
                <li>Repeated Terms violations</li>
              </ul>

              <h4>Post-Termination</h4>
              <p>Upon termination:</p>
              <ul>
                <li>All access to the Platform is revoked immediately</li>
                <li>Non-solicitation clause remains in effect for 12 months</li>
                <li>You must delete all client information within 7 days</li>
                <li>Pending bonuses are forfeited unless you are in good standing</li>
                <li>Outstanding payments for completed sessions will be processed</li>
                <li>You may not create a new account without Company approval</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>14. Dispute Resolution</h3>
              
              <h4>Informal Resolution</h4>
              <p>Before pursuing formal action, parties agree to:</p>
              <ol>
                <li>Submit a written description of the dispute to Company</li>
                <li>Engage in good faith negotiation for 30 days</li>
                <li>Attempt to resolve the matter amicably</li>
              </ol>

              <h4>Mediation</h4>
              <p>If informal resolution fails:</p>
              <ul>
                <li>Parties agree to non-binding mediation</li>
                <li>Mediation costs shared equally between parties</li>
                <li>Mediation must occur before any litigation</li>
              </ul>

              <h4>Arbitration & Class Action Waiver</h4>
              <p>By accepting these Terms, you agree:</p>
              <ul>
                <li>Any dispute not resolved through mediation will be settled by binding arbitration</li>
                <li>Arbitration will be conducted under the rules of the American Arbitration Association (AAA)</li>
                <li>Arbitration will take place in Orange County, California or remotely via video conference</li>
                <li>You waive your right to participate in class actions, class arbitrations, or representative actions</li>
                <li>Each party bears their own legal fees unless the arbitrator awards them</li>
              </ul>

              <h4>Exceptions to Arbitration</h4>
              <p>The following may be pursued in court:</p>
              <ul>
                <li>Claims for injunctive relief to enforce non-solicitation or confidentiality provisions</li>
                <li>Claims related to intellectual property infringement</li>
                <li>Small claims court actions (under jurisdictional limits)</li>
              </ul>

              <h4>Governing Law</h4>
              <p>
                These Terms are governed by the laws of the State of California, without regard to conflict of law principles.
              </p>
            </section>

            <section className="tos-section">
              <h3>15. Limitation of Liability</h3>
              
              <h4>Company Disclaimers</h4>
              <p><strong>GROWTH TUTORING LLC IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</strong></p>
              <p>We do not guarantee:</p>
              <ul>
                <li>Uninterrupted or error-free platform operation</li>
                <li>Specific number of students or income</li>
                <li>Client satisfaction or retention</li>
                <li>Technical compatibility with all devices</li>
                <li>Specific search ranking or visibility</li>
              </ul>

              <h4>Limitation of Damages</h4>
              <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
              <ul>
                <li>Company's total liability is limited to the amount you earned in the 3 months prior to the claim</li>
                <li>Company is not liable for indirect, incidental, consequential, or punitive damages</li>
                <li>Company is not liable for lost profits, business interruption, or lost opportunities</li>
                <li>Company is not liable for third-party actions (client behavior, student injuries, etc.)</li>
              </ul>

              <h4>Tutor Liability</h4>
              <p>You acknowledge that:</p>
              <ul>
                <li>You are solely responsible for your conduct during tutoring sessions</li>
                <li>You maintain appropriate insurance for in-person sessions</li>
                <li>The Company may request proof of required insurance coverage at any time. Failure to provide proof upon request may result in account suspension or termination.</li>
                <li>Company is not liable for injuries, accidents, or damages occurring during sessions</li>
                <li>You are responsible for compliance with local laws and regulations</li>
              </ul>

              <h4>Indemnification</h4>
              <p>
                You agree to indemnify, defend, and hold harmless Growth Tutoring LLC, its members, managers, 
                officers, employees, and agents from:
              </p>
              <ul>
                <li>Claims arising from your negligence or misconduct</li>
                <li>Violations of these Terms or the Independent Contractor Agreement</li>
                <li>Injuries or damages during your tutoring sessions</li>
                <li>Breach of confidentiality or privacy violations</li>
                <li>Intellectual property infringement related to your materials</li>
                <li>Any third-party claims related to your services</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>16. Modifications to Terms</h3>
              
              <h4>Right to Modify</h4>
              <p>
                Company reserves the right to modify these Terms at any time. We will provide notice of material 
                changes by:
              </p>
              <ul>
                <li>Email notification to your registered email address</li>
                <li>In-platform notification banner</li>
                <li>Posting updated Terms with revised "Effective Date"</li>
              </ul>

              <h4>Notice Period</h4>
              <ul>
                <li>30 days advance notice for material changes</li>
                <li>Immediate effect for minor clarifications or legal compliance updates</li>
              </ul>

              <h4>Continued Use = Acceptance</h4>
              <p>
                Your continued use of the Platform after the notice period constitutes acceptance of the modified 
                Terms. If you do not agree to the changes:
              </p>
              <ul>
                <li>You may terminate your account before the effective date</li>
                <li>You will be paid for all completed sessions</li>
                <li>Non-solicitation obligations remain in effect</li>
              </ul>
            </section>

            <section className="tos-section">
              <h3>17. General Provisions</h3>
              
              <h4>Entire Agreement</h4>
              <p>
                These Terms, together with the Independent Contractor Agreement and Privacy Policy, constitute 
                the entire agreement between you and Growth Tutoring LLC regarding use of the Platform. In the 
                event of any conflict between this Agreement and the Independent Contractor Agreement, the 
                Independent Contractor Agreement shall govern with respect to tutor compensation, duties, and obligations.
              </p>

              <h4>Severability</h4>
              <p>
                If any provision of these Terms is found invalid or unenforceable, the remaining provisions remain 
                in full force and effect.
              </p>

              <h4>No Waiver</h4>
              <p>
                Company's failure to enforce any provision does not constitute a waiver of that provision or any 
                other provision.
              </p>

              <h4>Assignment</h4>
              <ul>
                <li>You may not assign or transfer these Terms or your account to any third party</li>
                <li>Company may assign these Terms to any successor or affiliate</li>
              </ul>

              <h4>Force Majeure</h4>
              <p>
                Neither party is liable for failure to perform obligations due to circumstances beyond their 
                reasonable control (natural disasters, pandemics, government actions, etc.).
              </p>

              <h4>Survival</h4>
              <p>The following sections survive termination:</p>
              <ul>
                <li>Non-Solicitation & Platform Loyalty (Section 11)</li>
                <li>Privacy & Confidentiality (Section 10)</li>
                <li>Intellectual Property (Section 12)</li>
                <li>Limitation of Liability (Section 15)</li>
                <li>Dispute Resolution (Section 14)</li>
                <li>Indemnification</li>
              </ul>

              <h4>Independent Contractor Relationship</h4>
              <p>
                Nothing in these Terms creates an employment, partnership, joint venture, or agency relationship. 
                You are an independent contractor solely responsible for your own taxes, insurance, and business 
                expenses.
              </p>

              <h4>Limited Liability Company Protection</h4>
              <p>
                Growth Tutoring LLC is a California limited liability company. No member, manager, officer, or 
                employee has personal liability for any obligations under these Terms. Your recourse is limited 
                to the Company's business assets.
              </p>
            </section>

            <section className="tos-section">
              <h3>18. Contact Information</h3>
              <p>For questions about these Terms or to report violations:</p>
              <p>
                <strong>Growth Tutoring LLC</strong><br />
                <strong>Email:</strong> info@growthtutoringhq.com<br />
                <strong>Phone:</strong> +1 (949) 232-0738
              </p>
            </section>

            <section className="tos-section">
              <h3>19. Acknowledgment</h3>
              <p>By creating an account and using the Growth Tutoring Platform, you acknowledge that:</p>
              <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                <li>✓ You have read and understood these Terms of Service</li>
                <li>✓ You agree to be bound by these Terms</li>
                <li>✓ You are at least 18 years of age</li>
                <li>✓ You will comply with all applicable laws and regulations</li>
                <li>✓ You understand that you are an independent contractor, not an employee</li>
                <li>✓ You have also read and will comply with the Independent Contractor Agreement</li>
                <li>✓ You understand the non-solicitation requirements and liquidated damages provisions</li>
                <li>✓ You consent to electronic communications and dispute resolution procedures</li>
              </ul>
              <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
                <strong>Last Updated:</strong> 01/31/2026<br />
                <strong>Version:</strong> 1.0
              </p>
            </section>

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

export default TutorTermsModal