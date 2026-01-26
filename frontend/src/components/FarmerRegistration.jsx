"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  UserPlus,
  Users,
  Search,
  CheckCircle,
  MapPin,
  Plus,
  User,
  X,
  Calendar,
  FileText,
  Layers,
  AlertTriangle,
  Shield,
  Key,
  Eye,
  Download,
} from "lucide-react"
// Image assets removed - no longer used in this component
import {
  useRegisterFarmer,
  useFarmers,
  useDeleteFarmer,
  useCropInsurance,
  useUpdateFarmer
} from '../hooks/useAPI'
import { 
  saveFarmerProfileImage, 
  getAllFarmerProfileImages,
  API_BASE_URL
} from '../api'
// Note: Notifications are now handled by backend API
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { getCropTypeDistributionFromInsurance } from '../utils/cropTypeDistribution'
import SimpleMapPicker from './SimpleMapPicker'
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthTextColor, getPasswordStrengthLabel } from '../utils/passwordValidator'
import { generateFarmerRegistrationReportPDF } from '../utils/farmerReportPdfGenerator'
import { toast } from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend)

const FarmerRegistration = ({
  formData,
  setFormData,
  showMapModal,
  setShowMapModal,
  mapMode,
  setMapMode,
  selectedLocation,
  setSelectedLocation,
  onTabSwitch,
}) => {
  // React Query hooks
  const { data: farmers = [], isLoading: farmersLoading, refetch: refetchFarmers } = useFarmers()
  const { data: allCropInsurance = [], isLoading: cropInsuranceLoading } = useCropInsurance()
  const registerFarmerMutation = useRegisterFarmer()
  const deleteFarmerMutation = useDeleteFarmer()
  const updateFarmerMutation = useUpdateFarmer()
  // Local state for farmer registration
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [selectedFarmerForPassword, setSelectedFarmerForPassword] = useState(null)
  const [passwordForm, setPasswordForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [passwordConfirmationData, setPasswordConfirmationData] = useState({
    type: '', // 'confirm', 'error', 'success'
    message: '',
    onConfirm: null
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [timePeriod, setTimePeriod] = useState("monthly") // monthly or quarterly
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  
  // Profile image state
  const [profileImages, setProfileImages] = useState({})
  const [profileImageFiles, setProfileImageFiles] = useState({})
  const [profileImagePreviews, setProfileImagePreviews] = useState({})
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedFarmerForProfile, setSelectedFarmerForProfile] = useState(null)
  const [showProfileImageValidation, setShowProfileImageValidation] = useState(false)
  const [profileImageValidationData, setProfileImageValidationData] = useState({
    type: '', // 'error', 'warning'
    message: '',
    onConfirm: null
  })
  
  // Filter dropdown state
  const [showCropFilter, setShowCropFilter] = useState(false)
  const [showBarangayFilter, setShowBarangayFilter] = useState(false)
  const [showCertFilter, setShowCertFilter] = useState(false)
  
  // Report state
  const [showReport, setShowReport] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  
  // Chart refs for PDF generation
  const areaChartRef = useRef(null)
  const doughnutChartRef = useRef(null)
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false)
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState(null)

  const buildProfileImageUrl = (farmerId, version = Date.now()) => {
    if (!farmerId) return ''
    return `${API_BASE_URL}/api/farmers/profile-image/${farmerId}?v=${version || Date.now()}`
  }

  const revokeObjectUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  const clearProfileImageDraft = (farmerId) => {
    if (!farmerId) return

    setProfileImageFiles((prev) => {
      if (!prev[farmerId]) return prev
      const updated = { ...prev }
      delete updated[farmerId]
      return updated
    })

    setProfileImagePreviews((prev) => {
      const existingUrl = prev[farmerId]
      if (!existingUrl) return prev
      revokeObjectUrl(existingUrl)
      const updated = { ...prev }
      delete updated[farmerId]
      return updated
    })
  }

  // Define selectedLocation and setSelectedLocation if needed for registration
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showFarmerDetails, setShowFarmerDetails] = useState(false);
  const [farmerToDelete, setFarmerToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Add state for crop insurance-based crop type distribution
  const [insuranceCropTypeDistribution, setInsuranceCropTypeDistribution] = useState({})
  
  // Group crop insurance data by farmer ID
  const cropInsuranceData = useMemo(() => {
    const groupedData = {}
    allCropInsurance.forEach(insurance => {
      const farmerId = insurance.farmerId
      console.log('Processing insurance for farmer ID:', farmerId, 'Crop:', insurance.cropType)
      if (!groupedData[farmerId]) {
        groupedData[farmerId] = []
      }
      groupedData[farmerId].push(insurance)
    })
    console.log('Grouped crop insurance data:', groupedData)
    return groupedData
  }, [allCropInsurance])

  // Fetch and update crop type distribution from insurance records
  useEffect(() => {
    async function fetchDistribution() {
      const dist = await getCropTypeDistributionFromInsurance()
      setInsuranceCropTypeDistribution(dist)
    }
    fetchDistribution()
  }, [])

  // Function to get insured crops for a farmer
  const getInsuredCrops = (farmer) => {
    const farmerId = farmer._id || farmer.id;
    console.log('Getting insured crops for farmer:', farmer.farmerName, 'ID:', farmerId);
    console.log('Available crop insurance data:', cropInsuranceData);
    
    // Try to find insurance records by different ID formats
    let insuranceRecords = cropInsuranceData[farmerId] || [];
    
    // If no records found, try matching by farmer name as fallback
    if (insuranceRecords.length === 0) {
      const farmerName = farmer.farmerName || `${farmer.firstName || ''} ${farmer.middleName || ''} ${farmer.lastName || ''}`.trim();
      console.log('Trying to match by farmer name:', farmerName);
      
      // Search through all crop insurance data for this farmer name
      Object.values(cropInsuranceData).flat().forEach(insurance => {
        if (insurance.farmerName === farmerName || 
            insurance.farmerId?.firstName === farmer.firstName ||
            insurance.farmerId?.lastName === farmer.lastName) {
          insuranceRecords.push(insurance);
        }
      });
    }
    
    console.log('Insurance records for this farmer:', insuranceRecords);
    
    if (insuranceRecords.length === 0) {
      return farmer.cropType || "No crops insured";
    }
    
    // Get unique crop types from insurance records
    const insuredCrops = [...new Set(insuranceRecords.map(record => record.cropType))];
    console.log('Insured crops for this farmer:', insuredCrops);
    return insuredCrops.join(", ");
  };

  // Function to get all available crop types from both farmers and crop insurance
  const getAllCropTypes = () => {
    const farmerCrops = farmers.map(f => f.cropType).filter(Boolean);
    const insuranceCrops = allCropInsurance.map(ci => ci.cropType).filter(Boolean);
    const allCrops = [...new Set([...farmerCrops, ...insuranceCrops])];
    return allCrops.sort();
  };

  // Generate time-based data for the chart
  const generateTimeBasedData = () => {
    const currentYear = selectedYear;
    
    if (timePeriod === "monthly") {
      // Generate monthly data for the selected year
      const monthlyData = [];
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      for (let month = 0; month < 12; month++) {
        const farmersInMonth = farmers.filter(farmer => {
          // Handle different possible date field names and formats
          const registrationDate = farmer.registrationDate || farmer.createdAt || farmer.date || farmer.registeredAt;
          if (!registrationDate) return false;
          
          let regDate;
          try {
            regDate = new Date(registrationDate);
            // Check if the date is valid
            if (isNaN(regDate.getTime())) return false;
          } catch {
            return false;
          }
          
          return regDate.getFullYear() === currentYear && regDate.getMonth() === month;
        }).length;
        
        monthlyData.push({
          period: monthNames[month],
          month: month + 1,
          count: farmersInMonth,
          cumulative: monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].cumulative + farmersInMonth : farmersInMonth
        });
      }
      
      return monthlyData;
    } else {
      // Generate quarterly data for the selected year
      const quarterlyData = [];
      const quarterNames = ["Q1", "Q2", "Q3", "Q4"];
      
      for (let quarter = 0; quarter < 4; quarter++) {
        const startMonth = quarter * 3;
        const endMonth = startMonth + 2;
        
        const farmersInQuarter = farmers.filter(farmer => {
          // Handle different possible date field names and formats
          const registrationDate = farmer.registrationDate || farmer.createdAt || farmer.date || farmer.registeredAt;
          if (!registrationDate) return false;
          
          let regDate;
          try {
            regDate = new Date(registrationDate);
            // Check if the date is valid
            if (isNaN(regDate.getTime())) return false;
          } catch {
            return false;
          }
          
          const month = regDate.getMonth();
          return regDate.getFullYear() === currentYear && month >= startMonth && month <= endMonth;
        }).length;
        
        quarterlyData.push({
          period: quarterNames[quarter],
          quarter: quarter + 1,
          count: farmersInQuarter,
          cumulative: quarterlyData.length > 0 ? quarterlyData[quarterlyData.length - 1].cumulative + farmersInQuarter : farmersInQuarter
        });
      }
      
      return quarterlyData;
    }
  };

  // Generate PDF Report
  const handleGeneratePDF = async () => {
    if (!showReport) {
      toast.error('Please generate the report first to view charts')
      return
    }
    
    setIsGeneratingPDF(true)
    try {
      // Wait a bit for charts to fully render
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const timeBasedData = generateTimeBasedData()
      
      await generateFarmerRegistrationReportPDF({
        totalFarmers: farmers.length,
        timeBasedData,
        cropTypeDistribution: insuranceCropTypeDistribution,
        selectedYear,
        timePeriod,
        chartRefs: {
          areaChartRef,
          doughnutChartRef
        }
      })
      
      toast.success('PDF report generated successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error(error.message || 'Failed to generate PDF report. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    
    // Validate password in real-time
    if (name === 'password' && value) {
      const validation = validatePassword(value)
      setPasswordValidation(validation)
    } else if (name === 'password' && !value) {
      setPasswordValidation(null)
    }
  }

  // Fetch farmers from backend on mount - now handled by React Query
  // useEffect(() => {
  //   fetchFarmers()
  //     .then(setFarmers)
  //     .catch((err) => console.error('Failed to fetch farmers:', err));
  // }, [setFarmers]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    const newFarmer = {
      ...formData,
      farmerName: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
      location: selectedLocation,
      registrationDate: new Date().toISOString(), // Add registration date
    }
    try {
      await registerFarmerMutation.mutateAsync(newFarmer)
      
      // Note: Notifications are now created by backend API automatically
      
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        birthday: "",
        gender: "",
        contactNum: "",
        address: "",
        cropArea: "",
        isCertified: false,
        periodFrom: "",
        periodTo: "",
        username: "",
        password: "",
        rsbsaRegistered: false,
      })
      setSelectedLocation(null)
      setShowRegisterForm(false)
    } catch (err) {
      console.error('Registration error:', err);
      // Note: Error feedback handled by parent component or backend API
      console.error(err)
    }
  }


  // Handle location view - navigate to dashboard map
  const handleLocationView = (farmer) => {
    // Store farmer location data for dashboard map
    const farmerLocationData = {
      farmerId: farmer._id || farmer.id,
      farmerName: farmer.farmerName || `${farmer.firstName || ''} ${farmer.middleName || ''} ${farmer.lastName || ''}`.replace(/  +/g, ' ').trim(),
      location: farmer.location,
      cropType: farmer.cropType,
      address: farmer.address
    }
    
    // Store in localStorage for dashboard to access
    localStorage.setItem('selectedFarmerLocation', JSON.stringify(farmerLocationData))
    
    // Note: Notifications handled by backend API
    console.log('Location view:', `Viewing location for ${farmerLocationData.farmerName} on dashboard map`)
    
    // Navigate to dashboard (this will be handled by the parent component)
    // The dashboard will check for selectedFarmerLocation in localStorage
    console.log('Location view requested for farmer:', farmerLocationData)
  }

  useEffect(() => {
    if (selectedLocation) {
      // Optionally, trigger reverse geocode here if not handled by parent
      // setFormData with address and lotNumber if needed
    }
  }, [selectedLocation])

  // 1. Compute filteredFarmers so that by default, all farmers are shown unless a filter is explicitly set
  const filteredFarmers = farmers.filter((farmer) => {
    // Certification
    if (formData.isCertified !== "" && formData.isCertified !== undefined && formData.isCertified !== null) {
      if (farmer.isCertified !== formData.isCertified) return false;
    }
    // Crop Type
    if (formData.cropType && formData.cropType !== "") {
      if ((farmer.cropType || "") !== formData.cropType) return false;
    }
    // Barangay
    if (formData.barangay && formData.barangay !== "") {
      const farmerBarangay = (farmer.address || '').split(",")[0]?.trim();
      if (farmerBarangay !== formData.barangay) return false;
    }
    // Search
    if (searchQuery && searchQuery !== "") {
      const farmerName = farmer.farmerName || `${farmer.firstName || ''} ${farmer.middleName || ''} ${farmer.lastName || ''}`.replace(/  +/g, ' ').trim();
      if (!farmerName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFarmers = filteredFarmers.slice(startIndex, endIndex)
  const selectedProfileId = selectedFarmerForProfile?._id || selectedFarmerForProfile?.id
  const selectedProfileImageSrc = selectedProfileId
    ? (profileImagePreviews[selectedProfileId] || profileImages[selectedProfileId])
    : null

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [formData.cropType, formData.barangay, formData.isCertified, searchQuery])

  // Load profile images from MongoDB on component mount
  useEffect(() => {
    const loadProfileImages = async () => {
      try {
        const response = await getAllFarmerProfileImages();
        if (response.success && response.profileImages) {
          const formattedImages = {};
          Object.entries(response.profileImages).forEach(([farmerId, imageData]) => {
            if (!imageData || !imageData.hasImage) return;
            if (imageData.legacyData) {
              formattedImages[farmerId] = imageData.legacyData;
            } else {
              formattedImages[farmerId] = buildProfileImageUrl(farmerId, imageData.version);
            }
          });
          setProfileImages(formattedImages);
        }
      } catch (error) {
        console.error('Error loading profile images:', error);
      }
    };
    
    loadProfileImages();
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowCropFilter(false);
        setShowBarangayFilter(false);
        setShowCertFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [])

  return (
    <div className="mt-6 bg-white rounded-lg p-6">
      {/* Register Farmer Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-800">Farmer Registration</h2>
        </div>
        <div className="flex gap-4 flex-wrap justify-end">
          <button
            className="bg-lime-400 text-black px-4 py-2 rounded-lg hover:bg-lime-500 transition-colors flex items-center justify-center font-bold uppercase tracking-wide"
            onClick={() => setShowRegisterForm(true)}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Register New Farmer
          </button>
          <button
            className="bg-lime-400 text-black px-4 py-2 rounded-lg hover:bg-lime-500 transition-colors flex items-center justify-center shadow-sm font-semibold"
            onClick={() => {
              if (onTabSwitch) {
                onTabSwitch('crop-insurance')
              }
            }}
          >
            <Shield className="mr-2 h-5 w-5" />
            Crop Insurance
          </button>
          <button
            className="text-lime-600 px-4 py-2 rounded-lg hover:bg-lime-50 transition-colors flex items-center justify-center border border-lime-600"
            onClick={() => {
              console.log('Manual refresh triggered')
              refetchFarmers()
            }}
            disabled={farmersLoading || cropInsuranceLoading}
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {farmersLoading || cropInsuranceLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button
            className="bg-lime-400 text-black px-4 py-2 rounded-lg hover:bg-lime-500 transition-colors flex items-center justify-center shadow-sm font-semibold"
            onClick={() => setShowReport(!showReport)}
          >
            <FileText className="mr-2 h-5 w-5" />
            {showReport ? 'Hide Report' : 'Generate Report'}
          </button>
          {showReport && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF Report
                </>
              )}
            </button>
          )}
        </div>
      </div>



      {/* Chart Visualizations Section - Only show when report is generated */}
      {showReport && (
        <div className="w-full flex flex-col md:flex-row gap-6 mb-6">
          {/* Area Chart: Registered Farmers Over Time */}
          <div className="flex-1 p-6 border-2 border-black rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <Users className="h-5 w-5 text-black" /> Registered Farmers Over Time
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-black">Period:</span>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="px-3 py-1 text-sm border-2 border-black rounded-md focus:outline-none bg-lime-400 text-black font-semibold"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1 text-sm border-2 border-black rounded-md focus:outline-none bg-lime-400 text-black font-semibold"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-64" ref={areaChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={generateTimeBasedData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis 
                    dataKey="period" 
                    stroke="#000000" 
                    fontSize={12}
                    tick={{ fontSize: 10, fill: '#000000' }}
                    axisLine={{ stroke: '#000000' }}
                  />
                  <YAxis 
                    stroke="#000000" 
                    fontSize={12} 
                    allowDecimals={false}
                    tick={{ fill: '#000000' }}
                    axisLine={{ stroke: '#000000' }}
                    label={{ value: 'Number of Registered Farmers', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#000000' } }}
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [
                      `${value} farmers`, 
                      name === 'cumulative' ? 'Total Registered' : 'New Registrations'
                    ]}
                    labelFormatter={(label) => `${label} ${selectedYear}`}
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', color: '#000' }}
                    labelStyle={{ color: '#000' }}
                  />
                  <defs>
                    <linearGradient id="farmerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#bef264" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#84cc16" 
                    strokeWidth={3}
                    fill="url(#farmerGradient)" 
                    name="cumulative"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#65a30d" 
                    strokeWidth={2}
                    fill="#a3e635" 
                    fillOpacity={0.4} 
                    name="count"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Donut Pie Chart: Crop Type Distribution */}
          <div className="flex-1 p-6 border-2 border-black rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-black flex items-center gap-2">
              <Layers className="h-5 w-5 text-black" /> Crop Type Distribution
            </h3>
            <div className="h-64 flex items-center justify-center" ref={doughnutChartRef}>
              <Doughnut
                data={{
                  labels: Object.keys(insuranceCropTypeDistribution),
                  datasets: [
                    {
                      data: Object.values(insuranceCropTypeDistribution),
                      backgroundColor: [
                        '#84cc16', '#a3e635', '#bef264', '#d9f99d', '#ecfccb', '#65a30d', '#4d7c0f', '#365314', '#fef08a', '#fde68a', '#fef3c7', '#fef9c3', '#fffbeb'
                      ],
                      borderColor: '#000000',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: { 
                      display: true, 
                      position: 'bottom', 
                      labels: { 
                        boxWidth: 16,
                        color: '#000000',
                        font: { family: 'sans-serif', size: 12 }
                      } 
                    },
                    tooltip: { 
                      enabled: true,
                      backgroundColor: '#fff',
                      titleColor: '#000',
                      bodyColor: '#000',
                      borderColor: '#000',
                      borderWidth: 2
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Farm List Title */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">Farm List</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold">{farmers.length}</span> farmers
          </div>
          {/* Crop Type Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCropFilter(!showCropFilter)}
              className="bg-black text-lime-300 px-3 py-2 rounded-lg border border-lime-400 hover:bg-lime-300 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-lime-300 text-sm font-semibold"
            >
              <span className="text-sm font-medium">
                {formData.cropType || "All Crops"}
              </span>
              <svg className="ml-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCropFilter && (
              <div className="absolute z-10 right-0 mt-1 w-48 bg-white border border-black rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div
                  className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, cropType: "" }));
                    setShowCropFilter(false);
                  }}
                >
                  All Crops
                </div>
                {getAllCropTypes().map((crop, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, cropType: crop }));
                      setShowCropFilter(false);
                    }}
                  >
                    {crop}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Barangay Filter */}
          <div className="relative">
            <button
              onClick={() => setShowBarangayFilter(!showBarangayFilter)}
              className="bg-black text-lime-300 px-3 py-2 rounded-lg border border-lime-400 hover:bg-lime-300 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-lime-300 text-sm font-semibold"
            >
              <span className="text-sm font-medium">
                {formData.barangay || "All Barangays"}
              </span>
              <svg className="ml-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showBarangayFilter && (
              <div className="absolute z-10 right-0 mt-1 w-48 bg-white border border-black rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div
                  className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, barangay: "" }));
                    setShowBarangayFilter(false);
                  }}
                >
                  All Barangays
                </div>
              {[...new Set(farmers.map((f) => f.address?.split(",")[0]?.trim()).filter(Boolean))].map((barangay, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, barangay: barangay }));
                      setShowBarangayFilter(false);
                    }}
                  >
                    {barangay}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Certification Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCertFilter(!showCertFilter)}
              className="bg-black text-lime-300 px-3 py-2 rounded-lg border border-lime-400 hover:bg-lime-300 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-lime-300 text-sm font-semibold"
            >
              <span className="text-sm font-medium">
                {formData.isCertified === true ? "Certified" : formData.isCertified === false ? "Not Certified" : "All Certifications"}
              </span>
              <svg className="ml-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCertFilter && (
              <div className="absolute z-10 right-0 mt-1 w-48 bg-white border border-black rounded-lg shadow-lg">
                <div
                  className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, isCertified: "" }));
                    setShowCertFilter(false);
                  }}
                >
                  All Certifications
                </div>
                <div
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, isCertified: true }));
                    setShowCertFilter(false);
                  }}
                >
                  Certified
                </div>
                <div
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, isCertified: false }));
                    setShowCertFilter(false);
                  }}
                >
                  Not Certified
                </div>
              </div>
            )}
          </div>
          
          {/* Search Filter - Regular Input */}
          <div className="relative">
            <input
              type="text"
              className="bg-black text-lime-300 border border-lime-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 text-sm font-semibold placeholder-lime-500 placeholder-opacity-80 w-40"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Farm List Table */}
      {/* 2. Render the table with full responsiveness and no overflow */}
      {filteredFarmers.length > 0 ? (
        <div className="w-full overflow-x-auto bg-white rounded-xl shadow-md border-2 border-lime-200">
          <table className="min-w-full divide-y divide-gray-200 table-auto bg-white">
            <thead className="bg-gradient-to-r from-lime-50 to-lime-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg whitespace-normal break-words">Profile</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-normal break-words">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-normal break-words">Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-normal break-words">Crop</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-normal break-words">Lot No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-normal break-words">Lot Area</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-normal break-words">Certified</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-normal break-words">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg whitespace-normal break-words">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedFarmers.map((farmer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">
                    {profileImages[farmer._id || farmer.id] ? (
                      <img 
                        src={profileImages[farmer._id || farmer.id]} 
                        alt="Profile" 
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-normal break-words text-sm font-medium text-gray-900">{
                    farmer.farmerName || `${farmer.firstName || ''} ${farmer.middleName || ''} ${farmer.lastName || ''}`.replace(/  +/g, ' ').trim()
                  }</td>
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">{farmer.address}</td>
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">
                    {cropInsuranceLoading ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : (
                      <span className="font-medium text-green-600">
                        {getInsuredCrops(farmer)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">{farmer.lotNumber}</td>
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">{farmer.lotArea}</td>
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">{farmer.isCertified ? (<span className="px-2 py-1 bg-green-100 text-lime-800 rounded-full text-xs font-medium"><CheckCircle size={12} className="inline mr-1" /> Yes</span>) : (<span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">No</span>)}</td>
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">
                    {farmer.location ? (
                      <button 
                        onClick={() => handleLocationView(farmer)} 
                        className="text-gray-600 hover:text-black hover:font-bold hover:cursor-pointer transition-all"
                        style={{ textShadow: '0 0 0 transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textShadow = '0 0 0 transparent';
                        }}
                      >
                        View
                      </button>
                    ) : (
                      <button 
                        className="text-gray-600 hover:text-black hover:font-bold hover:cursor-pointer transition-all"
                        style={{ textShadow: '0 0 0 transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textShadow = '0 0 0 transparent';
                        }}
                      >
                        Add
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => { setSelectedFarmer(farmer); setShowFarmerDetails(true); }} 
                        className="text-lime-500 hover:text-lime-600 font-semibold hover:font-bold transition-all"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => { 
                          setSelectedFarmerForProfile(farmer); 
                          setShowProfileModal(true); 
                        }} 
                        className="text-lime-500 hover:text-lime-600 font-semibold hover:font-bold transition-all"
                      >
                        Profile
                      </button>
                      <button 
                        onClick={() => { 
                          setSelectedFarmerForPassword(farmer);
                          setPasswordForm({
                            username: farmer.username || '',
                            password: '',
                            confirmPassword: ''
                          });
                          setShowChangePasswordModal(true);
                        }} 
                        className="text-lime-500 hover:text-lime-600 font-semibold hover:font-bold transition-all"
                      >
                        Password
                      </button>
                      <button 
                        onClick={() => { 
                          console.log('Delete button clicked for farmer:', farmer); 
                          setFarmerToDelete(farmer); 
                          setShowDeleteConfirmation(true); 
                          console.log('Modal should be open now'); 
                        }} 
                        className="text-black hover:text-gray-800 font-semibold hover:font-bold transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center mb-6">
          <UserPlus size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 italic">No farmers match the current filters.</p>
          <button className="mt-4 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors" onClick={() => { setFormData({ ...formData, isCertified: "", cropType: "", barangay: "" }); setSearchQuery(""); }}>Reset Filters</button>
        </div>
      )}

      {/* Scrollable Pagination - Hidden Scrollbar */}
      {filteredFarmers.length > itemsPerPage && (
        <div className="mt-6 bg-white rounded-xl shadow-md border-2 border-lime-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-700 font-medium">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredFarmers.length)} of {filteredFarmers.length} results
          </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex items-center space-x-2 min-w-max">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-semibold bg-lime-100 text-lime-700 rounded-lg hover:bg-lime-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Previous
            </button>
            
              {/* Page Numbers - Scrollable */}
              <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    currentPage === page
                        ? 'bg-lime-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-lime-100 hover:text-lime-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-semibold bg-lime-100 text-lime-700 rounded-lg hover:bg-lime-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Next
            </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ============================================
        THE ONLY FARMER REGISTRATION MODAL
        ============================================
        This is the ONLY modal for registering farmers.
        Located in: FarmerRegistration.jsx
        Triggered by: "Register New Farmer" button in this component
        State: Local state 'showRegisterForm' (line 56)
        DO NOT create duplicate modals elsewhere!
        ============================================
      */}
      {/* Register Farmer Modal - Farm Vibe Design */}
      {showRegisterForm && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">🌾 Register a New Farmer</h2>
              <button
                className="text-black hover:bg-lime-200 rounded-full p-1 focus:outline-none transition-all"
                onClick={() => setShowRegisterForm(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 bg-white">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Block - Minimalist Blockchain Style */}
                <div className="bg-white rounded-lg p-5 border-2 border-black relative" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-black">
                    <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.6)' }}>
                      <User size={18} className="text-lime-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Personal Data</h3>
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-lime-500 rounded-full"></span>
                        Blockchain Record
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-lime-500" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName || ""}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          className="pl-10 w-full bg-white border-2 border-black p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Middle Name</label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName || ""}
                        onChange={handleChange}
                        placeholder="Enter middle name (optional)"
                        className="w-full bg-white border-2 border-black p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className="w-full bg-white border-2 border-black p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Birthday</label>
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday || ""}
                        onChange={handleChange}
                        className="w-full bg-white border-2 border-black p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                        className="w-full bg-white border-2 border-black p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Contact Number</label>
                      <input
                        type="tel"
                        name="contactNum"
                        value={formData.contactNum || ""}
                        onChange={handleChange}
                        placeholder="Enter contact number (e.g., 09123456789)"
                        className="w-full bg-white border-2 border-black p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information Block - Minimalist Blockchain Style */}
                <div className="bg-white rounded-lg p-5 border-2 border-black relative" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-black">
                    <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.6)' }}>
                      <MapPin size={18} className="text-lime-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Location Data</h3>
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-lime-500 rounded-full"></span>
                        GPS Verified
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1 uppercase">Address</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ""}
                          onChange={handleChange}
                          className="w-full pr-10 bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all"
                          required
                          placeholder="Enter address or click map icon to select location"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (setShowMapModal) {
                              setShowMapModal(true)
                            }
                            if (setMapMode) {
                              setMapMode("add")
                            }
                          }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto z-10 hover:opacity-80 transition-opacity"
                          title="Click to select location on map"
                        >
                          <MapPin size={20} className="text-black" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farm Information Block - Minimalist Blockchain Style */}
                <div className="bg-white rounded-lg p-5 border-2 border-black relative" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-black">
                    <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.6)' }}>
                      <Layers size={18} className="text-lime-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Farm Registry</h3>
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-lime-500 rounded-full"></span>
                        Immutable Ledger
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Crop Area (hectares)</label>
                      <input
                        type="text"
                        name="cropArea"
                        value={formData.cropArea || ""}
                        onChange={handleChange}
                        placeholder="Enter crop area (e.g., 2.5)"
                        className="w-full bg-white border-2 border-black p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 py-3 bg-white p-4 rounded-lg border-2 border-black" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <input
                    type="checkbox"
                    id="isCertified"
                    name="isCertified"
                    checked={formData.isCertified || false}
                    onChange={handleChange}
                    className="w-5 h-5 text-lime-600 bg-white border-2 border-black rounded focus:ring-2 focus:ring-lime-400"
                  />
                  <label htmlFor="isCertified" className="text-black font-bold uppercase text-sm tracking-wide">
                    Certified Farmer
                  </label>
                </div>
                {/* RSBSA Registered checkbox - Minimalist */}
                <div className="flex items-center space-x-3 py-3 bg-white p-4 rounded-lg border-2 border-black" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <input
                    type="checkbox"
                    id="rsbsaRegistered"
                    name="rsbsaRegistered"
                    checked={formData.rsbsaRegistered || false}
                    onChange={handleChange}
                    className="w-5 h-5 text-lime-600 bg-white border-2 border-black rounded focus:ring-2 focus:ring-lime-400"
                  />
                  <label htmlFor="rsbsaRegistered" className="text-black font-bold uppercase text-sm tracking-wide">
                    RSBSA Registered <span className="text-xs text-gray-600 normal-case font-normal">(Required)</span>
                  </label>
                </div>

                {/* Farmer Account Information - Minimalist Blockchain Style */}
                <div className="md:col-span-2 border-t-2 border-lime-500 pt-6 mt-6">
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-lime-500">
                    <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.6)' }}>
                      <User size={18} className="text-lime-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Account Protocol</h3>
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-lime-500 rounded-full"></span>
                        Encrypted Credentials
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-lime-600 uppercase">Username</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-lime-500" />
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={formData.username || ""}
                          onChange={handleChange}
                          placeholder="Enter username for farmer login"
                          className="pl-10 w-full bg-white border-2 border-black p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-lime-600 uppercase">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText size={16} className="text-lime-500" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password || ""}
                          onChange={handleChange}
                          placeholder="Enter password for farmer login"
                          className="pl-10 pr-10 w-full bg-white border-2 border-black p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-lime-600 hover:text-lime-700"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Password Validation Display - Full Width */}
                  {formData.password && passwordValidation && (
                    <div className="mt-3 p-3 bg-white rounded-lg" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-black uppercase">Password Strength</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getPasswordStrengthTextColor(passwordValidation.strength.level)}`}>
                          {getPasswordStrengthLabel(passwordValidation.strength.level)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordValidation.strength.level)}`}
                          style={{ width: `${passwordValidation.strength.score}%` }}
                        />
                      </div>
                      {passwordValidation.errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-bold text-red-600">Requirements:</p>
                          <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                            {passwordValidation.errors.map((error, index) => (
                              <li key={index} className="text-red-600">{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {passwordValidation.isValid && (
                        <p className="text-xs text-green-600 font-semibold mt-2">✓ Password meets all requirements</p>
                      )}
                    </div>
                  )}
                  {/* Username Validation Display */}
                  {formData.username && (
                    <div className="mt-3 p-3 bg-white rounded-lg border-2 border-lime-500" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-700 flex items-center">
                          <span className="text-lime-500 mr-2 font-bold">►</span>
                          Username: <span className="font-bold text-black ml-1">{formData.username}</span>
                        </p>
                        {formData.username.length >= 3 ? (
                          <span className="text-xs text-green-600 font-semibold">✓ Valid</span>
                        ) : (
                          <span className="text-xs text-red-600 font-semibold">⚠ Minimum 3 characters</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 p-3 bg-white rounded-lg border-2 border-lime-500" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}>
                    <p className="text-xs text-gray-700 flex items-center">
                      <span className="text-lime-500 mr-2 font-bold">►</span>
                      Secure blockchain-encrypted credentials for farmer dashboard access
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 transition-all font-bold shadow-lg flex items-center justify-center"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register Farmer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Details Modal - Design Vibe */}
      {showFarmerDetails && selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">🌾 Farmer Details</h2>
              <button
                onClick={() => setShowFarmerDetails(false)}
                className="text-black hover:bg-lime-200 rounded-full p-1 focus:outline-none transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 md:p-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-5 border-2 border-black relative" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-black">
                    <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.6)' }}>
                      <User size={18} className="text-lime-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Personal Data</h3>
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-lime-500 rounded-full"></span>
                        Blockchain Record
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div><span className="text-gray-500 text-xs uppercase font-bold">Full Name</span><p className="font-medium text-black">{selectedFarmer.farmerName}</p></div>
                    <div><span className="text-gray-500 text-xs uppercase font-bold">Birthday</span><p className="font-medium text-black">{selectedFarmer.birthday || "Not provided"}</p></div>
                    <div><span className="text-gray-500 text-xs uppercase font-bold">Gender</span><p className="font-medium text-black">{selectedFarmer.gender || "Not provided"}</p></div>
                    <div><span className="text-gray-500 text-xs uppercase font-bold">Contact Number</span><p className="font-medium text-black">{selectedFarmer.contactNum || "Not provided"}</p></div>
                    <div><span className="text-gray-500 text-xs uppercase font-bold">Address</span><p className="font-medium text-black">{selectedFarmer.address}</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 border-2 border-black relative" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-black">
                    <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.6)' }}>
                      <Layers size={18} className="text-lime-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Farm Registry</h3>
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-lime-500 rounded-full"></span>
                        Immutable Ledger
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div><span className="text-gray-500 text-xs uppercase font-bold">Crop Area</span><p className="font-medium text-black">{selectedFarmer.cropArea ? `${selectedFarmer.cropArea} hectares` : "Not provided"}</p></div>
                    <div><span className="text-gray-500 text-xs uppercase font-bold">Certified</span><p className="font-medium">{selectedFarmer.isCertified ? (<span className="text-green-600 flex items-center"><CheckCircle size={16} className="mr-1" /> Yes</span>) : (<span className="text-gray-600">No</span>)}</p></div>
                    <div><span className="text-gray-500 text-xs uppercase font-bold">RSBSA Registered</span><p className="font-medium">{selectedFarmer.rsbsaRegistered ? (<span className="text-green-600 flex items-center"><CheckCircle size={16} className="mr-1" /> Yes</span>) : (<span className="text-red-600 flex items-center"><AlertTriangle size={16} className="mr-1" /> No</span>)}</p></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-5 border-2 border-black relative mb-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
                  <div className="flex items-center">
                    <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.6)' }}>
                      <Shield size={18} className="text-lime-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Insurance Information</h3>
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-lime-500 rounded-full"></span>
                        Coverage Details
                      </span>
                    </div>
                  </div>
                  {onTabSwitch && (
                    <button
                      onClick={() => {
                        setShowFarmerDetails(false)
                        onTabSwitch('crop-insurance')
                      }}
                      className="px-4 py-2 bg-lime-400 text-black rounded-lg hover:bg-lime-500 transition-all font-bold border-2 border-black text-xs uppercase"
                      style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
                    >
                      View Crop Insurance
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-xs uppercase font-bold">Insured Crops</span>
                    <p className="font-medium text-black">{getInsuredCrops(selectedFarmer)}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowFarmerDetails(false)}
                  className="bg-lime-400 border-2 border-black text-black px-6 py-3 rounded-lg hover:bg-lime-500 transition-all font-bold shadow-lg"
                  style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Design Vibe */}
      {showDeleteConfirmation && farmerToDelete && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">⚠️ Delete Farmer</h2>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setFarmerToDelete(null);
                }}
                className="text-black hover:bg-lime-200 rounded-full p-1"
              >
                <X size={24} />
              </button>
              </div>
            <div className="p-6 bg-white">
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded-lg">
                <p className="text-sm font-semibold text-black mb-2">
                  Are you sure you want to delete this farmer?
                </p>
                <p className="text-sm text-gray-700 font-bold">
                  {farmerToDelete.farmerName || `${farmerToDelete.firstName || ''} ${farmerToDelete.middleName || ''} ${farmerToDelete.lastName || ''}`.replace(/  +/g, ' ').trim()}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ This action cannot be undone.
            </p>
              </div>
              <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setFarmerToDelete(null);
                }}
                  className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const farmerId = farmerToDelete._id || farmerToDelete.id;
                    
                    if (!farmerId) {
                      throw new Error('No valid farmer ID found');
                    }
                    
                    await deleteFarmerMutation.mutateAsync(farmerId)
                    
                    setShowDeleteConfirmation(false)
                    setFarmerToDelete(null)
                  } catch (error) {
                    console.error('Error deleting farmer:', error);
                  }
                }}
                  className="flex-1 bg-red-500 border-2 border-black text-white px-4 py-3 rounded-lg hover:bg-red-600 font-bold flex items-center justify-center"
              >
                  <X size={20} className="mr-2" />
                Delete
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Profile Modal */}
      {showProfileModal && selectedFarmerForProfile && (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4">
          <div className="bg-white rounded-[5px] shadow-xl max-w-md w-full">
            <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Set Profile Picture</h2>
              <button
                onClick={() => {
                  if (selectedProfileId) {
                    clearProfileImageDraft(selectedProfileId)
                  }
                  setShowProfileModal(false)
                }}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {selectedFarmerForProfile.farmerName || 
                   `${selectedFarmerForProfile.firstName || ''} ${selectedFarmerForProfile.middleName || ''} ${selectedFarmerForProfile.lastName || ''}`.replace(/  +/g, ' ').trim()}
                </h3>
                <p className="text-gray-600">Upload a profile picture for this farmer</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  {selectedProfileImageSrc ? (
                    <img 
                      src={selectedProfileImageSrc} 
                      alt="Current Profile" 
                      className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const farmerId = selectedFarmerForProfile._id || selectedFarmerForProfile.id;
                      if (file && farmerId) {
                        const fileSizeMB = file.size / 1024 / 1024;
                        if (fileSizeMB > 5) {
                          setProfileImageValidationData({
                            type: 'error',
                            message: `Image is too large (${fileSizeMB.toFixed(2)}MB). Please use an image smaller than 5MB.`,
                            onConfirm: () => {
                              setShowProfileImageValidation(false);
                              setProfileImageValidationData({ type: '', message: '', onConfirm: null });
                              e.target.value = '';
                            }
                          });
                          setShowProfileImageValidation(true);
                          return;
                        }

                        setProfileImageFiles((prev) => ({
                          ...prev,
                          [farmerId]: file
                        }));

                        setProfileImagePreviews((prev) => {
                          const existingUrl = prev[farmerId];
                          if (existingUrl) {
                            revokeObjectUrl(existingUrl);
                          }
                          return {
                            ...prev,
                            [farmerId]: URL.createObjectURL(file)
                          };
                        });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      if (selectedProfileId) {
                        clearProfileImageDraft(selectedProfileId)
                      }
                      setShowProfileModal(false)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const farmerId = selectedProfileId;
                        const fileToUpload = farmerId ? profileImageFiles[farmerId] : null;
                        
                        if (farmerId && fileToUpload) {
                          const fileSizeMB = fileToUpload.size / 1024 / 1024;
                          if (fileSizeMB > 5) {
                            setProfileImageValidationData({
                              type: 'error',
                              message: `Image is too large (${fileSizeMB.toFixed(2)}MB). Please use an image smaller than 5MB.`,
                              onConfirm: () => {
                                setShowProfileImageValidation(false);
                                setProfileImageValidationData({ type: '', message: '', onConfirm: null });
                              }
                            });
                            setShowProfileImageValidation(true);
                            return;
                          }
                          
                          const response = await saveFarmerProfileImage(farmerId, fileToUpload);
                          
                          if (response && response.success) {
                            const updatedUrl = buildProfileImageUrl(farmerId, response.version);
                            setProfileImages((prev) => ({
                              ...prev,
                              [farmerId]: updatedUrl
                            }));
                            clearProfileImageDraft(farmerId);
                            setShowProfileModal(false);
                            console.log('Profile picture saved successfully');
                          } else {
                            throw new Error(response?.message || 'Failed to save profile image');
                          }
                        } else {
                          setProfileImageValidationData({
                            type: 'error',
                            message: 'Please select an image first',
                            onConfirm: () => {
                              setShowProfileImageValidation(false);
                              setProfileImageValidationData({ type: '', message: '', onConfirm: null });
                            }
                          });
                          setShowProfileImageValidation(true);
                        }
                      } catch (error) {
                        console.error('Error saving profile image:', error);
                        const errorMessage = error.message || 'Failed to save profile image. Please check your connection and try again.';
                        setProfileImageValidationData({
                          type: 'error',
                          message: `Error: ${errorMessage}`,
                          onConfirm: () => {
                            setShowProfileImageValidation(false);
                            setProfileImageValidationData({ type: '', message: '', onConfirm: null });
                          }
                        });
                        setShowProfileImageValidation(true);
                      }
                    }}
                    className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                  >
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Picker Modal for Address Selection */}
      {showMapModal && mapMode === "add" && (
        <SimpleMapPicker
          onLocationSelect={(location) => {
            // Update the address field if address is available
            if (setFormData) {
              const addressValue = location.address || `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`;
              
              setFormData((prev) => ({
                ...prev,
                address: addressValue
              }));
            }
            // Update selected location
            if (setSelectedLocation) {
              setSelectedLocation({
                lat: location.lat,
                lng: location.lng
              });
            }
          }}
          onClose={() => {
            // Close the map modal when user confirms or closes
            if (setShowMapModal) {
              setShowMapModal(false);
            }
          }}
        />
      )}

      {/* Change Password Modal - Farm Vibe Design */}
      {showChangePasswordModal && selectedFarmerForPassword && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">🔑 Change Password</h2>
              <button
                className="text-black hover:bg-lime-200 rounded-full p-1 focus:outline-none transition-all"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setSelectedFarmerForPassword(null);
                  setPasswordForm({ username: '', password: '', confirmPassword: '' });
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 bg-white">
              <div className="mb-4 p-3 bg-lime-50 border-2 border-black rounded-lg">
                <p className="text-sm font-semibold text-black mb-1">Farmer:</p>
                <p className="text-sm text-gray-700">
                  {selectedFarmerForPassword.farmerName || 
                   `${selectedFarmerForPassword.firstName || ''} ${selectedFarmerForPassword.middleName || ''} ${selectedFarmerForPassword.lastName || ''}`.replace(/  +/g, ' ').trim()}
                </p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                
                // Validation checks
                if (passwordForm.password !== passwordForm.confirmPassword) {
                  setPasswordConfirmationData({
                    type: 'error',
                    message: 'Passwords do not match!',
                    onConfirm: null
                  });
                  setShowPasswordConfirmation(true);
                  return;
                }

                // Validate password strength
                const passwordValidation = validatePassword(passwordForm.password);
                if (!passwordValidation.isValid) {
                  setPasswordConfirmationData({
                    type: 'error',
                    message: passwordValidation.errors[0] || 'Password does not meet security requirements!',
                    onConfirm: null
                  });
                  setShowPasswordConfirmation(true);
                  return;
                }

                const updateData = {};
                if (passwordForm.username && passwordForm.username.trim() !== '') {
                  updateData.username = passwordForm.username.trim();
                }
                if (passwordForm.password && passwordForm.password.trim() !== '') {
                  updateData.password = passwordForm.password.trim();
                }

                if (Object.keys(updateData).length === 0) {
                  setPasswordConfirmationData({
                    type: 'error',
                    message: 'Please enter at least a new username or password!',
                    onConfirm: null
                  });
                  setShowPasswordConfirmation(true);
                  return;
                }

                // Show confirmation modal before updating
                setPasswordConfirmationData({
                  type: 'confirm',
                  message: 'Are you sure you want to update the password and/or username for this farmer?',
                  onConfirm: async () => {
                    try {
                      await updateFarmerMutation.mutateAsync({
                        farmerId: selectedFarmerForPassword._id || selectedFarmerForPassword.id,
                        updateData
                      });

                      setShowChangePasswordModal(false);
                      setSelectedFarmerForPassword(null);
                      setPasswordForm({ username: '', password: '', confirmPassword: '' });
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                      setShowPasswordConfirmation(false);
                      
                      // Show success confirmation
                      setPasswordConfirmationData({
                        type: 'success',
                        message: 'Password and/or username updated successfully!',
                        onConfirm: null
                      });
                      setShowPasswordConfirmation(true);
                    } catch (error) {
                      console.error('Error updating password:', error);
                      setShowPasswordConfirmation(false);
                      setPasswordConfirmationData({
                        type: 'error',
                        message: 'Failed to update password. Please try again.',
                        onConfirm: null
                      });
                      setShowPasswordConfirmation(true);
                    }
                  }
                });
                setShowPasswordConfirmation(true);
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Username
                  </label>
                  <input
                    type="text"
                    value={passwordForm.username}
                    onChange={(e) => setPasswordForm({ ...passwordForm, username: e.target.value })}
                    className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400"
                    placeholder="Enter new username (optional)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    New Password
                  </label>
                  <div className="relative">
                  <input
                      type={showNewPassword ? "text" : "password"}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400 pr-10"
                    placeholder="Enter new password"
                    required
                  />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {showNewPassword ? <Eye size={20} /> : <Key size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                  <input
                      type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full bg-white border-2 border-black p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400 pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {showConfirmPassword ? <Eye size={20} /> : <Key size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setSelectedFarmerForPassword(null);
                      setPasswordForm({ username: '', password: '', confirmPassword: '' });
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateFarmerMutation.isPending}
                    className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 transition-all font-bold shadow-lg flex items-center justify-center disabled:opacity-50"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                  >
                    <Key className="mr-2 h-5 w-5" />
                    {updateFarmerMutation.isPending ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Confirmation Modal - Farm Vibe Design */}
      {showPasswordConfirmation && (
        <div className="fixed inset-0 z-[60] bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
            <div className="bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl">
              <h2 className="text-2xl font-bold text-black">
                {passwordConfirmationData.type === 'confirm' && '🔒 Confirm Update'}
                {passwordConfirmationData.type === 'error' && '⚠️ Error'}
                {passwordConfirmationData.type === 'success' && '✅ Success'}
              </h2>
            </div>

            <div className="p-6 bg-white">
              <p className="text-black mb-6 text-center">
                {passwordConfirmationData.message}
              </p>

              <div className="flex gap-3">
                {passwordConfirmationData.type === 'confirm' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordConfirmation(false);
                        setPasswordConfirmationData({ type: '', message: '', onConfirm: null });
                      }}
                      className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 transition-all font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (passwordConfirmationData.onConfirm) {
                          passwordConfirmationData.onConfirm();
                        }
                      }}
                      className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 transition-all font-bold shadow-lg"
                      style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                    >
                      Confirm
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordConfirmation(false);
                      setPasswordConfirmationData({ type: '', message: '', onConfirm: null });
                    }}
                    className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 transition-all font-bold shadow-lg"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Image Validation Modal - Design Vibe */}
      {showProfileImageValidation && (
        <div className="fixed inset-0 z-[60] bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
            <div className="sticky top-0 bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center z-20">
              <h2 className="text-2xl font-bold text-black">
                {profileImageValidationData.type === 'error' && '⚠️ Image Validation Error'}
                {profileImageValidationData.type === 'warning' && '⚠️ Image Warning'}
              </h2>
              <button
                onClick={() => {
                  setShowProfileImageValidation(false);
                  if (profileImageValidationData.onConfirm) {
                    profileImageValidationData.onConfirm();
                  }
                  setProfileImageValidationData({ type: '', message: '', onConfirm: null });
                }}
                className="text-black hover:bg-lime-200 rounded-full p-1 focus:outline-none transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 bg-white">
              <div className={`mb-4 p-3 rounded-lg border-2 ${
                profileImageValidationData.type === 'error' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <p className="text-sm font-semibold text-black mb-1">
                  {profileImageValidationData.type === 'error' ? 'Error:' : 'Warning:'}
                </p>
                <p className="text-sm text-gray-700">
                  {profileImageValidationData.message}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProfileImageValidation(false);
                    if (profileImageValidationData.onConfirm) {
                      profileImageValidationData.onConfirm();
                    }
                    setProfileImageValidationData({ type: '', message: '', onConfirm: null });
                  }}
                  className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 font-bold"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerRegistration
