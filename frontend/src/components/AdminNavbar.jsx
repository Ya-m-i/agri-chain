import { Menu, X, Bell, User, ChevronDown, Settings, HelpCircle, Plus, Calendar, Moon, Sun, LogOut, MessageSquare, Check, AlertTriangle, Info } from "lucide-react"

const AdminNavbar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarExpanded,
  isRefreshing,
  setIsRefreshing,
  loadClaims,
  lastRefreshTime,
  isConnected,
  notificationOpen,
  toggleNotificationPanel,
  unreadAdminCount,
  adminNotifications,
  refreshNotifications,
  handleClearAllNotifications,
  isValidObjectId,
  removeLocalNotification,
  deleteNotificationMutation,
  refetchNotifications,
  getNotificationIcon,
  formatTimestamp,
  dropdownOpen,
  setDropdownOpen,
  setActiveTab,
  addLocalNotification,
  setShowCalendar,
  darkMode,
  setDarkMode,
  handleLogout
}) => {
  return (
    <header style={{ backgroundColor: 'white' }} className={`text-black transition-all duration-300 ease-in-out ${sidebarExpanded ? 'md:ml-64' : 'md:ml-16'}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 md:hidden" aria-label="Toggle menu">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-sans font-semibold tracking-wide text-black">ADMIN DASHBOARD</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Real-time Status Indicator */}
          <div className="flex items-center space-x-2 text-black text-sm">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="hidden sm:inline">
              {isRefreshing ? 'Refreshing...' : 'Live'}
            </span>
            <span className="text-xs opacity-75">
              Last: {lastRefreshTime.toLocaleTimeString()}
            </span>
            <button
              onClick={() => {
                setIsRefreshing(true);
                loadClaims();
              }}
              className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
              title="Manual refresh"
            >
              ↻
            </button>
          </div>

          {/* Socket Connection Status */}
          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`} title={`Real-time updates: ${isConnected ? 'Connected' : 'Disconnected'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {isConnected ? 'Live' : 'Offline'}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={toggleNotificationPanel}
              className={`bg-lime-400 text-black p-2 rounded-full hover:bg-lime-500 transition-colors relative ${unreadAdminCount > 0 ? 'animate-pulse' : ''}`}
              aria-label="Notifications"
            >
              <Bell size={22} />
              {unreadAdminCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
                  {unreadAdminCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notificationOpen && (
              <div 
                className="notification-panel absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 text-black flex justify-between items-center bg-lime-400">
                  <h3 className="font-semibold">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshNotifications}
                      className="text-black hover:text-gray-700 text-sm font-semibold px-2 py-1 rounded hover:bg-lime-500 transition-colors"
                      title="Refresh notifications"
                    >
                      ↻ Refresh
                    </button>
                    {adminNotifications.length > 0 && (
                      <button
                        onClick={handleClearAllNotifications}
                        className="text-black hover:text-gray-700 text-sm"
                        title="Clear all notifications"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto hide-scrollbar">
                  {adminNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    adminNotifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex">
                          <div className="flex-shrink-0 mr-3 bg-lime-400 rounded-full p-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium bg-lime-400 text-black px-2 py-1 rounded text-sm">{notification.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp ? new Date(notification.timestamp) : new Date())}
                                </span>
                                <button
                                  onClick={async () => {
                                    // Check if it's a local notification or API notification
                                    const isLocalNotification = !isValidObjectId(notification.id);
                                    
                                    if (isLocalNotification) {
                                      // Remove from local notifications
                                      removeLocalNotification(notification.id);
                                    } else {
                                      // Delete from API
                                      try {
                                        await deleteNotificationMutation.mutateAsync({
                                          notificationId: notification.id,
                                          recipientType: 'admin',
                                          recipientId: null
                                        });
                                        // Refetch to sync with API
                                        await refetchNotifications();
                                      } catch (error) {
                                        console.error('Error deleting notification:', error);
                                      }
                                    }
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  aria-label="Remove notification"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-white text-lime-800 rounded-full flex items-center justify-center shadow-sm">
                <User size={18} />
              </div>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                <button
                  onClick={() => {
                    setActiveTab("settings")
                    setDropdownOpen(false)
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    addLocalNotification({
                      type: 'info',
                      title: 'Help Center',
                      message: 'Help Center coming soon!',
                    });
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <HelpCircle size={16} className="mr-2" />
                  Help Center
                </button>
                <button
                  onClick={() => {
                    addLocalNotification({
                      type: 'success',
                      title: 'Test Notification',
                      message: 'This is a test notification to verify the delete functionality.',
                    });
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Plus size={16} className="mr-2" />
                  Test Notification
                </button>
                <button
                  onClick={() => {
                    setShowCalendar(true)
                    setDropdownOpen(false)
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Calendar size={16} className="mr-2" />
                  Calendar
                </button>
                <button
                  onClick={() => {
                    setDarkMode(!darkMode)
                    setDropdownOpen(false)
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {darkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar

