"use client"

import { useState, useEffect, useRef } from "react"
import {
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaInfoCircle,
  FaSeedling,
  FaCloudSun,
  FaTractor,
  FaFireAlt,
  FaMap,
  FaCalendarAlt,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

function FarmerForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const formRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    crop: "",
    otherCropText: "",
    damageType: "",
    extent: "",
    cause: "",
    sketchFile: null,
    documents: [],
    program: [],
    otherProgramText: "",
    areaInsured: "",
    dateIssued: "",
    expiry: "",
    cicNumber: "",
    underwriter: "",
    ageStage: "",
    areaDamaged: "",
    degreeOfDamage: "",
    lossDate: "",
    expectedHarvest: "",
  })

  useEffect(() => {
    const savedData = localStorage.getItem("claimFormData")
    if (savedData) {
      try {
        // We can't restore File objects from localStorage, so we need to handle that
        const parsed = JSON.parse(savedData)
        // Only restore primitive data
        const restoredData = {
          ...formData,
          name: parsed.name || "",
          address: parsed.address || "",
          phone: parsed.phone || "",
          crop: parsed.crop || "",
          otherCropText: parsed.otherCropText || "",
          damageType: parsed.damageType || "",
          extent: parsed.extent || "",
          cause: parsed.cause || "",
          program: parsed.program || [],
          otherProgramText: parsed.otherProgramText || "",
          areaInsured: parsed.areaInsured || "",
          dateIssued: parsed.dateIssued || "",
          expiry: parsed.expiry || "",
          cicNumber: parsed.cicNumber || "",
          underwriter: parsed.underwriter || "",
          ageStage: parsed.ageStage || "",
          areaDamaged: parsed.areaDamaged || "",
          degreeOfDamage: parsed.degreeOfDamage || "",
          lossDate: parsed.lossDate || "",
          expectedHarvest: parsed.expectedHarvest || "",
        }
        setFormData(restoredData)
      } catch (error) {
        console.error("Error parsing saved form data:", error)
        localStorage.removeItem("claimFormData")
      }
    }
  }, [])

  useEffect(() => {
    // Save only serializable data
    const dataToSave = {
      ...formData,
      sketchFile: null, // Don't try to serialize File objects
      documents: [],
    }
    localStorage.setItem("claimFormData", JSON.stringify(dataToSave))
  }, [formData])

  const navigateToStep = (targetStep) => setStep(targetStep)
  const progressPercentage = (step / 3) * 100

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSketchUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) handleChange("sketchFile", file)
  }


  const handleClose = () => {
    if (window.confirm("Are you sure you want to exit? Your progress will be saved.")) {
      navigate("/farmer-dashboard")
    }
  }

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.address || !formData.phone || !formData.crop) {
          toast.error("Please fill in all required fields")
          return false
        }
        if (formData.crop === "Other" && !formData.otherCropText) {
          toast.error("Please specify the crop type")
          return false
        }
        return true
      case 2:
        if (
          !formData.damageType ||
          !formData.lossDate ||
          !formData.ageStage ||
          !formData.areaDamaged ||
          !formData.degreeOfDamage
        ) {
          toast.error("Please fill in all required fields")
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      // Scroll to top when changing steps
      window.scrollTo(0, 0)
      if (formRef.current) {
        formRef.current.scrollTop = 0
      }
    }
  }

  const handleSubmit = async () => {
    if (formData.program.length === 0) {
      toast.error("Please select at least one Program.")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success
      toast.success("Claim submitted successfully!")
      localStorage.removeItem("claimFormData")
      navigate("/farmer-dashboard")
    } catch (error) {
      toast.error("Failed to submit claim. Please try again.")
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 via-green-100 to-green-200 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-3xl p-8 relative" ref={formRef}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold focus:outline-none"
          aria-label="Close form"
        >
          ×
        </button>

        <h1 className="text-5xl font-extrabold text-center text-green-800 mb-12 flex items-center justify-center gap-4">
          <FaTractor className="text-green-600" /> Claim for Indemnity
        </h1>

        <div className="w-full bg-gray-300 rounded-full h-4 mb-12">
          <div
            className="bg-green-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={3}
            role="progressbar"
          ></div>
        </div>

        <div className="flex justify-around items-center mb-12">
          {[1, 2, 3].map((navStep) => (
            <button
              key={navStep}
              onClick={() => navigateToStep(navStep)}
              className={`px-6 py-3 rounded-full shadow-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${
                step === navStep ? "bg-green-700 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
              disabled={navStep > step}
              aria-current={step === navStep ? "step" : undefined}
            >
              Step {navStep}
            </button>
          ))}
        </div>

        <div className="animate-fade-in">
          {step === 1 && (
            <section>
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
                      className="pl-12 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                    <FaInfoCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
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
                      className="pl-12 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      required
                    />
                  </div>
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
                      className="pl-12 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="farmer-location">
                    Location of Farmer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="farmer-location"
                      placeholder="Barangay San Isidro, Quezon City"
                      className="pl-12 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="crop-type">
                    Insured Crops <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <select
                      id="crop-type"
                      className="border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={formData.crop}
                      onChange={(e) => handleChange("crop", e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select a crop
                      </option>
                      <option value="Palay">Palay</option>
                      <option value="Corn">Corn</option>
                      <option value="Other">Other</option>
                    </select>
                    {formData.crop === "Other" && (
                      <input
                        type="text"
                        placeholder="Specify crop"
                        className="border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                        value={formData.otherCropText}
                        onChange={(e) => handleChange("otherCropText", e.target.value)}
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Additional fields continue... */}
                <div className="relative">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="area-insured">
                    Area Insured (hectares) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="area-insured"
                    placeholder="5.0"
                    className="pl-4 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={formData.areaInsured}
                    onChange={(e) => handleChange("areaInsured", e.target.value)}
                    required
                  />
                </div>

                {/* More fields... */}

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Program <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["Regular", "Sikat Saka", "RSBA", "APCP-CAP-PBD", "PUNA", "Cooperative Rice Farming"].map(
                      (label) => (
                        <label key={label} className="inline-flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-green-600"
                            checked={formData.program.includes(label)}
                            onChange={(e) => {
                              const isChecked = e.target.checked
                              handleChange(
                                "program",
                                isChecked
                                  ? [...formData.program, label]
                                  : formData.program.filter((item) => item !== label),
                              )
                            }}
                          />
                          <span className="text-gray-700">{label}</span>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                {/* File uploads */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Sketch File</label>
                  <input
                    type="file"
                    className="border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    onChange={handleSketchUpload}
                  />
                  {formData.sketchFile && (
                    <p className="mt-2 text-sm text-green-600">File selected: {formData.sketchFile.name}</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <FaCloudSun className="text-yellow-500" /> II. Damage Indicators
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="cause-of-loss">
                    Cause of Loss <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaFireAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="cause-of-loss"
                      placeholder="Typhoon"
                      className="pl-12 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      value={formData.damageType}
                      onChange={(e) => handleChange("damageType", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="loss-date">
                    Date of Loss Occurrence <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="loss-date"
                      type="date"
                      className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      value={formData.lossDate}
                      onChange={(e) => handleChange("lossDate", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* More damage indicator fields... */}
                <div className="relative">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="age-stage">
                    Age/Stage of Cultivation at Time of Loss <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="age-stage"
                    placeholder="Vegetative Stage"
                    className="pl-4 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={formData.ageStage}
                    onChange={(e) => handleChange("ageStage", e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="area-damaged">
                    Area Damaged (hectares) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="area-damaged"
                    placeholder="3.0"
                    className="pl-4 border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={formData.areaDamaged}
                    onChange={(e) => handleChange("areaDamaged", e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <FaMap className="text-blue-500" /> III. Location Sketch / Plan of Damaged Crops (LSP)
              </h2>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((lot) => (
                  <div key={lot}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Lot {lot} (ha)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {["North", "South", "East", "West"].map((dir) => (
                        <div key={dir}>
                          <label
                            className="block text-gray-700 font-semibold mb-2"
                            htmlFor={`lot-${lot}-${dir.toLowerCase()}`}
                          >
                            {`${dir} Boundary (Lot ${lot})`}
                          </label>
                          <input
                            id={`lot-${lot}-${dir.toLowerCase()}`}
                            placeholder={
                              dir === "North"
                                ? "River"
                                : dir === "South"
                                  ? "Road"
                                  : dir === "East"
                                    ? "Neighbor's Farm"
                                    : "Forest"
                            }
                            className="border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={formData[`lot${lot}_${dir.toLowerCase()}`] || ""}
                            onChange={(e) => handleChange(`lot${lot}_${dir.toLowerCase()}`, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="mt-12 flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-xl"
            >
              Back
            </button>
          )}

          <div className="ml-auto">
            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-xl"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-xl flex items-center ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Claim"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerForm
