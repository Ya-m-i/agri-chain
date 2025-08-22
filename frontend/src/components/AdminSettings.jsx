"use client"
import { Settings, Users, UserPlus, HelpingHand, Check } from "lucide-react"

const AdminSettings = () => {
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
                <label className="block text-sm font-medium text-gray-700 mb-1">System Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  defaultValue="admin@agriinsurance.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Settings</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500">
                  <option>All notifications</option>
                  <option>Important only</option>
                  <option>None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500">
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Users size={18} className="text-gray-500 mr-2" />
              User Management
            </h3>
            <button className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors flex items-center">
              <UserPlus size={18} className="mr-2" />
              Manage Admin Users
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <HelpingHand size={18} className="text-gray-500 mr-2" />
              Distribution Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Payment Method</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500">
                  <option>Bank Transfer</option>
                  <option>Mobile Money</option>
                  <option>Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time (Days)</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  defaultValue="7"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition-colors flex items-center">
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
