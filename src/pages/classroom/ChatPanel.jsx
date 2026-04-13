import { useEffect, useRef, useState, useCallback } from 'react'
import { useMeetingManager } from 'amazon-chime-sdk-component-library-react'

const TOPIC = 'chat'

export default function ChatPanel({ currentUser, onClose, onNewMessage }) {
  const meetingManager = useMeetingManager()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const displayName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'You'
  const role = currentUser?.role === 'TUTOR' ? 'Tutor' : 'Student'

  useEffect(() => {
    const av = meetingManager?.audioVideo
    if (!av) return
    const handler = (dataMessage) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(dataMessage.data))
        setMessages(prev => [...prev, { ...data, remote: true, id: Date.now() + Math.random() }])
        if (onNewMessage) onNewMessage()
      } catch (e) {}
    }
    av.realtimeSubscribeToReceiveDataMessage(TOPIC, handler)
    return () => av.realtimeUnsubscribeFromReceiveDataMessage(TOPIC)
  }, [meetingManager])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text) return
    const av = meetingManager?.audioVideo
    if (!av) return
    const payload = { text, name: displayName, role, ts: Date.now() }
    try {
      av.realtimeSendDataMessage(TOPIC, new TextEncoder().encode(JSON.stringify(payload)), 30000)
    } catch (e) {}
    setMessages(prev => [...prev, { ...payload, remote: false, id: Date.now() }])
    setInput('')
    inputRef.current?.focus()
  }, [input, meetingManager, displayName, role])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-title">Chat</span>
        <button className="chat-close" onClick={onClose}>✕</button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>No messages yet.</p>
            <p>Send a message to start the conversation.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.remote ? 'chat-msg--remote' : 'chat-msg--self'}`}>
            {msg.remote && (
              <div className="chat-msg-meta">
                <span className="chat-msg-name">{msg.name}</span>
                <span className="chat-msg-role">{msg.role}</span>
              </div>
            )}
            <div className="chat-bubble">{msg.text}</div>
            <div className="chat-msg-time">{formatTime(msg.ts)}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <textarea
          ref={inputRef} className="chat-input" placeholder="Send a message…"
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1}
        />
        <button className="chat-send" onClick={sendMessage} disabled={!input.trim()}>➤</button>
      </div>
    </div>
  )
}