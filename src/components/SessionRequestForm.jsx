import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/SessionRequestForm.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function SessionRequestForm({ tutorUserId, tutorName, tutorTeachingMethod, studentUserId, onClose }) {
  const navigate = useNavigate() // ← ADDED for payment integration

  // Step 1: Select Date
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  
  // Step 2: Select Time
  const [availableTimes, setAvailableTimes] = useState([])
  const [selectedStartTime, setSelectedStartTime] = useState(null)
  const [selectedEndTime, setSelectedEndTime] = useState(null)

  const [sessionFormat, setSessionFormat] = useState('ONLINE')
  
  // Step 3: Add Details
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  
  // UI State
  const [tutorSchedule, setTutorSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [bookedSlots, setBookedSlots] = useState([])

  const calculateAvailableTimes = (date) => {
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
    const daySchedule = tutorSchedule?.[dayName]

    if (!daySchedule || daySchedule.length === 0) {
      setAvailableTimes([])
      return
    }

    // Convert schedule to time slots
    const times = []
    daySchedule.forEach(slot => {
      const [startHour, startMin] = slot.start.split(':').map(Number)
      const [endHour, endMin] = slot.end.split(':').map(Number)
      
      // Generate 1-hour slots
      let currentHour = startHour
      let currentMin = startMin
      
      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const time24 = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
        const time12 = formatTime12Hour(time24)
        
        times.push({
          time24,
          time12,
          hour: currentHour,
          minute: currentMin
        })
        
        // Increment by 30 minutes
        currentMin += 30
        if (currentMin >= 60) {
          currentMin = 0
          currentHour++
        }
      }
    })

    setAvailableTimes(times)
  }

  // Load tutor's schedule
  useEffect(() => {
    loadTutorSchedule()
  }, [tutorUserId])

  // When date is selected, calculate available times
  useEffect(() => {
    if (selectedDate) {
      calculateAvailableTimes(selectedDate)
      loadBookedSlots(selectedDate) 
    }
  }, [selectedDate, tutorSchedule])

  const loadTutorSchedule = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/tutors/${tutorUserId}`)
      if (res.ok) {
        const data = await res.json()
        setTutorSchedule(data.weeklySchedule || {})
      }
    } catch (err) {
      console.error('Error loading schedule:', err)
      setError('Failed to load tutor schedule')
    } finally {
      setLoading(false)
    }
  }

  const formatTime12Hour = (time24) => {
    const [hour, minute] = time24.split(':').map(Number)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${String(minute).padStart(2, '0')} ${period}`
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
      const hasAvailability = tutorSchedule?.[dayName]?.length > 0
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
      const isTooFar = date > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months

      days.push({
        date,
        isCurrentMonth: true,
        hasAvailability,
        isSelectable: hasAvailability && !isPast && !isTooFar
      })
    }

    return days
  }

  const handleDateClick = (day) => {
    if (!day.isSelectable) return
    setSelectedDate(day.date)
    setSelectedStartTime(null)
    setSelectedEndTime(null)
  }

  const isTimeSlotBooked = (time) => {
    if (!selectedDate || bookedSlots.length === 0) return false
    
    const checkStart = new Date(selectedDate)
    checkStart.setHours(time.hour, time.minute, 0, 0)
    
    const checkStartUTC = checkStart.getTime()
    
    const result = bookedSlots.some(booked => {
      const bookedStartUTC = new Date(booked.start).getTime()
      const bookedEndUTC = new Date(booked.end).getTime()
      
      // DEBUG: Log the comparison
      const isConflict = checkStartUTC >= bookedStartUTC && checkStartUTC < bookedEndUTC
      
      if (isConflict) {
        console.log(`  BLOCKED: ${time.time12}`)
        console.log('  Check time (local):', checkStart.toString())
        console.log('  Check time (UTC ms):', checkStartUTC)
        console.log('  Booked start (UTC ms):', bookedStartUTC)
        console.log('  Booked end (UTC ms):', bookedEndUTC)
      }
      
      return isConflict
    })
    
    return result
  }

  const isTimePast = (time) => {
    if (!selectedDate) return false
    
    const now = new Date()
    const selectedDateTime = new Date(selectedDate)
    selectedDateTime.setHours(time.hour, time.minute, 0, 0)
    
    // Check if the selected datetime is in the past
    return selectedDateTime < now
  }

  const handleTimeClick = (time) => {

    // If clicking selected start time → deselect both
    if (selectedStartTime && selectedStartTime.time24 === time.time24) {
      setSelectedStartTime(null)
      setSelectedEndTime(null)
      return
    }

    // If clicking selected end time → deselect end only
    if (selectedEndTime && selectedEndTime.time24 === time.time24) {
      setSelectedEndTime(null)
      return
    }

    if (isTimeSlotBooked(time)) { 
      return
    }

    if (isTimePast(time)) {
      return
    }

    if (!selectedStartTime) {
      setSelectedStartTime(time)
      setSelectedEndTime(null)
    } else if (!selectedEndTime) {
      // Selecting end time
      const startMinutes = selectedStartTime.hour * 60 + selectedStartTime.minute
      const endMinutes = time.hour * 60 + time.minute
      
      // Validate end time is after start time
      if (endMinutes <= startMinutes) {
        alert('End time must be after start time')
        return
      }
      
      // Validate minimum session length (1 hour)
      if (endMinutes - startMinutes < 30) {
        alert('Sessions must be at least 30 minutes long')
        return
      }
      
      // NEW: Validate that all time slots between start and end are available
      if (!isTimeRangeContinuous(selectedStartTime, time)) {
        alert('The selected time range spans across unavailable time slots. Please select a continuous time range within the tutor\'s availability.')
        return
      }
      
      setSelectedEndTime(time)
    } else {
      // Reset and start over
      setSelectedStartTime(time)
      setSelectedEndTime(null)
    }
  }

  /**
   * Check if all time slots between start and end are continuously available
   * This prevents booking across gaps in tutor availability
   */
  const isTimeRangeContinuous = (startTime, endTime) => {
    const startMinutes = startTime.hour * 60 + startTime.minute
    const endMinutes = endTime.hour * 60 + endTime.minute
    
    // Check every 30-minute slot between start and end
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60)
      const minute = minutes % 60
      
      // Find if this time slot exists in availableTimes
      const slotExists = availableTimes.some(t => 
        t.hour === hour && t.minute === minute
      )
      
      if (!slotExists) {
        // This slot is not available - there's a gap!
        return false
      }
      
      // Also check if this slot is booked
      const time = { hour, minute }
      if (isTimeSlotBooked(time)) {
        return false
      }
    }
    
    return true
  }

   /**
   * Group available times into continuous windows
   * Each window represents a continuous block of availability (e.g., 9am-5pm, 7pm-9pm)
   */
  const groupTimesIntoWindows = (times) => {
    if (!times || times.length === 0) return []
    
    const windows = []
    let currentWindow = [times[0]]
    
    for (let i = 1; i < times.length; i++) {
      const prevTime = times[i - 1]
      const currentTime = times[i]
      
      // Calculate time difference in minutes
      const prevMinutes = prevTime.hour * 60 + prevTime.minute
      const currentMinutes = currentTime.hour * 60 + currentTime.minute
      
      // If gap is exactly 30 minutes, it's continuous
      if (currentMinutes - prevMinutes === 30) {
        currentWindow.push(currentTime)
      } else {
        // Gap detected - start new window
        windows.push(currentWindow)
        currentWindow = [currentTime]
      }
    }
    
    // Add the last window
    if (currentWindow.length > 0) {
      windows.push(currentWindow)
    }
    
    return windows
  }
  
  // Get grouped windows
  const timeWindows = groupTimesIntoWindows(availableTimes)

  // ============ UPDATED FOR PAYMENT INTEGRATION ============
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      alert('Please select a date and time')
      return
    }

    if (tutorTeachingMethod === 'HYBRID' && !sessionFormat) {
      alert('Please select session format (In-Person or Online)')
      return
    }

    // Close modal
    onClose()

    // Navigate to checkout page with all booking details
    navigate('/checkout', {
      state: {
        tutorUserId,
        tutorName,
        tutorTeachingMethod,
        selectedDate,
        selectedStartTime,
        selectedEndTime,
        subject: subject.trim() || null,
        message: message.trim() || null,
        sessionFormat,
        studentUserId
      }
    })
  }
  // ========================================================

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date) => {
    if (!date || !selectedDate) return false
    return date.getTime() === selectedDate.getTime()
  }

  const days = getDaysInMonth()
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const loadBookedSlots = async (date) => {
    if (!date || !tutorUserId) return 
    
    try {
      const dateStr = date.toISOString().split('T')[0]
      const res = await fetch(
        `${API_BASE}/api/session-requests/tutor/${tutorUserId}/booked-slots?date=${dateStr}`  
      )
      
      if (res.ok) {
        const slots = await res.json()
        setBookedSlots(slots)
      } else {
        setBookedSlots([])
      }
    } catch (error) {
      setBookedSlots([])
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading-message">Loading tutor availability...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content enhanced" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 className="modal-title">Request Session with {tutorName}</h2>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Select Date */}
          <div className="form-section">
            <h3 className="section-title">Step 1: Select Date</h3>
            
            <div className="calendar-header">
              <button type="button" onClick={prevMonth} className="month-nav">←</button>
              <h4 className="month-title">{monthName}</h4>
              <button type="button" onClick={nextMonth} className="month-nav">→</button>
            </div>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}

              {days.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${
                    !day.isCurrentMonth ? 'other-month' : ''
                  } ${day.isSelectable ? 'available' : 'unavailable'} ${
                    isToday(day.date) ? 'today' : ''
                  } ${isSelected(day.date) ? 'selected' : ''} ${
                    day.isSelectable ? 'selectable' : ''
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  {day.date && (
                    <>
                      <span className="day-number">{day.date.getDate()}</span>
                      {day.isSelectable && (
                        <span className="availability-dot"></span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="calendar-legend">
              <span className="legend-item">
                <span className="legend-dot available"></span> Available
              </span>
              <span className="legend-item">
                <span className="legend-dot unavailable"></span> Unavailable
              </span>
              <span className="legend-item">
                <span className="legend-dot selected"></span> Selected
              </span>
            </div>
          </div>

          {/* Step 2: Select Time */}
          {selectedDate && (
            <div className="form-section">
              <h3 className="section-title">
                Step 2: Select Time - {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', month: 'long', day: 'numeric' 
                })}
              </h3>

              {availableTimes.length === 0 ? (
                <p className="no-times">No available times on this date</p>
              ) : (
                <>
                  {/* Render each availability window separately */}
                  {timeWindows.map((window, windowIndex) => (
                    <div key={windowIndex} className="time-window">
                      {/* Window header showing time range */}
                      <div className="time-window-header">
                        Available: {window[0].time12} - {window[window.length - 1].time12}
                      </div>
                      
                      {/* Time slots in this window */}
                      <div className="time-grid">
                        {window.map(time => {
                          const isBooked = isTimeSlotBooked(time)
                          const isPast = isTimePast(time)
                          const isStartSelected = selectedStartTime?.time24 === time.time24
                          const isEndSelected = selectedEndTime?.time24 === time.time24
                          const isInRange = selectedStartTime && selectedEndTime &&
                            time.hour * 60 + time.minute > selectedStartTime.hour * 60 + selectedStartTime.minute &&
                            time.hour * 60 + time.minute < selectedEndTime.hour * 60 + selectedEndTime.minute

                          return (
                            <button
                              key={time.time24}
                              type="button"
                              onClick={() => handleTimeClick(time)}
                              disabled={isBooked || isPast}
                              className={`time-slot ${
                                isBooked ? 'booked' : '' 
                              } ${ isStartSelected ? 'start-selected' : ''
                              } ${isEndSelected ? 'end-selected' : ''} ${
                                isInRange ? 'in-range' : ''
                              }`}
                            >
                              {time.time12}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {selectedStartTime && selectedEndTime && (
                    <div className="selected-time-summary">
                      <strong>Selected:</strong> {selectedStartTime.time12} - {selectedEndTime.time12}
                      {' '}({Math.floor(((selectedEndTime.hour * 60 + selectedEndTime.minute) - 
                        (selectedStartTime.hour * 60 + selectedStartTime.minute)) / 60)}h{' '}
                      {((selectedEndTime.hour * 60 + selectedEndTime.minute) - 
                        (selectedStartTime.hour * 60 + selectedStartTime.minute)) % 60}m)
                    </div>
                  )}

                  <p className="time-hint">
                    Click to select start time, then click again to select end time.
                    Minimum 30 minutes session.
                  </p>
                </>
              )}
            </div>
          )}

          {selectedDate && selectedStartTime && selectedEndTime && tutorTeachingMethod?.toUpperCase() === 'HYBRID' && (
            <div className="form-section">
              <h3 className="section-title">Step 3: Select Session Format</h3>
              
              <div className="session-format-options">
                <button
                  type="button"
                  className={`format-option ${sessionFormat === 'IN_PERSON' ? 'selected' : ''}`}
                  onClick={() => setSessionFormat('IN_PERSON')}
                >
                  <span className="format-label">In-Person</span>
                  <span className="format-description">Meet at a physical location</span>
                </button>
                
                <button
                  type="button"
                  className={`format-option ${sessionFormat === 'ONLINE' ? 'selected' : ''}`}
                  onClick={() => setSessionFormat('ONLINE')}
                >
                  <span className="format-label">Online</span>
                  <span className="format-description">Video call session</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Add Details */}
          {selectedDate && selectedStartTime && selectedEndTime && 
          (tutorTeachingMethod?.toUpperCase() !== 'HYBRID' || sessionFormat) && (
            <div className="form-section">
              <h3 className="section-title">Step 4: Add Details (Optional)</h3>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Algebra 2, Essay Review"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any additional details or topics you'd like to cover..."
                  rows={4}
                  maxLength={500}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-submit"
              >
                {submitting ? 'Processing...' : 'Continue to Payment →'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default SessionRequestForm