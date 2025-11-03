"use client"

import { useEffect } from "react"
import { FaCloudSun, FaCalendarAlt, FaChartBar, FaPercentage, FaCamera, FaTrash } from "react-icons/fa"
import { useClaimFormStore } from "../../store/claimFormStore"

const FormStep2 = () => {
  const { formData, updateForm, setFieldTouched, addDamagePhoto, removeDamagePhoto } = useClaimFormStore()

  // Set default values when component mounts
  useEffect(() => {
    updateForm("areaDamaged", formData.areaInsured || "0")
    updateForm("degreeOfDamage", "50") // Default to 50%
    updateForm("expectedHarvest", "0")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (field, value) => {
    updateForm(field, value)
  }

  const handleDamagePhotoUpload = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length > 0) {
      addDamagePhoto(files)
    }
  }

  const handleRemoveDamagePhoto = (index) => {
    removeDamagePhoto(index)
  }

  return (
    <section className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <FaCloudSun className="text-yellow-500" /> II. Damage Indicators
      </h2>

      <div className="space-y-6">
        {/* Cause of Loss */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Cause of Loss</label>
          <select
            value={formData.damageType}
            onChange={(e) => handleChange("damageType", e.target.value)}
            onBlur={() => setFieldTouched("damageType")}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Select cause of loss</option>
            <option value="Typhoon">Typhoon</option>
            <option value="Drought">Drought</option>
            <option value="Floods">Floods</option>
            <option value="Pest infestations">Pest infestations</option>
            <option value="Disease outbreaks">Disease outbreaks</option>
            <option value="Fire">Fire</option>
            <option value="Theft (for animals)">Theft (for animals)</option>
          </select>
          {formData.errors?.damageType && <p className="text-red-500 text-sm mt-1">{formData.errors.damageType}</p>}
        </div>

        {/* Date of Loss */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Date of Loss</label>
          <input
            type="date"
            value={formData.lossDate}
            onChange={(e) => handleChange("lossDate", e.target.value)}
            onBlur={() => setFieldTouched("lossDate")}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          {formData.errors?.lossDate && <p className="text-red-500 text-sm mt-1">{formData.errors.lossDate}</p>}
        </div>

        {/* Age/Stage of Cultivation */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Age/Stage of Cultivation at Time of Loss</label>
          <select
            value={formData.ageStage}
            onChange={(e) => handleChange("ageStage", e.target.value)}
            onBlur={() => setFieldTouched("ageStage")}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Select growth stage</option>
            <option value="Vegetative Stage">Vegetative Stage</option>
            <option value="Reproductive Stage">Reproductive Stage</option>
            <option value="Ripening/Grain Filling Stage">Ripening/Grain Filling Stage</option>
          </select>
          {formData.errors?.ageStage && <p className="text-red-500 text-sm mt-1">{formData.errors.ageStage}</p>}
        </div>

        {/* Area Damaged */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Area Damaged (hectares)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={formData.areaInsured}
            value={formData.areaDamaged}
            onChange={(e) => handleChange("areaDamaged", e.target.value)}
            onBlur={() => setFieldTouched("areaDamaged")}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter damaged area"
          />
          {formData.errors?.areaDamaged && <p className="text-red-500 text-sm mt-1">{formData.errors.areaDamaged}</p>}
        </div>

        {/* Degree of Damage */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Degree of Damage (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.degreeOfDamage}
            onChange={(e) => handleChange("degreeOfDamage", e.target.value)}
            onBlur={() => setFieldTouched("degreeOfDamage")}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter degree of damage"
          />
          {formData.errors?.degreeOfDamage && (
            <p className="text-red-500 text-sm mt-1">{formData.errors.degreeOfDamage}</p>
          )}
        </div>

        {/* Expected Harvest */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Expected Harvest (tons)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.expectedHarvest}
            onChange={(e) => handleChange("expectedHarvest", e.target.value)}
            onBlur={() => setFieldTouched("expectedHarvest")}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter expected harvest"
          />
          {formData.errors?.expectedHarvest && (
            <p className="text-red-500 text-sm mt-1">{formData.errors.expectedHarvest}</p>
          )}
        </div>

        {/* Damage Evidence Photos */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Damage Evidence Photos <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleDamagePhotoUpload}
              className="hidden"
              id="damage-photos-upload"
            />
            <label htmlFor="damage-photos-upload" className="cursor-pointer">
              <FaCamera className="mx-auto text-4xl text-yellow-500 mb-4" />
              <p className="text-gray-600 mb-2">Click to upload photos of the damage</p>
              <p className="text-sm text-gray-500">Upload multiple photos showing the extent of damage</p>
            </label>
          </div>
          
          {/* Display uploaded photos */}
          {formData.damagePhotos && formData.damagePhotos.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Photos ({formData.damagePhotos.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.damagePhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Damage evidence ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDamagePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {formData.errors?.damagePhotos && (
            <p className="text-red-500 text-sm mt-1">{formData.errors.damagePhotos}</p>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
        <p className="text-yellow-800">
          Please ensure all information provided is accurate. Claims with incorrect information may be delayed or
          rejected. Our team may conduct an on-site assessment to verify the damage reported.
        </p>
      </div>
    </section>
  )
}

export default FormStep2
