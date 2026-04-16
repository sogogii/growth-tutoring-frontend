import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MeetingProvider,
  darkTheme,
  GlobalStyles,
  useMeetingManager,
  useLocalVideo,
  useToggleLocalMute,
  VideoTileGrid,
  ControlBar,
  ControlBarButton,
  Phone,
  Microphone,
  Camera,
  ContentShare,
  useContentShareControls,
  useRosterState,
} from 'amazon-chime-sdk-component-library-react'
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js'
import { ThemeProvider } from 'styled-components'
import Whiteboard from './Whiteboard'
import ChatPanel from './ChatPanel'
import ParticipantsPanel from './ParticipantsPanel'
import VirtualBackgroundPanel from './VirtualBackgroundPanel'
import PreJoinScreen from './PreJoinScreen'
import './styles/VirtualClassroom.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const PRESENCE_TOPIC = 'presence'

function SessionTimer({ requestedEnd }) {
  const [remaining, setRemaining] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    const tick = () => {
      const endTime = new Date(requestedEnd).getTime()
      const diff = endTime - Date.now()

      if (diff <= 0) {
        setRemaining('0:00')
        setUrgent(true)
        return
      }

      const totalSec = Math.floor(diff / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60

      setUrgent(totalSec <= 300) // red under 5 minutes
      setRemaining(
        h > 0
          ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${m}:${String(s).padStart(2, '0')}`
      )
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [requestedEnd])

  return (
    <div className={`session-timer ${urgent ? 'session-timer--urgent' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      {remaining}
    </div>
  )
}

function ConnectionQualityIndicator({ meetingManager, joined }) {
  const [quality, setQuality] = useState('good') // 'good' | 'poor' | 'bad'

  useEffect(() => {
    if (!joined) return
    const av = meetingManager?.audioVideo
    if (!av) return

    const observer = {
      connectionDidBecomeGood: () => setQuality('good'),
      connectionDidBecomePoor: () => setQuality('poor'),
      connectionDidSuggestStopVideo: () => setQuality('bad'),
    }

    av.addObserver(observer)
    return () => av.removeObserver(observer)
  }, [joined, meetingManager])

  const bars = [1, 2, 3, 4]
  const activeBars = quality === 'good' ? 4 : quality === 'poor' ? 2 : 1
  const color = quality === 'good' ? '#22c55e' : quality === 'poor' ? '#f59e0b' : '#ef4444'
  const label = quality === 'good' ? 'Good' : quality === 'poor' ? 'Poor' : 'Bad'

  return (
    <div className="conn-quality" title={`Connection: ${label}`}>
      <div className="conn-bars">
        {bars.map(b => (
          <div
            key={b}
            className="conn-bar"
            style={{
              height: `${b * 4}px`,
              background: b <= activeBars ? color : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
      <span className="conn-label" style={{ color }}>{label}</span>
    </div>
  )
}

function ClassroomInner({ sessionRequestId, currentUser, onClose }) {
  const meetingManager = useMeetingManager()
  const { isVideoEnabled, toggleVideo } = useLocalVideo()
  const { muted, toggleMute } = useToggleLocalMute()
  const { toggleContentShare } = useContentShareControls()
  const { roster } = useRosterState()
  const navigate = useNavigate()

  const [meetingId, setMeetingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joined, setJoined] = useState(false)
  const [copied, setCopied] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [panel, setPanel] = useState(null) // null | 'whiteboard' | 'chat' | 'participants'
  const [unreadChat, setUnreadChat] = useState(0)
  const [showVBG, setShowVBG] = useState(false)
  const [vbgActive, setVbgActive] = useState('none')

  // attendeeId → { name, role }
  const [nameMap, setNameMap] = useState({})
  const [myAttendeeId, setMyAttendeeId] = useState(null)

  const [requestedEnd, setRequestedEnd] = useState(null)

  const [pos, setPos] = useState({ right: 24, bottom: 24 })
  const posRef = useRef(pos)
  posRef.current = pos

  const [pipSize, setPipSize] = useState({ width: 320, height: 260 })
  const pipSizeRef = useRef(pipSize)
  pipSizeRef.current = pipSize

  const [pipHidden, setPipHidden] = useState(false)
  const containerRef = useRef(null)
  const isDraggingRef = useRef(false)

  const isTutor = currentUser?.role === 'TUTOR'
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : 'Unknown'
  const role = isTutor ? 'Tutor' : 'Student'

  const [preJoinDone, setPreJoinDone] = useState(false)
  const [preJoinPrefs, setPreJoinPrefs] = useState(null)

  const [confirmEnd, setConfirmEnd] = useState(false)

  // Tutor: create meeting on load
  useEffect(() => {
    if (currentUser && isTutor && preJoinDone) {
      handleCreateMeeting()
    }
  }, [currentUser, preJoinDone])

  // Student: poll every 5 seconds until tutor opens classroom
  useEffect(() => {
    if (!currentUser || isTutor || joined || !preJoinDone) return
    setLoading(false)

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/classroom/${sessionRequestId}/join`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          }
        )

        if (!res.ok) return  // tutor hasn't opened yet — keep polling

        clearInterval(interval)
        const data = await res.json()  // read body exactly once
        setRequestedEnd(data.requestedEnd)
        await joinChimeMeeting(null, data.attendee)
      } catch (err) {
        // keep polling on network errors
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [currentUser, joined, preJoinDone])

  // Subscribe to presence broadcasts from other participants
  useEffect(() => {
    if (!joined) return
    const av = meetingManager?.audioVideo
    if (!av) return

    const handler = (dataMessage) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(dataMessage.data))
        if (data.type === 'presence' && data.attendeeId) {
          setNameMap(prev => ({
            ...prev,
            [data.attendeeId]: { name: data.name, role: data.role },
          }))

          // Reply with own presence when someone announces
          if (data.attendeeId !== myAttendeeId) {
            broadcastPresence(av)
          }
        }
      } catch (e) {}
    }

    av.realtimeSubscribeToReceiveDataMessage(PRESENCE_TOPIC, handler)
    return () => av.realtimeUnsubscribeFromReceiveDataMessage(PRESENCE_TOPIC)
  }, [joined, meetingManager, myAttendeeId])

  useEffect(() => {
    if (!joined || !requestedEnd) return

    const endTime = new Date(requestedEnd).getTime() + 60 * 1000 // +1 minute
    const now = Date.now()
    const delay = endTime - now

    if (delay <= 0) {
      // already past end time + 1 min
      handleEndMeeting()
      return
    }

    // Warning at 5 minutes before
    let warnTimeout
    const warnDelay = delay - 5 * 60 * 1000
    if (warnDelay > 0) {
      warnTimeout = setTimeout(() => {
        alert('This session will end in 5 minutes.')
      }, warnDelay)
    }

    const endTimeout = setTimeout(() => {
      alert('Session time has ended. The classroom is now closing.')
      handleEndMeeting()
    }, delay)

    return () => {
      clearTimeout(endTimeout)
      clearTimeout(warnTimeout)
    }
  }, [joined, requestedEnd])

  const broadcastPresence = (av) => {
    if (!av || !myAttendeeId) return
    try {
      const payload = JSON.stringify({
        type: 'presence',
        attendeeId: myAttendeeId,
        name: displayName,
        role,
      })
      av.realtimeSendDataMessage(PRESENCE_TOPIC, new TextEncoder().encode(payload), 30000)
    } catch (e) {}
  }

  // Announce own presence after joining + every 30 seconds
  useEffect(() => {
    if (!joined || !myAttendeeId) return
    const av = meetingManager?.audioVideo
    if (!av) return

    // Register self in nameMap immediately
    setNameMap(prev => ({
      ...prev,
      [myAttendeeId]: { name: displayName, role },
    }))

    // Announce to others
    broadcastPresence(av)

    const interval = setInterval(() => broadcastPresence(av), 30000)
    return () => clearInterval(interval)
  }, [joined, myAttendeeId])

  // Clear unread when chat panel opens
  useEffect(() => {
    if (panel === 'chat') setUnreadChat(0)
  }, [panel])

  useEffect(() => {
    if (!minimized) return
    const onMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setPipHidden(true)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [minimized])

  const handleCreateMeeting = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `${API_BASE}/api/classroom/${sessionRequestId}/create`,
        { method: 'POST', credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to create meeting')
      const data = await res.json()
      setMeetingId(data.meeting.meetingId)
      setRequestedEnd(data.requestedEnd)
      await joinChimeMeeting(data.meeting, data.attendee)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const joinChimeMeeting = async (meeting, attendee) => {
    const config = new MeetingSessionConfiguration(meeting, attendee)
    await meetingManager.join(config)
    await meetingManager.start()

    // Apply pre-join preferences
    if (preJoinPrefs) {
      if (preJoinPrefs.audioDeviceId) {
        await meetingManager.audioVideo?.startAudioInput(preJoinPrefs.audioDeviceId)
      }
      if (!preJoinPrefs.micOn) {
        meetingManager.audioVideo?.realtimeMuteLocalAudio()
      }
      if (preJoinPrefs.cameraOn && preJoinPrefs.videoDeviceId) {
        await meetingManager.audioVideo?.startVideoInput(preJoinPrefs.videoDeviceId)
        meetingManager.audioVideo?.startLocalVideoTile()
      }
    }

    setMyAttendeeId(attendee.attendeeId)
    setJoined(true)
  }

  const handleEndMeeting = async () => {
    await meetingManager.leave()
    if (isTutor && meetingId) {
      await fetch(`${API_BASE}/api/classroom/${sessionRequestId}/end`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId }),
      })
    }
    onClose()
  }

  const handleCopyMeetingId = () => {
    if (!meetingId) return
    navigator.clipboard.writeText(meetingId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const togglePanel = (name) => {
    setPanel(prev => prev === name ? null : name)
    if (name === 'chat') setUnreadChat(0)
  }

  const handleDragStart = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return
    e.preventDefault()
    isDraggingRef.current = true

    const startX = e.clientX
    const startY = e.clientY
    const startRight = posRef.current.right
    const startBottom = posRef.current.bottom

    const onMove = (e) => {
      setPos({
        right: Math.max(0, startRight + (startX - e.clientX)),
        bottom: Math.max(0, startBottom + (startY - e.clientY)),
      })
    }
    const onUp = () => {
      isDraggingRef.current = false 
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const handleResizeStart = (e, direction) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    const startW = pipSizeRef.current.width
    const startH = pipSizeRef.current.height
    const startRight = posRef.current.right
    const startBottom = posRef.current.bottom

    const onMove = (e) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      let newW = startW
      let newH = startH
      let newRight = startRight
      let newBottom = startBottom

      if (direction.includes('left'))  { newW = Math.max(260, startW - dx) }
      if (direction.includes('right')) { newW = Math.max(260, startW + dx); newRight = Math.max(0, startRight - dx) }
      if (direction.includes('top'))   { newH = Math.max(200, startH - dy) }
      if (direction.includes('bottom')){ newH = Math.max(200, startH + dy); newBottom = Math.max(0, startBottom - dy) }

      setPipSize({ width: newW, height: newH })
      setPos({ right: newRight, bottom: newBottom })
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Pre-join ──
  if (!preJoinDone) {
    return (
      <PreJoinScreen
        currentUser={currentUser}
        isTutor={isTutor}
        onJoin={(prefs) => {
          setPreJoinPrefs(prefs)
          setPreJoinDone(true)
        }}
      />
    )
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="classroom-loading classroom-page-root">
        <div className="classroom-loading-spinner" />
        <p className="classroom-loading-text">
          {isTutor ? 'Setting up your classroom…' : 'Connecting to classroom…'}
        </p>
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="classroom-error classroom-page-root">
        <div className="classroom-error-icon">⚠️</div>
        <p className="classroom-error-text">{error}</p>
        <button className="classroom-error-back" onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  // ── Student waiting ──
  if (!joined && !isTutor) {
    return (
      <div className="classroom-join-screen classroom-page-root">
        <div className="join-card">
          <div className="join-brand">
            <div className="join-brand-dot">G</div>
            <span className="join-brand-name">Growth Tutoring</span>
          </div>
          <h2 className="join-title">Waiting for tutor</h2>
          <p className="join-subtitle">
            Your tutor hasn't opened the classroom yet. You'll be connected automatically when they do.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <div className="classroom-loading-spinner" />
          </div>
        </div>
      </div>
    )
  }

  // ── Active classroom ──
  return (
    <>
      <div
        ref={containerRef}
        className={`classroom-container classroom-page-root ${minimized ? 'classroom-minimized' : ''} ${minimized && pipHidden ? 'classroom-pip-hidden' : ''}`}
        style={minimized ? {
          right: pos.right,
          bottom: pos.bottom,
          width: pipSize.width,
          height: pipSize.height,
        } : {}}
      >
        {/* Header */}
        <div
          className="classroom-header"
          onMouseDown={minimized ? handleDragStart : undefined}
          style={{ cursor: minimized ? 'grab' : 'default' }}
        >
          <div className="classroom-header-left">
            <div className="classroom-header-logo">G</div>
            <h2>Virtual Classroom</h2>
            <div className="classroom-header-sep" />
            <div className="classroom-live-badge">
              <span className="classroom-live-dot" />
              Live
            </div>

            {requestedEnd && joined && (
              <SessionTimer requestedEnd={requestedEnd} />
            )}
          </div>

          <div className="classroom-header-right">
            {joined && (
              <ConnectionQualityIndicator
                meetingManager={meetingManager}
                joined={joined}
              />
            )}
            {isTutor && meetingId && !minimized && (
              <div className="meeting-id-display">
                <span>Meeting ID:</span>
                <strong>{meetingId}</strong>
                <button className="meeting-id-copy" onClick={handleCopyMeetingId}>
                  {copied ? '✓' : '⧉'}
                </button>
              </div>
            )}

            {!minimized && (
              <>
                <button
                  className={`classroom-panel-btn ${panel === 'whiteboard' ? 'classroom-panel-btn--active' : ''}`}
                  onClick={() => togglePanel('whiteboard')}
                  title="Whiteboard"
                >
                  <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  Board
                </button>

                <button
                  className={`classroom-panel-btn ${panel === 'chat' ? 'classroom-panel-btn--active' : ''}`}
                  onClick={() => togglePanel('chat')}
                  title="Chat"
                >
                  <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Chat
                  {unreadChat > 0 && (
                    <span className="classroom-unread">{unreadChat}</span>
                  )}
                </button>
              </>
            )}

            <button
              className="classroom-minimize-btn"
              onClick={() => {
                setMinimized(m => !m)
                if (!minimized) setPanel(null)
                setPipHidden(false)
              }}
              title={minimized ? 'Restore' : 'Minimize'}
            >
              {minimized ? '⤢' : '⤡'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="classroom-body">
          <div className="classroom-video">
            <VideoTileGrid />
          </div>

          {panel === 'participants' && !minimized && (
            <ParticipantsPanel
              nameMap={nameMap}
              currentAttendeeId={myAttendeeId}
              onClose={() => setPanel(null)}
            />
          )}

          {panel === 'whiteboard' && !minimized && (
            <Whiteboard onClose={() => setPanel(null)} />
          )}

          {panel === 'chat' && !minimized && (
            <ChatPanel
              currentUser={currentUser}
              onClose={() => setPanel(null)}
              onNewMessage={() => {
                if (panel !== 'chat') setUnreadChat(c => c + 1)
              }}
            />
          )}

          {showVBG && (
            <VirtualBackgroundPanel
              meetingManager={meetingManager}
              isVideoEnabled={isVideoEnabled}
              onClose={() => setShowVBG(false)}
              active={vbgActive}
              setActive={setVbgActive}
            />
          )}
        </div>

        {/* Controls */}
        <div className="classroom-controls">
          <div className="ctrl-bar">
            {!minimized && (
              <>
                <button
                  className={`ctrl-btn ${panel === 'participants' ? 'ctrl-btn--active' : ''}`}
                  onClick={() => togglePanel('participants')}
                >
                  <svg className="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span className="ctrl-label">People</span>
                </button>
                <div className="ctrl-sep" />
              </>
            )}

            <button className={`ctrl-btn ${muted ? 'ctrl-btn--off' : ''}`} onClick={toggleMute}>
              <svg className="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {muted
                  ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                  : <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                }
              </svg>
              <span className="ctrl-label">{muted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button className={`ctrl-btn ${!isVideoEnabled ? 'ctrl-btn--off' : ''}`} onClick={toggleVideo}>
              <svg className="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {!isVideoEnabled
                  ? <><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="M15 7l5-5 1 1-5 5"/><polygon points="23 7 16 12 23 17 23 7"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>
                }
              </svg>
              <span className="ctrl-label">{isVideoEnabled ? 'Stop Video' : 'Start Video'}</span>
            </button>

            <button className="ctrl-btn" onClick={toggleContentShare}>
              <svg className="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M9 9l3-3 3 3"/><path d="M12 6v7"/></svg>
              <span className="ctrl-label">Share Screen</span>
            </button>

            <button
              className={`ctrl-btn ${showVBG ? 'ctrl-btn--active' : ''}`}
              onClick={() => setShowVBG(v => !v)}
              title="Virtual Background"
            >
              <svg className="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
              <span className="ctrl-label">Background</span>
            </button>

            <div className="ctrl-sep" />

            <button className="ctrl-btn ctrl-btn--end" onClick={() => setConfirmEnd(true)}>
              <svg className="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
              <span className="ctrl-label">{isTutor ? 'End Session' : 'Leave'}</span>
            </button>
          </div>
        </div>

        {minimized && (
          <>
            <div className="pip-handle pip-handle--top"          onMouseDown={e => handleResizeStart(e, 'top')} />
            <div className="pip-handle pip-handle--bottom"       onMouseDown={e => handleResizeStart(e, 'bottom')} />
            <div className="pip-handle pip-handle--left"         onMouseDown={e => handleResizeStart(e, 'left')} />
            <div className="pip-handle pip-handle--right"        onMouseDown={e => handleResizeStart(e, 'right')} />
            <div className="pip-handle pip-handle--top-left"     onMouseDown={e => handleResizeStart(e, 'top-left')} />
            <div className="pip-handle pip-handle--top-right"    onMouseDown={e => handleResizeStart(e, 'top-right')} />
            <div className="pip-handle pip-handle--bottom-left"  onMouseDown={e => handleResizeStart(e, 'bottom-left')} />
            <div className="pip-handle pip-handle--bottom-right" onMouseDown={e => handleResizeStart(e, 'bottom-right')} />
          </>
        )}
      </div>

      {minimized && pipHidden && (
        <button
          className="pip-restore-tab"
          style={{ right: pos.right, bottom: pos.bottom }}
          onClick={() => setPipHidden(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Live Session
        </button>
      )}

      {confirmEnd && (
        <div className="classroom-confirm-overlay">
          <div className="classroom-confirm-dialog">
            <h3>{isTutor ? 'End session?' : 'Leave session?'}</h3>
            <p>
              {isTutor
                ? 'This will end the session for everyone in the room.'
                : 'You will leave the session. The tutor and others will remain.'}
            </p>
            <div className="classroom-confirm-actions">
              <button className="classroom-confirm-cancel" onClick={() => setConfirmEnd(false)}>
                Stay
              </button>
              <button className="classroom-confirm-end" onClick={() => { setConfirmEnd(false); handleEndMeeting() }}>
                {isTutor ? 'End Session' : 'Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function VirtualClassroom({ currentUser, sessionRequestId, onClose }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyles />
      <MeetingProvider>
        <ClassroomInner 
          sessionRequestId={sessionRequestId} 
          currentUser={currentUser} 
          onClose={onClose} 
        />
      </MeetingProvider>
    </ThemeProvider>
  )
}