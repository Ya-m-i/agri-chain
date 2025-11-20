"use client"

import { useState, useEffect } from "react"
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Import custom KPI icons
import totalCropsIcon from '../assets/Images/totalcrops.png'
import insuredIcon from '../assets/Images/insured.png'
import uninsuredIcon from '../assets/Images/uninsured.png'
import rateIcon from '../assets/Images/rate.png'
import {
  useFarmers,
  useCropInsurance,
  useCropInsuranceStats,
  useCreateCropInsurance,
  useUpdateCropInsurance,
  useDeleteCropInsurance
} from '../hooks/useAPI'
// Note: Notifications are now handled by backend API or parent component

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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
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
    evidenceImage: null,
    location: {
      lat: null,
      lng: null
    }
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)

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

  // Remove unused loadData function - React Query handles data loading automatically

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-populate fields when farmer is selected
    if (name === 'farmerId' && value) {
      const selectedFarmer = farmers.find(f => f._id === value)
      if (selectedFarmer) {
        setFormData(prev => ({
          ...prev,
          farmerId: value,
          cropArea: selectedFarmer.cropArea || "",
          lotNumber: selectedFarmer.lotNumber || "",
          lotArea: selectedFarmer.lotArea || ""
        }))
      }
    }

    // Auto-set day limit when crop type changes
    if (name === 'cropType' && cropConfigurations[value]) {
      setFormData(prev => ({
        ...prev,
        cropType: value,
        insuranceDayLimit: cropConfigurations[value].dayLimit.toString()
      }))
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, evidenceImage: reader.result }))
      }
      reader.readAsDataURL(file)
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
        expectedHarvestDate: new Date(formData.expectedHarvestDate).toISOString(),
        evidenceImage: formData.evidenceImage || null
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
        evidenceImage: null,
        location: { lat: null, lng: null }
      })

      console.log('Crop insurance created successfully');
    } catch (error) {
      console.error('Error creating crop insurance record:', error)
    }
  }

  const handleApplyInsurance = async (recordId, insuranceData) => {
    try {
      await updateInsuranceMutation.mutateAsync({
        id: recordId,
        updateData: {
          isInsured: true,
          agency: insuranceData.agency,
          insuranceDate: new Date().toISOString()
        }
      })

      console.log('Insurance applied successfully');
    } catch (error) {
      console.error('Error applying insurance:', error)
    }
  }

  const handleDeleteClick = (recordId) => {
    setRecordToDelete(recordId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return

    try {
      await deleteInsuranceMutation.mutateAsync(recordToDelete)
      console.log('Insurance record deleted successfully');
      setShowDeleteConfirm(false)
      setRecordToDelete(null)
    } catch (error) {
      console.error('Error deleting insurance record:', error)
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
    const remainingDays = getRemainingDays(record)
    if (remainingDays === 0 || !record.canInsure) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getStatusText = (record) => {
    if (record.isInsured) return 'Insured'
    const remainingDays = getRemainingDays(record)
    if (remainingDays === 0 || !record.canInsure) return 'Expired'
    return 'Can Insure'
  }

  const filteredRecords = cropInsuranceRecords.filter(record => {
    const farmerName = getFarmerName(record.farmerId).toLowerCase()
    const cropType = record.cropType.toLowerCase()
    const searchLower = searchQuery.toLowerCase()
    return farmerName.includes(searchLower) || cropType.includes(searchLower)
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <div className="space-y-6 bg-white rounded-lg p-6">
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
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Crops</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCrops || 0}</p>
            </div>
            <img src={totalCropsIcon} alt="Total Crops" className="h-12 w-12" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Insured Crops</p>
              <p className="text-2xl font-bold text-green-600">{stats.insuredCrops || 0}</p>
            </div>
            <img src={insuredIcon} alt="Insured Crops" className="h-12 w-12" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uninsured Crops</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.uninsuredCrops || 0}</p>
            </div>
            <img src={uninsuredIcon} alt="Uninsured Crops" className="h-12 w-12" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Insurance Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.insuranceRate || 0}%</p>
            </div>
            <img src={rateIcon} alt="Insurance Rate" className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4">
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

      {/* Records Table - Responsive */}
      <div className="bg-white rounded-lg shadow overflow-hidden border-2 border-black">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitScrollbar: 'none' }}>
          <table className="w-full" style={{ scrollbarWidth: 'none' }}>
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
              {paginatedRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {getFarmerName(record.farmerId)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{record.cropType}</div>
                    <div className="text-sm text-gray-500">
                      {record.cropArea} ha • Lot {record.lotNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(record.plantingDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(record.expectedHarvestDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {record.insuranceDayLimit} days
                    </div>
                    {!record.isInsured && record.canInsure && (
                      <div className="text-xs text-yellow-600">
                        {getRemainingDays(record)} days left
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRecord(record)
                          setShowDetailsModal(true)
                        }}
                        className="bg-blue-600 border-2 border-black text-white px-3 py-1 rounded-lg hover:bg-blue-700 font-bold text-sm flex items-center gap-1"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      {!record.isInsured && record.canInsure && getRemainingDays(record) > 0 && (
                        <button
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowEditModal(true)
                          }}
                          className="bg-lime-400 border-2 border-black text-black px-3 py-1 rounded-lg hover:bg-lime-500 font-bold text-sm flex items-center gap-1"
                        >
                          <Shield size={16} />
                          <span>Insure</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(record._id)}
                        className="bg-red-500 border-2 border-black text-white px-3 py-1 rounded-lg hover:bg-red-600 font-bold text-sm flex items-center gap-1"
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

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-4">
          {paginatedRecords.map((record) => (
            <div key={record._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{getFarmerName(record.farmerId)}</h3>
                  <p className="text-sm text-gray-600">{record.cropType}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record)}`}>
                  {record.isInsured ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : !record.canInsure ? (
                    <X className="w-3 h-3 mr-1" />
                  ) : (
                    <Clock className="w-3 h-3 mr-1" />
                  )}
                  {getStatusText(record)}
                </span>
              </div>
              <div className="space-y-2 text-xs text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span>Crop Area:</span>
                  <span className="text-gray-900">{record.cropArea} ha</span>
                </div>
                <div className="flex justify-between">
                  <span>Lot:</span>
                  <span className="text-gray-900">{record.lotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Planting:</span>
                  <span className="text-gray-900">{formatDate(record.plantingDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Harvest:</span>
                  <span className="text-gray-900">{formatDate(record.expectedHarvestDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Day Limit:</span>
                  <span className="text-gray-900">{record.insuranceDayLimit} days</span>
                </div>
                {!record.isInsured && record.canInsure && (
                  <div className="flex justify-between text-yellow-600">
                    <span>Remaining:</span>
                    <span className="font-medium">{getRemainingDays(record)} days left</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedRecord(record)
                    setShowDetailsModal(true)
                  }}
                  className="flex-1 bg-blue-600 border-2 border-black text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                {!record.isInsured && record.canInsure && getRemainingDays(record) > 0 && (
                  <button
                    onClick={() => {
                      setSelectedRecord(record)
                      setShowEditModal(true)
                    }}
                    className="flex-1 bg-lime-400 border-2 border-black text-black px-3 py-2 rounded-lg hover:bg-lime-500 font-bold text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <Shield size={16} />
                    <span>Insure</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(record._id)}
                  className="bg-red-500 border-2 border-black text-white px-3 py-2 rounded-lg hover:bg-red-600 font-bold text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredRecords.length)}</span> of{' '}
                  <span className="font-medium">{filteredRecords.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-green-50 border-green-500 text-green-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Crop Modal - Farm Vibe Design (matches Register Farmer form) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">🌾 Add New Crop Insurance</h2>
              <button
                className="text-black hover:bg-lime-200 rounded-full p-1 focus:outline-none transition-all"
                onClick={() => setShowAddModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 md:p-8 bg-white">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Farmer
                  </label>
                  <select
                    name="farmerId"
                    value={formData.farmerId}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
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
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Crop Type
                  </label>
                  <select
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
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
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
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
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g., Lot 1 or A-1"
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
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
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Insurance Day Limit
                  </label>
                  <input
                    type="number"
                    name="insuranceDayLimit"
                    value={formData.insuranceDayLimit}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Planting Date
                  </label>
                  <input
                    type="date"
                    name="plantingDate"
                    value={formData.plantingDate}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    name="expectedHarvestDate"
                    value={formData.expectedHarvestDate}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Evidence Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                  />
                  {formData.evidenceImage && (
                    <div className="mt-2">
                      <img src={formData.evidenceImage} alt="Evidence" className="max-w-full h-32 object-contain border-2 border-black rounded-lg" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Add any additional notes or remarks about this crop insurance record..."
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400 resize-none"
                  />
                </div>
                
                <div className="flex gap-3 md:col-span-2 mt-6 pt-6 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 transition-all font-bold shadow-lg flex items-center justify-center disabled:opacity-50"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    {loading ? 'Creating...' : 'Create Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Apply Insurance Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">🛡️ Apply Insurance</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-black hover:bg-lime-200 rounded-full p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 bg-white">
              <div className="mb-4 p-3 bg-lime-50 border-2 border-black rounded-lg">
                <p className="text-sm font-semibold text-black mb-1">
                  {selectedRecord.cropType} crop by {getFarmerName(selectedRecord.farmerId)}
                </p>
                <p className="text-xs text-yellow-600">
                  {getRemainingDays(selectedRecord)} days remaining to apply insurance
                </p>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                handleApplyInsurance(selectedRecord._id, {
                  agency: formData.get('agency')
                })
                setShowEditModal(false)
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Insurance Agency
                  </label>
                  <select
                    name="agency"
                    required
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                  >
                    <option value="">Select Agency</option>
                    <option value="DA-PCIC">DA-PCIC (Philippine Crop Insurance Corporation)</option>
                    <option value="DA">DA (Department of Agriculture)</option>
                    <option value="Private Insurance">Private Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 font-bold"
                  >
                    Apply Insurance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">📋 Crop Insurance Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-black hover:bg-lime-200 rounded-full p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-lime-50 border-2 border-black rounded-lg">
                <h4 className="font-bold text-black mb-2 uppercase text-sm">Farmer Information</h4>
                <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Name:</span> {getFarmerName(selectedRecord.farmerId)}</p>
                <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Crop:</span> {selectedRecord.cropType}</p>
                <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Area:</span> {selectedRecord.cropArea} hectares</p>
                <p className="text-sm text-gray-700"><span className="font-semibold">Lot:</span> {selectedRecord.lotNumber}</p>
              </div>
              <div className="p-4 bg-lime-50 border-2 border-black rounded-lg">
                <h4 className="font-bold text-black mb-2 uppercase text-sm">Timeline</h4>
                <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Planting:</span> {formatDate(selectedRecord.plantingDate)}</p>
                <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Expected Harvest:</span> {formatDate(selectedRecord.expectedHarvestDate)}</p>
                <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Insurance Deadline:</span> {formatDate(selectedRecord.insuranceDeadline)}</p>
                <p className="text-sm text-gray-700"><span className="font-semibold">Day Limit:</span> {selectedRecord.insuranceDayLimit} days</p>
              </div>
              <div className="p-4 bg-lime-50 border-2 border-black rounded-lg">
                <h4 className="font-bold text-black mb-2 uppercase text-sm">Insurance Status</h4>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Status:</span> <span className={getStatusColor(selectedRecord)}>{getStatusText(selectedRecord)}</span>
                </p>
                {selectedRecord.isInsured && (
                  <>
                    <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Insurance Date:</span> {formatDate(selectedRecord.insuranceDate)}</p>
                    <p className="text-sm text-gray-700"><span className="font-semibold">Agency:</span> {selectedRecord.agency}</p>
                  </>
                )}
                {!selectedRecord.isInsured && getRemainingDays(selectedRecord) > 0 && (
                  <p className="text-sm text-yellow-600">
                    {getRemainingDays(selectedRecord)} days remaining to apply insurance
                  </p>
                )}
              </div>
              <div className="p-4 bg-lime-50 border-2 border-black rounded-lg">
                <h4 className="font-bold text-black mb-2 uppercase text-sm">Additional Information</h4>
                <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Created:</span> {formatDate(selectedRecord.createdAt)}</p>
                <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Updated:</span> {formatDate(selectedRecord.updatedAt)}</p>
                {selectedRecord.notes && (
                  <p className="text-sm text-gray-700"><span className="font-semibold">Notes:</span> {selectedRecord.notes}</p>
                )}
              </div>
              {selectedRecord.evidenceImage && (
                <div className="md:col-span-2 p-4 bg-lime-50 border-2 border-black rounded-lg">
                  <h4 className="font-bold text-black mb-2 uppercase text-sm">Evidence Image</h4>
                  <img src={selectedRecord.evidenceImage} alt="Evidence" className="max-w-full h-64 object-contain border-2 border-black rounded-lg" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">⚠️ Confirm Delete</h2>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setRecordToDelete(null)
                }}
                className="text-black hover:bg-lime-200 rounded-full p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 bg-white">
              <p className="text-black mb-6 text-center">
                Are you sure you want to delete this crop insurance record? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setRecordToDelete(null)
                  }}
                  className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRecord}
                  className="flex-1 bg-red-500 border-2 border-black text-white px-4 py-3 rounded-lg hover:bg-red-600 font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CropInsuranceManagement