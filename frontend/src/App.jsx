import { useEffect, useState, Suspense, lazy } from "react"
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Loading from "./components/Loading"
import AuthRoute from "./components/AuthRoute"
import UpdateNotification from "./components/UpdateNotification"
import { useAuthStore } from "./store/authStore"
import { initImageOptimization } from "./utils/imageOptimization"
import { initAssetOptimization } from "./utils/assetOptimization"
import { useSocketQuery } from "./hooks/useSocketQuery"
import { useSocketAuth } from "./hooks/useSocketAuth"
import { initUpdateChecker, onUpdateAvailable } from "./utils/updateChecker"
import { wakeUpBackend } from "./api"

// Lazy load page components for better performance
const Login = lazy(() => import("./pages/Login"))
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"))
const FarmerDashboard = lazy(() => import("./pages/FarmerDashboard"))
const FarmerForm = lazy(() => import("./pages/FarmerForm/FarmerForm"))
const SocketTestComponent = lazy(() => import("./components/SocketTestComponent"))
const ConnectionTestComponent = lazy(() => import("./components/ConnectionTestComponent"))
const NotFound = lazy(() => import("./pages/NotFound"))

// Preload critical routes for faster navigation
const preloadRoutes = () => {
  // Preload login page immediately as it's likely to be needed
  import("./pages/Login")
  
  // Preload dashboard components after a short delay
  setTimeout(() => {
    import("./pages/AdminDashboard")
    import("./pages/FarmerDashboard")
  }, 2000)
}

// Loading fallback component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

function App() {
  const [loading, setLoading] = useState(true)
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const { isAuthenticated, userType, isInitialized, initializeAuth } = useAuthStore()
  
  // HashRouter handles routing automatically - no need for redirect logic
  
  // Initialize Socket.IO integration with React Query
  // Use API URL as base for Socket.IO (same server) or environment variable
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 
    (import.meta.env.VITE_API_URL || 
      (import.meta.env.PROD 
        ? 'https://backend.kapalongagrichain.site' 
        : 'https://agri-chain.onrender.com'))
  
  const { isConnected } = useSocketQuery({
    serverUrl: socketUrl
  })
  
  // Manage socket connection based on authentication state
  const { currentRoom } = useSocketAuth()

  useEffect(() => {
    console.log('App component mounting...');
    console.log('Environment variables:', {
      API_URL: import.meta.env.VITE_API_URL,
      SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV
    });
    
    // Initialize optimizations first
    initAssetOptimization()
    initImageOptimization()

    // Show update banner: avoid duplicate per session
    const showUpdateBannerIfNew = (serverVersion) => {
      const lastShown = sessionStorage.getItem('last_shown_update_version')
      if (lastShown !== serverVersion) {
        setShowUpdateNotification(true)
        if (serverVersion) sessionStorage.setItem('last_shown_update_version', serverVersion)
      }
    }

    // 1) Register callback first so it's ready when initUpdateChecker runs
    const unsubscribe = onUpdateAvailable(async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          showUpdateBannerIfNew(data.version)
        } else {
          setShowUpdateNotification(true)
        }
      } catch {
        setShowUpdateNotification(true)
      }
    })

    // 2) Listen for custom event (from updateChecker or service worker)
    const handleUpdateEvent = (event) => {
      const version = event?.detail?.version
      if (version) {
        showUpdateBannerIfNew(version)
        return
      }
      try {
        fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data?.version) showUpdateBannerIfNew(data.version)
            else setShowUpdateNotification(true)
          })
          .catch(() => setShowUpdateNotification(true))
      } catch {
        setShowUpdateNotification(true)
      }
    }
    window.addEventListener('app-update-available', handleUpdateEvent)

    // 3) Then start update checker (single init, no duplicate intervals)
    initUpdateChecker()

    // Service worker: when SW reports update, fire same event so one path shows banner
    let handleServiceWorkerMessage = null
    if ('serviceWorker' in navigator) {
      handleServiceWorkerMessage = (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          window.dispatchEvent(new CustomEvent('app-update-available', { detail: { version: event.data.version } }))
        }
      }
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
    }
    
    // Initialize authentication state from storage
    if (!isInitialized) {
      console.log('App: Initializing auth from storage...');
      initializeAuth();
    }
    
    // Handle legacy authentication migration (only if not already initialized)
    if (!isAuthenticated && !isInitialized) {
      const isAdmin = localStorage.getItem("isAdmin") === "true"
      const isFarmer = localStorage.getItem("isFarmer") === "true"

      // Migrate old auth to Zustand store
      if (isAdmin) {
        console.log('App: Migrating legacy admin auth...');
        const { login } = useAuthStore.getState();
        login("admin");
      } else if (isFarmer) {
        console.log('App: Found legacy farmer auth, but missing user data. Clearing...');
        // Clear invalid farmer auth that lacks user data
        localStorage.removeItem("isFarmer");
      }
    }

    // Preload critical routes for faster navigation
    preloadRoutes()

    // Minimal delay: allow auth init to run, then show app (no artificial 1s wait)
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, isInitialized ? 0 : 80);
    
    return () => {
      clearTimeout(loadingTimeout)
      if (unsubscribe) unsubscribe()
      window.removeEventListener('app-update-available', handleUpdateEvent)
      if (handleServiceWorkerMessage) {
        navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage)
      }
    }
  }, [isInitialized, initializeAuth, isAuthenticated])
  
  // Keep backend warm (e.g. Render free tier): ping /api/health every 14 minutes while app is open
  const KEEP_ALIVE_MINUTES = 14
  useEffect(() => {
    wakeUpBackend()
    const intervalId = setInterval(wakeUpBackend, KEEP_ALIVE_MINUTES * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [])

  // Additional effect to log socket status changes
  useEffect(() => {
    console.log('Socket.IO connection status:', isConnected ? 'Connected' : 'Disconnected')
    console.log('Socket.IO current room:', currentRoom || 'None')
    console.log('Auth state:', { isAuthenticated, userType, isInitialized })
  }, [isConnected, currentRoom, isAuthenticated, userType, isInitialized])

  if (loading) {
    return <Loading />
  }

  return (
    <HashRouter>
      <Toaster position="top-right" />
      {showUpdateNotification && (
        <UpdateNotification
          onDismiss={() => setShowUpdateNotification(false)}
        />
      )}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={userType === "admin" ? "/admin" : "/farmer-dashboard"} replace />
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/admin"
            element={
              <AuthRoute userType="admin">
                <AdminDashboard />
              </AuthRoute>
            }
          />

          <Route
            path="/farmer-dashboard"
            element={
              <AuthRoute userType="farmer">
                <FarmerDashboard />
              </AuthRoute>
            }
          />

          <Route
            path="/farmer-form"
            element={
              <AuthRoute userType="farmer">
                <FarmerForm />
              </AuthRoute>
            }
          />

          <Route
            path="/socket-test"
            element={
              <AuthRoute userType={["admin", "farmer"]}>
                <SocketTestComponent />
              </AuthRoute>
            }
          />

          <Route
            path="/connection-test"
            element={<ConnectionTestComponent />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
