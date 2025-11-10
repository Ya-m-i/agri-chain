// Utility to check for app updates and notify users

let currentVersion = null
let updateAvailable = false
let updateCallbacks = []

// Load current version
export const loadCurrentVersion = async () => {
  try {
    // Try to load version.json from public directory
    const response = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      currentVersion = data.version
      return data
    }
  } catch (error) {
    console.warn('Failed to load version:', error)
  }
  return null
}

// Check for updates by comparing versions
export const checkForUpdates = async () => {
  try {
    // Get stored version from localStorage
    const storedVersion = localStorage.getItem('app_version')
    
    // Load current version from server
    const versionData = await loadCurrentVersion()
    if (!versionData) return false
    
    const serverVersion = versionData.version
    
    // If no stored version, store current and return false
    if (!storedVersion) {
      localStorage.setItem('app_version', serverVersion)
      return false
    }
    
    // If versions differ, update is available
    if (storedVersion !== serverVersion) {
      updateAvailable = true
      notifyUpdateCallbacks()
      return true
    }
    
    return false
  } catch (error) {
    console.warn('Error checking for updates:', error)
    return false
  }
}

// Register callback for update notifications
export const onUpdateAvailable = (callback) => {
  updateCallbacks.push(callback)
  // If update is already available, call immediately
  if (updateAvailable) {
    callback()
  }
  // Return unsubscribe function
  return () => {
    updateCallbacks = updateCallbacks.filter(cb => cb !== callback)
  }
}

// Notify all registered callbacks
const notifyUpdateCallbacks = () => {
  updateCallbacks.forEach(callback => {
    try {
      callback()
    } catch (error) {
      console.error('Error in update callback:', error)
    }
  })
}

// Initialize update checker
export const initUpdateChecker = async () => {
  // Load current version
  await loadCurrentVersion()
  
  // Check for updates immediately
  await checkForUpdates()
  
  // Check for updates periodically (every 5 minutes)
  setInterval(async () => {
    await checkForUpdates()
  }, 5 * 60 * 1000) // 5 minutes
  
  // Also check when page becomes visible (user returns to tab)
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      await checkForUpdates()
    }
  })
}

// Get current version
export const getCurrentVersion = () => currentVersion

// Check if update is available
export const isUpdateAvailable = () => updateAvailable

