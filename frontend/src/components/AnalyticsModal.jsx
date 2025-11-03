import { X, Calendar, TrendingUp, Map, AlertTriangle, Download } from "lucide-react"
import { Line, Pie, Doughnut, Bar } from "react-chartjs-2"

const AnalyticsModal = ({ 
  isOpen, 
  onClose, 
  analyticsData, 
  onGeneratePdfReport 
}) => {
  if (!isOpen || !analyticsData) return null

  return (
    <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Predictive Analytics</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-lime-600" />
                  Current Year Overview
                </h3>
                <span className="text-sm text-gray-500">Total: {analyticsData.currentYear.totalClaims}</span>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Monthly Completion Rates</h4>
                  <div className="h-60">
                    <Line
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "top" },
                          tooltip: { mode: "index", intersect: false },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: { display: true, text: "Claims" },
                          },
                        },
                        elements: {
                          line: {
                            tension: 0.4,
                          },
                          point: {
                            radius: 3,
                          },
                        },
                      }}
                      data={{
                        labels: Object.keys(analyticsData.currentYear.monthlyStatus),
                        datasets: [
                          {
                            label: "Approved",
                            data: Object.values(analyticsData.currentYear.monthlyStatus).map(
                              (month) => month.approved || 0,
                            ),
                            borderColor: "rgba(16, 185, 129, 1)",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            fill: true,
                            borderWidth: 2,
                          },
                          {
                            label: "Rejected",
                            data: Object.values(analyticsData.currentYear.monthlyStatus).map(
                              (month) => month.rejected || 0,
                            ),
                            borderColor: "rgba(239, 68, 68, 1)",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            fill: true,
                            borderWidth: 2,
                          },
                          {
                            label: "Completed",
                            data: Object.values(analyticsData.currentYear.monthlyStatus).map(
                              (month) => month.completed || 0,
                            ),
                            borderColor: "rgba(59, 130, 246, 1)",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            fill: true,
                            borderWidth: 2,
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Status Distribution</h4>
                  <div className="h-60">
                    <Pie
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "right", labels: { boxWidth: 12 } },
                        },
                      }}
                      data={{
                        labels: ["Approved", "Rejected", "Pending", "Completed"],
                        datasets: [
                          {
                            data: [
                              analyticsData.currentYear.byStatus.approved || 0,
                              analyticsData.currentYear.byStatus.rejected || 0,
                              analyticsData.currentYear.byStatus.pending || 0,
                              analyticsData.currentYear.byStatus.completed || 0,
                            ],
                            backgroundColor: [
                              "rgba(16, 185, 129, 0.8)",
                              "rgba(239, 68, 68, 0.8)",
                              "rgba(245, 158, 11, 0.8)",
                              "rgba(59, 130, 246, 0.8)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Next Year Forecast
                </h3>
                <span className="text-sm text-gray-500">Predicted Total: {analyticsData.nextYear.totalClaims}</span>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Predicted Monthly Trends</h4>
                  <div className="h-60">
                    <Line
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "top" },
                          tooltip: { mode: "index", intersect: false },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: { display: true, text: "Predicted Claims" },
                            grid: {
                              color: "rgba(0, 0, 0, 0.05)",
                            },
                          },
                          x: {
                            grid: {
                              color: "rgba(0, 0, 0, 0.05)",
                            },
                          },
                        },
                        elements: {
                          line: {
                            tension: 0.4,
                          },
                          point: {
                            radius: 3,
                          },
                        },
                      }}
                      data={{
                        labels: Object.keys(analyticsData.nextYear.monthlyStatus || {}),
                        datasets: [
                          {
                            label: "Approved",
                            data: Object.values(analyticsData.nextYear.monthlyStatus || {}).map(
                              (month) => month.approved || 0,
                            ),
                            borderColor: "rgba(16, 185, 129, 1)",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            fill: true,
                            borderWidth: 2,
                          },
                          {
                            label: "Rejected",
                            data: Object.values(analyticsData.nextYear.monthlyStatus || {}).map(
                              (month) => month.rejected || 0,
                            ),
                            borderColor: "rgba(239, 68, 68, 1)",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            fill: true,
                            borderWidth: 2,
                          },
                          {
                            label: "Completed",
                            data: Object.values(analyticsData.nextYear.monthlyStatus || {}).map(
                              (month) => month.completed || 0,
                            ),
                            borderColor: "rgba(59, 130, 246, 1)",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            fill: true,
                            borderWidth: 2,
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Predicted Status Distribution</h4>
                  <div className="h-60">
                    <Doughnut
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "right", labels: { boxWidth: 12 } },
                        },
                        cutout: "60%",
                      }}
                      data={{
                        labels: ["Approved", "Rejected", "Pending", "Completed"],
                        datasets: [
                          {
                            data: [
                              analyticsData.nextYear.byStatus.approved || 0,
                              analyticsData.nextYear.byStatus.rejected || 0,
                              analyticsData.nextYear.byStatus.pending || 0,
                              analyticsData.nextYear.byStatus.completed || 0,
                            ],
                            backgroundColor: [
                              "rgba(16, 185, 129, 0.8)",
                              "rgba(239, 68, 68, 0.8)",
                              "rgba(245, 158, 11, 0.8)",
                              "rgba(59, 130, 246, 0.8)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Map className="mr-2 h-5 w-5 text-lime-600" />
                  Resource Allocation Recommendations
                </h3>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Key Insights</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      Predicted {analyticsData.nextYear.totalClaims - analyticsData.currentYear.totalClaims} more
                      claims next year (
                      {Math.round(
                        ((analyticsData.nextYear.totalClaims - analyticsData.currentYear.totalClaims) /
                          analyticsData.currentYear.totalClaims) *
                          100,
                      )}
                      % increase)
                    </li>
                    <li>
                      {Object.entries(analyticsData.nextYear.byMonth || {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 2)
                        .map(([month]) => month)
                        .join(" and ")}{" "}
                      will likely see the highest claim volumes
                    </li>
                    <li>
                      Approval rate is expected to be{" "}
                      {Math.round(
                        (analyticsData.nextYear.byStatus.approved / analyticsData.nextYear.totalClaims) * 100,
                      )}
                      % next year
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Monthly Processing Forecast</h4>
                  <div className="h-60">
                    <Line
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: true },
                          tooltip: {
                            mode: "index",
                            intersect: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: { display: true, text: "Claims" },
                            grid: {
                              color: "rgba(0, 0, 0, 0.05)",
                            },
                          },
                          x: {
                            grid: {
                              color: "rgba(0, 0, 0, 0.05)",
                            },
                          },
                        },
                        elements: {
                          line: {
                            tension: 0.1,
                          },
                          point: {
                            radius: 2,
                          },
                        },
                      }}
                      data={{
                        labels: Object.keys(analyticsData.nextYear.byMonth || {}),
                        datasets: [
                          {
                            label: "Current Year",
                            data: Object.values(analyticsData.currentYear.byMonth || {}),
                            borderColor: "rgba(107, 114, 128, 1)",
                            backgroundColor: "rgba(107, 114, 128, 0.1)",
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false,
                          },
                          {
                            label: "Next Year (Predicted)",
                            data: Object.values(analyticsData.nextYear.byMonth || {}),
                            borderColor: "rgba(79, 70, 229, 1)",
                            backgroundColor: "rgba(79, 70, 229, 0.1)",
                            borderWidth: 2,
                            fill: true,
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
                  Status Assessment
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Status Efficiency</h4>
                  <div className="h-60">
                    <Bar
                      options={{
                        indexAxis: "y",
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (context) => `${context.raw.toFixed(1)}% of total claims`,
                            },
                          },
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: "Percentage (%)" },
                          },
                        },
                      }}
                      data={{
                        labels: analyticsData.statusEfficiency.map((item) => item.status),
                        datasets: [
                          {
                            label: "Status Percentage",
                            data: analyticsData.statusEfficiency.map((item) => item.value),
                            backgroundColor: analyticsData.statusEfficiency.map((item) => {
                              if (item.status === "Approved") return "rgba(16, 185, 129, 0.8)"
                              if (item.status === "Rejected") return "rgba(239, 68, 68, 0.8)"
                              if (item.status === "Pending") return "rgba(245, 158, 11, 0.8)"
                              if (item.status === "Completed") return "rgba(59, 130, 246, 0.8)"
                              return "rgba(107, 114, 128, 0.8)"
                            }),
                            borderRadius: 4,
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
            <button
              onClick={onGeneratePdfReport}
              className="bg-lime-700 text-white px-4 py-2 rounded-lg hover:bg-lime-800 transition flex items-center"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsModal

