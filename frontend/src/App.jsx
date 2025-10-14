import { useEffect, useState, Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Loading from "./components/Loading"
import AuthRoute from "./components/AuthRoute"
import { useAuthStore } from "./store/authStore"
import { initImageOptimization } from "./utils/imageOptimization"
import { initAssetOptimization } from "./utils/assetOptimization"
import { useSocketQuery } from "./hooks/useSocketQuery"
import { useSocketAuth } from "./hooks/useSocketAuth"

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
  const { isAuthenticated, userType, isInitialized, initializeAuth } = useAuthStore()
  
  // Handle GitHub Pages SPA redirect
  useEffect(() => {
    // Check for hash-based redirect (from 404.html)
    const hash = window.location.hash
    if (hash && hash !== '#/') {
      // Remove the # and navigate to the route
      const route = hash.substring(1) // Remove the #
      console.log('GitHub Pages hash redirect detected:', { hash, route })
      
      // Replace the current URL with the route
      window.history.replaceState(null, '', route)
    }
  }, [])
  
  // Initialize Socket.IO integration with React Query
  const { isConnected } = useSocketQuery({
    serverUrl: import.meta.env.VITE_SOCKET_URL || 'https://agri-chain.onrender.com'
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

    // Simulate loading only if auth is not already initialized
    const loadingTimeout = setTimeout(() => {
      console.log('App loading complete');
      setLoading(false);
    }, isInitialized ? 100 : 1000); // Faster loading if already initialized
    
    return () => clearTimeout(loadingTimeout);
  }, [isInitialized, initializeAuth, isAuthenticated])
  
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
    <BrowserRouter basename="/">
      <Toaster position="top-right" />
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
    </BrowserRouter>
  )
}

export default App
