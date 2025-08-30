"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  HelpCircle,
  FileText,
  AlertTriangle,
  CheckCircle,
  Home,
  Calendar,
  Settings,
} from "lucide-react"
import NotificationCenter from "./notification-center"
import WeatherWidget from "./weather-widget"
import ClaimStatusTracker from "./claim-status-tracker"

function FarmerDashboardEnhanced() {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [claims] = useState([
    {
      id: "CLM-2023-001",
      type: "Flood",
      status: "approved",
      date: "2023-10-15",
      reviewDate: "2023-10-18",
      completionDate: "2023-10-22",
    },
  ])

  const handleLogout = () => {
    console.log('FarmerDashboardEnhanced (component): Logging out...');
    // Clear localStorage for backward compatibility
    localStorage.removeItem("isFarmer");
    // Navigate to login
    navigate("/");
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("mobile-sidebar")
      if (sidebar && !sidebar.contains(event.target) && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-lime-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 md:hidden" aria-label="Toggle menu">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold">FARMER DASHBOARD</h1>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationCenter />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-white text-lime-700 rounded-full flex items-center justify-center">
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
                    onClick={() => alert("Help Center coming soon!")}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <HelpCircle size={16} className="mr-2" />
                    Help Center
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

      <div className="flex flex-1">
        {/* Mobile Sidebar */}
        <div
          id="mobile-sidebar"
          className={`fixed inset-y-0 left-0 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:hidden transition duration-200 ease-in-out z-30 w-64 bg-white shadow-lg`}
        >
          <div className="p-4 bg-lime-700 text-white">
            <h2 className="text-xl font-bold">Menu</h2>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("home")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "home" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Home size={20} className="mr-3" />
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("claims")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "claims" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText size={20} className="mr-3" />
                  My Claims
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("calendar")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "calendar" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Calendar size={20} className="mr-3" />
                  Calendar
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white shadow-md">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab("home")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "home" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Home size={20} className="mr-3" />
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("claims")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "claims" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText size={20} className="mr-3" />
                  My Claims
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "calendar" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Calendar size={20} className="mr-3" />
                  Calendar
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {activeTab === "home" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Farm Information */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold mb-4 text-lime-800">Farm Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Address</span>
                      <p className="font-semibold">123 Example St, Sample Barangay</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Crop Type</span>
                      <p className="font-semibold">Rice</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Area</span>
                      <p className="font-semibold">5.2 hectares</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Insurance ID</span>
                      <p className="font-semibold">INS-2023-0042</p>
                    </div>
                  </div>
                </div>

                {/* File Claim */}
                <div className="bg-lime-700 rounded-xl p-6 text-white space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText size={24} />
                    <h2 className="text-lg font-bold">File a Disaster Insurance Claim</h2>
                  </div>
                  <p className="text-lime-100">
                    If your crops have been damaged by natural disasters, file a claim to receive compensation.
                  </p>
                  <button
                    onClick={() => navigate("/farmer-form")}
                    className="w-full bg-white text-lime-800 font-bold py-3 rounded-lg hover:bg-lime-100 transition"
                  >
                    File New Claim
                  </button>
                </div>

                {/* Latest Claim Status */}
                {claims.length > 0 && (
                  <ClaimStatusTracker
                    status={claims[0].status}
                    claimId={claims[0].id}
                    submittedDate={claims[0].date}
                    reviewDate={claims[0].reviewDate}
                    completionDate={claims[0].completionDate}
                    notes="Your claim has been approved. Payment will be processed within 7 business days."
                  />
                )}
              </div>

              <div className="space-y-6">
                {/* Weather Widget */}
                <WeatherWidget />

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold mb-4 text-lime-800">Recent Notifications</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Claim Approved</p>
                        <p className="text-sm text-gray-600">Your claim has been approved</p>
                        <span className="text-gray-400 text-xs">2h ago</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Weather Alert</p>
                        <p className="text-sm text-gray-600">Heavy rainfall expected in your area</p>
                        <span className="text-gray-400 text-xs">1d ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "claims" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">My Claims</h2>
                <button
                  onClick={() => navigate("/farmer-form")}
                  className="bg-lime-700 text-white px-4 py-2 rounded-lg hover:bg-lime-800 transition"
                >
                  File New Claim
                </button>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Claim ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim) => (
                      <tr key={claim.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(claim.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              claim.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : claim.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => alert(`View details for claim ${claim.id}`)}
                            className="text-lime-700 hover:text-lime-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Farming Calendar</h2>
              <p className="text-gray-600 mb-6">
                Track important dates for your farming activities and insurance deadlines.
              </p>
              <div className="text-center text-gray-500 italic">Calendar feature coming soon...</div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" className="w-full p-2 border rounded-md" defaultValue="Juan Dela Cruz" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" className="w-full p-2 border rounded-md" defaultValue="juan@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" className="w-full p-2 border rounded-md" defaultValue="09123456789" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Notification Preferences</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-lime-600 mr-2" defaultChecked />
                      <span>Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-lime-600 mr-2" defaultChecked />
                      <span>SMS notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-lime-600 mr-2" defaultChecked />
                      <span>Weather alerts</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="bg-lime-700 text-white px-4 py-2 rounded-md hover:bg-lime-800">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default FarmerDashboardEnhanced
