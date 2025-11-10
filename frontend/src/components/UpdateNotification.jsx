"use client"

import { useState } from "react"
import { RefreshCw, X } from "lucide-react"

const UpdateNotification = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleUpdate = () => {
    setIsVisible(false)
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }
    // Clear service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
    }
    // Reload the page
    window.location.reload()
  }

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) onDismiss()
  }

  if (!isVisible) return null

  return (
    <div 
      className="fixed top-4 right-4 z-[10000]"
      style={{
        animation: 'slide-in-right 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div className="bg-white border-2 border-lime-500 rounded-xl shadow-2xl p-6 max-w-md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-lime-100 rounded-full p-2 mr-3">
              <RefreshCw className="text-lime-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">New Update Available</h3>
              <p className="text-sm text-gray-600 mt-1">
                A new version of the app is available. Click reload to get the latest features.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-lime-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-lime-700 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <RefreshCw size={18} className="mr-2" />
            Reload Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdateNotification

