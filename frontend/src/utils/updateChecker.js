// Utility to check for app updates and notify users

let currentVersion = null
let updateAvailable = false
let updateCallbacks = []
let initialized = false

// Load current version from server (used for update check)
export const loadCurrentVersion = async () => {
  try {
    const response = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      currentVersion = data.version
      return data
    }
    if (response.status === 404) {
      console.warn('Update check: /version.json not found (run build to generate)')
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
    
    // Get list of versions that have already been shown (to prevent duplicate notifications)
    const shownVersions = JSON.parse(localStorage.getItem('app_shown_versions') || '[]')
    
    // Load current version from server
    const versionData = await loadCurrentVersion()
    if (!versionData) return false
    
    const serverVersion = versionData.version
    
    // If no stored version, store current and return false (first time visit)
    if (!storedVersion) {
      localStorage.setItem('app_version', serverVersion)
      localStorage.setItem('app_shown_versions', JSON.stringify([serverVersion]))
      return false
    }
    
    // If versions differ, update is available
    if (storedVersion !== serverVersion) {
      // Only show notification if this version hasn't been shown before
      if (!shownVersions.includes(serverVersion)) {
        updateAvailable = true
        notifyUpdateCallbacks()
        // Dispatch so App's event listener can also show the banner (e.g. when SW not used)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-update-available', { detail: { version: serverVersion } }))
        }
        return true
      }
      // Version already shown, but update stored version to prevent future checks
      localStorage.setItem('app_version', serverVersion)
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

// Initialize update checker (only once to avoid duplicate intervals/listeners)
export const initUpdateChecker = async () => {
  if (initialized) return
  initialized = true

  await loadCurrentVersion()
  await checkForUpdates()

  setInterval(async () => {
    await checkForUpdates()
  }, 5 * 60 * 1000)

  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      await checkForUpdates()
    }
  })
}

// Mark version as shown (called when user dismisses or reloads)
export const markVersionAsShown = (version) => {
  const shownVersions = JSON.parse(localStorage.getItem('app_shown_versions') || '[]')
  if (!shownVersions.includes(version)) {
    shownVersions.push(version)
    localStorage.setItem('app_shown_versions', JSON.stringify(shownVersions))
  }
  // Also update the stored version
  localStorage.setItem('app_version', version)
  updateAvailable = false
}

// Update stored version (called when user reloads)
export const updateStoredVersion = (version) => {
  localStorage.setItem('app_version', version)
  markVersionAsShown(version)
  updateAvailable = false
}

// Get current version
export const getCurrentVersion = () => currentVersion

// Check if update is available
export const isUpdateAvailable = () => updateAvailable

