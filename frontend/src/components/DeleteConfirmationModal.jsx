import { X, AlertTriangle } from "lucide-react"

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  farmer, 
  onConfirm 
}) => {
  if (!isOpen || !farmer) return null

  const farmerName = farmer.farmerName || `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim()

  return (
    <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <AlertTriangle className="mr-2 text-red-500" size={24} />
          Delete Farmer
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete <strong>{farmerName}</strong>? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <X size={16} className="mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal

