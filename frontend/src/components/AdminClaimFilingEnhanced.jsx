"use client"

import { useState, useEffect } from "react"
import { X, User, FileText, MapPin, Calendar, AlertTriangle, CheckCircle, Upload, Search, ChevronDown, ArrowLeft, ArrowRight, Camera, Trash2, Plus } from "lucide-react"
import { createClaim } from '../api'
import { useFarmers } from '../hooks/useAPI'

const AdminClaimFilingEnhanced = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    farmerId: '',
    name: '',
    address: '',
    phone: '',
    farmerLocation: '',
    crop: '',
    otherCropText: '',
    areaInsured: '',
    varietyPlanted: '',
    plantingDate: '',
    cicNumber: '',
    underwriter: '',
    program: [],
    otherProgramText: '',
    sketchFile: null,
    documents: [],
    damageType: '',
    lossDate: '',
    ageStage: '',
    areaDamaged: '',
    degreeOfDamage: '',
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
  const [touched, setTouched] = useState({})
  const [lots, setLots] = useState([1])

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
        otherCropText: '',
        areaInsured: '',
        varietyPlanted: '',
        plantingDate: '',
        cicNumber: '',
        underwriter: '',
        program: [],
        otherProgramText: '',
        sketchFile: null,
        documents: [],
        damageType: '',
        lossDate: '',
        ageStage: '',
        areaDamaged: '',
        degreeOfDamage: '',
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
      setTouched({})
      setStep(1)
      setLots([1])
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleFileUpload = (field, files) => {
    if (field === 'sketchFile') {
      setFormData(prev => ({
        ...prev,
        sketchFile: files[0] || null
      }))
    } else if (field === 'documents') {
      const currentDocs = formData.documents || []
      setFormData(prev => ({
        ...prev,
        documents: [...currentDocs, ...files]
      }))
    } else if (field === 'damagePhotos') {
      const currentPhotos = formData.damagePhotos || []
      setFormData(prev => ({
        ...prev,
        damagePhotos: [...currentPhotos, ...files]
      }))
    }
  }

  const removeFile = (field, index) => {
    if (field === 'documents') {
      const updatedDocs = [...formData.documents]
      updatedDocs.splice(index, 1)
      setFormData(prev => ({
        ...prev,
        documents: updatedDocs
      }))
    } else if (field === 'damagePhotos') {
      const updatedPhotos = [...formData.damagePhotos]
      updatedPhotos.splice(index, 1)
      setFormData(prev => ({
        ...prev,
        damagePhotos: updatedPhotos
      }))
    } else if (field === 'sketchFile') {
      setFormData(prev => ({
        ...prev,
        sketchFile: null
      }))
    }
  }

  const handleLotBoundaryChange = (lot, direction, value) => {
    setFormData(prev => ({
      ...prev,
      lotBoundaries: {
        ...prev.lotBoundaries,
        [lot]: {
          ...prev.lotBoundaries[lot],
          [direction]: value
        }
      }
    }))
  }

  const addLot = () => {
    const newLotNumber = Math.max(...lots) + 1
    setLots([...lots, newLotNumber])
  }

  const removeLot = (lotToRemove) => {
    if (lots.length > 1) {
      setLots(lots.filter(lot => lot !== lotToRemove))
    }
  }

  const setFieldTouched = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }

  const validateStep = (stepNumber) => {
    const newErrors = {}
    
    if (stepNumber === 1) {
      if (!formData.farmerId) newErrors.farmerId = 'Please select a farmer'
      if (!formData.name) newErrors.name = 'Farmer name is required'
      if (!formData.crop) newErrors.crop = 'Crop type is required'
      if (!formData.areaInsured) newErrors.areaInsured = 'Area insured is required'
    } else if (stepNumber === 2) {
      if (!formData.damageType) newErrors.damageType = 'Damage type is required'
      if (!formData.areaDamaged) newErrors.areaDamaged = 'Area damaged is required'
      if (!formData.lossDate) newErrors.lossDate = 'Loss date is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) {
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

  const progressPercentage = (step / 3) * 100

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
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

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="w-full bg-gray-300 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-around items-center">
            {[1, 2, 3].map((navStep) => (
              <button
                key={navStep}
                onClick={() => setStep(navStep)}
                className={`px-6 py-2 rounded-full shadow-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 ${
                  step === navStep
                    ? "bg-blue-700 text-white transform scale-105"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
              >
                Step {navStep}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Step 1: Farmer Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="text-blue-500" /> I. Farmer Information
              </h3>

              {/* Farmer Selection */}
              <div>
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

              {/* Farmer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farmer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={() => setFieldTouched('name')}
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Location (Lat, Lng)
                  </label>
                  <input
                    type="text"
                    value={formData.farmerLocation}
                    onChange={(e) => handleInputChange('farmerLocation', e.target.value)}
                    placeholder="e.g., 7.1907, 125.4551"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Crop Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Crop Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Crop Type *
                    </label>
                    <select
                      value={formData.crop}
                      onChange={(e) => handleInputChange('crop', e.target.value)}
                      onBlur={() => setFieldTouched('crop')}
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
                      Area Insured (hectares) *
                    </label>
                    <input
                      type="number"
                      value={formData.areaInsured}
                      onChange={(e) => handleInputChange('areaInsured', e.target.value)}
                      onBlur={() => setFieldTouched('areaInsured')}
                      step="0.01"
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {errors.areaInsured && (
                      <p className="mt-1 text-sm text-red-600">{errors.areaInsured}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variety Planted
                    </label>
                    <input
                      type="text"
                      value={formData.varietyPlanted}
                      onChange={(e) => handleInputChange('varietyPlanted', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planting Date
                    </label>
                    <input
                      type="date"
                      value={formData.plantingDate}
                      onChange={(e) => handleInputChange('plantingDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Insurance Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CIC Number
                    </label>
                    <input
                      type="text"
                      value={formData.cicNumber}
                      onChange={(e) => handleInputChange('cicNumber', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Underwriter
                    </label>
                    <input
                      type="text"
                      value={formData.underwriter}
                      onChange={(e) => handleInputChange('underwriter', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Programs
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['PCIC', 'RSBSA', 'Crop Insurance', 'Other'].map((program) => (
                      <label key={program} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.program.includes(program)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('program', [...formData.program, program])
                            } else {
                              handleInputChange('program', formData.program.filter(p => p !== program))
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{program}</span>
                      </label>
                    ))}
                  </div>
                  {formData.program.includes('Other') && (
                    <input
                      type="text"
                      value={formData.otherProgramText}
                      onChange={(e) => handleInputChange('otherProgramText', e.target.value)}
                      placeholder="Specify other program"
                      className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Supporting Documents</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Sketch/Map
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('sketchFile', e.target.files)}
                      className="hidden"
                      id="sketch-upload"
                    />
                    <label
                      htmlFor="sketch-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.sketchFile ? formData.sketchFile.name : 'Click to upload farm sketch/map'}
                      </span>
                    </label>
                    {formData.sketchFile && (
                      <button
                        type="button"
                        onClick={() => removeFile('sketchFile')}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove file
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => handleFileUpload('documents', Array.from(e.target.files))}
                      className="hidden"
                      id="documents-upload"
                    />
                    <label
                      htmlFor="documents-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Click to upload additional documents</span>
                    </label>
                    {formData.documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700">{doc.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('documents', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Damage Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" /> II. Damage Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Damage Type *
                  </label>
                  <select
                    value={formData.damageType}
                    onChange={(e) => handleInputChange('damageType', e.target.value)}
                    onBlur={() => setFieldTouched('damageType')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select damage type</option>
                    <option value="Typhoon">Typhoon</option>
                    <option value="Drought">Drought</option>
                    <option value="Flood">Flood</option>
                    <option value="Pest Attack">Pest Attack</option>
                    <option value="Disease">Disease</option>
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
                    value={formData.lossDate}
                    onChange={(e) => handleInputChange('lossDate', e.target.value)}
                    onBlur={() => setFieldTouched('lossDate')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.lossDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.lossDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area Damaged (hectares) *
                  </label>
                  <input
                    type="number"
                    value={formData.areaDamaged}
                    onChange={(e) => handleInputChange('areaDamaged', e.target.value)}
                    onBlur={() => setFieldTouched('areaDamaged')}
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
                    value={formData.degreeOfDamage}
                    onChange={(e) => handleInputChange('degreeOfDamage', e.target.value)}
                    min="0"
                    max="100"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Stage
                  </label>
                  <select
                    value={formData.ageStage}
                    onChange={(e) => handleInputChange('ageStage', e.target.value)}
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
                    value={formData.expectedHarvest}
                    onChange={(e) => handleInputChange('expectedHarvest', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Damage Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Damage Photos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload('damagePhotos', Array.from(e.target.files))}
                    className="hidden"
                    id="damage-photos-upload"
                  />
                  <label
                    htmlFor="damage-photos-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Camera className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload damage photos</span>
                  </label>
                  {formData.damagePhotos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.damagePhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Damage photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('damagePhotos', index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Lot Boundaries */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="text-blue-500" /> III. Location Sketch / Plan of Damaged Crops (LSP)
              </h3>

              <div className="space-y-6">
                {lots.map((lot) => (
                  <div
                    key={lot}
                    className="bg-blue-50 p-6 rounded-lg border border-blue-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                        <div className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">
                          {lot}
                        </div>
                        Lot {lot} Details
                      </h4>
                      {lots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLot(lot)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Remove lot"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          North
                        </label>
                        <input
                          type="text"
                          value={formData.lotBoundaries[lot].north}
                          onChange={(e) => handleLotBoundaryChange(lot, 'north', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          South
                        </label>
                        <input
                          type="text"
                          value={formData.lotBoundaries[lot].south}
                          onChange={(e) => handleLotBoundaryChange(lot, 'south', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          East
                        </label>
                        <input
                          type="text"
                          value={formData.lotBoundaries[lot].east}
                          onChange={(e) => handleLotBoundaryChange(lot, 'east', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          West
                        </label>
                        <input
                          type="text"
                          value={formData.lotBoundaries[lot].west}
                          onChange={(e) => handleLotBoundaryChange(lot, 'west', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLot}
                  className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Another Lot</span>
                </button>
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
        </div>

        {/* Footer with Navigation */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex space-x-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminClaimFilingEnhanced
