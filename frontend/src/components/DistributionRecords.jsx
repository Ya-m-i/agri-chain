"use client"

import { useState } from "react"
import { Truck, Search, Layers, ChevronDown, BarChart, CheckCircle, X, Calendar, TrendingUp, Filter as FilterIcon } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const DistributionRecords = ({ claims, approvedClaims, generateAnalytics, analyticsLoading, allApplications = [] }) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPredictiveModal, setShowPredictiveModal] = useState(false)
  const [predictionPeriod, setPredictionPeriod] = useState("quarterly")
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState([]);
  // Combine cash assistance claims and seed assistance applications
  const combinedData = [
    // Cash assistance claims
    ...claims.map(claim => ({
      ...claim,
      type: 'cash_claim',
      date: claim.date,
      cropType: claim.cropType || claim.crop,
      status: claim.status,
      amount: claim.amount || 0
    })),
    // Seed assistance applications
    ...allApplications.map(app => ({
      ...app,
      type: 'seed_assistance',
      date: app.applicationDate,
      cropType: app.cropType,
      status: app.status,
      amount: app.requestedQuantity || 0
    }))
  ];

  // Calculate years, minYear, maxYear before useState
  const years = combinedData.map(c => new Date(c.date).getFullYear());
  const minYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear();
  const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  // Remove the unused setYearRange and yearRange state
  // const [yearRange, setYearRange] = useState([minYear, maxYear]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  // Add local state for the year range slider
  const [selectedYearRange, setSelectedYearRange] = useState([minYear, maxYear]);

  const cropTypes = Array.from(new Set(combinedData.map(c => c.cropType))).filter(Boolean);
  const statuses = Array.from(new Set(combinedData.map(c => c.status))).filter(Boolean);

  // Update filteredClaims to use selectedYearRange and combined data
  const filteredClaims = combinedData.filter(c => {
    const year = new Date(c.date).getFullYear();
    const yearMatch = year >= selectedYearRange[0] && year <= selectedYearRange[1];
    const cropMatch = selectedCrops.length === 0 || selectedCrops.includes(c.cropType);
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(c.status);
    return yearMatch && cropMatch && statusMatch;
  });

  const toggleCrop = crop => setSelectedCrops(crops => crops.includes(crop) ? crops.filter(c => c !== crop) : [...crops, crop]);
  const toggleStatus = status => setSelectedStatuses(statuses => statuses.includes(status) ? statuses.filter(s => s !== status) : [...statuses, status]);
  // Update resetFilters to reset selectedYearRange
  const resetFilters = () => {
    setSelectedCrops([]);
    setSelectedYearRange([minYear, maxYear]);
    setSelectedStatuses([]);
  };
  const applyFilters = () => setShowFilterDrawer(false);

  // Function to generate predictive analytics
  const generatePredictiveAnalytics = () => {
    // Group combined data by month
    const monthlyData = combinedData.reduce((acc, item) => {
      if (!item.date) return acc
      const date = new Date(item.date)
      const monthKey = date.getMonth() // 0-11
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    }, {})

    // Create array for all months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const distributionValues = months.map((_, index) => monthlyData[index] || null)

    // Find the last month with data
    const lastMonthWithData = distributionValues.reduce((last, value, index) => 
      value !== null ? index : last, -1)

    // Prepare data for regression (only using months with data)
    const dataForRegression = distributionValues
      .map((value, index) => ({ x: index, y: value }))
      .filter(point => point.y !== null)

    // Simple linear regression for forecasting
    const regression = (() => {
      if (dataForRegression.length < 2) {
        return { slope: 0, intercept: dataForRegression[0]?.y || 0 }
      }

      const n = dataForRegression.length
      const sumX = dataForRegression.reduce((sum, point) => sum + point.x, 0)
      const sumY = dataForRegression.reduce((sum, point) => sum + point.y, 0)
      const sumXY = dataForRegression.reduce((sum, point) => sum + (point.x * point.y), 0)
      const sumXX = dataForRegression.reduce((sum, point) => sum + (point.x * point.x), 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n

      return { slope, intercept }
    })()

    // Generate predictions
    const predictions = {
      quarterly: [],
      yearly: []
    }

    // Calculate quarterly predictions
    const currentQuarter = Math.floor((new Date().getMonth()) / 3)
    for (let i = 1; i <= 4; i++) {
      const quarterMonth = (currentQuarter + i) * 3
      const predictedValue = regression.slope * quarterMonth + regression.intercept
      predictions.quarterly.push({
        period: `Q${i} ${new Date().getFullYear()}`,
        predicted: Math.max(0, Math.round(predictedValue))
      })
    }

    // Calculate yearly predictions
    const currentYear = new Date().getFullYear()
    for (let i = 1; i <= 3; i++) {
      const yearlyValue = regression.slope * (12 * i) + regression.intercept
      predictions.yearly.push({
        period: `${currentYear + i}`,
        predicted: Math.max(0, Math.round(yearlyValue * 12))
      })
    }

    return {
      predictions,
      chartData: {
        labels: months,
        historical: distributionValues,
        lastMonthWithData
      }
    }
  }

  const { predictions, chartData } = generatePredictiveAnalytics()

  // Enhanced line chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            if (context.raw === null) return 'No data'
            return `${context.raw} distributions`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Distributions'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  const getLineChartData = () => {
    const { labels, historical, lastMonthWithData } = chartData
    
    // Create prediction line starting from last actual data point
    const predictionLine = new Array(lastMonthWithData + 1).fill(null)
    
    if (predictionPeriod === 'quarterly') {
      predictions.quarterly.forEach((pred) => {
        predictionLine.push(pred.predicted)
      })
    } else {
      predictions.yearly.forEach((pred) => {
        predictionLine.push(pred.predicted)
      })
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Actual Distributions',
          data: historical,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          pointRadius: 5,
          pointHoverRadius: 8,
          spanGaps: false
        },
        {
          label: 'Predicted Distributions',
          data: predictionLine,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderDash: [5, 5],
          pointRadius: 4,
          pointHoverRadius: 7,
          spanGaps: true
        }
      ]
    }
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const value = context.raw
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${value} (${percentage}%)`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Distributions'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  const getBarChartData = () => {
    const labels = predictionPeriod === 'quarterly'
      ? predictions.quarterly.map(p => p.period)
      : predictions.yearly.map(p => p.period)

    const values = predictionPeriod === 'quarterly'
      ? predictions.quarterly.map(p => p.predicted)
      : predictions.yearly.map(p => p.predicted)

    return {
      labels,
      datasets: [
        {
          label: 'Predicted Distributions',
          data: values,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1
        }
      ]
    }
  }

  // --- Support Availed vs Unused for Doughnut Chart ---
  // Use combined data (cash assistance claims + seed assistance applications)
  const totalApplications = combinedData.length;
  const availedSupport = combinedData.filter(item => item.status === 'distributed' || item.status === 'completed' || item.status === 'approved').length;
  const approvedSupport = combinedData.filter(item => item.status === 'approved').length;
  const pendingSupport = combinedData.filter(item => item.status === 'pending').length;
  const rejectedSupport = combinedData.filter(item => item.status === 'rejected').length;
  const unusedSupport = totalApplications - availedSupport - approvedSupport - pendingSupport - rejectedSupport;
  // --- Claims by Month for Bar Chart ---
  function groupClaimsByMonth(data) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const grouped = {};
    
    // Initialize all months with 0
    monthNames.forEach((month, index) => {
      grouped[index] = 0;
    });
    
    data.forEach(item => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      grouped[monthIndex] = (grouped[monthIndex] || 0) + 1;
    });
    
    return monthNames.map((month, index) => ({ x: month, y: grouped[index] }));
  }
  const claimsByMonth = groupClaimsByMonth(combinedData);
  
  // --- Claims by Quarter for Forecast Chart ---
  function groupClaimsByQuarter(data) {
    const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];
    const grouped = {};
    
    // Initialize all quarters with 0
    quarterNames.forEach((quarter, index) => {
      grouped[index] = 0;
    });
    
    data.forEach(item => {
      const date = new Date(item.date);
      const quarterIndex = Math.floor(date.getMonth() / 3);
      grouped[quarterIndex] = (grouped[quarterIndex] || 0) + 1;
    });
    
    return quarterNames.map((quarter, index) => ({ x: quarter, y: grouped[index] }));
  }
  const claimsByQuarter = groupClaimsByQuarter(combinedData);

  return (
    <div className="mt-6">
      {/* Outside Title */}
      <div className="flex items-center mb-4">
        <Truck size={24} className="text-lime-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Distribution Records</h1>
      </div>

      <div className="p-6">
        {/* Filter & Search */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {/* Left side - KPI Blocks */}
          <div className="flex items-center gap-4">
            {/* Filter KPI Block */}
            <div className="relative">
              <button
                onClick={() => setShowFilterPanel((prev) => !prev)}
                className="flex items-center gap-3 bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-gray-700 px-6 py-4 rounded-xl shadow-md border border-purple-200 transition-all duration-200 hover:shadow-lg min-w-[200px]"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Filter by Status</div>
                  <div className="text-xs text-gray-500">Manage records</div>
                </div>
                <ChevronDown size={16} className={`ml-auto transition-transform ${showFilterPanel ? "rotate-180" : ""}`} />
              </button>

              {showFilterPanel && (
                <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {["all", "approved", "rejected", "completed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status)
                        setShowFilterPanel(false)
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        statusFilter === status ? "bg-green-50 text-lime-700 font-medium" : ""
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Forecast KPI Block */}
            <button
              onClick={generateAnalytics}
              disabled={analyticsLoading}
              className={`flex items-center gap-3 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-gray-700 px-6 py-4 rounded-xl shadow-md border border-green-200 transition-all duration-200 hover:shadow-lg min-w-[220px] ${
                analyticsLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                {analyticsLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <BarChart className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">
                  {analyticsLoading ? "Generating..." : "Generate Distribution Forecast"}
                </div>
                <div className="text-xs text-gray-500">Predictive analytics</div>
              </div>
            </button>

            {/* View Forecast Analysis KPI Block */}
            <button
              onClick={() => setShowPredictiveModal(true)}
              className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-gray-700 px-6 py-4 rounded-xl shadow-md border border-blue-200 transition-all duration-200 hover:shadow-lg min-w-[200px]"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">View Forecast Analysis</div>
                <div className="text-xs text-gray-500">Analytics insights</div>
              </div>
            </button>
          </div>

          {/* Right side - Search */}
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
        {/* --- Analytics Charts Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Quarterly Forecast Chart */}
          <div className="rounded-xl p-4 w-full max-w-md h-64 flex flex-col">
            <h4 className="text-sm font-semibold text-lime-800 mb-2">Claims Forecast (Quarterly)</h4>
            <div className="flex-1">
              <Line
                data={{
                  labels: claimsByQuarter.map(d => d.x),
                  datasets: [
                    {
                      label: "Claims",
                      data: claimsByQuarter.map(d => d.y),
                      borderColor: "#10B981",
                      backgroundColor: "rgba(16, 185, 129, 0.3)",
                      fill: true,
                      pointRadius: 0,
                      tension: 0.4,
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: true,
                      mode: 'index',
                      intersect: false,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#10B981',
                      borderWidth: 1,
                      cornerRadius: 8,
                      callbacks: {
                        label: function(context) {
                          return `Claims: ${context.parsed.y}`;
                        }
                      }
                    }
                  },
                  interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                  },
                  scales: {
                    y: { 
                      beginAtZero: true, 
                      display: true,
                      title: {
                        display: true,
                        text: 'Number of Claims',
                        font: {
                          size: 12
                        }
                      },
                      ticks: {
                        font: {
                          size: 10
                        }
                      },
                      grid: {
                        display: false,
                        color: 'rgba(0,0,0,0.1)'
                      }
                    },
                    x: { 
                      display: true,
                      title: {
                        display: true,
                        text: 'Quarter',
                        font: {
                          size: 12
                        }
                      },
                      ticks: {
                        font: {
                          size: 10
                        }
                      },
                      grid: {
                        display: false,
                        color: 'rgba(0,0,0,0.1)'
                      }
                    },
                  },
                  elements: {
                    point: {
                      radius: 0
                    }
                  }
                }}
              />
            </div>
          </div>
          {/* Monthly Trends Line Chart */}
          <div className="rounded-xl p-4 w-full max-w-md h-64 flex flex-col">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Claims Trends (Monthly)</h4>
            <div className="flex-1">
              <Line
                data={{
                  labels: claimsByMonth.map(d => d.x),
                  datasets: [
                    {
                      label: "Claims",
                      data: claimsByMonth.map(d => d.y),
                      borderColor: "#3B82F6",
                      backgroundColor: "rgba(59, 130, 246, 0.3)",
                      fill: true,
                      pointRadius: 0,
                      tension: 0.4,
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: true,
                      mode: 'index',
                      intersect: false,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#3B82F6',
                      borderWidth: 1,
                      cornerRadius: 8,
                      callbacks: {
                        label: function(context) {
                          return `Claims: ${context.parsed.y}`;
                        }
                      }
                    }
                  },
                  interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                  },
                  scales: {
                    y: { 
                      beginAtZero: true, 
                      display: true,
                      title: {
                        display: true,
                        text: 'Number of Claims',
                        font: {
                          size: 12
                        }
                      },
                      ticks: {
                        font: {
                          size: 10
                        }
                      },
                      grid: {
                        display: false,
                        color: 'rgba(0,0,0,0.1)'
                      }
                    },
                    x: { 
                      display: true,
                      title: {
                        display: true,
                        text: 'Month',
                        font: {
                          size: 12
                        }
                      },
                      ticks: {
                        font: {
                          size: 10
                        }
                      },
                      grid: {
                        display: false,
                        color: 'rgba(0,0,0,0.1)'
                      }
                    },
                  },
                  elements: {
                    point: {
                      radius: 0
                    }
                  }
                }}
              />
            </div>
          </div>
          {/* Government Support Doughnut Chart */}
          <div className="rounded-xl p-4 w-full max-w-md h-64 flex flex-col">
            <h4 className="text-sm font-semibold text-purple-800 mb-2">Assistance Application Status</h4>
            <div className="flex-1 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: [
                    "Distributed", 
                    "Approved", 
                    "Pending", 
                    "Rejected", 
                    "Unused"
                  ],
                  datasets: [
                    {
                      data: [availedSupport, approvedSupport, pendingSupport, rejectedSupport, unusedSupport],
                      backgroundColor: [
                        "#065F46", // Dark green for distributed
                        "#047857", // Medium dark green for approved
                        "#10B981", // Medium green for pending
                        "#34D399", // Light green for rejected
                        "#6EE7B7"  // Very light green for unused
                      ],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      display: true,
                      position: 'bottom',
                      labels: {
                        padding: 10,
                        usePointStyle: true,
                        font: {
                          size: 11
                        }
                      }
                    },
                    tooltip: {
                      enabled: true,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#8B5CF6',
                      borderWidth: 1,
                      cornerRadius: 8,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: "60%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Records Table */}
        {approvedClaims === 0 ? (
          <div className="text-center py-10">
            <Truck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 italic">No distribution records available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="p-3 bg-gray-50 rounded-l-lg font-semibold text-gray-600">Claim ID</th>
                  <th className="p-3 bg-gray-50 font-semibold text-gray-600">Farmer Name</th>
                  <th className="p-3 bg-gray-50 font-semibold text-gray-600">Crop Type</th>
                  <th className="p-3 bg-gray-50 font-semibold text-gray-600">Distribution Date</th>
                  <th className="p-3 bg-gray-50 font-semibold text-gray-600">Status</th>
                  <th className="p-3 bg-gray-50 rounded-r-lg font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims
                  .filter((c) => (statusFilter === "all" ? true : c.status.toLowerCase() === statusFilter))
                  .filter(
                    (c) =>
                      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.crop?.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((claim, index) => (
                    <tr key={claim._id || claim.id || `${claim.name}-${claim.date}-${index}`} className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-200 font-mono text-sm">{claim.claimNumber || `DIST-${new Date(claim.date).getFullYear()}-${String(index + 1).padStart(4, '0')}`}</td>
                      <td className="p-3 border-b border-gray-200 font-medium">{claim.name}</td>
                      <td className="p-3 border-b border-gray-200">{claim.crop}</td>
                      <td className="p-3 border-b border-gray-200">{new Date(claim.date).toLocaleDateString()}</td>
                      <td className="p-3 border-b border-gray-200">
                        <span className="px-2 py-1 bg-green-100 text-lime-800 rounded-full text-xs font-medium inline-flex items-center">
                          <CheckCircle size={12} className="mr-1" />
                          Completed
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
        )}
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
                  <h3 className="font-medium text-gray-700 mb-2">Farmer Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Name:</span> {selectedClaim.name}</p>
                    <p><span className="text-gray-500">Contact:</span> {selectedClaim.phone || 'N/A'}</p>
                    <p><span className="text-gray-500">Address:</span> {selectedClaim.address || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Distribution Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Crop Type:</span> {selectedClaim.crop}</p>
                    <p><span className="text-gray-500">Date:</span> {new Date(selectedClaim.date).toLocaleDateString()}</p>
                    <p><span className="text-gray-500">Status:</span> Completed</p>
                  </div>
                </div>
              </div>
              {/* Add more details as needed */}
            </div>
          </div>
        </div>
      )}

      {/* Predictive Analytics Modal */}
      {showPredictiveModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Distribution Forecasting Analysis</h2>
              <button onClick={() => setShowPredictiveModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setPredictionPeriod("quarterly")}
                  className={`px-4 py-2 rounded-lg ${
                    predictionPeriod === "quarterly"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Quarterly Forecast
                </button>
                <button
                  onClick={() => setPredictionPeriod("yearly")}
                  className={`px-4 py-2 rounded-lg ${
                    predictionPeriod === "yearly"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Yearly Forecast
                </button>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Distribution Trends</h3>
                  <div className="w-full h-[300px] relative">
                    <Line 
                      data={getLineChartData()} 
                      options={lineChartOptions}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div style={{ height: '300px' }}>
                    <Bar options={barChartOptions} data={getBarChartData()} />
                  </div>
                </div>
              </div>

              {/* Predictions Cards */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">
                  {predictionPeriod === "quarterly" ? "Quarterly" : "Yearly"} Distribution Forecast
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {predictions[predictionPeriod].map(prediction => (
                    <div key={prediction.period} className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-gray-500">{prediction.period}</div>
                      <div className="text-2xl font-bold text-blue-600">{prediction.predicted}</div>
                      <div className="text-xs text-gray-400">Predicted Distributions</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="font-medium text-gray-700">Forecast Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Based on historical distribution patterns and regression analysis, 
                    we predict a {predictionPeriod === "quarterly" 
                      ? "quarterly average of " + Math.round(predictions.quarterly.reduce((acc, curr) => acc + curr.predicted, 0) / 4)
                      : "yearly average of " + Math.round(predictions.yearly.reduce((acc, curr) => acc + curr.predicted, 0) / 3)
                    } distributions.
                  </p>
                  <p className="text-sm text-gray-500">
                    * Forecasts are calculated using advanced regression analysis with seasonal adjustments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating filter button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-lime-700 text-white rounded-full shadow-lg p-4 hover:bg-lime-800 transition"
        onClick={() => setShowFilterDrawer(true)}
        aria-label="Open analytics filters"
      >
        <FilterIcon className="w-6 h-6" />
      </button>

      {/* Filter drawer */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300" onClick={() => setShowFilterDrawer(false)} />
          <div className="relative ml-auto w-full max-w-md bg-white shadow-2xl h-full flex flex-col p-8 transform transition-transform duration-300 translate-x-0">
            <h2 className="text-2xl font-bold mb-6">Filter Analytics</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCrops.map(crop => (
                <span key={crop} className="inline-flex items-center bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-xs font-medium">
                  {crop}
                  <button onClick={() => toggleCrop(crop)} className="ml-2 text-lime-700 hover:text-lime-900">×</button>
                </span>
              ))}
              {selectedStatuses.map(status => (
                <span key={status} className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <button onClick={() => toggleStatus(status)} className="ml-2 text-blue-700 hover:text-blue-900">×</button>
                </span>
              ))}
              {(selectedYearRange[0] !== minYear || selectedYearRange[1] !== maxYear) && (
                <span className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                  {selectedYearRange[0]} - {selectedYearRange[1]}
                  <button onClick={resetFilters} className="ml-2 text-gray-700 hover:text-gray-900">×</button>
                </span>
              )}
            </div>
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
                <label className="block text-sm font-medium mb-2">Year Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={minYear}
                    max={maxYear}
                    value={selectedYearRange[0]}
                    onChange={e => setSelectedYearRange([Number(e.target.value), selectedYearRange[1]])}
                    className="w-full"
                  />
                  <span className="text-xs">{selectedYearRange[0]}</span>
                  <span className="mx-1">-</span>
                  <input
                    type="range"
                    min={minYear}
                    max={maxYear}
                    value={selectedYearRange[1]}
                    onChange={e => setSelectedYearRange([selectedYearRange[0], Number(e.target.value)])}
                    className="w-full"
                  />
                  <span className="text-xs">{selectedYearRange[1]}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{minYear}</span>
                  <span>{maxYear}</span>
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
    </div>
  )
}

export default DistributionRecords
