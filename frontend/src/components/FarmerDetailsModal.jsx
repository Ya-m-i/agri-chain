import { X } from "lucide-react"
import RSBSAEnrollmentForm from "./RSBSAEnrollmentForm"

const FarmerDetailsModal = ({
  isOpen,
  onClose,
  farmer,
}) => {
  if (!isOpen || !farmer) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full py-6 flex flex-col items-center min-h-full">
        <div className="w-[80%] max-w-6xl flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">RSBSA Farmer Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full border-2 border-black hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <RSBSAEnrollmentForm
          mode="view"
          initialData={farmer}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}

export default FarmerDetailsModal
