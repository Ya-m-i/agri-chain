import { X, User, CheckCircle } from "lucide-react"

const FarmerDetailsModal = ({ 
  isOpen, 
  onClose, 
  farmer 
}) => {
  if (!isOpen || !farmer) return null

  return (
    <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Farmer Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-lime-800 mb-3 flex items-center gap-2">
                <User size={20} />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">Full Name</span>
                  <p className="font-medium">{farmer.farmerName || `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim()}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Birthday</span>
                  <p className="font-medium">{farmer.birthday || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Gender</span>
                  <p className="font-medium">{farmer.gender || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Contact Number</span>
                  <p className="font-medium">{farmer.contactNum || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Address</span>
                  <p className="font-medium">{farmer.address || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Farm Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">Crop Type</span>
                  <p className="font-medium">{farmer.cropType || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Crop Area</span>
                  <p className="font-medium">{farmer.cropArea ? `${farmer.cropArea} hectares` : "Not provided"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Lot Number</span>
                  <p className="font-medium">{farmer.lotNumber || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Lot Area</span>
                  <p className="font-medium">{farmer.lotArea || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Certified</span>
                  <p className="font-medium">
                    {farmer.isCertified ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle size={16} className="mr-1" /> Yes
                      </span>
                    ) : (
                      <span className="text-gray-600">No</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Insurance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-sm">Insurance Type</span>
                <p className="font-medium">{farmer.insuranceType || "Not provided"}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Premium Amount</span>
                <p className="font-medium">{farmer.premiumAmount || "Not provided"}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Period From</span>
                <p className="font-medium">{farmer.periodFrom || "Not provided"}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Period To</span>
                <p className="font-medium">{farmer.periodTo || "Not provided"}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Agency</span>
                <p className="font-medium">{farmer.agency || "Not provided"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-lime-700 text-white px-6 py-2 rounded-lg hover:bg-lime-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerDetailsModal

