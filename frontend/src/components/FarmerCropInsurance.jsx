"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  MapPin,
  DollarSign,
  TrendingUp,
  FileText,
  Crop,
  Timer,
  Info,
} from "lucide-react"
import {
  useCropInsurance,
  useCreateCropInsurance
} from '../hooks/useAPI'
// Note: Notifications are now handled by backend API
import { useAuthStore } from '../store/authStore'

const FarmerCropInsurance = () => {
  const { user } = useAuthStore()
  
  // React Query hooks
  const { data: cropInsuranceRecords = [], isLoading: loading } = useCropInsurance(user?._id)
  const createInsuranceMutation = useCreateCropInsurance()
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({
    cropType: "",
    cropArea: "",
    lotNumber: "",
    lotArea: "",
    plantingDate: "",
    expectedHarvestDate: "",
    insuranceDayLimit: "",
    notes: "",
    location: {
      lat: null,
      lng: null
    }
  })

  // Crop type configurations with day limits
  const cropConfigurations = {
    "Corn": { dayLimit: 30, description: "Maize crop with 30-day insurance window" },
    "Rice": { dayLimit: 25, description: "Rice crop with 25-day insurance window" },
    "Wheat": { dayLimit: 20, description: "Wheat crop with 20-day insurance window" },
    "Soybeans": { dayLimit: 35, description: "Soybean crop with 35-day insurance window" },
    "Cotton": { dayLimit: 40, description: "Cotton crop with 40-day insurance window" },
    "Sugarcane": { dayLimit: 45, description: "Sugarcane crop with 45-day insurance window" },
    "Coffee": { dayLimit: 50, description: "Coffee crop with 50-day insurance window" },
    "Cacao": { dayLimit: 55, description: "Cacao crop with 55-day insurance window" },
    "Other": { dayLimit: 30, description: "Other crops with 30-day insurance window" }
  }

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-set day limit when crop type changes
    if (name === 'cropType' && cropConfigurations[value]) {
      setFormData(prev => ({
        ...prev,
        cropType: value,
        insuranceDayLimit: cropConfigurations[value].dayLimit.toString()
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?._id) return
    
    try {
      await createInsuranceMutation.mutateAsync({
        ...formData,
        farmerId: user._id,
        cropArea: parseFloat(formData.cropArea),
        lotArea: parseFloat(formData.lotArea),
        insuranceDayLimit: parseInt(formData.insuranceDayLimit),
        plantingDate: new Date(formData.plantingDate).toISOString(),
        expectedHarvestDate: new Date(formData.expectedHarvestDate).toISOString()
      })

      setShowAddModal(false)
      setFormData({
        cropType: "",
        cropArea: "",
        lotNumber: "",
        lotArea: "",
        plantingDate: "",
        expectedHarvestDate: "",
        insuranceDayLimit: "",
        notes: "",
        location: { lat: null, lng: null }
      })

      console.log('Crop insurance application submitted');
      // Note: Notifications are now created by backend API automatically
    } catch (error) {
      console.error('Error submitting crop insurance:', error);
      // Note: Notifications are now created by backend API automatically
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getRemainingDays = (record) => {
    const now = new Date()
    const deadline = new Date(record.insuranceDeadline)
    const remaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, remaining)
  }

  // Check if record is actually expired (0 days left or deadline passed)
  const isActuallyExpired = (record) => {
    const remainingDays = getRemainingDays(record)
    return remainingDays === 0 || !record.canInsure
  }

  const getStatusColor = (record) => {
    if (record.isInsured) return 'text-green-600'
    if (isActuallyExpired(record)) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getStatusText = (record) => {
    if (record.isInsured) return 'Insured'
    if (isActuallyExpired(record)) return 'Expired'
    return 'Can Insure'
  }

  const getStatusIcon = (record) => {
    if (record.isInsured) return <CheckCircle className="w-4 h-4 mr-1" />
    if (isActuallyExpired(record)) return <X className="w-4 h-4 mr-1" />
    return <Clock className="w-4 h-4 mr-1" />
  }

  const filteredRecords = cropInsuranceRecords
    .filter(record => {
      const cropType = record.cropType.toLowerCase()
      const searchLower = searchQuery.toLowerCase()
      return cropType.includes(searchLower)
    })
    .sort((a, b) => {
      // Sort by updatedAt first, then createdAt, then _id (latest first)
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return dateB - dateA // Descending order (newest first)
    })

  const stats = {
    totalCrops: cropInsuranceRecords.length,
    insuredCrops: cropInsuranceRecords.filter(r => r.isInsured).length,
    uninsuredCrops: cropInsuranceRecords.filter(r => !r.isInsured).length,
    expiredCrops: cropInsuranceRecords.filter(r => !r.canInsure && !r.isInsured).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Crop Insurance</h2>
          <p className="text-gray-600">Manage your crop insurance records with day limits</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Plus size={20} />
          Add New Crop
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-lime-50 p-4 rounded-xl shadow-md text-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Total Crops</p>
              <p className="text-2xl font-bold text-black">{stats.totalCrops}</p>
            </div>
            <Crop className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-lime-50 p-4 rounded-xl shadow-md text-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Insured Crops</p>
              <p className="text-2xl font-bold text-green-600">{stats.insuredCrops}</p>
            </div>
            <Shield className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-lime-50 p-4 rounded-xl shadow-md text-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Uninsured Crops</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.uninsuredCrops}</p>
            </div>
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
        </div>
        <div className="bg-lime-50 p-4 rounded-xl shadow-md text-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Expired Insurance</p>
              <p className="text-2xl font-bold text-red-600">{stats.expiredCrops}</p>
            </div>
            <X className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by crop type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-lime-50 rounded-xl shadow-md overflow-hidden text-black">
        <style>{`
          .crop-insurance-table-scroll::-webkit-scrollbar {
            display: none;
          }
          .crop-insurance-table-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Crop Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Planting Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Expected Harvest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Day Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Actions
                  </th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto crop-insurance-table-scroll" style={{ maxHeight: '350px' }}>
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <div className="text-sm font-medium text-gray-900">{record.cropType}</div>
                        <div className="text-sm text-gray-500">
                          {record.cropArea} ha • Lot {record.lotNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <div className="text-sm text-gray-900">
                          {formatDate(record.plantingDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <div className="text-sm text-gray-900">
                          {formatDate(record.expectedHarvestDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <div className="text-sm text-gray-900">
                          {record.insuranceDayLimit} days
                        </div>
                        {!record.isInsured && !isActuallyExpired(record) && (
                          <div className="text-xs text-yellow-600">
                            {getRemainingDays(record)} days left
                          </div>
                        )}
                        {!record.isInsured && isActuallyExpired(record) && (
                          <div className="text-xs text-red-600">
                            Expired
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record)}`}>
                          {getStatusIcon(record)}
                          {getStatusText(record)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-1/6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRecord(record)
                              setShowDetailsModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record._id} className="bg-white rounded-xl p-4 shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Crop Type</p>
                      <p className="text-sm font-medium text-gray-900">{record.cropType}</p>
                      <p className="text-xs text-gray-600 mt-1">{record.cropArea} ha • Lot {record.lotNumber}</p>
                    </div>
                    <span className={`ml-2 px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full flex-shrink-0 ${getStatusColor(record)}`}>
                      {getStatusIcon(record)}
                      {getStatusText(record)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Planting Date</p>
                    <p className="text-sm text-gray-700">{formatDate(record.plantingDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expected Harvest</p>
                    <p className="text-sm text-gray-700">{formatDate(record.expectedHarvestDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Day Limit</p>
                    <p className="text-sm text-gray-700">{record.insuranceDayLimit} days</p>
                    {!record.isInsured && !isActuallyExpired(record) && (
                      <p className="text-xs text-yellow-600 mt-1">{getRemainingDays(record)} days left</p>
                    )}
                    {!record.isInsured && isActuallyExpired(record) && (
                      <p className="text-xs text-red-600 mt-1">Expired</p>
                    )}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedRecord(record)
                        setShowDetailsModal(true)
                      }}
                      className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-900 font-medium py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Crop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-lime-50 rounded-xl shadow-md text-black p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Add New Crop Insurance Record</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-black hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Crop Type
                  </label>
                  <select
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Crop Type</option>
                    {Object.keys(cropConfigurations).map((crop) => (
                      <option key={crop} value={crop}>
                        {crop} ({cropConfigurations[crop].dayLimit} days)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Crop Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="cropArea"
                    value={formData.cropArea}
                    onChange={handleFormChange}
                    required
                    step="0.01"
                    placeholder="e.g., 5.0"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g., Lot 1 or A-1"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Lot Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="lotArea"
                    value={formData.lotArea}
                    onChange={handleFormChange}
                    required
                    step="0.01"
                    placeholder="e.g., 2.5"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Insurance Day Limit
                  </label>
                  <input
                    type="number"
                    name="insuranceDayLimit"
                    value={formData.insuranceDayLimit}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Planting Date
                  </label>
                  <input
                    type="date"
                    name="plantingDate"
                    value={formData.plantingDate}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    name="expectedHarvestDate"
                    value={formData.expectedHarvestDate}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Notes
                  </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Add any additional notes or remarks about this crop insurance record..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crop Insurance Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Crop Information</h4>
                <p className="text-sm text-gray-600">Crop: {selectedRecord.cropType}</p>
                <p className="text-sm text-gray-600">Area: {selectedRecord.cropArea} hectares</p>
                <p className="text-sm text-gray-600">Lot: {selectedRecord.lotNumber}</p>
                <p className="text-sm text-gray-600">Lot Area: {selectedRecord.lotArea} hectares</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                <p className="text-sm text-gray-600">Planting: {formatDate(selectedRecord.plantingDate)}</p>
                <p className="text-sm text-gray-600">Expected Harvest: {formatDate(selectedRecord.expectedHarvestDate)}</p>
                <p className="text-sm text-gray-600">Insurance Deadline: {formatDate(selectedRecord.insuranceDeadline)}</p>
                <p className="text-sm text-gray-600">Day Limit: {selectedRecord.insuranceDayLimit} days</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Insurance Status</h4>
                <p className="text-sm text-gray-600">
                  Status: <span className={getStatusColor(selectedRecord)}>{getStatusText(selectedRecord)}</span>
                </p>
                {selectedRecord.isInsured && (
                  <>
                    <p className="text-sm text-gray-600">Insurance Date: {formatDate(selectedRecord.insuranceDate)}</p>
                    <p className="text-sm text-gray-600">Insurance Type: {selectedRecord.insuranceType}</p>
                    <p className="text-sm text-gray-600">Premium: ₱{selectedRecord.premiumAmount}</p>
                    <p className="text-sm text-gray-600">Agency: {selectedRecord.agency}</p>
                  </>
                )}
                {!selectedRecord.isInsured && !isActuallyExpired(selectedRecord) && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <Info className="inline w-4 h-4 mr-1" />
                      {getRemainingDays(selectedRecord)} days remaining to apply insurance
                    </p>
                  </div>
                )}
                {!selectedRecord.isInsured && isActuallyExpired(selectedRecord) && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <AlertTriangle className="inline w-4 h-4 mr-1" />
                      Insurance deadline has passed. This crop cannot be insured anymore.
                    </p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                <p className="text-sm text-gray-600">Created: {formatDate(selectedRecord.createdAt)}</p>
                <p className="text-sm text-gray-600">Updated: {formatDate(selectedRecord.updatedAt)}</p>
                {selectedRecord.notes && (
                  <p className="text-sm text-gray-600">Notes: {selectedRecord.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerCropInsurance 