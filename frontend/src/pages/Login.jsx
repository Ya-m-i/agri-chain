"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
// Add imports for both logos
import farmerLogoImage from "../assets/Images/FarmLogo.png" // Your farmer logo
import adminLogoImage from "../assets/Images/DALOGO.png" // Admin logo
// Import background image - Vite will handle the path
import loginBackgroundImage from "../assets/Images/LoginBG.png" // Login background image
import { loginFarmer, loginUser } from '../api';
import LoadingOverlay from '../components/LoadingOverlay';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" })
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log("Current mode:", isAdminMode ? "Admin" : "Farmer")
  }, [isAdminMode])

  // Debug: Log the image path to verify it's loading
  useEffect(() => {
    console.log("Login background image path:", loginBackgroundImage)
  }, [])

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
    setIsLoggingIn(true);

    // Clear any existing auth state when switching modes or logging in
    console.log('Login: Clearing existing auth state before new login');
    logout();

    // Detect connection quality for user feedback
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.downlink < 1.5
    );
    
    if (isSlowConnection) {
      console.log('Login: Slow connection detected, using extended timeout');
    }

    if (isAdminMode) {
      try {
        console.log('Login: Attempting admin login...');
        const user = await loginUser(form.username, form.password);
        console.log('Login: Backend response:', user);
        
        // Verify the user has admin role
        if (user.role !== 'admin') {
          setErrorMsg("Access denied. Admin role required.");
          setIsLoggingIn(false);
          return;
        }
        
        localStorage.setItem("isAdmin", "true") // For backward compatibility
        localStorage.removeItem("isFarmer") // Clear farmer auth
        
        // Store token if provided
        if (user.token) {
          localStorage.setItem("token", user.token)
        }
        
        // Map backend user data to auth store structure
        const userData = {
          id: user._id || user.id,
          _id: user._id || user.id,
          name: user.name || user.username,
          username: user.username,
          role: user.role,
          adminRole: user.adminRole || 'SuperAdmin',
          profileImageVersion: user.profileImageVersion ?? 0,
        };
        
        console.log('Login: Admin credentials validated, logging in...');
        login("admin", userData)
        console.log("Admin login successful, navigating to /admin")
        
        // Navigate immediately - no delay for faster login experience
        // Full profile data can be fetched in background after navigation
        navigate("/admin")
      } catch (err) {
        console.error('Login: Admin login failed:', err);
        // Provide more helpful error messages
        let errorMessage = err.message || "Invalid admin credentials";
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          errorMessage = "Connection timeout. Please check your internet connection and try again. The system will automatically retry.";
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        }
        setErrorMsg(errorMessage);
        setIsLoggingIn(false);
      }
    } else {
      try {
        console.log('Login: Attempting farmer login...');
        const farmer = await loginFarmer(form.username, form.password);
        console.log('Login: Backend response:', farmer);
        
        localStorage.setItem("isFarmer", "true");
        localStorage.removeItem("isAdmin") // Clear admin auth
        
        // Map backend farmer data to auth store structure
        const userData = {
          ...farmer,
          id: farmer._id || farmer.id,
          name: `${farmer.firstName || ''} ${farmer.middleName || ''} ${farmer.lastName || ''}`.replace(/  +/g, ' ').trim(),
          phone: farmer.contactNum,
          address: farmer.address || '',
          rsbsaRegistered: farmer.rsbsaRegistered || false,
        };
        
        console.log("Farmer login successful");
        console.log("Farmer _id from backend:", farmer._id);
        console.log("Mapped userData.id:", userData.id);
        console.log("Complete userData object:", JSON.stringify(userData, null, 2));
        
        login("farmer", userData);
        
        // Navigate immediately - no delay for faster login experience
        // Full profile data can be fetched in background after navigation
        navigate("/farmer-dashboard");
      } catch (err) {
        console.error('Login: Farmer login failed:', err);
        // Provide more helpful error messages
        let errorMessage = err.message || "Invalid farmer credentials";
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          errorMessage = "Connection timeout. Please check your internet connection and try again. The system will automatically retry.";
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        }
        setErrorMsg(errorMessage);
        setIsLoggingIn(false);
      }
    }
  }

  return (
    <div 
      className="h-screen w-screen overflow-hidden flex justify-center items-center relative px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${loginBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#000' // Fallback color while image loads
      }}
    >
      {/* Overlay for better readability - removed to show image clearly */}
      {/* <div className="absolute inset-0 bg-black bg-opacity-5 z-0"></div> */}
      {/* SEO-friendly hidden content for search engines */}
      <div className="sr-only">
        <h1>Kapalong Agri-Chain Login Portal</h1>
        <p>Access your farmer or admin account to manage agricultural insurance, track claims, and access government assistance programs in Kapalong.</p>
        <h2>Farmer Login</h2>
        <p>Registered farmers can log in to access their dashboard, manage farm information, submit insurance claims, track cash assistance applications, and manage their agricultural calendar.</p>
        <h2>Admin Login</h2>
        <p>Administrators can log in to manage farmer registrations, review insurance claims, manage crop prices, and oversee the agricultural assistance platform.</p>
      </div>
      {/* Toggle Button - Responsive positioning and sizing */}
      <button
        onClick={() => {
          console.log("Toggling mode from", isAdminMode, "to", !isAdminMode)
          setIsAdminMode(!isAdminMode)
        }}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-white text-lime-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 border border-lime-200 hover:bg-lime-50 z-20 max-w-[200px] sm:max-w-none"
      >
        <span className="hidden sm:inline">Switch to {isAdminMode ? "Farmer" : "Admin"} Login</span>
        <span className="sm:hidden">{isAdminMode ? "Farmer" : "Admin"}</span>
      </button>

      <div className="relative z-10 bg-white bg-opacity-95 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
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
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
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
      <div className="absolute top-0 left-0 w-full h-16 sm:h-24 lg:h-32 bg-lime-800 opacity-5 rounded-b-full z-10"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-lime-800 opacity-5 rounded-full -mr-16 sm:-mr-24 lg:-mr-32 -mb-16 sm:-mb-24 lg:-mb-32 z-10"></div>
      
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoggingIn} message="Logging in..." />
    </div>
  )
}

export default Login
