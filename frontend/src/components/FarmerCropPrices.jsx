import { TrendingUp, DollarSign, Package } from 'lucide-react'
import { useCropPrices } from '../hooks/useAPI'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const FarmerCropPrices = () => {
  const { data: cropPrices = [], isLoading } = useCropPrices()

  const getColorForPrice = (price) => {
    if (price < 30) return '#84cc16' // lime
    if (price < 60) return '#22c55e' // green
    if (price < 100) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    )
  }

  if (cropPrices.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-lime-600" />
          <h2 className="text-xl font-bold text-gray-800">Current Market Prices</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-center">No market prices available at the moment</p>
          <p className="text-sm text-gray-400 mt-2">Check back later for updated prices</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-lime-600" />
          <h2 className="text-xl font-bold text-gray-800">Current Market Prices</h2>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Updated: {new Date(cropPrices[0]?.lastUpdated).toLocaleDateString()}
        </span>
      </div>

      {/* Chart Visualization */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={cropPrices.map(crop => ({
              name: crop.cropType ? `${crop.cropName}\n(${crop.cropType})` : crop.cropName,
              price: crop.pricePerKg,
              unit: crop.unit,
              fullName: crop.cropType ? `${crop.cropName} - ${crop.cropType}` : crop.cropName
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Price (₱)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value, name, props) => {
                return [`₱${value} per ${props.payload.unit}`, props.payload.fullName]
              }}
              labelFormatter={() => ''}
            />
            <Bar 
              dataKey="price" 
              radius={[8, 8, 0, 0]}
            >
              {cropPrices.map((crop, index) => (
                <Cell key={`cell-${index}`} fill={getColorForPrice(crop.pricePerKg)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cropPrices.map((crop) => (
          <div
            key={crop._id}
            className="bg-gradient-to-br from-lime-50 to-white border border-lime-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{crop.cropName}</h3>
                {crop.cropType && (
                  <p className="text-xs text-gray-600">{crop.cropType}</p>
                )}
              </div>
              <DollarSign className="h-5 w-5 text-lime-600" />
            </div>
            
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-bold text-lime-600">
                ₱{crop.pricePerKg}
              </span>
              <span className="text-sm text-gray-500">/ {crop.unit}</span>
            </div>
            
            {crop.region && (
              <p className="text-xs text-gray-500 mt-2">
                {crop.region}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Market Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 text-sm mb-1">Market Information</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              These prices are indicative market rates updated by the Department of Agriculture. 
              Actual selling prices may vary depending on your location, crop quality, and season. 
              Use these as a reference when planning your harvest and sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerCropPrices

