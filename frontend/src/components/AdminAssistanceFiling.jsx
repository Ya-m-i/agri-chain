"use client"

import { useState, useEffect } from "react"
import { X, User, HandHeart, Search, AlertTriangle, CheckCircle } from "lucide-react"
import { applyForAssistance, fetchCropInsurance } from '../api'
import { useFarmers, useAssistances, useFarmerApplications } from '../hooks/useAPI'

const AdminAssistanceFiling = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    farmerId: '',
    assistanceId: '',
    requestedQuantity: '',
    farmerData: null
  })

  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [selectedAssistance, setSelectedAssistance] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFarmerSearch, setShowFarmerSearch] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [farmerCropData, setFarmerCropData] = useState(null)
  const [eligibilityResults, setEligibilityResults] = useState({})

  // Get farmers and assistance data
  const { data: farmers = [], isLoading: farmersLoading } = useFarmers()
  const { data: assistanceItems = [], isLoading: assistanceLoading } = useAssistances()
  const { data: farmerApplications = [] } = useFarmerApplications(selectedFarmer?._id)

  // Filter farmers based on search term
  const filteredFarmers = farmers.filter(farmer => {
    const fullName = `${farmer.firstName} ${farmer.middleName || ''} ${farmer.lastName}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) || 
           farmer.username.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        farmerId: '',
        assistanceId: '',
        requestedQuantity: '',
        farmerData: null
      })
      setSelectedFarmer(null)
      setSelectedAssistance(null)
      setSearchTerm('')
      setShowFarmerSearch(false)
      setErrors({})
    }
  }, [isOpen])

  const handleFarmerSelect = async (farmer) => {
    setSelectedFarmer(farmer)
    setFormData(prev => ({
      ...prev,
      farmerId: farmer._id,
      farmerData: farmer,
      // Include crop type in form data
      farmerCropType: farmer.cropType || 'Unknown'
    }))
    setShowFarmerSearch(false)
    setSearchTerm('')
    
    // Load farmer's crop insurance data
    try {
      const insuranceRecords = await fetchCropInsurance(farmer._id)
      const now = new Date()
      const crops = []
      const activeCrops = []
      
      insuranceRecords.forEach(record => {
        const cropType = record.cropType
        const plantingDate = new Date(record.plantingDate)
        const dayLimit = parseInt(record.insuranceDayLimit)
        const daysSincePlanting = Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24))
        const daysLeft = dayLimit - daysSincePlanting
        
        // Add all crops (both active and inactive)
        crops.push(cropType)
        
        // Add only active crops (within insurance period)
        if (daysLeft >= 0) {
          activeCrops.push(cropType)
        }
      })
      
      // Create comprehensive farmer data
      const farmerData = {
        ...farmer,
        // All crops from insurance records
        allCropTypes: [...new Set(crops)], // Remove duplicates
        // Only active crops (within insurance period)
        insuredCropTypes: [...new Set(activeCrops)],
        // Primary crop type (from farmer registration or first active crop)
        cropType: farmer.cropType || (activeCrops.length > 0 ? activeCrops[0] : crops[0])
      }
      
      setFarmerCropData(farmerData)
      
      // Update form data with the determined crop type
      setFormData(prev => ({
        ...prev,
        farmerCropType: farmerData.cropType
      }))
      
      console.log('Farmer crop data loaded:', farmerData)
    } catch (error) {
      console.error('Error loading crop insurance data:', error)
      // Fallback to basic farmer data
      const fallbackData = {
        ...farmer,
        allCropTypes: farmer.cropType ? [farmer.cropType] : [],
        insuredCropTypes: farmer.cropType ? [farmer.cropType] : [],
        cropType: farmer.cropType || 'Unknown'
      }
      
      setFarmerCropData(fallbackData)
      
      // Update form data with fallback crop type
      setFormData(prev => ({
        ...prev,
        farmerCropType: fallbackData.cropType
      }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const checkEligibility = (farmer, assistance) => {
    if (!farmer || !assistance) return { eligible: false, reasons: {} }
    
    const now = new Date()
    const currentQuarter = `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`
    
    // Check if already applied this quarter
    const alreadyApplied = farmerApplications.some(app => 
      app.farmerId === farmer._id && 
      app.assistanceId === assistance._id && 
      app.quarter === currentQuarter &&
      ['pending', 'approved', 'distributed'].includes(app.status)
    )

    // Check crop type match (supports multiple crop sources)
    const farmerCrops = []
    
    // Add crops from insurance records (active crops)
    if (farmer.insuredCropTypes && Array.isArray(farmer.insuredCropTypes)) {
      farmerCrops.push(...farmer.insuredCropTypes.map(c => String(c).toLowerCase()))
    }
    
    // Add crops from all insurance records
    if (farmer.allCropTypes && Array.isArray(farmer.allCropTypes)) {
      farmerCrops.push(...farmer.allCropTypes.map(c => String(c).toLowerCase()))
    }
    
    // Add crop from farmer registration
    if (farmer.cropType) {
      farmerCrops.push(String(farmer.cropType).toLowerCase())
    }
    
    // Remove duplicates
    const uniqueCrops = [...new Set(farmerCrops)]
    
    const cropTypeMatch = Boolean(
      assistance.cropType && uniqueCrops.length > 0 &&
      uniqueCrops.includes(String(assistance.cropType).toLowerCase())
    )

    // Check RSBSA registration
    const rsbsaEligible = !assistance.requiresRSBSA || farmer.rsbsaRegistered

    // Check certification (for cash assistance)
    const certificationEligible = !assistance.requiresCertification || farmer.isCertified

    // Check stock availability
    const stockAvailable = assistance.availableQuantity > 0

    return {
      eligible: !alreadyApplied && cropTypeMatch && rsbsaEligible && certificationEligible && stockAvailable,
      alreadyApplied,
      cropTypeMatch,
      rsbsaEligible,
      certificationEligible,
      stockAvailable,
      reasons: {
        alreadyApplied: alreadyApplied ? 'Already applied this quarter' : null,
        cropTypeMismatch: !cropTypeMatch ? `Only for ${assistance.cropType} farmers` : null,
        rsbsaRequired: !rsbsaEligible ? 'RSBSA registration required' : null,
        certificationRequired: !certificationEligible ? 'Certification required' : null,
        outOfStock: !stockAvailable ? 'Out of stock' : null
      }
    }
  }

  const handleAssistanceSelect = (assistance) => {
    setSelectedAssistance(assistance)
    setFormData(prev => ({
      ...prev,
      assistanceId: assistance._id
    }))
    
    // Check eligibility
    if (farmerCropData) {
      const eligibility = checkEligibility(farmerCropData, assistance)
      setEligibilityResults(eligibility)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.farmerId) newErrors.farmerId = 'Please select a farmer'
    if (!formData.assistanceId) newErrors.assistanceId = 'Please select an assistance program'
    if (!formData.requestedQuantity || formData.requestedQuantity <= 0) {
      newErrors.requestedQuantity = 'Please enter a valid quantity'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('Admin filing assistance application for farmer:', formData)
      console.log('Farmer crop data:', farmerCropData)
      
      // Add filedBy field and ensure crop type is included
      const assistanceData = {
        ...formData,
        filedBy: 'admin',
        // Ensure crop type is included from farmer data
        farmerCropType: farmerCropData?.cropType || selectedFarmer?.cropType || 'Unknown'
      }
      
      console.log('Assistance data being sent:', assistanceData)
      
      const result = await applyForAssistance(assistanceData)
      
      if (result.message) {
        console.log('Assistance application filed successfully:', result)
        onSuccess?.(result)
        onClose()
      } else {
        throw new Error(result.message || 'Failed to file assistance application')
      }
    } catch (error) {
      console.error('Error filing assistance application:', error)
      setErrors({ submit: error.message || 'Failed to file assistance application. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <HandHeart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">File Assistance Application for Farmer</h2>
              <p className="text-sm text-gray-500">Submit government assistance application on behalf of a farmer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Farmer Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Farmer *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFarmerSearch(!showFarmerSearch)}
                className="w-full p-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className={selectedFarmer ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedFarmer 
                      ? `${selectedFarmer.firstName} ${selectedFarmer.middleName || ''} ${selectedFarmer.lastName}`.trim()
                      : 'Search and select a farmer...'
                    }
                  </span>
                </div>
                <Search className="h-5 w-5 text-gray-400" />
              </button>
              
              {showFarmerSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search farmers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {farmersLoading ? (
                      <div className="p-4 text-center text-gray-500">Loading farmers...</div>
                    ) : filteredFarmers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No farmers found</div>
                    ) : (
                      filteredFarmers.map((farmer) => (
                        <button
                          key={farmer._id}
                          type="button"
                          onClick={() => handleFarmerSelect(farmer)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {farmer.firstName} {farmer.middleName || ''} {farmer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Username: {farmer.username} | 
                            Crop: {farmer.cropType || 'Not specified'} | 
                            RSBSA: {farmer.rsbsaRegistered ? 'Yes' : 'No'} | 
                            Certified: {farmer.isCertified ? 'Yes' : 'No'}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.farmerId && (
              <p className="mt-1 text-sm text-red-600">{errors.farmerId}</p>
            )}
          </div>

          {/* Assistance Program Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Assistance Program *
            </label>
            <div className="space-y-3">
              {assistanceLoading ? (
                <div className="p-4 text-center text-gray-500">Loading assistance programs...</div>
              ) : assistanceItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No assistance programs available</div>
              ) : (
                assistanceItems.map((assistance) => (
                  <div
                    key={assistance._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAssistance?._id === assistance._id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAssistanceSelect(assistance)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{assistance.assistanceType}</h3>
                        <p className="text-sm text-gray-600 mt-1">{assistance.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Crop: {assistance.cropType}</span>
                          <span>Available: {assistance.availableQuantity}</span>
                          <span>Unit: {assistance.unit}</span>
                          {assistance.requiresRSBSA && (
                            <span className="text-orange-600 font-medium">Requires RSBSA</span>
                          )}
                          {assistance.requiresCertification && (
                            <span className="text-blue-600 font-medium">Requires Certification</span>
                          )}
                        </div>
                      </div>
                      {selectedAssistance?._id === assistance._id && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {errors.assistanceId && (
              <p className="mt-1 text-sm text-red-600">{errors.assistanceId}</p>
            )}
          </div>

          {/* Requested Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requested Quantity *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                name="requestedQuantity"
                value={formData.requestedQuantity}
                onChange={handleInputChange}
                min="1"
                max={selectedAssistance?.availableQuantity || 999999}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter quantity"
                required
              />
              <span className="text-sm text-gray-500">
                {selectedAssistance?.unit || 'units'}
              </span>
            </div>
            {selectedAssistance && (
              <p className="mt-1 text-sm text-gray-500">
                Available: {selectedAssistance.availableQuantity} {selectedAssistance.unit}
              </p>
            )}
            {errors.requestedQuantity && (
              <p className="mt-1 text-sm text-red-600">{errors.requestedQuantity}</p>
            )}
          </div>

          {/* Farmer Eligibility Check */}
          {selectedFarmer && selectedAssistance && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Eligibility Check</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  {selectedFarmer.rsbsaRegistered ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={selectedFarmer.rsbsaRegistered ? 'text-green-700' : 'text-red-700'}>
                    RSBSA Registration: {selectedFarmer.rsbsaRegistered ? 'Registered' : 'Not Registered'}
                    {selectedAssistance.requiresRSBSA && !selectedFarmer.rsbsaRegistered && (
                      <span className="ml-1 font-medium">(Required for this assistance)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedFarmer.isCertified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={selectedFarmer.isCertified ? 'text-green-700' : 'text-red-700'}>
                    Certification: {selectedFarmer.isCertified ? 'Certified' : 'Not Certified'}
                    {selectedAssistance.requiresCertification && !selectedFarmer.isCertified && (
                      <span className="ml-1 font-medium">(Required for this assistance)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {eligibilityResults.cropTypeMatch ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={eligibilityResults.cropTypeMatch ? 'text-green-700' : 'text-red-700'}>
                    Crop Type Match: {farmerCropData?.insuredCropTypes?.join(', ') || selectedFarmer.cropType || 'None'} vs {selectedAssistance.cropType}
                  </span>
                </div>
                
                {/* Additional crop information */}
                {farmerCropData && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Farmer's Crop Information</h4>
                    <div className="space-y-1 text-xs text-blue-700">
                      <p><strong>Registration Crop:</strong> {selectedFarmer.cropType || 'Not specified'}</p>
                      <p><strong>Active Insured Crops:</strong> {farmerCropData.insuredCropTypes?.length > 0 ? farmerCropData.insuredCropTypes.join(', ') : 'None'}</p>
                      <p><strong>All Insurance Crops:</strong> {farmerCropData.allCropTypes?.length > 0 ? farmerCropData.allCropTypes.join(', ') : 'None'}</p>
                      <p><strong>Required for Assistance:</strong> {selectedAssistance.cropType}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  {parseInt(formData.requestedQuantity) <= selectedAssistance.availableQuantity ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={parseInt(formData.requestedQuantity) <= selectedAssistance.availableQuantity ? 'text-green-700' : 'text-red-700'}>
                    Stock Available: {selectedAssistance.availableQuantity} {selectedAssistance.unit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Filing Application...</span>
                </>
              ) : (
                <>
                  <HandHeart className="h-4 w-4" />
                  <span>File Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminAssistanceFiling
