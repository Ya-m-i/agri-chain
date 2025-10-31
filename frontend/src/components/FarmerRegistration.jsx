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
// Import image assets
import registerIcon from '../assets/Images/register.png'
import cropsIcon from '../assets/Images/crops.png'
import barangayIcon from '../assets/Images/barangay.png'
import certIcon from '../assets/Images/cert.png'
import farmersIcon from '../assets/Images/farmers.png'
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
import { useNotificationStore } from '../store/notificationStore'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { getCropTypeDistributionFromInsurance } from '../utils/cropTypeDistribution'

ChartJS.register(ArcElement, Tooltip, Legend)

const FarmerRegistration = ({
  formData,
  setFormData,
  setShowMapModal,
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
  const [showSearchFilter, setShowSearchFilter] = useState(false)

  // Generate unique notification ID
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

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
      const savedFarmer = await registerFarmerMutation.mutateAsync(newFarmer)
      
      // Notify admin about successful registration
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: 'Farmer Registered Successfully',
        message: `New farmer ${newFarmer.farmerName} has been registered successfully.`,
        timestamp: new Date()
      })
      
      // Notify the new farmer about their registration
      useNotificationStore.getState().addFarmerNotification({
        id: generateUniqueId(),
        type: 'success',
        title: 'Registration Successful',
        message: `Welcome ${newFarmer.farmerName}! Your account has been created successfully. You can now log in with your credentials.`,
        timestamp: new Date()
      }, savedFarmer._id)
      
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
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Registration Failed',
        message: 'Failed to register farmer. Please try again.',
        timestamp: new Date()
      })
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
    
    // Show notification
    useNotificationStore.getState().addAdminNotification({
      id: generateUniqueId(),
      type: 'info',
      title: 'Location View',
      message: `Viewing location for ${farmerLocationData.farmerName} on dashboard map`,
      timestamp: new Date()
    })
    
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
        setShowSearchFilter(false);
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
          <img src={registerIcon} alt="Register" className="h-10 w-10 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Farmer Registration</h2>
        </div>
        <div className="flex gap-4">
          <button
            className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors flex items-center justify-center shadow-sm"
            onClick={() => setShowRegisterForm(true)}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Register New Farmer
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm"
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
        </div>
      </div>


      {/* Combined Filters Widget */}
      <div className="w-full bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Search className="h-5 w-5 text-gray-600 mr-2" />
          Filter Farmers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Crop Type Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCropFilter(!showCropFilter)}
              className="w-full bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lime-500 flex items-center justify-center transition-colors"
            >
              <img src={cropsIcon} alt="Crops" className="h-6 w-6 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {formData.cropType || "All Crops"}
              </span>
              <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCropFilter && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
              className="w-full bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center transition-colors"
            >
              <img src={barangayIcon} alt="Barangay" className="h-6 w-6 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {formData.barangay || "All Barangays"}
              </span>
              <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showBarangayFilter && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
              className="w-full bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-center transition-colors"
            >
              <img src={certIcon} alt="Certification" className="h-6 w-6 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {formData.isCertified === true ? "Certified" : formData.isCertified === false ? "Not Certified" : "All Certifications"}
              </span>
              <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCertFilter && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
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
          
          {/* Search Filter */}
          <div className="relative">
            <button
              onClick={() => setShowSearchFilter(!showSearchFilter)}
              className="w-full bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center transition-colors"
            >
              <Search className="h-6 w-6 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {searchQuery || "Search by name"}
              </span>
              <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSearchFilter && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-3">
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchFilter(false);
                      }}
                      className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowSearchFilter(false)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
            </div>
      </div>

      {/* Chart Visualizations Section */}
      <div className="w-full flex flex-col md:flex-row gap-6 mb-6">
        {/* Area Chart: Registered Farmers Over Time */}
        <div className="flex-1 p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-lime-700 flex items-center gap-2">
              <Users className="h-5 w-5 text-lime-600" /> Registered Farmers Over Time
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Period:</span>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
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
                  stroke="#6b7280" 
                  fontSize={12}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  allowDecimals={false}
                  label={{ value: 'Number of Registered Farmers', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                />
                <RechartsTooltip 
                  formatter={(value, name) => [
                    `${value} farmers`, 
                    name === 'cumulative' ? 'Total Registered' : 'New Registrations'
                  ]}
                  labelFormatter={(label) => `${label} ${selectedYear}`}
                />
                <defs>
                  <linearGradient id="farmerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#bbf7d0" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#22c55e" 
                  fill="url(#farmerGradient)" 
                  strokeWidth={3}
                  name="cumulative"
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#059669" 
                  fill="#10b981" 
                  fillOpacity={0.4} 
                  strokeWidth={2} 
                  name="count"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Donut Pie Chart: Crop Type Distribution */}
        <div className="flex-1 p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-emerald-700 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" /> Crop Type Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={{
                labels: Object.keys(insuranceCropTypeDistribution),
                datasets: [
                  {
                    data: Object.values(insuranceCropTypeDistribution),
                    backgroundColor: [
                      '#bbf7d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#fef08a', '#fde68a', '#fca5a5', '#f87171', '#a7f3d0', '#f9fafb'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                cutout: '70%',
                plugins: {
                  legend: { display: true, position: 'bottom', labels: { boxWidth: 16 } },
                  tooltip: { enabled: true },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Farm List Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img src={farmersIcon} alt="Farmers" className="h-8 w-8 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">Farm List</h2>
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold">{farmers.length}</span> farmers
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
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">{farmer.location ? (<button onClick={() => handleLocationView(farmer)} className="text-blue-600 hover:text-blue-800 flex items-center"><MapPin className="h-4 w-4 mr-1" />View</button>) : (<button className="text-gray-500 hover:text-gray-700 flex items-center"><Plus className="h-4 w-4 mr-1" />Add</button>)}</td>
                  <td className="px-4 py-4 whitespace-normal break-words text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => { setSelectedFarmer(farmer); setShowFarmerDetails(true); }} 
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        <User size={14} className="mr-1" />View
                      </button>
                      <button 
                        onClick={() => { 
                          setSelectedFarmerForProfile(farmer); 
                          setShowProfileModal(true); 
                        }} 
                        className="text-green-600 hover:text-green-800 font-medium flex items-center"
                      >
                        <UserPlus size={14} className="mr-1" />Set Profile
                      </button>
                      <button 
                        onClick={() => { 
                          console.log('Delete button clicked for farmer:', farmer); 
                          setFarmerToDelete(farmer); 
                          setShowDeleteConfirmation(true); 
                          console.log('Modal should be open now'); 
                        }} 
                        className="text-red-600 hover:text-red-800 font-medium flex items-center"
                      >
                        <X size={14} className="mr-1" />Delete
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

      {/* Register Farmer Modal - Enhanced Blockchain Style with Neon Lime */}
      {showRegisterForm && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded-xl shadow-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar relative animate-[fadeIn_0.3s_ease-in]" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            {/* Enhanced Corner Accents with Glow */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            
            {/* Decorative Circuit Lines */}
            <div className="absolute top-10 left-10 w-32 h-0.5 bg-gradient-to-r from-lime-500 to-transparent opacity-60 z-10"></div>
            <div className="absolute top-10 right-10 w-32 h-0.5 bg-gradient-to-l from-lime-500 to-transparent opacity-60 z-10"></div>
            <div className="absolute bottom-10 left-10 w-32 h-0.5 bg-gradient-to-r from-lime-500 to-transparent opacity-60 z-10"></div>
            <div className="absolute bottom-10 right-10 w-32 h-0.5 bg-gradient-to-l from-lime-500 to-transparent opacity-60 z-10"></div>
            
            <div className="sticky top-0 bg-white border-b-4 border-lime-500 p-6 flex justify-between items-center z-20 relative" style={{ boxShadow: '0 6px 20px rgba(132, 204, 22, 0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-black rounded-lg animate-pulse" style={{ boxShadow: '0 0 20px rgba(132, 204, 22, 0.8)' }}>
                  <UserPlus className="h-7 w-7 text-lime-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-wide uppercase">⛓️ Register Farmer</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px rgba(132, 204, 22, 1)' }}></span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">Blockchain Protocol</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterForm(false)}
                className="text-lime-500 hover:text-lime-600 focus:outline-none transition-all hover:rotate-90 duration-300"
                style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.6))' }}
              >
                <X size={28} strokeWidth={3} />
              </button>
            </div>

            <div className="p-6 md:p-8 relative z-10">
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
                      <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-auto cursor-pointer" onClick={() => { setShowMapModal(true); setMapMode('add'); }}>
                          <MapPin size={16} className="text-lime-500" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ""}
                          onChange={handleChange}
                          className="pl-10 w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                          style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                          required
                          readOnly
                          placeholder="Click the map icon to select location"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 flex items-center">
                        <span className="text-lime-500 mr-1">►</span>
                        Click map icon for GPS-verified location
                      </p>
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
                      <input
                        type="text"
                        name="agency"
                        value={formData.agency || ""}
                        onChange={handleChange}
                        placeholder="Enter agency name (e.g., DA-PCIC, LGU)"
                        className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                        style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                      />
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

                <div className="md:col-span-2 flex gap-3 pt-6 border-t-2 border-lime-500 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="flex-1 bg-white text-black border-2 border-black px-6 py-3 rounded-lg hover:bg-black hover:text-white transition-all font-bold uppercase tracking-wide text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-black text-lime-500 px-6 py-3 rounded-lg hover:bg-lime-500 hover:text-black transition-all font-bold uppercase tracking-wide text-sm relative overflow-hidden group border-2 border-black hover:border-lime-500"
                    style={{ boxShadow: '0 4px 20px rgba(132, 204, 22, 0.5)' }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Register
                    </span>
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
                    
                    // Notify admin about successful deletion
                    useNotificationStore.getState().addAdminNotification({
                      id: generateUniqueId(),
                      type: 'success',
                      title: 'Farmer Deleted',
                      message: `${farmerToDelete.farmerName} has been deleted successfully from the database.`,
                      timestamp: new Date()
                    })
                    
                    // Notify the farmer about their account deletion
                    useNotificationStore.getState().addFarmerNotification({
                      id: generateUniqueId(),
                      type: 'warning',
                      title: 'Account Deleted',
                      message: `Your account has been deleted by the administrator. Please contact support if you believe this is an error.`,
                      timestamp: new Date()
                    }, farmerId)
                  } catch (error) {
                    console.error('Error deleting farmer:', error);
                    
                    // Show error notification
                    useNotificationStore.getState().addAdminNotification({
                      id: generateUniqueId(),
                      type: 'error',
                      title: 'Delete Failed',
                      message: `Failed to delete ${farmerToDelete.farmerName}: ${error.message}`,
                      timestamp: new Date()
                    })
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
                            useNotificationStore.getState().addAdminNotification({
                              id: generateUniqueId(),
                              type: 'success',
                              title: 'Profile Updated',
                              message: `Profile picture has been saved for ${selectedFarmerForProfile.farmerName || selectedFarmerForProfile.firstName + ' ' + selectedFarmerForProfile.lastName}`,
                              timestamp: new Date()
                            });
                          } else {
                            throw new Error('Failed to save profile image');
                          }
                        } else {
                          useNotificationStore.getState().addAdminNotification({
                            id: generateUniqueId(),
                            type: 'error',
                            title: 'No Image Selected',
                            message: 'Please select an image before saving',
                            timestamp: new Date()
                          });
                        }
                      } catch (error) {
                        console.error('Error saving profile image:', error);
                        useNotificationStore.getState().addAdminNotification({
                          id: generateUniqueId(),
                          type: 'error',
                          title: 'Save Failed',
                          message: 'Failed to save profile image. Please try again.',
                          timestamp: new Date()
                        });
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
    </div>
  )
}

export default FarmerRegistration
