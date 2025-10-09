import { useState } from 'react'
import { X, Plus, Edit, Trash2, Save, TrendingUp, DollarSign, Upload, Image as ImageIcon } from 'lucide-react'
import { useCropPrices, useCreateCropPrice, useUpdateCropPrice, useDeleteCropPrice } from '../hooks/useAPI'
import { useNotificationStore } from '../store/notificationStore'

const CropPriceManagement = ({ isOpen, onClose }) => {
  const { data: cropPrices = [], isLoading } = useCropPrices()
  const createCropPriceMutation = useCreateCropPrice()
  const updateCropPriceMutation = useUpdateCropPrice()
  const deleteCropPriceMutation = useDeleteCropPrice()

  const [showForm, setShowForm] = useState(false)
  const [editingCrop, setEditingCrop] = useState(null)
  const [formData, setFormData] = useState({
    cropName: '',
    cropType: '',
    pricePerKg: '',
    unit: 'kg',
    region: 'Philippines Average',
    notes: '',
    image: ''
  })

  // Common crop types for different crops
  const cropTypes = {
    'Rice': ['Well-Milled', 'Regular-Milled', 'Brown Rice'],
    'Corn': ['Yellow Corn', 'White Corn', 'Sweet Corn'],
    'Banana': ['Lakatan', 'Latundan', 'Saba', 'Cavendish'],
    'Coconut': ['Fresh', 'Dried (Copra)', 'Coconut Oil'],
    'Coffee': ['Arabica', 'Robusta', 'Liberica', 'Excelsa'],
    'Mango': ['Carabao', 'Indian', 'Pico'],
    'Pineapple': ['Queen', 'Cayenne'],
    'Sugarcane': ['Raw Sugar', 'Refined Sugar', 'Molasses'],
    'Cacao': ['Dried Beans', 'Fermented Beans', 'Cocoa Powder']
  }

  const availableCropTypes = cropTypes[formData.cropName] || []

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Reset cropType when cropName changes
    if (name === 'cropName') {
      setFormData(prev => ({ ...prev, cropType: '' }))
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        useNotificationStore.getState().addAdminNotification({
          id: generateUniqueId(),
          type: 'error',
          title: 'Image Too Large',
          message: 'Please select an image smaller than 2MB',
          timestamp: new Date()
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        useNotificationStore.getState().addAdminNotification({
          id: generateUniqueId(),
          type: 'error',
          title: 'Invalid File Type',
          message: 'Please select an image file',
          timestamp: new Date()
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.cropName || !formData.pricePerKg) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Validation Error',
        message: 'Crop name and price are required',
        timestamp: new Date()
      })
      return
    }

    const cropPriceData = {
      cropName: formData.cropName,
      cropType: formData.cropType || undefined,
      pricePerKg: parseFloat(formData.pricePerKg),
      unit: formData.unit,
      region: formData.region,
      notes: formData.notes || undefined,
      image: formData.image || undefined,
      updatedBy: 'Admin'
    }

    try {
      if (editingCrop) {
        // Update existing crop price
        await updateCropPriceMutation.mutateAsync({
          id: editingCrop._id,
          cropPriceData
        })
        
        useNotificationStore.getState().addAdminNotification({
          id: generateUniqueId(),
          type: 'success',
          title: 'Crop Price Updated',
          message: `${formData.cropName} price has been updated successfully`,
          timestamp: new Date()
        })
      } else {
        // Create new crop price
        await createCropPriceMutation.mutateAsync(cropPriceData)
        
        useNotificationStore.getState().addAdminNotification({
          id: generateUniqueId(),
          type: 'success',
          title: 'Crop Price Added',
          message: `${formData.cropName} has been added to the price list`,
          timestamp: new Date()
        })
      }

      // Reset form
      setFormData({
        cropName: '',
        cropType: '',
        pricePerKg: '',
        unit: 'kg',
        region: 'Philippines Average',
        notes: '',
        image: ''
      })
      setShowForm(false)
      setEditingCrop(null)
    } catch (error) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Operation Failed',
        message: error.message || 'Failed to save crop price',
        timestamp: new Date()
      })
    }
  }

  const handleEdit = (crop) => {
    setEditingCrop(crop)
    setFormData({
      cropName: crop.cropName,
      cropType: crop.cropType || '',
      pricePerKg: crop.pricePerKg.toString(),
      unit: crop.unit || 'kg',
      region: crop.region || 'Philippines Average',
      notes: crop.notes || '',
      image: crop.image || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (cropId, cropName) => {
    if (!window.confirm(`Are you sure you want to delete ${cropName}?`)) {
      return
    }

    try {
      await deleteCropPriceMutation.mutateAsync(cropId)
      
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: 'Crop Price Deleted',
        message: `${cropName} has been removed from the price list`,
        timestamp: new Date()
      })
    } catch (error) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete crop price',
        timestamp: new Date()
      })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCrop(null)
    setFormData({
      cropName: '',
      cropType: '',
      pricePerKg: '',
      unit: 'kg',
      region: 'Philippines Average',
      notes: '',
      image: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-lime-600 to-lime-700 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Crop Price Management</h2>
              <p className="text-lime-100 text-sm">Manage market prices for different crops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-lime-800 p-2 rounded-lg transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add New Button */}
          {!showForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition-colors shadow-lg"
              >
                <Plus size={20} />
                <span className="font-semibold">Add New Crop Price</span>
              </button>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border-2 border-lime-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <DollarSign className="text-lime-600" size={24} />
                {editingCrop ? 'Edit Crop Price' : 'Add New Crop Price'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Crop Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="cropName"
                    value={formData.cropName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    required
                  >
                    <option value="">Select crop</option>
                    {Object.keys(cropTypes).map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Crop Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Type / Variety
                  </label>
                  {availableCropTypes.length > 0 ? (
                    <select
                      name="cropType"
                      value={formData.cropType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    >
                      <option value="">Select type (optional)</option>
                      {availableCropTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="cropType"
                      value={formData.cropType}
                      onChange={handleInputChange}
                      placeholder="Enter crop type (optional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="pricePerKg"
                      value={formData.pricePerKg}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                      required
                    />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    >
                      <option value="kg">per kg</option>
                      <option value="piece">per pc</option>
                      <option value="bundle">per bundle</option>
                      <option value="sack">per sack</option>
                    </select>
                  </div>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="e.g., Philippines Average, Davao Region"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Image
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {formData.image ? (
                              <ImageIcon className="w-10 h-10 mb-2 text-lime-600" />
                            ) : (
                              <Upload className="w-10 h-10 mb-2 text-gray-400" />
                            )}
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                    {formData.image && (
                      <div className="flex-shrink-0">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-lime-200">
                          <img
                            src={formData.image}
                            alt="Crop preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional information..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>

                {/* Buttons */}
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCropPriceMutation.isLoading || updateCropPriceMutation.isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors disabled:opacity-50"
                  >
                    <Save size={18} />
                    {editingCrop ? 'Update' : 'Add'} Crop Price
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Crop Prices List */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Current Crop Prices</h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading crop prices...</div>
            ) : cropPrices.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No crop prices added yet</p>
                <p className="text-gray-400 text-sm mt-2">Click "Add New Crop Price" to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cropPrices.map((crop) => (
                  <div
                    key={crop._id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {crop.image && (
                      <div className="h-32 w-full bg-gray-100 overflow-hidden">
                        <img
                          src={crop.image}
                          alt={crop.cropName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{crop.cropName}</h4>
                          {crop.cropType && (
                            <p className="text-sm text-gray-600">{crop.cropType}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(crop)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(crop._id, crop.cropName)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-lime-600">₱{crop.pricePerKg}</span>
                          <span className="text-gray-500 text-sm">/ {crop.unit}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <p>Region: {crop.region}</p>
                          <p>Updated: {new Date(crop.lastUpdated).toLocaleDateString()}</p>
                        </div>
                        
                        {crop.notes && (
                          <p className="text-xs text-gray-600 italic mt-2 border-t pt-2">
                            {crop.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CropPriceManagement

