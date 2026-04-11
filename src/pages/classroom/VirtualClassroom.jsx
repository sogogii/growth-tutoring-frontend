import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MeetingProvider,
  lightTheme,
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
} from 'amazon-chime-sdk-component-library-react'
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js'
import styled, { ThemeProvider } from 'styled-components'
import './styles/VirtualClassroom.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function ClassroomInner({ sessionRequestId, currentUser }) {
  const meetingManager = useMeetingManager()
  const { isVideoEnabled, toggleVideo } = useLocalVideo()
  const { muted, toggleMute } = useToggleLocalMute()
  const { toggleContentShare } = useContentShareControls()
  const navigate = useNavigate()

  const [meetingId, setMeetingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joined, setJoined] = useState(false)

  const isTutor = currentUser?.role === 'TUTOR'

  useEffect(() => {
    if (currentUser) {
      isTutor ? handleCreateMeeting() : null
    }
  }, [currentUser])

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
      await joinChimeMeeting(data.meeting, data.attendee)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinMeeting = async (meetingIdToJoin) => {
    try {
      setLoading(true)
      const res = await fetch(
        `${API_BASE}/api/classroom/${sessionRequestId}/join`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: meetingIdToJoin }),
        }
      )
      if (!res.ok) throw new Error('Failed to join meeting')
      const data = await res.json()
      await joinChimeMeeting(null, data.attendee)
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
    navigate(-1)
  }

  if (loading) return <div className="classroom-loading">Setting up classroom...</div>
  if (error) return <div className="classroom-error">Error: {error}</div>

  if (!joined && !isTutor) {
    return (
      <div className="classroom-join-screen">
        <h2>Join Classroom</h2>
        <p>Enter the Meeting ID provided by your tutor</p>
        <input
          type="text"
          placeholder="Meeting ID"
          className="meeting-id-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleJoinMeeting(e.target.value)
          }}
        />
        <button
          className="btn-join"
          onClick={(e) => {
            const input = e.target.previousSibling
            handleJoinMeeting(input.value)
          }}
        >
          Join
        </button>
      </div>
    )
  }

  return (
    <div className="classroom-container">
      <div className="classroom-header">
        <h2>Virtual Classroom</h2>
        {isTutor && meetingId && (
          <div className="meeting-id-display">
            Meeting ID: <strong>{meetingId}</strong>
          </div>
        )}
      </div>

      <div className="classroom-video">
        <VideoTileGrid />
      </div>

      <div className="classroom-controls">
        <ControlBar layout="undocked-horizontal" showLabels>
          <ControlBarButton
            icon={<Microphone muted={muted} />}
            onClick={toggleMute}
            label={muted ? 'Unmute' : 'Mute'}
          />
          <ControlBarButton
            icon={<Camera disabled={!isVideoEnabled} />}
            onClick={toggleVideo}
            label={isVideoEnabled ? 'Stop Video' : 'Start Video'}
          />
          <ControlBarButton
            icon={<ContentShare />}
            onClick={toggleContentShare}
            label="Share Screen"
          />
          <ControlBarButton
            icon={<Phone />}
            onClick={handleEndMeeting}
            label={isTutor ? 'End Meeting' : 'Leave'}
          />
        </ControlBar>
      </div>
    </div>
  )
}

export default function VirtualClassroom({ currentUser }) {
  const { sessionRequestId } = useParams()

  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyles />
      <MeetingProvider>
        <ClassroomInner
          sessionRequestId={sessionRequestId}
          currentUser={currentUser}
        />
      </MeetingProvider>
    </ThemeProvider>
  )
}