import { Settings } from "lucide-react"
import { ResponsiveContainer, LineChart, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, PieChart as RechartsPieChart, Pie as RechartsPie, Cell, BarChart, Bar as RechartsBar } from 'recharts'

const DashboardCharts = ({
  timePeriodFilter,
  setTimePeriodFilter,
  claimsTrendData,
  allApplications,
  cropPrices,
  cropPricesLoading,
  setShowCropPriceManagement
}) => {
  return (
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
  )
}

export default DashboardCharts

