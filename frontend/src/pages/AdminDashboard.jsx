"use client"

import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react"
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
  Moon,
  Monitor,
  Sun,
} from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useSocketQuery } from "../hooks/useSocketQuery"
import { getWeatherForMultipleLocations, getWeatherMarkerColor, getWeatherMarkerIcon, getFarmingRecommendation } from "../utils/weatherUtils"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
if (typeof window !== "undefined") window.L = L
// Use a relative path that matches your project structure
// If you're unsure about the exact path, you can use a placeholder or comment it out temporarily
// import adminLogoImage from "../assets/images/AgriLogo.png"
// Admin logo now imported in AdminSidebar component

// Import custom KPI block images (now used in DashboardKPIs component)
// Image imports (location, insurance, recent) now used in DashboardMapOverview and DashboardClaims components

// Import sidebar navigation icons (now used in AdminSidebar component)
// Tab panels lazy-loaded so first paint only loads home tab
const DistributionRecords = lazy(() => import("../components/DistributionRecords"))
const FarmerRegistration = lazy(() => import("../components/FarmerRegistration"))
const AdminSettings = lazy(() => import("../components/AdminSettings"))
const AdminProfile = lazy(() => import("../components/AdminProfile"))
const InsuranceClaims = lazy(() => import("../components/InsuranceClaims"))
import AdminModals from "../components/AdminModals"
const CropInsuranceManagement = lazy(() => import("../components/CropInsuranceManagement"))
const AdminUserCreation = lazy(() => import("../components/AdminUserCreation"))
import AdminClaimFilingEnhanced from "../components/AdminClaimFilingEnhanced"
import AdminAssistanceFiling from "../components/AdminAssistanceFiling"
import CropPriceManagement from "../components/CropPriceManagement"
import AdminNavbar from "../components/AdminNavbar"
import AdminSidebar from "../components/AdminSidebar"
import DashboardKPIs from "../components/DashboardKPIs"
import DashboardCharts from "../components/DashboardCharts"
import DashboardMapOverview from "../components/DashboardMapOverview"
import DashboardClaims from "../components/DashboardClaims"
import AnalyticsModal from "../components/AnalyticsModal"
import CalendarModal from "../components/CalendarModal"
// import MapModal from "../components/MapModal" // Map modal feature removed
import ViewAssistanceModal from "../components/ViewAssistanceModal"
import FarmerDetailsModal from "../components/FarmerDetailsModal"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"
import ClaimStatusConfirmationModal from "../components/ClaimStatusConfirmationModal"
import AssistanceFeedbackModal from "../components/AssistanceFeedbackModal"
import LoadingOverlay from "../components/LoadingOverlay"

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
  useDeleteFarmer,
  useCropPrices,
  useNotifications,
  useMarkNotificationsAsRead,
  useClearNotifications,
  useDeleteNotification
} from '../hooks/useAPI'

// Utility: Moving Average
// Utility: Find Peaks

const AdminDashboard = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const currentUsername = user?.name || user?.username || ""
  const currentAdminRole = user?.adminRole || "SuperAdmin"
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

  // Add noindex meta tag for SEO (protected page, shouldn't be indexed)
  useEffect(() => {
    // Create or update noindex meta tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');
    
    // Cleanup: restore original robots meta on unmount (optional)
    return () => {
      // Optionally restore to index, follow for other pages
      // For now, we'll leave it as is since this is a protected page
    };
  }, []);

  // Hide initial loading on next frame (React Query drives per-section loading)
  useEffect(() => {
    const rafId = requestAnimationFrame(() => setIsInitialLoading(false));
    return () => cancelAnimationFrame(rafId);
  }, []);

  // PCIC: only Claims tab — redirect to claims when on any other tab
  useEffect(() => {
    if (currentAdminRole === "PCIC" && activeTab !== "claims") {
      setActiveTab("claims");
    }
  }, [currentAdminRole, activeTab]);

  // Redirect restricted roles away from admin/distribution tabs (in case they navigate via URL or state)
  useEffect(() => {
    if (currentAdminRole === "OfficeHead" || currentAdminRole === "RSBSA") {
      if (activeTab === "admin") setActiveTab("home");
    }
    if (currentAdminRole === "RSBSA" && activeTab === "distribution") {
      setActiveTab("home");
    }
  }, [currentAdminRole, activeTab]);

  // Tab switch: brief loading state, clear on next frame (no 800ms delay)
  const handleTabSwitch = (newTab) => {
    if (newTab === activeTab) return;
    if (currentAdminRole === "PCIC" && newTab !== "claims") return;
    if ((currentAdminRole === "OfficeHead" || currentAdminRole === "RSBSA") && newTab === "admin") return;
    if (currentAdminRole === "RSBSA" && newTab === "distribution") return;
    setIsTabLoading(true);
    setActiveTab(newTab);
    setSidebarOpen(false);
    requestAnimationFrame(() => setIsTabLoading(false));
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
  
  // Notification hooks (API-based, polling every 7 seconds)
  const { data: apiNotifications = [], refetch: refetchNotifications } = useNotifications('admin', null)
  const markAsReadMutation = useMarkNotificationsAsRead()
  const clearNotificationsMutation = useClearNotifications()
  const deleteNotificationMutation = useDeleteNotification()
  
  // Helper function to check if a string is a valid MongoDB ObjectId
  const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    // MongoDB ObjectId is 24 hex characters
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Generate unique notification ID (must be declared before useCallback that uses it)
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to add local-only notification (for test/help buttons)
  const addLocalNotification = useCallback((notification) => {
    const notificationId = notification.id || generateUniqueId();
    setLocalNotifications(prev => [{
      ...notification,
      id: notificationId,
      timestamp: notification.timestamp || new Date(),
      read: false
    }, ...prev]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setLocalNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, 5000);
  }, []);
  
  // Helper function to remove local notification
  const removeLocalNotification = useCallback((id) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // Initialize Socket.IO for real-time updates (disabled for notifications - using polling instead)
  // eslint-disable-next-line no-unused-vars
  const { isConnected, socket } = useSocketQuery({
    enableClaimsListener: false, // Disabled - using polling instead
    enableApplicationsListener: false, // Disabled - using polling instead
  });

  // Manual refresh function for notifications (fetches from API)
  const refreshNotifications = useCallback(() => {
    refetchNotifications();
    refetchClaims();
    // Note: allApplications will auto-refresh via React Query
  }, [refetchNotifications, refetchClaims]);
  
  // React Query mutations
  const updateClaimMutation = useUpdateClaim()
  const updateApplicationMutation = useUpdateApplicationStatus()
  const createAssistanceMutation = useCreateAssistance()
  const deleteAssistanceMutation = useDeleteAssistance()
  // NOTE: registerFarmerMutation removed - farmer registration is handled by FarmerRegistration component
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationAction, setConfirmationAction] = useState({ type: "", claimId: "" })
  
  // Assistance application feedback modal states
  const [showAssistanceFeedbackModal, setShowAssistanceFeedbackModal] = useState(false)
  const [assistanceAction, setAssistanceAction] = useState({ type: "", applicationId: "" })
  const [assistanceFeedback, setAssistanceFeedback] = useState("")

  // State for claim details modal
  const [showClaimDetails, setShowClaimDetails] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)

  // Local-only notifications (for test/help buttons) - component state
  const [localNotifications, setLocalNotifications] = useState([]);
  
  // Get notifications from React Query (API) - single source of truth
  // Wrap in useMemo to prevent unnecessary re-renders in hooks that depend on it
  const apiNotificationsArray = useMemo(() => {
    return Array.isArray(apiNotifications) ? apiNotifications : [];
  }, [apiNotifications]);
  const adminNotifications = [...localNotifications, ...apiNotificationsArray];
  
  // Calculate unread count from API notifications only
  const unreadAdminCount = useMemo(() => {
    return apiNotificationsArray.filter(n => !n.read).length;
  }, [apiNotificationsArray]);

  // Form states
  // NOTE: showModal and showRegisterForm removed - farmer registration is handled by FarmerRegistration component's local state
  const [showEventModal, setShowEventModal] = useState(false)

  // Filter states
  const [claimsTabView, setClaimsTabView] = useState("pending") // For Insurance Claims tab view
  const [timePeriodFilter, setTimePeriodFilter] = useState('lastMonth') // For Claims Trend time period filter

  // Map states
  const [mapSearchQuery, setMapSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [mapMode, setMapMode] = useState("view") // view or add
  const [mapCenter, setMapCenter] = useState([7.591509, 125.696724]) // Kapalong Maniki coordinates
  const [mapZoom, setMapZoom] = useState(14) // Closer zoom for Kapalong Maniki area
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
  // NOTE: initialModalForm and modalForm removed - farmer registration is handled by FarmerRegistration component
  
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

  // Add these state variables for farmer actions
  const [showFarmerDetails, setShowFarmerDetails] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [farmerToDelete, setFarmerToDelete] = useState(null)

  // State for the registration form (shared with FarmerRegistration component for map location updates)
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

  // Function to add farmers to map
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
    console.log('🌍 Reverse geocoding coordinates:', lat, lng);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`, {
      headers: {
        'User-Agent': 'AGRI-CHAIN-App'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.display_name) {
          // Generate a lot number based on coordinates with better formatting
          const lotNumber = `LOT-${Math.abs(lat).toFixed(4)}-${Math.abs(lng).toFixed(4)}`.replace(/\./g, "")

          // Update the form data address and lot number fields
          setFormData((prev) => {
            const updated = {
              ...prev,
              address: data.display_name,
              lotNumber: lotNumber,
            };
            console.log('✅ Address updated in form:', data.display_name);
            return updated;
          })
        } else {
          // Fallback if no display_name
          const fallbackAddress = `Kapalong Maniki, ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setFormData((prev) => ({
            ...prev,
            address: fallbackAddress,
            lotNumber: `LOT-${Math.abs(lat).toFixed(4)}-${Math.abs(lng).toFixed(4)}`.replace(/\./g, "")
          }))
          console.log('⚠️ Using fallback address:', fallbackAddress);
        }
      })
      .catch((error) => {
        console.error("❌ Error reverse geocoding:", error)
        // Fallback address on error
        const fallbackAddress = `Kapalong Maniki, ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setFormData((prev) => ({
          ...prev,
          address: fallbackAddress,
          lotNumber: `LOT-${Math.abs(lat).toFixed(4)}-${Math.abs(lng).toFixed(4)}`.replace(/\./g, "")
        }))
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
    
  }, [farmers, insuranceByFarmer, cropFilter, monthFilter, yearFilter, claims, allApplications, showWeatherOverlay, weatherData])

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
      addLocalNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
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
      addLocalNotification({
        type: 'success',
        title: 'Assistance Added Successfully',
        message: `${assistanceData.assistanceType} has been added to the assistance inventory.`,
      });

      // Also notify admin about how many farmers were notified
      const matchingFarmers = farmers.filter(farmer => 
        farmer.cropType && 
        farmer.cropType.toLowerCase() === assistanceData.cropType.toLowerCase()
      );

      if (matchingFarmers.length > 0) {
        addLocalNotification({
          type: 'info',
          title: 'Farmers Notified',
          message: `${matchingFarmers.length} farmer(s) with ${assistanceData.cropType} crop type have been notified about the new assistance.`,
        });
      }
      // Note: Farmer notifications are now created by backend API automatically
    } catch (err) {
      console.error('Error adding assistance:', err)
      addLocalNotification({
        type: 'error',
        title: 'Add Assistance Failed',
        message: `Error: ${err.message}`,
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
      addLocalNotification({
        type: 'success',
        title: 'Application Distributed',
        message: 'Application has been marked as distributed successfully.',
      });
      // Note: React Query will automatically refresh data
    } catch (err) {
      console.error('Error handling distribution:', err);
      addLocalNotification({
        type: 'error',
        title: 'Distribution Failed',
        message: `Error: ${err.message}`,
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
        addLocalNotification({
          type: 'success',
          title: 'Assistance Deleted',
          message: `${itemName} has been deleted successfully.`,
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
      addLocalNotification({
        type: 'success',
        title: `Application ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`,
        message: `Application has been ${actionType} successfully.`,
      });

      // Note: Farmer notifications are now created by backend API automatically
        
        // Close modal and refresh
        setShowAssistanceFeedbackModal(false);
        setAssistanceFeedback("");
        // Note: React Query will automatically refresh data
      }
    } catch (error) {
      addLocalNotification({
        type: 'error',
        title: 'Action Failed',
        message: `Error: ${error.message}`,
      });
    }
  };

  // Add a new state variable for feedback
  const [feedbackText, setFeedbackText] = useState("")

  // Payment date state for claim approval
  const [paymentDate, setPaymentDate] = useState("")

  // Handle claim status updates with confirmation
  const initiateStatusUpdate = (claimId, newStatus, farmerId) => {
    setConfirmationAction({ type: newStatus, claimId, farmerId })
    setFeedbackText("") // Reset feedback text
    // Set default payment date to today if approving
    if (newStatus === "approved") {
      setPaymentDate(new Date().toISOString().split('T')[0])
    } else {
      setPaymentDate("")
    }
    setShowConfirmationModal(true)
  }

  const confirmStatusUpdate = async () => {
    const { type: actionType, claimId: actionClaimId } = confirmationAction;
    try {
      const updateData = {
          status: actionType,
          adminFeedback: feedbackText,
      };
      
      // Add payment date if approving
      if (actionType === 'approved' && paymentDate) {
        updateData.paymentDate = paymentDate;
        updateData.completionDate = new Date().toISOString();
      }
      
      await updateClaimMutation.mutateAsync({
        id: actionClaimId,
        updateData
      });
      
      setShowConfirmationModal(false);
      setFeedbackText("");
      setPaymentDate("");
      
      // Find the claim to get farmer details
      const claim = claims.find(c => c._id === actionClaimId || c.id === actionClaimId);
      
      // Show success notification to admin
      let adminMessage = `Claim has been ${actionType} successfully.`;
      if (actionType === 'approved' && claim && claim.compensation) {
        const paymentDateStr = paymentDate ? new Date(paymentDate).toLocaleDateString() : 'TBD';
        adminMessage = `Claim approved! Compensation: ₱${claim.compensation.toLocaleString()}. Payment date set: ${paymentDateStr}.`;
      }
      
      addLocalNotification({
        type: 'success',
        title: `Claim ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`,
        message: adminMessage,
      });

      // Note: Farmer notifications are now created by backend API automatically
    } catch (error) {
      addLocalNotification({
        type: 'error',
        title: 'Claim Update Failed',
        message: `Failed to update claim status: ${error.message}`,
      });
    }
  };

  // Function to open claim details modal
  const openClaimDetails = (claim) => {
    setSelectedClaim(claim)
    setShowClaimDetails(true)
    
    // Note: View notifications are not necessary - removed for simplicity
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

  // Check for payment dates that are due or today
  useEffect(() => {
    if (!claims || claims.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Get stored notification dates from localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('paymentDateNotifications') || '{}');
    
    claims.forEach(claim => {
      // Only check approved claims with payment dates
      if (claim.status === 'approved' && claim.paymentDate) {
        const claimId = claim._id || claim.id;
        const paymentDate = new Date(claim.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((paymentDate - today) / (1000 * 60 * 60 * 24));
        
        // Check if we've already notified for this claim on this date
        const notificationKey = `${claimId}-${todayStr}`;
        const alreadyNotified = storedNotifications[notificationKey];
        
        // Check if payment date is today or due (past due)
        if (daysDiff === 0 && !alreadyNotified) {
          // Payment date is today
          storedNotifications[notificationKey] = true;
          localStorage.setItem('paymentDateNotifications', JSON.stringify(storedNotifications));
          addLocalNotification({
            type: 'info',
            title: '💰 Payment Due Today',
            message: `Claim payment for ${claim.name || 'Farmer'} is due today. Please notify the farmer.`,
          });
        } else if (daysDiff < 0 && !alreadyNotified) {
          // Payment date has passed
          storedNotifications[notificationKey] = true;
          localStorage.setItem('paymentDateNotifications', JSON.stringify(storedNotifications));
          addLocalNotification({
            type: 'warning',
            title: '⚠️ Payment Overdue',
            message: `Claim payment for ${claim.name || 'Farmer'} was due ${Math.abs(daysDiff)} day(s) ago. Please notify the farmer immediately.`,
          });
        }
      }
    });
    
    // Clean up old notification entries (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    Object.keys(storedNotifications).forEach(key => {
      const keyDate = key.split('-').slice(1).join('-');
      if (keyDate < sevenDaysAgoStr) {
        delete storedNotifications[key];
      }
    });
    localStorage.setItem('paymentDateNotifications', JSON.stringify(storedNotifications));
  }, [claims, addLocalNotification]);

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
  const toggleNotificationPanel = useCallback(() => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      // Mark all unread API notifications as read
      const unreadNotificationIds = apiNotificationsArray
        .filter(n => !n.read)
        .map(n => n._id || n.id)
        .filter(Boolean);
      
      if (unreadNotificationIds.length > 0) {
        markAsReadMutation.mutate({
          recipientType: 'admin',
          recipientId: null,
          notificationIds: unreadNotificationIds
        });
      }
    }
  }, [notificationOpen, apiNotificationsArray, markAsReadMutation]);

  // Clear all notifications (API + local)
  const handleClearAllNotifications = async () => {
    try {
      // Clear API notifications
      await clearNotificationsMutation.mutateAsync({
        recipientType: 'admin',
        recipientId: null
      });
      // Clear local notifications
      setLocalNotifications([]);
      // Refetch to sync with API
      await refetchNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
      // Still clear local notifications even if API fails
      setLocalNotifications([]);
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

  // Helper function to fix Leaflet icon paths
  const fixLeafletIconPaths = () => {
    if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  };

  // Helper function to ensure container has dimensions (unused)
  const ENSURE_CONTAINER_DIMENSIONS = (container) => {
    if (!container) return false;
    
    const rect = container.getBoundingClientRect();
    
    // If height is 0 but width is available, try to set height
    if (rect.height === 0 && rect.width > 0) {
      const parent = container.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        if (parentRect.height > 0) {
          container.style.height = `${parentRect.height}px`;
          return true;
        }
      }
      // Fallback to viewport calculation
      const viewportHeight = window.innerHeight;
      container.style.height = `${Math.max(600, viewportHeight - 300)}px`;
      return true;
    }
    
    return rect.width > 0 && rect.height > 0;
  };

  // Helper function to style container for map (may be unused)
  const STYLE_MAP_CONTAINER = (container) => {
    if (!container) return;
    
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.right = '0';
    container.style.bottom = '0';
    container.style.zIndex = '10';
    container.style.width = '100%';
    container.style.height = '100%';
    
    // Ensure parent has dimensions
    const parent = container.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      if (parentRect.height === 0) {
        const viewportHeight = window.innerHeight;
        parent.style.height = `${Math.max(600, viewportHeight - 300)}px`;
      }
    }
  };

  // Helper function to create farm marker icon
  const createFarmIcon = () => {
    return L.divIcon({
      className: 'farm-marker-icon',
      html: `
        <div style="
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        ">
          <div style="
            background-color: #84cc16;
            width: 50px;
            height: 50px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 5px solid #000000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(132, 204, 22, 0.8);
            position: relative;
            z-index: 1;
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            font-size: 24px;
            line-height: 1;
            z-index: 10;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            pointer-events: none;
          ">🌾</div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 8px;
            height: 8px;
            background-color: #000000;
            border-radius: 50%;
            z-index: 11;
            pointer-events: none;
          "></div>
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50],
    });
  };

  // Helper function to setup map click handler
  const setupMapClickHandler = (map) => {
    map.on("click", (e) => {
      if (mapMode === "add") {
        setSelectedLocation({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });

        // Don't clear all markers - just add selection marker
        // Add new marker with farm icon
        const farmIcon = createFarmIcon();
        const marker = L.marker([e.latlng.lat, e.latlng.lng], {
          icon: farmIcon,
          zIndexOffset: 1000,
        }).addTo(markersLayerRef.current);

        marker.bringToFront();
        reverseGeocode(e.latlng.lat, e.latlng.lng);
        
        // Also add to overview map if it exists
        if (overviewMarkersLayerRef.current && overviewMarkersLayerRef.current !== markersLayerRef.current) {
          const overviewMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: farmIcon,
            zIndexOffset: 1000,
          }).addTo(overviewMarkersLayerRef.current);
          overviewMarker.bringToFront();
        }
      }
    });
  };

  // Helper function to force map resize
  const forceMapResize = (map, delay = 100) => {
    setTimeout(() => {
      if (map) {
        map.invalidateSize(true);
        window.dispatchEvent(new Event('resize'));
      }
    }, delay);
  };

  // Main map initialization function - Uses overview map instance (unused)
  const INITIALIZE_LOCATION_MAP = (container) => {
    if (!container || !mapRef.current) {
      console.error('❌ Container or mapRef.current is null');
      return;
    }

    // Check if Leaflet is available
    if (typeof window === 'undefined' || !window.L || typeof L === 'undefined') {
      console.error('❌ Leaflet (L) is not available');
      return;
    }

    // Fix icon paths
    fixLeafletIconPaths();

    // Kapalong Maniki coordinates
    const kapalongManikiCenter = [7.591509, 125.696724];

    // If map doesn't exist, create it
    // Note: We create a separate map instance for the modal (Leaflet maps are bound to specific containers)
    // But we sync it with the overview map's view and markers
    if (!leafletMapRef.current) {
      try {
        // Style container
        STYLE_MAP_CONTAINER(container);

        // Create map instance - sync with overview map view and data
        // Get initial center and zoom from overview map if it exists
        const initialCenter = overviewLeafletMapRef.current 
          ? overviewLeafletMapRef.current.getCenter() 
          : kapalongManikiCenter;
        const initialZoom = overviewLeafletMapRef.current 
          ? overviewLeafletMapRef.current.getZoom() 
          : 14;
        
        leafletMapRef.current = L.map(container, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: true,
          scrollWheelZoom: true,
          minZoom: 11,
          maxZoom: 18,
          preferCanvas: false,
        });

        console.log('✅ Leaflet map instance created for modal - synced with overview map view');

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(leafletMapRef.current);

        // Create markers layer
        markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
        
        // Copy markers from overview map if it exists
        if (overviewMarkersLayerRef.current) {
          console.log('✅ Copying markers from overview map to modal');
          overviewMarkersLayerRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              const latlng = layer.getLatLng();
              const options = { ...layer.options };
              const newMarker = L.marker(latlng, options);
              if (layer.getPopup()) {
                newMarker.bindPopup(layer.getPopup().getContent());
              }
              newMarker.addTo(markersLayerRef.current);
            }
          });
          console.log('✅ Modal map initialized with overview map markers');
        }

        // Setup click handler
        setupMapClickHandler(leafletMapRef.current);

        console.log('✅ Map initialized successfully');

        // Dispatch ready event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('leafletMapReady', {
            detail: { mapInstance: leafletMapRef.current }
          }));
        }, 100);

        // Set view and force resize - ensure map is visible
        setTimeout(() => {
          if (leafletMapRef.current && container) {
            const finalRect = container.getBoundingClientRect();
            
            // Ensure container is visible
            container.style.opacity = '1';
            container.style.visibility = 'visible';
            container.style.display = 'block';
            
            if (finalRect.height > 0 && finalRect.width > 0) {
              // Set view first
              leafletMapRef.current.setView(kapalongManikiCenter, 14, { animate: false });
              
              // Force immediate resize
              leafletMapRef.current.invalidateSize(true);
              
              // Multiple resize attempts with delays
              forceMapResize(leafletMapRef.current, 150);
              forceMapResize(leafletMapRef.current, 350);
              forceMapResize(leafletMapRef.current, 550);
              
              // Final check and log
              setTimeout(() => {
                if (leafletMapRef.current && container) {
                  leafletMapRef.current.invalidateSize(true);
                  const mapBounds = leafletMapRef.current.getBounds();
                  const mapCenter = leafletMapRef.current.getCenter();
                  console.log('✅ Map fully initialized and visible');
                  console.log('📍 Map bounds:', mapBounds);
                  console.log('📍 Map center:', mapCenter);
                  console.log('📍 Container dimensions:', finalRect.width, 'x', finalRect.height);
                  
                  // Ensure map container is visible
                  container.style.opacity = '1';
                  container.style.visibility = 'visible';
                  
                  // Force another resize to ensure tiles are visible
                  setTimeout(() => {
                    if (leafletMapRef.current) {
                      leafletMapRef.current.invalidateSize(true);
                      window.dispatchEvent(new Event('resize'));
                    }
                  }, 200);
                }
              }, 800);
            } else {
              // Force height and retry
              console.warn('⚠️ Container has no dimensions, forcing height...');
              container.style.height = `${Math.max(600, window.innerHeight - 300)}px`;
              setTimeout(() => {
                if (leafletMapRef.current) {
                  leafletMapRef.current.invalidateSize(true);
                  leafletMapRef.current.setView(kapalongManikiCenter, 14, { animate: false });
                  container.style.opacity = '1';
                  container.style.visibility = 'visible';
                }
              }, 200);
            }
          }
        }, 300);
      } catch (error) {
        console.error('❌ Error initializing map:', error);
        console.error('Error details:', error.stack);
      }
    } else {
      // Update existing modal map - sync with overview map
      console.log('🔄 Updating existing modal map - syncing with overview map');
      
      if (leafletMapRef.current && container) {
        // Sync view with overview map if it exists
        if (overviewLeafletMapRef.current) {
          const overviewCenter = overviewLeafletMapRef.current.getCenter();
          const overviewZoom = overviewLeafletMapRef.current.getZoom();
          leafletMapRef.current.setView(overviewCenter, overviewZoom, { animate: false });
          console.log('✅ Modal map synced with overview map view:', overviewCenter, 'zoom:', overviewZoom);
          
          // Sync markers from overview map
          if (overviewMarkersLayerRef.current && markersLayerRef.current) {
            // Clear modal markers and copy from overview
            markersLayerRef.current.clearLayers();
            overviewMarkersLayerRef.current.eachLayer((layer) => {
              if (layer instanceof L.Marker) {
                const latlng = layer.getLatLng();
                const options = { ...layer.options };
                const newMarker = L.marker(latlng, options);
                if (layer.getPopup()) {
                  newMarker.bindPopup(layer.getPopup().getContent());
                }
                newMarker.addTo(markersLayerRef.current);
              }
            });
            console.log('✅ Modal map markers synced with overview map');
          }
        } else {
          // Set view to Kapalong Maniki if no overview map
          leafletMapRef.current.setView(kapalongManikiCenter, 14, { animate: false });
        }
        
        // Wait for modal to be fully visible before resizing
        setTimeout(() => {
          if (leafletMapRef.current && container) {
            // Ensure container is visible
            container.style.opacity = '1';
            container.style.visibility = 'visible';
            container.style.display = 'block';
            
            // Force immediate resize
            leafletMapRef.current.invalidateSize(true);
            
            // Multiple resize attempts with delays to ensure tiles load
            setTimeout(() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.invalidateSize(true);
                window.dispatchEvent(new Event('resize'));
                console.log('✅ Modal map resized after modal open');
              }
            }, 400);
            
            setTimeout(() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.invalidateSize(true);
                console.log('✅ Second modal map resize after modal open');
              }
            }, 600);
            
            setTimeout(() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.invalidateSize(true);
                window.dispatchEvent(new Event('resize'));
                console.log('✅ Final modal map resize - tiles should be visible now');
              }
            }, 800);
          }
        }, 300); // Wait for modal animation to complete
      }
    }

    // Add existing farmers to map (view mode)
    if (mapMode === "view") {
      addFarmersToMap();
    }
  };

  // Map modal feature removed - initialization disabled
  // useEffect(() => {
  //   if (showMapModal && mapMode === "add") {
  //     console.log('🗺️ Map modal opened, starting initialization...');
  //     // ... all map modal initialization code removed
  //   }
  // }, [showMapModal, mapMode, farmers, reverseGeocode, addFarmersToMap])

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
      overviewLeafletMapRef.current = L.map(overviewMapRef.current).setView(mapCenter, 12)
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

  // Function to search for a location on the map
  const searchLocation = () => {
    if (!mapSearchQuery || !mapSearchQuery.trim()) {
      alert("Please enter a location to search.");
      return;
    }

    // Check if map is available - prefer overview map, fallback to modal map
    const mapInstance = overviewLeafletMapRef.current || leafletMapRef.current;
    const markersInstance = overviewMarkersLayerRef.current || markersLayerRef.current;
    
    if (!mapInstance) {
      console.error("❌ Map is not initialized yet");
      alert("Map is still loading. Please wait a moment and try again.");
      return;
    }

    // Sync references
    leafletMapRef.current = mapInstance;
    markersLayerRef.current = markersInstance;

    // Use Nominatim API for geocoding with proper headers
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery.trim())}&limit=1&addressdetails=1`, {
      headers: {
        'User-Agent': 'AGRI-CHAIN-App/1.0'
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);

          if (isNaN(lat) || isNaN(lon)) {
            throw new Error("Invalid coordinates received");
          }

          console.log('📍 Search result:', { lat, lon, display_name: result.display_name });

          // Use the same map instance for both overview and modal
          if (mapInstance) {
            // Set view to searched location on both maps
            mapInstance.setView([lat, lon], 13, { animate: true });
            
            // Also update overview map if it's separate
            if (overviewLeafletMapRef.current && overviewLeafletMapRef.current !== mapInstance) {
              overviewLeafletMapRef.current.setView([lat, lon], 13, { animate: true });
            }

            if (mapMode === "add") {
              setSelectedLocation({ lat, lng: lon });

              // Don't clear all markers - just add selection marker
              // Add a new marker at the searched location with farm icon
              const farmIcon = createFarmIcon();
              const marker = L.marker([lat, lon], {
                icon: farmIcon,
                zIndexOffset: 1000,
              }).addTo(markersInstance);

              marker.bringToFront();

              // Reverse geocode to get address and update form
              reverseGeocode(lat, lon);

              // Force map resize after search
              setTimeout(() => {
                if (mapInstance) {
                  mapInstance.invalidateSize(true);
                }
                if (overviewLeafletMapRef.current && overviewLeafletMapRef.current !== mapInstance) {
                  overviewLeafletMapRef.current.invalidateSize(true);
                }
              }, 300);
            }
          } else {
            throw new Error("Map instance not available");
          }
        } else {
          alert("Location not found. Please try a different search term.");
        }
      })
      .catch((error) => {
        console.error("❌ Error searching for location:", error);
        alert(`Error searching for location: ${error.message}. Please try again.`);
      });
  }

  // 1. Add state for feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'approve' | 'reject', request }

  // Add at the top of the component, after useState, useEffect, etc.
  const LOW_STOCK_THRESHOLD = 5;

  // Add KPI calculations for dashboard tab:

  // Note: Filter-related code removed as it was unused

  // Chart data preparation removed as charts now use static data or direct calculations

  // Note: Low stock notifications - could be added as local notifications if needed
  // For now, removed to simplify - can be re-added as local notifications later
  useEffect(() => {
    if (lowStockItems.length > 0) {
      // Could add local notification here if needed
      // addLocalNotification({ type: 'warning', title: 'Low Stock Alert', message: ... });
    }
  }, [lowStockItems]);



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
      <AdminNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarExpanded={sidebarExpanded}
        isRefreshing={isRefreshing}
        setIsRefreshing={setIsRefreshing}
        loadClaims={loadClaims}
        lastRefreshTime={lastRefreshTime}
        isConnected={isConnected}
        notificationOpen={notificationOpen}
        toggleNotificationPanel={toggleNotificationPanel}
        unreadAdminCount={unreadAdminCount}
        adminNotifications={adminNotifications}
        refreshNotifications={refreshNotifications}
        handleClearAllNotifications={handleClearAllNotifications}
        isValidObjectId={isValidObjectId}
        removeLocalNotification={removeLocalNotification}
        deleteNotificationMutation={deleteNotificationMutation}
        refetchNotifications={refetchNotifications}
        getNotificationIcon={getNotificationIcon}
        formatTimestamp={formatTimestamp}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        setActiveTab={setActiveTab}
        addLocalNotification={addLocalNotification}
        setShowCalendar={setShowCalendar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        handleLogout={handleLogout}
        currentUsername={currentUsername}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          activeTab={activeTab}
          handleTabSwitch={handleTabSwitch}
          setActiveTab={setActiveTab}
          showMapModal={showMapModal}
          setShowMapModal={setShowMapModal}
          setMapMode={setMapMode}
          currentAdminRole={currentAdminRole}
        />

        {/* Main Content */}
        <main className={`flex-1 p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-all duration-300 ease-in-out ${sidebarExpanded ? 'md:ml-64' : 'md:ml-16'}`}>
          <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin rounded-full h-10 w-10 border-2 border-lime-500 border-t-transparent" /></div>}>
          {activeTab === "home" && (
            <>
              {/* --- Analytics Filters --- */}
              {/* Remove the old analyticsFilters and setAnalyticsFilters dropdowns and reset button in the analytics section. */}
              {/* Only use the new floating filter drawer and its state for filtering and displaying analytics. */}

              {/* Dashboard KPIs */}
              <DashboardKPIs
                darkMode={darkMode}
                totalFarmers={totalFarmers}
                activeFarmersData={activeFarmersData}
                pendingClaims={pendingClaims}
                claims={claims}
                allApplications={allApplications}
              />

              {/* Chart Visualizations Section */}
              <DashboardCharts
                timePeriodFilter={timePeriodFilter}
                setTimePeriodFilter={setTimePeriodFilter}
                claimsTrendData={claimsTrendData}
                allApplications={allApplications}
                cropPrices={cropPrices}
                cropPricesLoading={cropPricesLoading}
                setShowCropPriceManagement={setShowCropPriceManagement}
              />

              {/* Divider between Chart Visualizations and Map Visualization */}
              <div className="mt-8 mb-6">
                <hr className="border-gray-200" />
              </div>

              {/* Overview: Farmers Map (embedded) - Minimalist Blockchain Style */}
              <DashboardMapOverview
                weatherLoading={weatherLoading}
                showWeatherOverlay={showWeatherOverlay}
                setShowWeatherOverlay={setShowWeatherOverlay}
                setWeatherLoading={setWeatherLoading}
                farmers={farmers}
                getWeatherForMultipleLocations={getWeatherForMultipleLocations}
                setWeatherData={setWeatherData}
                weatherFetchedRef={weatherFetchedRef}
                fitMapToFarmers={fitMapToFarmers}
                cropFilter={cropFilter}
                setCropFilter={setCropFilter}
                availableCrops={availableCrops}
                monthFilter={monthFilter}
                setMonthFilter={setMonthFilter}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                overviewMapRef={overviewMapRef}
              />

              {/* Pending and Recent Insurance Claims Sections */}
              <DashboardClaims claims={claims} />
            </>
          )}

          {activeTab === "claims" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Cash Assistance Claims</h2>
                {currentAdminRole !== "OfficeHead" && currentAdminRole !== "RSBSA" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setClaimsTabView("pending")}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      claimsTabView === "pending"
                        ? "bg-lime-400 text-black"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Pending Cash Assistance Claims
                  </button>
                  <button
                    onClick={() => setClaimsTabView("all")}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      claimsTabView === "all"
                        ? "bg-lime-200 text-black"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Claims
                  </button>
                </div>
                )}
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
                  viewOnlyClaims={currentAdminRole === "OfficeHead"}
                  rsbsaClaimsMode={currentAdminRole === "RSBSA"}
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
              onTabSwitch={handleTabSwitch}
              setMapSearchQuery={setMapSearchQuery}
              searchLocation={searchLocation}
              addFarmersToMap={addFarmersToMap}
              formData={formData}
              setFormData={setFormData}
              reverseGeocode={reverseGeocode}
              viewOnlyFarmList={currentAdminRole === "OfficeHead"}
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
            <div className="p-6 bg-white min-h-screen">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Assistance Inventory</h2>
                {currentAdminRole !== "OfficeHead" && (
                <button
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center gap-2 bg-lime-400 text-black px-4 py-2 rounded-lg hover:bg-lime-500 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                >
                  <span className="text-xl font-bold">+</span>
                  <span className="font-semibold">Add New Assistance</span>
                </button>
                )}
              </div>

              {/* Loading State */}
              {assistanceLoading && (
                <div className="text-center py-8">
                  <p className="text-black">Loading assistance inventory...</p>
                </div>
              )}

              {/* Error State */}
              {assistanceError && (
                <div className="bg-white shadow-sm text-red-700 px-4 py-3 rounded mb-4">
                  <p className="text-black">Error: {assistanceError}</p>
                </div>
              )}

              {/* Assistance Inventory List */}
              {!assistanceLoading && !assistanceError && (
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="relative group rounded-lg shadow-md bg-white hover:shadow-lg transition-all duration-300 flex flex-row min-h-[300px] m-2 overflow-hidden"
                      >
                        {/* KPI Ribbon */}
                        <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-lg text-xs font-bold tracking-wider z-10 bg-lime-400 text-black shadow-sm">
                          {item.assistanceType}
                        </div>
                        
                        {/* Left Section - Text Content */}
                        <div className="flex-1 flex flex-col p-6">
                          <div className="flex items-center gap-2 mb-3 mt-4">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ${
                              (item.availableQuantity || 0) < 5
                                ? 'bg-red-100 text-red-700'
                                : 'bg-lime-200 text-black'
                            }`}>
                              {(item.availableQuantity || 0) < 5 ? 'Low Stock' : 'Available'}
                            </span>
                            {item.requiresRSBSA && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-lime-200 text-black shadow-sm">
                                RSBSA Required
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm text-black flex-1">
                            <div className="flex flex-wrap gap-2">
                              <span className="font-semibold">Crop:</span>
                              <span>{item.cropType}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="font-semibold">Founder:</span>
                              <span>{item.founderName}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="font-semibold">Available:</span>
                              <span>{item.availableQuantity || 0}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="font-semibold">Max/Farmer:</span>
                              <span>{item.maxQuantityPerFarmer || 100}kg</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="font-semibold">Date Added:</span>
                              <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {/* Actions - OfficeHead: view only (View button only) */}
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleViewAssistance(item)}
                              className="flex-1 bg-lime-400 text-black px-3 py-2 rounded-lg font-semibold shadow-sm hover:bg-lime-500 transition"
                            >
                              View
                            </button>
                            {currentAdminRole !== "OfficeHead" && (
                            <>
                            <button
                              onClick={() => handleEditEvent(index)}
                              className="flex-1 bg-lime-400 text-black px-3 py-2 rounded-lg font-semibold shadow-sm hover:bg-lime-500 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(index)}
                              className="flex-1 bg-lime-400 text-black px-3 py-2 rounded-lg font-semibold shadow-sm hover:bg-lime-500 transition"
                            >
                              Delete
                            </button>
                            </>
                            )}
                          </div>
                        </div>
                        
                        {/* Right Section - Image */}
                        {item.photo && (
                          <div className="w-40 flex items-center justify-center bg-white p-4">
                            <img src={item.photo} alt="Assistance Logo" className="object-contain max-h-full max-w-full" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-black">
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
                      className={`px-3 py-1 rounded-md border-2 border-black font-semibold ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-lime-400 text-black hover:bg-lime-500"
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded-md border-2 border-black font-semibold ${
                          currentPage === index + 1
                            ? "bg-black text-lime-400"
                            : "bg-lime-400 text-black hover:bg-lime-500"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md border-2 border-black font-semibold ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-lime-400 text-black hover:bg-lime-500"
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
                  <h3 className="text-xl font-semibold text-black">Assistance Applications</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Status Filter */}
                    <select 
                      value={applicationStatusFilter}
                      onChange={(e) => {
                        setApplicationStatusFilter(e.target.value);
                        setCurrentApplicationPage(1);
                      }}
                      className="px-3 py-2 border-2 border-black rounded-md text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-lime-400 font-semibold"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="distributed">Distributed</option>
                    </select>
                    
                    {/* Search by Application ID or Farmer Name */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search ID or farmer name..."
                        value={applicationSearchTerm}
                        onChange={(e) => {
                          setApplicationSearchTerm(e.target.value);
                          setCurrentApplicationPage(1);
                        }}
                        className="pl-10 pr-4 py-2 border-2 border-black rounded-md text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-lime-400 w-64 font-semibold"
                      />
                    </div>
                    
                    {/* Refresh Button */}
                    <button
                      onClick={() => {
                        console.log('Refreshing applications...');
                        // TODO: Add refetch for allApplications when available
                        console.log('React Query will automatically refresh data');
                      }}
                      className="px-4 py-2 bg-lime-400 text-black rounded-md hover:bg-lime-500 transition text-sm font-semibold flex items-center gap-2 border-2 border-black"
                    >
                      <Activity className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border-2 border-black shadow-lg">
                  {filteredApplications.length > 0 ? (
                    <>
                      <div className="p-4 border-b-2 border-black text-sm text-black bg-white rounded-t-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">
                            Showing {((currentApplicationPage - 1) * applicationsPerPage) + 1} to {Math.min(currentApplicationPage * applicationsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
                            {applicationStatusFilter && ` (filtered by: ${applicationStatusFilter})`}
                            {applicationSearchTerm && ` (search: "${applicationSearchTerm}")`}
                          </span>
                          <span className="text-xs text-black font-medium">
                            Total in database: {allApplications.length}
                          </span>
                        </div>
                      </div>
                      <div 
                        className="overflow-x-auto scrollbar-hide" 
                        style={{ 
                          maxHeight: '450px', 
                          overflowY: 'auto'
                        }}
                      >
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-white sticky top-0 z-10 border-b-2 border-black">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-gray-300">Application ID</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-gray-300">Farmer Name</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-gray-300">Assistance Type</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-gray-300">Quantity Requested</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-gray-300">Quarter</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-gray-300">Date Applied</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-gray-300">Status</th>
                              {currentAdminRole !== "OfficeHead" && <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th>}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedApplications.map((application) => (
                              <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-black">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {application._id.slice(-6).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-xs text-black mt-1 truncate max-w-[120px]" title={application._id}>
                                    {application._id}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="font-medium text-black">
                                    {application.farmerId ? `${application.farmerId.firstName} ${application.farmerId.lastName}` : 'N/A'}
                                  </div>
                                  {application.farmerId?.cropType && (
                                    <div className="text-xs text-black mt-1">
                                      Primary crop: {application.farmerId.cropType}
                                    </div>
                                  )}
                                  {application.farmerId?.rsbsaRegistered && (
                                    <div className="text-xs text-lime-600 mt-1 font-semibold">✓ RSBSA Registered</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="font-medium text-black">
                                    {application.assistanceId?.assistanceType || 'N/A'}
                                  </div>
                                  {application.assistanceId?.cropType && (
                                    <div className="text-xs text-black mt-1">
                                      For: {application.assistanceId.cropType} farmers
                                    </div>
                                  )}
                                  {application.assistanceId?.founderName && (
                                    <div className="text-xs text-black mt-1">
                                      By: {application.assistanceId.founderName}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                  <div className="font-medium">{application.requestedQuantity}kg</div>
                                  {application.assistanceId?.maxQuantityPerFarmer && (
                                    <div className="text-xs text-black mt-1">
                                      Max allowed: {application.assistanceId.maxQuantityPerFarmer}kg
                                    </div>
                                  )}
                                  {application.assistanceId?.availableQuantity !== undefined && (
                                    <div className="text-xs text-black mt-1">
                                      Available: {application.assistanceId.availableQuantity}kg
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-lime-200 text-black border-2 border-black">
                                    {application.quarter}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                  <div>{new Date(application.applicationDate).toLocaleDateString()}</div>
                                  <div className="text-xs text-black mt-1 opacity-70">
                                    {new Date(application.applicationDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border-2 border-black ${
                                    application.status === "approved"
                                      ? "bg-lime-200 text-black"
                                      : application.status === "rejected"
                                      ? "bg-red-100 text-black"
                                      : application.status === "distributed"
                                      ? "bg-lime-300 text-black"
                                      : "bg-yellow-100 text-black"
                                  }`}>
                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                  </span>
                                  {application.reviewDate && (
                                    <div className="text-xs text-black mt-1 opacity-70">
                                      Reviewed: {new Date(application.reviewDate).toLocaleDateString()}
                                    </div>
                                  )}
                                  {application.distributionDate && (
                                    <div className="text-xs text-black mt-1 opacity-70">
                                      Distributed: {new Date(application.distributionDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </td>
                                {currentAdminRole !== "OfficeHead" && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {application.status === 'pending' && (
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleApproveApplication(application._id)}
                                        className="bg-lime-400 text-black hover:bg-lime-500 font-semibold px-3 py-1 rounded border-2 border-black transition text-xs"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleRejectApplication(application._id)}
                                        className="bg-lime-400 text-black hover:bg-lime-500 font-semibold px-3 py-1 rounded border-2 border-black transition text-xs"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {application.status === 'approved' && (
                                    <button 
                                      onClick={() => handleDistributeApplication(application._id)}
                                      className="bg-lime-400 text-black hover:bg-lime-500 font-semibold px-3 py-1 rounded border-2 border-black transition text-xs"
                                    >
                                      Mark Distributed
                                    </button>
                                  )}
                                  {(application.status === 'rejected' || application.status === 'distributed') && (
                                    <span className="text-black text-xs">No actions available</span>
                                  )}
                                  {application.officerNotes && (
                                    <div className="text-xs text-black mt-2 italic" title={application.officerNotes}>
                                      Note: {application.officerNotes.length > 20 ? application.officerNotes.substring(0, 20) + '...' : application.officerNotes}
                                    </div>
                                  )}
                                </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination for Applications */}
                      {applicationPages > 1 && (
                        <div className="flex justify-between items-center p-4 border-t-2 border-black bg-white rounded-b-lg">
                          <div className="text-sm text-black font-semibold">
                            Page {currentApplicationPage} of {applicationPages}
                          </div>
                          <nav className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentApplicationPage(1)}
                              disabled={currentApplicationPage === 1}
                              className={`px-3 py-1 rounded-md text-sm border-2 border-black font-semibold ${
                                currentApplicationPage === 1
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-lime-400 text-black hover:bg-lime-500"
                              }`}
                            >
                              First
                            </button>
                            <button
                              onClick={() => setCurrentApplicationPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentApplicationPage === 1}
                              className={`px-3 py-1 rounded-md text-sm border-2 border-black font-semibold ${
                                currentApplicationPage === 1
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-lime-400 text-black hover:bg-lime-500"
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
                                    className={`px-3 py-1 rounded-md text-sm border-2 border-black font-semibold ${
                                      currentApplicationPage === pageNumber
                                        ? "bg-black text-lime-400"
                                        : "bg-lime-400 text-black hover:bg-lime-500"
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
                              className={`px-3 py-1 rounded-md text-sm border-2 border-black font-semibold ${
                                currentApplicationPage === applicationPages
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-lime-400 text-black hover:bg-lime-500"
                              }`}
                            >
                              Next
                            </button>
                            <button
                              onClick={() => setCurrentApplicationPage(applicationPages)}
                              disabled={currentApplicationPage === applicationPages}
                              className={`px-3 py-1 rounded-md text-sm border-2 border-black font-semibold ${
                                currentApplicationPage === applicationPages
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-lime-400 text-black hover:bg-lime-500"
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
                      <div className="text-center py-8 text-black">
                        {allApplications.length === 0 ? (
                          <>
                            <ClipboardCheck className="h-16 w-16 text-black mx-auto mb-4" />
                            <p className="text-lg font-semibold text-black">No assistance applications found</p>
                            <p className="text-sm mt-2 text-black">Applications from farmers will appear here once they apply for assistance.</p>
                          </>
                        ) : (
                          <>
                            <Search className="h-16 w-16 text-black mx-auto mb-4" />
                            <p className="text-lg font-semibold text-black">No applications match your filters</p>
                            <p className="text-sm mt-2 text-black">Try adjusting your search criteria or clearing filters.</p>
                            <button
                              onClick={() => {
                                setApplicationStatusFilter('');
                                setApplicationSearchTerm('');
                                setCurrentApplicationPage(1);
                              }}
                              className="mt-4 px-4 py-2 bg-lime-400 text-black rounded-md hover:bg-lime-500 transition text-sm font-semibold border-2 border-black"
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
          <ViewAssistanceModal
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            assistance={selectedAssistance}
          />

          {activeTab === "admin" && (
            <div className="p-6">
              <AdminUserCreation />
            </div>
          )}

          {activeTab === "crop-insurance" && (
            <div className="p-6">
              <CropInsuranceManagement />
            </div>
          )}

          {activeTab === "admin-filing" && (
            <div className="p-6 bg-white min-h-screen">
              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center relative">
                  <h1 className="text-4xl font-bold text-black mb-3 relative">
                    <span className="text-black">⛓️ BLOCKCHAIN</span> FILE SYSTEM
                  </h1>
                  <p className="text-black relative max-w-2xl mx-auto">
                    Secure, transparent, and immutable filing system powered by blockchain technology.
                    Help farmers file claims and assistance applications with complete data integrity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Claim Card */}
                  <div className="bg-white rounded-lg border-2 border-black p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-black"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-black"></div>
                    
                    <div className="flex items-center mb-6 relative z-10">
                      <div className="p-4 bg-lime-400 rounded-lg mr-4 border-2 border-black">
                        <FileText className="h-8 w-8 text-black" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-black mb-1">FILE INSURANCE CLAIM</h2>
                        <p className="text-black text-sm flex items-center">
                          <span className="w-2 h-2 bg-lime-400 rounded-full mr-2 border border-black"></span>
                          Blockchain-Verified Claims
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative z-10 mb-6 space-y-3">
                      <p className="text-black text-sm">
                        🔗 Submit insurance claims with blockchain verification
                      </p>
                      <p className="text-black text-xs">
                        ✓ Immutable records • Instant verification • Transparent tracking
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowAdminClaimFiling(true)}
                      className="w-full bg-lime-400 text-black py-3 px-4 rounded-lg hover:bg-lime-500 transition-all duration-300 flex items-center justify-center space-x-2 font-bold relative z-10 border-2 border-black"
                    >
                      <FileText className="h-5 w-5" />
                      <span>INITIATE CLAIM FILING</span>
                    </button>
                  </div>

                  {/* File Assistance Card */}
                  <div className="bg-white rounded-lg border-2 border-black p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-black"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-black"></div>
                    
                    <div className="flex items-center mb-6 relative z-10">
                      <div className="p-4 bg-lime-400 rounded-lg mr-4 border-2 border-black">
                        <HandHeart className="h-8 w-8 text-black" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-black mb-1">FILE ASSISTANCE APP</h2>
                        <p className="text-black text-sm flex items-center">
                          <span className="w-2 h-2 bg-lime-400 rounded-full mr-2 border border-black"></span>
                          Smart Contract Enabled
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative z-10 mb-6 space-y-3">
                      <p className="text-black text-sm">
                        🔗 Process assistance applications via blockchain
                      </p>
                      <p className="text-black text-xs">
                        ✓ Automated eligibility • Secure distribution • Real-time updates
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowAdminAssistanceFiling(true)}
                      className="w-full bg-lime-400 text-black py-3 px-4 rounded-lg hover:bg-lime-500 transition-all duration-300 flex items-center justify-center space-x-2 font-bold relative z-10 border-2 border-black"
                    >
                      <HandHeart className="h-5 w-5" />
                      <span>INITIATE ASSISTANCE FILING</span>
                    </button>
                  </div>
                </div>

                {/* Blockchain Instructions Panel */}
                <div className="mt-8 bg-white border-2 border-black rounded-lg p-6 relative overflow-hidden">
                  <div className="flex items-center mb-4 relative z-10">
                    <div className="w-1 h-8 bg-lime-400 mr-3 border border-black"></div>
                    <h3 className="text-xl font-bold text-black">SYSTEM PROTOCOL FOR DA STAFF</h3>
                  </div>
                  
                  <div className="space-y-3 text-black relative z-10">
                    <div className="flex items-start space-x-3 p-3 bg-white rounded border-2 border-black">
                      <span className="text-lime-400 font-bold">►</span>
                      <p><span className="text-black font-semibold">CLAIMS PROTOCOL:</span> Select farmer from database → Fill damage assessment form → Submit to blockchain → Generate verification hash → Farmer signature required</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white rounded border-2 border-black">
                      <span className="text-lime-400 font-bold">►</span>
                      <p><span className="text-black font-semibold">ASSISTANCE PROTOCOL:</span> Verify eligibility via smart contract → Select program → Submit application → Automated approval process → Track on blockchain ledger</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white rounded border-2 border-black">
                      <span className="text-lime-400 font-bold">►</span>
                      <p><span className="text-black font-semibold">SECURITY:</span> All records are encrypted and stored on distributed ledger → Verify farmer identity → Collect digital/physical signatures → Maintain audit trail</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white rounded border-2 border-black">
                      <span className="text-lime-400 font-bold">►</span>
                      <p><span className="text-black font-semibold">TRACKING:</span> Real-time status monitoring → Blockchain transaction history → Automated notifications → Transparent verification system</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-black flex items-center justify-center space-x-4 text-xs text-black relative z-10">
                    <span className="flex items-center"><span className="w-2 h-2 bg-lime-400 rounded-full mr-2 border border-black"></span>SYSTEM ONLINE</span>
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
          {activeTab === "profile" && <AdminProfile />}
          </Suspense>
        </main>
      </div>

      {/* Admin Modals Component */}
      {/* NOTE: showModal, modalForm, showRegisterForm removed - farmer registration is handled by FarmerRegistration component */}
      <AdminModals
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        setShowMapModal={setShowMapModal}
        setMapMode={setMapMode}
        showEventModal={showEventModal}
        setShowEventModal={setShowEventModal}
        eventForm={eventForm}
        handleEventChange={handleEventChange}
        handleEventSubmit={handleEventSubmit}
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
        leafletMapRef={leafletMapRef}
        showFarmerDetails={showFarmerDetails}
        setShowFarmerDetails={setShowFarmerDetails}
        showDeleteConfirmation={showDeleteConfirmation}
        setShowDeleteConfirmation={setShowDeleteConfirmation}
        farmerToDelete={farmerToDelete}
        setFarmerToDelete={setFarmerToDelete}
        farmers={farmers}
        setFarmers={() => {}} // Placeholder - farmers are managed by React Query
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
          addLocalNotification({
            type: 'success',
            title: 'Claim Filed Successfully',
            message: `Claim ${result.claimNumber} has been filed for the farmer`,
          })
        }}
      />

      <AdminAssistanceFiling
        isOpen={showAdminAssistanceFiling}
        onClose={() => setShowAdminAssistanceFiling(false)}
        onSuccess={(result) => {
          console.log('Assistance application filed successfully:', result)
          // Show success notification
          addLocalNotification({
            type: 'success',
            title: 'Assistance Application Filed',
            message: 'Assistance application has been submitted for the farmer',
          })
        }}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        analyticsData={analyticsData}
        onGeneratePdfReport={generatePdfReport}
      />

      {/* Map Modal - REMOVED - Feature disabled per user request */}
      {/* <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        mapMode={mapMode}
        onMapModeChange={setMapMode}
        mapSearchQuery={mapSearchQuery}
        onMapSearchQueryChange={setMapSearchQuery}
        onSearchLocation={searchLocation}
        mapRef={mapRef}
        selectedLocation={selectedLocation}
        onConfirmLocation={() => {
          if (selectedLocation) {
            setShowMapModal(false)
          } else {
            alert("Please select a location on the map first.")
          }
        }}
      /> */}

      {/* Farmer Details Modal */}
      <FarmerDetailsModal
        isOpen={showFarmerDetails !== false}
        onClose={() => setShowFarmerDetails(false)}
        farmer={typeof showFarmerDetails === 'number' ? farmers[showFarmerDetails] : null}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation !== false}
        onClose={() => {
          setShowDeleteConfirmation(false)
          setFarmerToDelete(null)
        }}
        farmer={typeof showDeleteConfirmation === 'number' ? farmers[showDeleteConfirmation] : farmerToDelete}
        onConfirm={async () => {
          try {
            const farmerToDeleteItem = typeof showDeleteConfirmation === 'number' ? farmers[showDeleteConfirmation] : farmerToDelete
            const farmerId = farmerToDeleteItem?.id || farmerToDeleteItem?._id
            const farmerName = farmerToDeleteItem?.farmerName || 
                             `${farmerToDeleteItem?.firstName || ''} ${farmerToDeleteItem?.lastName || ''}`.trim()
            
            if (!farmerId) return
            
            await deleteFarmerMutation.mutateAsync(farmerId)

            // Close modal
            setShowDeleteConfirmation(false)
            setFarmerToDelete(null)

            // Show success message
            addLocalNotification({
              type: 'success',
              title: 'Farmer Deleted Successfully',
              message: `${farmerName} has been removed from the system.`,
            })
          } catch (error) {
            // Show error message
            addLocalNotification({
              type: 'error',
              title: 'Delete Failed',
              message: `Error: ${error.message}`,
            })
          }
        }}
      />

      {/* Confirmation Modal for Claim Status Update */}
      <ClaimStatusConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setPaymentDate("");
        }}
        actionType={confirmationAction.type}
        feedbackText={feedbackText}
        onFeedbackChange={setFeedbackText}
        paymentDate={paymentDate}
        onPaymentDateChange={setPaymentDate}
        onConfirm={confirmStatusUpdate}
      />

      {/* Assistance Application Feedback Modal */}
      <AssistanceFeedbackModal
        isOpen={showAssistanceFeedbackModal}
        onClose={() => {
          setShowAssistanceFeedbackModal(false);
          setAssistanceFeedback("");
        }}
        actionType={assistanceAction.type}
        itemName={assistanceAction.itemName}
        feedback={assistanceFeedback}
        onFeedbackChange={setAssistanceFeedback}
        onConfirm={confirmAssistanceAction}
      />

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
                    // Note: Farmer notifications are now created by backend API automatically
                    addLocalNotification({
                      type: 'success',
                      title: 'Request Approved',
                      message: 'Assistance request has been approved.',
                    });
                    
                    setShowFeedbackModal(false);
                    setPendingAction(null);
                    setFeedbackText("");
                  } else {
                    try {
                      await updateApplicationMutation.mutateAsync({
                        applicationId: pendingAction.request.id,
                        statusData: { status: 'rejected', adminFeedback: feedbackText }
                      })
                      
                      addLocalNotification({
                        type: 'success',
                        title: 'Request Rejected',
                        message: 'Assistance request has been rejected.',
                      })
                      // Note: Farmer notifications are now created by backend API automatically
                    } catch (error) {
                      addLocalNotification({
                        type: 'error',
                        title: 'Error Rejecting Request',
                        message: error.message,
                      })
                    }
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

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        darkMode={darkMode}
      />

      {/* Crop Price Management Modal */}
      <CropPriceManagement
        isOpen={showCropPriceManagement}
        onClose={() => setShowCropPriceManagement(false)}
        onNotify={addLocalNotification}
      />
    </div>
  )
}

export default AdminDashboard
