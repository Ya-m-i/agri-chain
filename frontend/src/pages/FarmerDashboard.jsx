"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  HelpCircle,
  FileText,
  Home,
  Calendar,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Bell,
  MessageSquare,
  Shield,
  TrendingUp,
} from "lucide-react"
import { useAuthStore } from "../store/authStore"

import WeatherWidget from "../components/dashboard/weather-widget"
import ClaimStatusTracker from "../components/dashboard/claim-status-tracker"
import farmerLogoImage from "../assets/Images/FarmLogo.png" // Update this path to your farmer logo
import FarmerCropInsurance from "../components/FarmerCropInsurance"
import LoadingOverlay from '../components/LoadingOverlay';
import FarmerCropPrices from "../components/FarmerCropPrices"
import { calculateCompensation, getPaymentStatus, getExpectedPaymentDate, getDamageSeverity, getCoverageDetails } from "../utils/insuranceUtils"
import { useClaims, useCropInsurance, useFarmerApplications, useAssistances, useApplyForAssistance, useNotifications, useMarkNotificationsAsRead, useClearNotifications, useDeleteNotification } from '../hooks/useAPI'
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const FarmerDashboard = () => {
  // ============================================
  // SECTION 1: STORE HOOKS AND NAVIGATION
  // ============================================
  const { user, logout, userType } = useAuthStore()
  const navigate = useNavigate()
  
  // ============================================
  // SECTION 2: ALL REACT QUERY HOOKS (MUST BE FIRST)
  // ============================================
  // All data fetching hooks must be declared before any computed values or effects that use them
  
  // Notification hooks (API-based, polling every 7 seconds) - only enabled when user?.id exists
  const { data: apiNotifications = [], refetch: refetchNotifications } = useNotifications('farmer', user?.id || null)
  const markAsReadMutation = useMarkNotificationsAsRead()
  const clearNotificationsMutation = useClearNotifications()
  const deleteNotificationMutation = useDeleteNotification()
  
  // Use React Query for claims data - only enabled when user?.id exists
  const { data: claims = [], refetch: refetchClaims } = useClaims(user?.id || null)
  
  // Use React Query for crop insurance data - only enabled when user?.id exists
  const { data: cropInsuranceRecords = [] } = useCropInsurance(user?.id || null)
  
  // Use React Query for farmer applications data - only enabled when user?.id exists
  const { data: farmerApplications = [], isLoading: applicationsLoading, error: applicationsError } = useFarmerApplications(user?.id || null)
  
  // Use React Query for assistance data
  const { data: assistanceItems = [], isLoading: assistanceLoading, error: assistanceError } = useAssistances()
  const applyForAssistanceMutation = useApplyForAssistance()

  // ============================================
  // SECTION 3: STATE VARIABLES
  // ============================================
  const [activeTab, setActiveTab] = useState("home")
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isTabLoading, setIsTabLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  // Local-only notifications (for test/help buttons) - component state
  const [localNotifications, setLocalNotifications] = useState([]);
  
  // State for claim details modal
  const [showClaimDetails, setShowClaimDetails] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  
  // Real-time status indicator for farmer
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const [showAssistanceForm, setShowAssistanceForm] = useState(false)
  const [selectedAssistance, setSelectedAssistance] = useState(null)
  const [showAllApplications, setShowAllApplications] = useState(false)
  const [assistanceForm, setAssistanceForm] = useState({
    requestedQuantity: "",
    notes: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 // Number of assistance items per page

  // ============================================
  // SECTION 4: REFS
  // ============================================
  // Track last checked timestamps for notifications (initialize after data loads)
  const lastClaimStatusCheckRef = useRef(null);
  const lastApplicationStatusCheckRef = useRef(null);

  // ============================================
  // SECTION 5: COMPUTED VALUES (useMemo)
  // ============================================
  // Get notifications from React Query (API) - single source of truth
  // Wrap in useMemo to prevent unnecessary re-renders in hooks that depend on it
  const apiNotificationsArray = useMemo(() => {
    return Array.isArray(apiNotifications) ? apiNotifications : [];
  }, [apiNotifications]);
  
  const farmerNotifications = [...localNotifications, ...apiNotificationsArray];
  
  // Calculate unread count from API notifications only
  const unreadFarmerCount = useMemo(() => {
    return apiNotificationsArray.filter(n => !n.read).length;
  }, [apiNotificationsArray]);
  
  // Insured crop types derived from crop insurance records using React Query
  const insuredCropTypes = useMemo(() => {
    if (!cropInsuranceRecords || cropInsuranceRecords.length === 0) return []
    return Array.from(new Set(cropInsuranceRecords.map(r => r.cropType).filter(Boolean)))
  }, [cropInsuranceRecords])

  const displayedCropType = useMemo(() => {
    return (insuredCropTypes && insuredCropTypes.length > 0)
      ? insuredCropTypes.join(", ")
      : (user?.cropType || "Not provided")
  }, [insuredCropTypes, user?.cropType])

  // Provide insuredCropTypes to eligibility checks by merging into farmer object where needed
  const farmerForEligibility = useMemo(() => ({
    ...user,
    insuredCropTypes,
  }), [user, insuredCropTypes])
  
  // Combine loading and error states for UI
  const loading = assistanceLoading || applicationsLoading
  const error = assistanceError || applicationsError
  
  // ============================================
  // SECTION 6: HELPER FUNCTIONS (regular functions)
  // ============================================
  // Generate unique notification ID
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // Helper function to check if a string is a valid MongoDB ObjectId
  const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    // MongoDB ObjectId is 24 hex characters
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // ============================================
  // SECTION 7: CALLBACKS (useCallback)
  // ============================================
  // Manual refresh function for notifications (fetches from API)
  const refreshFarmerNotifications = useCallback(async () => {
    try {
      await refetchNotifications();
      await refetchClaims();
      // Note: farmerApplications will auto-refresh via React Query
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [refetchNotifications, refetchClaims]);
  
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
          recipientType: 'farmer',
          recipientId: user?.id,
          notificationIds: unreadNotificationIds
        });
      }
    }
  }, [notificationOpen, apiNotificationsArray, user?.id, markAsReadMutation]);
  
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
  
  // Load claims function with real-time updates using React Query
  const loadClaims = useCallback(async () => {
    if (user && user.id) {
      try {
        setIsRefreshing(true);
        console.log('FarmerDashboard: Refetching claims for user ID:', user.id);
        
        await refetchClaims();
        setLastRefreshTime(new Date());
      } catch (error) {
        console.error('FarmerDashboard: Failed to refetch claims:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [user, refetchClaims]);
  
  // Check eligibility for assistance (moved from store)
  const checkEligibility = useCallback((farmer, assistance) => {
    const now = new Date();
    const currentQuarter = `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`;
    
    // Check if already applied this quarter
    const alreadyApplied = farmerApplications.some(app => 
      app.farmerId === farmer.id && 
      app.assistanceId === assistance._id && 
      app.quarter === currentQuarter &&
      ['pending', 'approved', 'distributed'].includes(app.status)
    );

    // Check crop type match (supports insuredCropTypes array or single cropType)
    const farmerCrops = (farmer.insuredCropTypes && Array.isArray(farmer.insuredCropTypes) && farmer.insuredCropTypes.length > 0)
      ? farmer.insuredCropTypes.map(c => String(c).toLowerCase())
      : (farmer.cropType ? [String(farmer.cropType).toLowerCase()] : []);
    const cropTypeMatch = Boolean(
      assistance.cropType && farmerCrops.length > 0 &&
      farmerCrops.includes(String(assistance.cropType).toLowerCase())
    );

    // Check RSBSA registration
    const rsbsaEligible = !assistance.requiresRSBSA || farmer.rsbsaRegistered;

    // Check certification (for cash assistance)
    const certificationEligible = !assistance.requiresCertification || farmer.isCertified;

    // Check stock availability
    const stockAvailable = assistance.availableQuantity > 0;

    return {
      eligible: !alreadyApplied && cropTypeMatch && rsbsaEligible && certificationEligible && stockAvailable,
      alreadyApplied,
      cropTypeMatch,
      rsbsaEligible,
      certificationEligible,
      stockAvailable,
      reasons: {
        alreadyApplied: alreadyApplied ? 'Already applied this quarter' : null,
        cropTypeMismatch: !cropTypeMatch ? `Only for ${assistance.cropType} farmers` : null,
        rsbsaRequired: !rsbsaEligible ? 'RSBSA registration required' : null,
        certificationRequired: !certificationEligible ? 'Certification required' : null,
        outOfStock: !stockAvailable ? 'Out of stock' : null
      }
    };
  }, [farmerApplications]);

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

  // ============================================
  // SECTION 8: EFFECTS (useEffect)
  // ============================================
  // Redirect if not authenticated or not a farmer
  useEffect(() => {
    if (!user) {
      navigate("/")
      return
    }
    
    if (userType !== "farmer") {
      navigate("/admin")
      return
    }
  }, [user, userType, navigate])
  
  // Handle initial loading when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1200); // 1.2 seconds for initial dashboard loading

    return () => clearTimeout(timer);
  }, []);
  
  // Initialize timestamps after data loads to avoid showing all existing items as new
  useEffect(() => {
    if (claims.length > 0 && lastClaimStatusCheckRef.current === null) {
      const latestClaim = claims.reduce((latest, claim) => {
        const updateDate = new Date(claim.updatedAt || claim.date || claim.createdAt);
        return updateDate > latest ? updateDate : latest;
      }, new Date(0));
      lastClaimStatusCheckRef.current = latestClaim.getTime();
    }
    if (farmerApplications.length > 0 && lastApplicationStatusCheckRef.current === null) {
      const latestApp = farmerApplications.reduce((latest, app) => {
        const updateDate = new Date(app.reviewDate || app.distributionDate || app.applicationDate || app.createdAt);
        return updateDate > latest ? updateDate : latest;
      }, new Date(0));
      lastApplicationStatusCheckRef.current = latestApp.getTime();
    }
  }, [claims, farmerApplications]);

  // Note: Status change notifications now come from backend API automatically
  // React Query polls every 7 seconds to fetch new notifications

  // Set up auto-refresh for claims with React Query
  useEffect(() => {
    // Set up auto-refresh every 10 seconds for real-time updates
    const intervalId = setInterval(loadClaims, 10000); // Refresh every 10 seconds
    
    // Listen for new claim submissions
    const handleClaimSubmitted = () => {
      console.log('FarmerDashboard: New claim submitted, refreshing claims...');
      loadClaims();
    };
    
    window.addEventListener('claimSubmitted', handleClaimSubmitted);
    
    // Cleanup interval and event listener on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('claimSubmitted', handleClaimSubmitted);
    };
  }, [loadClaims]);

  // Generate claims data for donut chart with proper guards
  const generateClaimsChartData = () => {
    // Ensure claims is an array
    const safeClaims = Array.isArray(claims) ? claims : [];
    
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    safeClaims.forEach(claim => {
      const status = claim?.status?.toLowerCase() || 'pending';
      if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
        statusCounts[status]++;
      }
    });

    const totalClaims = safeClaims.length;

    // Return default empty chart data if no claims
    if (totalClaims === 0) {
      return {
        labels: ['No Claims'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e5e7eb'], // gray for no data
            borderColor: ['#9ca3af'],
            borderWidth: 2,
            hoverBackgroundColor: ['#d1d5db']
          }
        ]
      };
    }

    return {
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [
        {
          data: [
            statusCounts.pending,
            statusCounts.approved,
            statusCounts.rejected
          ],
          backgroundColor: [
            '#fbbf24', // yellow-400 for pending
            '#84cc16', // lime-500 for approved
            '#ef4444'  // red-500 for rejected
          ],
          borderColor: [
            '#f59e0b', // yellow-500 border
            '#65a30d', // lime-600 border
            '#dc2626'  // red-600 border
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            '#f59e0b',
            '#65a30d',
            '#dc2626'
          ]
        }
      ]
    };
  };

  // Filter assistanceItems by insured crop types (fallback to user's crop type)
  const availableAssistanceItems = useMemo(() => {
    const items = assistanceItems || []
    // Prefer insured crop types if available; else fallback to user's single cropType
    const crops = (insuredCropTypes && insuredCropTypes.length > 0)
      ? insuredCropTypes.map(c => String(c).toLowerCase())
      : (user?.cropType ? [String(user.cropType).toLowerCase()] : [])

    if (crops.length === 0) return []

    return items.filter(item => {
      if (!item?.cropType) return false
      const itemCrop = String(item.cropType).toLowerCase()
      return crops.includes(itemCrop)
    })
  }, [assistanceItems, insuredCropTypes, user?.cropType]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const totalPages = Math.ceil((availableAssistanceItems?.length || 0) / itemsPerPage)

  const handleLogout = () => {
    console.log('FarmerDashboard: Logging out...');
    logout(); // This now includes socket disconnection
    navigate("/");
  }

  // Function to open claim details modal
  const openClaimDetails = (claim) => {
    console.log("Opening claim details:", claim)
    setSelectedClaim(claim)
    setShowClaimDetails(true)
  }

  // Clear all notifications (API + local)
  const handleClearAllNotifications = async () => {
    if (!user?.id) return;
    try {
      // Clear API notifications
      await clearNotificationsMutation.mutateAsync({
        recipientType: 'farmer',
        recipientId: user.id
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

  // Add click outside to close notification panel
  useEffect(() => {
    if (notificationOpen) {
      const handleClickOutside = (event) => {
        const notificationPanel = document.querySelector('.notification-panel');
        const notificationButton = document.querySelector('.notification-button');
        
        if (notificationPanel && 
            !notificationPanel.contains(event.target) && 
            notificationButton && 
            !notificationButton.contains(event.target)) {
          setNotificationOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [notificationOpen]);



  // Note: New assistance notifications now come from backend API automatically
  // React Query polls every 7 seconds to fetch new notifications

  // Format timestamp function
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

  const handleAssistanceFormChange = (e) => {
    const { name, value } = e.target
    setAssistanceForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAssistanceSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedAssistance || !user) return;
    
    try {
      // Prepare farmer data with insured crop types for proper backend validation
      const farmerData = {
        ...user,
        insuredCropTypes,
        // Ensure cropType is set from insured crops if available
        cropType: insuredCropTypes.length > 0 ? insuredCropTypes[0] : user.cropType
      };
      
      // Apply for assistance using React Query mutation
      await applyForAssistanceMutation.mutateAsync({
        farmerId: user.id,
        assistanceId: selectedAssistance._id,
        requestedQuantity: parseInt(assistanceForm.requestedQuantity),
        // Include farmer data for backend validation
        farmerData: farmerData
      });
      
      // Reset form and close modal
      setAssistanceForm({ requestedQuantity: "", notes: "" });
      setShowAssistanceForm(false);
      setSelectedAssistance(null);
      
      // Show success message using local notification
      addLocalNotification({
        type: 'success',
        title: 'Application Submitted',
        message: `Your application for ${selectedAssistance.assistanceType} has been submitted successfully.`,
      });
      
    } catch (error) {
      addLocalNotification({
        type: 'error',
        title: 'Application Failed',
        message: `Error: ${error.message}`,
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-lime-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 md:hidden" aria-label="Toggle menu">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {/* Add logo here */}
            <img src={farmerLogoImage || "/placeholder.svg"} alt="Farmer Logo" className="h-15 w-auto mr-3" />
            <h1 className="text-xl font-bold">FARMER DASHBOARD</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Real-time Status Indicator for Farmer */}
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
                className={`relative p-2 rounded-full bg-lime-400 text-black hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500 notification-button ${unreadFarmerCount > 0 ? 'animate-pulse' : ''}`}
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
                {unreadFarmerCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
                    {unreadFarmerCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden notification-panel">
                  <div className="p-4 bg-lime-400 text-black flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={refreshFarmerNotifications}
                        className="text-black hover:text-gray-700 text-sm font-semibold px-2 py-1 rounded hover:bg-lime-500 transition-colors"
                        title="Refresh notifications"
                      >
                        ↻ Refresh
                      </button>
                      {farmerNotifications.length > 0 && (
                        <button
                          onClick={handleClearAllNotifications}
                          className="text-black hover:text-gray-700 text-sm"
                          title="Clear all notifications"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto hide-scrollbar">
                    {farmerNotifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      farmerNotifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3 bg-lime-400 rounded-full p-1">
                              {notification.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-700" />
                              ) : notification.type === 'error' ? (
                                <X className="h-5 w-5 text-red-700" />
                              ) : notification.type === 'warning' ? (
                                <AlertTriangle className="h-5 w-5 text-yellow-700" />
                              ) : (
                                <Info className="h-5 w-5 text-blue-700" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium bg-lime-400 text-black px-2 py-1 rounded text-sm">{notification.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(notification.timestamp ? new Date(notification.timestamp) : new Date())}
                                  </span>
                                  <button
                                    onClick={async () => {
                                      if (!user?.id) return;
                                      
                                      // Check if it's a local notification or API notification
                                      const isLocalNotification = !isValidObjectId(notification.id);
                                      
                                      if (isLocalNotification) {
                                        // Remove from local notifications
                                        removeLocalNotification(notification.id);
                                      } else {
                                        // Delete from API
                                        try {
                                          await deleteNotificationMutation.mutateAsync({
                                            notificationId: notification.id,
                                            recipientType: 'farmer',
                                            recipientId: user.id
                                          });
                                          // Refetch to sync with API
                                          await refetchNotifications();
                                        } catch (error) {
                                          console.error('Error deleting notification:', error);
                                        }
                                      }
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
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
                className="flex items-center space-x-2 focus:outline-none"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-white text-lime-700 rounded-full flex items-center justify-center">
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
                      addLocalNotification({
                        type: 'info',
                        title: 'Help Center',
                        message: 'Help Center coming soon!',
                      });
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <HelpCircle size={16} className="mr-2" />
                    Help Center
                  </button>
                  <button
                    onClick={() => {
                      addLocalNotification({
                        type: 'success',
                        title: 'Test Notification',
                        message: 'This is a test notification to verify the system is working!',
                      });
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Bell size={16} className="mr-2" />
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
          <div className="p-4 bg-lime-700 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabSwitch("home")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "home" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Home size={20} className="mr-3" />
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleTabSwitch("claims")
                    // Show notification about claims
                    addLocalNotification({
                      type: 'info',
                      title: 'Claims Overview',
                      message: 'Viewing your insurance claims and their current status.',
                    });
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "claims" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText size={20} className="mr-3" />
                  My Claims
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleTabSwitch("assistance")
                    // Show notification about assistance
                    addLocalNotification({
                      type: 'info',
                      title: 'Government Assistance',
                      message: 'Browse available government assistance programs for your crop type.',
                    });
                  }}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "assistance" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Calendar size={20} className="mr-3" />
                  Government Assistance
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabSwitch("crop-insurance")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "crop-insurance" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Shield size={20} className="mr-3" />
                  Crop Insurance
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabSwitch("crop-prices")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "crop-prices" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <TrendingUp size={20} className="mr-3" />
                  Market Prices
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white shadow-md">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabSwitch("home")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "home" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Home size={20} className="mr-3" />
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabSwitch("claims")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "claims" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText size={20} className="mr-3" />
                  My Claims
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabSwitch("calendar")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "calendar" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Calendar size={20} className="mr-3" />
                  Calendar
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabSwitch("assistance")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "assistance" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText size={20} className="mr-3" />
                  Government Assistance
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabSwitch("crop-insurance")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "crop-insurance" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Shield size={20} className="mr-3" />
                  Crop Insurance
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabSwitch("crop-prices")}
                  className={`flex items-center w-full p-2 rounded-lg ${
                    activeTab === "crop-prices" ? "bg-lime-100 text-lime-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <TrendingUp size={20} className="mr-3" />
                  Market Prices
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 bg-white">
          {activeTab === "home" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Farm Information */}
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-lime-800">Farm Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Personal Information KPI */}
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-3 sm:p-4 border border-blue-200">
                      <div className="flex items-center mb-2 sm:mb-3">
                        <User size={18} className="text-blue-600 mr-2 sm:w-5 sm:h-5" />
                        <h3 className="text-sm sm:text-lg font-semibold text-blue-800">Personal Info</h3>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Name</span>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{user?.name || "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Contact</span>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{user?.phone || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location Information KPI */}
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-3 sm:p-4 border border-green-200">
                      <div className="flex items-center mb-2 sm:mb-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-sm sm:text-lg font-semibold text-green-800">Location</h3>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Address</span>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{user?.address || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Farm Details KPI */}
                    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-lg p-3 sm:p-4 border border-yellow-200">
                      <div className="flex items-center mb-2 sm:mb-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="text-sm sm:text-lg font-semibold text-yellow-800">Farm Details</h3>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Crop Type</span>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{displayedCropType}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Area</span>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{user?.cropArea ? `${user.cropArea} hectares` : "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Insurance Information KPI */}
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-3 sm:p-4 border border-purple-200">
                      <div className="flex items-center mb-2 sm:mb-3">
                        <FileText size={18} className="text-purple-600 mr-2 sm:w-5 sm:h-5" />
                        <h3 className="text-sm sm:text-lg font-semibold text-purple-800">Insurance</h3>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Insurance ID</span>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{user?.id || "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={12} className="mr-1" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Claim */}
                <div className="bg-lime-700 rounded-xl p-4 sm:p-6 text-white space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText size={20} className="sm:w-6 sm:h-6" />
                    <h2 className="text-base sm:text-lg font-bold">File a Disaster Insurance Claim</h2>
                  </div>
                  <p className="text-lime-100 text-sm sm:text-base">
                    If your crops have been damaged by natural disasters, file a claim to receive compensation.
                  </p>
                  <button
                    onClick={() => navigate("/farmer-form")}
                    className="w-full bg-white text-lime-800 font-bold py-2 sm:py-3 rounded-lg hover:bg-lime-100 transition text-sm sm:text-base"
                  >
                    File New Claim
                  </button>
                </div>

                {/* Latest Claim Status */}
                {claims.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-lime-800">Latest Claim Status</h2>
                    <ClaimStatusTracker
                      status={claims[0].status}
                      claimId={claims[0].claimNumber || claims[0]._id}
                      submittedDate={claims[0].date}
                      reviewDate={claims[0].reviewDate}
                      completionDate={claims[0].completionDate}
                      notes={claims[0].adminFeedback || "Your claim is being processed."}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Claims Status Donut Chart */}
                <div className="bg-white p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-lime-800">Claims Status Overview</h2>
                  {Array.isArray(claims) && claims.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <div className="w-48 h-48 sm:w-64 sm:h-64">
                        <Doughnut
                          data={generateClaimsChartData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  padding: 20,
                                  usePointStyle: true,
                                  font: {
                                    size: 12
                                  }
                                }
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset?.data?.reduce((a, b) => a + b, 0) || 1;
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                    return `${label}: ${value} (${percentage}%)`;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <span>Pending: {Array.isArray(claims) ? claims.filter(c => c?.status?.toLowerCase() === 'pending').length : 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                          <span>Approved: {Array.isArray(claims) ? claims.filter(c => c?.status?.toLowerCase() === 'approved').length : 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>Rejected: {Array.isArray(claims) ? claims.filter(c => c?.status?.toLowerCase() === 'rejected').length : 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Total Claims: {Array.isArray(claims) ? claims.length : 0}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-gray-500 text-center">No claims data available</p>
                    </div>
                  )}
                </div>

                {/* Weather Widget */}
                <WeatherWidget />

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-lime-800">Recent Notifications</h2>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Notification logic removed for brevity. Re-implement if needed. */}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "claims" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">My Claims</h2>
                <button
                  onClick={() => navigate("/farmer-form")}
                  className="bg-lime-700 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-lime-800 transition text-sm sm:text-base"
                >
                  File New Claim
                </button>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Claim ID
                        </th>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.length > 0 ? (
                      claims.map((claim) => (
                        <tr key={claim._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.claimNumber || claim._id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {claim.type || claim.damageType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(claim.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                claim.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : claim.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button onClick={() => openClaimDetails(claim)} className="text-lime-700 hover:text-lime-900">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <FileText className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-lg font-medium">No claims found</p>
                            <p className="text-sm">You haven't submitted any insurance claims yet.</p>
                            <button 
                              onClick={() => navigate("/farmer-form")}
                              className="mt-4 bg-lime-700 text-white px-4 py-2 rounded-lg hover:bg-lime-800 transition"
                            >
                              Submit Your First Claim
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Farming Calendar</h2>
                <button className="bg-lime-700 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-lime-800 transition text-sm sm:text-base">
                  Add Event
                </button>
              </div>

              {/* Calendar Navigation */}
              <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 rotate-90" />
                    </button>
                    <h3 className="text-lg sm:text-xl font-semibold">December 2024</h3>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 -rotate-90" />
                    </button>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-lime-100 text-lime-700 rounded-md">Month</button>
                    <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-md">Week</button>
                    <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-md">Day</button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-500 bg-gray-50 rounded-lg">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {/* Previous month days */}
                  {[26, 27, 28, 29, 30].map((day) => (
                    <div
                      key={`prev-${day}`}
                      className="p-2 sm:p-3 text-center text-xs sm:text-sm text-gray-400 hover:bg-gray-50 rounded-lg cursor-pointer min-h-[60px] sm:min-h-[80px]"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Current month days */}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const isToday = day === 15 // Assuming today is 15th
                    return (
                      <div
                        key={day}
                        className={`p-2 sm:p-3 text-center text-xs sm:text-sm hover:bg-gray-50 rounded-lg cursor-pointer min-h-[60px] sm:min-h-[80px] relative ${isToday ? "bg-lime-100 text-lime-700 font-semibold" : ""}`}
                      >
                        <span className={`${isToday ? "bg-lime-700 text-white px-2 py-1 rounded-full text-xs" : ""}`}>
                          {day}
                        </span>

                        {/* Events */}
                        {day === 5 && (
                          <div className="mt-1">
                            <div className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded mb-1 truncate">
                              Planting
                            </div>
                          </div>
                        )}
                        {day === 12 && (
                          <div className="mt-1">
                            <div className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded mb-1 truncate">
                              Fertilizer
                            </div>
                          </div>
                        )}
                        {day === 18 && (
                          <div className="mt-1">
                            <div className="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded mb-1 truncate">
                              Harvest
                            </div>
                          </div>
                        )}
                        {day === 25 && (
                          <div className="mt-1">
                            <div className="bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded mb-1 truncate">
                              Insurance Due
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Next month days */}
                  {[1, 2, 3, 4].map((day) => (
                    <div
                      key={`next-${day}`}
                      className="p-3 text-center text-sm text-gray-400 hover:bg-gray-50 rounded-lg cursor-pointer min-h-[80px]"
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Events</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-blue-800">Rice Planting Season</p>
                        <p className="text-sm text-blue-600">Dec 5, 2024 - Jan 15, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-yellow-800">Fertilizer Application</p>
                        <p className="text-sm text-yellow-600">Dec 12, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-green-800">Harvest Time</p>
                        <p className="text-sm text-green-600">Dec 18, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-red-800">Insurance Premium Due</p>
                        <p className="text-sm text-red-600">Dec 25, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Farming Tips</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-lime-50 rounded-lg border-l-4 border-lime-500">
                      <h4 className="font-medium text-lime-800">December Planting</h4>
                      <p className="text-sm text-lime-700 mt-1">
                        Best time to plant rice in your region. Ensure proper soil preparation and water management.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-medium text-blue-800">Weather Watch</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Monitor weather patterns closely. Heavy rains expected this week - ensure proper drainage.
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <h4 className="font-medium text-orange-800">Pest Control</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        December is peak season for certain pests. Regular monitoring and early intervention
                        recommended.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 border-2 border-dashed border-lime-300 rounded-lg hover:border-lime-500 hover:bg-lime-50 transition">
                    <Calendar className="h-8 w-8 text-lime-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-lime-700">Schedule Planting</p>
                  </button>
                  <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                    <AlertTriangle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-700">Set Reminder</p>
                  </button>
                  <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
                    <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-700">Add Farm Note</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "assistance" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Available Government Assistance</h2>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 font-medium">Error loading assistance data</p>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{error?.message || 'Unknown error'}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <p className="text-blue-700">Loading assistance data...</p>
                  </div>
                </div>
              )}

              {/* Available Government Assistance List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableAssistanceItems.length > 0 ? (
                  availableAssistanceItems.slice(indexOfFirstItem, indexOfLastItem).map((item, index) => {
                    const eligibility = checkEligibility(farmerForEligibility, item);
                    const canAvail = eligibility.eligible;
                    
                    return (
                      <div key={index} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{item.assistanceType}</h3>
                              <p className="text-sm text-gray-500">Crop Type: {item.cropType}</p>
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                              item.status === 'active' ? 'bg-lime-100 text-lime-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status === 'active' ? 'Available' : 'Out of Stock'}
                            </span>
                          </div>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Available Quantity:</span> {item.availableQuantity || 0}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Max per Farmer:</span> {item.maxQuantityPerFarmer || 100}kg
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Date Added:</span> {new Date(item.dateAdded).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Founder:</span> {item.founderName}
                            </p>
                                                          {item.requiresRSBSA && (
                                <p className="text-sm text-orange-600">
                                  <span className="font-medium">⚠️ RSBSA Registration Required</span>
                                </p>
                              )}
                              {/* Quarterly Limit Information */}
                              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-700">
                                  <span className="font-medium">📅 Quarterly Limit:</span> One application per quarter
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Current Quarter: {(() => {
                                    const now = new Date();
                                    return `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`;
                                  })()}
                                </p>
                                {eligibility.alreadyApplied && (
                                  <p className="text-xs text-red-600 mt-1">
                                    ⚠️ You've already applied this quarter. Next available: {(() => {
                                      const now = new Date();
                                      const nextQuarter = now.getMonth() >= 9 ? 1 : Math.floor(now.getMonth() / 3) + 2;
                                      const nextYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
                                      return `Q${nextQuarter}-${nextYear}`;
                                    })()}
                                  </p>
                                )}
                              </div>
                          </div>
                          <button
                            className={`w-full px-4 py-2 rounded-lg transition ${canAvail ? 'bg-lime-700 text-white hover:bg-lime-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            onClick={() => {
                              if (canAvail) {
                                setSelectedAssistance(item)
                                setShowAssistanceForm(true)
                              } else {
                                // Show notification for why they can't apply
                                let reason = '';
                                if (!eligibility.rsbsaEligible) {
                                  reason = 'RSBSA registration is required for this assistance.';
                                } else if (!eligibility.cropTypeMatch) {
                                  reason = `This assistance is only for ${item.cropType} farmers.`;
                                } else if (eligibility.alreadyApplied) {
                                  reason = 'You have already applied for this assistance this quarter.';
                                } else if (!eligibility.stockAvailable) {
                                  reason = 'This assistance is currently out of stock.';
                                } else if (!eligibility.certificationEligible) {
                                  reason = 'Certification is required for this assistance.';
                                } else {
                                  reason = 'You are not eligible for this assistance.';
                                }

                                addLocalNotification({
                                  type: 'warning',
                                  title: 'Application Not Available',
                                  message: reason,
                                });
                              }
                            }}
                            disabled={!canAvail}
                            title={
                              !eligibility.rsbsaEligible
                                ? 'RSBSA registration is required for this assistance.'
                                : !eligibility.cropTypeMatch
                                  ? `This assistance is only for ${item.cropType} farmers.`
                                  : eligibility.alreadyApplied
                                    ? 'You have already applied for this assistance this quarter.'
                                    : !eligibility.stockAvailable
                                      ? 'This assistance is currently out of stock.'
                                      : !eligibility.certificationEligible
                                        ? 'Certification is required for this assistance.'
                                    : ''
                            }
                          >
                            {canAvail ? 'Apply for Assistance' : 
                             !eligibility.rsbsaEligible ? 'RSBSA Required' : 
                             !eligibility.cropTypeMatch ? 'Crop Type Not Eligible' :
                             eligibility.alreadyApplied ? 'Already Applied This Quarter' :
                             !eligibility.stockAvailable ? 'Out of Stock' :
                             !eligibility.certificationEligible ? 'Certification Required' :
                             'Not Eligible'}
                          </button>
                        </div>
                        {item.photo && (
                          <div className="ml-0 md:ml-6 flex-shrink-0 flex items-center justify-center w-full md:w-32 h-32 mt-4 md:mt-0">
                            <img src={item.photo} alt="Assistance Logo" className="object-contain w-full h-full rounded-lg border" />
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No government assistance available for your region at the moment.</p>
                  </div>
                )}
              </div>

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

              {/* My Applications Section */}
              {farmerApplications.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">My Assistance Applications</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAllApplications(!showAllApplications)}
                        className="text-green-600 hover:text-green-800 px-3 sm:px-4 py-2 rounded-lg border border-green-600 hover:bg-green-50 text-sm sm:text-base"
                      >
                        {showAllApplications ? "Show Recent Applications" : "View All Applications"}
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assistance Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity Requested
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Applied
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          {showAllApplications && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Review Date
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admin Feedback
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(showAllApplications ? farmerApplications : farmerApplications.slice(0, 5)).map((application) => (
                          <tr key={application._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.assistanceId?.assistanceType || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.requestedQuantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(application.applicationDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  application.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : application.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : application.status === "distributed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {application.status}
                              </span>
                            </td>
                            {showAllApplications && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {application.reviewDate ? new Date(application.reviewDate).toLocaleDateString() : "-"}
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {application.officerNotes ? (
                                <div className="max-w-xs">
                                  <p className="text-gray-700">{application.officerNotes}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">No feedback yet</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Loading and Error States */}
              {loading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading assistance items...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>Error: {error?.message || 'Unknown error'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "crop-insurance" && (
            <div className="p-6">
              <FarmerCropInsurance />
            </div>
          )}

          {activeTab === "crop-prices" && (
            <div className="p-4 sm:p-6">
              <FarmerCropPrices />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" className="w-full p-2 border rounded-md" defaultValue="Juan Dela Cruz" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" className="w-full p-2 border rounded-md" defaultValue="juan@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" className="w-full p-2 border rounded-md" defaultValue="09123456789" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Notification Preferences</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-lime-600 mr-2" defaultChecked />
                      <span>Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-lime-600 mr-2" defaultChecked />
                      <span>SMS notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-lime-600 mr-2" defaultChecked />
                      <span>Weather alerts</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="bg-lime-700 text-white px-4 py-2 rounded-md hover:bg-lime-800">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Claim Details Modal */}
      {showClaimDetails && selectedClaim ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Claim Details</h2>
              <button
                onClick={() => setShowClaimDetails(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-lime-50 p-4 rounded-lg border border-lime-200">
                  <h3 className="text-lg font-semibold text-lime-800 mb-3 flex items-center gap-2">
                    <Info size={20} />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Claim ID</span>
                      <p className="font-medium">{selectedClaim?.id || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Type of Damage</span>
                      <p className="font-medium">{selectedClaim?.type || selectedClaim?.damageType || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Date Filed</span>
                      <p className="font-medium">{selectedClaim?.date ? new Date(selectedClaim.date).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Status</span>
                      <p
                        className={`font-medium ${
                          selectedClaim?.status === "approved"
                            ? "text-green-600"
                            : selectedClaim?.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {selectedClaim?.status ? selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Crop Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Crop Type</span>
                      <p className="font-medium">{selectedClaim?.crop || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Area Insured</span>
                      <p className="font-medium">{selectedClaim?.areaInsured ? `${selectedClaim.areaInsured} hectares` : "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Area Damaged</span>
                      <p className="font-medium">{selectedClaim?.areaDamaged ? `${selectedClaim.areaDamaged} hectares` : "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Degree of Damage</span>
                      <p className="font-medium">{selectedClaim?.degreeOfDamage ? `${selectedClaim.degreeOfDamage}%` : "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Damage Evidence Photos */}
              {selectedClaim?.damagePhotos && selectedClaim.damagePhotos.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    📷 Damage Evidence Photos ({selectedClaim.damagePhotos.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedClaim.damagePhotos.map((photo, index) => {
                      // Check if photo is a valid data URL
                      const isValidDataUrl = typeof photo === 'string' && photo.startsWith('data:');
                      
                      if (!isValidDataUrl) {
                        return (
                          <div key={index} className="relative group">
                            <div className="w-full h-32 bg-gray-200 rounded-lg border flex items-center justify-center">
                              <div className="text-center">
                                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Photo {index + 1}</p>
                                <p className="text-xs text-gray-400">Not available</p>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Damage evidence ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // Open photo in full screen modal
                              const modal = document.createElement('div');
                              modal.className = 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4';
                              modal.innerHTML = `
                                <div class="relative max-w-4xl max-h-full">
                                  <img src="${photo}" alt="Damage evidence ${index + 1}" class="max-w-full max-h-full object-contain" />
                                  <button class="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors" onclick="this.parentElement.parentElement.remove()">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                </div>
                              `;
                              document.body.appendChild(modal);
                              modal.addEventListener('click', (e) => {
                                if (e.target === modal) modal.remove();
                              });
                            }}
                          />
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            Photo {index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-orange-700 mt-3">
                    Click on any photo to view it in full size
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Claim Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-lime-100 p-2 rounded-full">
                      <FileText size={16} className="text-lime-700" />
                    </div>
                    <div>
                      <p className="font-medium">Claim Submitted</p>
                      <p className="text-sm text-gray-500">{selectedClaim?.date ? new Date(selectedClaim.date).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>

                  {selectedClaim?.reviewDate && (
                    <div className="flex items-start gap-3">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <AlertTriangle size={16} className="text-yellow-700" />
                      </div>
                      <div>
                        <p className="font-medium">Under Review</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedClaim.reviewDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedClaim?.completionDate && (
                    <div className="flex items-start gap-3">
                      <div
                        className={`${selectedClaim?.status === "approved" ? "bg-green-100" : "bg-red-100"} p-2 rounded-full`}
                      >
                        {selectedClaim?.status === "approved" ? (
                          <CheckCircle size={16} className="text-green-700" />
                        ) : (
                          <X size={16} className="text-red-700" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{selectedClaim?.status === "approved" ? "Approved" : "Rejected"}</p>
                        <p className="text-sm text-gray-500">
                          {selectedClaim?.completionDate ? new Date(selectedClaim.completionDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedClaim?.status === "approved" && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Insurance Compensation Details</h3>
                  
                  {/* Compensation Calculation */}
                  {(() => {
                    const compensation = calculateCompensation(
                      Number.parseFloat(selectedClaim?.areaDamaged || 0),
                      Number.parseFloat(selectedClaim?.degreeOfDamage || 0),
                      selectedClaim?.crop || 'Other',
                      selectedClaim?.damageType || 'Other'
                    );
                    
                    const paymentStatus = getPaymentStatus(selectedClaim?.completionDate);
                    const damageSeverity = getDamageSeverity(Number.parseFloat(selectedClaim?.degreeOfDamage || 0));
                    const coverageDetails = getCoverageDetails(selectedClaim?.crop || 'Other');
                    
                    return (
                      <div className="space-y-4">
                        {/* Final Compensation Amount */}
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-gray-500 text-sm">Final Compensation</span>
                              <p className="font-bold text-2xl text-green-700">
                                ₱{compensation.finalCompensation.toLocaleString()}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.bgColor} ${paymentStatus.statusColor}`}>
                              {paymentStatus.status}
                            </div>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Payment Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-gray-500 text-sm">Payment Status</span>
                              <p className={`font-medium ${paymentStatus.statusColor}`}>{paymentStatus.status}</p>
                              <p className="text-xs text-gray-500 mt-1">{paymentStatus.message}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">Expected Payment Date</span>
                              <p className="font-medium">{getExpectedPaymentDate(selectedClaim?.completionDate)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Damage Assessment */}
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Damage Assessment</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-gray-500 text-sm">Damage Severity</span>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${damageSeverity.bgColor} ${damageSeverity.color}`}>
                                {damageSeverity.level}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{damageSeverity.description}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">Coverage Type</span>
                              <p className="font-medium">{coverageDetails.coverage}</p>
                              <p className="text-xs text-gray-500 mt-1">Base Rate: ₱{coverageDetails.rate.toLocaleString()}/hectare</p>
                            </div>
                          </div>
                        </div>

                        {/* Calculation Breakdown */}
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Calculation Breakdown</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Area Damaged:</span>
                              <span className="font-medium">{selectedClaim?.areaDamaged || 0} hectares</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Degree of Damage:</span>
                              <span className="font-medium">{selectedClaim?.degreeOfDamage || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Crop Type:</span>
                              <span className="font-medium">{selectedClaim?.crop || 'Other'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Damage Type:</span>
                              <span className="font-medium">{selectedClaim?.damageType || 'Other'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Base Rate:</span>
                              <span className="font-medium">₱{compensation.cropRate.toLocaleString()}/hectare</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Damage Multiplier:</span>
                              <span className="font-medium">{compensation.damageMultiplier}x</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Base Calculation:</span>
                              <span className="font-medium">₱{compensation.baseCompensation.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span className="text-green-700">Final Compensation:</span>
                              <span className="text-green-700">₱{compensation.finalCompensation.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Insurance Terms */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">Insurance Terms</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Minimum compensation: ₱1,000</li>
                            <li>• Maximum compensation: ₱20,000</li>
                            <li>• Processing time: 3-7 business days</li>
                            <li>• Payment method: Bank transfer or check</li>
                            <li>• Coverage period: From planting to harvest</li>
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowClaimDetails(false)}
                  className="bg-lime-700 text-white px-6 py-2 rounded-lg hover:bg-lime-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Assistance Request Form Modal */}
      {showAssistanceForm && selectedAssistance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Request Assistance</h2>
              <button
                onClick={() => setShowAssistanceForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAssistanceSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={user?.name || ""}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      value={user?.address || ""}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                    <input
                      type="text"
                      value={displayedCropType}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                    />
                    {insuredCropTypes.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Based on your active crop insurance records
                      </p>
                    )}
                    {(!insuredCropTypes.length && !user?.cropType) && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ No crop type found. Please ensure you have active crop insurance.
                      </p>
                    )}
                    {(!insuredCropTypes.length && user?.cropType) && (
                      <p className="text-xs text-blue-600 mt-1">
                        ℹ️ Using crop type from farmer profile. Consider adding crop insurance for better assistance eligibility.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Area</label>
                    <input
                      type="text"
                      value={user?.cropArea ? `${user.cropArea} hectares` : ""}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>
                
                {/* Crop Type Eligibility Check */}
                {selectedAssistance && (
                  <div className="mt-4 p-3 rounded-lg border">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Eligibility Check</h4>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const eligibility = checkEligibility(farmerForEligibility, selectedAssistance);
                        return (
                          <>
                            <div className={`w-3 h-3 rounded-full ${
                              eligibility.cropTypeMatch ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`text-sm ${
                              eligibility.cropTypeMatch ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {eligibility.cropTypeMatch 
                                ? `✓ Crop type matches (${selectedAssistance.cropType})`
                                : `✗ Crop type mismatch - Assistance is for ${selectedAssistance.cropType} farmers`
                              }
                            </span>
                          </>
                        );
                      })()} 
                    </div>
                  </div>
                )}
              </div>

              {/* Assistance Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assistance Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assistance Type</label>
                    <input
                      type="text"
                      value={selectedAssistance.assistanceType}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Available Quantity</label>
                    <input
                      type="text"
                      value={selectedAssistance.availableQuantity || 0}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity Requested (kg)</label>
                    <input
                      type="number"
                      name="requestedQuantity"
                      value={assistanceForm.requestedQuantity}
                      onChange={handleAssistanceFormChange}
                      min="1"
                      max={selectedAssistance.maxQuantityPerFarmer || 100}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lime-500 focus:border-lime-500"
                      placeholder="Enter quantity in kg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Maximum: {selectedAssistance.maxQuantityPerFarmer || 100}kg per farmer
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      📅 Quarterly Limit: One application per quarter (Current: {(() => {
                        const now = new Date();
                        return `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`;
                      })()})
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
                <textarea
                  name="notes"
                  value={assistanceForm.notes}
                  onChange={handleAssistanceFormChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-lime-500 focus:border-lime-500"
                  rows={3}
                  placeholder="Any additional notes or special requirements (optional)"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAssistanceForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedAssistance && !checkEligibility(farmerForEligibility, selectedAssistance).eligible}
                  className={`px-4 py-2 rounded transition ${
                    selectedAssistance && !checkEligibility(farmerForEligibility, selectedAssistance).eligible
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-lime-700 text-white hover:bg-lime-800'
                  }`}
                >
                  {selectedAssistance && !checkEligibility(farmerForEligibility, selectedAssistance).eligible
                    ? 'Not Eligible'
                    : 'Submit Request'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Loading Overlays */}
      <LoadingOverlay isVisible={isInitialLoading || isTabLoading} />
    </div>
  )
}

export default FarmerDashboard
