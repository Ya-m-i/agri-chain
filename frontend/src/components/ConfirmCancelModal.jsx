"use client"

import { X, AlertCircle } from "lucide-react"

const ConfirmCancelModal = ({ isOpen, onConfirm, onCancel, title = "Cancel Form", message = "Are you sure you want to cancel? All unsaved changes will be lost." }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-lime-50 rounded-xl shadow-md text-black max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-black">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-black hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-black mb-6 ml-12">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-black hover:bg-lime-100 transition-colors font-medium bg-white"
          >
            No, Continue
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmCancelModal

