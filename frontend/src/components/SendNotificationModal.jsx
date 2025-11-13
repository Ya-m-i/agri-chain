"use client"

import { useState, useEffect } from "react"
import { X, Search, Send, User, AlertCircle } from "lucide-react"
import { fetchFarmers, sendNotification } from "../api"

const SendNotificationModal = ({ isOpen, onClose, onSuccess }) => {
  const [farmers, setFarmers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [notificationType, setNotificationType] = useState("info")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Load farmers on mount
  useEffect(() => {
    if (isOpen) {
      loadFarmers()
    }
  }, [isOpen])

  // Search farmers by name or ID
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const results = farmers.filter(farmer => {
        const fullName = `${farmer.firstName || ''} ${farmer.middleName || ''} ${farmer.lastName || ''}`.toLowerCase()
        const farmerId = farmer._id?.toString().toLowerCase() || ''
        const username = (farmer.username || '').toLowerCase()
        
        return fullName.includes(query) || 
               farmerId.includes(query) || 
               username.includes(query) ||
               (farmer._id && farmer._id.toString() === query)
      })
      setSearchResults(results.slice(0, 10)) // Limit to 10 results
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, farmers])

  const loadFarmers = async () => {
    try {
      const data = await fetchFarmers()
      setFarmers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading farmers:", error)
      setError("Failed to load farmers. Please try again.")
    }
  }

  const handleSelectFarmer = (farmer) => {
    setSelectedFarmer(farmer)
    setSearchQuery(`${farmer.firstName} ${farmer.lastName} (${farmer._id})`)
    setShowSearchResults(false)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!selectedFarmer) {
      setError("Please select a farmer")
      setLoading(false)
      return
    }

    if (!title.trim() || !message.trim()) {
      setError("Title and message are required")
      setLoading(false)
      return
    }

    try {
      await sendNotification({
        recipientType: 'farmer',
        recipientId: selectedFarmer._id,
        type: notificationType,
        title: title.trim(),
        message: message.trim(),
        relatedEntityType: 'general'
      })

      setSuccess("Notification sent successfully!")
      
      // Reset form
      setSelectedFarmer(null)
      setSearchQuery("")
      setTitle("")
      setMessage("")
      setNotificationType("info")

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose()
        setSuccess("")
      }, 1500)
    } catch (error) {
      console.error("Error sending notification:", error)
      setError(error.message || "Failed to send notification. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedFarmer(null)
    setSearchQuery("")
    setTitle("")
    setMessage("")
    setNotificationType("info")
    setError("")
    setSuccess("")
    setShowSearchResults(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-2 border-lime-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-lime-600 to-lime-700 text-white p-6 flex justify-between items-center shadow-lg">
          <div className="flex items-center">
            <Send className="mr-3" size={24} />
            <h2 className="text-xl font-bold">Send Notification to Farmer</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Farmer Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Farmer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by farmer name or ID..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-lime-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((farmer) => (
                      <button
                        key={farmer._id}
                        type="button"
                        onClick={() => handleSelectFarmer(farmer)}
                        className="w-full text-left px-4 py-3 hover:bg-lime-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center">
                          <User className="text-lime-600 mr-2" size={18} />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {farmer.firstName} {farmer.middleName || ''} {farmer.lastName}
                            </p>
                            <p className="text-xs text-gray-500">ID: {farmer._id}</p>
                            {farmer.username && (
                              <p className="text-xs text-gray-500">Username: {farmer.username}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Farmer Display */}
                {selectedFarmer && (
                  <div className="mt-3 p-3 bg-lime-50 border-2 border-lime-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="text-lime-600 mr-2" size={20} />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {selectedFarmer.firstName} {selectedFarmer.middleName || ''} {selectedFarmer.lastName}
                          </p>
                          <p className="text-xs text-gray-600">ID: {selectedFarmer._id}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFarmer(null)
                          setSearchQuery("")
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {showSearchResults && searchQuery && searchResults.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-lime-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    No farmers found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                required
                maxLength={100}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter notification message..."
                rows={4}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                required
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <AlertCircle className="text-red-600 mr-2" size={20} />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <Send className="text-green-600 mr-2" size={20} />
                <p className="text-green-600 font-medium">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFarmer || !title.trim() || !message.trim()}
                className="flex-1 bg-lime-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-lime-700 transition-colors flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SendNotificationModal

