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
          insuranceType: insuranceData.insuranceType,
          premiumAmount: parseFloat(insuranceData.premiumAmount),
          agency: insuranceData.agency,
          insuranceDate: new Date().toISOString()
        }
      })

      console.log('Insurance applied successfully');
    } catch (error) {
      console.error('Error applying insurance:', error)
    }
  }

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this crop insurance record?')) {
      return
    }

    try {
      await deleteInsuranceMutation.mutateAsync(recordId)
      console.log('Insurance record deleted successfully');
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
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
                  className="flex-1 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
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
                    className="flex-1 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Shield size={16} />
                    <span>Insure</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteRecord(record._id)}
                  className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
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

      {/* Add New Crop Modal - Minimalist Blockchain Style */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar border border-gray-300 relative animate-[fadeIn_0.3s_ease-in]" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            
            {/* Decorative Lines */}
            <div className="absolute top-8 left-8 w-24 h-0.5 bg-gradient-to-r from-lime-500 to-transparent opacity-60 z-10"></div>
            <div className="absolute top-8 right-8 w-24 h-0.5 bg-gradient-to-l from-lime-500 to-transparent opacity-60 z-10"></div>
            
            <div className="sticky top-0 bg-white border-b-4 border-lime-500 p-6 flex justify-between items-center z-20 relative" style={{ boxShadow: '0 6px 20px rgba(132, 204, 22, 0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-black rounded-lg animate-pulse" style={{ boxShadow: '0 0 20px rgba(132, 204, 22, 0.8)' }}>
                  <Shield className="h-7 w-7 text-lime-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black tracking-wide uppercase">⛓️ Add Insurance</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px rgba(132, 204, 22, 1)' }}></span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">Blockchain Protocol</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-lime-500 hover:text-lime-600 focus:outline-none transition-all hover:rotate-90 duration-300"
                style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.6))' }}
              >
                <X size={28} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">
                    Farmer
                  </label>
                  <select
                    name="farmerId"
                    value={formData.farmerId}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  >
                    <option value="">Select Farmer</option>
                    {farmers.map((farmer) => (
                      <option key={farmer._id} value={farmer._id}>
                        {farmer.firstName} {farmer.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">
                    Crop Type
                  </label>
                  <select
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  >
                    <option value="">Select Crop Type</option>
                    {Object.keys(cropConfigurations).map((crop) => (
                      <option key={crop} value={crop}>
                        {crop} ({cropConfigurations[crop].dayLimit} days)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">
                    Crop Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="cropArea"
                    value={formData.cropArea}
                    onChange={handleFormChange}
                    required
                    step="0.01"
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">
                    Lot Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="lotArea"
                    value={formData.lotArea}
                    onChange={handleFormChange}
                    required
                    step="0.01"
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">
                    Insurance Day Limit
                  </label>
                  <input
                    type="number"
                    name="insuranceDayLimit"
                    value={formData.insuranceDayLimit}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">
                    Planting Date
                  </label>
                  <input
                    type="date"
                    name="plantingDate"
                    value={formData.plantingDate}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    name="expectedHarvestDate"
                    value={formData.expectedHarvestDate}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600 resize-none"
                  style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                />
              </div>
              <div className="flex gap-3 pt-6 border-t-2 border-lime-500 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white text-black border-2 border-black px-6 py-3 rounded-lg hover:bg-black hover:text-white transition-all font-bold uppercase tracking-wide text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-lime-500 px-6 py-3 rounded-lg hover:bg-lime-500 hover:text-black disabled:opacity-50 transition-all font-bold uppercase tracking-wide text-sm relative overflow-hidden group border-2 border-black hover:border-lime-500"
                  style={{ boxShadow: '0 4px 20px rgba(132, 204, 22, 0.5)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lime-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    {loading ? 'Processing...' : 'Create Record'}
                  </span>
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