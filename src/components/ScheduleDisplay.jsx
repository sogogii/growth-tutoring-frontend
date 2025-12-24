// src/components/ScheduleDisplay.jsx
import './styles/ScheduleDisplay.css'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_LABELS = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday'
}

function ScheduleDisplay({ schedule }) {
  // Handle empty or null schedule
  if (!schedule) {
    return (
      <div className="schedule-display">
        <h3>📅 Availability</h3>
        <p className="no-schedule">Schedule not set</p>
      </div>
    )
  }

  // Check if schedule has any time slots
  const hasAnySlots = DAYS.some(day => schedule[day]?.length > 0)

  if (!hasAnySlots) {
    return (
      <div className="schedule-display">
        <h3>📅 Availability</h3>
        <p className="no-schedule">No availability set</p>
      </div>
    )
  }

  // Helper to format time in 12-hour format
  const formatTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const period = h >= 12 ? 'pm' : 'am'
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayHour}:${minutes} ${period}`
  }

  return (
    <div className="schedule-display">
      <h3>📅 Weekly Availability</h3>
      <div className="schedule-grid">
        {DAYS.map(day => {
          const daySlots = schedule[day] || []
          
          return (
            <div key={day} className={`schedule-day ${daySlots.length === 0 ? 'unavailable' : ''}`}>
              <div className="schedule-day-header">
                <span className="day-name">{DAY_LABELS[day]}</span>
              </div>
              <div className="schedule-day-slots">
                {daySlots.length === 0 ? (
                  <div className="schedule-unavailable">Unavailable</div>
                ) : (
                  daySlots.map((slot, index) => (
                    <div key={index} className="schedule-time-slot">
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScheduleDisplay