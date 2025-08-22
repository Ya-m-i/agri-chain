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
} from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useNotificationStore } from "../store/notificationStore"
import useAssistanceStore from "../store/assistanceStore"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
// Use a relative path that matches your project structure
// If you're unsure about the exact path, you can use a placeholder or comment it out temporarily
// import adminLogoImage from "../assets/images/AgriLogo.png"
import adminLogoImage from "../assets/images/AgriLogo.png" // Fallback to a placeholder if image can't be found
import DistributionRecords from "../components/DistributionRecords"
import FarmerRegistration from "../components/FarmerRegistration"
import AdminSettings from "../components/AdminSettings"
import InsuranceClaims from "../components/InsuranceClaims"
import AdminModals from "../components/AdminModals"
import CropInsuranceManagement from "../components/CropInsuranceManagement"

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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
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
import { fetchClaims, updateClaim, deleteAssistance, createAssistance, fetchFarmers, fetchCropInsurance } from '../api'

// Utility: Moving Average
// Utility: Find Peaks


const AdminDashboard = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAssistance, setSelectedAssistance] = useState(null)

  const { 
    assistanceItems, 
    allApplications,
    loading: assistanceLoading,
    error: assistanceError,
    getAllApplications,
    updateApplicationStatus,
    initAssistanceItems
  } = useAssistanceStore()

  // Calculate low stock items with useMemo to prevent infinite loops
  const lowStockItems = useMemo(() => 
    assistanceItems.filter(item => (item.availableQuantity || 0) < 5),
    [assistanceItems]
  );

  // Debug logging for assistance items
  useEffect(() => {
    console.log('AdminDashboard: Assistance items updated:', assistanceItems.length);
    console.log('AdminDashboard: Assistance items:', assistanceItems);
  }, [assistanceItems]);

  useEffect(() => {
    console.log('AdminDashboard: Initializing assistance items and applications');
    initAssistanceItems().catch(error => {
      console.error('AdminDashboard: Error initializing assistance items:', error);
    });
    getAllApplications().catch(error => {
      console.error('AdminDashboard: Error getting all applications:', error);
    });
  }, [initAssistanceItems, getAllApplications]);



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
  const [distributionRecordsFilter, setDistributionRecordsFilter] = useState("monthly") // For Distribution Records chart filter
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

  // Data states
  const [claims, setClaims] = useState([])
  const [farmers, setFarmers] = useState([])
  const [lastInsuranceUpdate, setLastInsuranceUpdate] = useState(null)
  const [insuranceByFarmer, setInsuranceByFarmer] = useState({})

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
  const handleSubmit = (e) => {
    e.preventDefault()
    // Create a new farmer object
    const newFarmer = {
      id: Date.now().toString(),
      farmerName: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
      address: formData.address,
      cropType: formData.cropType,
      cropArea: formData.cropArea,
      insuranceType: formData.insuranceType,
      premiumAmount: formData.premiumAmount,
      lotNumber: formData.lotNumber,
      lotArea: formData.lotArea,
      agency: formData.agency,
      isCertified: formData.isCertified,
      periodFrom: formData.periodFrom,
      periodTo: formData.periodTo,
      birthday: formData.birthday,
      gender: formData.gender,
      contactNum: formData.contactNum,
      username: formData.username,
      password: formData.password,
      location: selectedLocation,
    }

    // Update the farmers state
    setFarmers((prevFarmers) => [...prevFarmers, newFarmer])

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
      id: Date.now(),
      type: 'success',
      title: 'Farmer Registered Successfully',
      message: `${formData.firstName} ${formData.lastName} has been registered successfully.`,
      timestamp: new Date()
    });
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
        const lotArea = farmer.lotArea || farmer.cropArea || 'Not specified'
        const isCertified = farmer.isCertified ? "✓ Certified" : ""

        // choose a color and icon for the marker based on primary crop
        const primaryCropForColor = (uniqueInsured[0] || farmer.cropType || '').split(',')[0].trim()
        const color = getCropColor(primaryCropForColor)

        const emoji = getCropEmoji(primaryCropForColor)
        const iconHtml = `<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid ${color};background:#ffffff;color:#111827;font-size:16px;">${emoji}</div>`
        const icon = L.divIcon({
          className: 'crop-marker',
          html: iconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        })

        const marker = L.marker([farmer.location.lat, farmer.location.lng], { icon }).bindPopup(`
          <strong>${farmerName}</strong><br>
          Crop: ${cropType}<br>
          Area: ${lotArea}<br>
          ${isCertified}
        `)

        marker.addTo(overviewMarkersLayerRef.current)
      }
    })
  }, [farmers, insuranceByFarmer, cropFilter, monthFilter, yearFilter])

        // Load claims function
        const loadClaims = async () => {
  try {
    showLoading("Loading claims...");
    setIsRefreshing(true);
    // ...existing code...
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    showError("Failed to load claims from the server.");
    // ...existing code...
  } finally {
    hideLoading();
    setIsRefreshing(false);
  }
};

        // Load claims from backend with auto-refresh
        useEffect(() => {
          // Initial load
          loadClaims();

          // Set up auto-refresh every 5 seconds for real-time updates
          const intervalId = setInterval(loadClaims, 5000); // Refresh every 5 seconds

          // Cleanup interval on component unmount
          return () => clearInterval(intervalId);
         
        }, []); // Only run once when component mounts

  // Add these useEffect hooks after the other useEffect hooks in the component, before the derived data section

  // Load farmers from backend when component mounts
  useEffect(() => {
  const loadFarmers = async () => {
    try {
      showLoading("Loading farmers...");
      const farmersData = await fetchFarmers();
      setFarmers(farmersData);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showError("Failed to load farmers from the server.");
      // ...existing code...
    } finally {
      hideLoading();
    }
  };
  loadFarmers();
}, []);

  // Save farmers to local storage whenever it changes (for backup)
  useEffect(() => {
    if (farmers.length > 0) {
      localStorage.setItem("farmers", JSON.stringify(farmers));
    }
  }, [farmers]);

  // Derived data
  const totalFarmers = farmers.length
  const pendingClaims = claims.filter((c) => c.status === "pending").length
  const approvedClaims = claims.filter((c) => c.status === "approved").length
  const aidDistributed = approvedClaims

  // Event handlers
  const handleLogout = () => {
    logout()
    localStorage.removeItem("isAdmin") // For backward compatibility
    navigate("/")
  }

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

  // Generate unique notification ID
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

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
      
      await createAssistance(assistanceData);
      
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
    } catch (error) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Add Assistance Failed',
        message: `Error: ${error.message}`,
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
      // Refresh applications
      getAllApplications();
    } catch (error) {
      useNotificationStore.getState().addAdminNotification({
        id: generateUniqueId(),
        type: 'error',
        title: 'Distribution Failed',
        message: `Error: ${error.message}`,
        timestamp: new Date()
      });
    }
  };

  // Confirm assistance application action with feedback
  const confirmAssistanceAction = async () => {
    const { type: actionType, applicationId, itemName } = assistanceAction;
    try {
      if (actionType === 'delete') {
        // Delete assistance item
        await deleteAssistance(applicationId);
        
        // Show success notification
        useNotificationStore.getState().addAdminNotification({
          id: generateUniqueId(),
          type: 'success',
          title: 'Assistance Deleted',
          message: `${itemName} has been deleted successfully.`,
          timestamp: new Date()
        });
        
        // Close modal and refresh
        setShowAssistanceFeedbackModal(false);
        setAssistanceFeedback("");
        initAssistanceItems(); // Refresh assistance items
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
        getAllApplications();
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
      await updateClaim(actionClaimId, {
        status: actionType,
        adminFeedback: feedbackText,
      });
      const updatedClaims = await fetchClaims();
      setClaims(updatedClaims);
      setShowConfirmationModal(false);
      setFeedbackText("");
      
      // Find the claim to get farmer details
      const claim = updatedClaims.find(c => c._id === actionClaimId || c.id === actionClaimId);
      
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
  useEffect(() => {
    const loadAllInsurance = async () => {
      try {
        const all = await fetchCropInsurance()
        const grouped = {}
        all.forEach((rec) => {
          const fid = (rec.farmerId && (rec.farmerId._id || rec.farmerId)) || rec.farmer || rec.farmerID
          if (!fid) return
          const key = String(fid)
          if (!grouped[key]) grouped[key] = []
          grouped[key].push(rec)
        })
        setInsuranceByFarmer(grouped)
      } catch (err) {
        console.error('AdminDashboard: Failed to load crop insurance for overview map:', err)
      }
    }
    loadAllInsurance()
  }, [])

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
  const totalInventoryIssued = assistanceItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  
  // Calculate total insurance paid using useMemo for better performance
  const totalInsurancePaid = useMemo(() => {
    const total = claims
      .filter(c => c.status === "approved" && c.compensation)
    .reduce((sum, c) => sum + (parseFloat(c.compensation) || 0), 0);
    
    // Track when the total changes
    if (lastInsuranceUpdate !== total) {
      setLastInsuranceUpdate(total);
    }
    
    return total;
  }, [claims, lastInsuranceUpdate]);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const cropTypes = Array.from(new Set(claims.map(c => c.cropType || c.crop))).filter(Boolean);
  const years = claims.map(c => new Date(c.date).getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const statuses = Array.from(new Set(claims.map(c => c.status))).filter(Boolean);

  const filteredClaims = claims.filter(c => {
    const year = new Date(c.date).getFullYear();
    const yearMatch = year >= minYear && year <= maxYear;
    const cropMatch = selectedCrops.length === 0 || selectedCrops.includes(c.cropType || c.crop);
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(c.status);
    return yearMatch && cropMatch && statusMatch;
  });

  const toggleCrop = crop => setSelectedCrops(crops => crops.includes(crop) ? crops.filter(c => c !== crop) : [...crops, crop]);
  const toggleStatus = status => setSelectedStatuses(statuses => statuses.includes(status) ? statuses.filter(s => s !== status) : [...statuses, status]);
  const resetFilters = () => {
    setSelectedCrops([]);
    setSelectedStatuses([]);
  };
  const applyFilters = () => setShowFilterDrawer(false);

  // Floating filter button
  <button
    className="fixed bottom-8 right-8 z-50 bg-lime-700 text-white rounded-full shadow-lg p-4 hover:bg-lime-800 transition"
    onClick={() => setShowFilterDrawer(true)}
    aria-label="Open analytics filters"
  >
    <FilterIcon className="w-6 h-6" />
  </button>

  // Filter drawer
  {showFilterDrawer && (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300" onClick={() => setShowFilterDrawer(false)} />
      <div className="relative ml-auto w-full max-w-md bg-white shadow-2xl h-full flex flex-col p-8 transform transition-transform duration-300 translate-x-0">
        <h2 className="text-2xl font-bold mb-6">Filter Analytics</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Crop Type</label>
            <div className="flex flex-wrap gap-2">
              {cropTypes.map(crop => (
                <button
                  key={crop}
                  className={`px-3 py-1 rounded-full border ${selectedCrops.includes(crop) ? 'bg-lime-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => toggleCrop(crop)}
                  type="button"
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <button
                  key={status}
                  className={`px-3 py-1 rounded-full border ${selectedStatuses.includes(status) ? 'bg-lime-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => toggleStatus(status)}
                  type="button"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-auto flex gap-4 pt-8">
          <button className="flex-1 bg-gray-200 rounded py-2" onClick={resetFilters}>Reset</button>
          <button className="flex-1 bg-lime-700 text-white rounded py-2" onClick={applyFilters}>Apply</button>
        </div>
        <div className="mt-4 text-sm text-gray-500">Showing {filteredClaims.length} results</div>
      </div>
    </div>
  )}

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



  // Fetch claims from MongoDB on mount
  useEffect(() => {
    fetchClaims()
      .then((data) => {
        console.log("Fetched claims:", data);
        setClaims(data);
      })
      .catch((err) => console.error('Failed to fetch claims:', err));
  }, []);

  // Add at the top of AdminDashboard component:
  const [searchQuery, setSearchQuery] = useState("");

  // Add this state near other filter states
  const [assistanceStatusFilter, setAssistanceStatusFilter] = useState("all");

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
      <header style={{ backgroundColor: 'rgb(43, 158, 102)' }} className="text-black">
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

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={toggleNotificationPanel}
                className={`text-white p-2 rounded-full hover:bg-lime-500 transition-colors relative ${unreadAdminCount > 0 ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: 'rgb(64, 214, 141)' }}
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
                  <div className="p-4 text-white flex justify-between items-center" style={{ backgroundColor: 'rgb(64, 178, 122)' }}>
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
                  <LayoutDashboard size={20} className="mr-3" />
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
                  <UserPlus size={20} className="mr-3" />
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
                  <Map size={20} className="mr-3" />
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
                  <FileText size={20} className="mr-3" />
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
                  <Truck size={20} className="mr-3" />
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
                  <ClipboardCheck size={20} className="mr-3" />
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
                  <Shield size={20} className="mr-3" />
                  Crop Insurance
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shadow-lg text-black space-y-6 border-r border-gray-100 sticky top-0 h-screen overflow-y-auto bg-white">
          <br></br>

          <div className="space-y-1 px-3">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left transition-colors ${
                activeTab === "home" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === "home" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            <div>
              <button
                onClick={() => {
                  setActiveTab("farmer-registration")
                  setShowFarmLocationsDropdown(!showFarmLocationsDropdown)
                }}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg w-full text-left transition-colors ${
                  activeTab === "farmer-registration"
                    ? "text-lime-800 font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                style={activeTab === "farmer-registration" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  <UserPlus size={18} />
                  Farmer Registration
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showFarmLocationsDropdown ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`transition-all duration-300 overflow-hidden ${showFarmLocationsDropdown ? "max-h-40" : "max-h-0"}`}
              >
                <button
                  onClick={() => {
                    setShowMapModal(true)
                    setMapMode("view")
                  }}
                  className={`flex items-center gap-3 px-4 py-2 pl-10 rounded-lg hover:bg-gray-50 w-full text-left transition-colors ${showMapModal ? "text-lime-800 font-bold" : "text-gray-600"}`}
                  style={showMapModal ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <Map size={16} />
                  View Farm Locations
                </button>
                <button
                  onClick={() => setActiveTab("crop-insurance")}
                  className={`flex items-center gap-3 px-4 py-2 pl-10 rounded-lg hover:bg-gray-50 w-full text-left transition-colors ${activeTab === 'crop-insurance' ? "text-lime-800 font-bold" : "text-gray-600"}`}
                  style={activeTab === 'crop-insurance' ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
                >
                  <Shield size={16} />
                  Crop Insurance
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("claims")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left transition-colors ${
                activeTab === "claims" ? "text-lime-800 font-bold" : "text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === "claims" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
            >
              <FileText size={18} />
              Cash Assistance Claims
            </button>

            <button
              onClick={() => setActiveTab("distribution")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left transition-colors ${
                activeTab === "distribution"
                  ? "text-lime-800 font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === "distribution" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
            >
              <Truck size={18} />
              Distribution Records
            </button>

            <hr className="border-gray-100 my-4" />

            <button
              onClick={() => setActiveTab("assistance")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left transition-colors ${
                activeTab === "assistance"
                  ? "text-lime-800 font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === "assistance" ? { backgroundColor: 'rgba(43, 158, 102, 0.15)' } : undefined}
            >
              <ClipboardCheck size={18} />
              Assistance Inventory
            </button>

            <div className="px-3">
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left transition-colors text-gray-700 hover:bg-gray-50"
              >
                <Plus size={18} />
                Add Government Assistance
              </button>
            </div>
          </div>

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
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 bg-gradient-to-b from-zinc-50 to-white">
          {activeTab === "home" && (
            <>
              {/* --- Analytics Filters --- */}
              {/* Remove the old analyticsFilters and setAnalyticsFilters dropdowns and reset button in the analytics section. */}
              {/* Only use the new floating filter drawer and its state for filtering and displaying analytics. */}

              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4 mb-8">
                {/* Total Farmers Block - Stat Card KPI Widget */}
                <div className="bg-transparent rounded-xl shadow-lg p-3 border border-cyan-200 flex flex-col items-center text-center text-gray-800">
                  <div className="text-lg font-bold text-cyan-700">Total Farmers</div>
                  <div className="text-xs text-cyan-600 mt-1">Hash: <span className="font-mono">{String(totalFarmers).padStart(8, '0')}</span></div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">{totalFarmers}</div>
                  <div className="text-sm text-cyan-700 mt-2">Registered Farmers</div>
                  <div className="w-16 h-16 mt-3 bg-cyan-400 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                </div>
                {/* Pending Claims Block - Donut Chart (Status Breakdown) + KPI Card */}
                <div className="bg-transparent rounded-xl shadow-lg p-3 border border-orange-200 flex flex-col items-center text-center text-gray-800">
                  <div className="text-lg font-bold text-orange-700">Pending Claims</div>
                  <div className="text-xs text-orange-600 mt-1">Hash: <span className="font-mono">{String(pendingClaims).padStart(8, '0')}</span></div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">{pendingClaims}</div>
                  <div className="text-sm text-orange-700 mt-2">Awaiting Review</div>
                  <div className="w-16 h-16 mt-3 bg-orange-400 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                {/* Approved Claims Block - Area Chart + KPI Card */}
                <div className="bg-transparent rounded-xl shadow-lg p-3 border border-green-200 flex flex-col items-center text-center text-gray-800 relative">
                  <div className="text-lg font-bold text-green-700">Approved Claims</div>
                  <div className="text-xs text-green-600 mt-1">Hash: <span className="font-mono">{String(approvedClaims).padStart(8, '0')}</span></div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">{approvedClaims}</div>
                  <div className="text-sm text-green-700 mt-2">Successfully Processed</div>
                  <div className="w-16 h-16 mt-3 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                {/* Aid Distributed Block - Stacked Bar Chart (by type) + KPI Card */}
                <div className="bg-transparent rounded-xl shadow-lg p-3 border border-purple-200 flex flex-col items-center text-center text-gray-800">
                  <div className="text-lg font-bold text-purple-700">Aid Distributed</div>
                  <div className="text-xs text-purple-600 mt-1">Hash: <span className="font-mono">{String(aidDistributed).padStart(8, '0')}</span></div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">{aidDistributed}</div>
                  <div className="text-sm text-purple-700 mt-2">Items Delivered</div>
                  <div className="w-16 h-16 mt-3 bg-purple-400 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                </div>
                {/* Total Inventory Issued Block - Bar Chart (by item type) + KPI Card */}
                <div className="bg-transparent rounded-xl shadow-lg p-3 border border-indigo-200 flex flex-col items-center text-center text-gray-800">
                  <div className="text-lg font-bold text-indigo-700">Total Inventory Issued</div>
                  <div className="text-xs text-indigo-600 mt-1">Hash: <span className="font-mono">{String(totalInventoryIssued).padStart(8, '0')}</span></div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">{totalInventoryIssued}</div>
                  <div className="text-sm text-indigo-700 mt-2">Items Released</div>
                  <div className="w-16 h-16 mt-3 bg-indigo-400 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                  </div>
                </div>
                {/* Total Insurance Paid Block - Line Chart + KPI Card */}
                <div className="bg-transparent rounded-xl shadow-lg p-3 border border-emerald-200 flex flex-col items-center text-center text-gray-800 relative">
                  <div className="text-lg font-bold text-emerald-700">Total Insurance Paid</div>
                  <div className="text-xs text-emerald-600 mt-1">Hash: <span className="font-mono">{String(totalInsurancePaid).padStart(8, '0')}</span></div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">₱{totalInsurancePaid.toLocaleString()}</div>
                  <div className="text-sm text-emerald-700 mt-1">Monthly Payout</div>
                  {lastInsuranceUpdate && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                  <div className="w-16 h-16 mt-3 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Chart Visualizations Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
                {/* Distribution Records Line Area Chart */}
                <div className="bg-white rounded-2xl p-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <TrendingUp size={20} className="text-green-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Filed Claims Records</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Period:</span>
                      <select
                        value={distributionRecordsFilter}
                        onChange={(e) => setDistributionRecordsFilter(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <select
                        value={distributionYearFilter}
                        onChange={(e) => setDistributionYearFilter(parseInt(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                                    </div>
                  


                  <div className="h-[420px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={(() => {
                          // Get only cash assistance claims
                          const allFiledClaims = claims.map(claim => ({
                            ...claim,
                            applicationDate: claim.date, // Use claim date as application date
                            requestedQuantity: claim.amount || 0 // Use claim amount as quantity
                          }));
                          
                                                      if (distributionRecordsFilter === 'monthly') {
                              // Group by month with proper month names for selected year
                              const monthlyData = [];
                              const monthNames = [
                                "January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"
                              ];
                              
                              for (let month = 0; month < 12; month++) {
                                const filedClaimsInMonth = allFiledClaims.filter(app => {
                                  // Use applicationDate for filed claims
                                  const date = new Date(app.applicationDate);
                                  return date.getFullYear() === distributionYearFilter && date.getMonth() === month;
                                }).length;
                                
                                // Calculate total quantity requested for this month
                                const filedClaimsInMonthData = allFiledClaims.filter(app => {
                                  const date = new Date(app.applicationDate);
                                  return date.getFullYear() === distributionYearFilter && date.getMonth() === month;
                                });
                                
                                const totalQuantityInMonth = filedClaimsInMonthData.reduce((sum, app) => sum + (app.requestedQuantity || 0), 0);
                                
                                monthlyData.push({
                                  period: monthNames[month],
                                  month: month + 1,
                                  count: filedClaimsInMonth,
                                  quantity: totalQuantityInMonth,
                                  cumulative: monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].cumulative + filedClaimsInMonth : filedClaimsInMonth,
                                  cumulativeQuantity: monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].cumulativeQuantity + totalQuantityInMonth : totalQuantityInMonth
                                });
                              }
                              
                              return monthlyData;
                            } else {
                              // Group by year with year filter
                              const yearlyData = {};
                              const yearlyQuantityData = {};
                              
                              allFiledClaims.forEach(app => {
                                // Use applicationDate for filed claims
                                const date = new Date(app.applicationDate);
                                const year = date.getFullYear();
                                // Only include data for the selected year or all years if no specific year filter
                                if (year === distributionYearFilter) {
                                  yearlyData[year] = (yearlyData[year] || 0) + 1;
                                  yearlyQuantityData[year] = (yearlyQuantityData[year] || 0) + (app.requestedQuantity || 0);
                                }
                              });
                              
                              // Convert to array format for chart with cumulative data
                              const years = Object.keys(yearlyData).sort();
                              let cumulative = 0;
                              let cumulativeQuantity = 0;
                              return years.map(year => {
                                cumulative += yearlyData[year];
                                cumulativeQuantity += yearlyQuantityData[year];
                                return {
                                  period: year.toString(),
                                  year: parseInt(year),
                                  count: yearlyData[year],
                                  quantity: yearlyQuantityData[year],
                                  cumulative: cumulative,
                                  cumulativeQuantity: cumulativeQuantity
                                };
                              });
                            }
                        })()}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                          label={{ value: 'Number of Filed Claims', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid #22c55e',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                          formatter={(value, name) => {
                            if (name === 'cumulative') {
                              return [`${value} claims`, 'Total Filed Claims'];
                            } else if (name === 'count') {
                              return [`${value} claims`, 'New Filed Claims'];
                            } else if (name === 'cumulativeQuantity') {
                              return [`${value} units`, 'Total Quantity Requested'];
                            } else if (name === 'quantity') {
                              return [`${value} units`, 'Quantity Requested'];
                            }
                            return [value, name];
                          }}
                          labelFormatter={(label) => `${distributionRecordsFilter === 'monthly' ? 'Month' : 'Year'}: ${label}`}
                        />
                        <defs>
                          <linearGradient id="distributionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#bbf7d0" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="cumulative" 
                          stroke="#22c55e" 
                          fill="url(#distributionGradient)" 
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

                {/* Assistance Application Status Polar Area Chart */}
                <div className="bg-white rounded-2xl p-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <PieChart size={20} className="text-emerald-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Assistance Application Status</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Filter:</span>
                      <select
                        value={assistanceStatusFilter}
                        onChange={(e) => setAssistanceStatusFilter(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="distributed">Distributed</option>
                      </select>
                  </div>
                </div>
                  <div className="h-[420px] relative">
                    <PolarArea
                      data={(() => {
                        if (assistanceStatusFilter === 'all') {
                          const totalApplications = allApplications.length;
                          const pendingCount = allApplications.filter(app => app.status === 'pending').length;
                          const rejectedCount = allApplications.filter(app => app.status === 'rejected').length;
                          const approvedCount = allApplications.filter(app => app.status === 'approved').length;
                          const distributedCount = allApplications.filter(app => app.status === 'distributed').length;
                          
                          const pendingPercentage = totalApplications > 0 ? ((pendingCount / totalApplications) * 100).toFixed(1) : '0.0';
                          const rejectedPercentage = totalApplications > 0 ? ((rejectedCount / totalApplications) * 100).toFixed(1) : '0.0';
                          const approvedPercentage = totalApplications > 0 ? ((approvedCount / totalApplications) * 100).toFixed(1) : '0.0';
                          const distributedPercentage = totalApplications > 0 ? ((distributedCount / totalApplications) * 100).toFixed(1) : '0.0';
                          
                          return {
                            labels: [
                              `Pending (${pendingPercentage}%)`, 
                              `Rejected (${rejectedPercentage}%)`, 
                              `Approved (${approvedPercentage}%)`, 
                              `Distributed (${distributedPercentage}%)`
                            ],
                        datasets: [
                          {
                                data: [pendingCount, rejectedCount, approvedCount, distributedCount],
                            backgroundColor: [
                                  'rgba(251, 191, 36, 0.8)',   // Pending - Amber
                                  'rgba(248, 113, 113, 0.8)',   // Rejected - Light Red
                                  'rgba(34, 197, 94, 0.8)',     // Approved - Green
                                  'rgba(16, 185, 129, 0.8)',    // Distributed - Emerald
                                ],
                                borderColor: [
                                  'rgba(251, 191, 36, 1)',
                                  'rgba(248, 113, 113, 1)',
                                  'rgba(34, 197, 94, 1)',
                                  'rgba(16, 185, 129, 1)',
                                ],
                                borderWidth: 2,
                              }
                            ],
                          };
                        } else {
                          const totalApplications = allApplications.length;
                          const filteredCount = allApplications.filter(app => app.status === assistanceStatusFilter).length;
                          const percentage = totalApplications > 0 ? ((filteredCount / totalApplications) * 100).toFixed(1) : '0.0';
                          const label = assistanceStatusFilter.charAt(0).toUpperCase() + assistanceStatusFilter.slice(1);
                          const color =
                            assistanceStatusFilter === 'pending' ? 'rgba(251, 191, 36, 0.8)' :
                            assistanceStatusFilter === 'rejected' ? 'rgba(248, 113, 113, 0.8)' :
                            assistanceStatusFilter === 'approved' ? 'rgba(34, 197, 94, 0.8)' :
                            'rgba(16, 185, 129, 0.8)';
                          const borderColor =
                            assistanceStatusFilter === 'pending' ? 'rgba(251, 191, 36, 1)' :
                            assistanceStatusFilter === 'rejected' ? 'rgba(248, 113, 113, 1)' :
                            assistanceStatusFilter === 'approved' ? 'rgba(34, 197, 94, 1)' :
                            'rgba(16, 185, 129, 1)';
                          return {
                            labels: [`${label} (${percentage}%)`],
                        datasets: [
                          {
                                data: [filteredCount],
                                backgroundColor: [color],
                                borderColor: [borderColor],
                                borderWidth: 2,
                              }
                            ],
                          };
                        }
                      })()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: assistanceStatusFilter === 'all',
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true,
                              pointStyle: 'circle',
                              font: {
                                size: 12
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#10b981',
                            borderWidth: 1,
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                if (assistanceStatusFilter === 'all') {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                  return `${label}: ${value} (${percentage}%)`;
                                } else {
                                  const total = allApplications.length;
                                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                  return `${label}: ${value} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        },
                        scales: {
                          r: {
                            grid: {
                              color: 'rgba(0, 0, 0, 0.1)',
                            },
                            ticks: {
                              color: '#6b7280',
                              font: {
                                size: 10
                              }
                            }
                          }
                        }
                      }}
                    />
                    <div 
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}
                    >
                      <div className="text-2xl font-bold text-gray-700">
                        {assistanceStatusFilter === 'all'
                          ? allApplications.length
                          : allApplications.filter(app => app.status === assistanceStatusFilter).length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {assistanceStatusFilter === 'all'
                          ? 'Total Applications'
                          : (assistanceStatusFilter.charAt(0).toUpperCase() + assistanceStatusFilter.slice(1)) + ' Applications'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview: Farmers Map (embedded) */}
              <div className="bg-white rounded-2xl p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Map size={20} className="text-emerald-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Farm Locations Overview</h3>
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
                <div className="w-full h-[420px] rounded-lg border border-gray-200 overflow-hidden">
                  <div ref={overviewMapRef} className="w-full h-full" />
                </div>
              </div>

              {/* Pending Insurance Claims and Quick Actions Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2">
                  <div className="flex items-center mb-2">
                    <AlertTriangle size={18} className="text-yellow-500 mr-2" />
                    <h2 className="text-xl font-semibold">Pending Insurance Claims</h2>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    {claims.filter((c) => c.status === "pending").length === 0 ? (
                      <div className="text-center py-6">
                        <ClipboardCheck size={40} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500 italic">No pending claims found.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {claims.filter((c) => c.status === "pending")
                          .sort((a, b) => {
                            const damageA = Number.parseFloat(a.degreeOfDamage) || Number.parseFloat(a.areaDamaged) || 0;
                            const damageB = Number.parseFloat(b.degreeOfDamage) || Number.parseFloat(b.areaDamaged) || 0;
                            return damageB - damageA;
                          })
                          .map((claim) => (
                            <div key={claim._id} className="bg-white/60 rounded-xl shadow-lg p-4 border-l-4 border-yellow-500 transition-all duration-500 animate-fade-in mb-2">
                              <div className="font-mono text-xs text-gray-500">Claim ID: {claim.claimNumber || claim._id}</div>
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-bold">{claim.name}</div>
                                  <div className="text-xs text-gray-400">{claim.crop || claim.cropType || "Unknown"}</div>
                                  <div className="text-xs text-gray-400">{claim.damageType || claim.type || "Unknown"}</div>
                                </div>
                                <div className="text-xs text-yellow-700 capitalize">{claim.status}</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Activity size={18} className="text-lime-600 mr-2" />
                    <h2 className="text-xl font-semibold">Quick Actions</h2>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-200 border-l-8 transition-transform duration-300 hover:scale-105 hover:shadow-2xl space-y-4">
                    <button 
                      onClick={() => setActiveTab("farmer-registration")}
                      className="w-full flex items-center justify-center bg-lime-600 text-white px-4 py-3 rounded-lg hover:bg-lime-700 transition-transform duration-200 hover:scale-105"
                    >
                      <UserPlus size={18} className="mr-2" />
                      Register Farmer
                    </button>
                    <button className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-transform duration-200 hover:scale-105">
                      <Bell size={18} className="mr-2" />
                      Send Notification
                    </button>
                    <button className="w-full flex items-center justify-center bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-transform duration-200 hover:scale-105">
                      <Map size={18} className="mr-2" />
                      View Farm Map
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <FileText size={18} className="text-lime-600 mr-2" />
                  <h2 className="text-xl font-semibold">Recent Claims</h2>
                </div>
                <div className="space-y-2">
                  {claims.slice(0, 5).map((claim) => (
                    <div key={claim._id} className="bg-white/60 rounded-xl shadow-lg p-4 border-l-4 border-lime-500 transition-all duration-500 animate-fade-in mb-2">
                      <div className="font-mono text-xs text-gray-500">Claim ID: {claim.claimNumber || claim._id}</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold">{claim.name}</div>
                          <div className="text-xs text-gray-400">{new Date(claim.date).toLocaleDateString()}</div>
                        </div>
                        <div className={`text-xs font-semibold ${
                          claim.status === 'approved' ? 'text-green-700' :
                          claim.status === 'rejected' ? 'text-red-600' :
                          claim.status === 'pending' ? 'text-amber-600' :
                          'text-gray-500'
                        }`}>
                          {claim.status}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  setClaims={setClaims}
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
              farmers={farmers}
              setFarmers={setFarmers}
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Assistance Applications</h3>
                <div className="bg-white/60 rounded-2xl shadow-xl p-6">
                  {allApplications.length > 0 ? (
                    <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                          {allApplications.map((application) => (
                            <tr key={application._id} className="bg-white/60 animate-fade-in">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {application.farmerId ? `${application.farmerId.firstName} ${application.farmerId.lastName}` : 'N/A'}
                              </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {application.assistanceId?.assistanceType || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {application.requestedQuantity}kg
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {application.quarter}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(application.applicationDate).toLocaleDateString()}
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
                                  {application.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {application.status === 'pending' && (
                            <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleApproveApplication(application._id)}
                                      className="text-green-600 hover:text-green-800 font-medium"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleRejectApplication(application._id)}
                                      className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                      Reject
                                    </button>
                            </div>
                                )}
                                {application.status === 'approved' && (
                                  <button 
                                    onClick={() => handleDistributeApplication(application._id)}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Mark Distributed
                                  </button>
                                )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No assistance applications found.</p>
                      <p className="text-sm mt-2">Applications from farmers will appear here once they apply for assistance.</p>
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
        setFarmers={setFarmers}
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
                onClick={() => {
                  // Remove farmer from the list
                  setFarmers((prevFarmers) => prevFarmers.filter((farmer) => farmer.id !== farmers[showDeleteConfirmation].id))

                  // Update localStorage
                  const updatedFarmers = farmers.filter((farmer) => farmer.id !== farmers[showDeleteConfirmation].id)
                  localStorage.setItem("farmers", JSON.stringify(updatedFarmers))

                  // Close modal
                  setShowDeleteConfirmation(false)
                  setFarmerToDelete(null)

                  // Show success message
                  useNotificationStore.getState().addAdminNotification({
                    id: generateUniqueId(),
                    type: 'success',
                    title: 'Farmer Deleted Successfully',
                    message: 'Farmer has been removed from the system.',
                    timestamp: new Date()
                  });
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
                onClick={() => {
                  if (pendingAction.type === 'approve') {
                    useAssistanceStore.getState().approveRequest(pendingAction.request.id, (result) => {
                      if (result && result.error) {
                        useNotificationStore.getState().addAdminNotification({
                          id: generateUniqueId(),
                          type: 'error',
                          title: 'Approval Failed',
                          message: result.error,
                          timestamp: new Date()
                        });
                        return;
                      }
                      if (result && result.warning) {
                        useNotificationStore.getState().addAdminNotification({
                          id: generateUniqueId(),
                          type: 'warning',
                          title: 'Warning',
                          message: result.warning,
                          timestamp: new Date()
                        });
                      }
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
                    });
                  } else {
                    useAssistanceStore.getState().rejectRequest(pendingAction.request.id, feedbackText);
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
    </div>
  )
}

export default AdminDashboard
