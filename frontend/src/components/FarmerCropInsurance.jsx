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

  const getStatusColor = (record) => {
    if (record.isInsured) return 'text-green-600'
    if (!record.canInsure) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getStatusText = (record) => {
    if (record.isInsured) return 'Insured'
    if (!record.canInsure) return 'Expired'
    return 'Can Insure'
  }

  const getStatusIcon = (record) => {
    if (record.isInsured) return <CheckCircle className="w-4 h-4 mr-1" />
    if (!record.canInsure) return <X className="w-4 h-4 mr-1" />
    return <Clock className="w-4 h-4 mr-1" />
  }

  const filteredRecords = cropInsuranceRecords.filter(record => {
    const cropType = record.cropType.toLowerCase()
    const searchLower = searchQuery.toLowerCase()
    return cropType.includes(searchLower)
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
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Crops</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCrops}</p>
            </div>
            <Crop className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Insured Crops</p>
              <p className="text-2xl font-bold text-green-600">{stats.insuredCrops}</p>
            </div>
            <Shield className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uninsured Crops</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.uninsuredCrops}</p>
            </div>
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Insurance</p>
              <p className="text-2xl font-bold text-red-600">{stats.expiredCrops}</p>
            </div>
            <X className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
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
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planting Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Harvest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.cropType}</div>
                    <div className="text-sm text-gray-500">
                      {record.cropArea} ha • Lot {record.lotNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(record.plantingDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(record.expectedHarvestDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.insuranceDayLimit} days
                    </div>
                    {!record.isInsured && record.canInsure && (
                      <div className="text-xs text-yellow-600">
                        {getRemainingDays(record)} days left
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record)}`}>
                      {getStatusIcon(record)}
                      {getStatusText(record)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

      {/* Add New Crop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-[5px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Crop Insurance Record</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crop Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="cropArea"
                    value={formData.cropArea}
                    onChange={handleFormChange}
                    required
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lot Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="lotArea"
                    value={formData.lotArea}
                    onChange={handleFormChange}
                    required
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="3"
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
                {!selectedRecord.isInsured && selectedRecord.canInsure && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <Info className="inline w-4 h-4 mr-1" />
                      {getRemainingDays(selectedRecord)} days remaining to apply insurance
                    </p>
                  </div>
                )}
                {!selectedRecord.canInsure && !selectedRecord.isInsured && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <AlertTriangle className="inline w-4 h-4 mr-1" />
                      Insurance deadline has passed
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