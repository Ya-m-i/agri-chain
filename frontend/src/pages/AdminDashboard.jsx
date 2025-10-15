"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  HelpCircle,
  FileText,
  Settings,
  LayoutDashboard,
  UserPlus,
  Truck,
  Bell,
  AlertTriangle,
  Info,
  Check,
  MessageSquare,
  TrendingUp,
  Calendar,
  Map,
  Download,
  Plus,
  Search,
  Layers,
  Users,
  ClipboardCheck,
  CheckCircle,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter as FilterIcon,
  PieChart,
  Shield,
  HandHeart,
  Clock,
  Cloud,
} from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useNotificationStore } from "../store/notificationStore"
import { useSocketQuery } from "../hooks/useSocketQuery"
import { getWeatherForKapalong } from "../utils/weatherUtils"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
// Use a relative path that matches your project structure
// If you're unsure about the exact path, you can use a placeholder or comment it out temporarily
// import adminLogoImage from "../assets/images/AgriLogo.png"
import adminLogoImage from "../assets/Images/AgriLogo.png" // Fallback to a placeholder if image can't be found

// Import custom KPI block images
import totalFarmerImage from "../assets/Images/TotalFarmer.png"
import activeImage from "../assets/Images/Active.png"
import pendingImage from "../assets/Images/pending.png"
import assistedImage from "../assets/Images/Assisted.png"
import climateImage from "../assets/Images/climate.png"
import DistributionRecords from "../components/DistributionRecords"
import FarmerRegistration from "../components/FarmerRegistration"
import AdminSettings from "../components/AdminSettings"
import InsuranceClaims from "../components/InsuranceClaims"
import AdminModals from "../components/AdminModals"
import CropInsuranceManagement from "../components/CropInsuranceManagement"
import AdminClaimFilingEnhanced from "../components/AdminClaimFilingEnhanced"
import AdminAssistanceFiling from "../components/AdminAssistanceFiling"
import CropPriceManagement from "../components/CropPriceManagement"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from "chart.js"
import { Bar, Line, Pie, Doughnut, PolarArea } from "react-chartjs-2"
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Recharts imports
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar as RechartsBar, LineChart, Line as RechartsLine, Legend as RechartsLegend, Cell } from 'recharts';
import { showLoading, hideLoading, showError } from "../utils/feedbackUtils"
// Using dynamic import for jsPDF to avoid build issues
// const jsPDF = (() => {
//   let jsPDFModule
//   try {
//     jsPDFModule = require("jspdf").JSPDF
//   } catch (e) {
//     console.error("Error loading jsPDF:", e)
//     jsPDFModule = null
//   }
//   return jsPDFModule
// })()
// import "jspdf-autotable"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
)

// Add custom scrollbar styling to hide scrollbars but maintain functionality
// Add this at the top of the file, right after the imports

// Add a custom scrollbar style to the root element
const scrollbarStyle = `
  /* Hide scrollbar but maintain functionality */
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`

// import { calculateCompensation } from "../utils/insuranceUtils";
import { 
  useClaims, 
  useUpdateClaim, 
  useFarmers, 
  useActiveFarmers,
  useCropInsurance, 
  useAssistances, 
  useAllApplications,
  useUpdateApplicationStatus,
  useCreateAssistance,
  useDeleteAssistance,
  useRegisterFarmer,
  useDeleteFarmer,
  useCropPrices
} from '../hooks/useAPI'

// Utility: Moving Average
// Utility: Find Peaks

// Weather KPI Block Component
const WeatherKPIBlock = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherData = await getWeatherForKapalong()
        setWeather(weatherData)
      } catch (error) {
        console.error('Error fetching weather:', error)
        setWeather({
          temperature: 28,
          condition: "Partly Cloudy",
          description: "Weather data unavailable",
          icon: "🌤️"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <img src={climateImage} alt="Today's Weather" className="h-5 w-5" />
          <div className="text-sm font-bold text-black">Todays Weather</div>
        </div>
        <div className="text-2xl font-bold text-gray-800 mb-1">--°C</div>
        <div className="text-xs text-gray-600 mb-2">Loading...</div>
        <div className="text-2xl mb-2">⏳</div>
        <div className="text-xs text-gray-500 mt-1">Please wait</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <img src={climateImage} alt="Today's Weather" className="h-5 w-5" />
        <div className="text-sm font-bold text-black">Todays Weather</div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{weather?.temperature || 28}°C</div>
      <div className="text-xs text-gray-600 mb-2">Kapalong, Davao</div>
      {/* Weather Icon */}
      <div className="text-2xl mb-2">{weather?.icon || "🌤️"}</div>
      <div className="text-xs text-gray-500 mt-1">{weather?.condition || "Partly Cloudy"}</div>
    </div>
  )
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAssistance, setSelectedAssistance] = useState(null)
  const [showAdminClaimFiling, setShowAdminClaimFiling] = useState(false)
  const [showAdminAssistanceFiling, setShowAdminAssistanceFiling] = useState(false)
  const [showCropPriceManagement, setShowCropPriceManagement] = useState(false)

  // React Query hooks for data management
  // eslint-disable-next-line no-unused-vars
  const { data: claims = [], isLoading: claimsLoading, refetch: refetchClaims } = useClaims()
  // eslint-disable-next-line no-unused-vars
  const { data: farmers = [], isLoading: farmersLoading } = useFarmers()
  // eslint-disable-next-line no-unused-vars
  const { data: activeFarmersData = { activeCount: 0, farmers: [] }, isLoading: activeFarmersLoading } = useActiveFarmers()
  // eslint-disable-next-line no-unused-vars
  const { data: cropInsuranceRecords = [], isLoading: insuranceLoading } = useCropInsurance()
  const { data: assistanceItems = [], isLoading: assistanceLoading, error: assistanceError } = useAssistances()
  // eslint-disable-next-line no-unused-vars
  const { data: allApplications = [], isLoading: applicationsLoading } = useAllApplications()
  const { data: cropPrices = [], isLoading: cropPricesLoading } = useCropPrices()
  
  // Initialize Socket.IO for real-time updates across devices
  // eslint-disable-next-line no-unused-vars
  const { isConnected, socket } = useSocketQuery({
    enableClaimsListener: true, // Enable claim event listeners
    enableApplicationsListener: true, // Enable application event listeners
    onClaimCreated: (newClaim) => {
      console.log('AdminDashboard: New claim received via socket:', newClaim);
      // Refetch claims to update the UI immediately
      refetchClaims();
      // Add notification for admin
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'info',
        title: 'New Claim Submitted',
        message: `New claim ${newClaim.claimNumber || 'pending'} submitted for ${newClaim.crop}`,
        timestamp: new Date()
      });
    },
    onClaimUpdated: (updatedClaim) => {
      console.log('AdminDashboard: Claim updated via socket:', updatedClaim);
      // Refetch claims to update the UI immediately
      refetchClaims();
    }
  });
  
  // React Query mutations
  const updateClaimMutation = useUpdateClaim()
  const updateApplicationMutation = useUpdateApplicationStatus()
  const createAssistanceMutation = useCreateAssistance()
  const deleteAssistanceMutation = useDeleteAssistance()
  const registerFarmerMutation = useRegisterFarmer()
  const deleteFarmerMutation = useDeleteFarmer()
  
  // Note: Combined loading state available but removed due to ESLint unused variable warning
  // const loading = claimsLoading || farmersLoading || insuranceLoading || assistanceLoading || applicationsLoading
  
  // React Query mutation implementation for adding assistance
  const addAssistanceItem = async (assistanceData) => {
    try {
      const result = await createAssistanceMutation.mutateAsync(assistanceData)
      console.log('Successfully added assistance item:', result)
      return result
    } catch (error) {
      console.error('Error adding assistance item:', error)
      throw error
    }
  }
  
  const updateApplicationStatus = async (applicationId, statusData) => {
    return await updateApplicationMutation.mutateAsync({ applicationId, statusData })
  }
  
  // Generate unique notification ID
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // Handle logout
  const handleLogout = () => {
    console.log('AdminDashboard: Logging out...');
    logout(); // This now includes socket disconnection
    navigate("/");
  }

  // Application filtering and pagination states (moved here before computed values)
  // Fixed variable initialization order to prevent reference errors
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('')
  const [applicationSearchTerm, setApplicationSearchTerm] = useState('')
  const [currentApplicationPage, setCurrentApplicationPage] = useState(1)
  const applicationsPerPage = 10

  // Calculate low stock items with useMemo to prevent infinite loops
  const lowStockItems = useMemo(() => 
    assistanceItems.filter(item => (item.availableQuantity || 0) < 5),
    [assistanceItems]
  );

  // Filter and paginate applications
  const filteredApplications = useMemo(() => {
    let filtered = allApplications || [];
    
    // Apply status filter
    if (applicationStatusFilter) {
      filtered = filtered.filter(app => app.status === applicationStatusFilter);
    }
    
    // Apply search filter
    if (applicationSearchTerm) {
      const searchLower = applicationSearchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        const applicationId = app._id?.toLowerCase() || '';
        const farmerName = app.farmerId ? 
          `${app.farmerId.firstName} ${app.farmerId.lastName}`.toLowerCase() : '';
        const assistanceType = app.assistanceId?.assistanceType?.toLowerCase() || '';
        
        return applicationId.includes(searchLower) || 
               farmerName.includes(searchLower) ||
               assistanceType.includes(searchLower);
      });
    }
    
    // Sort by application date (newest first)
    return filtered.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
  }, [allApplications, applicationStatusFilter, applicationSearchTerm]);
  
  const applicationPages = Math.ceil(filteredApplications.length / applicationsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentApplicationPage - 1) * applicationsPerPage;
    return filteredApplications.slice(startIndex, startIndex + applicationsPerPage);
  }, [filteredApplications, currentApplicationPage, applicationsPerPage]);

  // Debug logging for assistance items
  useEffect(() => {
    console.log('AdminDashboard: Assistance items updated:', assistanceItems.length);
    console.log('AdminDashboard: Assistance items:', assistanceItems);
  }, [assistanceItems]);



  const handleViewAssistance = (item) => {
    setSelectedAssistance(item)
    setShowViewModal(true)
  }

  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const mapRef = useRef(null)
  const leafletMapRef = useRef(null)
  const markersLayerRef = useRef(null)
  // Embedded overview map (dashboard)
  // NOTE: declared once here for the dashboard view
  const overviewMapRef = useRef(null)
  const overviewLeafletMapRef = useRef(null)
  const overviewMarkersLayerRef = useRef(null)
  const [showFarmLocationsDropdown, setShowFarmLocationsDropdown] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationAction, setConfirmationAction] = useState({ type: "", claimId: "" })
  
  // Assistance application feedback modal states
  const [showAssistanceFeedbackModal, setShowAssistanceFeedbackModal] = useState(false)
  const [assistanceAction, setAssistanceAction] = useState({ type: "", applicationId: "" })
  const [assistanceFeedback, setAssistanceFeedback] = useState("")

  // State for claim details modal
  const [showClaimDetails, setShowClaimDetails] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)

  // Notification store
  const { 
    adminNotifications, 
    unreadAdminCount, 
    markAdminNotificationsAsRead
  } = useNotificationStore()

  // Form states
  const [showModal, setShowModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  // Filter states
  const [claimsTabView, setClaimsTabView] = useState("pending") // For Insurance Claims tab view
  const [distributionYearFilter, setDistributionYearFilter] = useState(new Date().getFullYear()) // For Distribution Records year filter

  // Map states
  const [mapSearchQuery, setMapSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [mapMode, setMapMode] = useState("view") // view or add
  const [mapCenter, setMapCenter] = useState([7.6167, 125.7]) // Default to Kapalong, Davao del Norte
  const [mapZoom, setMapZoom] = useState(7)
  // (removed duplicate overview map refs)

  // Overview map filters (must be declared before map callbacks that depend on them)
  const [cropFilter, setCropFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all') // 'all' or 1..12
  const [yearFilter, setYearFilter] = useState('all') // 'all' or YYYY

  // Insurance records grouped by farmer (derived from React Query data)
  const insuranceByFarmer = useMemo(() => {
    const grouped = {}
    cropInsuranceRecords.forEach((rec) => {
      const fid = (rec.farmerId && (rec.farmerId._id || rec.farmerId)) || rec.farmer || rec.farmerID
      if (!fid) return
      const key = String(fid)
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(rec)
    })
    return grouped
  }, [cropInsuranceRecords])

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Real-time status indicator
  const [lastRefreshTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Form data
  const initialModalForm = {
    firstName: "",
    middleName: "",
    lastName: "",
    birthday: "",
    gender: "",
    contactNum: "",
    address: "",
    cropType: "",
    cropArea: "",
    farmName: "",
    insuranceType: "",
    premiumAmount: "",
    lotNumber: "",
    lotArea: "",
    agency: "",
    isCertified: false,
    periodFrom: "",
    periodTo: "",
    location: null, // For map coordinates
  }

  const [eventForm, setEventForm] = useState({
    assistanceType: "",
    description: "",
    cropType: "",
    otherCropType: "",
    founderName: "",
    quantity: "",
    dateAdded: "",
    photo: "",
  })

  const [, setEditingEvent] = useState(null) // Will be used when edit functionality is implemented

  const [modalForm, setModalForm] = useState(initialModalForm)

  // Add these state variables for farmer actions
  const [showFarmerDetails, setShowFarmerDetails] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [farmerToDelete, setFarmerToDelete] = useState(null)

  // State for the registration form
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthday: "",
    gender: "",
    contactNum: "",
    address: "",
    cropType: "",
    cropArea: "",
    insuranceType: "",
    lotNumber: "",
    lotArea: "",
    agency: "",
    isCertified: false,
    periodFrom: "",
    periodTo: "",
    username: "",
    password: "",
  })

  // Handle form changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Prepare farmer data with location
      const farmerData = {
        ...formData,
        location: selectedLocation // Include map coordinates if selected
      };
      
      // Register farmer using React Query mutation
      await registerFarmerMutation.mutateAsync(farmerData);
      
      // Reset the form
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        birthday: "",
        gender: "",
        contactNum: "",
        address: "",
        cropType: "",
        cropArea: "",
        insuranceType: "",
        lotNumber: "",
        lotArea: "",
        agency: "",
        isCertified: false,
        periodFrom: "",
        periodTo: "",
        username: "",
        password: "",
      })

      // Reset selected location
      setSelectedLocation(null)

      // Close the modal
      setShowRegisterForm(false)

      // Show success message
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: 'Farmer Registered Successfully',
        message: `${formData.firstName} ${formData.lastName} has been registered successfully.`,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error registering farmer:', error);
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Registration Failed',
        message: `Error: ${error.message}`,
        timestamp: new Date()
      });
    }
  }

  // Function to add farmers to map
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addFarmersToMap = () => {
    if (!markersLayerRef.current || !leafletMapRef.current) return

    // Clear existing markers
    markersLayerRef.current.clearLayers()

    // Add markers for each farmer with location data
    farmers.forEach((farmer) => {
      if (farmer.location) {
        // Get farmer name with fallbacks
        const getFarmerName = (farmer) => {
          // Try different possible name formats
          if (farmer.farmerName) {
            return farmer.farmerName;
          }
          if (farmer.name) {
            return farmer.name;
          }
          if (farmer.firstName || farmer.lastName) {
            return `${farmer.firstName || ''} ${farmer.middleName || ''} ${farmer.lastName || ''}`.replace(/  +/g, ' ').trim();
          }
          // If no name found, use a default
          return 'Unknown Farmer';
        };

        const farmerName = getFarmerName(farmer);
        const cropType = farmer.cropType || 'Not specified';
        const lotArea = farmer.lotArea || farmer.cropArea || 'Not specified';
        const isCertified = farmer.isCertified ? "✓ Certified" : "";

        const marker = L.marker([farmer.location.lat, farmer.location.lng]).bindPopup(`
          <strong>${farmerName}</strong><br>
          Crop: ${cropType}<br>
          Area: ${lotArea}<br>
          ${isCertified}
        `)

        marker.addTo(markersLayerRef.current)
      }
    })
  }

  // Function to reverse geocode coordinates to address
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reverseGeocode = (lat, lng) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.display_name) {
          // Generate a lot number based on coordinates with better formatting
          const lotNumber = `LOT-${Math.abs(lat).toFixed(4)}-${Math.abs(lng).toFixed(4)}`.replace(/\./g, "")

          // Update the form data address and lot number fields
          setFormData((prev) => ({
            ...prev,
            address: data.display_name,
            lotNumber: lotNumber,
          }))
        }
      })
      .catch((error) => {
        console.error("Error reverse geocoding:", error)
      })
  }

  // Color palette for crops (approximate real-life associations)
  // Function to get color for crop type (kept for potential crop-based legend)
  // eslint-disable-next-line no-unused-vars
  const getCropColor = (cropRaw) => {
    if (!cropRaw) return '#3b82f6' // default blue
    const crop = String(cropRaw).toLowerCase().trim()
    if (crop.includes('rice') || crop.includes('palay')) return '#22c55e' // green
    if (crop.includes('corn') || crop.includes('maize')) return '#f59e0b' // yellow/amber
    if (crop.includes('banana')) return '#facc15' // banana yellow
    if (crop.includes('coconut')) return '#8b5a2b' // coconut brown
    if (crop.includes('coffee')) return '#6b4f4f' // coffee brown
    if (crop.includes('cacao') || crop.includes('cocoa')) return '#7b3f00' // dark cocoa brown
    if (crop.includes('sugar') || crop.includes('sugarcane')) return '#16a34a' // cane green
    if (crop.includes('pineapple')) return '#f59e0b' // pineapple yellow
    if (crop.includes('mango')) return '#fbbf24' // mango yellow
    if (crop.includes('rubber')) return '#065f46' // dark green
    if (crop.includes('vegetable') || crop.includes('veg')) return '#10b981' // emerald
    if (crop.includes('fruit')) return '#ef4444' // red/orange
    if (crop.includes('tobacco')) return '#84cc16' // lime
    return '#3b82f6'
  }

  // Emoji/icon representation per crop type
  const getCropEmoji = (cropRaw) => {
    if (!cropRaw) return '📍'
    const crop = String(cropRaw).toLowerCase().trim()
    if (crop.includes('rice') || crop.includes('palay')) return '🌾'
    if (crop.includes('corn') || crop.includes('maize')) return '🌽'
    if (crop.includes('banana')) return '🍌'
    if (crop.includes('coconut')) return '🥥'
    if (crop.includes('coffee')) return '☕'
    if (crop.includes('cacao') || crop.includes('cocoa')) return '🍫'
    if (crop.includes('sugar') || crop.includes('sugarcane')) return '🌿'
    if (crop.includes('pineapple')) return '🍍'
    if (crop.includes('mango')) return '🥭'
    if (crop.includes('rubber')) return '🟢'
    if (crop.includes('vegetable') || crop.includes('veg')) return '🥬'
    if (crop.includes('fruit')) return '🍎'
    if (crop.includes('tobacco')) return '🍂'
    return '📍'
  }

  // Add farmers to the embedded overview map on the dashboard
  const addFarmersToOverviewMap = useCallback(() => {
    if (!overviewMarkersLayerRef.current || !overviewLeafletMapRef.current) return

    overviewMarkersLayerRef.current.clearLayers()

    // Group farmers by barangay for better visualization
    const farmersByBarangay = {}
    const claimsByLocation = {}

    farmers.forEach((farmer) => {
      if (farmer.location && typeof farmer.location.lat === 'number' && typeof farmer.location.lng === 'number') {
        const getFarmerName = (farmerObj) => {
          if (farmerObj.farmerName) return farmerObj.farmerName
          if (farmerObj.name) return farmerObj.name
          if (farmerObj.firstName || farmerObj.lastName) {
            return `${farmerObj.firstName || ''} ${farmerObj.middleName || ''} ${farmerObj.lastName || ''}`.replace(/  +/g, ' ').trim()
          }
          return 'Unknown Farmer'
        }

        const farmerName = getFarmerName(farmer)
        const farmerKey = String(farmer._id || farmer.id || '')
        const insuredList = (insuranceByFarmer[farmerKey] || []).map(r => r.cropType).filter(Boolean)
        const uniqueInsured = Array.from(new Set(insuredList))
        const cropType = uniqueInsured.length > 0 ? uniqueInsured.join(', ') : (farmer.cropType || 'Not specified')
        
        // Extract barangay from address or use coordinates
        const barangay = farmer.address ? 
          farmer.address.split(',').find(part => part.includes('Barangay') || part.includes('Brgy'))?.trim() || 
          farmer.address.split(',')[0]?.trim() || 'Unknown Barangay' : 
          `Area ${Math.floor(farmer.location.lat * 100) % 100}`

        // build a primary date for filtering
        const candidateDates = []
        if (farmer.registrationDate) candidateDates.push(new Date(farmer.registrationDate))
        if (farmer.createdAt) candidateDates.push(new Date(farmer.createdAt))
        if ((insuranceByFarmer[farmerKey] || []).length > 0) {
          (insuranceByFarmer[farmerKey] || []).forEach(rec => {
            if (rec?.plantingDate) candidateDates.push(new Date(rec.plantingDate))
            if (rec?.createdAt) candidateDates.push(new Date(rec.createdAt))
          })
        }
        const primaryDate = candidateDates.find(d => !isNaN(d)) || null

        // apply crop filter
        if (cropFilter !== 'all') {
          const listToCheck = uniqueInsured.length > 0 ? uniqueInsured : [farmer.cropType]
          const hasCrop = listToCheck.some(c => c && c.toLowerCase() === String(cropFilter).toLowerCase())
          if (!hasCrop) return
        }
        // apply year filter
        if (yearFilter !== 'all' && primaryDate) {
          if (primaryDate.getFullYear() !== Number(yearFilter)) return
        }
        // apply month filter (1-12)
        if (monthFilter !== 'all' && primaryDate) {
          if ((primaryDate.getMonth() + 1) !== Number(monthFilter)) return
        }

        // Check insurance status
        const isInsured = uniqueInsured.length > 0
        const hasActiveClaim = claims.some(claim => 
          claim.farmerId === farmerKey || 
          claim.name?.toLowerCase().includes(farmerName.toLowerCase())
        )
        
        // Count assistance received
        const assistanceReceived = allApplications.filter(app => 
          app.farmerId === farmerKey && (app.status === 'approved' || app.status === 'distributed')
        ).length

        const lotArea = farmer.lotArea || farmer.cropArea || 'Not specified'
        const isCertified = farmer.isCertified ? "✓ Certified" : "❌ Not Certified"
        
        // Group by barangay
        if (!farmersByBarangay[barangay]) {
          farmersByBarangay[barangay] = []
        }
        farmersByBarangay[barangay].push({
          farmer, farmerName, cropType, lotArea, isCertified, 
          isInsured, hasActiveClaim, assistanceReceived
        })

        // Track claims by location for heatmap
        const locationKey = `${Math.floor(farmer.location.lat * 1000)},${Math.floor(farmer.location.lng * 1000)}`
        if (!claimsByLocation[locationKey]) {
          claimsByLocation[locationKey] = { lat: farmer.location.lat, lng: farmer.location.lng, count: 0 }
        }
        if (hasActiveClaim) {
          claimsByLocation[locationKey].count++
        }

        // Choose color based on insurance status and claims
        let markerColor
        if (hasActiveClaim) {
          markerColor = '#f97316' // Orange for high claims area
        } else if (isInsured) {
          markerColor = '#22c55e' // Green for insured
        } else {
          markerColor = '#ef4444' // Red for uninsured
        }

        // choose a primary crop for icon
        const primaryCropForIcon = (uniqueInsured[0] || farmer.cropType || '').split(',')[0].trim()
        const emoji = getCropEmoji(primaryCropForIcon)
        
        const iconHtml = `<div style="
          width:32px;
          height:32px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          border:3px solid ${markerColor};
          background:#ffffff;
          color:#111827;
          font-size:14px;
          font-weight:bold;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor:pointer;
        ">${emoji}</div>`
        
        const icon = L.divIcon({
          className: 'enhanced-crop-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        })

        // Enhanced popup with comprehensive information
        const popupContent = `
          <div style="min-width:250px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="background: linear-gradient(135deg, ${markerColor} 0%, ${markerColor}99 100%); color: white; padding: 8px; margin: -9px -9px 8px -9px; border-radius: 4px 4px 0 0;">
              <h4 style="margin: 0; font-size: 16px; font-weight: bold;">👨‍🌾 ${farmerName}</h4>
              <small style="opacity: 0.9;">📍 ${barangay}</small>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <strong style="color: #374151; font-size: 12px;">🌾 CROP:</strong><br>
                <span style="color: #059669; font-weight: 500;">${cropType}</span>
              </div>
              <div>
                <strong style="color: #374151; font-size: 12px;">📏 AREA:</strong><br>
                <span style="color: #0891b2;">${lotArea}</span>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <strong style="color: #374151; font-size: 12px;">🛡️ INSURANCE:</strong><br>
                <span style="color: ${isInsured ? '#059669' : '#dc2626'}; font-weight: 500;">
                  ${isInsured ? '✅ Insured' : '❌ Uninsured'}
                </span>
              </div>
              <div>
                <strong style="color: #374151; font-size: 12px;">🎯 STATUS:</strong><br>
                <span style="color: #7c3aed;">${isCertified}</span>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span><strong>🤝 Assistance Received:</strong></span>
                <span style="color: #059669; font-weight: bold;">${assistanceReceived}</span>
              </div>
              ${hasActiveClaim ? '<div style="color: #f97316; font-size: 11px; margin-top: 4px;"><strong>⚠️ Has Active Claims</strong></div>' : ''}
            </div>
          </div>
        `

        const marker = L.marker([farmer.location.lat, farmer.location.lng], { icon })
          .bindPopup(popupContent, {
            maxWidth: 300,
            className: 'enhanced-popup'
          })

        marker.addTo(overviewMarkersLayerRef.current)
      }
    })
    
    // Add custom CSS for enhanced popups
    if (!document.getElementById('enhanced-popup-styles')) {
      const style = document.createElement('style')
      style.id = 'enhanced-popup-styles'
      style.textContent = `
        .enhanced-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        }
        .enhanced-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        .enhanced-crop-marker {
          transition: transform 0.2s ease;
        }
        .enhanced-crop-marker:hover {
          transform: scale(1.1);
        }
      `
      document.head.appendChild(style)
    }
    
  }, [farmers, insuranceByFarmer, cropFilter, monthFilter, yearFilter, claims, allApplications])

        // Load claims function using React Query
        const loadClaims = useCallback(async () => {
  try {
    showLoading("Loading claims...");
    setIsRefreshing(true);
    await refetchClaims();
  } catch (err) {
    console.error('Failed to load claims from the server:', err);
    showError("Failed to load claims from the server.");
  } finally {
    hideLoading();
    setIsRefreshing(false);
  }
}, [refetchClaims]);

        // Auto-refresh claims with React Query
        useEffect(() => {
          // Set up auto-refresh every 5 seconds for real-time updates
          const intervalId = setInterval(loadClaims, 5000);

          // Cleanup interval on component unmount
          return () => clearInterval(intervalId);
         
        }, [loadClaims]); // loadClaims is now memoized with useCallback

  // Add these useEffect hooks after the other useEffect hooks in the component, before the derived data section

  // Derived data
  const totalFarmers = farmers.length
  const pendingClaims = claims.filter((c) => c.status === "pending").length

  // Event handlers

  const handleEventChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files && files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEventForm(prev => ({ ...prev, photo: ev.target.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setEventForm(prev => ({ ...prev, [name]: value }));
    }
  }

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    console.log("handleEventSubmit called", eventForm);
    // Check for required fields
    if (!eventForm.assistanceType || !eventForm.description || !eventForm.cropType || !eventForm.founderName || !eventForm.quantity || !eventForm.dateAdded || (eventForm.cropType === "Other" && !eventForm.otherCropType)) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
        timestamp: new Date()
      });
      return;
    }
    
    try {
      const assistanceData = {
        ...eventForm,
        cropType: eventForm.cropType === "Other" ? eventForm.otherCropType : eventForm.cropType,
        availableQuantity: parseInt(eventForm.quantity),
        requiresRSBSA: true,
        requiresCertification: false,
        maxQuantityPerFarmer: 100,
        quarterlyLimit: true,
        status: 'active'
      };
      
      await addAssistanceItem(assistanceData);
      
      // No need to manually refresh as addAssistanceItem already does this
      
    setEventForm({
      assistanceType: "",
      description: "",
      cropType: "",
      otherCropType: "",
      founderName: "",
      quantity: "",
      dateAdded: "",
      photo: "",
    })
    setEditingEvent(null)
    setShowEventModal(false)
      
      // Show success notification instead of alert
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: 'Assistance Added Successfully',
        message: `${assistanceData.assistanceType} has been added to the assistance inventory.`,
        timestamp: new Date()
      });

      // Send notification to farmers with matching crop type
      const matchingFarmers = farmers.filter(farmer => 
        farmer.cropType && 
        farmer.cropType.toLowerCase() === assistanceData.cropType.toLowerCase()
      );

      matchingFarmers.forEach(farmer => {
        useNotificationStore.getState().addFarmerNotification({
          id: `new-assistance-${generateUniqueId()}-${farmer._id}`,
          type: 'info',
          title: 'New Assistance Available',
          message: `New ${assistanceData.assistanceType} assistance is now available for ${assistanceData.cropType} farmers!`,
          timestamp: new Date()
        }, farmer._id);
      });

      // Also notify admin about how many farmers were notified
      if (matchingFarmers.length > 0) {
        useNotificationStore.getState().addAdminNotification({
          id: generateUniqueId(),
          type: 'info',
          title: 'Farmers Notified',
          message: `${matchingFarmers.length} farmer(s) with ${assistanceData.cropType} crop type have been notified about the new assistance.`,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('Error adding assistance:', err)
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Add Assistance Failed',
        message: `Error: ${err.message}`,
        timestamp: new Date()
      });
    }
  }

  const handleEditEvent = (index) => {
    const item = assistanceItems[index]
    setEventForm({
      assistanceType: item.assistanceType || "",
      description: item.description || "",
      cropType: item.cropType || "",
      otherCropType: item.otherCropType || "",
      founderName: item.founderName || "",
      quantity: item.availableQuantity?.toString() || "",
      dateAdded: item.dateAdded || "",
      photo: item.photo || "",
    })
    setEditingEvent(index)
    setShowEventModal(true)
  }

  const handleDeleteEvent = (index) => {
    const item = assistanceItems[index]
    setAssistanceAction({ type: 'delete', applicationId: item._id, itemName: item.assistanceType })
    setShowAssistanceFeedbackModal(true)
  }

  // Handle application approval with feedback
  const handleApproveApplication = (applicationId) => {
    setAssistanceAction({ type: 'approved', applicationId });
    setAssistanceFeedback(""); // Reset feedback
    setShowAssistanceFeedbackModal(true);
  };

  // Handle application rejection with feedback
  const handleRejectApplication = (applicationId) => {
    setAssistanceAction({ type: 'rejected', applicationId });
    setAssistanceFeedback(""); // Reset feedback
    setShowAssistanceFeedbackModal(true);
  };

  // Handle application distribution
  const handleDistributeApplication = async (applicationId) => {
    try {
      await updateApplicationStatus(applicationId, { status: 'distributed' });
      // Show success notification instead of alert
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: 'Application Distributed',
        message: 'Application has been marked as distributed successfully.',
        timestamp: new Date()
      });
      // Note: React Query will automatically refresh data
    } catch (err) {
      console.error('Error handling distribution:', err);
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Distribution Failed',
        message: `Error: ${err.message}`,
        timestamp: new Date()
      });
    }
  };

  // Confirm assistance application action with feedback
  const confirmAssistanceAction = async () => {
    const { type: actionType, applicationId, itemName } = assistanceAction;
    try {
      if (actionType === 'delete') {
        // Implement delete assistance with React Query mutation
        await deleteAssistanceMutation.mutateAsync(applicationId);
        
        // Show success notification
        useNotificationStore.getState().addAdminNotification({
          id: generateUniqueId(),
          type: 'success',
          title: 'Assistance Deleted',
          message: `${itemName} has been deleted successfully.`,
          timestamp: new Date()
        });
        
        // Close modal
        setShowAssistanceFeedbackModal(false);
        setAssistanceFeedback("");
        // Note: React Query will automatically refresh data
      } else {
        // Update application status
        await updateApplicationStatus(applicationId, { 
          status: actionType,
          officerNotes: assistanceFeedback 
        });
        
              // Show success notification
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: `Application ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`,
        message: `Application has been ${actionType} successfully.`,
        timestamp: new Date()
      });

      // Send notification to the farmer about their application status
      const application = allApplications.find(app => app._id === applicationId);
      if (application && application.farmerId) {
        const message = actionType === 'approved' 
          ? `Your assistance application has been approved! ${assistanceFeedback ? `Feedback: ${assistanceFeedback}` : ''}`
          : actionType === 'rejected'
          ? `Your assistance application has been rejected. ${assistanceFeedback ? `Reason: ${assistanceFeedback}` : ''}`
          : `Your assistance has been distributed successfully! ${assistanceFeedback ? `Notes: ${assistanceFeedback}` : ''}`;

        useNotificationStore.getState().addFarmerNotification({
          id: `application-${actionType}-${applicationId}`,
          type: actionType === 'approved' ? 'success' : actionType === 'rejected' ? 'error' : 'info',
          title: `Application ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`,
          message: message,
          timestamp: new Date()
        }, application.farmerId);
      }
        
        // Close modal and refresh
        setShowAssistanceFeedbackModal(false);
        setAssistanceFeedback("");
        // Note: React Query will automatically refresh data
      }
    } catch (error) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Action Failed',
        message: `Error: ${error.message}`,
        timestamp: new Date()
      });
    }
  };

  // Add a new state variable for feedback
  const [feedbackText, setFeedbackText] = useState("")

  // Handle claim status updates with confirmation
  const initiateStatusUpdate = (claimId, newStatus, farmerId) => {
    setConfirmationAction({ type: newStatus, claimId, farmerId })
    setFeedbackText("") // Reset feedback text
    setShowConfirmationModal(true)
  }

  const confirmStatusUpdate = async () => {
    const { type: actionType, claimId: actionClaimId, farmerId } = confirmationAction;
    try {
      await updateClaimMutation.mutateAsync({
        id: actionClaimId,
        updateData: {
          status: actionType,
          adminFeedback: feedbackText,
        }
      });
      
      setShowConfirmationModal(false);
      setFeedbackText("");
      
      // Find the claim to get farmer details
      const claim = claims.find(c => c._id === actionClaimId || c.id === actionClaimId);
      
      // Show success notification to admin
      let adminMessage = `Claim has been ${actionType} successfully.`;
      if (actionType === 'approved' && claim && claim.compensation) {
        adminMessage = `Claim approved! Compensation: ₱${claim.compensation.toLocaleString()}. Total Insurance Paid updated.`;
      }
      
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'success',
        title: `Claim ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`,
        message: adminMessage,
        timestamp: new Date()
      });

      // Send notification to the farmer
      if (claim && (claim.farmerId || farmerId)) {
        const farmerIdToNotify = claim.farmerId || farmerId;
        const notificationType = actionType === 'approved' ? 'success' : 'error';
        const notificationTitle = actionType === 'approved' ? 'Claim Approved!' : 'Claim Rejected';
        
        let notificationMessage;
        if (actionType === 'approved') {
          const compensationAmount = claim.compensation ? `₱${claim.compensation.toLocaleString()}` : 'calculated amount';
          notificationMessage = `Your claim for ${claim.crop} damage has been approved! Compensation: ${compensationAmount}. ${feedbackText ? `Feedback: ${feedbackText}` : ''}`;
        } else {
          notificationMessage = `Your claim for ${claim.crop} damage has been rejected. ${feedbackText ? `Reason: ${feedbackText}` : ''}`;
        }

        useNotificationStore.getState().addFarmerNotification({
          id: `claim-${actionType}-${actionClaimId}-${generateUniqueId()}`,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          timestamp: new Date()
        }, farmerIdToNotify);
      }
    } catch (error) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Claim Update Failed',
        message: `Failed to update claim status: ${error.message}`,
        timestamp: new Date()
      });
    }
  };

  // Function to open claim details modal
  const openClaimDetails = (claim) => {
    setSelectedClaim(claim)
    setShowClaimDetails(true)
    
    // Notify admin about viewing the claim
    useNotificationStore.getState().addAdminNotification({
      id: `view-claim-${claim._id || claim.id}`,
      type: 'info',
      title: 'Viewing Claim Details',
      message: `Reviewing claim from ${claim.name} for ${claim.crop} damage.`,
      timestamp: new Date()
    });
  }

  // Format timestamp
  const formatTimestamp = (date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <X className="h-5 w-5 text-red-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  // Toggle notification panel and mark as read
  const toggleNotificationPanel = () => {
    setNotificationOpen(!notificationOpen)
    if (!notificationOpen) {
      markAdminNotificationsAsRead()
    }
  }

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationOpen && !event.target.closest('.notification-panel')) {
        setNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationOpen])

  // Generate analytics data
  const generateAnalytics = () => {
    setAnalyticsLoading(true)

    // Simulate analytics calculation (in a real app, this would be a more complex algorithm)
    setTimeout(() => {
      // Get all claims for analysis
      const allClaims = claims

      // Group claims by month and status
      const monthlyStatusDistribution = {
        January: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        February: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        March: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        April: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        May: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        June: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        July: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        August: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        September: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        October: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        November: { approved: 0, rejected: 0, pending: 0, completed: 0 },
        December: { approved: 0, rejected: 0, pending: 0, completed: 0 },
      }

      // Count by status
      const statusCounts = {
        approved: 0,
        rejected: 0,
        pending: 0,
        completed: 0,
      }

      allClaims.forEach((claim) => {
        const month = new Date(claim.date).getMonth()
        const monthName = new Date(0, month).toLocaleString("default", { month: "long" })
        const status = claim.status || "pending"

        // Increment status count
        statusCounts[status]++

        // Increment monthly status distribution
        if (monthlyStatusDistribution[monthName]) {
          if (!monthlyStatusDistribution[monthName][status]) {
            monthlyStatusDistribution[monthName][status] = 0
          }
          monthlyStatusDistribution[monthName][status]++

          // Also count approved claims as completed
          if (status === "approved") {
            monthlyStatusDistribution[monthName].completed++
            statusCounts.completed++
          }
        }
      })

      // Calculate total claims
      const totalClaims = allClaims.length || 5 // Default to 5 if no claims

      // Predict next year's claims with monthly and status breakdown
      const growthRate = 0.15 // Assuming 15% growth rate
      const predictedNextYear = Math.round(totalClaims * (1 + growthRate))

      // Predict monthly distribution for next year
      const predictedMonthly = {}
      const predictedMonthlyStatus = {}

      Object.keys(monthlyStatusDistribution).forEach((month) => {
        predictedMonthly[month] = 0
        predictedMonthlyStatus[month] = {}

        Object.keys(monthlyStatusDistribution[month]).forEach((status) => {
          const currentCount = monthlyStatusDistribution[month][status] || 0
          const predicted = Math.round(currentCount * (1 + growthRate))
          predictedMonthlyStatus[month][status] = predicted

          // Add to total monthly count
          if (status === "approved" || status === "rejected") {
            predictedMonthly[month] += predicted
          }
        })
      })

      // Predict status distribution for next year
      const predictedStatusCounts = {}
      Object.keys(statusCounts).forEach((status) => {
        predictedStatusCounts[status] = Math.round((statusCounts[status] || 1) * (1 + growthRate))
      })

      // Calculate status efficiency factors
      const statusEfficiency = [
        { status: "Approved", value: (statusCounts.approved / (totalClaims || 1)) * 100 },
        { status: "Rejected", value: (statusCounts.rejected / (totalClaims || 1)) * 100 },
        { status: "Pending", value: (statusCounts.pending / (totalClaims || 1)) * 100 },
        { status: "Completed", value: (statusCounts.completed / (totalClaims || 1)) * 100 },
      ].sort((a, b) => b.value - a.value)

      // If no status efficiency, add some sample data
      if (statusEfficiency.length === 0) {
        statusEfficiency.push(
          { status: "Approved", value: 65 },
          { status: "Rejected", value: 25 },
          { status: "Pending", value: 10 },
          { status: "Completed", value: 60 },
        )
      }

      // Set analytics data
      setAnalyticsData({
        currentYear: {
          totalClaims,
          byMonth: Object.keys(monthlyStatusDistribution).reduce((acc, month) => {
            acc[month] = Object.values(monthlyStatusDistribution[month]).reduce((sum, count) => sum + count, 0)
            return acc
          }, {}),
          byStatus: statusCounts,
          monthlyStatus: monthlyStatusDistribution,
        },
        nextYear: {
          totalClaims: predictedNextYear,
          byMonth: predictedMonthly,
          byStatus: predictedStatusCounts,
          monthlyStatus: predictedMonthlyStatus,
        },
        statusEfficiency,
      })

      setAnalyticsLoading(false)
      setShowAnalyticsModal(true)
    }, 1500)
  }

  // Function to generate PDF report
  const generatePdfReport = async () => {
    try {
      const jsPDFModule = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default
      const doc = new jsPDFModule.jsPDF()

      // Add title
      doc.setFontSize(18)
      doc.text("Agri-Insurance Analytics Report", 14, 22)
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

      // Add summary
      doc.setFontSize(14)
      doc.text("Summary", 14, 40)
      doc.setFontSize(10)
      doc.text(`Total Claims: ${analyticsData.currentYear.totalClaims}`, 14, 50)
      doc.text(`Predicted Claims Next Year: ${analyticsData.nextYear.totalClaims}`, 14, 55)
      doc.text(
        `Growth Rate: ${Math.round(((analyticsData.nextYear.totalClaims - analyticsData.currentYear.totalClaims) / analyticsData.currentYear.totalClaims) * 100)}%`,
        14,
        60,
      )

      // Add status distribution table
      doc.setFontSize(14)
      doc.text("Status Distribution", 14, 75)

      const statusData = [
        ["Approved", analyticsData.currentYear.byStatus.approved || 0, analyticsData.nextYear.byStatus.approved || 0],
        ["Rejected", analyticsData.currentYear.byStatus.rejected || 0, analyticsData.nextYear.byStatus.rejected || 0],
        ["Pending", analyticsData.currentYear.byStatus.pending || 0, analyticsData.nextYear.byStatus.pending || 0],
        ["Completed", analyticsData.currentYear.byStatus.completed || 0, analyticsData.nextYear.byStatus.completed || 0],
      ]

      autoTable(doc, {
        startY: 80,
        head: [["Status", "Current Claims", "Predicted Claims"]],
        body: statusData,
      })

      // Add status assessment
      const startY = doc.lastAutoTable.finalY + 15
      doc.setFontSize(14)
      doc.text("Status Assessment", 14, startY)

      const statusEfficiencyData = analyticsData.statusEfficiency.map((item) => [
        item.status,
        `${Math.round(item.value)}%`,
        item.value > 50 ? "High" : item.value > 30 ? "Medium" : "Low",
      ])

      autoTable(doc, {
        startY: startY + 5,
        head: [["Status Type", "Percentage", "Efficiency Level"]],
        body: statusEfficiencyData,
      })

      // Add recommendations
      const recommendationsY = doc.lastAutoTable.finalY + 15
      doc.setFontSize(14)
      doc.text("Recommendations", 14, recommendationsY)
      doc.setFontSize(10)

      const peakMonthsText = Object.entries(analyticsData.nextYear.byMonth)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([month]) => month)
        .join(" and ")

      doc.text(`1. Focus on improving processing efficiency for ${peakMonthsText} months.`, 14, recommendationsY + 10)
      doc.text(`2. Prepare for increased claim processing during peak months.`, 14, recommendationsY + 15)
      doc.text(`3. Consider adjusting approval criteria based on the status assessment data.`, 14, recommendationsY + 20)

      // Save the PDF
      doc.save("agri-insurance-analytics-report.pdf")
    } catch (error) {
      alert("PDF generation is not available. Please check console for errors.")
      console.error("Error generating PDF:", error)
    }
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)
  const totalPages = Math.ceil(assistanceItems.length / itemsPerPage)
  const currentItems = assistanceItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Debug logging for current items
  useEffect(() => {
    console.log('AdminDashboard: Current items for page', currentPage, ':', currentItems.length);
    console.log('AdminDashboard: Total pages:', totalPages);
  }, [currentItems, currentPage, totalPages]);

  // Load Leaflet when map modal is shown
  useEffect(() => {
    if (showMapModal && mapRef.current) {
      // If map doesn't exist yet, create it
      if (!leafletMapRef.current) {
        // Initialize the map
        leafletMapRef.current = L.map(mapRef.current).setView(mapCenter, 12)

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(leafletMapRef.current)

        // Create a layer for markers
        markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current)

        // Add click handler for adding new locations
        leafletMapRef.current.on("click", (e) => {
          if (mapMode === "add") {
            setSelectedLocation({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
            })

            // Clear existing markers in add mode
            if (markersLayerRef.current) {
              markersLayerRef.current.clearLayers()
            }

            // Add a new marker at the clicked location
            L.marker([e.latlng.lat, e.latlng.lng]).addTo(markersLayerRef.current)

            // Reverse geocode to get address and update form
            reverseGeocode(e.latlng.lat, e.latlng.lng)
          }
        })
      } else {
        // If map exists, just update the view
        leafletMapRef.current.setView(mapCenter, mapZoom)

        // Force a resize to ensure the map renders correctly in the modal
        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize()
          }
        }, 100)
      }

      // Add existing farm locations to the map
      addFarmersToMap()
    }

    // Cleanup function
    return () => {
      if (leafletMapRef.current && !showMapModal) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [showMapModal, mapCenter, mapZoom, mapMode, farmers, reverseGeocode, addFarmersToMap])

  // Load crop insurance records and group by farmer for dashboard overview
  // Note: This useEffect removed as we now use React Query data directly
  // The insuranceByFarmer is computed from cropInsuranceRecords in useMemo above

  // Initialize embedded overview map on dashboard and update markers when farmers change
  useEffect(() => {
    // If leaving dashboard, destroy the map so it re-initializes cleanly on return
    if (activeTab !== 'home') {
      if (overviewLeafletMapRef.current) {
        overviewLeafletMapRef.current.remove()
        overviewLeafletMapRef.current = null
        overviewMarkersLayerRef.current = null
      }
      return
    }
    if (!overviewMapRef.current) return

    if (!overviewLeafletMapRef.current) {
      overviewLeafletMapRef.current = L.map(overviewMapRef.current).setView(mapCenter, 10)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(overviewLeafletMapRef.current)

      overviewMarkersLayerRef.current = L.layerGroup().addTo(overviewLeafletMapRef.current)
    }

    setTimeout(() => {
      if (overviewLeafletMapRef.current) {
        overviewLeafletMapRef.current.invalidateSize()
      }
    }, 100)

    addFarmersToOverviewMap()
  }, [activeTab, farmers, mapCenter, addFarmersToOverviewMap])

  // Function to search for a location on the map
  const searchLocation = () => {
    if (!mapSearchQuery.trim()) return

    // Use Nominatim API for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0]

          if (leafletMapRef.current) {
            leafletMapRef.current.setView([lat, lon], 13)

            if (mapMode === "add") {
              setSelectedLocation({ lat, lng: lon })

              // Clear existing markers
              markersLayerRef.current.clearLayers()

              // Add a new marker at the searched location
              L.marker([lat, lon]).addTo(markersLayerRef.current)

              // Reverse geocode to get address and update form
              reverseGeocode(lat, lon)
            }
          }
        } else {
          alert("Location not found. Please try a different search term.")
        }
      })
      .catch((error) => {
        console.error("Error searching for location:", error)
        alert("Error searching for location. Please try again.")
      })
  }

  // 1. Add state for feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'approve' | 'reject', request }

  // Add at the top of the component, after useState, useEffect, etc.
  const LOW_STOCK_THRESHOLD = 5;

  // Add KPI calculations for dashboard tab:

  // Note: Filter-related code removed as it was unused

  // Chart data preparation removed as charts now use static data or direct calculations

  // Check for low stock items and send notifications
  useEffect(() => {
    if (lowStockItems.length > 0) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'warning',
        title: 'Low Stock Alert',
        message: `The following assistance items are low in stock: ${lowStockItems.map(item => item.assistanceType).join(', ')}. Please restock soon.`,
        timestamp: new Date()
      });
    }
  }, [assistanceItems, lowStockItems]); // Changed dependency to assistanceItems instead of lowStockItems



  // Add at the top of AdminDashboard component:
  const [searchQuery, setSearchQuery] = useState("");

  // Add this state near other filter states

  const availableCrops = useMemo(() => {
    const setCrops = new Set()
    Object.values(insuranceByFarmer || {}).forEach(list => {
      list.forEach(rec => {
        if (rec && rec.cropType) setCrops.add(rec.cropType)
      })
    })
    farmers.forEach(f => { if (f && f.cropType) setCrops.add(f.cropType) })
    return Array.from(setCrops).sort()
  }, [farmers, insuranceByFarmer])

  // Ensure Lato font is available for Admin only
  useEffect(() => {
    const existing = document.getElementById('lato-font')
    if (!existing) {
      const link = document.createElement('link')
      link.id = 'lato-font'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  return (
    <div className="admin-lato min-h-screen bg-gradient-to-b from-lime-50 to-white relative flex flex-col" style={{ fontFamily: "'Lato', sans-serif" }}>
      <style>{scrollbarStyle}</style>
      <style>{`.admin-lato, .admin-lato * { font-family: 'Lato', sans-serif !important; }`}</style>
      {/* Top Navbar */}
      <header style={{ backgroundColor: 'rgb(39, 78, 19)' }} className="text-black">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 md:hidden" aria-label="Toggle menu">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {/* Add logo here */}
            <img src={adminLogoImage || "/placeholder.svg"} alt="Admin Logo" className="h-15 w-auto mr-3" />
            <h1 className="text-xl font-sans font-semibold tracking-wide text-white">ADMIN DASHBOARD</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Real-time Status Indicator */}
            <div className="flex items-center space-x-2 text-white text-sm">
              <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="hidden sm:inline">
                {isRefreshing ? 'Refreshing...' : 'Live'}
              </span>
              <span className="text-xs opacity-75">
                Last: {lastRefreshTime.toLocaleTimeString()}
              </span>
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  loadClaims();
                }}
                className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
                title="Manual refresh"
              >
                ↻
              </button>
            </div>

            {/* Socket Connection Status */}
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`} title={`Real-time updates: ${isConnected ? 'Connected' : 'Disconnected'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {isConnected ? 'Live' : 'Offline'}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={toggleNotificationPanel}
                className={`text-white p-2 rounded-full hover:bg-lime-500 transition-colors relative ${unreadAdminCount > 0 ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: 'rgb(56, 118, 29)' }}
                aria-label="Notifications"
              >
                <Bell size={22} />
                {unreadAdminCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
                    {unreadAdminCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {notificationOpen && (
                <div 
                  className="notification-panel absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 text-white flex justify-between items-center" style={{ backgroundColor: 'rgb(56, 118, 29)' }}>
                    <h3 className="font-semibold">Notifications</h3>
                    {adminNotifications.length > 0 && (
                      <button
                        onClick={() => useNotificationStore.getState().clearNotifications()}
                        className="text-white hover:text-gray-200 text-sm"
                        title="Clear all notifications"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto hide-scrollbar">
                    {adminNotifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      adminNotifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(new Date(notification.timestamp))}
                                  </span>
                                  <button
                                    onClick={() => useNotificationStore.getState().removeAdminNotification(notification.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="Remove notification"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-white text-lime-800 rounded-full flex items-center justify-center shadow-sm">
                  <User size={18} />
                </div>
                <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                  <button
                    onClick={() => {
                      setActiveTab("settings")
                      setDropdownOpen(false)
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      useNotificationStore.getState().addAdminNotification({
                        id: generateUniqueId(),
                        type: 'info',
                        title: 'Help Center',
                        message: 'Help Center coming soon!',
                        timestamp: new Date()
                      });
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <HelpCircle size={16} className="mr-2" />
                    Help Center
                  </button>
                  <button
                    onClick={() => {
                      useNotificationStore.getState().addAdminNotification({
                        id: generateUniqueId(),
                        type: 'success',
                        title: 'Test Notification',
                        message: 'This is a test notification to verify the delete functionality.',
                        timestamp: new Date()
                      });
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Plus size={16} className="mr-2" />
                    Test Notification
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile Sidebar */}
        <div
          id="mobile-sidebar"
          className={`fixed inset-y-0 left-0 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:hidden transition duration-200 ease-in-out z-30 w-64 bg-white shadow-lg`}
        >
          <div className="p-4 bg-lime-800 text-white">
            <h2 className="text-xl font-bold">Menu</h2>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("home")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "home" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={activeTab === "home" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <LayoutDashboard size={24} className="mr-3" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("farmer-registration")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "farmer-registration"
                      ? "text-lime-800 font-bold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={activeTab === "farmer-registration" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <UserPlus size={24} className="mr-3" />
                  Farmer Registration
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setShowMapModal(true)
                    setMapMode("view")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg hover:bg-gray-100 pl-10 ${showMapModal ? "text-lime-800 font-bold" : "text-gray-700"}`}
                  style={showMapModal ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <Map size={24} className="mr-3" />
                  View Farm Locations
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("claims")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "claims" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={activeTab === "claims" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <FileText size={24} className="mr-3" />
                  Cash Assistance Claims
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("distribution")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "distribution" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={activeTab === "distribution" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <Truck size={24} className="mr-3" />
                  Distribution Records
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("assistance")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "assistance" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={activeTab === "assistance" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <ClipboardCheck size={24} className="mr-3" />
                  Assistance Inventory
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("crop-insurance")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "crop-insurance" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={activeTab === "crop-insurance" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <Shield size={24} className="mr-3" />
                  Crop Insurance
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("admin-filing")
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "admin-filing" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={activeTab === "admin-filing" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <FileText size={24} className="mr-3" />
                  File for Farmers
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Desktop Sidebar */}
        <aside 
          className={`hidden md:block ${sidebarExpanded ? 'w-64' : 'w-16'} shadow-lg text-black space-y-6 border-r border-gray-100 sticky top-0 h-screen overflow-y-auto bg-white transition-all duration-300 ease-in-out group`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <br></br>

          <div className="space-y-1 px-3">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
                activeTab === "home" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === "home" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
              title={!sidebarExpanded ? "Dashboard" : ""}
            >
              <LayoutDashboard size={24} className="flex-shrink-0" />
              {sidebarExpanded && <span>Dashboard</span>}
            </button>

            <div>
              <button
                onClick={() => {
                  setActiveTab("farmer-registration")
                  setShowFarmLocationsDropdown(!showFarmLocationsDropdown)
                }}
                className={`flex items-center ${sidebarExpanded ? 'justify-between gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
                  activeTab === "farmer-registration"
                    ? "text-lime-800 font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                style={activeTab === "farmer-registration" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                title={!sidebarExpanded ? "Farmer Registration" : ""}
              >
                <div className="flex items-center gap-3">
                  <UserPlus size={24} className="flex-shrink-0" />
                  {sidebarExpanded && <span>Farmer Registration</span>}
                </div>
                {sidebarExpanded && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showFarmLocationsDropdown ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              <div
                className={`transition-all duration-300 overflow-hidden ${showFarmLocationsDropdown && sidebarExpanded ? "max-h-40" : "max-h-0"}`}
              >
                <button
                  onClick={() => setActiveTab("crop-insurance")}
                  className={`flex items-center ${sidebarExpanded ? 'gap-3 pl-10' : 'justify-center px-2'} py-2 rounded-lg hover:bg-gray-50 w-full text-left transition-colors ${activeTab === 'crop-insurance' ? "text-lime-800 font-bold" : "text-gray-600"}`}
                  style={activeTab === 'crop-insurance' ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                  title={!sidebarExpanded ? "Crop Insurance" : ""}
                >
                  <Shield size={24} className="flex-shrink-0" />
                  {sidebarExpanded && <span>Crop Insurance</span>}
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("claims")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
                activeTab === "claims" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === "claims" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
              title={!sidebarExpanded ? "Cash Assistance Claims" : ""}
            >
              <FileText size={24} className="flex-shrink-0" />
              {sidebarExpanded && <span>Cash Assistance Claims</span>}
            </button>

            <button
              onClick={() => setActiveTab("distribution")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
                activeTab === "distribution"
                  ? "text-lime-800 font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === "distribution" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
              title={!sidebarExpanded ? "Distribution Records" : ""}
            >
              <Truck size={24} className="flex-shrink-0" />
              {sidebarExpanded && <span>Distribution Records</span>}
            </button>

            {sidebarExpanded && <hr className="border-gray-100 my-4" />}

            <button
              onClick={() => setActiveTab("assistance")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
                activeTab === "assistance"
                  ? "text-lime-800 font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === "assistance" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
              title={!sidebarExpanded ? "Assistance Inventory" : ""}
            >
              <ClipboardCheck size={24} className="flex-shrink-0" />
              {sidebarExpanded && <span>Assistance Inventory</span>}
            </button>

            <button
              onClick={() => setActiveTab("admin-filing")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
                activeTab === "admin-filing"
                  ? "text-lime-800 font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === "admin-filing" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
              title={!sidebarExpanded ? "File for Farmers" : ""}
            >
              <FileText size={24} className="flex-shrink-0" />
              {sidebarExpanded && <span>File for Farmers</span>}
            </button>

            {sidebarExpanded && (
              <div className="px-3">
                <button
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left transition-colors text-gray-700 hover:bg-gray-50"
                  title="Add Government Assistance"
                >
                  <Plus size={24} />
                  <span>Add Government Assistance</span>
                </button>
              </div>
            )}
          </div>

          {sidebarExpanded && (
            <div className="px-3 space-y-2 text-sm mt-4 max-h-[300px] overflow-y-auto hide-scrollbar">
              {/* {events.map((event, index) => (
                <div
                  key={index}
                  className="border border-gray-100 p-3 rounded-lg bg-white text-black shadow-sm hover:shadow transition-shadow"
                >
                  <h3 className="font-semibold">{event.eventName}</h3>
                  <p className="text-gray-600 text-xs">Crop: {event.cropType}</p>
                  <p className="text-gray-600 text-xs">Founder: {event.founderName}</p>
                  <p className="text-xs mt-1 text-gray-500">
                    {event.startDate} to {event.endDate}
                  </p>
                </div>
              ))} */}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 bg-gradient-to-b from-zinc-50 to-white">
          {activeTab === "home" && (
            <>
              {/* --- Analytics Filters --- */}
              {/* Remove the old analyticsFilters and setAnalyticsFilters dropdowns and reset button in the analytics section. */}
              {/* Only use the new floating filter drawer and its state for filtering and displaying analytics. */}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 mb-8">
                {/* Farmers Block */}
                <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={totalFarmerImage} alt="Total Farmers" className="h-5 w-5" />
                    <div className="text-sm font-bold text-black">Farmers</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{totalFarmers}</div>
                  <div className="text-xs text-gray-600 mb-2">Total Registered</div>
                  {/* Analytics Mini Chart */}
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-lime-400 to-lime-600 rounded-lg" 
                         style={{ width: `${Math.min((totalFarmers / 1000) * 100, 100)}%` }}>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Growth: +{Math.floor(totalFarmers * 0.05)} this month</div>
                </div>

                {/* Active Block */}
                <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={activeImage} alt="Active Farmers" className="h-5 w-5" />
                    <div className="text-sm font-bold text-black">Active</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{activeFarmersData.activeCount || 0}</div>
                  <div className="text-xs text-gray-600 mb-2">Online Today</div>
                  {/* Analytics Mini Chart */}
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-lg" 
                         style={{ width: `${Math.min(((activeFarmersData.activeCount || 0) / Math.max(totalFarmers, 1)) * 100, 100)}%` }}>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Active Rate: {Math.round(((activeFarmersData.activeCount || 0) / Math.max(totalFarmers, 1)) * 100)}%</div>
                </div>

                {/* Pending Block */}
                <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={pendingImage} alt="Pending Claims" className="h-5 w-5" />
                    <div className="text-sm font-bold text-black">Pending</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{pendingClaims}</div>
                  <div className="text-xs text-gray-600 mb-2">Insurance Claims</div>
                  {/* Analytics Mini Chart */}
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg" 
                         style={{ width: `${Math.min((pendingClaims / Math.max(totalFarmers, 1)) * 100, 100)}%` }}>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Processing: {Math.round((pendingClaims / Math.max(claims.length, 1)) * 100)}%</div>
                </div>

                {/* Farmer Assisted Block */}
                <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={assistedImage} alt="Farmer Assisted" className="h-5 w-5" />
                    <div className="text-sm font-bold text-black">Farmer Assisted</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{(() => {
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    return allApplications.filter(app => {
                      const appDate = new Date(app.createdAt || app.date);
                      return (app.status === 'distributed' || app.status === 'approved') && 
                             appDate.getMonth() === currentMonth && 
                             appDate.getFullYear() === currentYear;
                    }).length;
                  })()}</div>
                  <div className="text-xs text-gray-600 mb-2">This Month</div>
                  {/* Analytics Mini Chart */}
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg" 
                         style={{ width: `${Math.min(((() => {
                           const currentMonth = new Date().getMonth();
                           const currentYear = new Date().getFullYear();
                           return allApplications.filter(app => {
                             const appDate = new Date(app.createdAt || app.date);
                             return (app.status === 'distributed' || app.status === 'approved') && 
                                    appDate.getMonth() === currentMonth && 
                                    appDate.getFullYear() === currentYear;
                           }).length;
                         })() / Math.max(totalFarmers, 1)) * 100, 100)}%` }}>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Monthly Target: {Math.floor(totalFarmers * 0.1)}</div>
                </div>

                {/* Todays Weather Block */}
                <WeatherKPIBlock />
              </div>

              {/* Chart Visualizations Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                {/* Claims Trend Over Time - Left side, larger */}
                <div className="lg:col-span-2 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Claims Trend Over Time</h3>
                    <select
                      value={distributionYearFilter}
                      onChange={(e) => setDistributionYearFilter(parseInt(e.target.value))}
                      className="px-3 py-2 text-sm border rounded-md"
                    >
                      {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={(() => {
                          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          return monthNames.map((month, index) => {
                            const monthClaims = claims.filter(c => new Date(c.date).getMonth() === index && new Date(c.date).getFullYear() === distributionYearFilter);
                            return {
                              month,
                              filed: monthClaims.length,
                              approved: monthClaims.filter(c => c.status === 'approved').length,
                              rejected: monthClaims.filter(c => c.status === 'rejected').length
                            };
                          });
                        })()} 
                        margin={{ top: 30, right: 40, left: 30, bottom: 80 }}
                      >
                        <defs>
                          <linearGradient id="filedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2f7d32" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#2f7d32" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="rejectedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgb(174, 200, 28)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="rgb(174, 200, 28)" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="month" 
                          fontSize={14}
                          axisLine={true}
                          tickLine={false}
                          label={{ value: 'Month', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 14 } }}
                        />
                        <YAxis 
                          fontSize={14}
                          axisLine={true}
                          tickLine={false}
                          label={{ value: 'Number of Claims', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 14 } }}
                        />
                        <RechartsTooltip 
                          formatter={(value, name) => {
                            const labels = {
                              filed: 'Filed Claims',
                              approved: 'Approved Claims', 
                              rejected: 'Rejected Claims'
                            };
                            return [value, labels[name] || name];
                          }}
                        />
                        <RechartsLegend 
                          verticalAlign="top" 
                          height={36}
                          formatter={(value) => {
                            const labels = {
                              filed: 'Filed Claims',
                              approved: 'Approved Claims',
                              rejected: 'Rejected Claims'
                            };
                            return labels[value] || value;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="filed" 
                          stroke="#14b8a6" 
                          strokeWidth={3}
                          fill="url(#filedGradient)" 
                          fillOpacity={1}
                          dot={false}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="approved" 
                          stroke="#2f7d32" 
                          strokeWidth={3}
                          fill="url(#approvedGradient)" 
                          fillOpacity={1}
                          dot={false}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="rejected" 
                          stroke="rgb(174, 200, 28)" 
                          strokeWidth={3}
                          fill="url(#rejectedGradient)" 
                          fillOpacity={1}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right side - Two charts stacked */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Assistance Application Breakdown - Top */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Assistance Application Breakdown</h3>
                    <div className="h-[220px] relative">
                      <Pie
                        data={{
                          labels: ['Pending', 'Approved', 'Rejected', 'Distributed'],
                          datasets: [{
                            data: [
                              allApplications.filter(app => app.status === 'pending').length,
                              allApplications.filter(app => app.status === 'approved').length,
                              allApplications.filter(app => app.status === 'rejected').length,
                              allApplications.filter(app => app.status === 'distributed').length
                            ],
                            backgroundColor: ['#84cc16', '#22c55e', 'rgb(174, 200, 28)', '#10b981'],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { 
                            legend: { 
                              position: 'bottom', 
                              labels: { 
                                font: { size: 14 },
                                padding: 15,
                                usePointStyle: true,
                                generateLabels: function(chart) {
                                  const data = chart.data;
                                  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                  return data.labels.map((label, index) => {
                                    const value = data.datasets[0].data[index];
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                    return {
                                      text: `${label}: ${value} (${percentage}%)`,
                                      fillStyle: data.datasets[0].backgroundColor[index],
                                      strokeStyle: data.datasets[0].backgroundColor[index],
                                      lineWidth: 0,
                                      pointStyle: 'circle'
                                    };
                                  });
                                }
                              } 
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.parsed;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                  return `${label}: ${value} (${percentage}%)`;
                                }
                              }
                            }
                          },
                          layout: {
                            padding: {
                              top: 20,
                              bottom: 20
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Crop Market Prices - Bottom */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Kapalong Crop Market Prices</h3>
                      <button
                        onClick={() => setShowCropPriceManagement(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-lime-600 text-white rounded-lg text-xs font-medium hover:bg-lime-700 transition-colors"
                      >
                        <Settings size={14} />
                        Manage Prices
                      </button>
                    </div>
                    <div className="h-[220px]">
                      {cropPricesLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          Loading prices...
                        </div>
                      ) : cropPrices.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                          <div className="text-center">
                            <p>No crop prices set yet</p>
                            <button
                              onClick={() => setShowCropPriceManagement(true)}
                              className="mt-2 text-lime-600 hover:underline"
                            >
                              Click to add prices
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={cropPrices.slice(0, 8).map(crop => ({
                              crop: crop.cropType ? `${crop.cropName} (${crop.cropType})` : crop.cropName,
                              price: crop.pricePerKg,
                              unit: crop.unit,
                              cropName: crop.cropName
                            }))}
                          >
                            <XAxis 
                              dataKey="crop" 
                              fontSize={12} 
                              angle={0} 
                              textAnchor="middle" 
                              height={80}
                              axisLine={true}
                              tickLine={false}
                              interval={0}
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis 
                              fontSize={10}
                              axisLine={true}
                              tickLine={false}
                            />
                            <RechartsTooltip 
                              formatter={(value, name, props) => [`₱${value}/${props.payload.unit}`, 'Price']} 
                            />
                            <RechartsBar 
                              dataKey="price" 
                              radius={[4, 4, 0, 0]}
                            >
                              {cropPrices.slice(0, 8).map((crop, index) => {
                                const cropName = crop.cropName.toLowerCase();
                                let fillColor = '#84cc16'; // default lime
                                if (cropName.includes('rice') || cropName.includes('palay')) fillColor = '#22c55e'; // green
                                else if (cropName.includes('corn')) fillColor = '#f59e0b'; // amber
                                else if (cropName.includes('banana')) fillColor = '#facc15'; // yellow
                                else if (cropName.includes('coconut')) fillColor = '#8b4513'; // brown
                                else if (cropName.includes('coffee')) fillColor = '#6b4423'; // coffee brown
                                else if (cropName.includes('cacao') || cropName.includes('cocoa')) fillColor = '#7b3f00'; // dark brown
                                else if (cropName.includes('sugar')) fillColor = '#16a34a'; // green
                                else if (cropName.includes('pineapple')) fillColor = '#fbbf24'; // pineapple yellow
                                else if (cropName.includes('mango')) fillColor = '#fb923c'; // mango orange
                                else if (cropName.includes('rubber')) fillColor = '#065f46'; // dark green
                                else if (cropName.includes('vegetable')) fillColor = '#10b981'; // emerald
                                else if (cropName.includes('tobacco')) fillColor = '#92400e'; // brown
                                return <Cell key={`cell-${index}`} fill={fillColor} />;
                              })}
                            </RechartsBar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider between Chart Visualizations and Map Visualization */}
              <div className="mt-8 mb-6">
                <hr className="border-gray-200" />
              </div>

              {/* Overview: Farmers Map (embedded) */}
              <div className="bg-white rounded-2xl p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-800">🗺️ Geo-Tagging Map Overview</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={cropFilter}
                      onChange={(e) => setCropFilter(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md"
                      title="Filter by crop"
                    >
                      <option value="all">All Crops</option>
                      {availableCrops.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md"
                      title="Filter by month"
                    >
                      <option value="all">All Months</option>
                      <option value="1">Jan</option>
                      <option value="2">Feb</option>
                      <option value="3">Mar</option>
                      <option value="4">Apr</option>
                      <option value="5">May</option>
                      <option value="6">Jun</option>
                      <option value="7">Jul</option>
                      <option value="8">Aug</option>
                      <option value="9">Sep</option>
                      <option value="10">Oct</option>
                      <option value="11">Nov</option>
                      <option value="12">Dec</option>
                    </select>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md"
                      title="Filter by year"
                    >
                      <option value="all">All Years</option>
                      {Array.from({ length: 2025 - 1990 + 1 }, (_, i) => 1990 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Map Legend and Controls */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-gray-700">Legend:</div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-600">Insured</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-gray-600">Uninsured</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-xs text-gray-600">High Claims Area</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input 
                          type="checkbox" 
                          defaultChecked={false}
                          onChange={(e) => {
                            // Toggle heatmap layer
                            if (overviewLeafletMapRef.current) {
                              const isChecked = e.target.checked;
                              // Implementation for heatmap toggle would go here
                              console.log('Heatmap toggle:', isChecked);
                            }
                          }}
                          className="rounded"
                        />
                        Claims Heatmap
                      </label>
                      
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input 
                          type="checkbox" 
                          defaultChecked={false}
                          onChange={(e) => {
                            // Toggle disaster overlay
                            if (overviewLeafletMapRef.current) {
                              const isChecked = e.target.checked;
                              // Implementation for disaster overlay would go here
                              console.log('Disaster overlay toggle:', isChecked);
                            }
                          }}
                          className="rounded"
                        />
                        Disaster Impact
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    💡 Hover over pins for detailed farmer information • Color-coded by barangay and insurance status
                  </div>
                </div>
                
                <div className="w-full h-[420px] rounded-lg border border-gray-200 overflow-hidden">
                  <div ref={overviewMapRef} className="w-full h-full" />
                </div>
              </div>

              {/* Pending Insurance Claims Section */}
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <AlertTriangle size={16} className="text-amber-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Pending Insurance Claims</h2>
                  <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    {claims.filter((c) => c.status === "pending").length}
                  </span>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden">
                  {claims.filter((c) => c.status === "pending").length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <ClipboardCheck size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No pending claims at the moment</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {claims.filter((c) => c.status === "pending")
                        .sort((a, b) => {
                          const damageA = Number.parseFloat(a.degreeOfDamage) || Number.parseFloat(a.areaDamaged) || 0;
                          const damageB = Number.parseFloat(b.degreeOfDamage) || Number.parseFloat(b.areaDamaged) || 0;
                          return damageB - damageA;
                        })
                        .map((claim) => (
                          <div key={claim._id} className="p-3 hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-8 bg-amber-400 rounded-full flex-shrink-0"></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{claim.name}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                      <span className="flex items-center">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                                        {claim.crop || claim.cropType || "Unknown Crop"}
                                      </span>
                                      <span className="flex items-center">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                                        {claim.damageType || claim.type || "Damage Type"}
                                      </span>
                                      <span className="flex items-center font-mono">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                                        ID: {(claim.claimNumber || claim._id)?.slice(-6)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  Pending Review
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <FileText size={16} className="text-lime-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Recent Claims</h2>
                  <span className="ml-2 px-2 py-1 bg-lime-100 text-lime-700 text-xs font-medium rounded-full">
                    {claims.slice(0, 5).length}
                  </span>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden">
                  {claims.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No recent claims found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {claims.slice(0, 5).map((claim) => (
                        <div key={claim._id} className="p-3 hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${
                                  claim.status === 'approved' ? 'bg-green-400' :
                                  claim.status === 'rejected' ? 'bg-[rgb(26,61,59)]' :
                                  claim.status === 'pending' ? 'bg-amber-400' :
                                  'bg-gray-400'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{claim.name}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center">
                                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                                      {claim.crop || claim.cropType || "Unknown Crop"}
                                    </span>
                                    <span className="flex items-center">
                                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                                      {new Date(claim.date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center font-mono">
                                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                                      ID: {(claim.claimNumber || claim._id)?.slice(-6)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                                claim.status === 'rejected' ? 'bg-[rgb(26,61,59)] text-white' :
                                claim.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {claim.status ? claim.status.charAt(0).toUpperCase() + claim.status.slice(1) : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "claims" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Cash Assistance Claims</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setClaimsTabView("pending")}
                    className={`px-4 py-2 rounded-lg ${
                      claimsTabView === "pending"
                        ? "bg-lime-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Pending Cash Assistance Claims
                  </button>
                  <button
                    onClick={() => setClaimsTabView("all")}
                    className={`px-4 py-2 rounded-lg ${
                      claimsTabView === "all"
                        ? "bg-lime-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Claims
                  </button>
                </div>
              </div>
              {(claims && claims.length > 0) ? (
                <InsuranceClaims
                  claims={claims}
                  claimsTabView={claimsTabView}
                  setClaimsTabView={setClaimsTabView}
                  showClaimDetails={showClaimDetails}
                  setShowClaimDetails={setShowClaimDetails}
                  selectedClaim={selectedClaim}
                  setSelectedClaim={setSelectedClaim}
                  showConfirmationModal={showConfirmationModal}
                  setShowConfirmationModal={setShowConfirmationModal}
                  confirmationAction={confirmationAction}
                  setConfirmationAction={setConfirmationAction}
                  openClaimDetails={openClaimDetails}
                  initiateStatusUpdate={initiateStatusUpdate}
                  confirmStatusUpdate={confirmStatusUpdate}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              ) : (
                <div className="text-center py-10 text-gray-500 italic text-lg">No claims found.</div>
              )}
            </div>
          )}

          {activeTab === "farmer-registration" && (
            <FarmerRegistration
              showMapModal={showMapModal}
              setShowMapModal={setShowMapModal}
              mapMode={mapMode}
              setMapMode={setMapMode}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              mapCenter={mapCenter}
              setMapCenter={setMapCenter}
              mapZoom={mapZoom}
              setMapZoom={setMapZoom}
              mapRef={mapRef}
              leafletMapRef={leafletMapRef}
              markersLayerRef={markersLayerRef}
              mapSearchQuery={mapSearchQuery}
              setMapSearchQuery={setMapSearchQuery}
              searchLocation={searchLocation}
              addFarmersToMap={addFarmersToMap}
              formData={formData}
              setFormData={setFormData}
              reverseGeocode={reverseGeocode}
            />
          )}

          {activeTab === "distribution" && (
            <DistributionRecords
              claims={claims} // All cash assistance claims
              approvedClaims={claims.filter(c => c.status === "approved").length}
              generateAnalytics={generateAnalytics}
              analyticsLoading={analyticsLoading}
              allApplications={allApplications} // All seed assistance applications
            />
          )}

          {activeTab === "assistance" && (
            <div className="p-6">
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mr-4">Assistance Inventory</h2>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <span className="text-xl font-bold">+</span>
                  <span className="font-semibold">Add New Assistance</span>
                </button>
              </div>

              {/* Loading State */}
              {assistanceLoading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading assistance inventory...</p>
                </div>
              )}

              {/* Error State */}
              {assistanceError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>Error: {assistanceError}</p>
                </div>
              )}

              {/* Assistance Inventory List */}
              {!assistanceLoading && !assistanceError && (
              <div className="bg-white/60 rounded-2xl shadow-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="relative group rounded-2xl shadow-xl p-0 bg-gradient-to-br from-lime-100 via-white to-lime-50 border-2 border-lime-200 hover:shadow-2xl transition-all duration-300 flex flex-col items-stretch min-h-[260px]"
                      >
                        {/* KPI Ribbon */}
                        <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-xs font-bold tracking-wider z-10 bg-lime-600 text-white shadow-md">
                          {item.assistanceType}
                        </div>
                        {/* Photo */}
                        {item.photo && (
                          <div className="flex items-center justify-center w-full h-32 rounded-t-2xl border-b border-lime-100 overflow-hidden">
                            <img src={item.photo} alt="Assistance Logo" className="object-contain w-full h-full" />
                          </div>
                        )}
                        {/* KPI Content */}
                        <div className="flex-1 flex flex-col justify-between p-5 gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                (item.availableQuantity || 0) < 5
                                  ? 'bg-red-100 text-red-700 border border-red-300'
                                  : 'bg-lime-100 text-lime-800 border-lime-300'
                              }`}>
                                {(item.availableQuantity || 0) < 5 ? 'Low Stock' : 'Available'}
                            </span>
                              {item.requiresRSBSA && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300 ml-2">
                                  RSBSA Required
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>Crop: <span className="font-semibold text-gray-700">{item.cropType}</span></span>
                              <span>Founder: <span className="font-semibold text-gray-700">{item.founderName}</span></span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>Available: <span className="font-semibold text-gray-700">{item.availableQuantity || 0}</span></span>
                              <span>Max/Farmer: <span className="font-semibold text-gray-700">{item.maxQuantityPerFarmer || 100}kg</span></span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>Date Added: <span className="font-semibold text-gray-700">{new Date(item.dateAdded).toLocaleDateString()}</span></span>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleViewAssistance(item)}
                              className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditEvent(index)}
                              className="flex-1 flex items-center justify-center gap-1 bg-lime-600 text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-lime-700 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(index)}
                              className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No assistance items available
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-lime-100 text-lime-800 hover:bg-lime-200"
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === index + 1
                            ? "bg-lime-700 text-white"
                            : "bg-lime-100 text-lime-800 hover:bg-lime-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-lime-100 text-lime-800 hover:bg-lime-200"
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}

              {/* Assistance Applications Management */}
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Assistance Applications</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Status Filter */}
                    <select 
                      value={applicationStatusFilter}
                      onChange={(e) => {
                        setApplicationStatusFilter(e.target.value);
                        setCurrentApplicationPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-lime-500 focus:border-lime-500"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="distributed">Distributed</option>
                    </select>
                    
                    {/* Search by Application ID or Farmer Name */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search ID or farmer name..."
                        value={applicationSearchTerm}
                        onChange={(e) => {
                          setApplicationSearchTerm(e.target.value);
                          setCurrentApplicationPage(1);
                        }}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-lime-500 focus:border-lime-500 w-64"
                      />
                    </div>
                    
                    {/* Refresh Button */}
                    <button
                      onClick={() => {
                        console.log('Refreshing applications...');
                        // TODO: Add refetch for allApplications when available
                        console.log('React Query will automatically refresh data');
                      }}
                      className="px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 transition text-sm font-medium flex items-center gap-2"
                    >
                      <Activity className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  {filteredApplications.length > 0 ? (
                    <>
                      <div className="p-4 border-b text-sm text-gray-600 bg-gray-50 rounded-t-lg">
                        <div className="flex justify-between items-center">
                          <span>
                            Showing {((currentApplicationPage - 1) * applicationsPerPage) + 1} to {Math.min(currentApplicationPage * applicationsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
                            {applicationStatusFilter && ` (filtered by: ${applicationStatusFilter})`}
                            {applicationSearchTerm && ` (search: "${applicationSearchTerm}")`}
                          </span>
                          <span className="text-xs text-gray-500">
                            Total in database: {allApplications.length}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assistance Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Requested</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarter</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedApplications.map((application) => (
                              <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {application._id.slice(-6).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 truncate max-w-[120px]" title={application._id}>
                                    {application._id}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="font-medium text-gray-900">
                                    {application.farmerId ? `${application.farmerId.firstName} ${application.farmerId.lastName}` : 'N/A'}
                                  </div>
                                  {application.farmerId?.cropType && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Primary crop: {application.farmerId.cropType}
                                    </div>
                                  )}
                                  {application.farmerId?.rsbsaRegistered && (
                                    <div className="text-xs text-green-600 mt-1">✓ RSBSA Registered</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="font-medium text-gray-900">
                                    {application.assistanceId?.assistanceType || 'N/A'}
                                  </div>
                                  {application.assistanceId?.cropType && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      For: {application.assistanceId.cropType} farmers
                                    </div>
                                  )}
                                  {application.assistanceId?.founderName && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      By: {application.assistanceId.founderName}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="font-medium">{application.requestedQuantity}kg</div>
                                  {application.assistanceId?.maxQuantityPerFarmer && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Max allowed: {application.assistanceId.maxQuantityPerFarmer}kg
                                    </div>
                                  )}
                                  {application.assistanceId?.availableQuantity !== undefined && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Available: {application.assistanceId.availableQuantity}kg
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {application.quarter}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div>{new Date(application.applicationDate).toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {new Date(application.applicationDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    application.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : application.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : application.status === "distributed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                  </span>
                                  {application.reviewDate && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      Reviewed: {new Date(application.reviewDate).toLocaleDateString()}
                                    </div>
                                  )}
                                  {application.distributionDate && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      Distributed: {new Date(application.distributionDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {application.status === 'pending' && (
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleApproveApplication(application._id)}
                                        className="text-green-600 hover:text-green-800 font-medium px-3 py-1 rounded border border-green-200 hover:bg-green-50 transition text-xs"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleRejectApplication(application._id)}
                                        className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition text-xs"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {application.status === 'approved' && (
                                    <button 
                                      onClick={() => handleDistributeApplication(application._id)}
                                      className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition text-xs"
                                    >
                                      Mark Distributed
                                    </button>
                                  )}
                                  {(application.status === 'rejected' || application.status === 'distributed') && (
                                    <span className="text-gray-400 text-xs">No actions available</span>
                                  )}
                                  {application.officerNotes && (
                                    <div className="text-xs text-gray-500 mt-2 italic" title={application.officerNotes}>
                                      Note: {application.officerNotes.length > 20 ? application.officerNotes.substring(0, 20) + '...' : application.officerNotes}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination for Applications */}
                      {applicationPages > 1 && (
                        <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg">
                          <div className="text-sm text-gray-500">
                            Page {currentApplicationPage} of {applicationPages}
                          </div>
                          <nav className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentApplicationPage(1)}
                              disabled={currentApplicationPage === 1}
                              className={`px-3 py-1 rounded-md text-sm ${
                                currentApplicationPage === 1
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-lime-100 text-lime-800 hover:bg-lime-200"
                              }`}
                            >
                              First
                            </button>
                            <button
                              onClick={() => setCurrentApplicationPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentApplicationPage === 1}
                              className={`px-3 py-1 rounded-md text-sm ${
                                currentApplicationPage === 1
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-lime-100 text-lime-800 hover:bg-lime-200"
                              }`}
                            >
                              Previous
                            </button>
                            {[...Array(Math.min(5, applicationPages))].map((_, index) => {
                              const pageNumber = currentApplicationPage <= 3 ? index + 1 : 
                                currentApplicationPage >= applicationPages - 2 ? applicationPages - 4 + index :
                                currentApplicationPage - 2 + index;
                              if (pageNumber > 0 && pageNumber <= applicationPages) {
                                return (
                                  <button
                                    key={pageNumber}
                                    onClick={() => setCurrentApplicationPage(pageNumber)}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                      currentApplicationPage === pageNumber
                                        ? "bg-lime-700 text-white"
                                        : "bg-lime-100 text-lime-800 hover:bg-lime-200"
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                );
                              }
                              return null;
                            })}
                            <button
                              onClick={() => setCurrentApplicationPage(prev => Math.min(prev + 1, applicationPages))}
                              disabled={currentApplicationPage === applicationPages}
                              className={`px-3 py-1 rounded-md text-sm ${
                                currentApplicationPage === applicationPages
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-lime-100 text-lime-800 hover:bg-lime-200"
                              }`}
                            >
                              Next
                            </button>
                            <button
                              onClick={() => setCurrentApplicationPage(applicationPages)}
                              disabled={currentApplicationPage === applicationPages}
                              className={`px-3 py-1 rounded-md text-sm ${
                                currentApplicationPage === applicationPages
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-lime-100 text-lime-800 hover:bg-lime-200"
                              }`}
                            >
                              Last
                            </button>
                          </nav>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8">
                      <div className="text-center py-8 text-gray-500">
                        {allApplications.length === 0 ? (
                          <>
                            <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-medium">No assistance applications found</p>
                            <p className="text-sm mt-2">Applications from farmers will appear here once they apply for assistance.</p>
                          </>
                        ) : (
                          <>
                            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-medium">No applications match your filters</p>
                            <p className="text-sm mt-2">Try adjusting your search criteria or clearing filters.</p>
                            <button
                              onClick={() => {
                                setApplicationStatusFilter('');
                                setApplicationSearchTerm('');
                                setCurrentApplicationPage(1);
                              }}
                              className="mt-4 px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 transition text-sm font-medium"
                            >
                              Clear All Filters
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* View Assistance Modal */}
          {showViewModal && selectedAssistance && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Assistance Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Assistance Type</h3>
                    <p className="text-gray-900">{selectedAssistance.assistanceType}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Founder</h3>
                    <p className="text-gray-900">{selectedAssistance.founderName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Quantity</h3>
                    <p className="text-gray-900">{selectedAssistance.quantity}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Date Added</h3>
                    <p className="text-gray-900">{selectedAssistance.dateAdded}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Farmers Availed</h3>
                    <div className="mt-2">
                      {selectedAssistance.farmersAvailed?.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedAssistance.farmersAvailed.map((farmer, index) => (
                            <li key={index} className="text-gray-900">
                              {farmer}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No farmers have availed this assistance yet.</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "crop-insurance" && (
            <div className="p-6">
              <CropInsuranceManagement />
            </div>
          )}

          {activeTab === "admin-filing" && (
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">File for Farmers</h1>
                  <p className="text-gray-600">
                    File insurance claims and assistance applications on behalf of farmers who don't have mobile phones.
                    This feature allows DA staff to help farmers who visit the office directly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Claim Card */}
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">File Insurance Claim</h2>
                        <p className="text-gray-600 text-sm">Submit insurance claims for farmers</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Help farmers file insurance claims when they visit the DA office. 
                      Select the farmer and fill out the claim form with all necessary details.
                    </p>
                    <button
                      onClick={() => setShowAdminClaimFiling(true)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-5 w-5" />
                      <span>File Claim for Farmer</span>
                    </button>
                  </div>

                  {/* File Assistance Card */}
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-green-100 rounded-lg mr-4">
                        <HandHeart className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">File Assistance Application</h2>
                        <p className="text-gray-600 text-sm">Submit government assistance applications</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Help farmers apply for government assistance programs when they visit the DA office.
                      Check eligibility and submit applications on their behalf.
                    </p>
                    <button
                      onClick={() => setShowAdminAssistanceFiling(true)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <HandHeart className="h-5 w-5" />
                      <span>File Assistance for Farmer</span>
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Instructions for DA Staff</h3>
                  <div className="space-y-2 text-yellow-700">
                    <p>• <strong>For Claims:</strong> Select the farmer from the database, fill out the claim form with damage details, and submit. The farmer will need to sign the printed claim form.</p>
                    <p>• <strong>For Assistance:</strong> Check farmer eligibility, select appropriate assistance program, and submit application. Ensure farmer meets all requirements.</p>
                    <p>• <strong>Documentation:</strong> Always verify farmer identity and collect necessary signatures before submitting applications.</p>
                    <p>• <strong>Follow-up:</strong> Keep track of submitted applications and inform farmers about status updates.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && <AdminSettings />}
        </main>
      </div>

      {/* Admin Modals Component */}
      <AdminModals
        showModal={showModal}
        setShowModal={setShowModal}
        modalForm={modalForm}
        setModalForm={setModalForm}
        initialModalForm={initialModalForm}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        setShowMapModal={setShowMapModal}
        setMapMode={setMapMode}
        showEventModal={showEventModal}
        setShowEventModal={setShowEventModal}
        eventForm={eventForm}
        handleEventChange={handleEventChange}
        handleEventSubmit={handleEventSubmit}
        showRegisterForm={showRegisterForm}
        setShowRegisterForm={setShowRegisterForm}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        showClaimDetails={showClaimDetails}
        setShowClaimDetails={setShowClaimDetails}
        selectedClaim={selectedClaim}
        initiateStatusUpdate={initiateStatusUpdate}
        showConfirmationModal={showConfirmationModal}
        setShowConfirmationModal={setShowConfirmationModal}
        confirmationAction={confirmationAction}
        confirmStatusUpdate={confirmStatusUpdate}
        showMapModal={showMapModal}
        mapMode={mapMode}
        mapSearchQuery={mapSearchQuery}
        setMapSearchQuery={setMapSearchQuery}
        searchLocation={searchLocation}
        mapRef={mapRef}
        showFarmerDetails={showFarmerDetails}
        setShowFarmerDetails={setShowFarmerDetails}
        showDeleteConfirmation={showDeleteConfirmation}
        setShowDeleteConfirmation={setShowDeleteConfirmation}
        farmerToDelete={farmerToDelete}
        setFarmerToDelete={setFarmerToDelete}
        farmers={farmers}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
      />

      {/* Admin Filing Modals */}
      <AdminClaimFilingEnhanced
        isOpen={showAdminClaimFiling}
        onClose={() => setShowAdminClaimFiling(false)}
        onSuccess={(result) => {
          console.log('Claim filed successfully:', result)
          // Refresh claims data
          refetchClaims()
          // Show success notification
          useNotificationStore.getState().addAdminNotification({
            id: generateUniqueId(),
            type: 'success',
            title: 'Claim Filed Successfully',
            message: `Claim ${result.claimNumber} has been filed for the farmer`,
            timestamp: new Date()
          })
        }}
      />

      <AdminAssistanceFiling
        isOpen={showAdminAssistanceFiling}
        onClose={() => setShowAdminAssistanceFiling(false)}
        onSuccess={(result) => {
          console.log('Assistance application filed successfully:', result)
          // Show success notification
          useNotificationStore.getState().addAdminNotification({
            id: generateUniqueId(),
            type: 'success',
            title: 'Assistance Application Filed',
            message: 'Assistance application has been submitted for the farmer',
            timestamp: new Date()
          })
        }}
      />

      {/* Analytics Modal */}
      {showAnalyticsModal && analyticsData && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Predictive Analytics</h2>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-lime-600" />
                      Current Year Overview
                    </h3>
                    <span className="text-sm text-gray-500">Total: {analyticsData.currentYear.totalClaims}</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Monthly Completion Rates</h4>
                      <div className="h-60">
                        <Line
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: "top" },
                              tooltip: { mode: "index", intersect: false },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: { display: true, text: "Claims" },
                              },
                            },
                            elements: {
                              line: {
                                tension: 0.4,
                              },
                              point: {
                                radius: 3,
                              },
                            },
                          }}
                          data={{
                            labels: Object.keys(analyticsData.currentYear.monthlyStatus),
                            datasets: [
                              {
                                label: "Approved",
                                data: Object.values(analyticsData.currentYear.monthlyStatus).map(
                                  (month) => month.approved || 0,
                                ),
                                borderColor: "rgba(16, 185, 129, 1)",
                                backgroundColor: "rgba(16, 185, 129, 0.1)",
                                fill: true,
                                borderWidth: 2,
                              },
                              {
                                label: "Rejected",
                                data: Object.values(analyticsData.currentYear.monthlyStatus).map(
                                  (month) => month.rejected || 0,
                                ),
                                borderColor: "rgba(239, 68, 68, 1)",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                fill: true,
                                borderWidth: 2,
                              },
                              {
                                label: "Completed",
                                data: Object.values(analyticsData.currentYear.monthlyStatus).map(
                                  (month) => month.completed || 0,
                                ),
                                borderColor: "rgba(59, 130, 246, 1)",
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                fill: true,
                                borderWidth: 2,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Status Distribution</h4>
                      <div className="h-60">
                        <Pie
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: "right", labels: { boxWidth: 12 } },
                            },
                          }}
                          data={{
                            labels: ["Approved", "Rejected", "Pending", "Completed"],
                            datasets: [
                              {
                                data: [
                                  analyticsData.currentYear.byStatus.approved || 0,
                                  analyticsData.currentYear.byStatus.rejected || 0,
                                  analyticsData.currentYear.byStatus.pending || 0,
                                  analyticsData.currentYear.byStatus.completed || 0,
                                ],
                                backgroundColor: [
                                  "rgba(16, 185, 129, 0.8)",
                                  "rgba(239, 68, 68, 0.8)",
                                  "rgba(245, 158, 11, 0.8)",
                                  "rgba(59, 130, 246, 0.8)",
                                ],
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                      Next Year Forecast
                    </h3>
                    <span className="text-sm text-gray-500">Predicted Total: {analyticsData.nextYear.totalClaims}</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Predicted Monthly Trends</h4>
                      <div className="h-60">
                        <Line
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: "top" },
                              tooltip: { mode: "index", intersect: false },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: { display: true, text: "Predicted Claims" },
                                grid: {
                                  color: "rgba(0, 0, 0, 0.05)",
                                },
                              },
                              x: {
                                grid: {
                                  color: "rgba(0, 0, 0, 0.05)",
                                },
                              },
                            },
                            elements: {
                              line: {
                                tension: 0.4,
                              },
                              point: {
                                radius: 3,
                              },
                            },
                          }}
                          data={{
                            labels: Object.keys(analyticsData.nextYear.monthlyStatus || {}),
                            datasets: [
                              {
                                label: "Approved",
                                data: Object.values(analyticsData.nextYear.monthlyStatus || {}).map(
                                  (month) => month.approved || 0,
                                ),
                                borderColor: "rgba(16, 185, 129, 1)",
                                backgroundColor: "rgba(16, 185, 129, 0.1)",
                                fill: true,
                                borderWidth: 2,
                              },
                              {
                                label: "Rejected",
                                data: Object.values(analyticsData.nextYear.monthlyStatus || {}).map(
                                  (month) => month.rejected || 0,
                                ),
                                borderColor: "rgba(239, 68, 68, 1)",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                fill: true,
                                borderWidth: 2,
                              },
                              {
                                label: "Completed",
                                data: Object.values(analyticsData.nextYear.monthlyStatus || {}).map(
                                  (month) => month.completed || 0,
                                ),
                                borderColor: "rgba(59, 130, 246, 1)",
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                fill: true,
                                borderWidth: 2,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Predicted Status Distribution</h4>
                      <div className="h-60">
                        <Doughnut
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: "right", labels: { boxWidth: 12 } },
                            },
                            cutout: "60%",
                          }}
                          data={{
                            labels: ["Approved", "Rejected", "Pending", "Completed"],
                            datasets: [
                              {
                                data: [
                                  analyticsData.nextYear.byStatus.approved || 0,
                                  analyticsData.nextYear.byStatus.rejected || 0,
                                  analyticsData.nextYear.byStatus.pending || 0,
                                  analyticsData.nextYear.byStatus.completed || 0,
                                ],
                                backgroundColor: [
                                  "rgba(16, 185, 129, 0.8)",
                                  "rgba(239, 68, 68, 0.8)",
                                  "rgba(245, 158, 11, 0.8)",
                                  "rgba(59, 130, 246, 0.8)",
                                ],
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Map className="mr-2 h-5 w-5 text-lime-600" />
                      Resource Allocation Recommendations
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Key Insights</h4>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>
                          Predicted {analyticsData.nextYear.totalClaims - analyticsData.currentYear.totalClaims} more
                          claims next year (
                          {Math.round(
                            ((analyticsData.nextYear.totalClaims - analyticsData.currentYear.totalClaims) /
                              analyticsData.currentYear.totalClaims) *
                              100,
                          )}
                          % increase)
                        </li>
                        <li>
                          {Object.entries(analyticsData.nextYear.byMonth || {})
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 2)
                            .map(([month]) => month)
                            .join(" and ")}{" "}
                          will likely see the highest claim volumes
                        </li>
                        <li>
                          Approval rate is expected to be{" "}
                          {Math.round(
                            (analyticsData.nextYear.byStatus.approved / analyticsData.nextYear.totalClaims) * 100,
                          )}
                          % next year
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Monthly Processing Forecast</h4>
                      <div className="h-60">
                        <Line
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: true },
                              tooltip: {
                                mode: "index",
                                intersect: false,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: { display: true, text: "Claims" },
                                grid: {
                                  color: "rgba(0, 0, 0, 0.05)",
                                },
                              },
                              x: {
                                grid: {
                                  color: "rgba(0, 0, 0, 0.05)",
                                },
                              },
                            },
                            elements: {
                              line: {
                                tension: 0.1,
                              },
                              point: {
                                radius: 2,
                              },
                            },
                          }}
                          data={{
                            labels: Object.keys(analyticsData.nextYear.byMonth || {}),
                            datasets: [
                              {
                                label: "Current Year",
                                data: Object.values(analyticsData.currentYear.byMonth || {}),
                                borderColor: "rgba(107, 114, 128, 1)",
                                backgroundColor: "rgba(107, 114, 128, 0.1)",
                                borderWidth: 2,
                                borderDash: [5, 5],
                                fill: false,
                              },
                              {
                                label: "Next Year (Predicted)",
                                data: Object.values(analyticsData.nextYear.byMonth || {}),
                                borderColor: "rgba(79, 70, 229, 1)",
                                backgroundColor: "rgba(79, 70, 229, 0.1)",
                                borderWidth: 2,
                                fill: true,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
                      Status Assessment
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Status Efficiency</h4>
                      <div className="h-60">
                        <Bar
                          options={{
                            indexAxis: "y",
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (context) => `${context.raw.toFixed(1)}% of total claims`,
                                },
                              },
                            },
                            scales: {
                              x: {
                                beginAtZero: true,
                                max: 100,
                                title: { display: true, text: "Percentage (%)" },
                              },
                            },
                          }}
                          data={{
                            labels: analyticsData.statusEfficiency.map((item) => item.status),
                            datasets: [
                              {
                                label: "Status Percentage",
                                data: analyticsData.statusEfficiency.map((item) => item.value),
                                backgroundColor: analyticsData.statusEfficiency.map((item) => {
                                  if (item.status === "Approved") return "rgba(16, 185, 129, 0.8)"
                                  if (item.status === "Rejected") return "rgba(239, 68, 68, 0.8)"
                                  if (item.status === "Pending") return "rgba(245, 158, 11, 0.8)"
                                  if (item.status === "Completed") return "rgba(59, 130, 246, 0.8)"
                                  return "rgba(107, 114, 128, 0.8)"
                                }),
                                borderRadius: 4,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Close
                </button>
                <button
                  onClick={generatePdfReport}
                  className="bg-lime-700 text-white px-4 py-2 rounded-lg hover:bg-lime-800 transition flex items-center"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 text-white p-4 rounded-t-xl flex justify-between items-center" style={{ backgroundColor: 'rgb(43, 158, 102)' }}>
              <h2 className="text-xl font-bold">
                {mapMode === "view" ? "Farm Locations Map" : "Select Farm Location"}
              </h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    className="w-full p-2 pr-10 border rounded-md"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        searchLocation()
                      }
                    }}
                  />
                  <button
                    onClick={searchLocation}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {mapMode === "view" && (
                <button
                  onClick={() => setMapMode("add")}
                  className="bg-lime-600 text-white px-4 py-2 rounded hover:bg-lime-700 flex items-center"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Location
                </button>
              )}

              {mapMode === "add" && (
                <button
                  onClick={() => setMapMode("view")}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
                >
                  <Layers className="mr-2 h-5 w-5" />
                  View All Locations
                </button>
              )}
            </div>

            <div className="flex-1 min-h-[400px] relative">
              <div ref={mapRef} className="w-full h-[500px]"></div>
            </div>

            {mapMode === "add" && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    {selectedLocation ? (
                      <p className="text-sm text-gray-600">
                        Selected coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Click on the map to select a location</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMapModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (selectedLocation) {
                          setShowMapModal(false)
                        } else {
                          alert("Please select a location on the map first.")
                        }
                      }}
                      disabled={!selectedLocation}
                      className={`px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-800 ${
                        !selectedLocation ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Confirm Location
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Farmer Details Modal */}
      {showFarmerDetails && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Farmer Details</h2>
              <button
                onClick={() => setShowFarmerDetails(false)}
                className="text-white hover:text-gray-200 focus:outline-none transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-lime-800 mb-3 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Full Name</span>
                      <p className="font-medium">{farmers[showFarmerDetails].farmerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Birthday</span>
                      <p className="font-medium">{farmers[showFarmerDetails].birthday || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Gender</span>
                      <p className="font-medium">{farmers[showFarmerDetails].gender || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Contact Number</span>
                      <p className="font-medium">{farmers[showFarmerDetails].contactNum || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Address</span>
                      <p className="font-medium">{farmers[showFarmerDetails].address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Farm Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Crop Type</span>
                      <p className="font-medium">{farmers[showFarmerDetails].cropType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Crop Area</span>
                      <p className="font-medium">{farmers[showFarmerDetails].cropArea} hectares</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Lot Number</span>
                      <p className="font-medium">{farmers[showFarmerDetails].lotNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Lot Area</span>
                      <p className="font-medium">{farmers[showFarmerDetails].lotArea || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Certified</span>
                      <p className="font-medium">
                        {farmers[showFarmerDetails].isCertified ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle size={16} className="mr-1" /> Yes
                          </span>
                        ) : (
                          <span className="text-gray-600">No</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Insurance Type</span>
                    <p className="font-medium">{farmers[showFarmerDetails].insuranceType || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Premium Amount</span>
                    <p className="font-medium">{farmers[showFarmerDetails].premiumAmount || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Period From</span>
                    <p className="font-medium">{farmers[showFarmerDetails].periodFrom || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Period To</span>
                    <p className="font-medium">{farmers[showFarmerDetails].periodTo || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Agency</span>
                    <p className="font-medium">{farmers[showFarmerDetails].agency || "Not provided"}</p>
                  </div>
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
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <AlertTriangle className="mr-2 text-red-500" size={24} />
              Delete Farmer
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <strong>{farmers[showDeleteConfirmation].farmerName}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false)
                  setFarmerToDelete(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const farmerId = farmers[showDeleteConfirmation].id || farmers[showDeleteConfirmation]._id;
                    const farmerName = farmers[showDeleteConfirmation].farmerName || 
                                     `${farmers[showDeleteConfirmation].firstName} ${farmers[showDeleteConfirmation].lastName}`;
                    
                    await deleteFarmerMutation.mutateAsync(farmerId);

                    // Close modal
                    setShowDeleteConfirmation(false)
                    setFarmerToDelete(null)

                    // Show success message
                    useNotificationStore.getState().addAdminNotification({
                      id: generateUniqueId(),
                      type: 'success',
                      title: 'Farmer Deleted Successfully',
                      message: `${farmerName} has been removed from the system.`,
                      timestamp: new Date()
                    });
                  } catch (error) {
                    // Show error message
                    useNotificationStore.getState().addAdminNotification({
                      id: generateUniqueId(),
                      type: 'error',
                      title: 'Delete Failed',
                      message: `Error: ${error.message}`,
                      timestamp: new Date()
                    });
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

      {/* Confirmation Modal for Claim Status Update */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {confirmationAction.type === "approved" ? "Approve Claim" : "Reject Claim"}
            </h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to {confirmationAction.type === "approved" ? "approve" : "reject"} this claim? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (optional)
              </label>
              <textarea
                id="feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                rows={3}
                placeholder="Add feedback for the farmer..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmationAction.type === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmationAction.type === "approved" ? "Yes, Approve" : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assistance Application Feedback Modal */}
      {showAssistanceFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {assistanceAction.type === 'approved' ? 'Approve' : 
               assistanceAction.type === 'rejected' ? 'Reject' : 
               assistanceAction.type === 'delete' ? 'Delete' : 'Action'} Application
            </h2>
            <p className="mb-4 text-gray-600">
              {assistanceAction.type === 'delete' ? 
                `Are you sure you want to delete "${assistanceAction.itemName}"? This action cannot be undone.` :
                `Are you sure you want to ${assistanceAction.type} this assistance application? 
                Please provide feedback for the farmer.`
              }
            </p>
            {assistanceAction.type !== 'delete' && (
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                rows={4}
                placeholder={`Enter feedback for the farmer (reason for ${assistanceAction.type})`}
                value={assistanceFeedback}
                onChange={(e) => setAssistanceFeedback(e.target.value)}
              />
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssistanceFeedbackModal(false);
                  setAssistanceFeedback("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssistanceAction}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  assistanceAction.type === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : assistanceAction.type === 'rejected'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {assistanceAction.type === 'approved' ? 'Yes, Approve' : 
                 assistanceAction.type === 'rejected' ? 'Yes, Reject' : 
                 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && pendingAction && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">{pendingAction.type === 'approve' ? 'Approve' : 'Reject'} Request</h2>
            <p className="mb-2">Farmer: <span className="font-medium">{pendingAction.request.farmerName}</span></p>
            <p className="mb-2">Assistance: <span className="font-medium">{pendingAction.request.assistanceName}</span></p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              rows={3}
              placeholder={`Enter feedback for the farmer (reason for ${pendingAction.type})`}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (pendingAction.type === 'approve') {
                    // TODO: Implement with React Query mutation
                    console.log('Approving assistance request:', pendingAction.request.id);
                    
                    useNotificationStore.getState().addFarmerNotification({
                      id: `assist-approve-${pendingAction.request.id}`,
                      title: 'Assistance Request Approved',
                      message: `Your request for ${pendingAction.request.assistanceName} was approved. Feedback: ${feedbackText}`,
                      type: 'success',
                      timestamp: new Date(),
                      read: false,
                    }, pendingAction.request.farmerId);
                    
                    setShowFeedbackModal(false);
                    setPendingAction(null);
                    setFeedbackText("");
                  } else {
                    try {
                      await updateApplicationMutation.mutateAsync({
                        applicationId: pendingAction.request.id,
                        statusData: { status: 'rejected', adminFeedback: feedbackText }
                      })
                      
                      useNotificationStore.getState().addAdminNotification({
                        id: generateUniqueId(),
                        type: 'success',
                        title: 'Request Rejected',
                        message: 'Assistance request has been rejected.',
                        timestamp: new Date()
                      })
                    } catch (error) {
                      useNotificationStore.getState().addAdminNotification({
                        id: generateUniqueId(),
                        type: 'error',
                        title: 'Error Rejecting Request',
                        message: error.message,
                        timestamp: new Date()
                      })
                    }
                    useNotificationStore.getState().addFarmerNotification({
                      id: `assist-reject-${pendingAction.request.id}`,
                      title: 'Assistance Request Rejected',
                      message: `Your request for ${pendingAction.request.assistanceName} was rejected. Feedback: ${feedbackText}`,
                      type: 'warning',
                      timestamp: new Date(),
                      read: false,
                    }, pendingAction.request.farmerId);
                    setShowFeedbackModal(false);
                    setPendingAction(null);
                    setFeedbackText("");
                  }
                }}
                className={`px-4 py-2 rounded text-white ${pendingAction.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {pendingAction.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Warning */}
      {lowStockItems.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span>
            Warning: The following assistance item{lowStockItems.length > 1 ? 's are' : ' is'} low in stock:
            {" "}
            <strong>{lowStockItems.map(item => item.assistanceType).join(', ')}</strong>
            . Please restock soon.
          </span>
        </div>
      )}

      {/* Crop Price Management Modal */}
      <CropPriceManagement
        isOpen={showCropPriceManagement}
        onClose={() => setShowCropPriceManagement(false)}
      />
    </div>
  )
}

export default AdminDashboard
