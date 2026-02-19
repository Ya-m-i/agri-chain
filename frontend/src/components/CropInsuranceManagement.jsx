"use client"

import { useState, useRef, useEffect } from "react"
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
  RefreshCw,
  Download,
  Check,
} from "lucide-react"

import {
  useFarmers,
  useCropInsurance,
  useCropInsuranceStats,
  useCreateCropInsurance,
  useUpdateCropInsurance,
  useDeleteCropInsurance
} from '../hooks/useAPI'
import { generateCropInsuranceApplicationPDF } from '../utils/cropInsuranceApplicationPdfGenerator'
import { getCropInsuranceDetailsDisplayData } from '../utils/cropInsuranceDetailsDisplayData'
import { toast } from 'react-hot-toast'
import { wakeUpBackend, API_BASE_URL } from '../api'

const CropInsuranceManagement = () => {
  // Wake backend once on mount (e.g. Render cold start) so Create is fast
  useEffect(() => {
    wakeUpBackend()
  }, [])

  // React Query hooks
  const { data: cropInsuranceRecords = [], isLoading: insuranceLoading, refetch: refetchInsurance } = useCropInsurance()
  const { data: farmers = [], isLoading: farmersLoading, refetch: refetchFarmers } = useFarmers()
  const { isLoading: statsLoading, refetch: refetchStats } = useCropInsuranceStats()
  const createInsuranceMutation = useCreateCropInsurance()
  const updateInsuranceMutation = useUpdateCropInsurance()
  const deleteInsuranceMutation = useDeleteCropInsurance()

  // Delayed auto-refresh function (5-10 seconds after action)
  const delayedRefresh = () => {
    const delay = Math.random() * 5000 + 5000 // Random delay between 5-10 seconds
    setTimeout(async () => {
      try {
        await Promise.all([
          refetchInsurance(),
          refetchFarmers(),
          refetchStats()
        ]);
        console.log('Table data refreshed after action');
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }, delay);
  }
  
  // Combined loading state
  const loading = insuranceLoading || farmersLoading || statsLoading || 
                 createInsuranceMutation.isPending || updateInsuranceMutation.isPending || deleteInsuranceMutation.isPending
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({
    farmerId: "",
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
  // PCIC full form state (for Add New Crop modal matching PCIC application structure)
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)

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

    // Auto-populate fields when farmer is selected (legacy + PCIC Section A)
    if (name === 'farmerId' && value) {
      const selectedFarmer = farmers.find(f => f._id === value)
      if (selectedFarmer) {
        setFormData(prev => ({
          ...prev,
          farmerId: value,
          cropArea: selectedFarmer.cropArea || "",
          lotNumber: selectedFarmer.lotNumber || "",
          lotArea: selectedFarmer.lotArea || ""
        }))
        setPcicForm(prev => ({
          ...prev,
          applicantName: {
            lastName: selectedFarmer.lastName || "",
            firstName: selectedFarmer.firstName || "",
            middleName: selectedFarmer.middleName || "",
            suffix: ""
          },
          address: {
            street: selectedFarmer.address || "",
            barangay: prev.address?.barangay || "",
            municipality: prev.address?.municipality || "",
            province: prev.address?.province || ""
          },
          contactNumber: selectedFarmer.contactNum || "",
          dateOfBirth: selectedFarmer.birthday || "",
          sex: selectedFarmer.gender === "Male" || selectedFarmer.gender === "Female" ? selectedFarmer.gender : ""
        }))
      }
    }

    // Auto-set day limit when crop type changes
    if (name === 'cropType' && cropConfigurations[value]) {
      setFormData(prev => ({
        ...prev,
        cropType: value,
        insuranceDayLimit: cropConfigurations[value].dayLimit.toString()
      }))
    }
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

  const handleDownloadPdf = (record) => {
    const farmer = typeof record.farmerId === 'object' ? record.farmerId : farmers.find(f => f._id === record.farmerId)
    generateCropInsuranceApplicationPDF(record, farmer)
  }

  const toIsoDate = (v) => (v && (v instanceof Date || typeof v === "string")) ? new Date(v).toISOString() : (v || null)

  /** Recursively set empty string / null / undefined to "N/A" for PCIC payload (skip binary and numeric fields). */
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

  const handleSubmit = async (e) => {
    e.preventDefault()

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
    // Use string evidence only (e.g. base64 data URL); never send File/Blob so request is JSON-serializable
    const evidenceValue = formData.evidenceImage ?? pcicForm.signatureImage ?? null
    const evidenceImageSafe = evidenceValue != null && typeof evidenceValue === 'string' ? evidenceValue : null
    const submissionData = {
      farmerId: formData.farmerId,
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

    const runCreate = () => createInsuranceMutation.mutateAsync(submissionData)
    const onSuccess = () => {
      setShowAddModal(false)
      setFormData({ farmerId: "", cropType: "", otherCrop: "", cropArea: "", lotNumber: "", lotArea: "", plantingDate: "", expectedHarvestDate: "", insuranceDayLimit: "", notes: "", evidenceImage: null, location: { lat: null, lng: null } })
      setPcicForm(getEmptyPcicForm())
      delayedRefresh()
    }
    try {
      await runCreate()
      onSuccess()
    } catch (error) {
      const isNetworkError = !error?.message || error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Network request failed')
      if (isNetworkError) {
        const delayMs = 8000
        for (let attempt = 0; attempt < 2; attempt++) {
          toast.loading('Server may be waking up. Retrying in a few seconds...', { id: 'create-retry', duration: delayMs })
          await new Promise(r => setTimeout(r, delayMs))
          toast.dismiss('create-retry')
          try {
            await runCreate()
            onSuccess()
            return
          } catch (retryErr) {
            if (attempt === 1) {
              console.error('Error creating crop insurance record (retry):', retryErr)
              console.error('Backend URL:', API_BASE_URL, '– open', `${API_BASE_URL}/api/health`, 'in a new tab to verify it loads. If it does, redeploy the backend (CORS was updated to allow .onrender.com and kapalongagrichain.site).')
              toast.error('Cannot reach server. Open DevTools Console for backend URL and CORS tips.')
            }
          }
        }
        return
      }
      console.error('Error creating crop insurance record:', error)
      toast.error(error?.message || 'Could not create record.')
    }
  }

  const handleApplyInsurance = async (recordId, insuranceData) => {
    try {
      await updateInsuranceMutation.mutateAsync({
        id: recordId,
        updateData: {
          isInsured: true,
          agency: insuranceData.agency,
          insuranceDate: new Date().toISOString()
        }
      })

      console.log('Insurance applied successfully');
      // Trigger delayed auto-refresh (5-10 seconds)
      delayedRefresh();
    } catch (error) {
      console.error('Error applying insurance:', error)
    }
  }

  const handleDeleteClick = (recordId) => {
    setRecordToDelete(recordId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return

    try {
      await deleteInsuranceMutation.mutateAsync(recordToDelete)
      console.log('Insurance record deleted successfully');
      setShowDeleteConfirm(false)
      setRecordToDelete(null)
      // Trigger delayed auto-refresh (5-10 seconds)
      delayedRefresh();
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
    const remainingDays = getRemainingDays(record)
    if (remainingDays === 0 || !record.canInsure) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getStatusText = (record) => {
    if (record.isInsured) return 'Insured'
    const remainingDays = getRemainingDays(record)
    if (remainingDays === 0 || !record.canInsure) return 'Expired'
    return 'Can Insure'
  }

  const filteredRecords = cropInsuranceRecords.filter(record => {
    const farmerName = getFarmerName(record.farmerId).toLowerCase()
    const cropType = record.cropType.toLowerCase()
    const searchLower = searchQuery.toLowerCase()
    return farmerName.includes(searchLower) || cropType.includes(searchLower)
  })

  const tableScrollRef = useRef(null)
  const scrollTable = (direction) => {
    if (!tableScrollRef.current) return
    const step = 120
    tableScrollRef.current.scrollBy({ top: direction === 'up' ? -step : step, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6 bg-white rounded-lg p-6">
      {/* Header: title + Refresh + Add New Crop + Search in one line */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Crop Insurance Management</h2>
          <p className="text-sm text-gray-600">Manage crop insurance records with day limits</p>
        </div>
        <button
          onClick={async () => {
            try {
              await Promise.all([refetchInsurance(), refetchFarmers(), refetchStats()])
            } catch (error) {
              console.error('Error refreshing data:', error)
            }
          }}
          className="bg-lime-400 text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-lime-500 transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
        <button
          onClick={() => {
            wakeUpBackend()
            setPcicForm(getEmptyPcicForm())
            setShowAddModal(true)
          }}
          className="bg-lime-400 text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-lime-500 transition-colors"
        >
          <Plus size={20} />
          Add New Crop
        </button>
        <div className="relative flex-1 min-w-[200px] max-w-md">
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

      {/* Records Table - Scrollable, no pagination */}
      <div className="bg-white rounded-lg shadow overflow-hidden border-2 border-black flex flex-col">
        <div className="flex items-center justify-end gap-2 p-2 border-b border-gray-200">
          <button type="button" onClick={() => scrollTable('up')} className="p-2 rounded-lg bg-lime-100 text-lime-800 hover:bg-lime-200 transition-colors" aria-label="Scroll up">
            <ChevronLeft className="h-5 w-5 rotate-90" />
          </button>
          <button type="button" onClick={() => scrollTable('down')} className="p-2 rounded-lg bg-lime-100 text-lime-800 hover:bg-lime-200 transition-colors" aria-label="Scroll down">
            <ChevronRight className="h-5 w-5 rotate-90" />
          </button>
        </div>
        <div ref={tableScrollRef} className="overflow-x-auto overflow-y-auto max-h-[420px] scroll-smooth crop-insurance-table-scroll hidden lg:block" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.crop-insurance-table-scroll::-webkit-scrollbar { display: none; }`}</style>
          <table className="w-full min-w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
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
              {filteredRecords.map((record) => (
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
                        onClick={() => handleDownloadPdf(record)}
                        className="bg-gray-600 border-2 border-black text-white px-3 py-1 rounded-lg hover:bg-gray-700 font-bold text-sm flex items-center gap-1"
                        title="Download PDF"
                      >
                        <Download size={16} />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRecord(record)
                          setShowDetailsModal(true)
                        }}
                        className="bg-blue-600 border-2 border-black text-white px-3 py-1 rounded-lg hover:bg-blue-700 font-bold text-sm flex items-center gap-1"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      {!record.isInsured && record.canInsure && getRemainingDays(record) > 0 && (
                        <button
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowEditModal(true)
                          }}
                          className="bg-lime-400 border-2 border-black text-black px-3 py-1 rounded-lg hover:bg-lime-500 font-bold text-sm flex items-center gap-1"
                        >
                          <Shield size={16} />
                          <span>Insure</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(record._id)}
                        className="bg-red-500 border-2 border-black text-white px-3 py-1 rounded-lg hover:bg-red-600 font-bold text-sm flex items-center gap-1"
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
          {filteredRecords.map((record) => (
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
                  onClick={() => handleDownloadPdf(record)}
                  className="bg-gray-600 border-2 border-black text-white px-3 py-2 rounded-lg hover:bg-gray-700 font-bold text-sm flex items-center justify-center gap-1"
                  title="Download PDF"
                >
                  <Download size={16} />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedRecord(record)
                    setShowDetailsModal(true)
                  }}
                  className="flex-1 bg-blue-600 border-2 border-black text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                {!record.isInsured && record.canInsure && getRemainingDays(record) > 0 && (
                  <button
                    onClick={() => {
                      setSelectedRecord(record)
                      setShowEditModal(true)
                    }}
                    className="flex-1 bg-lime-400 border-2 border-black text-black px-3 py-2 rounded-lg hover:bg-lime-500 font-bold text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <Shield size={16} />
                    <span>Insure</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(record._id)}
                  className="bg-red-500 border-2 border-black text-white px-3 py-2 rounded-lg hover:bg-red-600 font-bold text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Crop Modal - Full-screen PCIC Application Form (same structure as image) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[80vw] h-[80vh] overflow-y-auto flex flex-col border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-4 flex justify-between items-center z-20 rounded-t-xl">
              <h2 className="text-xl font-bold text-black">PHILIPPINE CROP INSURANCE CORPORATION — APPLICATION FOR CROP INSURANCE</h2>
              <button type="button" className="text-black hover:bg-lime-200 rounded-full p-1" onClick={() => setShowAddModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Top section: Crop, Application Type, Total Area, Farmer Category, Date of Application */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 border-b-2 border-black pb-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">CROP (Choose only one)</label>
                  <select name="cropType" value={formData.cropType} onChange={handleFormChange} required className="w-full border-2 border-black p-2 rounded-lg text-sm">
                    <option value="">Select</option>
                    <option value="Rice">Rice</option>
                    <option value="Corn">Corn</option>
                    <option value="Other">High Value (Please Specify)</option>
                  </select>
                  {formData.cropType === "Other" && <input type="text" placeholder="Specify high value crop" value={formData.otherCrop || ""} className="mt-1 w-full border border-black p-1 rounded text-sm" onChange={(e) => setFormData(p => ({ ...p, otherCrop: e.target.value }))} />}
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">Application Type</label>
                  <select value={pcicForm.applicationType} onChange={(e) => handlePcicFormChange("applicationType", e.target.value)} className="w-full border-2 border-black p-2 rounded-lg text-sm">
                    <option value="New Application">New Application</option>
                    <option value="Renewal">Renewal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">Total Area (ha)</label>
                  <input type="number" step="0.01" value={pcicForm.totalArea || formData.cropArea} onChange={(e) => { handlePcicFormChange("totalArea", e.target.value); setFormData(p => ({ ...p, cropArea: e.target.value })) }} className="w-full border-2 border-black p-2 rounded-lg text-sm" placeholder="e.g. 1.5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">Farmer Category</label>
                  <select value={pcicForm.farmerCategory} onChange={(e) => handlePcicFormChange("farmerCategory", e.target.value)} className="w-full border-2 border-black p-2 rounded-lg text-sm">
                    <option value="Self-Financed">Self-Financed</option>
                    <option value="Borrowing">Borrowing</option>
                  </select>
                  {pcicForm.farmerCategory === "Borrowing" && <input type="text" placeholder="Enter lender name" value={pcicForm.lender} onChange={(e) => handlePcicFormChange("lender", e.target.value)} className="mt-1 w-full border border-black p-1 rounded text-sm" />}
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">Date of Application</label>
                  <input type="date" placeholder="YYYY-MM-DD" value={pcicForm.dateOfApplication ? (typeof pcicForm.dateOfApplication === "string" && pcicForm.dateOfApplication.length <= 10 ? pcicForm.dateOfApplication : new Date(pcicForm.dateOfApplication).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicFormChange("dateOfApplication", e.target.value)} className="w-full border-2 border-black p-2 rounded-lg text-sm" />
                </div>
              </div>
              <div className="border-b-2 border-black pb-4">
                <label className="block text-xs font-bold text-black mb-2 uppercase">Farmer (for linking)</label>
                <select name="farmerId" value={formData.farmerId} onChange={handleFormChange} required className="w-full max-w-xs border-2 border-black p-2 rounded-lg text-sm">
                  <option value="">Select Farmer</option>
                  {farmers.map((f) => <option key={f._id} value={f._id}>{f.firstName} {f.lastName}</option>)}
                </select>
              </div>

              {/* A. BASIC FARMER INFORMATION */}
              <div className="border-2 border-black rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-bold text-black uppercase">A. BASIC FARMER INFORMATION</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><label className="block text-xs font-bold mb-1">Last Name</label><input type="text" placeholder="e.g. Dela Cruz" value={pcicForm.applicantName?.lastName || ""} onChange={(e) => setPcicForm(p => ({ ...p, applicantName: { ...p.applicantName, lastName: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold mb-1">First Name</label><input type="text" placeholder="e.g. Juan" value={pcicForm.applicantName?.firstName || ""} onChange={(e) => setPcicForm(p => ({ ...p, applicantName: { ...p.applicantName, firstName: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold mb-1">Middle Name</label><input type="text" placeholder="Optional" value={pcicForm.applicantName?.middleName || ""} onChange={(e) => setPcicForm(p => ({ ...p, applicantName: { ...p.applicantName, middleName: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold mb-1">Suffix (Jr., Sr., III)</label><input type="text" placeholder="Optional" value={pcicForm.applicantName?.suffix || ""} onChange={(e) => setPcicForm(p => ({ ...p, applicantName: { ...p.applicantName, suffix: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div><label className="block text-xs font-bold mb-1">No. & Street/Sitio</label><input type="text" placeholder="e.g. 123 Purok 10-A" value={pcicForm.address?.street || ""} onChange={(e) => setPcicForm(p => ({ ...p, address: { ...p.address, street: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold mb-1">Barangay</label><input type="text" placeholder="e.g. Maniki" value={pcicForm.address?.barangay || ""} onChange={(e) => setPcicForm(p => ({ ...p, address: { ...p.address, barangay: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold mb-1">Municipality/City</label><input type="text" placeholder="e.g. Kapalong" value={pcicForm.address?.municipality || ""} onChange={(e) => setPcicForm(p => ({ ...p, address: { ...p.address, municipality: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold mb-1">Province</label><input type="text" placeholder="e.g. Davao del Norte" value={pcicForm.address?.province || ""} onChange={(e) => setPcicForm(p => ({ ...p, address: { ...p.address, province: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div><label className="block text-xs font-bold mb-1">Contact Number</label><input type="text" placeholder="e.g. 09123456789" value={pcicForm.contactNumber || ""} onChange={(e) => handlePcicFormChange("contactNumber", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold mb-1">Date of Birth</label><input type="date" value={pcicForm.dateOfBirth ? (typeof pcicForm.dateOfBirth === "string" && pcicForm.dateOfBirth.length <= 10 ? pcicForm.dateOfBirth : new Date(pcicForm.dateOfBirth).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicFormChange("dateOfBirth", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold mb-1">Sex</label><select value={pcicForm.sex || ""} onChange={(e) => handlePcicFormChange("sex", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2">Are you part of a special sector? (tick as many)</label>
                  <div className="flex flex-wrap gap-4">
                    {["PWD", "Senior Citizen", "Youth", "Indigenous People"].map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={(pcicForm.specialSector || []).includes(s)} onChange={(e) => setPcicForm(p => ({ ...p, specialSector: e.target.checked ? [...(p.specialSector || []), s] : (p.specialSector || []).filter(x => x !== s) }))} className="w-4 h-4" />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                    <span className="text-sm">Indicate tribe:</span>
                    <input type="text" placeholder="If Indigenous People" value={pcicForm.tribe || ""} onChange={(e) => handlePcicFormChange("tribe", e.target.value)} className="border border-black p-1 rounded w-40 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold mb-1">Civil Status</label><select value={pcicForm.civilStatus || ""} onChange={(e) => handlePcicFormChange("civilStatus", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm"><option value="">Select</option><option value="Single">Single</option><option value="Married">Married</option><option value="Widowed">Widowed</option><option value="Separated">Separated</option></select></div>
                  {pcicForm.civilStatus === "Married" && <div><label className="block text-xs font-bold mb-1">Name of Spouse</label><input type="text" placeholder="Full name of spouse" value={pcicForm.spouseName || ""} onChange={(e) => handlePcicFormChange("spouseName", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" /></div>}
                </div>
                <div className="border border-black rounded p-3 space-y-2">
                  <label className="block text-xs font-bold">Name of Legal Beneficiary</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="font-semibold">Primary Beneficiary</span><span></span>
                    <input placeholder="Last Name" value={pcicForm.beneficiary?.primary?.lastName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, lastName: e.target.value } } }))} className="border border-black p-1 rounded" />
                    <input placeholder="First Name" value={pcicForm.beneficiary?.primary?.firstName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, firstName: e.target.value } } }))} className="border border-black p-1 rounded" />
                    <input placeholder="Middle Name" value={pcicForm.beneficiary?.primary?.middleName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, middleName: e.target.value } } }))} className="border border-black p-1 rounded" />
                    <input placeholder="Relationship" value={pcicForm.beneficiary?.primary?.relationship || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, relationship: e.target.value } } }))} className="border border-black p-1 rounded" />
                    <input type="date" placeholder="Birthdate" value={pcicForm.beneficiary?.primary?.birthdate ? (typeof pcicForm.beneficiary.primary.birthdate === "string" && pcicForm.beneficiary.primary.birthdate.length <= 10 ? pcicForm.beneficiary.primary.birthdate : new Date(pcicForm.beneficiary.primary.birthdate).toISOString().slice(0, 10)) : ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, birthdate: e.target.value } } }))} className="border border-black p-1 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <span className="font-semibold">Guardian</span><span></span>
                    <input placeholder="Last Name" value={pcicForm.beneficiary?.guardian?.lastName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, guardian: { ...p.beneficiary?.guardian, lastName: e.target.value } } }))} className="border border-black p-1 rounded" />
                    <input placeholder="First Name" value={pcicForm.beneficiary?.guardian?.firstName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, guardian: { ...p.beneficiary?.guardian, firstName: e.target.value } } }))} className="border border-black p-1 rounded" />
                    <input placeholder="Relationship" value={pcicForm.beneficiary?.guardian?.relationship || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, guardian: { ...p.beneficiary?.guardian, relationship: e.target.value } } }))} className="border border-black p-1 rounded" />
                    <input type="date" value={pcicForm.beneficiary?.guardian?.birthdate ? (typeof pcicForm.beneficiary.guardian.birthdate === "string" && pcicForm.beneficiary.guardian.birthdate.length <= 10 ? pcicForm.beneficiary.guardian.birthdate : new Date(pcicForm.beneficiary.guardian.birthdate).toISOString().slice(0, 10)) : ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, guardian: { ...p.beneficiary?.guardian, birthdate: e.target.value } } }))} className="border border-black p-1 rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Indemnity Payment option</label>
                  <select value={pcicForm.indemnityPaymentOption || ""} onChange={(e) => handlePcicFormChange("indemnityPaymentOption", e.target.value)} className="w-full max-w-xs border-2 border-black p-2 rounded text-sm">
                    <option value="">Select</option>
                    <option value="LandBank or DBP">LandBank or DBP</option>
                    <option value="Palawan Express">Palawan Express</option>
                    <option value="GCash">GCash</option>
                    <option value="Others">Others (Please specify)</option>
                  </select>
                  {pcicForm.indemnityPaymentOption === "Others" && <input type="text" placeholder="Specify" value={pcicForm.indemnityOther || ""} onChange={(e) => handlePcicFormChange("indemnityOther", e.target.value)} className="mt-1 w-full max-w-xs border border-black p-2 rounded text-sm" />}
                </div>
              </div>

              {/* B. FARM INFORMATION - Add many lots */}
              <div className="border-2 border-black rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-black uppercase">B. FARM INFORMATION</h3>
                  <button type="button" onClick={handleAddLot} className="bg-lime-400 border-2 border-black text-black px-3 py-1 rounded font-bold text-sm">+ Add Lot</button>
                </div>
                {(pcicForm.lots || []).map((lot, idx) => (
                  <div key={idx} className="border border-black rounded p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between"><span className="font-semibold text-sm">Lot {idx + 1}</span>{(pcicForm.lots || []).length > 1 && <button type="button" onClick={() => handleRemoveLot(idx)} className="text-red-600 text-sm">Remove</button>}</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div><label className="text-xs font-bold">Barangay</label><input type="text" placeholder="e.g. Maniki" value={lot.farmLocation?.barangay || ""} onChange={(e) => handlePcicLotChange(idx, "farmLocation.barangay", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">Municipality/City</label><input type="text" value={lot.farmLocation?.municipality || ""} onChange={(e) => handlePcicLotChange(idx, "farmLocation.municipality", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">Province</label><input type="text" value={lot.farmLocation?.province || ""} onChange={(e) => handlePcicLotChange(idx, "farmLocation.province", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div><label className="text-xs font-bold">North</label><input type="text" value={lot.boundaries?.north || ""} onChange={(e) => handlePcicLotChange(idx, "boundaries.north", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">East</label><input type="text" value={lot.boundaries?.east || ""} onChange={(e) => handlePcicLotChange(idx, "boundaries.east", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">South</label><input type="text" value={lot.boundaries?.south || ""} onChange={(e) => handlePcicLotChange(idx, "boundaries.south", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">West</label><input type="text" value={lot.boundaries?.west || ""} onChange={(e) => handlePcicLotChange(idx, "boundaries.west", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div><label className="text-xs font-bold">Geo Ref ID (DA-RSBSA) or Farm ID (PCIC)</label><input type="text" placeholder="Optional ID" value={lot.geoRefId || ""} onChange={(e) => handlePcicLotChange(idx, "geoRefId", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">Variety</label><input type="text" placeholder="e.g. IR64" value={lot.variety || ""} onChange={(e) => handlePcicLotChange(idx, "variety", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">Planting Method</label><select value={lot.plantingMethod || ""} onChange={(e) => handlePcicLotChange(idx, "plantingMethod", e.target.value)} className="w-full border border-black p-1 rounded text-sm"><option value="">Select</option><option value="Direct Seeded">Direct Seeded</option><option value="Transplanted">Transplanted</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div><label className="text-xs font-bold">Date of Sowing</label><input type="date" value={lot.dateOfSowing ? (typeof lot.dateOfSowing === "string" && lot.dateOfSowing.length <= 10 ? lot.dateOfSowing : new Date(lot.dateOfSowing).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicLotChange(idx, "dateOfSowing", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">Date of Planting</label><input type="date" value={lot.dateOfPlanting ? (typeof lot.dateOfPlanting === "string" && lot.dateOfPlanting.length <= 10 ? lot.dateOfPlanting : new Date(lot.dateOfPlanting).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicLotChange(idx, "dateOfPlanting", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">Date of Harvest</label><input type="date" value={lot.dateOfHarvest ? (typeof lot.dateOfHarvest === "string" && lot.dateOfHarvest.length <= 10 ? lot.dateOfHarvest : new Date(lot.dateOfHarvest).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicLotChange(idx, "dateOfHarvest", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">No. of Trees/Hills (HVC only)</label><input type="text" value={lot.numberOfTreesHills || ""} onChange={(e) => handlePcicLotChange(idx, "numberOfTreesHills", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div><label className="text-xs font-bold">Land Category</label><select value={lot.landCategory || ""} onChange={(e) => handlePcicLotChange(idx, "landCategory", e.target.value)} className="w-full border border-black p-1 rounded text-sm"><option value="">Select</option><option value="Irrigated">Irrigated</option><option value="Non-Irrigated">Non-Irrigated</option></select></div>
                      <div><label className="text-xs font-bold">Tenurial Status</label><select value={lot.tenurialStatus || ""} onChange={(e) => handlePcicLotChange(idx, "tenurialStatus", e.target.value)} className="w-full border border-black p-1 rounded text-sm"><option value="">Select</option><option value="Owner">Owner</option><option value="Lessee">Lessee</option></select></div>
                      <div><label className="text-xs font-bold">Desired Amount of Cover (PHP)</label><input type="number" placeholder="e.g. 50000" value={lot.desiredAmountOfCover ?? ""} onChange={(e) => handlePcicLotChange(idx, "desiredAmountOfCover", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">Lot Area (ha)</label><input type="number" step="0.01" placeholder="e.g. 1.0" value={lot.lotArea ?? ""} onChange={(e) => handlePcicLotChange(idx, "lotArea", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* C. CERTIFICATION AND DATA PRIVACY */}
              <div className="border-2 border-black rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-bold text-black uppercase">C. CERTIFICATION AND DATA PRIVACY CONSENT STATEMENT</h3>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!pcicForm.certificationConsent} onChange={(e) => handlePcicFormChange("certificationConsent", e.target.checked)} className="mt-1 w-4 h-4" />
                  <span className="text-sm">I certify that the statements made herein are true and correct. I understand that PCIC may reject or void this application if any information is found to be false.</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!pcicForm.deedOfAssignmentConsent} onChange={(e) => handlePcicFormChange("deedOfAssignmentConsent", e.target.checked)} className="mt-1 w-4 h-4" />
                  <span className="text-sm">Deed of Assignment for borrowing farmers (If applicable)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold mb-1">Signature / Thumb Mark (upload image)</label><input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => handlePcicFormChange("signatureImage", r.result); r.readAsDataURL(f) } }} className="w-full border-2 border-black p-2 rounded text-sm" />{pcicForm.signatureImage && <img src={pcicForm.signatureImage} alt="Signature" className="mt-2 h-16 object-contain border border-black rounded" />}</div>
                  <div><label className="block text-xs font-bold mb-1">Date</label><input type="date" value={pcicForm.certificationDate ? (typeof pcicForm.certificationDate === "string" && pcicForm.certificationDate.length <= 10 ? pcicForm.certificationDate : new Date(pcicForm.certificationDate).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicFormChange("certificationDate", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
                </div>
              </div>

              {/* D. COVERAGE (FOR PCIC USE ONLY) */}
              <div className="border-2 border-black rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-bold text-black uppercase">D. COVERAGE (FOR PCIC USE ONLY)</h3>
                <label className="block text-xs font-bold mb-2">D.1 Source of Premium</label>
                <div className="flex flex-wrap gap-4">
                  {["Non-Subsidized/Regular", "Subsidized/NCIFF - NCIPs No.", "Subsidized/RSBSA - Ref. No.", "Others"].map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(pcicForm.sourceOfPremium || []).includes(s)} onChange={(e) => setPcicForm(p => ({ ...p, sourceOfPremium: e.target.checked ? [...(p.sourceOfPremium || []), s] : (p.sourceOfPremium || []).filter(x => x !== s) }))} className="w-4 h-4" />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                  {(pcicForm.sourceOfPremium || []).includes("Others") && <input type="text" placeholder="Specify" value={pcicForm.sourceOfPremiumOther || ""} onChange={(e) => handlePcicFormChange("sourceOfPremiumOther", e.target.value)} className="border border-black p-2 rounded w-48 text-sm" />}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t-2 border-black">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 font-bold shadow-lg flex items-center justify-center disabled:opacity-50"><Shield className="mr-2 h-5 w-5" />{loading ? 'Creating...' : 'Create Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Insurance Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">🛡️ Apply Insurance</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-black hover:bg-lime-200 rounded-full p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 bg-white">
              <div className="mb-4 p-3 bg-lime-50 border-2 border-black rounded-lg">
                <p className="text-sm font-semibold text-black mb-1">
                  {selectedRecord.cropType} crop by {getFarmerName(selectedRecord.farmerId)}
                </p>
                <p className="text-xs text-yellow-600">
                  {getRemainingDays(selectedRecord)} days remaining to apply insurance
                </p>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                handleApplyInsurance(selectedRecord._id, {
                  agency: formData.get('agency')
                })
                setShowEditModal(false)
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Insurance Agency
                  </label>
                  <select
                    name="agency"
                    required
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                  >
                    <option value="">Select Agency</option>
                    <option value="DA-PCIC">DA-PCIC (Philippine Crop Insurance Corporation)</option>
                    <option value="DA">DA (Department of Agriculture)</option>
                    <option value="Private Insurance">Private Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 font-bold"
                  >
                    Apply Insurance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal – PCIC APPLICATION FOR CROP INSURANCE template (read-only) */}
      {showDetailsModal && selectedRecord && (() => {
        const d = getCropInsuranceDetailsDisplayData(selectedRecord, farmers)
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
              <button
                onClick={() => setShowDetailsModal(false)}
                  className="text-black hover:bg-lime-200 rounded-full p-1 shrink-0"
              >
                <X size={24} />
              </button>
            </div>
              <div className="p-5 space-y-6 text-sm">
                {/* Top section: CROPP, Application Type, Total Area, Farmer Category, Date */}
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

                {/* Section A: BASIC FARMER INFORMATION */}
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

                {/* Section B: FARM INFORMATION (up to 3 lots) */}
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

                {/* Section C: CERTIFICATION AND DATA PRIVACY CONSENT */}
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

                {/* Section D: COVERAGE (FOR PCIC USE ONLY) */}
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

                {/* Status & evidence (kept for admin context) */}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">⚠️ Confirm Delete</h2>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setRecordToDelete(null)
                }}
                className="text-black hover:bg-lime-200 rounded-full p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 bg-white">
              <p className="text-black mb-6 text-center">
                Are you sure you want to delete this crop insurance record? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setRecordToDelete(null)
                  }}
                  className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRecord}
                  className="flex-1 bg-red-500 border-2 border-black text-white px-4 py-3 rounded-lg hover:bg-red-600 font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CropInsuranceManagement