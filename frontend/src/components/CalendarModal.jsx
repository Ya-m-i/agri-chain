import { X, UserPlus, ClipboardCheck, Shield } from "lucide-react"

const CalendarModal = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  onTabSwitch 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden`} style={{ borderRadius: '5px' }}>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Widget */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`} style={{ borderRadius: '5px' }}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Monthly View</h3>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} py-2`}>{day}</div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = i - 6; // Start from previous month
                  const isCurrentMonth = date > 0 && date <= 31;
                  const isToday = date === new Date().getDate();
                  return (
                    <div
                      key={i}
                      className={`p-2 text-sm rounded cursor-pointer transition-colors ${
                        isCurrentMonth 
                          ? isToday 
                            ? 'bg-lime-600 text-white font-bold' 
                            : darkMode
                              ? 'text-white hover:bg-lime-100 hover:text-gray-800'
                              : 'text-gray-800 hover:bg-lime-100'
                          : darkMode
                            ? 'text-gray-500'
                            : 'text-gray-400'
                      }`}
                      style={{ borderRadius: '5px' }}
                    >
                      {date > 0 ? date : ''}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Events/Activities */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`} style={{ borderRadius: '5px' }}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Today's Activities</h3>
              <div className="space-y-3">
                <div className={`flex items-center p-3 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded-lg shadow-sm`} style={{ borderRadius: '5px' }}>
                  <div className="w-3 h-3 bg-lime-500 rounded-full mr-3"></div>
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Farmer Registration</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>10:00 AM - 12:00 PM</div>
                  </div>
                </div>
                <div className={`flex items-center p-3 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded-lg shadow-sm`} style={{ borderRadius: '5px' }}>
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Assistance Distribution</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>2:00 PM - 4:00 PM</div>
                  </div>
                </div>
                <div className={`flex items-center p-3 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded-lg shadow-sm`} style={{ borderRadius: '5px' }}>
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Crop Insurance Review</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>4:30 PM - 6:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                className={`flex items-center justify-center p-4 ${darkMode ? 'bg-lime-800 hover:bg-lime-700' : 'bg-lime-100 hover:bg-lime-200'} rounded-lg transition-colors`}
                style={{ borderRadius: '5px' }}
                onClick={() => {
                  onClose()
                  onTabSwitch('farmer-registration')
                }}
              >
                <UserPlus size={20} className={`mr-2 ${darkMode ? 'text-lime-200' : 'text-lime-700'}`} />
                <span className={`${darkMode ? 'text-lime-200' : 'text-lime-700'} font-medium`}>Register Farmer</span>
              </button>
              <button 
                className={`flex items-center justify-center p-4 ${darkMode ? 'bg-blue-800 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'} rounded-lg transition-colors`}
                style={{ borderRadius: '5px' }}
                onClick={() => {
                  onClose()
                  onTabSwitch('assistance')
                }}
              >
                <ClipboardCheck size={20} className={`mr-2 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`} />
                <span className={`${darkMode ? 'text-blue-200' : 'text-blue-700'} font-medium`}>Manage Assistance</span>
              </button>
              <button 
                className={`flex items-center justify-center p-4 ${darkMode ? 'bg-purple-800 hover:bg-purple-700' : 'bg-purple-100 hover:bg-purple-200'} rounded-lg transition-colors`}
                style={{ borderRadius: '5px' }}
                onClick={() => {
                  onClose()
                  onTabSwitch('crop-insurance')
                }}
              >
                <Shield size={20} className={`mr-2 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`} />
                <span className={`${darkMode ? 'text-purple-200' : 'text-purple-700'} font-medium`}>Crop Insurance</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarModal

