import { useState } from 'react'
import './styles/ScheduleEditor.css'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_LABELS = {
  sunday: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat'
}

// Generate all 30-minute time slots for the entire day
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      const time12 = `${displayHour}:${String(minute).padStart(2, '0')} ${period}`
      options.push({ value: time24, label: time12 })
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

function ScheduleEditor({ schedule, onScheduleChange }) {
  const [selectedDay, setSelectedDay] = useState('monday')

  // Initialize empty schedule if not provided
  const currentSchedule = schedule || DAYS.reduce((acc, day) => {
    acc[day] = []
    return acc
  }, {})

  const addTimeSlot = (day) => {
    const newSchedule = { ...currentSchedule }
    newSchedule[day] = [
      ...(newSchedule[day] || []),
      { start: '09:00', end: '17:00' }
    ]
    onScheduleChange(newSchedule)
  }

  const removeTimeSlot = (day, index) => {
    const newSchedule = { ...currentSchedule }
    newSchedule[day] = newSchedule[day].filter((_, i) => i !== index)
    onScheduleChange(newSchedule)
  }

  const updateTimeSlot = (day, index, field, value) => {
    const newSchedule = { ...currentSchedule }
    newSchedule[day][index] = {
      ...newSchedule[day][index],
      [field]: value
    }
    onScheduleChange(newSchedule)
  }

  const copyToAllDays = (day) => {
    const newSchedule = { ...currentSchedule }
    const templateSlots = currentSchedule[day] || []
    
    DAYS.forEach(d => {
      if (d !== day) {
        newSchedule[d] = templateSlots.map(slot => ({ ...slot }))
      }
    })
    
    onScheduleChange(newSchedule)
  }

  const clearDay = (day) => {
    const newSchedule = { ...currentSchedule }
    newSchedule[day] = []
    onScheduleChange(newSchedule)
  }

  const daySlots = currentSchedule[selectedDay] || []

  return (
    <div className="schedule-editor">
      <div className="schedule-header">
        <h3>Weekly Availability</h3>
        <p className="schedule-subtitle">Set your available hours for each day (30-minute increments)</p>
      </div>

      {/* Day selector */}
      <div className="day-tabs">
        {DAYS.map(day => (
          <button
            key={day}
            className={`day-tab ${selectedDay === day ? 'active' : ''} ${
              currentSchedule[day]?.length > 0 ? 'has-slots' : ''
            }`}
            onClick={() => setSelectedDay(day)}
          >
            {DAY_LABELS[day]}
            {currentSchedule[day]?.length > 0 && (
              <span className="slot-count">{currentSchedule[day].length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Time slots for selected day */}
      <div className="day-schedule">
        <div className="day-schedule-header">
          <h4>{selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</h4>
          <div className="day-actions">
            {daySlots.length > 0 && (
              <>
                <button
                  className="btn-copy-all"
                  onClick={() => copyToAllDays(selectedDay)}
                  title="Copy this day's schedule to all days"
                >
                  Copy to All Days
                </button>
                <button
                  className="btn-clear-day"
                  onClick={() => clearDay(selectedDay)}
                  title="Clear this day's schedule"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        <div className="time-slots-list">
          {daySlots.length === 0 ? (
            <div className="no-slots">
              <p>No availability set for this day</p>
            </div>
          ) : (
            daySlots.map((slot, index) => (
              <div key={`${selectedDay}-${index}`} className="time-slot-row">
                <div className="time-inputs">
                  <div className="time-input-group">
                    <label>Start</label>
                    <select
                      value={slot.start}
                      onChange={(e) => updateTimeSlot(selectedDay, index, 'start', e.target.value)}
                      className="time-select"
                    >
                      {TIME_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="time-separator">→</span>
                  <div className="time-input-group">
                    <label>End</label>
                    <select
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(selectedDay, index, 'end', e.target.value)}
                      className="time-select"
                    >
                      {TIME_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  className="btn-remove-slot"
                  onClick={() => removeTimeSlot(selectedDay, index)}
                  title="Remove time slot"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <button
          className="btn-add-slot"
          onClick={() => addTimeSlot(selectedDay)}
        >
          + Add Time Slot
        </button>
      </div>

      {/* Weekly overview */}
      <div className="schedule-overview">
        <h4>Weekly Overview</h4>
        <div className="overview-grid">
          {DAYS.map(day => (
            <div key={day} className="overview-day">
              <div className="overview-day-name">{DAY_LABELS[day]}</div>
              <div className="overview-slots">
                {currentSchedule[day]?.length > 0 ? (
                  currentSchedule[day].map((slot, i) => (
                    <div key={`${day}-slot-${i}-${slot.start}-${slot.end}`} className="overview-slot">
                      {slot.start} - {slot.end}
                    </div>
                  ))
                ) : (
                  <div className="overview-empty">Unavailable</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScheduleEditor