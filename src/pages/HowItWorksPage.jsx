function HowItWorksPage() {
  return (
    <div className="how-page">
      {/* Top banner */}
      <section className="how-hero">
        <h1>How It Works</h1>
      </section>

      {/* For Students & Parents – regular program */}
      <section className="how-section">
        <h2>For Students &amp; Parents</h2>
        <ol className="how-list">
          <li>Create an account, sign in, or continue as a guest.</li>
          <li>Tell us about the student&apos;s needs and goals.</li>
          <li>Search or use Growth AI to find tutors or courses that are the best fit.</li>
          <li>Review matched tutor profiles or courses.</li>
          <li>Book a trial lesson or online course.</li>
          <li>Parents receive a summary report after each lesson from the tutor.</li>
          <li>Provide feedback after each session.</li>
          <li>Continue with tutors who are the right fit.</li>
        </ol>
      </section>

      {/* For tutors – regular program */}
      <section className="how-section">
        <h2>For Tutors</h2>
        <ol className="how-list">
          <li>Apply by clicking &quot;Join Us&quot; on the website.</li>
          <li>Fill out the tutor application.</li>
          <li>Complete a background check.</li>
          <li>Complete an online interview.</li>
          <li>
            Set your hourly rate and availability (minimum rates may apply for certain programs).
          </li>
          <li>Get matched with students.</li>
          <li>Teach and submit progress reports after each session.</li>
          <li>Get paid per session, with bonuses for high–performing tutors.</li>
          <li>
            Tutors with strong performance and ratings may be considered for additional
            opportunities.
          </li>
        </ol>
        <p className="how-note">
          Note: Growth Tutoring operates on a commission–based model to support marketing, student
          acquisition, and platform services. Specific terms may vary and are discussed during the
          interview process.
        </p>
      </section>

      {/* Community Impact Program */}
      <section className="how-section">
        <h2>For Community Impact Program (CIP)</h2>

        <h3>For Volunteers</h3>
        <ol className="how-list">
          <li>Apply by clicking &quot;Join Us&quot; on the website.</li>
          <li>Fill out the CIP volunteer application.</li>
          <li>Complete a background check.</li>
          <li>Complete an online interview.</li>
          <li>Set your availability.</li>
          <li>Get matched with students while the program is running.</li>
          <li>Your hours are documented, and proof of service can be provided if needed.</li>
          <li>
            We will issue awards or certifications for top–performing volunteers when possible.
          </li>
        </ol>

        <h3>For Tutors (CIP)</h3>
        <ol className="how-list">
          <li>Apply by clicking &quot;Join Us&quot; on the website.</li>
          <li>
            Fill out the CIP tutor application, or if currently a tutor, contact us to be
            considered for the program.
          </li>
          <li>Complete a background check (may be waived for current tutors).</li>
          <li>Complete or update an online interview.</li>
          <li>
            Set your hourly rate and availability within the CIP rate guidelines for grant–funded
            programs.
          </li>
          <li>Get matched with students.</li>
          <li>Teach and submit progress reports.</li>
          <li>Get paid per session with no commission fee for CIP sessions.</li>
        </ol>

        <h3>For Students &amp; Parents (CIP)</h3>
        <ol className="how-list">
          <li>Go to the About Us or program page and select Community Impact Program.</li>
          <li>Check if the program is open; if not, join the waitlist.</li>
          <li>Complete a brief application.</li>
          <li>Tell us about the student&apos;s needs and goals.</li>
          <li>
            Search or use Growth AI to find tutors and volunteers who are the best fit for the
            student.
          </li>
          <li>
            Connect with tutors or volunteers if the program is available, or receive updates if it
            is temporarily closed.
          </li>
          <li>Receive a summary report after each lesson from the tutor or volunteer.</li>
          <li>Provide feedback after each session.</li>
        </ol>

        <p className="how-note">
          Note: Participation in the Community Impact Program is dependent on grant funding. Growth
          Tutoring may adjust or discontinue the program if funding is unavailable. We aim to
          partner with local organizations to provide technology and other support when possible,
          but this cannot be guaranteed.
        </p>
      </section>
    </div>
  )
}

export default HowItWorksPage