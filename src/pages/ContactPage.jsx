import { useState } from 'react'

const labelStyle = {
  display: 'block',
  marginBottom: '12px',
  fontSize: '14px'
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  marginTop: '4px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '14px',
  boxSizing: 'border-box'
}

function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    // TODO: connect to backend or email service later
    console.log('Contact form submitted:', form)
    setSubmitted(true)
  }

  return (
    <div>
      <h1>Contact Us</h1>
      <p style={{ marginTop: '12px', maxWidth: '600px' }}>
        For lesson inquiries, subject questions, or tutor recommendations, please fill out the
        form below. We will get back to you by email as soon as possible.
      </p>

      {submitted ? (
        <p style={{ marginTop: '24px', color: 'green' }}>
          Thank you for your message. We will email you soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '24px', maxWidth: '480px' }}>
          <label style={labelStyle}>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>

          <button
            type="submit"
            style={{
              marginTop: '8px',
              padding: '10px 18px',
              borderRadius: '6px',
              border: 'none',
              background: '#111827',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  )
}

export default ContactPage
