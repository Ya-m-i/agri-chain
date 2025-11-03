import { X, Search, Plus, Layers } from "lucide-react"

const MapModal = ({
  isOpen,
  onClose,
  mapMode,
  onMapModeChange,
  mapSearchQuery,
  onMapSearchQueryChange,
  onSearchLocation,
  mapRef,
  selectedLocation,
  onConfirmLocation
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 text-white p-4 rounded-t-xl flex justify-between items-center" style={{ backgroundColor: 'rgb(43, 158, 102)' }}>
          <h2 className="text-xl font-bold">
            {mapMode === "view" ? "Farm Locations Map" : "Select Farm Location"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a location..."
                value={mapSearchQuery}
                onChange={(e) => onMapSearchQueryChange(e.target.value)}
                className="w-full p-2 pr-10 border rounded-md"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearchLocation()
                  }
                }}
              />
              <button
                onClick={onSearchLocation}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {mapMode === "view" && (
            <button
              onClick={() => onMapModeChange("add")}
              className="bg-lime-600 text-white px-4 py-2 rounded hover:bg-lime-700 flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Location
            </button>
          )}

          {mapMode === "add" && (
            <button
              onClick={() => onMapModeChange("view")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
            >
              <Layers className="mr-2 h-5 w-5" />
              View All Locations
            </button>
          )}
        </div>

        <div className="flex-1 min-h-[400px] relative">
          <div ref={mapRef} className="w-full h-[500px]"></div>
        </div>

        {mapMode === "add" && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                {selectedLocation ? (
                  <p className="text-sm text-gray-600">
                    Selected coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Click on the map to select a location</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmLocation}
                  disabled={!selectedLocation}
                  className={`px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-800 ${
                    !selectedLocation ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapModal

