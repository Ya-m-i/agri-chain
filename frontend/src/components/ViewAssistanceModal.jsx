import { X } from "lucide-react"

const ViewAssistanceModal = ({ 
  isOpen, 
  onClose, 
  assistance 
}) => {
  if (!isOpen || !assistance) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assistance Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Assistance Type</h3>
            <p className="text-gray-900">{assistance.assistanceType}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Founder</h3>
            <p className="text-gray-900">{assistance.founderName}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Quantity</h3>
            <p className="text-gray-900">{assistance.quantity}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Date Added</h3>
            <p className="text-gray-900">{assistance.dateAdded}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Farmers Availed</h3>
            <div className="mt-2">
              {assistance.farmersAvailed?.length > 0 ? (
                <ul className="space-y-2">
                  {assistance.farmersAvailed.map((farmer, index) => (
                    <li key={index} className="text-gray-900">
                      {farmer}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No farmers have availed this assistance yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewAssistanceModal

