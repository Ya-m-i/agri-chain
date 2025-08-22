"use client"

import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Login from "./pages/Login"
import AdminDashboard from "./pages/AdminDashboard"
import FarmerDashboard from "./pages/FarmerDashboard"
import FarmerForm from "./pages/FarmerForm/FarmerForm"
import NotFound from "./pages/NotFound"
import Loading from "./components/Loading"
import AuthRoute from "./components/AuthRoute"
import { useAuthStore } from "./store/authStore"

function App() {
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, userType, login } = useAuthStore()

  useEffect(() => {
    // Check localStorage for legacy authentication
    const isAdmin = localStorage.getItem("isAdmin") === "true"
    const isFarmer = localStorage.getItem("isFarmer") === "true"

    // Migrate old auth to Zustand store
    if (isAdmin) {
      login("admin")
    } else if (isFarmer) {
      login("farmer")
    }

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
    </BrowserRouter>
  )
}

export default App
