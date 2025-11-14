import './styles/ContactPage.css'

function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // For now we just prevent reload.
    // Later you can hook this up to email / backend.
  }

  return (
    <div className="contact-page">
      {/* Top banner */}
      <section className="contact-hero">
        <h1>Contact Us</h1>
      </section>

      {/* Email + Phone + AI assistant */}
      <section className="contact-row">
        <div className="contact-left">
          <h2>
            Email:{" "}
            <span className="contact-inline">info@growthtutoringhq.com</span>
          </h2>
          <p className="contact-note">
            Please note that it may take 3–5 business days for us to get back to you.
            For more urgent questions, call our official number or use our Growth AI chatbox.
          </p>

          <h2>
            Phone Number:{" "}
            <span className="contact-inline">+1 (949)520–0269</span>
          </h2>
          <p className="contact-note">
            We are currently available Monday–Friday, 9am–5pm.
          </p>
        </div>

        <div className="contact-right">
          <h2 className="contact-ai-title">Growth AI</h2>
          <p className="contact-ai-desc">
            We use a simple matching process to pair students with tutors who fit their learning style.
            After each session, tutors send a structured progress report to parents.
          </p>

          <div className="contact-ai-card">
            <div className="contact-ai-icon">💬</div>
            <h3>Growth Chatbox</h3>
            <p>
              Ask questions about subjects, scheduling, or tutoring.  
              Your future AI assistant can live here on the website.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback form */}
      <section className="contact-feedback">
        <h2>Leave a Feedback</h2>

        <form className="contact-form" onSubmit={handleSubmit}>
          <textarea
            className="contact-textarea"
            placeholder="Add your comments..."
            rows={5}
          />
          <button type="submit" className="btn contact-submit">
            Submit
          </button>
        </form>
      </section>
    </div>
  )
}

export default ContactPage