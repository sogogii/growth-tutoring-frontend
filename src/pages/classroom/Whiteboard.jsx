import { useEffect, useRef, useState, useCallback } from 'react'
import { useMeetingManager } from 'amazon-chime-sdk-component-library-react'

const TOPIC = 'whiteboard'
const COLORS = ['#ffffff', '#f97316', '#667eea', '#22c55e', '#ef4444', '#fbbf24', '#06b6d4']

export default function Whiteboard({ onClose }) {
  const meetingManager = useMeetingManager()
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef(null)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#ffffff')
  const [size, setSize] = useState(4)
  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const sizeRef = useRef(size)
  toolRef.current = tool
  colorRef.current = color
  sizeRef.current = size

  const drawSegment = useCallback((ctx, x0, y0, x1, y1, strokeColor, strokeSize, isEraser) => {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.strokeStyle = isEraser ? '#1c2030' : strokeColor
    ctx.lineWidth = isEraser ? strokeSize * 4 : strokeSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over'
    ctx.stroke()
    ctx.restore()
  }, [])

  useEffect(() => {
    const av = meetingManager?.audioVideo
    if (!av) return
    const handler = (dataMessage) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(dataMessage.data))
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (data.type === 'draw') {
          drawSegment(ctx, data.x0, data.y0, data.x1, data.y1, data.color, data.size, data.eraser)
        } else if (data.type === 'clear') {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      } catch (e) {}
    }
    av.realtimeSubscribeToReceiveDataMessage(TOPIC, handler)
    return () => av.realtimeUnsubscribeFromReceiveDataMessage(TOPIC)
  }, [meetingManager, drawSegment])

  const sendEvent = useCallback((data) => {
    const av = meetingManager?.audioVideo
    if (!av) return
    try {
      av.realtimeSendDataMessage(TOPIC, new TextEncoder().encode(JSON.stringify(data)), 30000)
    } catch (e) {}
  }, [meetingManager])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const onMouseDown = (e) => { e.preventDefault(); isDrawing.current = true; lastPos.current = getPos(e, canvasRef.current) }
  const onMouseMove = (e) => {
    e.preventDefault()
    if (!isDrawing.current || !lastPos.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    const isEraser = toolRef.current === 'eraser'
    drawSegment(ctx, lastPos.current.x, lastPos.current.y, pos.x, pos.y, colorRef.current, sizeRef.current, isEraser)
    sendEvent({ type: 'draw', x0: lastPos.current.x, y0: lastPos.current.y, x1: pos.x, y1: pos.y, color: colorRef.current, size: sizeRef.current, eraser: isEraser })
    lastPos.current = pos
  }
  const onMouseUp = () => { isDrawing.current = false; lastPos.current = null }

  const handleClear = () => {
    canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    sendEvent({ type: 'clear' })
  }

  return (
    <div className="wb-panel">
      <div className="wb-toolbar">
        <div className="wb-toolbar-left">
          <button className={`wb-tool ${tool === 'pen' ? 'wb-tool--active' : ''}`} onClick={() => setTool('pen')}>✏️</button>
          <button className={`wb-tool ${tool === 'eraser' ? 'wb-tool--active' : ''}`} onClick={() => setTool('eraser')}>⬜</button>
          <div className="wb-sep" />
          {COLORS.map(c => (
            <button key={c} className={`wb-color ${color === c ? 'wb-color--active' : ''}`} style={{ background: c }} onClick={() => { setColor(c); setTool('pen') }} />
          ))}
          <div className="wb-sep" />
          <div className="wb-size-row">
            <span className="wb-size-label">Size</span>
            <input type="range" min="1" max="24" value={size} onChange={e => setSize(Number(e.target.value))} className="wb-size-slider" />
            <span className="wb-size-val">{size}</span>
          </div>
          <div className="wb-sep" />
          <button className="wb-clear" onClick={handleClear}>🗑 Clear</button>
        </div>
        <button className="wb-close" onClick={onClose}>✕</button>
      </div>
      <div className="wb-canvas-wrap">
        <canvas
          ref={canvasRef} width={1200} height={800} className="wb-canvas"
          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onMouseDown} onTouchMove={onMouseMove} onTouchEnd={onMouseUp}
        />
      </div>
    </div>
  )
}