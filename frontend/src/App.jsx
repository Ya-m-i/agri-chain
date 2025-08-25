"use client"

import { useEffect, useState, Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Loading from "./components/Loading"
import AuthRoute from "./components/AuthRoute"
import { useAuthStore } from "./store/authStore"
import { initImageOptimization } from "./utils/imageOptimization"
import { initAssetOptimization } from "./utils/assetOptimization"

// Lazy load page components for better performance
const Login = lazy(() => import("./pages/Login"))
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"))
const FarmerDashboard = lazy(() => import("./pages/FarmerDashboard"))
const FarmerForm = lazy(() => import("./pages/FarmerForm/FarmerForm"))
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
  const { isAuthenticated, userType, login } = useAuthStore()

  useEffect(() => {
    // Initialize optimizations first
    initAssetOptimization()
    initImageOptimization()
    
    // Check localStorage for legacy authentication
    const isAdmin = localStorage.getItem("isAdmin") === "true"
    const isFarmer = localStorage.getItem("isFarmer") === "true"

    // Migrate old auth to Zustand store
    if (isAdmin) {
      login("admin")
    } else if (isFarmer) {
      login("farmer")
    }

    // Preload critical routes for faster navigation
    preloadRoutes()

    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [login])

  if (loading) {
    return <Loading />
  }

  return (
    <BrowserRouter>
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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
