import { useState, useRef, useEffect } from 'react'
import './styles/ChatbotWidget.css'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm the Growth Tutoring assistant. Ask me anything about our platform: booking, pricing, tutors, or special needs support! 👋"
}
function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]

    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      // Send only role+content pairs (strip the initial assistant greeting from history
      // if it's just the welcome message — Claude doesn't need it as context)
      const apiMessages = updatedMessages
        .filter((m, i) => !(i === 0 && m.role === 'assistant'))
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch(`${API_BASE}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again or email info@growthtutoringhq.com.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE])
    setInput('')
  }

  return (
    <div className="chatbot-root">
      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">GT</div>
              <div>
                <div className="chatbot-header-name">Growth Assistant</div>
                <div className="chatbot-header-status">
                  <span className="chatbot-status-dot" />
                  Online
                </div>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                className="chatbot-icon-btn"
                onClick={handleReset}
                title="New conversation"
              >
                ↺
              </button>
              <button
                className="chatbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-message chatbot-message-${msg.role}`}
              >
                {msg.role === 'assistant' && (
                  <div className="chatbot-msg-avatar">GT</div>
                )}
                <div className="chatbot-bubble">{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message chatbot-message-assistant">
                <div className="chatbot-msg-avatar">GT</div>
                <div className="chatbot-bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              title="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'chatbot-toggle-open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Open chat assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  )
}

export default ChatbotWidget