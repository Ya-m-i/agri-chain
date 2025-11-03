import totalFarmerImage from "../assets/Images/TotalFarmer.png"
import activeImage from "../assets/Images/Active.png"
import pendingImage from "../assets/Images/pending.png"
import assistedImage from "../assets/Images/Assisted.png"
import WeatherKPIBlock from "./WeatherKPIBlock"

const DashboardKPIs = ({
  darkMode,
  totalFarmers,
  activeFarmersData,
  pendingClaims,
  claims,
  allApplications
}) => {
  const farmerAssistedCount = (() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return allApplications.filter(app => {
      const appDate = new Date(app.createdAt || app.date);
      return (app.status === 'distributed' || app.status === 'approved') && 
             appDate.getMonth() === currentMonth && 
             appDate.getFullYear() === currentYear;
    }).length;
  })();

  return (
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
          <div className="text-2xl font-bold text-gray-800 mb-1">{farmerAssistedCount}</div>
          <div className="text-xs text-gray-600 mb-2">This Month</div>
          {/* Analytics Mini Chart */}
          <div className="w-full h-6 bg-gray-100 rounded-lg overflow-hidden">
            <div className="h-full rounded-lg" 
                 style={{ 
                   backgroundColor: '#ededdc',
                   width: `${Math.min((farmerAssistedCount / Math.max(totalFarmers, 1)) * 100, 100)}%` 
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
  )
}

export default DashboardKPIs

