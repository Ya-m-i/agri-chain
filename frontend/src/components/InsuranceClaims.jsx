"use client"
import { useState, useEffect, useRef } from "react"
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
  Layers,
  BarChart3,
  PieChart,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Image icons removed - no longer used in this component
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { generateClaimPDF } from "../utils/claimPdfGenerator"
import { generateCashAssistanceReportPDF } from "../utils/cashAssistanceReportPdfGenerator"
import { toast } from 'react-hot-toast'

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
  
  // Report state
  const [showReport, setShowReport] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  
  // Chart refs for PDF generation
  const barChartRef = useRef(null)
  const doughnutChartRef = useRef(null)
  
  // Reset to first page when search query or tab view changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, claimsTabView])
  
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
      
      await generateCashAssistanceReportPDF({
        claims,
        chartRefs: {
          barChartRef,
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

  return (
    <div className="mt-6">
      {/* Outside Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText size={24} className="text-lime-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Insurance Claims</h1>
        </div>
        <button
          className="bg-lime-400 text-black px-4 py-2 rounded-lg hover:bg-lime-500 transition-colors flex items-center justify-center shadow-sm font-semibold"
          onClick={() => setShowReport(!showReport)}
        >
          <Download className="mr-2 h-5 w-5" />
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

      {/* Charts Section - Only show when report is generated */}
      {showReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Comparison Over Time - Grouped Bar Chart */}
          <div className="p-6 border-2 border-black rounded-lg">
            <div className="flex items-center mb-4">
              <BarChart3 size={20} className="text-black mr-2" />
              <h3 className="text-lg font-semibold text-black">Status Comparison Over Time</h3>
            </div>
            <div className="h-[400px]" ref={barChartRef}>
              <Bar
                data={(() => {
                  // Generate monthly data for the current year
                  const currentYear = new Date().getFullYear();
                  const monthNames = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ];
                  
                  const monthlyData = monthNames.map((month, index) => {
                    const monthClaims = claims.filter(claim => {
                      const claimDate = new Date(claim.date);
                      return claimDate.getFullYear() === currentYear && claimDate.getMonth() === index;
                    });
                    
                    return {
                      month: month,
                      pending: monthClaims.filter(claim => claim.status === 'pending').length,
                      approved: monthClaims.filter(claim => claim.status === 'approved').length,
                      rejected: monthClaims.filter(claim => claim.status === 'rejected').length
                    };
                  });
                  
                  return {
                    labels: monthlyData.map(d => d.month),
                    datasets: [
                      {
                        label: 'Pending',
                        data: monthlyData.map(d => d.pending),
                        backgroundColor: '#bef264',
                        borderColor: '#000000',
                        borderWidth: 2,
                      },
                      {
                        label: 'Approved',
                        data: monthlyData.map(d => d.approved),
                        backgroundColor: '#84cc16',
                        borderColor: '#000000',
                        borderWidth: 2,
                      },
                      {
                        label: 'Rejected',
                        data: monthlyData.map(d => d.rejected),
                        backgroundColor: '#65a30d',
                        borderColor: '#000000',
                        borderWidth: 2,
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
                          size: 12,
                          color: '#000000'
                        },
                        color: '#000000'
                      }
                    },
                    tooltip: {
                      backgroundColor: '#ffffff',
                      titleColor: '#000000',
                      bodyColor: '#000000',
                      borderColor: '#000000',
                      borderWidth: 2,
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
                        color: '#000000',
                        font: {
                          size: 14,
                          weight: 'bold'
                        }
                      },
                      ticks: {
                        color: '#000000'
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Number of Claims',
                        color: '#000000',
                        font: {
                          size: 14,
                          weight: 'bold'
                        }
                      },
                      ticks: {
                        color: '#000000'
                      },
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Claims Distribution Donut Chart */}
          <div className="p-6 border-2 border-black rounded-lg">
            <div className="flex items-center mb-4">
              <PieChart size={20} className="text-black mr-2" />
              <h3 className="text-lg font-semibold text-black">Claims Distribution</h3>
            </div>
            <div className="relative" style={{ height: "400px" }} ref={doughnutChartRef}>
              <Doughnut
                data={{
                  labels: ['Pending', 'Approved', 'Rejected'],
                  datasets: [
                    {
                      data: [
                        claims.filter(claim => claim.status === "pending").length,
                        claims.filter(claim => claim.status === "approved").length,
                        claims.filter(claim => claim.status === "rejected").length
                      ],
                      backgroundColor: [
                        '#bef264',  // light lime
                        '#84cc16',  // neon lime
                        '#65a30d',  // dark lime
                      ],
                      borderColor: [
                        '#000000',
                        '#000000',
                        '#000000',
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
                          size: 11,
                          color: '#000000'
                        },
                        color: '#000000'
                      }
                    },
                    tooltip: {
                      backgroundColor: '#ffffff',
                      titleColor: '#000000',
                      bodyColor: '#000000',
                      borderColor: '#000000',
                      borderWidth: 2,
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
                <div className="text-3xl font-bold text-black">{claims.length}</div>
                <div className="text-sm text-black font-medium">Total Claims</div>
              </div>
            </div>
          </div>
        </div>
      )}



      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setClaimsTabView("pending")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                claimsTabView === "pending" ? "bg-black text-lime-400" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Pending Claims
            </button>
            <button
              onClick={() => setClaimsTabView("approved")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                claimsTabView === "approved" ? "bg-black text-lime-400" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Approved Claims
            </button>
            <button
              onClick={() => setClaimsTabView("rejected")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                claimsTabView === "rejected" ? "bg-black text-lime-400" : "text-gray-600 hover:bg-gray-100"
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
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border-2 border-lime-200">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 rounded-tl-lg font-semibold text-gray-700">Claim ID</th>
                  <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 font-semibold text-gray-700">Farmer Name</th>
                  <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 font-semibold text-gray-700">Crop Type</th>
                  <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 font-semibold text-gray-700">Date</th>
                  <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 font-semibold text-gray-700">Status</th>
                  <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 rounded-tr-lg font-semibold text-gray-700">Actions</th>
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
                          className="px-3 py-1.5 text-lime-600 hover:text-lime-700 font-semibold rounded-lg hover:bg-lime-50 transition-colors border-2 border-lime-200 hover:border-lime-300 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(claim)}
                          className="px-3 py-1.5 bg-lime-600 text-white rounded-lg hover:bg-lime-700 text-sm inline-flex items-center font-semibold border-2 border-lime-700 transition-colors shadow-sm"
                          title="Download Claim Form PDF"
                        >
                          <Download size={14} className="mr-1" />
                          PDF
                        </button>
                        {claim.status === "pending" && (
                          <>
                            <button
                              onClick={() => initiateStatusUpdate(claim._id, "approved", claim.farmerId)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm inline-flex items-center font-semibold border-2 border-green-700 transition-colors shadow-sm"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => initiateStatusUpdate(claim._id, "rejected", claim.farmerId)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm inline-flex items-center font-semibold border-2 border-red-700 transition-colors shadow-sm"
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

        {/* Scrollable Pagination - Hidden Scrollbar */}
        {totalPages > 1 && (
          <div className="mt-6 bg-white rounded-xl shadow-md border-2 border-lime-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-700 font-medium">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredClaims.length)} of {filteredClaims.length} results
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
      </div>

      {/* Claim Details Modal - PCIC CLAIM FOR INDEMNITY form template (matches official form) */}
      {showClaimDetails && selectedClaim && (() => {
        const c = selectedClaim
        const isPalay = /palay|rice/i.test(c.crop || '')
        const isCorn = /corn|maize/i.test(c.crop || '')
        const programList = c.program && Array.isArray(c.program) ? c.program : []
        const programLabels = ['Regular', 'Sikat Sal', 'RSBSA', 'APCP-CAP-PBD', 'Punla', 'Cooperative Rice Farm']
        // RSBSA: treat stored "RSBA" (typo from farmer form) as RSBSA so checkbox shows checked
        const isProgramChecked = (label) => {
          const norm = (s) => String(s).toLowerCase().replace(/\s/g, '')
          if (label === 'RSBSA') {
            return programList.some(p => { const n = norm(p); return n === 'rsbsa' || n === 'rsba' })
          }
          return programList.some(p => norm(p).includes(norm(label)))
        }
        return (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-black">
            <div className="sticky top-0 bg-white border-b-2 border-black p-4 flex justify-between items-center z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Claim No. {c.claimNumber || c._id}</span>
                <span className="text-xs font-semibold text-gray-700 uppercase">({c.status})</span>
              </div>
              <button
                onClick={() => setShowClaimDetails(false)}
                className="text-black hover:bg-gray-100 rounded-full p-1 focus:outline-none transition-all"
                aria-label="Close"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 bg-white text-black">
              {/* Header - same as image */}
              <div className="text-center mb-6">
                <p className="text-sm font-normal">TO: The Chief CAD, PCIC-RO XI</p>
                <p className="text-sm font-semibold mt-2">PHILIPPINE CROP INSURANCE CORPORATION</p>
                <p className="text-sm font-semibold">Regional Office No. XI</p>
                <p className="text-base font-bold mt-3">CLAIM FOR INDEMNITY (PAGHAHABOL BAYAD)</p>
                <p className="text-xs text-gray-700 mt-3 leading-relaxed">Please send your team of Adjusters to assess damage of my insured crop.<br />(Mangyaring magpadala kayo ng tagapag-imbistige upang tasahin ang naging pinsala ng aking pananim)</p>
                <p className="text-xs text-gray-700 mt-1">Hereunder are the basic information needed by your office. (Narito ang mga kinakailangang tala ng inyong tanggapon)</p>
              </div>

              {/* I. BASIC INFORMATION - form layout with underlined value lines */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4">I. BASIC INFORMATION (MGA PANGUNAHING IMPORMASYON)</h3>
                <div className="space-y-4 text-sm">
                  <div><p className="text-gray-700 font-medium">1. Name of Farmer-Assured (Pangalan ng Magsasaka):</p><p className="border-b border-black pt-0.5 font-medium">{c.name || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">2. Address (Tirahan):</p><p className="border-b border-black pt-0.5 font-medium">{c.address || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">3. Cell Phone Number (Numero ng Telepono):</p><p className="border-b border-black pt-0.5 font-medium">{c.phone || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">4. Location of Farm (Lugar ng Saka):</p><p className="border-b border-black pt-0.5 font-medium">{c.farmerLocation || c.address || ""}</p></div>
                  <div>
                    <p className="text-gray-700 font-medium">5. Insured Crops (Pananim na ipinaseguro):</p>
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <span className="inline-flex items-center gap-1"><span className="inline-flex items-center justify-center w-4 h-4 border border-black rounded-sm flex-shrink-0 text-xs font-bold">{isPalay ? "✓" : ""}</span> Palay</span>
                      <span className="inline-flex items-center gap-1"><span className="inline-flex items-center justify-center w-4 h-4 border border-black rounded-sm flex-shrink-0 text-xs font-bold">{isCorn ? "✓" : ""}</span> Corn</span>
                      <span className="border-b border-black flex-1 min-w-[120px] font-medium">{!isPalay && !isCorn ? (c.crop || "") : ""}</span>
                    </div>
                  </div>
                  <div><p className="text-gray-700 font-medium">6. Area Insured (Luwang/Sukat ng Bukid na Ipinaseguro):</p><p className="border-b border-black pt-0.5 font-medium inline">{c.areaInsured != null ? c.areaInsured : ""}</p><span className="ml-2 text-gray-600">ha. (ektorya)</span></div>
                  <div><p className="text-gray-700 font-medium">7. Variety Planted (Binhing Itinanim):</p><p className="border-b border-black pt-0.5 font-medium">{c.varietyPlanted || ""}</p></div>
                  <div>
                    <p className="text-gray-700 font-medium">8. Actual Date of Planting (Aktwal na Petsa ng Pagkakatanim):</p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="flex items-center gap-1">DS <span className="border-b border-black min-w-[80px] font-medium">{c.plantingDate ? new Date(c.plantingDate).toLocaleDateString() : ""}</span></span>
                      <span className="flex items-center gap-1">TP <span className="border-b border-black min-w-[80px] font-medium"></span></span>
                    </div>
                  </div>
                  <div><p className="text-gray-700 font-medium">9. CIC Number (Numero ng CIC):</p><p className="border-b border-black pt-0.5 font-medium">{c.cicNumber || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">10. Underwriter/Cooperative (Pangalan ng Ahente o Kooperatiba):</p><p className="border-b border-black pt-0.5 font-medium">{c.underwriter || ""}</p></div>
                  <div>
                    <p className="text-gray-700 font-medium">11. Program (Programa):</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                      {programLabels.map((label) => (
                        <span key={label} className="inline-flex items-center gap-1">
                          <span className="inline-flex items-center justify-center w-4 h-4 border border-black rounded-sm flex-shrink-0 text-xs font-bold">{isProgramChecked(label) ? "✓" : ""}</span> {label}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1">( ) Others: <span className="border-b border-black min-w-[80px] font-medium">{c.otherProgramText || ""}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* II. DAMAGE INDICATORS - form layout */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4">II. DAMAGE INDICATORS (MGA IMPORMASYON TUNGKOL SA PINSALA)</h3>
                <div className="space-y-4 text-sm">
                  <div><p className="text-gray-700 font-medium">1. Cause of Loss (Sanhi ng Pinsala):</p><p className="border-b border-black pt-0.5 font-medium">{c.damageType || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">2. Date of Loss Occurrence (Petsa ng Pinsala):</p><p className="border-b border-black pt-0.5 font-medium">{c.lossDate ? new Date(c.lossDate).toLocaleDateString() : ""}</p></div>
                  <div><p className="text-gray-700 font-medium">3. Age/Stage of cultivation at time of loss (Edad ng Pananim ng Mapinsala):</p><p className="border-b border-black pt-0.5 font-medium">{c.ageStage || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">4. Area Damaged (Luwang o sukat ng Napinsalang Bahagi):</p><p className="border-b border-black pt-0.5 font-medium inline">{c.areaDamaged != null ? c.areaDamaged : ""}</p><span className="ml-2 text-gray-600">ha. (ektaryo)</span></div>
                  <div><p className="text-gray-700 font-medium">5. Extent/Degree of Damage (Tindi o Porsyento ng Pinsala):</p><p className="border-b border-black pt-0.5 font-medium inline">{c.degreeOfDamage != null ? c.degreeOfDamage : ""}</p><span className="ml-2 text-gray-600">% (porsyento)</span></div>
                  <div><p className="text-gray-700 font-medium">6. Expected Date of Harvest (Tinatayang Petsa ng Pagpapagapas o Pag-ani):</p><p className="border-b border-black pt-0.5 font-medium">{c.expectedHarvest || ""}</p></div>
                </div>
              </div>

              {/* III. LOCATION SKETCH PLAN - same structure as image, always show 4 lots */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase border-b border-black pb-1 mb-1">III. LOCATION SKETCH PLAN OF DAMAGED CROPS (LSP)</h3>
                <p className="text-xs text-gray-600 mb-3">(KROKIS NG BUKID NG MGA NASALANTANG NAKASEGURONG PANANIM)</p>
                <p className="text-xs text-gray-600 mb-3 italic">Isulat ang pangalan ng may-ari/nagsasaka sa karatig na sakahan</p>
                <div className="space-y-4 text-sm">
                  {[1, 2, 3, 4].map((lot) => {
                    const lb = c.lotBoundaries && c.lotBoundaries[lot] ? c.lotBoundaries[lot] : {}
                    return (
                      <div key={lot} className="border border-gray-300 p-3 rounded">
                        <p className="font-medium mb-2">Lot {lot} _____ ha.</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          <div><span className="text-gray-600">North (Hilaga):</span><p className="border-b border-black font-medium">{lb.north || ""}</p></div>
                          <div><span className="text-gray-600">South (Timog):</span><p className="border-b border-black font-medium">{lb.south || ""}</p></div>
                          <div><span className="text-gray-600">East (Silangan):</span><p className="border-b border-black font-medium">{lb.east || ""}</p></div>
                          <div><span className="text-gray-600">West (Kanluran):</span><p className="border-b border-black font-medium">{lb.west || ""}</p></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer - Thank You / Signature */}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <p className="text-sm">Thank You.</p>
                <p className="text-sm mt-1">Very truly yours,</p>
                <p className="border-b-2 border-black pt-8 pb-1 mt-4 min-h-[2rem]"></p>
                <p className="text-xs text-gray-600 mt-1">Signature over Printed Name of Assured Farmer-Claimant (Lagda sa Ibabaw ng Pangalan ng Magsasakang Nakaseguro)</p>
              </div>

              {/* Damage Evidence Photos */}
              {selectedClaim.damagePhotos && selectedClaim.damagePhotos.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-black">
                    <h4 className="text-sm font-black text-black uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Camera size={16} className="text-lime-500" />
                      Damage Evidence Photos ({selectedClaim.damagePhotos.length})
                    </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedClaim.damagePhotos.map((photo, index) => {
                      // Check if photo is a valid data URL
                      const isValidDataUrl = typeof photo === 'string' && photo.startsWith('data:');
                      
                      if (!isValidDataUrl) {
                        return (
                          <div key={index} className="relative group">
                              <div className="w-full h-32 bg-gray-200 rounded-lg border-2 border-black flex items-center justify-center">
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
                              className="w-full h-32 object-cover rounded-lg border-2 border-black cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // Open photo in full screen modal
                              const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 z-[60] bg-black bg-opacity-75 flex items-center justify-center p-4';
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
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded border border-white">
                            Photo {index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                    <p className="text-xs text-gray-600 mt-3 font-semibold">
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

              {selectedClaim.status === "pending" && (
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
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowClaimDetails(false)}
                  className="bg-lime-400 border-2 border-black text-black px-6 py-3 rounded-lg hover:bg-lime-500 transition-all font-bold shadow-lg"
                  style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        )
      })()}

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
