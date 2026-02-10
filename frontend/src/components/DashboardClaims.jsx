import { ClipboardCheck, FileText } from "lucide-react"
import insuranceImage from "../assets/Images/insurance.png"
import recentImage from "../assets/Images/recent.png"

const DashboardClaims = ({ claims }) => {
  const pendingClaims = claims.filter((c) => c.status === "pending")
  const getClaimTime = (claim) => {
    const timeValue =
      claim.updatedAt ||
      claim.reviewDate ||
      claim.completionDate ||
      claim.date ||
      claim.createdAt
    const parsed = timeValue ? new Date(timeValue).getTime() : 0
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const recentClaims = Array.from(
    claims.reduce((map, claim) => {
      if (!claim) return map
      const key = claim._id || claim.claimNumber || claim.id
      if (!key) return map

      const existing = map.get(key)
      if (!existing || getClaimTime(claim) >= getClaimTime(existing)) {
        map.set(key, claim)
      }
      return map
    }, new Map())
  )
    .sort((a, b) => getClaimTime(b) - getClaimTime(a))
    .slice(0, 5)
  
  return (
    <>
      {/* Pending Insurance Claims Section */}
      <div className="mt-6">
        <div className="flex items-center mb-3">
          <img src={insuranceImage} alt="Pending Insurance Claims" className="h-12 w-12 mr-3" />
          <h2 className="text-lg font-semibold text-gray-800">Pending Insurance Claims</h2>
          <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            {pendingClaims.length}
          </span>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {pendingClaims.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <ClipboardCheck size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No pending claims at the moment</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingClaims
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

      {/* Recent Claims Section */}
      <div className="mt-6">
        <div className="flex items-center mb-3">
          <img src={recentImage} alt="Recent Claims" className="h-12 w-12 mr-3" />
          <h2 className="text-lg font-semibold text-gray-800">Recent Claims</h2>
          <span className="ml-2 px-2 py-1 bg-lime-100 text-lime-700 text-xs font-medium rounded-full">
            {recentClaims.length}
          </span>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {recentClaims.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No recent claims found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentClaims.map((claim) => (
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
                              {new Date(
                                claim.updatedAt ||
                                  claim.reviewDate ||
                                  claim.completionDate ||
                                  claim.date ||
                                  claim.createdAt
                              ).toLocaleDateString()}
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
  )
}

export default DashboardClaims

