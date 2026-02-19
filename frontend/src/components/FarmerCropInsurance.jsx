"use client"

import { useState, useRef } from "react"
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
  ChevronUp,
  ChevronDown,
  Check,
  Trash2,
} from "lucide-react"
import {
  useCropInsurance,
  useCreateCropInsurance,
  useDeleteCropInsurance,
} from '../hooks/useAPI'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import PcicFormContent from './PcicFormContent'
import { getCropInsuranceDetailsDisplayData } from '../utils/cropInsuranceDetailsDisplayData'

const FarmerCropInsurance = () => {
  const { user } = useAuthStore()
  
  const { data: cropInsuranceRecords = [], isLoading: loading, refetch: refetchInsurance } = useCropInsurance(user?._id)
  const createInsuranceMutation = useCreateCropInsurance()
  const deleteInsuranceMutation = useDeleteCropInsurance()

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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [recordToCancel, setRecordToCancel] = useState(null)
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

  const handleCancelClick = (recordId) => {
    setRecordToCancel(recordId)
    setShowCancelConfirm(true)
  }

  const handleConfirmCancel = async () => {
    if (!recordToCancel) return
    try {
      await deleteInsuranceMutation.mutateAsync(recordToCancel)
      toast.success('Crop insurance application cancelled.')
      setShowCancelConfirm(false)
      setRecordToCancel(null)
      delayedRefresh()
    } catch (error) {
      const message = error?.message || 'Something went wrong. Please try again.'
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
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return dateB - dateA
    })

  const tableScrollRef = useRef(null)
  const scrollTable = (direction) => {
    const el = tableScrollRef.current
    if (!el) return
    const step = 120
    el.scrollBy({ top: direction === 'up' ? -step : step, behavior: 'smooth' })
  }

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

      {/* Records Table — scrollable, no pagination; scroll up/down buttons */}
      <div className="bg-lime-50 rounded-xl shadow-md overflow-hidden text-black">
        <style>{`
          .crop-insurance-table-scroll::-webkit-scrollbar { width: 8px; }
          .crop-insurance-table-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
          .crop-insurance-table-scroll::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
          .crop-insurance-table-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
        `}</style>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="flex items-center justify-end gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50/80">
            <span className="text-xs text-gray-500 mr-2">Scroll table:</span>
            <button
              type="button"
              onClick={() => scrollTable('up')}
              className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-green-500"
              aria-label="Scroll table up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollTable('down')}
              className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-green-500"
              aria-label="Scroll table down"
            >
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <div
              ref={tableScrollRef}
              className="crop-insurance-table-scroll overflow-y-auto overflow-x-auto"
              style={{ maxHeight: 'min(400px, 60vh)' }}
            >
              <table className="w-full min-w-[600px]">
                <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedRecord(record)
                        setShowDetailsModal(true)
                      }}
                    >
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
                      <td className="px-6 py-4 text-sm font-medium w-1/6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRecord(record)
                              setShowDetailsModal(true)
                            }}
                            className="bg-blue-600 border-2 border-black text-white px-3 py-1 rounded-lg hover:bg-blue-700 font-bold text-sm flex items-center gap-1"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancelClick(record._id); }}
                            className="bg-red-500 border-2 border-black text-white px-3 py-1 rounded-lg hover:bg-red-600 font-bold text-sm flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                            <span>Cancel</span>
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
              <div
                key={record._id}
                className="bg-white rounded-xl p-4 shadow-md cursor-pointer"
                onClick={() => {
                  setSelectedRecord(record)
                  setShowDetailsModal(true)
                }}
              >
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
                  <div className="pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRecord(record)
                        setShowDetailsModal(true)
                      }}
                      className="flex-1 bg-blue-600 border-2 border-black text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-bold text-sm flex items-center justify-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancelClick(record._id); }}
                      className="flex-1 bg-red-500 border-2 border-black text-white px-3 py-2 rounded-lg hover:bg-red-600 font-bold text-sm flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} />
                      Cancel
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

      {/* Details Modal – same PCIC APPLICATION view as admin */}
      {showDetailsModal && selectedRecord && (() => {
        const farmersForDisplay = user ? [user] : []
        const d = getCropInsuranceDetailsDisplayData(selectedRecord, farmersForDisplay)
        const CheckBox = ({ checked }) => (
          <span className="inline-flex items-center justify-center w-5 h-5 border-2 border-black rounded">
            {checked ? <Check size={14} className="text-black" /> : null}
          </span>
        )
        return (
          <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
              <div className="sticky top-0 bg-white border-b-2 border-black px-5 py-4 flex justify-between items-start z-20">
                <div className="text-center flex-1">
                  <p className="text-xs font-semibold text-black">Republic of the Philippines</p>
                  <p className="text-sm font-bold text-black uppercase tracking-wide">Philippine Crop Insurance Corporation</p>
                  <p className="text-xs text-gray-600 mt-1">Regional Office No. _______________</p>
                  <h2 className="text-lg font-bold text-black mt-2">APPLICATION FOR CROP INSURANCE</h2>
                  <p className="text-xs text-gray-600">(Individual Application)</p>
                  <p className="text-xs text-gray-700 mt-1">Kindly fill out all entries and tick all boxes [√] as appropriate.</p>
                </div>
                <div className="text-right text-xs text-gray-600 shrink-0 ml-2">
                  <p>PCIC-F-001</p>
                  <p>Rev. 001/01-18</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-black hover:bg-lime-200 rounded-full p-1 shrink-0">
                  <X size={24} />
                </button>
              </div>
              <div className="p-5 space-y-6 text-sm">
                <div className="space-y-2 border-b border-black pb-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold">CROP (Choose only one):</span>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={d.crop.isCorn} /> Corn</label>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={d.crop.isRice} /> Rice</label>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={d.crop.isHighValue} /> High-Value (Please Specify)</label>
                    {d.crop.isHighValue && <span className="underline ml-1">{d.crop.highValueSpec}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold">APPLICATION TYPE:</span>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={/new/i.test(d.applicationType)} /> New Application</label>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={/renewal/i.test(d.applicationType)} /> Renewal</label>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold">TOTAL AREA (in Hectares):</span>
                    <span className="border-b border-black px-2 min-w-[4rem]">{d.totalArea}</span>
                    <span className="font-bold">FARMER CATEGORY:</span>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={/self/i.test(d.farmerCategory)} /> Self-financed</label>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={/borrow/i.test(d.farmerCategory)} /> Borrowing</label>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={/lend/i.test(d.farmerCategory)} /> Lender</label>
                    {d.lender && <span className="ml-1">({d.lender})</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="font-bold">DATE OF APPLICATION:</span>
                    <span className="border-b border-black px-2">{d.dateOfApplication}</span>
                    <span className="text-gray-500">(mm/dd/yyyy)</span>
                  </div>
                </div>
                <div className="space-y-3 border-b border-black pb-4">
                  <h3 className="font-bold text-black uppercase">A. Basic Farmer Information</h3>
                  <div>
                    <p className="font-semibold mb-1">A.1 Name:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div><span className="text-gray-600 block text-xs">Last Name</span><span className="border-b border-black block px-1">{d.name.lastName}</span></div>
                      <div><span className="text-gray-600 block text-xs">First Name</span><span className="border-b border-black block px-1">{d.name.firstName}</span></div>
                      <div><span className="text-gray-600 block text-xs">Middle Name</span><span className="border-b border-black block px-1">{d.name.middleName}</span></div>
                      <div><span className="text-gray-600 block text-xs">Suffix (Jr., Sr., II)</span><span className="border-b border-black block px-1">{d.name.suffix}</span></div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">A.2 Contact Number:</p>
                    <span className="border-b border-black px-2 inline-block min-w-[8rem]">{d.contactNumber}</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">A.3 Address:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div><span className="text-gray-600 block text-xs">No. & Street/Sitio</span><span className="border-b border-black block px-1">{d.address.street}</span></div>
                      <div><span className="text-gray-600 block text-xs">Barangay</span><span className="border-b border-black block px-1">{d.address.barangay}</span></div>
                      <div><span className="text-gray-600 block text-xs">Municipality/City</span><span className="border-b border-black block px-1">{d.address.municipality}</span></div>
                      <div><span className="text-gray-600 block text-xs">Province</span><span className="border-b border-black block px-1">{d.address.province}</span></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="font-semibold mb-1">A.4 Date of Birth:</p>
                      <span className="border-b border-black px-2">{d.dateOfBirth}</span> <span className="text-gray-500 text-xs">(mm/dd/yyyy)</span>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">A.5 Sex:</p>
                      <label className="inline-flex items-center gap-1 mr-3"><CheckBox checked={d.sex === 'male'} /> Male</label>
                      <label className="inline-flex items-center gap-1"><CheckBox checked={d.sex === 'female'} /> Female</label>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">A.6 Are you part of a special sector? Please tick [√] as many as necessary:</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {['Senior Citizens', 'Youth', 'PWD', 'Women'].map(s => (
                        <label key={s} className="inline-flex items-center gap-1">
                          <CheckBox checked={d.specialSector.some(ss => new RegExp(s.split(' ')[0], 'i').test(ss))} /> {s}
                        </label>
                      ))}
                      <label className="inline-flex items-center gap-1">Indigenous People (please indicate tribe)</label>
                      <span className="border-b border-black px-2 inline-block min-w-[6rem]">{d.tribe}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">A.7 Civil Status:</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {['Single', 'Married', 'Widow/er', 'Separated', 'Annulled'].map(s => (
                        <label key={s} className="inline-flex items-center gap-1">
                          <CheckBox checked={d.civilStatus.toLowerCase().includes(s.toLowerCase().split('/')[0])} /> {s}
                        </label>
                      ))}
                      {d.spouseName && <span className="ml-2">Name of Spouse: {d.spouseName}</span>}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">A.8 Name of Legal Beneficiary (in case of death benefit, as applicable):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Primary Beneficiary:</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <span className="border-b border-gray-400 px-1">{d.beneficiary.primary.lastName || '—'}</span>
                          <span className="border-b border-gray-400 px-1">{d.beneficiary.primary.firstName || '—'}</span>
                          <span className="border-b border-gray-400 px-1 col-span-2">{d.beneficiary.primary.middleName || '—'}</span>
                          <span className="border-b border-gray-400 px-1">Relationship: {d.beneficiary.primary.relationship || '—'}</span>
                          <span className="border-b border-gray-400 px-1">Birthdate: {d.beneficiary.primary.birthdate ? new Date(d.beneficiary.primary.birthdate).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Guardian:</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <span className="border-b border-gray-400 px-1">{d.beneficiary.guardian.lastName || '—'}</span>
                          <span className="border-b border-gray-400 px-1">{d.beneficiary.guardian.firstName || '—'}</span>
                          <span className="border-b border-gray-400 px-1 col-span-2">{d.beneficiary.guardian.relationship || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">A.9 Preferred method of receiving indemnity payment:</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <label className="inline-flex items-center gap-1"><CheckBox checked={/landbank|dbp/i.test(d.indemnityOption)} /> Landbank or DBP</label>
                      <label className="inline-flex items-center gap-1"><CheckBox checked={/pabahay|express/i.test(d.indemnityOption)} /> Pabahay Express</label>
                      <label className="inline-flex items-center gap-1"><CheckBox checked={/cash/i.test(d.indemnityOption)} /> Cash</label>
                      <label className="inline-flex items-center gap-1"><CheckBox checked={/other/i.test(d.indemnityOption)} /> Others (Please specify)</label>
                      {d.indemnityOther && <span className="border-b border-black px-2">{d.indemnityOther}</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 border-b border-black pb-4">
                  <h3 className="font-bold text-black uppercase">B. Farm Information (Use separate sheet if more than three (3) lots)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-black text-xs">
                      <thead>
                        <tr className="bg-lime-50">
                          <th className="border border-black p-1 text-left w-40">Field</th>
                          {[1, 2, 3].map(i => <th key={i} className="border border-black p-1 text-center">Lot {i}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-black p-1 font-semibold">B.1 Farm Location/ASP</td><td colSpan={3} className="border border-black p-1 text-gray-600">a. No. & street/Sitio, b. Barangay, c. Municipality/City, d. Province</td></tr>
                        {['street', 'barangay', 'municipality', 'province'].map((key, i) => {
                          const label = key === 'street' ? 'No. & street/Sitio' : key === 'barangay' ? 'Barangay' : key === 'municipality' ? 'Municipality/City' : 'Province'
                          const getLotVal = (lotIdx) => {
                            const loc = d.lots[lotIdx]?.farmLocation
                            if (loc && (loc[key] != null && loc[key] !== '')) return loc[key]
                            if (lotIdx === 0) return d.address[key] || '—'
                            return '—'
                          }
                          return (
                            <tr key={key}>
                              <td className="border border-black p-1 pl-4">{String.fromCharCode(97 + i)}. {label}</td>
                              {[0, 1, 2].map(lotIdx => <td key={lotIdx} className="border border-black p-1">{getLotVal(lotIdx)}</td>)}
                            </tr>
                          )
                        })}
                        <tr><td className="border border-black p-1 font-semibold">B.2 Boundaries</td><td colSpan={3} className="border border-black p-1 text-gray-600">North, East, South, West</td></tr>
                        {['north', 'east', 'south', 'west'].map(dir => (
                          <tr key={dir}><td className="border border-black p-1 pl-4 capitalize">{dir}</td>
                            {[0, 1, 2].map(lotIdx => <td key={lotIdx} className="border border-black p-1">{d.lots[lotIdx]?.boundaries?.[dir] ?? '—'}</td>)}
                          </tr>
                        ))}
                        <tr><td className="border border-black p-1 font-semibold">B.3 GeoRef ID (DA-RBEIA) or Farm ID (PCIC)</td>
                          {[0, 1, 2].map(lotIdx => <td key={lotIdx} className="border border-black p-1">{d.lots[lotIdx]?.geoRefId ?? '—'}</td>)}
                        </tr>
                        <tr><td className="border border-black p-1 font-semibold">B.4 Variety</td>
                          {[0, 1, 2].map(lotIdx => <td key={lotIdx} className="border border-black p-1">{d.lots[lotIdx]?.variety ?? '—'}</td>)}
                        </tr>
                        <tr><td className="border border-black p-1 font-semibold">B.5 Planting Method</td>
                          {[0, 1, 2].map(lotIdx => (
                            <td key={lotIdx} className="border border-black p-1">
                              <CheckBox checked={(d.lots[lotIdx]?.plantingMethod || '').toLowerCase().includes('direct')} /> Direct Seeded
                              <span className="mx-1" /><CheckBox checked={(d.lots[lotIdx]?.plantingMethod || '').toLowerCase().includes('transplant')} /> Transplanted
                            </td>
                          ))}
                        </tr>
                        <tr><td className="border border-black p-1 font-semibold">B.6 Date of Sowing</td>
                          {[0, 1, 2].map(lotIdx => <td key={lotIdx} className="border border-black p-1">{d.lots[lotIdx]?.dateOfSowing ? new Date(d.lots[lotIdx].dateOfSowing).toLocaleDateString() : '—'}</td>)}
                        </tr>
                        <tr><td className="border border-black p-1 font-semibold">B.7 Date of Planting</td>
                          {[0, 1, 2].map(lotIdx => <td key={lotIdx} className="border border-black p-1">{d.lots[lotIdx]?.dateOfPlanting ? new Date(d.lots[lotIdx].dateOfPlanting).toLocaleDateString() : (lotIdx === 0 ? formatDate(selectedRecord.plantingDate) : '—')}</td>)}
                        </tr>
                        <tr><td className="border border-black p-1 font-semibold">B.8 Date of Harvest</td>
                          {[0, 1, 2].map(lotIdx => <td key={lotIdx} className="border border-black p-1">{d.lots[lotIdx]?.dateOfHarvest ? new Date(d.lots[lotIdx].dateOfHarvest).toLocaleDateString() : (lotIdx === 0 ? formatDate(selectedRecord.expectedHarvestDate) : '—')}</td>)}
                        </tr>
                        <tr><td className="border border-black p-1 font-semibold">B.9 Number of Trees/Hills (for HVC only)</td>
                          {[0, 1, 2].map(lotIdx => <td key={lotIdx} className="border border-black p-1">{d.lots[lotIdx]?.numberOfTreesHills ?? '—'}</td>)}
                        </tr>
                        <tr><td className="border border-black p-1 font-semibold">B.10 Land Category</td>
                          {[0, 1, 2].map(lotIdx => (
                            <td key={lotIdx} className="border border-black p-1">
                              <CheckBox checked={(d.lots[lotIdx]?.landCategory || '').toLowerCase().includes('irrigat')} /> Irrigated
                              <span className="mx-1" /><CheckBox checked={(d.lots[lotIdx]?.landCategory || '').toLowerCase().includes('non')} /> Non-Irrigated
                            </td>
                          ))}
                        </tr>
                        <tr><td className="border border-black p-1 font-semibold">B.11 Tenurial Status</td>
                          {[0, 1, 2].map(lotIdx => (
                            <td key={lotIdx} className="border border-black p-1">
                              <CheckBox checked={(d.lots[lotIdx]?.tenurialStatus || '').toLowerCase().includes('owner')} /> Owner
                              <span className="mx-1" /><CheckBox checked={(d.lots[lotIdx]?.tenurialStatus || '').toLowerCase().includes('lessee')} /> Lessee
                            </td>
                          ))}
                        </tr>
                        <tr><td className="border border-black p-1 font-semibold">B.12 Desired Amount of Cover (Php)</td>
                          {[0, 1, 2].map(lotIdx => <td key={lotIdx} className="border border-black p-1">{d.lots[lotIdx]?.desiredAmountOfCover != null ? d.lots[lotIdx].desiredAmountOfCover : '—'}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="space-y-2 border-b border-black pb-4">
                  <h3 className="font-bold text-black uppercase">C. Certification and Data Privacy Consent Statement</h3>
                  <div className="flex gap-2">
                    <CheckBox checked={d.certificationConsent} />
                    <p className="text-xs flex-1">I hereby certify that the foregoing answers and statements are complete, true and correct. If the application is approved, the insurance shall be deemed based upon the statements contained herein. I further agree that PCIC reserves the right to reject and/or void the insurance if found that there is fraud/misrepresentation on this statement material to the risk. I am hereby consent to the collection, use, processing, and disclosure of my sensitive personal data in accordance with the Data Privacy Act of 2012.</p>
                  </div>
                  <div className="flex gap-2">
                    <CheckBox checked={d.deedOfAssignmentConsent} />
                    <p className="text-xs flex-1">Deed of Assignment for borrowing farmers (if applicable): I hereby assign all or part of my rights, title, and interest in this insurance coverage to the Assignee (Lender) stated above.</p>
                  </div>
                  <div className="flex justify-end gap-4 text-xs">
                    <span>Signature or Thumb Mark over Printed Name: _______________________</span>
                    <span>Date: {d.certificationDate || '—'} (mm/dd/yyyy)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-black uppercase">D. Coverage (FOR PCIC USE ONLY)</h3>
                  <p className="font-semibold">D.1 Source of Premium:</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <label className="inline-flex items-center gap-1"><CheckBox checked={d.sourceOfPremium.some(s => /non-subsidized|regular/i.test(s))} /> Non-Subsidized/Regular</label>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={d.sourceOfPremium.some(s => /ncfp/i.test(s))} /> Subsidized/NCFP - NCFPo No.</label>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={d.sourceOfPremium.some(s => /rsbsa/i.test(s))} /> Subsidized/RSBSA - Ref. No.</label>
                    <label className="inline-flex items-center gap-1"><CheckBox checked={d.sourceOfPremium.some(s => /other/i.test(s))} /> Others</label>
                    {d.sourceOfPremiumOther && <span className="border-b border-black px-2">{d.sourceOfPremiumOther}</span>}
                  </div>
                </div>
                <div className="pt-3 border-t-2 border-black flex flex-wrap justify-between items-center gap-2">
                  <div className="flex flex-wrap gap-4">
                    <span><span className="font-semibold">Status:</span> <span className={getStatusColor(selectedRecord)}>{getStatusText(selectedRecord)}</span></span>
                    {selectedRecord.isInsured && <span><span className="font-semibold">Agency:</span> {selectedRecord.agency}</span>}
                    <span><span className="font-semibold">Day Limit:</span> {selectedRecord.insuranceDayLimit} days</span>
                  </div>
                  {selectedRecord.evidenceImage && (
                    <div className="flex-shrink-0">
                      <p className="font-semibold text-xs mb-1">Evidence Image</p>
                      <img src={selectedRecord.evidenceImage} alt="Evidence" className="max-h-24 object-contain border border-black rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Cancel (delete) confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">Cancel insurance</h2>
              <button
                onClick={() => { setShowCancelConfirm(false); setRecordToCancel(null); }}
                className="text-black hover:bg-lime-200 rounded-full p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 bg-white">
              <p className="text-black mb-6 text-center">
                Are you sure you want to cancel this crop insurance application? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCancelConfirm(false); setRecordToCancel(null); }}
                  className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 font-bold"
                >
                  Keep
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-red-500 border-2 border-black text-white px-4 py-3 rounded-lg hover:bg-red-600 font-bold"
                >
                  Cancel application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerCropInsurance 