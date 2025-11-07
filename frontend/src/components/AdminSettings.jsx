"use client"
import { useState } from "react"
import { Settings, Check, Globe, Clock } from "lucide-react"

const AdminSettings = () => {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or default to English
    return localStorage.getItem('adminLanguage') || 'English'
  })
  const [timeZone, setTimeZone] = useState(() => {
    // Get from localStorage or default to Asia/Manila (Philippines)
    return localStorage.getItem('adminTimeZone') || 'Asia/Manila'
  })
  const [saveStatus, setSaveStatus] = useState("")

  // Save settings to localStorage
  const handleSave = () => {
    localStorage.setItem('adminLanguage', language)
    localStorage.setItem('adminTimeZone', timeZone)
    setSaveStatus("Settings saved successfully!")
    setTimeout(() => setSaveStatus(""), 3000)
  }

  // Get all time zones
  const timeZones = [
    { value: 'Asia/Manila', label: 'Asia/Manila (Philippines Standard Time)' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'EST (Eastern Standard Time)' },
    { value: 'America/Los_Angeles', label: 'PST (Pacific Standard Time)' },
    { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
    { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)' },
    { value: 'Asia/Singapore', label: 'SGT (Singapore Time)' },
    { value: 'Australia/Sydney', label: 'AEST (Australian Eastern Standard Time)' },
  ]

  return (
    <div className="mt-6">
      <div className="flex items-center mb-4">
        <Settings size={24} className="text-lime-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Admin Settings</h2>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Settings size={18} className="text-gray-500 mr-2" />
              System Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Globe size={16} className="mr-2" />
                  Default Language
                </label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="English">English</option>
                  <option value="Tagalog">Tagalog</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Selected language: {language}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Clock size={16} className="mr-2" />
                  Time Zone
                </label>
                <select 
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  {timeZones.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Current time: {new Date().toLocaleString('en-US', { timeZone: timeZone })}
                </p>
              </div>
            </div>
          </div>

          {saveStatus && (
            <div className={`p-3 rounded-lg ${saveStatus.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {saveStatus}
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button 
              onClick={handleSave}
              className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition-colors flex items-center"
            >
              <Check size={18} className="mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
