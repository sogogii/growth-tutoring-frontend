import { useEffect, useRef, useState } from 'react'
import {
  BackgroundBlurVideoFrameProcessor,
  BackgroundReplacementVideoFrameProcessor,
  DefaultVideoTransformDevice,
  isVideoTransformDevice,
} from 'amazon-chime-sdk-js'

const BACKGROUNDS = [
  { id: 'none',    label: 'None',    color: null,      image: null },
  { id: 'blur',    label: 'Blur',    color: null,      image: null },
  { id: 'office',  label: 'Office',  color: null,      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1280&q=80' },
  { id: 'library', label: 'Library', color: null,      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1280&q=80' },
  { id: 'nature',  label: 'Nature',  color: null,      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&q=80' },
  { id: 'dark',    label: 'Dark',    color: '#1a1a2e', image: null },
  { id: 'purple',  label: 'Purple',  color: '#4c1d95', image: null },
]

const noopLogger = {
  info:  () => {},
  warn:  () => {},
  error: () => {},
  debug: () => {},
}

export default function VirtualBackgroundPanel({ meetingManager, isVideoEnabled, onClose, active, setActive }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const processorRef = useRef(null)
  const rawDeviceIdRef = useRef(null)  // always stores the plain device ID string

  // Capture the raw device ID once on mount
  useEffect(() => {
    const capture = async () => {
      try {
        const av = meetingManager?.audioVideo
        if (!av) return
        const devices = await av.listVideoInputDevices()
        if (devices?.length > 0) {
          rawDeviceIdRef.current = devices[0].deviceId
        }
      } catch (e) {
        console.warn('Could not capture device ID:', e)
      }
    }
    capture()
  }, [meetingManager])

  const clearProcessor = async () => {
    try {
      if (processorRef.current) {
        await processorRef.current.destroy?.()
        processorRef.current = null
      }
      // Restore to plain device if currently a transform device
      const current = meetingManager.selectedVideoInputDevice
      if (current && isVideoTransformDevice(current)) {
        await current.stop()
        if (rawDeviceIdRef.current) {
          await meetingManager.startVideoInputDevice(rawDeviceIdRef.current)
        }
      }
    } catch (e) {
      console.warn('Error clearing processor:', e)
    }
  }

  const applyBackground = async (bg) => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      await clearProcessor()

      if (bg.id === 'none') {
        setActive('none')
        return
      }

      const deviceId = rawDeviceIdRef.current
      if (!deviceId) throw new Error('No camera found. Please enable your camera first.')

      let processor

      if (bg.id === 'blur') {
        processor = await BackgroundBlurVideoFrameProcessor.create()
      } else {
        let imageBlob
        if (bg.image) {
          const res = await fetch(bg.image)
          imageBlob = await res.blob()
        } else {
          const canvas = document.createElement('canvas')
          canvas.width = 1280
          canvas.height = 720
          canvas.getContext('2d').fillStyle = bg.color
          canvas.getContext('2d').fillRect(0, 0, 1280, 720)
          imageBlob = await new Promise(res => canvas.toBlob(res))
        }
        processor = await BackgroundReplacementVideoFrameProcessor.create(undefined, { imageBlob })
      }

      processorRef.current = processor

      // null logger is fine — Chime uses its own internal logger
      const transformDevice = new DefaultVideoTransformDevice(noopLogger, deviceId, [processor])
      await meetingManager.startVideoInputDevice(transformDevice)
      setActive(bg.id)
    } catch (e) {
      console.error('Background error:', e)
      setError(e.message || 'Failed to apply background.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="vbg-panel">
      <div className="vbg-header">
        <span className="vbg-title">Virtual Background</span>
        <button className="vbg-close" onClick={onClose}>✕</button>
      </div>

      {!isVideoEnabled && (
        <p className="vbg-warning">Turn on your camera to preview backgrounds.</p>
      )}
      {error && <p className="vbg-error">{error}</p>}

      <div className="vbg-grid">
        {BACKGROUNDS.map(bg => (
          <button
            key={bg.id}
            className={`vbg-item ${active === bg.id ? 'vbg-item--active' : ''}`}
            onClick={() => applyBackground(bg)}
            disabled={loading}
          >
            <div
              className="vbg-preview"
              style={{
                backgroundImage: bg.image ? `url(${bg.image})` : undefined,
                background: bg.color ?? undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {bg.id === 'none' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              )}
              {bg.id === 'blur' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                </svg>
              )}
            </div>
            <span className="vbg-label">{active === bg.id && loading ? '…' : bg.label}</span>
            {active === bg.id && !loading && <span className="vbg-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}