"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
// Add imports for both logos
import farmerLogoImage from "../assets/images/Farmlogo.png" // Your farmer logo
import adminLogoImage from "../assets/images/AgriLogo.png" // Add your admin logo here
import { loginFarmer } from '../api';

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" })
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    console.log("Current mode:", isAdminMode ? "Admin" : "Farmer")
  }, [isAdminMode])

  const navigate = useNavigate()  
  const { isAuthenticated, userType, login, logout } = useAuthStore()

  useEffect(() => {
    // If already authenticated, redirect to appropriate dashboard
    if (isAuthenticated) {
      navigate(userType === "admin" ? "/admin" : "/farmer-dashboard")
    }
  }, [isAuthenticated, userType, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg("");

    // Clear any existing auth when switching modes
    logout();

    if (isAdminMode) {
      // Dummy admin credentials
      if (form.username === "admin" && form.password === "admin123") {
        localStorage.setItem("isAdmin", "true") // For backward compatibility
        localStorage.removeItem("isFarmer") // Clear farmer auth
        login("admin")
        console.log("Admin login successful, navigating to /admin")
        navigate("/admin")
      } else {
        alert("Invalid admin credentials")
      }
    } else {
      try {
        const farmer = await loginFarmer(form.username, form.password);
        localStorage.setItem("isFarmer", "true");
        localStorage.removeItem("isAdmin") // Clear admin auth
        // Map backend farmer data to auth store structure
        const userData = {
          ...farmer,
          id: farmer._id || farmer.id,
          name: `${farmer.firstName || ''} ${farmer.middleName || ''} ${farmer.lastName || ''}`.replace(/  +/g, ' ').trim(),
          phone: farmer.contactNum,
        };
        console.log("Farmer login successful, userData:", userData);
        login("farmer", userData);
        navigate("/farmer-dashboard");
      } catch (err) {
        setErrorMsg(err.message || "Invalid farmer credentials");
      }
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex justify-center items-center bg-gradient-to-b from-lime-50 to-white relative px-4 sm:px-6 lg:px-8">
      {/* Toggle Button - Responsive positioning and sizing */}
      <button
        onClick={() => {
          console.log("Toggling mode from", isAdminMode, "to", !isAdminMode)
          setIsAdminMode(!isAdminMode)
        }}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-white text-lime-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 border border-lime-200 hover:bg-lime-50 z-10 max-w-[200px] sm:max-w-none"
      >
        <span className="hidden sm:inline">Switch to {isAdminMode ? "Farmer" : "Admin"} Login</span>
        <span className="sm:hidden">{isAdminMode ? "Farmer" : "Admin"}</span>
      </button>

      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        {/* Conditional Logo - Responsive sizing */}
        <div className="flex justify-center mb-4 sm:mb-6">
          {isAdminMode ? (
            // Custom Admin Logo
            <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-45 lg:h-45 flex items-center justify-center">
              <img
                src={adminLogoImage || "/placeholder.svg"}
                alt="Admin Logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            // Custom Farmer Logo
            <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-45 lg:h-45 flex items-center justify-center">
              <img
                src={farmerLogoImage || "/placeholder.svg"}
                alt="Farmer Logo"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 text-center text-lime-800">
          {isAdminMode ? "ADMIN LOGIN" : "FARMER LOGIN"}
        </h2>
        <p className="text-gray-500 text-center mb-4 sm:mb-6 text-xs sm:text-sm lg:text-base">Enter your credentials to access your account</p>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                className="w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-lime-800 text-white py-2 sm:py-3 rounded-lg hover:bg-lime-700 transition-colors duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center text-sm sm:text-base"
          >
            Login
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>
        {errorMsg && (
          <div className="mt-3 sm:mt-4 text-center text-red-600 font-medium text-xs sm:text-sm">{errorMsg}</div>
        )}

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-gray-500">
            {isAdminMode
              ? "Admin access only. Unauthorized access is prohibited."
              : "Secure login for registered farmers."}
          </p>
        </div>
      </div>

      {/* Decorative elements - Responsive sizing */}
      <div className="absolute top-0 left-0 w-full h-16 sm:h-24 lg:h-32 bg-lime-800 opacity-5 rounded-b-full"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-lime-800 opacity-5 rounded-full -mr-16 sm:-mr-24 lg:-mr-32 -mb-16 sm:-mb-24 lg:-mb-32"></div>
    </div>
  )
}

export default Login
