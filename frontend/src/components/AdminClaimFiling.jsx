"use client"

import { useState, useEffect } from "react"
import { X, User, FileText, MapPin, Calendar, AlertTriangle, CheckCircle, Upload, Search } from "lucide-react"
import { createClaim } from '../api'
import { useFarmers } from '../hooks/useAPI'

const AdminClaimFiling = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    farmerId: '',
    name: '',
    address: '',
    phone: '',
    farmerLocation: '',
    crop: '',
    areaInsured: '',
    varietyPlanted: '',
    plantingDate: '',
    cicNumber: '',
    underwriter: '',
    program: [],
    otherProgramText: '',
    areaDamaged: '',
    degreeOfDamage: '',
    damageType: '',
    lossDate: '',
    ageStage: '',
    expectedHarvest: '',
    damagePhotos: [],
    lotBoundaries: {
      1: { north: '', south: '', east: '', west: '' },
      2: { north: '', south: '', east: '', west: '' },
      3: { north: '', south: '', east: '', west: '' },
      4: { north: '', south: '', east: '', west: '' }
    }
  })

  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFarmerSearch, setShowFarmerSearch] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Get farmers data
  const { data: farmers = [], isLoading: farmersLoading } = useFarmers()

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
        name: '',
        address: '',
        phone: '',
        farmerLocation: '',
        crop: '',
        areaInsured: '',
        varietyPlanted: '',
        plantingDate: '',
        cicNumber: '',
        underwriter: '',
        program: [],
        otherProgramText: '',
        areaDamaged: '',
        degreeOfDamage: '',
        lossDate: '',
        ageStage: '',
        expectedHarvest: '',
        damagePhotos: [],
        lotBoundaries: {
          1: { north: '', south: '', east: '', west: '' },
          2: { north: '', south: '', east: '', west: '' },
          3: { north: '', south: '', east: '', west: '' },
          4: { north: '', south: '', east: '', west: '' }
        }
      })
      setSelectedFarmer(null)
      setSearchTerm('')
      setShowFarmerSearch(false)
      setErrors({})
    }
  }, [isOpen])

  const handleFarmerSelect = (farmer) => {
    setSelectedFarmer(farmer)
    setFormData(prev => ({
      ...prev,
      farmerId: farmer._id,
      name: `${farmer.firstName} ${farmer.middleName || ''} ${farmer.lastName}`.trim(),
      address: farmer.address || '',
      phone: farmer.contactNum || '',
      farmerLocation: farmer.location ? `${farmer.location.lat}, ${farmer.location.lng}` : '',
      crop: farmer.cropType || ''
    }))
    setShowFarmerSearch(false)
    setSearchTerm('')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      if (name === 'program') {
        setFormData(prev => ({
          ...prev,
          program: checked 
            ? [...prev.program, value]
            : prev.program.filter(p => p !== value)
        }))
      }
    } else if (name.startsWith('lotBoundaries.')) {
      const [, lotNumber, direction] = name.split('.')
      setFormData(prev => ({
        ...prev,
        lotBoundaries: {
          ...prev.lotBoundaries,
          [lotNumber]: {
            ...prev.lotBoundaries[lotNumber],
            [direction]: value
          }
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.farmerId) newErrors.farmerId = 'Please select a farmer'
    if (!formData.name) newErrors.name = 'Farmer name is required'
    if (!formData.crop) newErrors.crop = 'Crop type is required'
    if (!formData.areaDamaged) newErrors.areaDamaged = 'Area damaged is required'
    if (!formData.damageType) newErrors.damageType = 'Damage type is required'
    if (!formData.lossDate) newErrors.lossDate = 'Loss date is required'
    
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
      // Prepare claim data
      const claimData = {
        ...formData,
        areaInsured: parseFloat(formData.areaInsured) || 0,
        areaDamaged: parseFloat(formData.areaDamaged) || 0,
        degreeOfDamage: parseFloat(formData.degreeOfDamage) || 0,
        plantingDate: formData.plantingDate ? new Date(formData.plantingDate) : null,
        lossDate: formData.lossDate ? new Date(formData.lossDate) : null,
        date: new Date(),
        status: 'pending',
        filedBy: 'admin' // Mark as admin-filed
      }

      console.log('Admin filing claim for farmer:', claimData)
      
      const result = await createClaim(claimData)
      
      if (result.success) {
        console.log('Claim filed successfully:', result)
        onSuccess?.(result)
        onClose()
      } else {
        throw new Error(result.message || 'Failed to file claim')
      }
    } catch (error) {
      console.error('Error filing claim:', error)
      setErrors({ submit: error.message || 'Failed to file claim. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">File Claim for Farmer</h2>
              <p className="text-sm text-gray-500">Submit insurance claim on behalf of a farmer</p>
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
                <ChevronDown className="h-5 w-5 text-gray-400" />
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            Username: {farmer.username} | Crop: {farmer.cropType || 'N/A'}
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

          {/* Farmer Information (Auto-filled from selection) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farmer Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm Location (Lat, Lng)
              </label>
              <input
                type="text"
                name="farmerLocation"
                value={formData.farmerLocation}
                onChange={handleInputChange}
                placeholder="e.g., 7.1907, 125.4551"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Crop Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crop Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Type *
                </label>
                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select crop type</option>
                  <option value="Rice">Rice</option>
                  <option value="Corn">Corn</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Other">Other</option>
                </select>
                {errors.crop && (
                  <p className="mt-1 text-sm text-red-600">{errors.crop}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area Insured (hectares)
                </label>
                <input
                  type="number"
                  name="areaInsured"
                  value={formData.areaInsured}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variety Planted
                </label>
                <input
                  type="text"
                  name="varietyPlanted"
                  value={formData.varietyPlanted}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIC Number
                </label>
                <input
                  type="text"
                  name="cicNumber"
                  value={formData.cicNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Underwriter
                </label>
                <input
                  type="text"
                  name="underwriter"
                  value={formData.underwriter}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Programs
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['PCIC', 'RSBSA', 'Crop Insurance', 'Other'].map((program) => (
                  <label key={program} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="program"
                      value={program}
                      checked={formData.program.includes(program)}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{program}</span>
                  </label>
                ))}
              </div>
              {formData.program.includes('Other') && (
                <input
                  type="text"
                  name="otherProgramText"
                  value={formData.otherProgramText}
                  onChange={handleInputChange}
                  placeholder="Specify other program"
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* Damage Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Damage Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area Damaged (hectares) *
                </label>
                <input
                  type="number"
                  name="areaDamaged"
                  value={formData.areaDamaged}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.areaDamaged && (
                  <p className="mt-1 text-sm text-red-600">{errors.areaDamaged}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree of Damage (%)
                </label>
                <input
                  type="number"
                  name="degreeOfDamage"
                  value={formData.degreeOfDamage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Damage Type *
                </label>
                <select
                  name="damageType"
                  value={formData.damageType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select damage type</option>
                  <option value="Flood">Flood</option>
                  <option value="Drought">Drought</option>
                  <option value="Pest">Pest Attack</option>
                  <option value="Disease">Disease</option>
                  <option value="Storm">Storm</option>
                  <option value="Fire">Fire</option>
                  <option value="Other">Other</option>
                </select>
                {errors.damageType && (
                  <p className="mt-1 text-sm text-red-600">{errors.damageType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loss Date *
                </label>
                <input
                  type="date"
                  name="lossDate"
                  value={formData.lossDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.lossDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.lossDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Stage
                </label>
                <select
                  name="ageStage"
                  value={formData.ageStage}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select age stage</option>
                  <option value="Seedling">Seedling</option>
                  <option value="Vegetative">Vegetative</option>
                  <option value="Flowering">Flowering</option>
                  <option value="Fruiting">Fruiting</option>
                  <option value="Mature">Mature</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Harvest
                </label>
                <input
                  type="text"
                  name="expectedHarvest"
                  value={formData.expectedHarvest}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lot Boundaries */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lot Boundaries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((lotNumber) => (
                <div key={lotNumber} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Lot {lotNumber}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name={`lotBoundaries.${lotNumber}.north`}
                      value={formData.lotBoundaries[lotNumber].north}
                      onChange={handleInputChange}
                      placeholder="North"
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name={`lotBoundaries.${lotNumber}.south`}
                      value={formData.lotBoundaries[lotNumber].south}
                      onChange={handleInputChange}
                      placeholder="South"
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name={`lotBoundaries.${lotNumber}.east`}
                      value={formData.lotBoundaries[lotNumber].east}
                      onChange={handleInputChange}
                      placeholder="East"
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name={`lotBoundaries.${lotNumber}.west`}
                      value={formData.lotBoundaries[lotNumber].west}
                      onChange={handleInputChange}
                      placeholder="West"
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Filing Claim...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>File Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminClaimFiling
