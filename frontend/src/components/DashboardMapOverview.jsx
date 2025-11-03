import locationImage from "../assets/Images/location.png"

const DashboardMapOverview = ({
  weatherLoading,
  showWeatherOverlay,
  setShowWeatherOverlay,
  setWeatherLoading,
  farmers,
  getWeatherForMultipleLocations,
  setWeatherData,
  weatherFetchedRef,
  fitMapToFarmers,
  cropFilter,
  setCropFilter,
  availableCrops,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  overviewMapRef
}) => {
  return (
    <div className="bg-white rounded-xl p-6 mt-6 border border-gray-300 relative overflow-hidden shadow-sm" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
      
      {/* Decorative Lines */}
      <div className="absolute top-8 left-8 w-24 h-0.5 bg-gradient-to-r from-lime-500 to-transparent opacity-60 z-10"></div>
      <div className="absolute top-8 right-8 w-24 h-0.5 bg-gradient-to-l from-lime-500 to-transparent opacity-60 z-10"></div>
      
      <div className="sticky top-0 bg-white flex items-center justify-between mb-6 relative z-10 pb-4 border-b-4 border-lime-500" style={{ boxShadow: '0 6px 20px rgba(132, 204, 22, 0.4)' }}>
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
    </div>
  )
}

export default DashboardMapOverview

