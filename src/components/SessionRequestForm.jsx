import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/SessionRequestForm.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function SessionRequestForm({ tutorUserId, tutorName, studentUserId, onClose }) {
  const navigate = useNavigate() // ← ADDED for payment integration

  // Step 1: Select Date
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  
  // Step 2: Select Time
  const [availableTimes, setAvailableTimes] = useState([])
  const [selectedStartTime, setSelectedStartTime] = useState(null)
  const [selectedEndTime, setSelectedEndTime] = useState(null)
  
  // Step 3: Add Details
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  
  // UI State
  const [tutorSchedule, setTutorSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Load tutor's schedule
  useEffect(() => {
    loadTutorSchedule()
  }, [tutorUserId])

  // When date is selected, calculate available times
  useEffect(() => {
    if (selectedDate && tutorSchedule) {
      calculateAvailableTimes(selectedDate)
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

  const handleTimeClick = (time) => {
    if (!selectedStartTime) {
      setSelectedStartTime(time)
      // Auto-suggest 1 hour session
      const endHour = time.hour + 1
      const endTime = availableTimes.find(t => 
        t.hour === endHour && t.minute === time.minute
      )
      if (endTime) {
        setSelectedEndTime(endTime)
      }
    } else if (!selectedEndTime) {
      // Validate end time is after start time
      const startMinutes = selectedStartTime.hour * 60 + selectedStartTime.minute
      const endMinutes = time.hour * 60 + time.minute
      
      if (endMinutes <= startMinutes) {
        alert('End time must be after start time')
        return
      }
      
      if (endMinutes - startMinutes < 60) {
        alert('Sessions must be at least 1 hour long')
        return
      }
      
      setSelectedEndTime(time)
    } else {
      // Reset and start over
      setSelectedStartTime(time)
      setSelectedEndTime(null)
    }
  }

  // ============ UPDATED FOR PAYMENT INTEGRATION ============
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      alert('Please select a date and time')
      return
    }

    // Close modal
    onClose()

    // Navigate to checkout page with all booking details
    navigate('/checkout', {
      state: {
        tutorUserId,
        tutorName,
        selectedDate,
        selectedStartTime,
        selectedEndTime,
        subject: subject.trim() || null,
        message: message.trim() || null,
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
                  <div className="time-grid">
                    {availableTimes.map(time => {
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
                          className={`time-slot ${
                            isStartSelected ? 'start-selected' : ''
                          } ${isEndSelected ? 'end-selected' : ''} ${
                            isInRange ? 'in-range' : ''
                          }`}
                        >
                          {time.time12}
                        </button>
                      )
                    })}
                  </div>

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
                    Minimum 1 hour session.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Step 3: Add Details */}
          {selectedDate && selectedStartTime && selectedEndTime && (
            <div className="form-section">
              <h3 className="section-title">Step 3: Add Details (Optional)</h3>

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