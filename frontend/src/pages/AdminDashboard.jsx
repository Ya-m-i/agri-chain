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
  MapPin,
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
  Moon,
  Monitor,
  Sun,
} from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useNotificationStore } from "../store/notificationStore"
import { useSocketQuery } from "../hooks/useSocketQuery"
import { getWeatherForKapalong, getWeatherForMultipleLocations, getWeatherMarkerColor, getWeatherMarkerIcon, getFarmingRecommendation } from "../utils/weatherUtils"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
// Use a relative path that matches your project structure
// If you're unsure about the exact path, you can use a placeholder or comment it out temporarily
// import adminLogoImage from "../assets/images/AgriLogo.png"
import adminLogoImage from "../assets/Images/DALOGO.png" // Admin logo

// Import custom KPI block images
import totalFarmerImage from "../assets/Images/TotalFarmer.png"
import activeImage from "../assets/Images/Active.png"
import pendingImage from "../assets/Images/pending.png"
import assistedImage from "../assets/Images/Assisted.png"
import climateImage from "../assets/Images/climate.png"

// Import additional icons for dashboard sections
import locationImage from "../assets/Images/location.png"
import insuranceImage from "../assets/Images/insurance.png"
import recentImage from "../assets/Images/recent.png"

// Import sidebar navigation icons
import registrationIcon from "../assets/Images/Registration.png"
import cashIcon from "../assets/Images/cash.png"
import distributionIcon from "../assets/Images/Distribution.png"
import inventoryIcon from "../assets/Images/Inventory.png"
import fileIcon from "../assets/Images/File.png"
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar as RechartsBar, LineChart, Line as RechartsLine, Legend as RechartsLegend, Cell, PieChart as RechartsPieChart, Pie as RechartsPie, Sector } from 'recharts';
import { showError } from "../utils/feedbackUtils"
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

// Loading Overlay Component with Blockchain Style
const LoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Blockchain-style animated loading */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-16 h-16 border-2 border-lime-500/20 rounded-full animate-spin">
          <div className="w-full h-full border-2 border-transparent border-t-lime-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-lime-500 rounded-full animate-pulse shadow-lg shadow-lime-500/50"></div>
        </div>
        
        {/* Blockchain nodes animation */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-lime-400 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-lime-300 rounded-full animate-bounce delay-300"></div>
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-lime-600 rounded-full animate-bounce delay-150"></div>
      </div>
    </div>
  );
};

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
      <div className="bg-white rounded-xl p-4 flex items-center justify-between text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm border border-gray-200">
        <div className="flex-1">
          <div className="text-sm font-bold text-black mb-1">Todays Weather</div>
        <div className="text-2xl font-bold text-gray-800 mb-1">--°C</div>
        <div className="text-xs text-gray-600 mb-2">Loading...</div>
        <div className="text-xs text-gray-500 mt-1">Please wait</div>
        </div>
        <div className="flex-shrink-0 ml-3">
          <img src={climateImage} alt="Today's Weather" className="h-12 w-12" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 flex items-center justify-between text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm border border-gray-200">
      <div className="flex-1">
        <div className="text-sm font-bold text-black mb-1">Todays Weather</div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{weather?.temperature || 28}°C</div>
      <div className="text-xs text-gray-600 mb-2">Kapalong, Davao</div>
      <div className="text-xs text-gray-500 mt-1">{weather?.condition || "Partly Cloudy"}</div>
      </div>
      <div className="flex-shrink-0 ml-3">
        <img src={climateImage} alt="Today's Weather" className="h-12 w-12" />
      </div>
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
  const [isTabLoading, setIsTabLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  // Handle initial loading when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1200); // 1.2 seconds for initial dashboard loading

    return () => clearTimeout(timer);
  }, []);

  // Function to handle tab switching with loading
  const handleTabSwitch = (newTab) => {
    if (newTab === activeTab) return;
    
    setIsTabLoading(true);
    setActiveTab(newTab);
    setSidebarOpen(false);
    
    // Simulate loading time (you can adjust this duration)
    setTimeout(() => {
      setIsTabLoading(false);
    }, 800);
  };

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
  const [timePeriodFilter, setTimePeriodFilter] = useState('lastMonth') // For Claims Trend time period filter

  // Map states
  const [mapSearchQuery, setMapSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [mapMode, setMapMode] = useState("view") // view or add
  const [mapCenter, setMapCenter] = useState([7.5815, 125.8235]) // Precise coordinates for Kapalong, Davao del Norte
  const [mapZoom, setMapZoom] = useState(12) // Medium zoom to see all farmer locations in Kapalong area
  const [weatherData, setWeatherData] = useState([]) // Weather data for all farmer locations
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(true) // Toggle weather overlay
  const [weatherLoading, setWeatherLoading] = useState(false) // Loading state for weather data
  const weatherFetchedRef = useRef(false) // Track if weather has been fetched to prevent infinite loops
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
    isCertified: true, // Default filter to show certified farmers
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

        // Choose color based on weather overlay or insurance status
        let markerColor
        let weatherInfo = null
        
        if (showWeatherOverlay && weatherData.length > 0) {
          // Find weather data for this farmer
          const farmerWeather = weatherData.find(w => w.farmerId === farmerKey)
          if (farmerWeather) {
            weatherInfo = farmerWeather.weather
            markerColor = getWeatherMarkerColor(weatherInfo.status)
          } else {
            // Fallback to insurance status if no weather data
            if (hasActiveClaim) {
              markerColor = '#f97316' // Orange for high claims area
            } else if (isInsured) {
              markerColor = '#22c55e' // Green for insured
            } else {
              markerColor = '#ef4444' // Red for uninsured
            }
          }
        } else {
          // Use insurance status when weather overlay is off
          if (hasActiveClaim) {
            markerColor = '#f97316' // Orange for high claims area
          } else if (isInsured) {
            markerColor = '#22c55e' // Green for insured
          } else {
            markerColor = '#ef4444' // Red for uninsured
          }
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

        // Enhanced popup with comprehensive information including weather
        const weatherSection = weatherInfo ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 18px;">${getWeatherMarkerIcon(weatherInfo.condition)}</span>
              <strong style="color: #374151; font-size: 12px;">🌤️ WEATHER:</strong>
              <span style="color: #059669; font-weight: 500;">${weatherInfo.condition}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; font-size: 11px;">
              <div style="text-align: center;">
                <div style="color: #6b7280;">🌡️ Temp</div>
                <div style="color: #374151; font-weight: 500;">${weatherInfo.temperature}°C</div>
              </div>
              <div style="text-align: center;">
                <div style="color: #6b7280;">💧 Humidity</div>
                <div style="color: #374151; font-weight: 500;">${weatherInfo.humidity}%</div>
              </div>
              <div style="text-align: center;">
                <div style="color: #6b7280;">💨 Wind</div>
                <div style="color: #374151; font-weight: 500;">${weatherInfo.windSpeed} km/h</div>
              </div>
            </div>
            <div style="margin-top: 4px; padding: 4px; background: #fef3c7; border-radius: 4px; font-size: 10px; color: #92400e;">
              💡 ${getFarmingRecommendation(weatherInfo)}
            </div>
          </div>
        ` : ''
        
        const popupContent = `
          <div style="min-width:250px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="background: linear-gradient(135deg, ${markerColor} 0%, ${markerColor}99 100%); color: white; padding: 8px; margin: -9px -9px 8px -9px; border-radius: 4px 4px 0 0;">
              <h4 style="margin: 0; font-size: 16px; font-weight: bold;">👨‍🌾 ${farmerName}</h4>
              <small style="opacity: 0.9;">📍 ${barangay}</small>
            </div>
            
            ${weatherSection}
            
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
    
    // Add custom CSS for enhanced popups and neon lime map styling
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
        /* Neon Lime Blockchain Map Styling */
        .leaflet-control-zoom a {
          background-color: #000 !important;
          border: 2px solid rgb(132, 204, 22) !important;
          color: rgb(132, 204, 22) !important;
          box-shadow: 0 0 10px rgba(132, 204, 22, 0.5) !important;
          transition: all 0.3s ease !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: rgb(132, 204, 22) !important;
          color: #000 !important;
          box-shadow: 0 0 20px rgba(132, 204, 22, 0.8) !important;
          transform: scale(1.1);
        }
        .leaflet-popup-content-wrapper {
          background: #000 !important;
          border: 2px solid rgb(132, 204, 22) !important;
          box-shadow: 0 0 20px rgba(132, 204, 22, 0.6) !important;
        }
        .leaflet-popup-tip {
          background: #000 !important;
          border: 2px solid rgb(132, 204, 22) !important;
        }
        .leaflet-container {
          background: #1a1a1a !important;
        }
        /* Pulsing animation for markers */
        @keyframes pulse-lime {
          0%, 100% {
            box-shadow: 0 0 10px rgba(132, 204, 22, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(132, 204, 22, 0.8);
          }
        }
      `
      document.head.appendChild(style)
    }
    
  }, [farmers, insuranceByFarmer, cropFilter, monthFilter, yearFilter, claims, allApplications, showWeatherOverlay, weatherData])

  // Handle navigation to dashboard map from farmer registration
  const handleNavigateToDashboardMap = useCallback((farmerLocationData) => {
    console.log('Navigating to dashboard map for farmer:', farmerLocationData)
    
    // Switch to home tab (dashboard)
    setActiveTab('home')
    
    // Set selected farmer location for highlighting
    setSelectedLocation(farmerLocationData.location)
    
    // Center map on farmer location with higher zoom
    setMapCenter([farmerLocationData.location.lat, farmerLocationData.location.lng])
    setMapZoom(15)
    
    // After a short delay to let the map render, highlight the farmer
    setTimeout(() => {
      if (overviewLeafletMapRef.current && farmerLocationData.location) {
        overviewLeafletMapRef.current.setView(
          [farmerLocationData.location.lat, farmerLocationData.location.lng], 
          15,
          { animate: true, duration: 1 }
        )
        
        // Find and open the popup for this farmer
        if (overviewMarkersLayerRef.current) {
          overviewMarkersLayerRef.current.eachLayer((layer) => {
            if (layer.getLatLng) {
              const latLng = layer.getLatLng()
              // Check if this marker matches the farmer's location (with small tolerance for floating point)
              if (Math.abs(latLng.lat - farmerLocationData.location.lat) < 0.0001 &&
                  Math.abs(latLng.lng - farmerLocationData.location.lng) < 0.0001) {
                layer.openPopup()
              }
            }
          })
        }
      }
    }, 500)
  }, [setActiveTab, setSelectedLocation, setMapCenter, setMapZoom])

        // Load claims function using React Query
        const loadClaims = useCallback(async () => {
  try {
    // Hide the loading popup but keep functionality
    // showLoading("Loading claims...");
    setIsRefreshing(true);
    await refetchClaims();
  } catch (err) {
    console.error('Failed to load claims from the server:', err);
    showError("Failed to load claims from the server.");
  } finally {
    // hideLoading();
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

  // Add a new state variable for feedback and schedule
  const [feedbackText, setFeedbackText] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [pickupTime, setPickupTime] = useState("")
  const [showClaimsSummaryModal, setShowClaimsSummaryModal] = useState(false)

  // Handle claim status updates with confirmation
  const initiateStatusUpdate = (claimId, newStatus, farmerId) => {
    setConfirmationAction({ type: newStatus, claimId, farmerId })
    setFeedbackText("") // Reset feedback text
    setPickupDate("") // Reset pickup date
    setPickupTime("") // Reset pickup time
    setShowConfirmationModal(true)
  }
  
  // Handle sending pickup alert to farmer
  const sendPickupAlert = (claim) => {
    console.log('🚨 sendPickupAlert called with claim:', claim);
    
    if (!claim || !claim.farmerId) {
      console.error('❌ Alert failed - missing claim or farmerId:', { claim, farmerId: claim?.farmerId });
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Alert Failed',
        message: 'Unable to send alert: Farmer information not found',
        timestamp: new Date()
      });
      return;
    }
    
    // Handle both populated (object) and non-populated (string) farmerId
    const farmerIdToNotify = claim.farmerId?._id || claim.farmerId;
    const compensationAmount = claim.compensation ? `₱${claim.compensation.toLocaleString()}` : 'your compensation';
    
    console.log('📨 Sending pickup alert to farmer ID:', farmerIdToNotify);
    
    let alertMessage = `🔔 CLAIM READY FOR PICKUP! Your approved claim for ${claim.crop} damage can now be claimed. Compensation: ${compensationAmount}.`;
    
    // Add pickup schedule if available
    if (claim.pickupSchedule && claim.pickupSchedule.date && claim.pickupSchedule.time) {
      alertMessage += ` 📅 Scheduled Pickup: ${claim.pickupSchedule.date} at ${claim.pickupSchedule.time}.`;
      console.log('📅 Including pickup schedule:', claim.pickupSchedule);
    }
    
    alertMessage += ' Please bring a valid ID and necessary documents.';
    
    const notification = {
      id: `claim-pickup-alert-${claim._id || claim.id}-${generateUniqueId()}`,
      type: 'info',
      title: '🚨 Claim Ready for Pickup',
      message: alertMessage,
      timestamp: new Date()
    };
    
    console.log('📬 Pickup alert notification:', notification);
    
    useNotificationStore.getState().addFarmerNotification(notification, farmerIdToNotify);
    
    console.log('✅ Pickup alert sent to farmer store for ID:', farmerIdToNotify);
    
    // Show admin confirmation
    useNotificationStore.getState().addAdminNotification({
      id: generateUniqueId(),
      type: 'success',
      title: 'Pickup Alert Sent',
      message: `Farmer has been notified about claim pickup.`,
      timestamp: new Date()
    });
  }

  const confirmStatusUpdate = async () => {
    const { type: actionType, claimId: actionClaimId, farmerId } = confirmationAction;
    try {
      // Prepare update data with schedule if approving
      const updateData = {
        status: actionType,
        adminFeedback: feedbackText,
      };
      
      // Add schedule for approved claims
      if (actionType === 'approved' && pickupDate && pickupTime) {
        updateData.pickupSchedule = {
          date: pickupDate,
          time: pickupTime,
          scheduledAt: new Date()
        };
      }
      
      await updateClaimMutation.mutateAsync({
        id: actionClaimId,
        updateData
      });
      
      setShowConfirmationModal(false);
      setFeedbackText("");
      setPickupDate("");
      setPickupTime("");
      
      // Find the claim to get farmer details
      const claim = claims.find(c => c._id === actionClaimId || c.id === actionClaimId);
      
      // Show success notification to admin
      let adminMessage = `Claim has been ${actionType} successfully.`;
      if (actionType === 'approved' && claim && claim.compensation) {
        adminMessage = `Claim approved! Compensation: ₱${claim.compensation.toLocaleString()}. Total Insurance Paid updated.`;
        if (pickupDate && pickupTime) {
          adminMessage += ` Pickup scheduled for ${pickupDate} at ${pickupTime}.`;
        }
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
        // Handle both populated (object) and non-populated (string) farmerId
        const farmerIdToNotify = claim.farmerId?._id || claim.farmerId || farmerId;
        
        console.log('🔔 Sending claim notification to farmer:', {
          claimId: actionClaimId,
          actionType,
          farmerIdToNotify,
          claimFarmerId: claim.farmerId,
          paramFarmerId: farmerId
        });
        
        const notificationType = actionType === 'approved' ? 'success' : 'error';
        const notificationTitle = actionType === 'approved' ? '✅ Claim Approved!' : '❌ Claim Rejected';
        
        let notificationMessage;
        if (actionType === 'approved') {
          const compensationAmount = claim.compensation ? `₱${claim.compensation.toLocaleString()}` : 'calculated amount';
          notificationMessage = `Your claim for ${claim.crop} damage has been approved! Compensation: ${compensationAmount}.`;
          
          // Add pickup schedule to notification
          if (pickupDate && pickupTime) {
            notificationMessage += ` 📅 Pickup Schedule: ${pickupDate} at ${pickupTime}. Please be present at the designated location.`;
          }
          
          if (feedbackText) {
            notificationMessage += ` Feedback: ${feedbackText}`;
          }
        } else {
          notificationMessage = `Your claim for ${claim.crop} damage has been rejected. ${feedbackText ? `Reason: ${feedbackText}` : ''}`;
        }

        const notification = {
          id: `claim-${actionType}-${actionClaimId}-${generateUniqueId()}`,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          timestamp: new Date()
        };
        
        console.log('📬 Notification being sent:', notification);
        
        useNotificationStore.getState().addFarmerNotification(notification, farmerIdToNotify);
        
        console.log('✅ Notification sent to farmer store for ID:', farmerIdToNotify);
      } else {
        console.warn('⚠️ Cannot send notification - missing claim or farmerId:', {
          hasClaim: !!claim,
          claimFarmerId: claim?.farmerId,
          paramFarmerId: farmerId
        });
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

  // Load Leaflet when map modal is shown - fixed to ensure proper rendering
  useEffect(() => {
    if (showMapModal && mapRef.current) {
      console.log('🗺️ Map modal opened, checking map instance...');
      
      // Kapalong, Davao del Norte coordinates - precise center
      const kapalongCoords = [7.5815, 125.8235];
      const kapalongZoom = 13;
      
      // If map doesn't exist, create it
      if (!leafletMapRef.current) {
        console.log('🗺️ Creating new map instance...');
        
        // Initialize the map with dark theme
        leafletMapRef.current = L.map(mapRef.current, {
          zoomControl: false
        }).setView(kapalongCoords, kapalongZoom);

        // Add CartoDB Dark Matter tile layer for blockchain vibe
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(leafletMapRef.current);
        
        // Add custom zoom control
        L.control.zoom({
          position: 'topright'
        }).addTo(leafletMapRef.current);

        // Create a layer for markers
        markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);

        // Add click handler for adding new locations
        leafletMapRef.current.on("click", (e) => {
          if (mapMode === "add") {
            setSelectedLocation({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
            });

            // Clear existing markers in add mode
            if (markersLayerRef.current) {
              markersLayerRef.current.clearLayers();
            }

            // Add a new marker at the clicked location with lime marker
            L.marker([e.latlng.lat, e.latlng.lng], {
              icon: L.divIcon({
                className: 'custom-marker-lime',
                html: '<div style="background-color: #84cc16; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #000; box-shadow: 0 0 15px rgba(132, 204, 22, 0.9);"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            }).addTo(markersLayerRef.current);

            // Reverse geocode to get address and update form
            reverseGeocode(e.latlng.lat, e.latlng.lng);
          }
        });
        
        console.log('✅ Map initialized and centered on Kapalong');
      } else {
        // Map exists, just update view and invalidate size
        console.log('🗺️ Map exists, updating view...');
        leafletMapRef.current.setView(kapalongCoords, kapalongZoom);
        
        // Force a resize to ensure the map renders correctly
        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
            console.log('✅ Map size invalidated and rerendered');
          }
        }, 200);
      }
      
      // Add existing farm locations to the map
      if (markersLayerRef.current) {
        addFarmersToMap();
      }
    }

    // Cleanup when modal closes
    return () => {
      if (!showMapModal && leafletMapRef.current) {
        console.log('🗑️ Cleaning up map instance...');
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [showMapModal, mapMode, addFarmersToMap])

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
      overviewLeafletMapRef.current = L.map(overviewMapRef.current, {
        zoomControl: false // Remove default zoom control for custom styling
      }).setView(mapCenter, 12)
      
      // Use CartoDB Dark Matter for blockchain vibe
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(overviewLeafletMapRef.current)
      
      // Add custom zoom control with neon lime styling
      L.control.zoom({
        position: 'topright'
      }).addTo(overviewLeafletMapRef.current)

      overviewMarkersLayerRef.current = L.layerGroup().addTo(overviewLeafletMapRef.current)
      
      // Add custom map styling
      const mapContainer = overviewMapRef.current
      if (mapContainer) {
        mapContainer.style.border = '3px solid rgb(132, 204, 22)'
        mapContainer.style.boxShadow = '0 0 20px rgba(132, 204, 22, 0.5), inset 0 0 20px rgba(132, 204, 22, 0.1)'
        mapContainer.style.borderRadius = '12px'
      }
    }

    setTimeout(() => {
      if (overviewLeafletMapRef.current) {
        overviewLeafletMapRef.current.invalidateSize()
      }
    }, 100)

    addFarmersToOverviewMap()
    
    // Fit map to show all farmer locations after adding them
    setTimeout(() => {
      if (overviewLeafletMapRef.current && farmers.length > 0) {
        const farmersWithLocation = farmers.filter(farmer => 
          farmer.location && 
          typeof farmer.location.lat === 'number' && 
          typeof farmer.location.lng === 'number'
        )

        if (farmersWithLocation.length === 0) return

        // If only one farmer, center on them with medium zoom
        if (farmersWithLocation.length === 1) {
          const farmer = farmersWithLocation[0]
          overviewLeafletMapRef.current.setView([farmer.location.lat, farmer.location.lng], 12)
          return
        }

        // Calculate bounds for multiple farmers
        const lats = farmersWithLocation.map(f => f.location.lat)
        const lngs = farmersWithLocation.map(f => f.location.lng)
        
        const minLat = Math.min(...lats)
        const maxLat = Math.max(...lats)
        const minLng = Math.min(...lngs)
        const maxLng = Math.max(...lngs)

        // Add some padding around the bounds
        const latPadding = (maxLat - minLat) * 0.1
        const lngPadding = (maxLng - minLng) * 0.1

        const bounds = [
          [minLat - latPadding, minLng - lngPadding],
          [maxLat + latPadding, maxLng + lngPadding]
        ]

        overviewLeafletMapRef.current.fitBounds(bounds, { padding: [20, 20] })
      }
    }, 200)
    
    // Check for selected farmer location from farmer registration
    const selectedFarmerLocation = localStorage.getItem('selectedFarmerLocation')
    if (selectedFarmerLocation) {
      try {
        const farmerData = JSON.parse(selectedFarmerLocation)
        if (farmerData.location && farmerData.location.lat && farmerData.location.lng) {
          // Focus map on the selected farmer's location
          const farmerLatLng = [farmerData.location.lat, farmerData.location.lng]
          overviewLeafletMapRef.current.setView(farmerLatLng, 15)
          
          // Add a special marker for the selected farmer
          const selectedMarker = L.marker(farmerLatLng, {
            icon: L.divIcon({
              className: 'selected-farmer-marker',
              html: `<div style="background-color: #ff6b6b; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          })
          
          selectedMarker.bindPopup(`
            <div style="text-align: center;">
              <h3 style="margin: 0 0 8px 0; color: #ff6b6b; font-weight: bold;">${farmerData.farmerName}</h3>
              <p style="margin: 0; color: #666; font-size: 12px;">📍 Selected Location</p>
              <p style="margin: 4px 0 0 0; color: #888; font-size: 11px;">${farmerData.address || 'No address provided'}</p>
            </div>
          `)
          
          selectedMarker.addTo(overviewMarkersLayerRef.current)
          
          // Clear the selected farmer location from localStorage
          localStorage.removeItem('selectedFarmerLocation')
        }
      } catch (error) {
        console.error('Error parsing selected farmer location:', error)
        localStorage.removeItem('selectedFarmerLocation')
      }
    }
  }, [activeTab, farmers, mapCenter, addFarmersToOverviewMap])

  // Separate useEffect for weather fetching to prevent infinite loops
  useEffect(() => {
    if (showWeatherOverlay && !weatherFetchedRef.current && farmers.length > 0) {
      weatherFetchedRef.current = true
      const fetchWeather = async () => {
        setWeatherLoading(true)
        try {
          const farmersWithLocation = farmers.filter(farmer => 
            farmer.location && 
            typeof farmer.location.lat === 'number' && 
            typeof farmer.location.lng === 'number'
          )
          
          if (farmersWithLocation.length > 0) {
            const weatherResults = await getWeatherForMultipleLocations(farmersWithLocation)
            setWeatherData(weatherResults)
          }
        } catch (error) {
          console.error('Error fetching weather for farmers:', error)
        } finally {
          setWeatherLoading(false)
        }
      }
      
      fetchWeather()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWeatherOverlay, farmers.length])

  // Function to fit map bounds to show all farmer locations
  const fitMapToFarmers = useCallback(() => {
    if (!overviewLeafletMapRef.current || farmers.length === 0) return

    const farmersWithLocation = farmers.filter(farmer => 
      farmer.location && 
      typeof farmer.location.lat === 'number' && 
      typeof farmer.location.lng === 'number'
    )

    if (farmersWithLocation.length === 0) return

    // If only one farmer, center on them with medium zoom
    if (farmersWithLocation.length === 1) {
      const farmer = farmersWithLocation[0]
      overviewLeafletMapRef.current.setView([farmer.location.lat, farmer.location.lng], 12)
      return
    }

    // Calculate bounds for multiple farmers
    const lats = farmersWithLocation.map(f => f.location.lat)
    const lngs = farmersWithLocation.map(f => f.location.lng)
    
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Add some padding around the bounds
    const latPadding = (maxLat - minLat) * 0.1
    const lngPadding = (maxLng - minLng) * 0.1

    const bounds = [
      [minLat - latPadding, minLng - lngPadding],
      [maxLat + latPadding, maxLng + lngPadding]
    ]

    overviewLeafletMapRef.current.fitBounds(bounds, { padding: [20, 20] })
  }, [farmers])

  // Function to search for a location on the map - Enhanced with Kapalong focus
  const searchLocation = async () => {
    if (!mapSearchQuery.trim()) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'warning',
        title: 'Search Empty',
        message: 'Please enter a location to search',
        timestamp: new Date()
      });
      return;
    }

    console.log('🔍 Searching for location:', mapSearchQuery);

    try {
      // Add "Kapalong" to search query if not already present to focus on local area
      const searchQuery = mapSearchQuery.toLowerCase().includes('kapalong') 
        ? mapSearchQuery 
        : `${mapSearchQuery}, Kapalong, Davao del Norte, Philippines`;
      
      // Use Nominatim API for geocoding with better parameters
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `limit=5&` +
        `countrycodes=ph&` +
        `addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AGRI-CHAIN-App'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Search service unavailable');
      }

      const data = await response.json();
      console.log('📍 Search results:', data);

      if (data && data.length > 0) {
        const { lat, lon } = data[0];

        if (leafletMapRef.current) {
          leafletMapRef.current.setView([parseFloat(lat), parseFloat(lon)], 15);

          if (mapMode === "add") {
            setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });

            // Clear existing markers
            if (markersLayerRef.current) {
              markersLayerRef.current.clearLayers();
            }

            // Add a new marker at the searched location with lime style
            L.marker([parseFloat(lat), parseFloat(lon)], {
              icon: L.divIcon({
                className: 'custom-marker-lime',
                html: '<div style="background-color: #84cc16; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #000; box-shadow: 0 0 15px rgba(132, 204, 22, 0.9);"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            }).addTo(markersLayerRef.current);

            // Reverse geocode to get address and update form
            reverseGeocode(parseFloat(lat), parseFloat(lon));
          }

          useNotificationStore.getState().addAdminNotification({
            id: generateUniqueId(),
            type: 'success',
            title: '✅ Location Found',
            message: `Found: ${data[0].display_name}`,
            timestamp: new Date()
          });
        }
      } else {
        useNotificationStore.getState().addAdminNotification({
          id: generateUniqueId(),
          type: 'error',
          title: '❌ Location Not Found',
          message: 'No results found. Try a different search term or be more specific.',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: '❌ Search Failed',
        message: `Error: ${error.message}. Please try again.`,
        timestamp: new Date()
      });
    }
  };


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

  // Memoized Claims Trend Data to prevent chart movement/looping
  const claimsTrendData = useMemo(() => {
    const now = new Date();
    let dataPoints = [];
    
    if (timePeriodFilter === 'today') {
      // Today - hourly data
      for (let hour = 0; hour < 24; hour++) {
        const hourClaims = claims.filter(c => {
          const claimDate = new Date(c.date);
          return claimDate.getDate() === now.getDate() && 
                 claimDate.getMonth() === now.getMonth() && 
                 claimDate.getFullYear() === now.getFullYear() &&
                 claimDate.getHours() === hour;
        });
        
        dataPoints.push({
          period: `${hour}:00`,
          approved: hourClaims.filter(c => c.status === 'approved').length,
          rejected: hourClaims.filter(c => c.status === 'rejected').length,
          total: hourClaims.length
        });
      }
    } else if (timePeriodFilter === 'lastWeek') {
      // Last week - daily data
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekAgo);
        date.setDate(date.getDate() + i);
        
        const dayClaims = claims.filter(c => {
          const claimDate = new Date(c.date);
          return claimDate.getDate() === date.getDate() && 
                 claimDate.getMonth() === date.getMonth() && 
                 claimDate.getFullYear() === date.getFullYear();
        });
        
        dataPoints.push({
          period: date.toLocaleDateString('en-US', { weekday: 'short' }),
          approved: dayClaims.filter(c => c.status === 'approved').length,
          rejected: dayClaims.filter(c => c.status === 'rejected').length,
          total: dayClaims.length
        });
      }
    } else if (timePeriodFilter === 'thisMonth') {
      // This month - daily data
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayClaims = claims.filter(c => {
          const claimDate = new Date(c.date);
          return claimDate.getDate() === day && 
                 claimDate.getMonth() === currentMonth && 
                 claimDate.getFullYear() === currentYear;
        });
        
        dataPoints.push({
          period: `${day}`,
          approved: dayClaims.filter(c => c.status === 'approved').length,
          rejected: dayClaims.filter(c => c.status === 'rejected').length,
          total: dayClaims.length
        });
      }
    } else if (timePeriodFilter === 'thisYear') {
      // This year - monthly data
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for (let month = 0; month < 12; month++) {
        const monthClaims = claims.filter(c => {
          const claimDate = new Date(c.date);
          return claimDate.getMonth() === month && 
                 claimDate.getFullYear() === now.getFullYear();
        });
        
        dataPoints.push({
          period: monthNames[month],
          approved: monthClaims.filter(c => c.status === 'approved').length,
          rejected: monthClaims.filter(c => c.status === 'rejected').length,
          total: monthClaims.length
        });
      }
    } else {
      // Last month - weekly data
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      for (let week = 0; week < 4; week++) {
        const weekStart = new Date(monthAgo);
        weekStart.setDate(weekStart.getDate() + (week * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekClaims = claims.filter(c => {
          const claimDate = new Date(c.date);
          return claimDate >= weekStart && claimDate <= weekEnd;
        });
        
        dataPoints.push({
          period: `Week ${week + 1}`,
          approved: weekClaims.filter(c => c.status === 'approved').length,
          rejected: weekClaims.filter(c => c.status === 'rejected').length,
          total: weekClaims.length
        });
      }
    }
    
    return dataPoints;
  }, [timePeriodFilter, claims]);


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
    <div className={`admin-lato min-h-screen relative flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`} style={{ fontFamily: "'Lato', sans-serif" }}>
      <style>{scrollbarStyle}</style>
      <style>{`.admin-lato, .admin-lato * { font-family: 'Lato', sans-serif !important; }`}</style>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Loading Overlays */}
      <LoadingOverlay 
        isVisible={isInitialLoading || isTabLoading} 
      />
      {/* Top Navbar */}
      <header style={{ backgroundColor: 'white' }} className={`text-black transition-all duration-300 ease-in-out ${sidebarExpanded ? 'md:ml-64' : 'md:ml-16'}`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 md:hidden" aria-label="Toggle menu">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-sans font-semibold tracking-wide text-black">ADMIN DASHBOARD</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Real-time Status Indicator */}
            <div className="flex items-center space-x-2 text-black text-sm">
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
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
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
                  <div className="p-4 text-black flex justify-between items-center" style={{ backgroundColor: 'rgb(56, 118, 29)' }}>
                    <h3 className="font-semibold">Notifications</h3>
                    {adminNotifications.length > 0 && (
                      <button
                        onClick={() => useNotificationStore.getState().clearNotifications()}
                        className="text-black hover:text-gray-200 text-sm"
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
                    onClick={() => {
                      setShowCalendar(true)
                      setDropdownOpen(false)
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Calendar size={16} className="mr-2" />
                    Calendar
                  </button>
                  <button
                    onClick={() => {
                      setDarkMode(!darkMode)
                      setDropdownOpen(false)
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    {darkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
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
          } md:hidden transition duration-150 ease-out z-30 w-64 shadow-lg`}
          style={{ backgroundColor: 'rgb(27, 27, 27)' }}
        >
          <div className="p-6" style={{ backgroundColor: 'rgb(27, 27, 27)' }}>
            <div className="flex flex-col items-center">
              <button 
                onClick={() => {
                  handleTabSwitch("home")
                  setSidebarOpen(false)
                }}
                className="transition-all duration-300 hover:scale-105 focus:outline-none mb-3"
              >
                <img 
                  src={adminLogoImage || "/placeholder.svg"} 
                  alt="Admin Logo" 
                  className="h-32 w-32 object-contain"
                />
              </button>
              <h2 className="text-sm font-bold text-lime-500 text-center leading-tight">
                Kapalong Department Agriculture
              </h2>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabSwitch("home")}
                  className="flex items-center w-full p-2 rounded-lg text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors"
                >
                  <LayoutDashboard size={24} className="mr-3" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabSwitch("farmer-registration")}
                  className="flex items-center w-full p-2 rounded-lg text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors"
                >
                  <img src={registrationIcon} alt="Registration" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] mr-3 object-contain" />
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
                  className="flex items-center w-full p-2 rounded-lg text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors pl-10"
                >
                  <Map size={24} className="mr-3" />
                  View Farm Locations
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleTabSwitch("claims")
                    setSidebarOpen(false)
                  }}
                  className="flex items-center w-full p-2 rounded-lg text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors"
                >
                  <img src={cashIcon} alt="Cash" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] mr-3 object-contain" />
                  Cash Assistance Claims
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleTabSwitch("distribution")
                    setSidebarOpen(false)
                  }}
                  className="flex items-center w-full p-2 rounded-lg text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors"
                >
                  <img src={distributionIcon} alt="Distribution" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] mr-3 object-contain" />
                  Distribution Records
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("assistance")
                    setSidebarOpen(false)
                  }}
                  className="flex items-center w-full p-2 rounded-lg text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors"
                >
                  <img src={inventoryIcon} alt="Inventory" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] mr-3 object-contain" />
                  Assistance Inventory
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("crop-insurance")
                    setSidebarOpen(false)
                  }}
                  className="flex items-center w-full p-2 rounded-lg text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors"
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
                  className="flex items-center w-full p-2 rounded-lg text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors"
                >
                  <img src={fileIcon} alt="File" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] mr-3 object-contain" />
                  File for Farmers
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Desktop Sidebar */}
        <aside 
          className={`hidden md:block ${sidebarExpanded ? 'w-64' : 'w-16'} shadow-lg text-black space-y-6 border-r border-gray-100 fixed top-0 left-0 h-screen overflow-y-auto transition-all duration-150 ease-out group z-20 scrollbar-hide`}
          style={{ backgroundColor: 'rgb(27, 27, 27)' }}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          {/* Admin Logo Section */}
          <div className={`p-6 transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: 'rgb(27, 27, 27)' }}>
            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleTabSwitch("home")}
                className={`transition-all duration-300 hover:scale-105 focus:outline-none mb-3 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src={adminLogoImage || "/placeholder.svg"} 
                  alt="Admin Logo" 
                  className="h-32 w-32 object-contain"
                />
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${sidebarExpanded ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
                <h2 className="text-sm font-bold text-lime-500 text-center leading-tight">
                  Kapalong Department Agriculture
                </h2>
              </div>
            </div>
          </div>

          {/* Main Navigation Section */}
          <div className="space-y-1 px-3">
            <button
              onClick={() => handleTabSwitch("home")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors`}
              title={!sidebarExpanded ? "Dashboard" : ""}
            >
              <LayoutDashboard size={24} className="flex-shrink-0" />
              {sidebarExpanded && <span>Dashboard</span>}
            </button>

            <div>
              <button
                onClick={() => {
                  handleTabSwitch("farmer-registration")
                  setShowFarmLocationsDropdown(!showFarmLocationsDropdown)
                }}
                className={`flex items-center ${sidebarExpanded ? 'justify-between gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors`}
                title={!sidebarExpanded ? "Farmer Registration" : ""}
              >
                <div className="flex items-center gap-3">
                  <img src={registrationIcon} alt="Registration" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] flex-shrink-0 object-contain" />
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
                  onClick={() => handleTabSwitch("crop-insurance")}
                  className={`flex items-center ${sidebarExpanded ? 'gap-3 pl-10' : 'justify-center px-2'} py-2 rounded-lg text-lime-500 font-bold hover:bg-lime-500 hover:text-black w-full text-left transition-colors`}
                  title={!sidebarExpanded ? "Crop Insurance" : ""}
                >
                  <Shield size={24} className="flex-shrink-0" />
                  {sidebarExpanded && <span>Crop Insurance</span>}
                </button>
              </div>
            </div>

            <button
              onClick={() => handleTabSwitch("claims")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors`}
              title={!sidebarExpanded ? "Cash Assistance Claims" : ""}
            >
              <img src={cashIcon} alt="Cash" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] flex-shrink-0 object-contain" />
              {sidebarExpanded && <span>Cash Assistance Claims</span>}
            </button>

            <button
              onClick={() => handleTabSwitch("distribution")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors`}
              title={!sidebarExpanded ? "Distribution Records" : ""}
            >
              <img src={distributionIcon} alt="Distribution" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] flex-shrink-0 object-contain" />
              {sidebarExpanded && <span>Distribution Records</span>}
            </button>

            <button
              onClick={() => handleTabSwitch("assistance")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors`}
              title={!sidebarExpanded ? "Assistance Inventory" : ""}
            >
              <img src={inventoryIcon} alt="Inventory" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] flex-shrink-0 object-contain" />
              {sidebarExpanded && <span>Assistance Inventory</span>}
            </button>

            <button
              onClick={() => handleTabSwitch("admin-filing")}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left text-lime-500 font-bold hover:bg-lime-500 hover:text-black transition-colors`}
              title={!sidebarExpanded ? "File for Farmers" : ""}
            >
              <img src={fileIcon} alt="File" className="w-8 h-8 min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] flex-shrink-0 object-contain" />
              {sidebarExpanded && <span>File for Farmers</span>}
            </button>
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
        <main className={`flex-1 p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-all duration-300 ease-in-out ${sidebarExpanded ? 'md:ml-64' : 'md:ml-16'}`}>
          {activeTab === "home" && (
            <>
              {/* --- Analytics Filters --- */}
              {/* Remove the old analyticsFilters and setAnalyticsFilters dropdowns and reset button in the analytics section. */}
              {/* Only use the new floating filter drawer and its state for filtering and displaying analytics. */}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 mb-8">
                {/* Farmers Block */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 flex items-center justify-between ${darkMode ? 'text-white' : 'text-gray-800'} hover:scale-105 transition-all duration-300 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'} mb-1`}>Farmers</div>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>{totalFarmers}</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Total Registered</div>
                  {/* Analytics Mini Chart */}
                    <div className={`w-full h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-lime-400 to-lime-600 rounded-lg" 
                         style={{ width: `${Math.min((totalFarmers / 1000) * 100, 100)}%` }}>
                    </div>
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Growth: +{Math.floor(totalFarmers * 0.05)} this month</div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <img src={totalFarmerImage} alt="Total Farmers" className="h-12 w-12 min-w-[3rem] min-h-[3rem] max-w-[3rem] max-h-[3rem] object-contain" />
                  </div>
                </div>

                {/* Active Block */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 flex items-center justify-between ${darkMode ? 'text-white' : 'text-gray-800'} hover:scale-105 transition-all duration-300 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'} mb-1`}>Active</div>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>{activeFarmersData.activeCount || 0}</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Online Today</div>
                  {/* Analytics Mini Chart */}
                    <div className={`w-full h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-lg" 
                         style={{ width: `${Math.min(((activeFarmersData.activeCount || 0) / Math.max(totalFarmers, 1)) * 100, 100)}%` }}>
                    </div>
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Active Rate: {Math.round(((activeFarmersData.activeCount || 0) / Math.max(totalFarmers, 1)) * 100)}%</div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <img src={activeImage} alt="Active Farmers" className="h-12 w-12 min-w-[3rem] min-h-[3rem] max-w-[3rem] max-h-[3rem] object-contain" />
                  </div>
                </div>

                {/* Pending Block */}
                <div className="bg-white rounded-xl p-4 flex items-center justify-between text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm border border-gray-200">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-black mb-1">Pending</div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{pendingClaims}</div>
                  <div className="text-xs text-gray-600 mb-2">Insurance Claims</div>
                  {/* Analytics Mini Chart */}
                    <div className="w-full h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg" 
                         style={{ width: `${Math.min((pendingClaims / Math.max(totalFarmers, 1)) * 100, 100)}%` }}>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Processing: {Math.round((pendingClaims / Math.max(claims.length, 1)) * 100)}%</div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <img src={pendingImage} alt="Pending Claims" className="h-12 w-12 min-w-[3rem] min-h-[3rem] max-w-[3rem] max-h-[3rem] object-contain" />
                  </div>
                </div>

                {/* Farmer Assisted Block */}
                <div className="bg-white rounded-xl p-4 flex items-center justify-between text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm border border-gray-200">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-black mb-1">Farmer Assisted</div>
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
                    <div className="w-full h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg" 
                         style={{ 
                           backgroundColor: '#ededdc',
                           width: `${Math.min(((() => {
                             const currentMonth = new Date().getMonth();
                             const currentYear = new Date().getFullYear();
                             return allApplications.filter(app => {
                               const appDate = new Date(app.createdAt || app.date);
                               return (app.status === 'distributed' || app.status === 'approved') && 
                                      appDate.getMonth() === currentMonth && 
                                      appDate.getFullYear() === currentYear;
                             }).length;
                           })() / Math.max(totalFarmers, 1)) * 100, 100)}%` 
                         }}>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Monthly Target: {Math.floor(totalFarmers * 0.1)}</div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <img src={assistedImage} alt="Farmer Assisted" className="h-12 w-12 min-w-[3rem] min-h-[3rem] max-w-[3rem] max-h-[3rem] object-contain" />
                  </div>
                </div>

                {/* Todays Weather Block */}
                <WeatherKPIBlock />
              </div>

              {/* Chart Visualizations Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                {/* Claims Trend Over Time - Left side, larger */}
                <div className="lg:col-span-2 p-8 relative overflow-hidden backdrop-blur-xl" style={{
                  borderRadius: '5px',
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 20, 10, 0.98) 50%, rgba(0, 0, 0, 0.95) 100%)',
                  boxShadow: '0 0 40px rgba(132, 204, 22, 0.3), inset 0 0 60px rgba(132, 204, 22, 0.05)',
                  border: '1px solid rgba(132, 204, 22, 0.2)',
                }}>
                  {/* Animated grid background */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(132, 204, 22, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(132, 204, 22, 0.3) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                  }}></div>
                  {/* Glowing orb effect */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-600 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-xl font-semibold text-lime-400" style={{ textShadow: '0 0 20px rgba(132, 204, 22, 0.5)' }}>Claims Trend Over Time</h3>
                    <div className="flex items-center gap-4">
                      {/* Time Period Filter */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTimePeriodFilter('today')}
                          className={`px-3 py-1 text-sm rounded-lg transition-all duration-300 ${
                            timePeriodFilter === 'today' 
                              ? 'font-bold text-black bg-lime-400 shadow-lg shadow-lime-500/50' 
                              : 'text-gray-400 hover:text-lime-400 hover:bg-lime-500/10'
                          }`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setTimePeriodFilter('lastWeek')}
                          className={`px-3 py-1 text-sm rounded-lg transition-all duration-300 ${
                            timePeriodFilter === 'lastWeek' 
                              ? 'font-bold text-black bg-lime-400 shadow-lg shadow-lime-500/50' 
                              : 'text-gray-400 hover:text-lime-400 hover:bg-lime-500/10'
                          }`}
                        >
                          Last Week
                        </button>
                        <button
                          onClick={() => setTimePeriodFilter('lastMonth')}
                          className={`px-3 py-1 text-sm rounded-lg transition-all duration-300 ${
                            timePeriodFilter === 'lastMonth' 
                              ? 'font-bold text-black bg-lime-400 shadow-lg shadow-lime-500/50' 
                              : 'text-gray-400 hover:text-lime-400 hover:bg-lime-500/10'
                          }`}
                        >
                          Last Month
                        </button>
                        <button
                          onClick={() => setTimePeriodFilter('thisMonth')}
                          className={`px-3 py-1 text-sm rounded-lg transition-all duration-300 ${
                            timePeriodFilter === 'thisMonth' 
                              ? 'font-bold text-black bg-lime-400 shadow-lg shadow-lime-500/50' 
                              : 'text-gray-400 hover:text-lime-400 hover:bg-lime-500/10'
                          }`}
                        >
                          This Month
                        </button>
                        <button
                          onClick={() => setTimePeriodFilter('thisYear')}
                          className={`px-3 py-1 text-sm rounded-lg transition-all duration-300 ${
                            timePeriodFilter === 'thisYear' 
                              ? 'font-bold text-black bg-lime-400 shadow-lg shadow-lime-500/50' 
                              : 'text-gray-400 hover:text-lime-400 hover:bg-lime-500/10'
                          }`}
                        >
                          This Year
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="h-[500px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={claimsTrendData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          {/* Neon Lime to Black Gradient for Approved Line */}
                          <linearGradient id="approvedGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#bef264" stopOpacity={1}/>
                            <stop offset="50%" stopColor="#84cc16" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#000000" stopOpacity={0.8}/>
                          </linearGradient>
                          {/* Neon Lime Glow Shadow for Approved */}
                          <filter id="approvedGlow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                          {/* Area gradient for approved with neon lime */}
                          <linearGradient id="approvedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#bef264" stopOpacity={0.3}/>
                            <stop offset="50%" stopColor="#84cc16" stopOpacity={0.15}/>
                            <stop offset="100%" stopColor="#000000" stopOpacity={0.05}/>
                          </linearGradient>
                          {/* Black to Gray Gradient for Rejected Line */}
                          <linearGradient id="rejectedGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#1a1a1a" stopOpacity={1}/>
                            <stop offset="50%" stopColor="#4a4a4a" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#808080" stopOpacity={0.8}/>
                          </linearGradient>
                          {/* Gray Shadow for Rejected */}
                          <filter id="rejectedGlow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                          {/* Area gradient for rejected */}
                          <linearGradient id="rejectedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4a4a4a" stopOpacity={0.2}/>
                            <stop offset="50%" stopColor="#2a2a2a" stopOpacity={0.1}/>
                            <stop offset="100%" stopColor="#000000" stopOpacity={0.03}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="period" 
                          stroke="rgba(132, 204, 22, 0.3)"
                          fontSize={12}
                          axisLine={{ stroke: 'rgba(132, 204, 22, 0.2)' }}
                          tickLine={false}
                          tick={{ fill: '#84cc16', fontWeight: 500 }}
                        />
                        <YAxis 
                          stroke="rgba(132, 204, 22, 0.3)"
                          fontSize={12}
                          axisLine={{ stroke: 'rgba(132, 204, 22, 0.2)' }}
                          tickLine={false}
                          tick={{ fill: '#84cc16', fontWeight: 500 }}
                          grid={{ stroke: 'rgba(132, 204, 22, 0.1)' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.95)',
                            border: '1px solid rgba(132, 204, 22, 0.5)',
                            borderRadius: '12px',
                            color: '#84cc16',
                            boxShadow: '0 0 30px rgba(132, 204, 22, 0.3), inset 0 0 20px rgba(132, 204, 22, 0.1)',
                            backdropFilter: 'blur(10px)'
                          }}
                          labelStyle={{ color: '#bef264', fontSize: '14px', fontWeight: '700', textShadow: '0 0 10px rgba(190, 242, 100, 0.5)' }}
                          formatter={(value, name, props) => {
                            const labels = {
                              approved: 'Approved Claims', 
                              rejected: 'Rejected Claims'
                            };
                            const total = props.payload.total;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return [`${value} (${percentage}%)`, labels[name] || name];
                          }}
                          labelFormatter={(label) => {
                            return `${label}`;
                          }}
                          shared={true}
                          allowEscapeViewBox={{ x: false, y: false }}
                          filterNull={true}
                        />
                        <RechartsLegend 
                          verticalAlign="top" 
                          height={36}
                          wrapperStyle={{ color: '#84cc16', fontSize: '14px', fontWeight: '600' }}
                          formatter={(value, entry) => {
                            const labels = {
                              approved: 'Approved Claims',
                              rejected: 'Rejected Claims'
                            };
                            return labels[entry.dataKey] || value;
                          }}
                        />
                        {/* CartesianGrid with neon lime styling */}
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="rgba(132, 204, 22, 0.1)" 
                          vertical={false}
                        />
                        {/* Line for approved claims with neon lime to black gradient and glow */}
                        <RechartsLine 
                          type="monotone" 
                          dataKey="approved" 
                          name="approved"
                          stroke="url(#approvedGradient)" 
                          strokeWidth={4}
                          dot={{ r: 4, fill: '#bef264', stroke: '#bef264', strokeWidth: 2, filter: 'url(#approvedGlow)' }}
                          activeDot={{ 
                            r: 8, 
                            fill: '#bef264', 
                            stroke: '#bef264', 
                            strokeWidth: 3, 
                            filter: 'url(#approvedGlow)',
                            style: { boxShadow: '0 0 20px rgba(190, 242, 100, 0.8)' }
                          }}
                          connectNulls={false}
                          fill="url(#approvedAreaGradient)"
                          filter="url(#approvedGlow)"
                        />
                        {/* Line for rejected claims with black to gray gradient and shadow */}
                        <RechartsLine 
                          type="monotone" 
                          dataKey="rejected" 
                          name="rejected"
                          stroke="url(#rejectedGradient)" 
                          strokeWidth={4}
                          dot={{ r: 4, fill: '#808080', stroke: '#4a4a4a', strokeWidth: 2, filter: 'url(#rejectedGlow)' }}
                          activeDot={{ 
                            r: 8, 
                            fill: '#808080', 
                            stroke: '#4a4a4a', 
                            strokeWidth: 3, 
                            filter: 'url(#rejectedGlow)'
                          }}
                          connectNulls={false}
                          fill="url(#rejectedAreaGradient)"
                          filter="url(#rejectedGlow)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right side - Two charts stacked */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Assistance Application Breakdown - Top */}
                  <div className="p-6 border border-gray-200 rounded-lg bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Assistance Application Breakdown</h3>
                    <div className="flex flex-col lg:flex-row">
                      {/* Left side - Chart Visualization */}
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div 
                          className="relative overflow-hidden transition-all duration-300 flex items-center justify-center" 
                          style={{ 
                            minHeight: '200px',
                            height: '200px',
                            width: '200px',
                            maxWidth: '100%',
                            maxHeight: '100%'
                          }}
                        >
                          <ResponsiveContainer 
                            width="100%" 
                            height="100%"
                            minHeight={200}
                            minWidth={200}
                          >
                            <RechartsPieChart
                              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                            >
                              <RechartsPie
                                data={(() => {
                                  const pending = allApplications.filter(app => app.status === 'pending').length;
                                  const approved = allApplications.filter(app => app.status === 'approved').length;
                                  const rejected = allApplications.filter(app => app.status === 'rejected').length;
                                  const distributed = allApplications.filter(app => app.status === 'distributed').length;
                                  const total = pending + approved + rejected + distributed;
                                  
                                  return [
                                    { name: 'Pending', value: pending, color: '#f59e0b', percentage: total > 0 ? ((pending / total) * 100).toFixed(1) : '0' },
                                    { name: 'Approved', value: approved, color: '#00ff00', percentage: total > 0 ? ((approved / total) * 100).toFixed(1) : '0' },
                                    { name: 'Rejected', value: rejected, color: '#000000', percentage: total > 0 ? ((rejected / total) * 100).toFixed(1) : '0' },
                                    { name: 'Distributed', value: distributed, color: '#ededdc', percentage: total > 0 ? ((distributed / total) * 100).toFixed(1) : '0' }
                                  ];
                                })()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={0}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                                animationEasing="ease-out"
                              >
                                {(() => {
                                  const pending = allApplications.filter(app => app.status === 'pending').length;
                                  const approved = allApplications.filter(app => app.status === 'approved').length;
                                  const rejected = allApplications.filter(app => app.status === 'rejected').length;
                                  const distributed = allApplications.filter(app => app.status === 'distributed').length;
                                  
                                  return [
                                    { name: 'Pending', value: pending, color: '#f59e0b' },
                                    { name: 'Approved', value: approved, color: '#00ff00' },
                                    { name: 'Rejected', value: rejected, color: '#000000' },
                                    { name: 'Distributed', value: distributed, color: '#ededdc' }
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ));
                                })()}
                              </RechartsPie>
                              <RechartsTooltip 
                                contentStyle={{
                                  backgroundColor: '#1f2937',
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#f9fafb',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value, name) => {
                                  const pending = allApplications.filter(app => app.status === 'pending').length;
                                  const approved = allApplications.filter(app => app.status === 'approved').length;
                                  const rejected = allApplications.filter(app => app.status === 'rejected').length;
                                  const distributed = allApplications.filter(app => app.status === 'distributed').length;
                                  const total = pending + approved + rejected + distributed;
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                  return [`${value} (${percentage}%)`, name];
                                }}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                          
                          {/* Center text */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="text-center">
                              <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 transition-all duration-300">
                                {(() => {
                                  const pending = allApplications.filter(app => app.status === 'pending').length;
                                  const approved = allApplications.filter(app => app.status === 'approved').length;
                                  const rejected = allApplications.filter(app => app.status === 'rejected').length;
                                  const distributed = allApplications.filter(app => app.status === 'distributed').length;
                                  return pending + approved + rejected + distributed;
                                })()}
                              </div>
                              <div className="text-xs xs:text-sm sm:text-base md:text-sm lg:text-sm xl:text-base text-gray-600 transition-all duration-300">Total Applications</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side - Legend */}
                      <div className="w-full lg:w-48 lg:pl-4 transition-all duration-300">
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-2 xs:gap-3 sm:gap-3 lg:space-y-3 lg:space-y-0">
                          {(() => {
                            const pending = allApplications.filter(app => app.status === 'pending').length;
                            const approved = allApplications.filter(app => app.status === 'approved').length;
                            const rejected = allApplications.filter(app => app.status === 'rejected').length;
                            const distributed = allApplications.filter(app => app.status === 'distributed').length;
                            const total = pending + approved + rejected + distributed;
                            
                            return [
                              { name: 'Pending', value: pending, color: '#f59e0b' },
                              { name: 'Approved', value: approved, color: '#00ff00' },
                              { name: 'Rejected', value: rejected, color: '#000000' },
                              { name: 'Distributed', value: distributed, color: '#ededdc' }
                            ].map((item, index) => {
                              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                              return (
                                <div key={index} className="flex items-center space-x-1 xs:space-x-2 sm:space-x-2 md:space-x-3 lg:space-x-3 transition-all duration-300">
                                  <div 
                                    className="w-2 h-2 xs:w-3 xs:h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 rounded-full flex-shrink-0 transition-all duration-300" 
                                    style={{ backgroundColor: item.color }}
                                  ></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs xs:text-xs sm:text-sm md:text-sm lg:text-sm font-medium text-gray-800 truncate transition-all duration-300">{item.name}</div>
                                    <div className="text-xs xs:text-xs sm:text-xs md:text-xs lg:text-xs text-gray-600 transition-all duration-300">{item.value} ({percentage}%)</div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Crop Market Prices - Bottom */}
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Kapalong Crop Market Prices</h3>
                      <button
                        onClick={() => setShowCropPriceManagement(true)}
                        className="flex items-center gap-2 px-3 py-1 text-gray-700 rounded-lg text-xs font-medium hover:text-lime-600 hover:font-bold hover:bg-lime-100 transition-all"
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
                              crop: crop.cropName,
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

              {/* Overview: Farmers Map (embedded) - Minimalist Blockchain Style */}
              <div className="bg-white rounded-xl p-6 mt-6 border border-gray-300 relative overflow-hidden shadow-sm" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
                
                {/* Decorative Lines */}
                <div className="absolute top-8 left-8 w-24 h-0.5 bg-gradient-to-r from-lime-500 to-transparent opacity-60 z-10"></div>
                <div className="absolute top-8 right-8 w-24 h-0.5 bg-gradient-to-l from-lime-500 to-transparent opacity-60 z-10"></div>
                
                <div className="sticky top-0 flex items-center justify-between mb-6 relative z-10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black rounded-lg animate-pulse" style={{ boxShadow: '0 0 20px rgba(132, 204, 22, 0.8)' }}>
                      <img src={locationImage} alt="Geo-Tagging Map" className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-black tracking-wide uppercase">🗺️ Map Overview</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px rgba(132, 204, 22, 1)' }}></span>
                        <span className="text-[10px] text-gray-600 uppercase tracking-wider">Blockchain Protocol</span>
                      </div>
                    </div>
                    {weatherLoading && (
                      <div className="ml-4 flex items-center text-xs text-lime-600 font-semibold">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lime-500 mr-2"></div>
                        Loading...
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Weather Overlay Toggle - Minimalist */}
                    <button
                      onClick={async () => {
                        setShowWeatherOverlay(!showWeatherOverlay)
                        if (!showWeatherOverlay) {
                          setWeatherLoading(true)
                          try {
                            const farmersWithLocation = farmers.filter(farmer => 
                              farmer.location && 
                              typeof farmer.location.lat === 'number' && 
                              typeof farmer.location.lng === 'number'
                            )
                            
                            if (farmersWithLocation.length > 0) {
                              const weatherResults = await getWeatherForMultipleLocations(farmersWithLocation)
                              setWeatherData(weatherResults)
                            }
                          } catch (error) {
                            console.error('Error fetching weather for farmers:', error)
                          } finally {
                            setWeatherLoading(false)
                          }
                        }
                      }}
                      className="px-3 py-2 text-xs font-bold text-black hover:text-lime-500 bg-white hover:bg-black border-2 border-black hover:border-lime-500 rounded-lg transition-all uppercase tracking-wide"
                      style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                    >
                      Weather
                    </button>
                    
                    {/* Fit Map to Farmers Button - Minimalist */}
                    <button
                      onClick={fitMapToFarmers}
                      className="px-3 py-2 text-xs font-bold text-black hover:text-lime-500 bg-white hover:bg-black border-2 border-black hover:border-lime-500 rounded-lg transition-all uppercase tracking-wide"
                      title="Fit map to show all farmer locations"
                      style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                    >
                      Fit Map
                    </button>
                    
                    {/* Refresh Weather Button - Minimalist */}
                    {showWeatherOverlay && (
                      <button
                        onClick={async () => {
                          setWeatherData([])
                          weatherFetchedRef.current = false
                          setWeatherLoading(true)
                          try {
                            const farmersWithLocation = farmers.filter(farmer => 
                              farmer.location && 
                              typeof farmer.location.lat === 'number' && 
                              typeof farmer.location.lng === 'number'
                            )
                            
                            if (farmersWithLocation.length > 0) {
                              const weatherResults = await getWeatherForMultipleLocations(farmersWithLocation)
                              setWeatherData(weatherResults)
                            }
                          } catch (error) {
                            console.error('Error fetching weather for farmers:', error)
                          } finally {
                            setWeatherLoading(false)
                          }
                        }}
                        className="px-3 py-2 text-xs font-bold text-black hover:text-lime-500 bg-white hover:bg-black border-2 border-black hover:border-lime-500 rounded-lg transition-all uppercase tracking-wide disabled:opacity-50"
                        title="Refresh weather data"
                        disabled={weatherLoading}
                        style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                      >
                        {weatherLoading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    )}
                    <select
                      value={cropFilter}
                      onChange={(e) => setCropFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold bg-white text-black border-2 border-lime-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 uppercase"
                      title="Filter by crop"
                      style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                    >
                      <option value="all">All Crops</option>
                      {availableCrops.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold bg-white text-black border-2 border-lime-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 uppercase"
                      title="Filter by month"
                      style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
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
                      className="px-3 py-2 text-xs font-bold bg-white text-black border-2 border-lime-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 uppercase"
                      title="Filter by year"
                      style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                    >
                      <option value="all">All Years</option>
                      {Array.from({ length: 2025 - 1990 + 1 }, (_, i) => 1990 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="w-full h-[420px] rounded-lg border-2 border-lime-500 overflow-hidden relative z-10" style={{ boxShadow: '0 0 20px rgba(132, 204, 22, 0.4)' }}>
                  <div ref={overviewMapRef} className="w-full h-full" />
                </div>
                
                {/* Weather Legend - Minimalist Blockchain Style */}
                {showWeatherOverlay && (
                  <div className="mt-6 p-5 bg-lime-500 rounded-lg border-2 border-black relative z-10" style={{ boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)' }}>
                    <div className="flex items-center mb-4 pb-3 border-b-2 border-black">
                      <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.6)' }}>
                        <Cloud size={18} className="text-lime-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-black uppercase tracking-wider">Weather Status</h4>
                        <span className="text-[10px] text-gray-600 flex items-center gap-1">
                          <span className="w-1 h-1 bg-lime-500 rounded-full"></span>
                          Real-time Data
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-black" style={{ boxShadow: '0 0 8px rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                        <span className="text-gray-700 font-semibold">Excellent</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-black" style={{ boxShadow: '0 0 8px rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <span className="text-gray-700 font-semibold">Good</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-black" style={{ boxShadow: '0 0 8px rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
                        <span className="text-gray-700 font-semibold">Moderate</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-black" style={{ boxShadow: '0 0 8px rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
                        <span className="text-gray-700 font-semibold">Caution</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-black" style={{ boxShadow: '0 0 8px rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                        <span className="text-gray-700 font-semibold">Warning</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-black" style={{ boxShadow: '0 0 8px rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-3 h-3 rounded-full bg-red-700 flex-shrink-0"></div>
                        <span className="text-gray-700 font-semibold">Danger</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-black text-xs text-gray-700 flex items-center bg-white p-3 rounded-lg border border-black" style={{ boxShadow: '0 0 8px rgba(0, 0, 0, 0.15)' }}>
                      <span className="text-lime-500 mr-2 font-bold">►</span>
                      <span className="font-medium">Click markers for detailed weather data</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pending Insurance Claims Section */}
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <img src={insuranceImage} alt="Pending Insurance Claims" className="h-12 w-12 mr-3" />
                  <h2 className="text-lg font-semibold text-gray-800">Pending Insurance Claims</h2>
                  <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    {claims.filter((c) => c.status === "pending").length}
                  </span>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden shadow-sm">
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
                  <img src={recentImage} alt="Recent Claims" className="h-12 w-12 mr-3" />
                  <h2 className="text-lg font-semibold text-gray-800">Recent Claims</h2>
                  <span className="ml-2 px-2 py-1 bg-lime-100 text-lime-700 text-xs font-medium rounded-full">
                    {claims.slice(0, 5).length}
                  </span>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden shadow-sm">
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
                <div className="flex gap-3 items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Cash Assistance Claims</h2>
                  <button
                    onClick={() => setShowClaimsSummaryModal(true)}
                    className="bg-lime-500 text-black px-4 py-2 rounded-lg hover:bg-lime-400 transition-all duration-200 flex items-center justify-center font-bold border-2 border-black whitespace-nowrap text-sm"
                    style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.5)' }}
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Generate Summary
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setClaimsTabView("pending")}
                    className={`px-4 py-2 rounded-lg font-bold border-2 border-black transition-all ${
                      claimsTabView === "pending"
                        ? "bg-black text-lime-500"
                        : "bg-transparent text-black hover:bg-black hover:text-lime-500"
                    }`}
                  >
                    Pending Cash Assistance Claims
                  </button>
                  <button
                    onClick={() => setClaimsTabView("all")}
                    className={`px-4 py-2 rounded-lg font-bold border-2 border-black transition-all ${
                      claimsTabView === "all"
                        ? "bg-lime-500 text-black"
                        : "bg-lime-500 text-black hover:bg-lime-400"
                    }`}
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.4)' }}
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
                  sendPickupAlert={sendPickupAlert}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  showClaimsSummaryModal={showClaimsSummaryModal}
                  setShowClaimsSummaryModal={setShowClaimsSummaryModal}
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
              onNavigateToDashboardMap={handleNavigateToDashboardMap}
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
                        className="relative group rounded-[5px] shadow-xl p-0 bg-gradient-to-br from-lime-100 via-white to-lime-50 border-2 border-lime-200 hover:shadow-2xl transition-all duration-300 flex items-stretch min-h-[260px]"
                      >
                        {/* KPI Ribbon */}
                        <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-[5px] text-xs font-bold tracking-wider z-10 bg-lime-600 text-white shadow-md">
                          {item.assistanceType}
                        </div>
                        
                        {/* Left Section - Text Content */}
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
                              className="flex-1 flex items-center justify-center gap-1 bg-transparent text-blue-600 px-3 py-2 rounded-[5px] font-semibold border border-blue-600 hover:bg-blue-50 transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditEvent(index)}
                              className="flex-1 flex items-center justify-center gap-1 bg-transparent text-lime-600 px-3 py-2 rounded-[5px] font-semibold border border-lime-600 hover:bg-lime-50 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(index)}
                              className="flex-1 flex items-center justify-center gap-1 bg-transparent text-red-600 px-3 py-2 rounded-[5px] font-semibold border border-red-600 hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        {/* Right Section - Image */}
                        {item.photo && (
                          <div className="flex items-center justify-center w-32 h-32 rounded-r-[5px] border-l border-lime-100 overflow-hidden flex-shrink-0">
                            <img src={item.photo} alt="Assistance Logo" className="object-contain w-full h-full" />
                          </div>
                        )}
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
            <div className="p-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
              <div className="max-w-6xl mx-auto">
                {/* Header with Blockchain Vibe */}
                <div className="mb-8 text-center relative">
                  <div className="absolute inset-0 bg-lime-500 opacity-5 blur-3xl"></div>
                  <h1 className="text-4xl font-bold text-white mb-3 relative" style={{ textShadow: '0 0 20px rgba(132, 204, 22, 0.6)' }}>
                    <span className="text-lime-400">⛓️ BLOCKCHAIN</span> FILE SYSTEM
                  </h1>
                  <p className="text-gray-300 relative max-w-2xl mx-auto">
                    Secure, transparent, and immutable filing system powered by blockchain technology.
                    Help farmers file claims and assistance applications with complete data integrity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Claim Card - Blockchain Style */}
                  <div className="bg-black rounded-lg border-2 border-lime-500 p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300" 
                       style={{ boxShadow: '0 0 20px rgba(132, 204, 22, 0.3)' }}>
                    {/* Animated Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lime-400"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lime-400"></div>
                    
                    <div className="flex items-center mb-6 relative z-10">
                      <div className="p-4 bg-lime-500 rounded-lg mr-4" style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.6)' }}>
                        <FileText className="h-8 w-8 text-black" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-lime-400 mb-1">FILE INSURANCE CLAIM</h2>
                        <p className="text-gray-400 text-sm flex items-center">
                          <span className="w-2 h-2 bg-lime-400 rounded-full mr-2 animate-pulse"></span>
                          Blockchain-Verified Claims
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative z-10 mb-6 space-y-3">
                      <p className="text-gray-300 text-sm">
                        🔗 Submit insurance claims with blockchain verification
                      </p>
                      <p className="text-gray-400 text-xs">
                        ✓ Immutable records • Instant verification • Transparent tracking
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowAdminClaimFiling(true)}
                      className="w-full bg-lime-500 text-black py-3 px-4 rounded-lg hover:bg-lime-400 transition-all duration-300 flex items-center justify-center space-x-2 font-bold relative z-10 group-hover:scale-105"
                      style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.5)' }}
                    >
                      <FileText className="h-5 w-5" />
                      <span>INITIATE CLAIM FILING</span>
                    </button>
                  </div>

                  {/* File Assistance Card - Blockchain Style */}
                  <div className="bg-black rounded-lg border-2 border-lime-500 p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300" 
                       style={{ boxShadow: '0 0 20px rgba(132, 204, 22, 0.3)' }}>
                    {/* Animated Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lime-400"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lime-400"></div>
                    
                    <div className="flex items-center mb-6 relative z-10">
                      <div className="p-4 bg-lime-500 rounded-lg mr-4" style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.6)' }}>
                        <HandHeart className="h-8 w-8 text-black" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-lime-400 mb-1">FILE ASSISTANCE APP</h2>
                        <p className="text-gray-400 text-sm flex items-center">
                          <span className="w-2 h-2 bg-lime-400 rounded-full mr-2 animate-pulse"></span>
                          Smart Contract Enabled
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative z-10 mb-6 space-y-3">
                      <p className="text-gray-300 text-sm">
                        🔗 Process assistance applications via blockchain
                      </p>
                      <p className="text-gray-400 text-xs">
                        ✓ Automated eligibility • Secure distribution • Real-time updates
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowAdminAssistanceFiling(true)}
                      className="w-full bg-lime-500 text-black py-3 px-4 rounded-lg hover:bg-lime-400 transition-all duration-300 flex items-center justify-center space-x-2 font-bold relative z-10 group-hover:scale-105"
                      style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.5)' }}
                    >
                      <HandHeart className="h-5 w-5" />
                      <span>INITIATE ASSISTANCE FILING</span>
                    </button>
                  </div>
                </div>

                {/* Blockchain Instructions Panel */}
                <div className="mt-8 bg-black border-2 border-lime-500 rounded-lg p-6 relative overflow-hidden" style={{ boxShadow: '0 0 20px rgba(132, 204, 22, 0.3)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500 opacity-5 blur-2xl"></div>
                  
                  <div className="flex items-center mb-4 relative z-10">
                    <div className="w-1 h-8 bg-lime-500 mr-3" style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.8)' }}></div>
                    <h3 className="text-xl font-bold text-lime-400">SYSTEM PROTOCOL FOR DA STAFF</h3>
                  </div>
                  
                  <div className="space-y-3 text-gray-300 relative z-10">
                    <div className="flex items-start space-x-3 p-3 bg-gray-900 rounded border-l-2 border-lime-500">
                      <span className="text-lime-400 font-bold">►</span>
                      <p><span className="text-white font-semibold">CLAIMS PROTOCOL:</span> Select farmer from database → Fill damage assessment form → Submit to blockchain → Generate verification hash → Farmer signature required</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gray-900 rounded border-l-2 border-lime-500">
                      <span className="text-lime-400 font-bold">►</span>
                      <p><span className="text-white font-semibold">ASSISTANCE PROTOCOL:</span> Verify eligibility via smart contract → Select program → Submit application → Automated approval process → Track on blockchain ledger</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gray-900 rounded border-l-2 border-lime-500">
                      <span className="text-lime-400 font-bold">►</span>
                      <p><span className="text-white font-semibold">SECURITY:</span> All records are encrypted and stored on distributed ledger → Verify farmer identity → Collect digital/physical signatures → Maintain audit trail</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gray-900 rounded border-l-2 border-lime-500">
                      <span className="text-lime-400 font-bold">►</span>
                      <p><span className="text-white font-semibold">TRACKING:</span> Real-time status monitoring → Blockchain transaction history → Automated notifications → Transparent verification system</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-lime-500/30 flex items-center justify-center space-x-4 text-xs text-gray-500 relative z-10">
                    <span className="flex items-center"><span className="w-2 h-2 bg-lime-400 rounded-full mr-2 animate-pulse"></span>SYSTEM ONLINE</span>
                    <span>|</span>
                    <span>BLOCKCHAIN SECURED</span>
                    <span>|</span>
                    <span>END-TO-END ENCRYPTED</span>
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

      {/* Map Modal - White Background Blockchain Farm Vibe */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col border-4 border-lime-500 relative" style={{ boxShadow: '0 0 40px rgba(132, 204, 22, 0.7)' }}>
            {/* Corner Accents - Lime */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-lime-500 pointer-events-none z-10" style={{ filter: 'drop-shadow(0 0 10px rgba(132, 204, 22, 0.6))' }}></div>
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-lime-500 pointer-events-none z-10" style={{ filter: 'drop-shadow(0 0 10px rgba(132, 204, 22, 0.6))' }}></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-lime-500 pointer-events-none z-10" style={{ filter: 'drop-shadow(0 0 10px rgba(132, 204, 22, 0.6))' }}></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-lime-500 pointer-events-none z-10" style={{ filter: 'drop-shadow(0 0 10px rgba(132, 204, 22, 0.6))' }}></div>
            
            {/* Header */}
            <div className="sticky top-0 bg-lime-500 text-black p-4 rounded-t-lg flex justify-between items-center border-b-4 border-lime-500 z-20" style={{ boxShadow: '0 4px 20px rgba(132, 204, 22, 0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-lg border-2 border-lime-500" style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.6)' }}>
                  <MapPin className="h-6 w-6 text-lime-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">
                    {mapMode === "view" ? "🗺️ Farm Locations Map" : "📍 Select Farm Location"}
                  </h2>
                  <p className="text-xs text-black opacity-75 font-semibold uppercase tracking-wider">Kapalong, Davao del Norte</p>
                </div>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-black hover:text-red-600 focus:outline-none transition-all hover:rotate-90 duration-300 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              >
                <X size={28} strokeWidth={3} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-white border-b-2 border-lime-500 flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Search location in Kapalong..."
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    className="w-full p-3 pr-12 border-2 border-lime-500 rounded-lg bg-white text-black placeholder-gray-500 font-semibold focus:outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-400 transition-all"
                    style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.3)' }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        searchLocation()
                      }
                    }}
                  />
                  <button
                    onClick={searchLocation}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black hover:text-lime-500 bg-lime-500 hover:bg-lime-400 p-1.5 rounded-lg border-2 border-black transition-all"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {mapMode === "view" && (
                <button
                  onClick={() => setMapMode("add")}
                  className="bg-lime-500 text-black px-4 py-3 rounded-lg hover:bg-lime-400 flex items-center font-bold border-2 border-black transition-all"
                  style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.5)' }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Location
                </button>
              )}

              {mapMode === "add" && (
                <button
                  onClick={() => setMapMode("view")}
                  className="bg-white text-black px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center font-bold border-2 border-lime-500 transition-all"
                  style={{ boxShadow: '0 0 15px rgba(132, 204, 22, 0.5)' }}
                >
                  <Layers className="mr-2 h-5 w-5" />
                  View All Locations
                </button>
              )}
            </div>

            {/* Map Container */}
            <div className="flex-1 min-h-[500px] relative border-4 border-lime-500 m-2 rounded-lg overflow-hidden" style={{ boxShadow: 'inset 0 0 30px rgba(132, 204, 22, 0.3)' }}>
              <div ref={mapRef} className="w-full h-full"></div>
            </div>

            {/* Footer - Add Mode */}
            {mapMode === "add" && (
              <div className="p-4 border-t-4 border-lime-500 bg-white">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex-1">
                    {selectedLocation ? (
                      <div className="bg-lime-500 bg-opacity-20 border-2 border-lime-500 rounded-lg p-3">
                        <p className="text-sm text-black font-bold uppercase mb-1">📍 Selected Coordinates:</p>
                        <p className="text-xs text-black font-mono">
                          Lat: {selectedLocation.lat.toFixed(6)} | Lng: {selectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-3">
                        <p className="text-sm text-gray-600 font-semibold">
                          👆 Click on the map to select a farm location
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowMapModal(false)}
                      className="px-6 py-3 bg-white border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-all font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (selectedLocation) {
                          setShowMapModal(false)
                        } else {
                          useNotificationStore.getState().addAdminNotification({
                            id: generateUniqueId(),
                            type: 'warning',
                            title: 'No Location Selected',
                            message: 'Please select a location on the map first.',
                            timestamp: new Date()
                          });
                        }
                      }}
                      disabled={!selectedLocation}
                      className={`px-6 py-3 bg-lime-500 text-black rounded-lg font-bold border-2 border-black transition-all ${
                        !selectedLocation 
                          ? "opacity-50 cursor-not-allowed" 
                          : "hover:bg-lime-400"
                      }`}
                      style={selectedLocation ? { boxShadow: '0 0 20px rgba(132, 204, 22, 0.6)' } : {}}
                    >
                      ✅ Confirm Location
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
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border-4 border-lime-500" style={{ boxShadow: '0 0 30px rgba(132, 204, 22, 0.6)' }}>
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-black pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.3))' }}></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-black pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.3))' }}></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-black pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.3))' }}></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-black pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.3))' }}></div>
            
            <h3 className="text-xl font-bold mb-4 text-black uppercase tracking-wide">
              {confirmationAction.type === "approved" ? "✅ Approve Claim" : "❌ Reject Claim"}
            </h3>
            <p className="mb-4 text-gray-700 font-semibold">
              Are you sure you want to {confirmationAction.type === "approved" ? "approve" : "reject"} this claim? This action cannot be undone.
            </p>
            
            {/* Schedule Fields for Approval */}
            {confirmationAction.type === "approved" && (
              <div className="mb-4 p-4 bg-lime-500 bg-opacity-10 border-2 border-lime-500 rounded-lg">
                <h4 className="text-md font-bold text-black mb-3 flex items-center">
                  📅 Pickup Schedule (Required)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pickupDate" className="block text-sm font-bold text-gray-700 mb-1">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      id="pickupDate"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pickupTime" className="block text-sm font-bold text-gray-700 mb-1">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      id="pickupTime"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 font-semibold"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  ℹ️ The farmer will be notified with this pickup schedule
                </p>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-bold text-gray-700 mb-2">
                Feedback (optional)
              </label>
              <textarea
                id="feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 font-semibold"
                rows={3}
                placeholder="Add feedback for the farmer..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setPickupDate("");
                  setPickupTime("");
                  setFeedbackText("");
                }}
                className="px-4 py-2 bg-white border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={confirmationAction.type === "approved" && (!pickupDate || !pickupTime)}
                className={`px-4 py-2 rounded-lg text-black font-bold border-2 border-black ${
                  confirmationAction.type === "approved"
                    ? (!pickupDate || !pickupTime)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-lime-500 hover:bg-lime-400"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
                style={confirmationAction.type === "approved" && pickupDate && pickupTime ? { boxShadow: '0 0 15px rgba(132, 204, 22, 0.5)' } : {}}
              >
                {confirmationAction.type === "approved" ? "Yes, Approve & Schedule" : "Yes, Reject"}
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

      {/* Calendar Tab */}
      {showCalendar && (
        <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden`} style={{ borderRadius: '5px' }}>
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Calendar</h2>
              <button
                onClick={() => setShowCalendar(false)}
                className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar Widget */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`} style={{ borderRadius: '5px' }}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Monthly View</h3>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} py-2`}>{day}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = i - 6; // Start from previous month
                      const isCurrentMonth = date > 0 && date <= 31;
                      const isToday = date === new Date().getDate();
                      return (
                        <div
                          key={i}
                          className={`p-2 text-sm rounded cursor-pointer transition-colors ${
                            isCurrentMonth 
                              ? isToday 
                                ? 'bg-lime-600 text-white font-bold' 
                                : darkMode
                                  ? 'text-white hover:bg-lime-100 hover:text-gray-800'
                                  : 'text-gray-800 hover:bg-lime-100'
                              : darkMode
                                ? 'text-gray-500'
                                : 'text-gray-400'
                          }`}
                          style={{ borderRadius: '5px' }}
                        >
                          {date > 0 ? date : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Events/Activities */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`} style={{ borderRadius: '5px' }}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Today's Activities</h3>
                  <div className="space-y-3">
                    <div className={`flex items-center p-3 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded-lg shadow-sm`} style={{ borderRadius: '5px' }}>
                      <div className="w-3 h-3 bg-lime-500 rounded-full mr-3"></div>
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Farmer Registration</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>10:00 AM - 12:00 PM</div>
                      </div>
                    </div>
                    <div className={`flex items-center p-3 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded-lg shadow-sm`} style={{ borderRadius: '5px' }}>
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Assistance Distribution</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>2:00 PM - 4:00 PM</div>
                      </div>
                    </div>
                    <div className={`flex items-center p-3 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded-lg shadow-sm`} style={{ borderRadius: '5px' }}>
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Crop Insurance Review</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>4:30 PM - 6:00 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    className={`flex items-center justify-center p-4 ${darkMode ? 'bg-lime-800 hover:bg-lime-700' : 'bg-lime-100 hover:bg-lime-200'} rounded-lg transition-colors`}
                    style={{ borderRadius: '5px' }}
                    onClick={() => {
                      setShowCalendar(false)
                      handleTabSwitch('farmer-registration')
                    }}
                  >
                    <UserPlus size={20} className={`mr-2 ${darkMode ? 'text-lime-200' : 'text-lime-700'}`} />
                    <span className={`${darkMode ? 'text-lime-200' : 'text-lime-700'} font-medium`}>Register Farmer</span>
                  </button>
                  <button 
                    className={`flex items-center justify-center p-4 ${darkMode ? 'bg-blue-800 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'} rounded-lg transition-colors`}
                    style={{ borderRadius: '5px' }}
                    onClick={() => {
                      setShowCalendar(false)
                      handleTabSwitch('assistance')
                    }}
                  >
                    <ClipboardCheck size={20} className={`mr-2 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`} />
                    <span className={`${darkMode ? 'text-blue-200' : 'text-blue-700'} font-medium`}>Manage Assistance</span>
                  </button>
                  <button 
                    className={`flex items-center justify-center p-4 ${darkMode ? 'bg-purple-800 hover:bg-purple-700' : 'bg-purple-100 hover:bg-purple-200'} rounded-lg transition-colors`}
                    style={{ borderRadius: '5px' }}
                    onClick={() => {
                      setShowCalendar(false)
                      handleTabSwitch('crop-insurance')
                    }}
                  >
                    <Shield size={20} className={`mr-2 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`} />
                    <span className={`${darkMode ? 'text-purple-200' : 'text-purple-700'} font-medium`}>Crop Insurance</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
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
