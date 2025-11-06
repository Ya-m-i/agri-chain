"use client"

import { useState, useEffect, useMemo } from "react"
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
} from "lucide-react"
// Image assets removed - no longer used in this component
import {
  useRegisterFarmer,
  useFarmers,
  useDeleteFarmer,
  useCropInsurance
} from '../hooks/useAPI'
import { 
  saveFarmerProfileImage, 
  getAllFarmerProfileImages 
} from '../api'
// Note: Notifications are now handled by backend API
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { getCropTypeDistributionFromInsurance } from '../utils/cropTypeDistribution'
import SimpleMapPicker from './SimpleMapPicker'

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
  // Local state for farmer registration
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [timePeriod, setTimePeriod] = useState("monthly") // monthly or quarterly
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  
  // Profile image state
  const [profileImages, setProfileImages] = useState({})
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedFarmerForProfile, setSelectedFarmerForProfile] = useState(null)
  
  // Filter dropdown state
  const [showCropFilter, setShowCropFilter] = useState(false)
  const [showBarangayFilter, setShowBarangayFilter] = useState(false)
  const [showCertFilter, setShowCertFilter] = useState(false)
  
  // Report state
  const [showReport, setShowReport] = useState(false)

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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
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
        lotNumber: "",
        lotArea: "",
        agency: "",
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
          setProfileImages(response.profileImages);
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
        <div className="flex gap-4">
          <button
            className="bg-lime-400 border-2 border-black text-black px-4 py-2 rounded-lg hover:bg-lime-500 transition-colors flex items-center justify-center shadow-md font-bold uppercase tracking-wide"
            onClick={() => setShowRegisterForm(true)}
            style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
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
            Generate Report
          </button>
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
            <div className="h-64">
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
            <div className="h-64 flex items-center justify-center">
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
              className="bg-lime-200 text-black px-3 py-2 rounded-lg hover:bg-black hover:text-lime-400 transition-colors focus:outline-none text-sm font-medium"
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
              className="bg-lime-200 text-black px-3 py-2 rounded-lg hover:bg-black hover:text-lime-400 transition-colors focus:outline-none text-sm font-medium"
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
              className="bg-lime-200 text-black px-3 py-2 rounded-lg hover:bg-black hover:text-lime-400 transition-colors focus:outline-none text-sm font-medium"
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
              className="bg-lime-200 text-black border border-black px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm font-medium placeholder-black placeholder-opacity-60 w-40"
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
        <div className="w-full overflow-x-auto bg-white rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 table-auto bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-lg whitespace-normal break-words">Profile</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-normal break-words">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-normal break-words">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-normal break-words">Crop</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-normal break-words">Lot No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-normal break-words">Lot Area</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-normal break-words">Certified</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-normal break-words">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-lg whitespace-normal break-words">Actions</th>
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
                      <button 
                        onClick={() => { 
                          setSelectedFarmerForProfile(farmer); 
                          setShowProfileModal(true); 
                        }} 
                        className="text-gray-600 hover:text-black hover:font-bold hover:cursor-pointer transition-all"
                        style={{ textShadow: '0 0 0 transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textShadow = '0 0 0 transparent';
                        }}
                      >
                        Profile
                      </button>
                      <button 
                        onClick={() => { 
                          console.log('Delete button clicked for farmer:', farmer); 
                          setFarmerToDelete(farmer); 
                          setShowDeleteConfirmation(true); 
                          console.log('Modal should be open now'); 
                        }} 
                        className="text-gray-600 hover:text-black hover:font-bold hover:cursor-pointer transition-all"
                        style={{ textShadow: '0 0 0 transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textShadow = '0 0 0 transparent';
                        }}
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

      {/* Pagination Controls */}
      {filteredFarmers.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 rounded-lg">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredFarmers.length)} of {filteredFarmers.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === page
                      ? 'bg-lime-600 text-white border-lime-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-md flex items-center justify-center p-4">
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
                <div className="bg-white rounded-lg p-5 border-2 border-lime-500 relative" style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}>
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-lime-500">
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
                          className="pl-10 w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                          style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
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
                        className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                        style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
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
                        className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                        style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
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
                        className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                        style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                        className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                        style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
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
                        className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                        style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information Block - Minimalist Blockchain Style */}
                <div className="bg-white rounded-lg p-5 border-2 border-lime-500 relative" style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}>
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-lime-500">
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
                <div className="bg-white rounded-lg p-5 border-2 border-lime-500 relative" style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}>
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-lime-500">
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
                        className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                        style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Lot Information Block - Minimalist Blockchain Style */}
                <div className="bg-white rounded-lg p-5 border-2 border-lime-500 relative" style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}>
                  <div className="flex items-center mb-4 pb-3 border-b-2 border-lime-500">
                    <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.6)' }}>
                      <MapPin size={18} className="text-lime-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Lot Registry</h3>
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-lime-500 rounded-full"></span>
                        Verified Node
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Lot Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin size={16} className="text-lime-500" />
                        </div>
                        <input
                          type="text"
                          name="lotNumber"
                          value={formData.lotNumber || ""}
                          onChange={handleChange}
                          placeholder="Enter lot number (e.g., Lot 123)"
                          className="pl-10 w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                          style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Lot Area</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Layers size={16} className="text-lime-500" />
                        </div>
                        <input
                          type="text"
                          name="lotArea"
                          value={formData.lotArea || ""}
                          onChange={handleChange}
                          placeholder="Enter lot area (e.g., 1.5 hectares)"
                          className="pl-10 w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                          style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Agency</label>
                      <select
                        name="agency"
                        value={formData.agency || ""}
                        onChange={handleChange}
                        className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                        style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                      >
                        <option value="">Select Agency</option>
                        <option value="DA">DA - Department of Agriculture</option>
                        <option value="LGU">LGU - Local Government Unit</option>
                        <option value="DA-PCIC">DA-PCIC - Philippine Crop Insurance Corporation</option>
                        <option value="DA-Kapalong">DA-Kapalong - Department of Agriculture Kapalong</option>
                        <option value="NIA">NIA - National Irrigation Administration</option>
                        <option value="ATI">ATI - Agricultural Training Institute</option>
                        <option value="PCAF">PCAF - Philippine Council for Agriculture and Fisheries</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 py-3 bg-white p-4 rounded-lg border-2 border-lime-500" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}>
                  <input
                    type="checkbox"
                    id="isCertified"
                    name="isCertified"
                    checked={formData.isCertified || false}
                    onChange={handleChange}
                    className="w-5 h-5 text-lime-600 bg-white border-2 border-lime-500 rounded focus:ring-2 focus:ring-lime-400"
                  />
                  <label htmlFor="isCertified" className="text-black font-bold uppercase text-sm tracking-wide">
                    Certified Farmer
                  </label>
                </div>
                {/* RSBSA Registered checkbox - Minimalist */}
                <div className="flex items-center space-x-3 py-3 bg-white p-4 rounded-lg border-2 border-lime-500" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}>
                  <input
                    type="checkbox"
                    id="rsbsaRegistered"
                    name="rsbsaRegistered"
                    checked={formData.rsbsaRegistered || false}
                    onChange={handleChange}
                    className="w-5 h-5 text-lime-600 bg-white border-2 border-lime-500 rounded focus:ring-2 focus:ring-lime-400"
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
                          className="pl-10 w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                          style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
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
                          type="password"
                          name="password"
                          value={formData.password || ""}
                          onChange={handleChange}
                          placeholder="Enter password for farmer login"
                          className="pl-10 w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                          style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                          required
                        />
                      </div>
                    </div>
                  </div>
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

      {/* Farmer Details Modal */}
      {showFarmerDetails && selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Farmer Details</h2>
              <button
                onClick={() => setShowFarmerDetails(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-lime-800 mb-3 flex items-center gap-2">
                    <User size={20} /> Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div><span className="text-gray-500 text-sm">Full Name</span><p className="font-medium">{selectedFarmer.farmerName}</p></div>
                    <div><span className="text-gray-500 text-sm">Birthday</span><p className="font-medium">{selectedFarmer.birthday || "Not provided"}</p></div>
                    <div><span className="text-gray-500 text-sm">Gender</span><p className="font-medium">{selectedFarmer.gender || "Not provided"}</p></div>
                    <div><span className="text-gray-500 text-sm">Contact Number</span><p className="font-medium">{selectedFarmer.contactNum || "Not provided"}</p></div>
                    <div><span className="text-gray-500 text-sm">Address</span><p className="font-medium">{selectedFarmer.address}</p></div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Farm Information</h3>
                  <div className="space-y-3">
                    <div><span className="text-gray-500 text-sm">Crop Type</span><p className="font-medium">{selectedFarmer.cropType}</p></div>
                    <div><span className="text-gray-500 text-sm">Crop Area</span><p className="font-medium">{selectedFarmer.cropArea} hectares</p></div>
                    <div><span className="text-gray-500 text-sm">Lot Number</span><p className="font-medium">{selectedFarmer.lotNumber || "Not provided"}</p></div>
                    <div><span className="text-gray-500 text-sm">Lot Area</span><p className="font-medium">{selectedFarmer.lotArea || "Not provided"}</p></div>
                    <div><span className="text-gray-500 text-sm">Certified</span><p className="font-medium">{selectedFarmer.isCertified ? (<span className="text-green-600 flex items-center"><CheckCircle size={16} className="mr-1" /> Yes</span>) : (<span className="text-gray-600">No</span>)}</p></div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="text-gray-500 text-sm">Insurance Type</span><p className="font-medium">{selectedFarmer.insuranceType || "Not provided"}</p></div>
                  <div><span className="text-gray-500 text-sm">Premium Amount</span><p className="font-medium">{selectedFarmer.premiumAmount || "Not provided"}</p></div>
                  <div><span className="text-gray-500 text-sm">Agency</span><p className="font-medium">{selectedFarmer.agency || "Not provided"}</p></div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowFarmerDetails(false)}
                  className="bg-lime-700 text-white px-6 py-2 rounded-lg hover:bg-lime-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && farmerToDelete && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <AlertTriangle className="mr-2 text-red-500" size={24} />
              Delete Farmer
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <strong>{farmerToDelete.farmerName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  console.log('Cancel button clicked');
                  setShowDeleteConfirmation(false);
                  setFarmerToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  console.log('Delete confirmation button clicked');
                  try {
                    console.log('Attempting to delete farmer:', farmerToDelete);
                    
                    // Check if farmer has _id (from database) or id (from localStorage)
                    const farmerId = farmerToDelete._id || farmerToDelete.id;
                    console.log('Using farmer ID:', farmerId);
                    
                    if (!farmerId) {
                      throw new Error('No valid farmer ID found');
                    }
                    
                    // Delete from backend database using React Query
                    await deleteFarmerMutation.mutateAsync(farmerId)
                    
                    setShowDeleteConfirmation(false)
                    setFarmerToDelete(null)
                    
                    // Note: Notifications are now created by backend API automatically
                    console.log('Farmer deleted successfully:', farmerToDelete.farmerName)
                  } catch (error) {
                    console.error('Error deleting farmer:', error);
                    
                    // Note: Error notifications are now created by backend API automatically
                    console.error('Error deleting farmer:', error)
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <X size={16} className="mr-1" />
                Delete
              </button>
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
                onClick={() => setShowProfileModal(false)}
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
                  {profileImages[selectedFarmerForProfile._id || selectedFarmerForProfile.id] ? (
                    <img 
                      src={profileImages[selectedFarmerForProfile._id || selectedFarmerForProfile.id]} 
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
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const farmerId = selectedFarmerForProfile._id || selectedFarmerForProfile.id;
                          setProfileImages(prev => ({
                            ...prev,
                            [farmerId]: event.target.result
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const farmerId = selectedFarmerForProfile._id || selectedFarmerForProfile.id;
                        const currentProfileImage = profileImages[farmerId];
                        
                        if (currentProfileImage) {
                          // Save to MongoDB
                          const response = await saveFarmerProfileImage(farmerId, currentProfileImage);
                          
                          if (response.success) {
                            setShowProfileModal(false);
                            // Note: Notifications are now created by backend API automatically
                            console.log('Profile picture saved successfully')
                          } else {
                            throw new Error('Failed to save profile image');
                          }
                        } else {
                          // Note: Error notifications are now created by backend API automatically
                          console.error('No image selected')
                        }
                      } catch (error) {
                        console.error('Error saving profile image:', error);
                        // Note: Error notifications are now created by backend API automatically
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
    </div>
  )
}

export default FarmerRegistration
