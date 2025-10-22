"use client"
import { useState, useEffect } from "react"
import {
  FileText,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Camera,
  BarChart3,
  PieChart,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Import custom KPI icons
import claimsIcon from '../assets/Images/claims.png'
import approveIcon from '../assets/Images/approve.png'
import rejectedIcon from '../assets/Images/rejected.png'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { calculateCompensation, getPaymentStatus, getExpectedPaymentDate, getDamageSeverity, getCoverageDetails } from "../utils/insuranceUtils"
import { generateClaimPDF } from "../utils/claimPdfGenerator"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const InsuranceClaims = ({
  claims = [],
  searchQuery = "",
  setSearchQuery = () => {},
  claimsTabView = "pending",
  setClaimsTabView = () => {},
  showClaimDetails = false,
  setShowClaimDetails = () => {},
  selectedClaim = null,
  showConfirmationModal = false,
  setShowConfirmationModal = () => {},
  confirmationAction = {},
  openClaimDetails = () => {},
  initiateStatusUpdate = () => {},
  confirmStatusUpdate = () => {},
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  // Handler for downloading claim PDF
  const handleDownloadPDF = (claim) => {
    try {
      // Find farmer data from claim if available
      const farmerData = claim.farmerId ? {
        firstName: claim.farmerId.firstName,
        middleName: claim.farmerId.middleName,
        lastName: claim.farmerId.lastName,
        address: claim.farmerId.address,
        contactNum: claim.farmerId.contactNum,
        cropArea: claim.farmerId.cropArea,
        lotNumber: claim.farmerId.lotNumber,
        periodFrom: claim.farmerId.periodFrom,
        periodTo: claim.farmerId.periodTo,
        agency: claim.farmerId.agency,
      } : null
      
      generateClaimPDF(claim, farmerData)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  // Defensive: if claims is undefined or not an array, fallback to empty array
  if (!Array.isArray(claims) || claims.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 italic text-lg">No claims found.</div>
    )
  }

  // Re-enable search filter for claims
  const filteredClaims = claims.filter((claim) => {
    const matchesStatus = claimsTabView === "all" ? true : (claim.status && claim.status.toLowerCase() === claimsTabView);
    const matchesSearch =
      (claim.name && claim.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (claim.crop && claim.crop.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && (searchQuery.trim() === '' || matchesSearch);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClaims = filteredClaims.slice(startIndex, endIndex)

  // Reset to first page when search query or tab view changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, claimsTabView])

  return (
    <div className="mt-6">
      {/* Outside Title */}
      <div className="flex items-center mb-4">
        <FileText size={24} className="text-lime-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Insurance Claims</h1>
      </div>

      {/* Claims Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Pending Claims KPI Card */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Pending Claims</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {claims && Array.isArray(claims) ? claims.filter(claim => claim && claim.status === "pending").length : 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {claims && Array.isArray(claims) && claims.length > 0 ? ((claims.filter(claim => claim && claim.status === "pending").length / claims.length) * 100).toFixed(1) : "0.0"}% of total
              </p>
            </div>
            <div className="ml-4">
              <img src={claimsIcon} alt="Pending Claims" className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Approved Claims KPI Card */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Approved Claims</p>
              <h3 className="text-2xl font-bold text-green-600">
                {claims && Array.isArray(claims) ? claims.filter(claim => claim && claim.status === "approved").length : 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {claims && Array.isArray(claims) && claims.length > 0 ? ((claims.filter(claim => claim && claim.status === "approved").length / claims.length) * 100).toFixed(1) : "0.0"}% of total
              </p>
            </div>
            <div className="ml-4">
              <img src={approveIcon} alt="Approved Claims" className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Rejected Claims KPI Card */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Rejected Claims</p>
              <h3 className="text-2xl font-bold text-red-600">
                {claims && Array.isArray(claims) ? claims.filter(claim => claim && claim.status === "rejected").length : 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {claims && Array.isArray(claims) && claims.length > 0 ? ((claims.filter(claim => claim && claim.status === "rejected").length / claims.length) * 100).toFixed(1) : "0.0"}% of total
              </p>
            </div>
            <div className="ml-4">
              <img src={rejectedIcon} alt="Rejected Claims" className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Status Comparison Over Time and Claims Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Comparison Over Time - Grouped Bar Chart */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-4">
            <BarChart3 size={20} className="text-emerald-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Status Comparison Over Time</h3>
          </div>
          <div className="h-[400px]">
            <Bar
              data={(() => {
                if (!claims || !Array.isArray(claims)) {
                  return {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                      { label: 'Pending', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: 'rgba(251, 191, 36, 0.8)' },
                      { label: 'Approved', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: 'rgba(34, 197, 94, 0.8)' },
                      { label: 'Rejected', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: 'rgba(239, 68, 68, 0.8)' }
                    ]
                  };
                }
                
                // Generate monthly data for the current year
                const currentYear = new Date().getFullYear();
                const monthNames = [
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
                
                const monthlyData = monthNames.map((month, index) => {
                  const monthClaims = claims.filter(claim => {
                    if (!claim || !claim.date) return false;
                    const claimDate = new Date(claim.date);
                    return claimDate.getFullYear() === currentYear && claimDate.getMonth() === index;
                  });
                  
                  return {
                    month: month,
                    pending: monthClaims.filter(claim => claim && claim.status === 'pending').length,
                    approved: monthClaims.filter(claim => claim && claim.status === 'approved').length,
                    rejected: monthClaims.filter(claim => claim && claim.status === 'rejected').length
                  };
                });
                
                return {
                  labels: monthlyData.map(d => d.month),
                  datasets: [
                    {
                      label: 'Pending',
                      data: monthlyData.map(d => d.pending),
                      backgroundColor: 'rgba(251, 191, 36, 0.8)',
                      borderColor: 'rgba(251, 191, 36, 1)',
                      borderWidth: 1,
                    },
                    {
                      label: 'Approved',
                      data: monthlyData.map(d => d.approved),
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgba(34, 197, 94, 1)',
                      borderWidth: 1,
                    },
                    {
                      label: 'Rejected',
                      data: monthlyData.map(d => d.rejected),
                      backgroundColor: 'rgba(239, 68, 68, 0.8)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      borderWidth: 1,
                    }
                  ]
                };
              })()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                      pointStyle: 'rect',
                      padding: 20,
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
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value} claims`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Month',
                      font: {
                        size: 14,
                        weight: 'bold'
                      }
                    },
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Number of Claims',
                      font: {
                        size: 14,
                        weight: 'bold'
                      }
                    },
                    beginAtZero: true,
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Claims Distribution Donut Chart */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-4">
            <PieChart size={20} className="text-emerald-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Claims Distribution</h3>
          </div>
          <div className="relative" style={{ height: "400px" }}>
            <Doughnut
              data={{
                labels: ['Pending', 'Approved', 'Rejected'],
                datasets: [
                  {
                    data: [
                      claims && Array.isArray(claims) ? claims.filter(claim => claim && claim.status === "pending").length : 0,
                      claims && Array.isArray(claims) ? claims.filter(claim => claim && claim.status === "approved").length : 0,
                      claims && Array.isArray(claims) ? claims.filter(claim => claim && claim.status === "rejected").length : 0
                    ],
                    backgroundColor: [
                      'rgba(251, 191, 36, 0.8)',  // yellow
                      'rgba(34, 197, 94, 0.8)',   // green
                      'rgba(239, 68, 68, 0.8)',   // red
                    ],
                    borderColor: [
                      'rgba(251, 191, 36, 1)',
                      'rgba(34, 197, 94, 1)',
                      'rgba(239, 68, 68, 1)',
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                      font: {
                        size: 11
                      },
                      color: '#1e40af'
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                },
                cutout: '70%',
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
              <div className="text-3xl font-bold text-gray-800">{claims.length}</div>
              <div className="text-sm text-gray-600 font-medium">Total Claims</div>
            </div>
          </div>
        </div>
      </div>



      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setClaimsTabView("pending")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                claimsTabView === "pending" ? "bg-lime-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Pending Claims
            </button>
            <button
              onClick={() => setClaimsTabView("approved")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors border-2 ${
                claimsTabView === "approved" ? "border-lime-600 text-lime-600" : "border-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              Approved Claims
            </button>
            <button
              onClick={() => setClaimsTabView("rejected")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors border-2 ${
                claimsTabView === "rejected" ? "border-lime-600 text-lime-600" : "border-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              Rejected Claims
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filter and Search */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-medium">
            {claimsTabView === "pending" && "Pending Claims"}
            {claimsTabView === "approved" && "Approved Claims"}
            {claimsTabView === "rejected" && "Rejected Claims"}
          </h3>

          {/* Search Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>
        </div>

        {/* Claims Table */}
        {paginatedClaims.length === 0 ? (
          <div className="text-center py-10">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 italic">No claims available matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="p-3 bg-gray-50 rounded-l-lg font-semibold text-gray-600">Claim ID</th>
                  <th className="p-3 bg-gray-50 font-semibold text-gray-600">Farmer Name</th>
                  <th className="p-3 bg-gray-50 font-semibold text-gray-600">Crop Type</th>
                  <th className="p-3 bg-gray-50 font-semibold text-gray-600">Date</th>
                  <th className="p-3 bg-gray-50 font-semibold text-gray-600">Status</th>
                  <th className="p-3 bg-gray-50 rounded-r-lg font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClaims
                  .sort((a, b) => {
                    // First sort by date (newest first)
                    const dateComparison = new Date(b.date) - new Date(a.date)

                    // If dates are the same, sort by damage amount
                    if (dateComparison === 0) {
                      const damageA = Number.parseFloat(a.degreeOfDamage) || Number.parseFloat(a.areaDamaged) || 0
                      const damageB = Number.parseFloat(b.degreeOfDamage) || Number.parseFloat(a.areaDamaged) || 0
                      return damageB - damageA
                    }

                    return dateComparison
                  })
                  .map((claim) => (
                    <tr key={claim._id} className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-200 font-medium">{claim.claimNumber || claim._id}</td>
                      <td className="p-3 border-b border-gray-200">{claim.name}</td>
                      <td className="p-3 border-b border-gray-200">{claim.crop || claim.cropType || "Unknown"}</td>
                      <td className="p-3 border-b border-gray-200">{new Date(claim.date).toLocaleDateString()}</td>
                      <td className="p-3 border-b border-gray-200 capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center
                          ${
                            claim.status === "approved"
                              ? "bg-green-100 text-lime-800"
                              : claim.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {claim.status === "approved" && <CheckCircle size={12} className="mr-1" />}
                          {claim.status === "pending" && <AlertTriangle size={12} className="mr-1" />}
                          {claim.status === "rejected" && <XCircle size={12} className="mr-1" />}
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 border-b border-gray-200 space-x-2">
                        <button
                          onClick={() => openClaimDetails(claim)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(claim)}
                          className="bg-lime-600 text-white px-3 py-1 rounded hover:bg-lime-700 text-sm inline-flex items-center"
                          title="Download Claim Form PDF"
                        >
                          <Download size={14} className="mr-1" />
                          PDF
                        </button>
                        {claim.status === "pending" && (
                          <>
                            <button
                              onClick={() => initiateStatusUpdate(claim._id, "approved", claim.farmerId)}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm inline-flex items-center"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => initiateStatusUpdate(claim._id, "rejected", claim.farmerId)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm inline-flex items-center"
                            >
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredClaims.length)}</span> of{' '}
                  <span className="font-medium">{filteredClaims.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-lime-50 border-lime-500 text-lime-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Claim Details Modal */}
      {showClaimDetails && selectedClaim && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Claim Details</h2>
              <button
                onClick={() => setShowClaimDetails(false)}
                className="text-white hover:text-gray-200 focus:outline-none transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-lime-800 mb-3 flex items-center gap-2">
                    <User size={20} />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Claim ID</span>
                      <p className="font-medium">{selectedClaim.claimNumber || selectedClaim._id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Farmer Name</span>
                      <p className="font-medium">{selectedClaim.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Address</span>
                      <p className="font-medium">{selectedClaim.address || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Phone</span>
                      <p className="font-medium">{selectedClaim.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Date Filed</span>
                      <p className="font-medium">{new Date(selectedClaim.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Status</span>
                      <p
                        className={`font-medium ${
                          selectedClaim.status === "approved"
                            ? "text-green-600"
                            : selectedClaim.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Crop Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Crop Type</span>
                      <p className="font-medium">{selectedClaim.crop}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Area Insured</span>
                      <p className="font-medium">{selectedClaim.areaInsured} hectares</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Area Damaged</span>
                      <p className="font-medium">{selectedClaim.areaDamaged} hectares</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Degree of Damage</span>
                      <p className="font-medium">{selectedClaim.degreeOfDamage}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Program</span>
                      <p className="font-medium">
                        {selectedClaim.program && selectedClaim.program.length > 0
                          ? selectedClaim.program.join(", ")
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <h3 className="text-lg font-semibold text-lime-800 mb-3">Additional Crop Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Variety Planted</span>
                    <p className="font-medium">{selectedClaim.varietyPlanted || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Planting Date</span>
                    <p className="font-medium">
                      {selectedClaim.plantingDate
                        ? new Date(selectedClaim.plantingDate).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">CIC Number</span>
                    <p className="font-medium">{selectedClaim.cicNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Underwriter</span>
                    <p className="font-medium">{selectedClaim.underwriter || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Farmer Location</span>
                    <p className="font-medium">{selectedClaim.farmerLocation || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Damage Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Cause of Loss</span>
                    <p className="font-medium">{selectedClaim.damageType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Date of Loss</span>
                    <p className="font-medium">
                      {selectedClaim.lossDate ? new Date(selectedClaim.lossDate).toLocaleDateString() : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Age/Stage at Time of Loss</span>
                    <p className="font-medium">{selectedClaim.ageStage || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Expected Harvest</span>
                    <p className="font-medium">
                      {selectedClaim.expectedHarvest ? `${selectedClaim.expectedHarvest} tons` : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Damage Evidence Photos */}
              {selectedClaim.damagePhotos && selectedClaim.damagePhotos.length > 0 && (
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

              {selectedClaim.adminFeedback && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Eye size={20} />
                    Admin Feedback
                  </h3>
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <p className="text-gray-700">{selectedClaim.adminFeedback}</p>
                  </div>
                </div>
              )}

              {selectedClaim.lotBoundaries && Object.keys(selectedClaim.lotBoundaries).length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Location Sketch Information</h3>
                  <div className="space-y-4">
                    {Object.keys(selectedClaim.lotBoundaries).map((lot) => (
                      <div key={lot} className="border border-blue-100 p-3 rounded bg-white">
                        <h4 className="font-medium text-blue-700 mb-2">Lot {lot}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500 text-xs">North</span>
                            <p className="text-sm">{selectedClaim.lotBoundaries[lot].north || "Not specified"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">South</span>
                            <p className="text-sm">{selectedClaim.lotBoundaries[lot].south || "Not specified"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">East</span>
                            <p className="text-sm">{selectedClaim.lotBoundaries[lot].east || "Not specified"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">West</span>
                            <p className="text-sm">{selectedClaim.lotBoundaries[lot].west || "Not specified"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClaim.status === "pending" && (
                <>
                  {/* Compensation Preview for Pending Claims */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      💰 Compensation Preview
                    </h3>
                    {(() => {
                      const compensation = calculateCompensation(
                        Number.parseFloat(selectedClaim?.areaDamaged || 0),
                        Number.parseFloat(selectedClaim?.degreeOfDamage || 0),
                        selectedClaim?.crop || 'Other',
                        selectedClaim?.damageType || 'Other'
                      );
                      
                      const damageSeverity = getDamageSeverity(Number.parseFloat(selectedClaim?.degreeOfDamage || 0));
                      const coverageDetails = getCoverageDetails(selectedClaim?.crop || 'Other');
                      
                      return (
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg border border-yellow-200">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">Estimated Compensation:</span>
                              <span className="text-2xl font-bold text-green-700">
                                ₱{compensation.finalCompensation.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-yellow-200">
                              <span className="text-gray-500 text-sm">Damage Severity</span>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${damageSeverity.bgColor} ${damageSeverity.color}`}>
                                {damageSeverity.level}
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-yellow-200">
                              <span className="text-gray-500 text-sm">Coverage Type</span>
                              <p className="font-medium text-sm">{coverageDetails.coverage}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => initiateStatusUpdate(selectedClaim._id, "rejected", selectedClaim.farmerId)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
                    >
                      <XCircle size={18} className="mr-2" />
                      Reject Claim
                    </button>
                    <button
                      onClick={() => initiateStatusUpdate(selectedClaim._id, "approved", selectedClaim.farmerId)}
                      className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition flex items-center"
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Approve Claim
                    </button>
                  </div>
                </>
              )}

              {/* Compensation Details for Approved Claims */}
              {selectedClaim.status === "approved" && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Insurance Compensation Details</h3>
                  {(() => {
                    const compensation = calculateCompensation(
                      Number.parseFloat(selectedClaim?.areaDamaged || 0),
                      Number.parseFloat(selectedClaim?.degreeOfDamage || 0),
                      selectedClaim?.crop || 'Other',
                      selectedClaim?.damageType || 'Other'
                    );
                    
                    const paymentStatus = getPaymentStatus(selectedClaim?.completionDate);
                    
                    return (
                      <div className="space-y-4">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <span className="text-gray-500 text-sm">Payment Status</span>
                            <p className={`font-medium ${paymentStatus.statusColor}`}>{paymentStatus.status}</p>
                            <p className="text-xs text-gray-500 mt-1">{paymentStatus.message}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <span className="text-gray-500 text-sm">Expected Payment Date</span>
                            <p className="font-medium">{getExpectedPaymentDate(selectedClaim?.completionDate)}</p>
                          </div>
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
      )}

      {/* Confirmation Modal for Claim Status Update */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {confirmationAction.type === "approved" ? "Approve Claim" : "Reject Claim"}
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to {confirmationAction.type === "approved" ? "approve" : "reject"} this claim? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  confirmationAction.type === "approved"
                    ? "bg-lime-600 hover:bg-lime-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmationAction.type === "approved" ? "Yes, Approve" : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InsuranceClaims
