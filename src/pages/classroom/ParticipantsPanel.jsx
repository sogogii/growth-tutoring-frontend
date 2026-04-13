import { useRosterState, useAttendeeStatus } from 'amazon-chime-sdk-component-library-react'

function AttendeeRow({ attendeeId, nameMap, currentAttendeeId }) {
  const { muted, videoEnabled } = useAttendeeStatus(attendeeId)
  const info = nameMap[attendeeId] || {}
  const name = info.name || 'Connecting…'
  const role = info.role || ''
  const isMe = attendeeId === currentAttendeeId
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="participants-row">
      <div className="participants-avatar">{initial}</div>
      <div className="participants-info">
        <span className="participants-name">
          {name}
          {isMe && <span className="participants-you">You</span>}
        </span>
        {role && <span className="participants-role">{role}</span>}
      </div>
      <div className="participants-status">
        <svg className={`p-icon ${muted ? 'p-icon--off' : 'p-icon--on'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        <svg className={`p-icon ${videoEnabled ? 'p-icon--on' : 'p-icon--off'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      </div>
    </div>
  )
}

export default function ParticipantsPanel({ nameMap, currentAttendeeId, onClose }) {
  const { roster } = useRosterState()
  const attendeeIds = Object.keys(roster)

  return (
    <div className="participants-panel">
      <div className="participants-header">
        <span className="participants-title">
          Participants
          <span className="participants-count">{attendeeIds.length}</span>
        </span>
        <button className="participants-close" onClick={onClose}>✕</button>
      </div>

      <div className="participants-list">
        {attendeeIds.length === 0 && (
          <div className="participants-empty">No participants yet</div>
        )}
        {attendeeIds.map(id => (
          <AttendeeRow
            key={id}
            attendeeId={id}
            nameMap={nameMap}
            currentAttendeeId={currentAttendeeId}
          />
        ))}
      </div>
    </div>
  )
}