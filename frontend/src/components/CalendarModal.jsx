import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const CalendarModal = ({ 
  isOpen, 
  onClose, 
  darkMode
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  if (!isOpen) return null

  // Get month and year
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Get today's date
  const today = new Date()
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  // Generate calendar days
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl mx-4`}>
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Calendar</h2>
          <button
            onClick={onClose}
            className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {monthNames[month]} {year}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div 
                  key={day} 
                  className={`text-sm font-semibold text-center py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return (
                    <div key={`empty-${index}`} className="p-2"></div>
                  )
                }
                
                const isTodayDate = isToday(day)
                
                return (
                  <div
                    key={day}
                    className={`p-2 text-center text-sm rounded-lg cursor-pointer transition-colors ${
                      isTodayDate
                        ? 'bg-lime-600 text-white font-bold'
                        : darkMode
                          ? 'text-white hover:bg-gray-600'
                          : 'text-gray-800 hover:bg-lime-100'
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current Date Display */}
          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Today: <span className="font-semibold">{today.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarModal

