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
  Edit,
  Trash2,
  Eye,
  MapPin,
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  Crop,
  Timer,
} from "lucide-react"
import {
  useFarmers,
  useCropInsurance,
  useCropInsuranceStats,
  useCreateCropInsurance,
  useUpdateCropInsurance,
  useDeleteCropInsurance
} from '../hooks/useAPI'
import { useNotificationStore } from '../store/notificationStore'

const CropInsuranceManagement = () => {
  // React Query hooks
  const { data: cropInsuranceRecords = [], isLoading: insuranceLoading } = useCropInsurance()
  const { data: farmers = [], isLoading: farmersLoading } = useFarmers()
  const { data: stats = {}, isLoading: statsLoading } = useCropInsuranceStats()
  const createInsuranceMutation = useCreateCropInsurance()
  const updateInsuranceMutation = useUpdateCropInsurance()
  const deleteInsuranceMutation = useDeleteCropInsurance()
  
  // Combined loading state
  const loading = insuranceLoading || farmersLoading || statsLoading || 
                 createInsuranceMutation.isPending || updateInsuranceMutation.isPending || deleteInsuranceMutation.isPending
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({
    farmerId: "",
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

  // Remove unused loadData function - React Query handles data loading automatically

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

    console.log('Form submission started with data:', formData)

    try {
      const submissionData = {
        ...formData,
        cropArea: parseFloat(formData.cropArea),
        lotArea: parseFloat(formData.lotArea),
        insuranceDayLimit: parseInt(formData.insuranceDayLimit),
        plantingDate: new Date(formData.plantingDate).toISOString(),
        expectedHarvestDate: new Date(formData.expectedHarvestDate).toISOString()
      }
      
      console.log('Submitting crop insurance data:', submissionData)
      
      await createInsuranceMutation.mutateAsync(submissionData)

      setShowAddModal(false)
      setFormData({
        farmerId: "",
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

      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: 'Crop Insurance Created',
        message: 'New crop insurance record has been created successfully.',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error creating crop insurance record:', error)
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Error Creating Record',
        message: error.message,
        timestamp: new Date()
      })
    }
  }

  const handleApplyInsurance = async (recordId, insuranceData) => {
    try {
      await updateInsuranceMutation.mutateAsync({
        id: recordId,
        updateData: {
          isInsured: true,
          insuranceType: insuranceData.insuranceType,
          premiumAmount: parseFloat(insuranceData.premiumAmount),
          agency: insuranceData.agency,
          insuranceDate: new Date().toISOString()
        }
      })

      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: 'Insurance Applied',
        message: 'Crop insurance has been applied successfully.',
        timestamp: new Date()
      })
    } catch (error) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Error Applying Insurance',
        message: error.message,
        timestamp: new Date()
      })
    }
  }

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this crop insurance record?')) {
      return
    }

    try {
      await deleteInsuranceMutation.mutateAsync(recordId)
      
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: 'Record Deleted',
        message: 'Crop insurance record has been deleted successfully.',
        timestamp: new Date()
      })
    } catch (error) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Error Deleting Record',
        message: error.message,
        timestamp: new Date()
      })
    }
  }

  const getFarmerName = (farmerId) => {
    console.log('getFarmerName called with:', farmerId, 'Type:', typeof farmerId)
    
    // Check if farmerId is an object (populated data) or string (ID)
    if (typeof farmerId === 'object' && farmerId !== null) {
      // This is populated farmer data
      console.log('Using populated farmer data:', farmerId)
      return `${farmerId.firstName} ${farmerId.lastName}`
    } else {
      // This is just an ID, try to find in farmers list
      const farmer = farmers.find(f => f._id === farmerId)
      console.log('Found farmer in list:', farmer)
      return farmer ? `${farmer.firstName} ${farmer.lastName}` : 'Unknown Farmer'
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

  const filteredRecords = cropInsuranceRecords.filter(record => {
    const farmerName = getFarmerName(record.farmerId).toLowerCase()
    const cropType = record.cropType.toLowerCase()
    const searchLower = searchQuery.toLowerCase()
    return farmerName.includes(searchLower) || cropType.includes(searchLower)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Crop Insurance Management</h2>
          <p className="text-gray-600">Manage crop insurance records with day limits</p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.totalCrops || 0}</p>
            </div>
            <Crop className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Insured Crops</p>
              <p className="text-2xl font-bold text-green-600">{stats.insuredCrops || 0}</p>
            </div>
            <Shield className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uninsured Crops</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.uninsuredCrops || 0}</p>
            </div>
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Insurance Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.insuranceRate || 0}%</p>
            </div>
            <TrendingUp className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by farmer name or crop type..."
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
                  Farmer
                </th>
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
                    <div className="text-sm font-medium text-gray-900">
                      {getFarmerName(record.farmerId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.cropType}</div>
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
                      {record.isInsured ? (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      ) : !record.canInsure ? (
                        <X className="w-4 h-4 mr-1" />
                      ) : (
                        <Clock className="w-4 h-4 mr-1" />
                      )}
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
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      {!record.isInsured && record.canInsure && (
                        <button
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowEditModal(true)
                          }}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <Shield size={16} />
                          <span>Insure</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRecord(record._id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    Farmer
                  </label>
                  <select
                    name="farmerId"
                    value={formData.farmerId}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Farmer</option>
                    {farmers.map((farmer) => (
                      <option key={farmer._id} value={farmer._id}>
                        {farmer.firstName} {farmer.lastName}
                      </option>
                    ))}
                  </select>
                </div>
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

      {/* Apply Insurance Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Apply Insurance</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Applying insurance for {selectedRecord.cropType} crop by {getFarmerName(selectedRecord.farmerId)}
              </p>
              <p className="text-xs text-yellow-600">
                {getRemainingDays(selectedRecord)} days remaining to apply insurance
              </p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleApplyInsurance(selectedRecord._id, {
                insuranceType: formData.get('insuranceType'),
                premiumAmount: formData.get('premiumAmount'),
                agency: formData.get('agency')
              })
              setShowEditModal(false)
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Type
                </label>
                <select
                  name="insuranceType"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Insurance Type</option>
                  <option value="Basic">Basic Coverage</option>
                  <option value="Premium">Premium Coverage</option>
                  <option value="Comprehensive">Comprehensive Coverage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Premium Amount
                </label>
                <input
                  type="number"
                  name="premiumAmount"
                  required
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Agency
                </label>
                <input
                  type="text"
                  name="agency"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Apply Insurance
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
                <h4 className="font-medium text-gray-900 mb-2">Farmer Information</h4>
                <p className="text-sm text-gray-600">Name: {getFarmerName(selectedRecord.farmerId)}</p>
                <p className="text-sm text-gray-600">Crop: {selectedRecord.cropType}</p>
                <p className="text-sm text-gray-600">Area: {selectedRecord.cropArea} hectares</p>
                <p className="text-sm text-gray-600">Lot: {selectedRecord.lotNumber}</p>
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
                  <p className="text-sm text-yellow-600">
                    {getRemainingDays(selectedRecord)} days remaining to apply insurance
                  </p>
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

export default CropInsuranceManagement