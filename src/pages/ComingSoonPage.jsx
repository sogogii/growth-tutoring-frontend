/* Redirect to this page for any features unreleased */

import { Link } from 'react-router-dom'
import './ComingSoonPage.css'

function ComingSoonPage() {
  return (
    <div className="coming-soon-page">
      <section className="coming-soon-card">
        <h1>Coming soon</h1>
        <p>
          This feature is not ready yet, but it will be available soon.
          We&apos;re working on it behind the scenes to make sure it&apos;s
          simple, reliable, and helpful for students and families.
        </p>

        <p className="coming-soon-contact">
          Have questions?{" "}
          <Link to="/contact" className="contact-link">
            Contact us
          </Link>{" "}
            anytime.
        </p>

        <Link to="/" className="btn btn-primary coming-soon-button">
          Back to home
        </Link>
      </section>
    </div>
  )
}

export default ComingSoonPage