"use client"

import { useState } from "react"
import { Map, Plus, Trash2 } from "lucide-react"
import { useClaimFormStore } from "../../store/claimFormStore"

const FormStep3 = () => {
  const { formData, updateLotBoundary, setStep } = useClaimFormStore()
  const [lots, setLots] = useState([1]) // Start with one lot

  const handleBoundaryChange = (lot, direction, value) => {
    updateLotBoundary(lot, direction, value)
  }

  const addLot = () => {
    const newLotNumber = Math.max(...lots) + 1
    setLots([...lots, newLotNumber])
  }

  const removeLot = (lotToRemove) => {
    if (lots.length > 1) {
      setLots(lots.filter(lot => lot !== lotToRemove))
    }
  }

  return (
    <section className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <Map className="text-blue-500 h-7 w-7" /> III. Location Sketch / Plan of Damaged Crops (LSP)
      </h2>

      <div className="space-y-8">
        {lots.map((lot) => (
          <div
            key={lot}
            className="bg-blue-50 p-6 rounded-lg border border-blue-200 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                <div className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">
                  {lot}
                </div>
                Lot {lot} Details
              </h3>
              {lots.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLot(lot)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Remove lot"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* North Boundary */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">North Boundary</label>
                <input
                  type="text"
                  placeholder="e.g., Road"
                  className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.lotBoundaries[lot]?.north || ""}
                  onChange={(e) => handleBoundaryChange(lot, "north", e.target.value)}
                />
              </div>

              {/* South Boundary */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">South Boundary</label>
                <input
                  type="text"
                  placeholder="e.g., River"
                  className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.lotBoundaries[lot]?.south || ""}
                  onChange={(e) => handleBoundaryChange(lot, "south", e.target.value)}
                />
              </div>

              {/* East Boundary */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">East Boundary</label>
                <input
                  type="text"
                  placeholder="e.g., Farm"
                  className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.lotBoundaries[lot]?.east || ""}
                  onChange={(e) => handleBoundaryChange(lot, "east", e.target.value)}
                />
              </div>

              {/* West Boundary */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">West Boundary</label>
                <input
                  type="text"
                  placeholder="e.g., Canal"
                  className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.lotBoundaries[lot]?.west || ""}
                  onChange={(e) => handleBoundaryChange(lot, "west", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Lot Button */}
        <button
          type="button"
          onClick={addLot}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus className="h-5 w-5" />
          Add Another Lot
        </button>
      </div>

    </section>
  )
}

export default FormStep3
