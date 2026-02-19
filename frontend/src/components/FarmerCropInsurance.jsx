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
  Eye,
  MapPin,
  DollarSign,
  TrendingUp,
  FileText,
  Crop,
  Timer,
  Info,
  RefreshCw,
} from "lucide-react"
import {
  useCropInsurance,
  useCreateCropInsurance
} from '../hooks/useAPI'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import PcicFormContent from './PcicFormContent'

const FarmerCropInsurance = () => {
  const { user } = useAuthStore()
  
  const { data: cropInsuranceRecords = [], isLoading: loading, refetch: refetchInsurance } = useCropInsurance(user?._id)
  const createInsuranceMutation = useCreateCropInsurance()

  const delayedRefresh = () => {
    const delay = Math.random() * 5000 + 5000
    setTimeout(async () => {
      try {
        await refetchInsurance()
      } catch {
        // ignore
      }
    }, delay)
  }
  
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [formData, setFormData] = useState({
    cropType: "",
    otherCrop: "",
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

  const getEmptyPcicForm = () => ({
    applicationType: "New Application",
    totalArea: "",
    farmerCategory: "Self-Financed",
    lender: "",
    dateOfApplication: "",
    applicantName: { lastName: "", firstName: "", middleName: "", suffix: "" },
    address: { street: "", barangay: "", municipality: "", province: "" },
    contactNumber: "",
    dateOfBirth: "",
    sex: "",
    specialSector: [],
    tribe: "",
    civilStatus: "",
    spouseName: "",
    beneficiary: {
      primary: { lastName: "", firstName: "", middleName: "", suffix: "", relationship: "", birthdate: "" },
      guardian: { lastName: "", firstName: "", middleName: "", suffix: "", relationship: "", birthdate: "" }
    },
    indemnityPaymentOption: "",
    indemnityOther: "",
    lots: [{ farmLocation: { street: "", barangay: "", municipality: "", province: "" }, boundaries: { north: "", east: "", south: "", west: "" }, geoRefId: "", variety: "", plantingMethod: "", dateOfSowing: "", dateOfPlanting: "", dateOfHarvest: "", numberOfTreesHills: "", landCategory: "", tenurialStatus: "", desiredAmountOfCover: "", lotArea: "" }],
    certificationConsent: false,
    deedOfAssignmentConsent: false,
    signatureImage: null,
    certificationDate: "",
    sourceOfPremium: [],
    sourceOfPremiumOther: ""
  })
  const [pcicForm, setPcicForm] = useState(getEmptyPcicForm())

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

  const getErrorMessage = (error) => {
    if (!error?.message) return 'Something went wrong. Please try again.'
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Network request failed')) return 'Cannot reach server. Check your connection and that the backend is running.'
    if (error.message.includes('timeout') || error.message.includes('AbortError')) return 'Request timed out. Please try again.'
    return error.message
  }

  const toIsoDate = (v) => (v && (v instanceof Date || typeof v === "string")) ? new Date(v).toISOString() : (v || null)

  const withNaDefaults = (obj, skipKeys = new Set(['signatureImage', 'evidenceImage', 'lotArea', 'desiredAmountOfCover', 'numberOfTreesHills', 'cropArea', 'totalArea'])) => {
    if (obj === null || obj === undefined) return 'N/A'
    if (typeof obj === 'number' || typeof obj === 'boolean') return obj
    if (Array.isArray(obj)) return obj.map(item => (typeof item === 'object' && item !== null && !Array.isArray(item)) ? withNaDefaults(item, skipKeys) : (item === '' || item === null || item === undefined ? 'N/A' : item))
    if (typeof obj === 'string') return (obj === '' ? 'N/A' : obj)
    if (typeof obj === 'object') {
      const out = {}
      for (const [k, v] of Object.entries(obj)) {
        if (skipKeys.has(k)) { out[k] = v; continue }
        if (v === null || v === undefined || v === '') { out[k] = 'N/A'; continue }
        if (typeof v === 'number' || typeof v === 'boolean') { out[k] = v; continue }
        if (typeof v === 'string') { out[k] = v === '' ? 'N/A' : v; continue }
        if (Array.isArray(v)) { out[k] = v.map(el => (typeof el === 'object' && el !== null && !Array.isArray(el)) ? withNaDefaults(el, skipKeys) : (el === '' || el === null || el === undefined ? 'N/A' : el)); continue }
        out[k] = withNaDefaults(v, skipKeys)
      }
      return out
    }
    return obj
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'cropType' && cropConfigurations[value]) {
        next.insuranceDayLimit = cropConfigurations[value].dayLimit.toString()
      }
      return next
    })
  }

  const handlePcicFormChange = (path, value) => {
    const parts = path.split(".")
    setPcicForm(prev => {
      const next = { ...prev }
      let cur = next
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i]
        const isArray = key === "lots" || key === "specialSector" || key === "sourceOfPremium"
        if (isArray && !Array.isArray(cur[key])) cur[key] = [...(cur[key] || [])]
        else if (typeof cur[key] !== "object" || cur[key] === null) cur[key] = {}
        cur = cur[key]
      }
      cur[parts[parts.length - 1]] = value
      return next
    })
  }

  const handlePcicLotChange = (lotIndex, field, value) => {
    setPcicForm(prev => {
      const lots = [...(prev.lots || [])]
      if (!lots[lotIndex]) lots[lotIndex] = { farmLocation: {}, boundaries: { north: "", east: "", south: "", west: "" }, geoRefId: "", variety: "", plantingMethod: "", dateOfSowing: "", dateOfPlanting: "", dateOfHarvest: "", numberOfTreesHills: "", landCategory: "", tenurialStatus: "", desiredAmountOfCover: "", lotArea: "" }
      const lot = { ...lots[lotIndex] }
      if (field.startsWith("farmLocation.")) {
        lot.farmLocation = { ...lot.farmLocation, [field.split(".")[1]]: value }
      } else if (field.startsWith("boundaries.")) {
        lot.boundaries = { ...lot.boundaries, [field.split(".")[1]]: value }
      } else {
        lot[field] = value
      }
      lots[lotIndex] = lot
      return { ...prev, lots }
    })
  }

  const handleAddLot = () => {
    setPcicForm(prev => ({
      ...prev,
      lots: [...(prev.lots || []), { farmLocation: { street: "", barangay: "", municipality: "", province: "" }, boundaries: { north: "", east: "", south: "", west: "" }, geoRefId: "", variety: "", plantingMethod: "", dateOfSowing: "", dateOfPlanting: "", dateOfHarvest: "", numberOfTreesHills: "", landCategory: "", tenurialStatus: "", desiredAmountOfCover: "", lotArea: "" }]
    }))
  }

  const handleRemoveLot = (index) => {
    if ((pcicForm.lots || []).length <= 1) return
    setPcicForm(prev => ({ ...prev, lots: prev.lots.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?._id) return

    const firstLot = pcicForm.lots && pcicForm.lots[0] ? pcicForm.lots[0] : null
    const plantingDateVal = firstLot?.dateOfPlanting || firstLot?.dateOfSowing || formData.plantingDate
    const harvestDateVal = firstLot?.dateOfHarvest || formData.expectedHarvestDate
    const totalAreaVal = pcicForm.totalArea != null && pcicForm.totalArea !== "" ? parseFloat(pcicForm.totalArea) : parseFloat(formData.cropArea)
    const lotAreaVal = firstLot?.lotArea != null && firstLot?.lotArea !== "" ? parseFloat(firstLot.lotArea) : parseFloat(formData.lotArea)

    const pcicPayloadRaw = {
      ...pcicForm,
      dateOfApplication: toIsoDate(pcicForm.dateOfApplication) || new Date().toISOString(),
      dateOfBirth: toIsoDate(pcicForm.dateOfBirth),
      certificationDate: toIsoDate(pcicForm.certificationDate),
      beneficiary: pcicForm.beneficiary ? {
        primary: { ...pcicForm.beneficiary.primary, birthdate: toIsoDate(pcicForm.beneficiary.primary?.birthdate) },
        guardian: { ...pcicForm.beneficiary.guardian, birthdate: toIsoDate(pcicForm.beneficiary.guardian?.birthdate) }
      } : undefined,
      lots: (pcicForm.lots || []).map(lot => ({
        ...lot,
        dateOfSowing: toIsoDate(lot.dateOfSowing),
        dateOfPlanting: toIsoDate(lot.dateOfPlanting),
        dateOfHarvest: toIsoDate(lot.dateOfHarvest),
        lotArea: lot.lotArea != null && lot.lotArea !== "" ? parseFloat(lot.lotArea) : undefined,
        desiredAmountOfCover: lot.desiredAmountOfCover != null && lot.desiredAmountOfCover !== "" ? parseFloat(lot.desiredAmountOfCover) : undefined
      }))
    }
    const pcicPayload = withNaDefaults(pcicPayloadRaw)

    const effectiveCropType = formData.cropType === "Other" ? (formData.otherCrop || "Other") : formData.cropType
    const evidenceValue = formData.evidenceImage ?? pcicForm.signatureImage ?? null
    const evidenceImageSafe = evidenceValue != null && typeof evidenceValue === 'string' ? evidenceValue : null
    const submissionData = {
      farmerId: user._id,
      cropType: effectiveCropType,
      cropArea: totalAreaVal,
      lotNumber: formData.lotNumber || "Lot 1",
      lotArea: lotAreaVal,
      plantingDate: plantingDateVal ? new Date(plantingDateVal).toISOString() : new Date().toISOString(),
      expectedHarvestDate: harvestDateVal ? new Date(harvestDateVal).toISOString() : new Date().toISOString(),
      insuranceDayLimit: parseInt(formData.insuranceDayLimit) || cropConfigurations[effectiveCropType]?.dayLimit || cropConfigurations[formData.cropType]?.dayLimit || 30,
      notes: formData.notes != null && formData.notes !== "" ? formData.notes : "N/A",
      evidenceImage: evidenceImageSafe,
      pcicForm: pcicPayload
    }

    setSubmitError(null)
    try {
      await createInsuranceMutation.mutateAsync(submissionData)
      setSubmitError(null)
      setShowAddModal(false)
      setFormData({ cropType: "", otherCrop: "", cropArea: "", lotNumber: "", lotArea: "", plantingDate: "", expectedHarvestDate: "", insuranceDayLimit: "", notes: "", evidenceImage: null, location: { lat: null, lng: null } })
      setPcicForm(getEmptyPcicForm())
      delayedRefresh()
      toast.success('Crop insurance application submitted.')
    } catch (error) {
      const message = getErrorMessage(error)
      setSubmitError(message)
      toast.error(message)
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

  // Check if record is actually expired (0 days left or deadline passed)
  const isActuallyExpired = (record) => {
    const remainingDays = getRemainingDays(record)
    return remainingDays === 0 || !record.canInsure
  }

  const getStatusColor = (record) => {
    if (record.isInsured) return 'text-green-600'
    if (isActuallyExpired(record)) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getStatusText = (record) => {
    if (record.isInsured) return 'Insured'
    if (isActuallyExpired(record)) return 'Expired'
    return 'Can Insure'
  }

  const getStatusIcon = (record) => {
    if (record.isInsured) return <CheckCircle className="w-4 h-4 mr-1" />
    if (isActuallyExpired(record)) return <X className="w-4 h-4 mr-1" />
    return <Clock className="w-4 h-4 mr-1" />
  }

  const filteredRecords = cropInsuranceRecords
    .filter(record => {
      const cropType = record.cropType.toLowerCase()
      const searchLower = searchQuery.toLowerCase()
      return cropType.includes(searchLower)
    })
    .sort((a, b) => {
      // Sort by updatedAt first, then createdAt, then _id (latest first)
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return dateB - dateA // Descending order (newest first)
    })

  return (
    <div className="space-y-6">
      {/* Single toolbar: My crop insurance, search, Add New Crop, Refresh */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">My crop insurance</h2>
        <div className="relative flex-1 min-w-[180px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by crop type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => {
            setSubmitError(null)
            if (user) {
              setPcicForm(prev => ({
                ...prev,
                applicantName: {
                  lastName: user.lastName || "",
                  firstName: user.firstName || "",
                  middleName: user.middleName || "",
                  suffix: ""
                },
                address: {
                  street: user.address || "",
                  barangay: prev.address?.barangay || "",
                  municipality: prev.address?.municipality || "",
                  province: prev.address?.province || ""
                },
                contactNumber: user.contactNum || "",
                dateOfBirth: user.birthday || "",
                sex: user.gender === "Male" || user.gender === "Female" ? user.gender : ""
              }))
            }
            setShowAddModal(true)
          }}
          className="bg-lime-400 text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-lime-500 transition-colors"
        >
          <Plus size={20} />
          Add New Crop
        </button>
        <button
          onClick={() => refetchInsurance()}
          className="bg-lime-400 text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-lime-500 transition-colors"
          aria-label="Refresh data"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-lime-50 rounded-xl shadow-md overflow-hidden text-black">
        <style>{`
          .crop-insurance-table-scroll::-webkit-scrollbar {
            display: none;
          }
          .crop-insurance-table-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Crop Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Planting Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Expected Harvest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Day Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Actions
                  </th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto crop-insurance-table-scroll" style={{ maxHeight: '350px' }}>
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <div className="text-sm font-medium text-gray-900">{record.cropType}</div>
                        <div className="text-sm text-gray-500">
                          {record.cropArea} ha • Lot {record.lotNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <div className="text-sm text-gray-900">
                          {formatDate(record.plantingDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <div className="text-sm text-gray-900">
                          {formatDate(record.expectedHarvestDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <div className="text-sm text-gray-900">
                          {record.insuranceDayLimit} days
                        </div>
                        {!record.isInsured && !isActuallyExpired(record) && (
                          <div className="text-xs text-yellow-600">
                            {getRemainingDays(record)} days left
                          </div>
                        )}
                        {!record.isInsured && isActuallyExpired(record) && (
                          <div className="text-xs text-red-600">
                            Expired
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-1/6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record)}`}>
                          {getStatusIcon(record)}
                          {getStatusText(record)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-1/6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRecord(record)
                              setShowDetailsModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record._id} className="bg-white rounded-xl p-4 shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Crop Type</p>
                      <p className="text-sm font-medium text-gray-900">{record.cropType}</p>
                      <p className="text-xs text-gray-600 mt-1">{record.cropArea} ha • Lot {record.lotNumber}</p>
                    </div>
                    <span className={`ml-2 px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full flex-shrink-0 ${getStatusColor(record)}`}>
                      {getStatusIcon(record)}
                      {getStatusText(record)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Planting Date</p>
                    <p className="text-sm text-gray-700">{formatDate(record.plantingDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expected Harvest</p>
                    <p className="text-sm text-gray-700">{formatDate(record.expectedHarvestDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Day Limit</p>
                    <p className="text-sm text-gray-700">{record.insuranceDayLimit} days</p>
                    {!record.isInsured && !isActuallyExpired(record) && (
                      <p className="text-xs text-yellow-600 mt-1">{getRemainingDays(record)} days left</p>
                    )}
                    {!record.isInsured && isActuallyExpired(record) && (
                      <p className="text-xs text-red-600 mt-1">Expired</p>
                    )}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedRecord(record)
                        setShowDetailsModal(true)
                      }}
                      className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-900 font-medium py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Crop Modal — PCIC application form (same as admin) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl text-black w-[80vw] max-w-5xl h-[80vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-lime-50 shrink-0">
              <h3 className="text-lg font-semibold text-black">PHILIPPINE CROP INSURANCE CORPORATION — APPLICATION FOR CROP INSURANCE</h3>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setSubmitError(null); }}
                className="text-black hover:text-gray-700 p-1"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                <PcicFormContent
                  formData={formData}
                  setFormData={setFormData}
                  pcicForm={pcicForm}
                  setPcicForm={setPcicForm}
                  handleFormChange={handleFormChange}
                  handlePcicFormChange={handlePcicFormChange}
                  handlePcicLotChange={handlePcicLotChange}
                  handleAddLot={handleAddLot}
                  handleRemoveLot={handleRemoveLot}
                  cropConfigurations={cropConfigurations}
                  farmers={[]}
                  showFarmerSelector={false}
                  submitError={submitError}
                  setSubmitError={setSubmitError}
                  loading={createInsuranceMutation.isPending}
                  onCancel={() => { setShowAddModal(false); setSubmitError(null); }}
                />
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
                <h4 className="font-medium text-gray-900 mb-2">Crop Information</h4>
                <p className="text-sm text-gray-600">Crop: {selectedRecord.cropType}</p>
                <p className="text-sm text-gray-600">Area: {selectedRecord.cropArea} hectares</p>
                <p className="text-sm text-gray-600">Lot: {selectedRecord.lotNumber}</p>
                <p className="text-sm text-gray-600">Lot Area: {selectedRecord.lotArea} hectares</p>
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
                {!selectedRecord.isInsured && !isActuallyExpired(selectedRecord) && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <Info className="inline w-4 h-4 mr-1" />
                      {getRemainingDays(selectedRecord)} days remaining to apply insurance
                    </p>
                  </div>
                )}
                {!selectedRecord.isInsured && isActuallyExpired(selectedRecord) && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <AlertTriangle className="inline w-4 h-4 mr-1" />
                      Insurance deadline has passed. This crop cannot be insured anymore.
                    </p>
                  </div>
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

export default FarmerCropInsurance 