"use client"

import { useState, useEffect } from "react"
import { FaUser, FaMapMarkerAlt, FaPhone, FaInfoCircle, FaSeedling } from "react-icons/fa"
import { useClaimFormStore } from "../../store/claimFormStore"
import { useAuthStore } from "../../store/authStore"
import { MapPin } from "lucide-react"
import { fetchCropInsurance } from "../../api"

const FormStep1 = () => {
  const { formData, updateForm, setFieldTouched } = useClaimFormStore()
  const user = useAuthStore((state) => state.user)
  const [insuredCrops, setInsuredCrops] = useState([])
  const [cropLimits, setCropLimits] = useState({})
  const [cropWarnings, setCropWarnings] = useState({})

  // Auto-fill form data from user info when component mounts
  useEffect(() => {
    if (user) {
      updateForm("name", user.name || "")
      // Use address from user object (from farmer registration)
      updateForm("address", user.address || "")
      updateForm("phone", user.phone || "")
      updateForm("crop", user.cropType || "")
      updateForm("areaInsured", user.cropArea || "")
      
      // Auto-check RSBA program if farmer is RSBSA registered
      if (user.rsbsaRegistered) {
        const currentPrograms = formData.program || []
        if (!currentPrograms.includes("RSBA")) {
          updateForm("program", [...currentPrograms, "RSBA"])
        }
      }
    }
  }, [user, formData.program, updateForm])

  useEffect(() => {
    async function loadInsuredCrops() {
      if (!user?._id) return;
      const insuranceRecords = await fetchCropInsurance(user._id)
      // Only include crops still within their insurance day limit
      const now = new Date()
      const crops = []
      const limits = {}
      const warnings = {}
      insuranceRecords.forEach(record => {
        // Only show crops that are insured (isInsured: true)
        if (!record.isInsured) {
          return // Skip uninsured crops
        }
        
        const cropType = record.cropType
        const plantingDate = new Date(record.plantingDate)
        const dayLimit = parseInt(record.insuranceDayLimit)
        const daysSincePlanting = Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24))
        const daysLeft = dayLimit - daysSincePlanting
        if (daysLeft >= 0) {
          crops.push(cropType)
          limits[cropType] = daysLeft
          if (daysLeft <= 5) {
            warnings[cropType] = daysLeft === 0
              ? `Claim period for ${cropType} is over!`
              : `Only ${daysLeft} day(s) left to file a claim for ${cropType}!`
          }
        } else {
          warnings[cropType] = `Claim period for ${cropType} is over!`
        }
      })
      setInsuredCrops(crops)
      setCropLimits(limits)
      setCropWarnings(warnings)
    }
    loadInsuredCrops()
  }, [user])

  const handleChange = (field, value) => {
    updateForm(field, value)
  }




  return (
    <section className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <FaSeedling className="text-green-500" /> I. Basic Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="relative">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="farmer-name">
            Name of Farmer-Assured <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="farmer-name"
              placeholder="Juan Dela Cruz"
              className={`pl-12 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
                formData.errors?.name && formData.touched?.name ? "border-red-500" : ""
              }`}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => setFieldTouched("name")}
              required
            />
            <FaInfoCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {formData.errors?.name && formData.touched?.name && (
            <p className="text-red-500 text-sm mt-1">{formData.errors.name}</p>
          )}
        </div>
        <div className="relative">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="address">
            Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="address"
              placeholder="123 Rizal St, Sampaloc, Manila"
              className={`pl-12 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
                formData.errors?.address && formData.touched?.address ? "border-red-500" : ""
              }`}
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              onBlur={() => setFieldTouched("address")}
              required
            />
          </div>
          {formData.errors?.address && formData.touched?.address && (
            <p className="text-red-500 text-sm mt-1">{formData.errors.address}</p>
          )}
        </div>
        <div className="relative">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="phone">
            Cellphone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="phone"
              placeholder="09123456789"
              className={`pl-12 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
                formData.errors?.phone && formData.touched?.phone ? "border-red-500" : ""
              }`}
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              onBlur={() => setFieldTouched("phone")}
              required
            />
          </div>
          {formData.errors?.phone && formData.touched?.phone && (
            <p className="text-red-500 text-sm mt-1">{formData.errors.phone}</p>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="crop-type">
            Insured Crops <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <select
              id="crop-type"
              className={`border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
                formData.errors?.crop && formData.touched?.crop ? "border-red-500" : ""
              }`}
              value={formData.crop}
              onChange={(e) => handleChange("crop", e.target.value)}
              onBlur={() => setFieldTouched("crop")}
              required
            >
              <option value="" disabled>
                {insuredCrops.length === 0 ? "No insured crops available" : "Select a crop"}
              </option>
              {insuredCrops.map(crop => (
                <option key={crop} value={crop}>{crop} {cropLimits[crop] !== undefined ? `(Days left: ${cropLimits[crop]})` : ""}</option>
              ))}
            </select>
            {formData.crop && cropWarnings[formData.crop] && (
              <span className={`text-sm ${cropWarnings[formData.crop].includes('over') ? 'text-red-500' : 'text-yellow-600'}`}>{cropWarnings[formData.crop]}</span>
            )}
          </div>
          {formData.errors?.crop && formData.touched?.crop && (
            <p className="text-red-500 text-sm mt-1">{formData.errors.crop}</p>
          )}
        </div>

        <div className="relative">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="area-insured">
            Area Insured (hectares) <span className="text-red-500">*</span>
          </label>
          <input
            id="area-insured"
            placeholder="5.0"
            className={`pl-4 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
              formData.errors?.areaInsured && formData.touched?.areaInsured ? "border-red-500" : ""
            }`}
            value={formData.areaInsured}
            onChange={(e) => handleChange("areaInsured", e.target.value)}
            onBlur={() => setFieldTouched("areaInsured")}
            required
          />
          {formData.errors?.areaInsured && formData.touched?.areaInsured && (
            <p className="text-red-500 text-sm mt-1">{formData.errors.areaInsured}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Program <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["Regular", "Sikat Saka", "RSBA", "APCP-CAP-PBD", "PUNA", "Cooperative Rice Farming"].map((label) => (
              <label key={label} className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-green-600"
                  checked={formData.program.includes(label)}
                  onChange={(e) => {
                    const isChecked = e.target.checked
                    const updatedPrograms = isChecked
                      ? [...formData.program, label]
                      : formData.program.filter((item) => item !== label)
                    handleChange("program", updatedPrograms)
                  }}
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>
          {formData.errors?.program && <p className="text-red-500 text-sm mt-1">{formData.errors.program}</p>}
        </div>

      </div>
    </section>
  )
}

export default FormStep1
