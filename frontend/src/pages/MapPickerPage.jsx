import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

function MapPickerPage() {
  const mapDivRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize map
    if (!mapDivRef.current || mapRef.current) return

    // Fix default icon paths
    if (L.Icon && L.Icon.Default) {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }

    const initialCenter = [7.591509, 125.696724] // Kapalong Maniki
    const map = L.map(mapDivRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true
    })
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const onClick = (e) => {
      const { lat, lng } = e.latlng
      setSelected({ lat, lng })
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map)
      }
    }

    map.on('click', onClick)
    setLoading(false)

    return () => {
      map.off('click', onClick)
      map.remove()
      mapRef.current = null
    }
  }, [])

  const reverseGeocode = async (lat, lng) => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`, {
        headers: { 'User-Agent': 'AGRI-CHAIN-App/1.0' }
      })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      return data?.display_name || `Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`
    } catch (e) {
      return `Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`
    }
  }

  const handleConfirm = async () => {
    if (!selected) return
    const address = await reverseGeocode(selected.lat, selected.lng)
    const payload = {
      lat: selected.lat,
      lng: selected.lng,
      address,
      ts: Date.now()
    }
    localStorage.setItem('mapPickerSelection', JSON.stringify(payload))
    window.close()
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="sticky top-0 z-10 border-b-4 border-black bg-gradient-to-r from-lime-50 to-lime-100 p-4 flex items-center justify-between" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 className="text-xl font-black text-black uppercase tracking-wider">Select Farm Location</h1>
        <div className="flex gap-2">
          <button onClick={() => window.close()} className="px-4 py-2 bg-white border-4 border-black text-black rounded-lg hover:bg-gray-100 font-black uppercase tracking-wider">Cancel</button>
          <button onClick={handleConfirm} disabled={!selected} className={`px-4 py-2 rounded-lg border-4 border-black font-black uppercase tracking-wider ${selected ? 'bg-lime-400 text-black hover:bg-lime-500' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Confirm</button>
        </div>
      </div>
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lime-600 mx-auto mb-3"></div>
              <p className="text-black font-bold uppercase">Loading Map...</p>
            </div>
          </div>
        )}
        <div ref={mapDivRef} style={{ width: '100%', height: 'calc(100vh - 64px)' }} />
      </div>
      <div className="border-t-4 border-black p-3 bg-white text-center">
        <p className="text-sm text-gray-600">Leaflet | © OpenStreetMap contributors</p>
      </div>
    </div>
  )
}

export default MapPickerPage


