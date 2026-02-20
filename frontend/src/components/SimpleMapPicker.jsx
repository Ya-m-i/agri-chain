import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
if (typeof window !== 'undefined') window.L = L;

const SimpleMapPicker = ({ onLocationSelect, onClose }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure container exists
    if (!mapContainerRef.current) {
      console.log('⏳ Waiting for map container...');
      return;
    }

    // Prevent double initialization
    if (mapInstanceRef.current) {
      console.log('✅ Map already initialized');
      return;
    }

    console.log('🗺️ Initializing farm location picker...');

    try {
      // Create map centered on Magsaysay Street, Purok 10-A, Maniki, Kapalong
      // Magsaysay Street, Purok 10-A, Maniki, Kapalong, Davao del Norte, Davao Region, 8113, Philippines
      const magsaysayCenter = [7.6080, 125.8400]; // Approximate coordinates for Magsaysay Street, Purok 10-A, Maniki
      const initialZoom = 16; // Close zoom to show street level detail
      
      const map = L.map(mapContainerRef.current, {
        center: magsaysayCenter,
        zoom: initialZoom,
        zoomControl: true,
        minZoom: 2,  // Allow free zoom out to see anywhere in the world
        maxZoom: 18,  // Allow zooming in for precision
        // No maxBounds - map is free to move anywhere
      });

      mapInstanceRef.current = map;
      
      // Force set view to Magsaysay Street area after initialization
      setTimeout(() => {
        map.setView(magsaysayCenter, initialZoom, { animate: false });
        console.log('📍 Map centered on Magsaysay Street, Purok 10-A, Maniki:', magsaysayCenter);
      }, 100);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Add click handler
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        console.log('📍 Farm location selected:', lat, lng);

        // Remove old marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add green farm marker
        const greenIcon = L.divIcon({
          className: 'farm-marker',
          html: `
            <div style="
              background-color: #84cc16;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #fff;
              box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                color: white;
                font-size: 16px;
              ">🌾</div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        markerRef.current = L.marker([lat, lng], { icon: greenIcon }).addTo(map);

        // Get address and structured parts for RSBSA form
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { 'User-Agent': 'AGRI-CHAIN-App' } }
          );
          const data = await response.json();

          if (data && data.display_name) {
            setSelectedAddress(data.display_name);
            const addr = data.address || {};
            const houseLotPurok = [addr.house_number, addr.road].filter(Boolean).join(' ').trim() || addr.house_number || addr.road || '';
            const streetSitioSubdv = addr.road || '';
            const barangay = addr.suburb || addr.village || addr.neighbourhood || addr.hamlet || '';
            const municipalityCity = addr.city || addr.municipality || addr.town || addr.county || '';
            const province = addr.state || '';
            const region = addr.region || addr.state || '';
            const addressParts = {
              address: data.display_name,
              houseLotPurok,
              streetSitioSubdv,
              barangay,
              municipalityCity,
              province,
              region,
            };
            if (onLocationSelect) {
              onLocationSelect({ lat, lng, address: data.display_name, addressParts });
            }
          }
        } catch (error) {
          console.error('❌ Error getting address:', error);
          setSelectedAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
          if (onLocationSelect) {
            onLocationSelect({ lat, lng, address: '', addressParts: null });
          }
        }
      });

      // Map loaded - final center
      setTimeout(() => {
        map.invalidateSize();
        map.setView(magsaysayCenter, initialZoom, { animate: false }); 
        setLoading(false);
        console.log('✅ Farm location picker ready - Magsaysay Street, Purok 10-A, Maniki centered!');
      }, 300);

    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        console.log('🗑️ Cleaning up map...');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount (onLocationSelect callback doesn't need to trigger re-init)

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-md z-[60]">
      <div className="bg-white w-full h-full overflow-hidden flex flex-col">
        
        {/* Farm-themed header */}
        <div className="bg-gradient-to-r from-lime-600 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <MapPin size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">🌾 Select Farm Location</h2>
                <p className="text-lime-100 text-sm mt-1">Magsaysay Street, Purok 10-A, Maniki, Kapalong - Click on the map to mark your farm location</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Map container - fills remaining space */}
        <div className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 bg-lime-50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-lime-200 border-t-lime-600 mb-3"></div>
                <p className="text-lime-700 font-semibold text-lg">Loading farm map...</p>
              </div>
            </div>
          )}
          
          <div
            ref={mapContainerRef}
            className="w-full h-full bg-lime-50"
          />
        </div>

        {/* Selected location display */}
        {selectedAddress && (
          <div className="bg-lime-50 border-t-2 border-lime-200 p-4">
            <div className="flex items-start gap-3">
              <div className="bg-lime-600 text-white p-2 rounded-full mt-1">
                <Navigation size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-lime-800 uppercase mb-1">Selected Farm Location</p>
                <p className="text-sm text-gray-700">{selectedAddress}</p>
              </div>
              <button
                onClick={onClose}
                className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!selectedAddress && (
          <div className="bg-lime-50 border-t-2 border-lime-200 p-4">
            <div className="flex items-center gap-2 text-lime-800">
              <span className="text-2xl">👆</span>
              <p className="text-sm font-medium">Click on the map to mark your farm location</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMapPicker;

