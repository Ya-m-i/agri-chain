"use client"

import { useState, useEffect } from "react"
import { Truck, Search, CheckCircle, X } from "lucide-react"
import { useDistributionStore } from '../store/distributionStore'

const DistributionRecords = () => {
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Real blockchain distribution records
  const {
    loading: blockchainLoading,
    error: blockchainError,
    searchTerm,
    setSearchTerm,
    fetchRecords,
    getFilteredRecords,
    clearError
  } = useDistributionStore()

  // Fetch real blockchain distribution records on component mount
  useEffect(() => {
    console.log('🔄 DistributionRecords: Fetching real blockchain distribution records...')
    fetchRecords()
  }, [fetchRecords])

  // Reset to first page when filtered records change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  // Removed all chart-related code and unused variables

  return (
    <div className="mt-6">
      {/* Outside Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Truck size={24} className="text-lime-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Blockchain Records</h1>
          <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            🔗 Blockchain
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="p-6">
        {/* Filter & Search */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {/* Left side - Removed buttons */}
          <div className="flex items-center gap-4">
            {/* Buttons removed: Filter by Status, Generate Distribution Forecast, View Forecast Analysis */}
          </div>

          {/* Right side - Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search blockchain records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>
        </div>
        {/* --- Analytics Charts Row - Removed --- */}
        {/* Charts removed: Claims Forecast (Quarterly), Claims Trends (Monthly), Assistance Application Status */}

        {/* Blockchain Claims Table */}
        {blockchainLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto mb-3"></div>
            <p className="text-gray-500 italic">Loading blockchain distribution records...</p>
            <p className="text-sm text-gray-400 mt-2">Connecting to Hyperledger Fabric via Cloudflare tunnel...</p>
          </div>
        ) : blockchainError ? (
          <div className="text-center py-10">
            <Truck size={48} className="mx-auto text-red-300 mb-3" />
            <p className="text-red-500 italic">Error loading blockchain records: {blockchainError}</p>
            <p className="text-sm text-gray-400 mb-4">Failed to connect to blockchain at api.kapalongagrichain.site</p>
            <button 
              onClick={() => {
                clearError()
                fetchRecords()
              }} 
              className="mt-2 px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700"
            >
              Retry Connection
            </button>
          </div>
        ) : getFilteredRecords().length === 0 ? (
          <div className="text-center py-10">
            <Truck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 italic">No blockchain distribution records available.</p>
            <p className="text-sm text-gray-400 mt-2">Records will appear here when claims are processed and logged to the blockchain.</p>
          </div>
        ) : (() => {
          // Sort records by timestamp (newest first)
          const sortedRecords = [...getFilteredRecords()].sort((a, b) => {
            const dateA = new Date(a.timestamp || 0).getTime();
            const dateB = new Date(b.timestamp || 0).getTime();
            return dateB - dateA; // Descending order (newest first)
          });

          // Calculate pagination
          const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedRecords = sortedRecords.slice(startIndex, endIndex);

          return (
            <div className="w-full overflow-x-auto bg-white rounded-xl shadow-md border-2 border-lime-200">
              <div className="overflow-y-auto max-h-[600px] hide-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 rounded-tl-lg font-semibold text-gray-700">Claim ID</th>
                      <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 font-semibold text-gray-700">Farmer Name</th>
                      <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 font-semibold text-gray-700">Crop Type</th>
                      <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 font-semibold text-gray-700">Timestamp</th>
                      <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 font-semibold text-gray-700">Status</th>
                      <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 font-semibold text-gray-700">Action</th>
                      <th className="p-3 bg-gradient-to-r from-lime-50 to-lime-100 rounded-tr-lg font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((claim, index) => (
                      <tr key={claim.claimId || `${claim.farmerName}-${claim.timestamp}-${index}`} className="hover:bg-gray-50">
                        <td className="p-3 border-b border-gray-200 font-mono text-sm">{claim.claimId}</td>
                        <td className="p-3 border-b border-gray-200 font-medium">{claim.farmerName}</td>
                        <td className="p-3 border-b border-gray-200">{claim.cropType}</td>
                        <td className="p-3 border-b border-gray-200">{new Date(claim.timestamp).toLocaleString()}</td>
                        <td className="p-3 border-b border-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                            claim.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : claim.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <CheckCircle size={12} className="mr-1" />
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3 border-b border-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            claim.action === 'processed' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {claim.action || 'processed'}
                          </span>
                        </td>
                        <td className="p-3 border-b border-gray-200">
                          <button
                            onClick={() => {
                              setSelectedClaim(claim)
                              setShowDetailsModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gradient-to-r from-lime-50 to-lime-100">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedRecords.length)} of {sortedRecords.length} records
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-lime-600 text-white rounded-lg font-semibold hover:bg-lime-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar max-w-[200px]">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm ${
                            currentPage === page
                              ? 'bg-lime-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-lime-100 border border-lime-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-lime-600 text-white rounded-lg font-semibold hover:bg-lime-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Distribution Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Blockchain Claim Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Claim ID:</span> {selectedClaim.claimId}</p>
                    <p><span className="text-gray-500">Farmer Name:</span> {selectedClaim.farmerName}</p>
                    <p><span className="text-gray-500">Crop Type:</span> {selectedClaim.cropType}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Blockchain Details</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Timestamp:</span> {new Date(selectedClaim.timestamp).toLocaleString()}</p>
                    <p><span className="text-gray-500">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedClaim.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedClaim.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                      </span>
                    </p>
                    <p><span className="text-gray-500">Source:</span> Hyperledger Fabric</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🔗 Blockchain Information</h4>
                <p className="text-sm text-blue-700">
                  This claim log is stored immutably on the Hyperledger Fabric blockchain network. 
                  The data cannot be modified or deleted, ensuring complete transparency and auditability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default DistributionRecords
