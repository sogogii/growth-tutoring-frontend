import { useEffect, useRef, useState } from 'react'
import './styles/PreJoinScreen.css'

export default function PreJoinScreen({ currentUser, isTutor, onJoin }) {
  const [micOn, setMicOn]       = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [devices, setDevices]   = useState({ audio: [], video: [] })
  const [selectedAudio, setSelectedAudio] = useState('')
  const [selectedVideo, setSelectedVideo] = useState('')
  const [permError, setPermError] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Request permissions and enumerate devices
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream

        const all = await navigator.mediaDevices.enumerateDevices()
        const audio = all.filter(d => d.kind === 'audioinput')
        const video = all.filter(d => d.kind === 'videoinput')
        setDevices({ audio, video })
        if (audio[0]) setSelectedAudio(audio[0].deviceId)
        if (video[0]) setSelectedVideo(video[0].deviceId)

        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (e) {
        setPermError('Camera/microphone access denied. You can still join without them.')
      }
    }
    init()
    return () => streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  // Update preview when camera toggle or device changes
  useEffect(() => {
    if (!videoRef.current) return
    if (!cameraOn) {
      videoRef.current.srcObject = null
      streamRef.current?.getVideoTracks().forEach(t => { t.enabled = false })
    } else {
      streamRef.current?.getVideoTracks().forEach(t => { t.enabled = true })
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current
      }
    }
  }, [cameraOn])

  const handleJoin = () => {
    // Stop preview stream — Chime will open its own
    streamRef.current?.getTracks().forEach(t => t.stop())
    onJoin({ micOn, cameraOn, audioDeviceId: selectedAudio, videoDeviceId: selectedVideo })
  }

  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : 'Guest'

  return (
    <div className="prejoin-root">
      <div className="prejoin-card">

        {/* Brand */}
        <div className="prejoin-brand">
          <div className="prejoin-brand-dot">G</div>
          <span>Growth Tutoring</span>
        </div>

        <h2 className="prejoin-title">
          {isTutor ? 'Open your classroom' : 'Ready to join?'}
        </h2>
        <p className="prejoin-sub">Joining as <strong>{displayName}</strong></p>

        {/* Camera preview */}
        <div className="prejoin-preview">
          {cameraOn
            ? <video ref={videoRef} autoPlay muted playsInline className="prejoin-video" />
            : <div className="prejoin-no-video">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/>
                  <path d="M15 7l5-5 1 1-5 5"/>
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <span>Camera is off</span>
              </div>
          }
        </div>

        {permError && <p className="prejoin-perm-error">{permError}</p>}

        {/* Toggle buttons */}
        <div className="prejoin-toggles">
          <button
            className={`prejoin-toggle ${!micOn ? 'prejoin-toggle--off' : ''}`}
            onClick={() => setMicOn(v => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
              {micOn
                ? <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                : <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
              }
            </svg>
            {micOn ? 'Mic on' : 'Mic off'}
          </button>

          <button
            className={`prejoin-toggle ${!cameraOn ? 'prejoin-toggle--off' : ''}`}
            onClick={() => setCameraOn(v => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
              {cameraOn
                ? <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>
                : <><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="M15 7l5-5 1 1-5 5"/><polygon points="23 7 16 12 23 17 23 7"/><line x1="1" y1="1" x2="23" y2="23"/></>
              }
            </svg>
            {cameraOn ? 'Camera on' : 'Camera off'}
          </button>
        </div>

        {/* Device selectors */}
        {devices.audio.length > 1 && (
          <div className="prejoin-device-row">
            <label>Microphone</label>
            <select value={selectedAudio} onChange={e => setSelectedAudio(e.target.value)}>
              {devices.audio.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
            </select>
          </div>
        )}
        {devices.video.length > 1 && (
          <div className="prejoin-device-row">
            <label>Camera</label>
            <select value={selectedVideo} onChange={e => setSelectedVideo(e.target.value)}>
              {devices.video.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>)}
            </select>
          </div>
        )}

        <button className="prejoin-join-btn" onClick={handleJoin}>
          {isTutor ? 'Open Classroom' : 'Join Classroom'}
        </button>
      </div>
    </div>
  )
}