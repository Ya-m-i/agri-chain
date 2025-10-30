import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
// Import leaflet-draw and ensure L is available globally
import 'leaflet-draw';
import { MapPin, X, Ruler, Square, Pentagon } from 'lucide-react';

// Ensure Leaflet is available globally for leaflet-draw
if (typeof window !== 'undefined') {
  window.L = L;
}

const DrawableMapPicker = ({ onLocationSelect, onAreaCalculated, onClose, initialArea }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [calculatedArea, setCalculatedArea] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawingMode, setDrawingMode] = useState(null); // 'rectangle', 'polygon', null

  useEffect(() => {
    if (!mapContainerRef.current) {
      console.log('⏳ Waiting for map container...');
      return;
    }

    if (mapInstanceRef.current) {
      console.log('✅ Map already initialized');
      return;
    }

    console.log('🗺️ Initializing drawable farm location picker...');

    try {
      // Create map centered on Kapalong DA area
      const kapalongDACenter = [7.6042, 125.8450];
      const kapalongZoom = 15; // Closer zoom for field drawing

      const map = L.map(mapContainerRef.current, {
        center: kapalongDACenter,
        zoom: kapalongZoom,
        zoomControl: true,
        minZoom: 11,
        maxZoom: 19,
        maxBounds: [
          [7.50, 125.75],
          [7.70, 125.95]
        ],
        maxBoundsViscosity: 1.0,
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Initialize FeatureGroup to store drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      // Add draw control
      const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            drawError: {
              color: '#e74c3c',
              message: '<strong>Error:</strong> Shape edges cannot cross!'
            },
            shapeOptions: {
              color: '#84cc16',
              fillColor: '#84cc16',
              fillOpacity: 0.3,
              weight: 3
            }
          },
          rectangle: {
            shapeOptions: {
              color: '#84cc16',
              fillColor: '#84cc16',
              fillOpacity: 0.3,
              weight: 3
            }
          },
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false
        },
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      });

      map.addControl(drawControl);

      // Helper function to calculate polygon area using shoelace formula
      const calculateGeodesicArea = (latlngs) => {
        const earthRadius = 6371000; // Earth radius in meters
        let area = 0;
        
        if (latlngs.length > 2) {
          for (let i = 0; i < latlngs.length; i++) {
            const j = (i + 1) % latlngs.length;
            const xi = latlngs[i].lng * Math.PI / 180;
            const yi = latlngs[i].lat * Math.PI / 180;
            const xj = latlngs[j].lng * Math.PI / 180;
            const yj = latlngs[j].lat * Math.PI / 180;
            
            area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
          }
          
          area = Math.abs(area * earthRadius * earthRadius / 2.0);
        }
        
        return area;
      };

      // Handle drawing created
      map.on(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer;
        
        // Clear previous drawings
        drawnItems.clearLayers();
        
        // Add new drawing
        drawnItems.addLayer(layer);

        // Calculate area in square meters
        let areaInSquareMeters = 0;
        
        if (e.layerType === 'rectangle' || e.layerType === 'polygon') {
          const latlngs = layer.getLatLngs()[0];
          areaInSquareMeters = calculateGeodesicArea(latlngs);
        }

        // Convert to hectares (1 hectare = 10,000 square meters)
        const areaInHectares = (areaInSquareMeters / 10000).toFixed(4);
        
        console.log('📏 Area calculated:', areaInHectares, 'hectares');
        setCalculatedArea(areaInHectares);

        // Get center point of drawn shape
        const bounds = layer.getBounds();
        const center = bounds.getCenter();

        // Reverse geocode to get address
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&addressdetails=1`,
          { headers: { 'User-Agent': 'AGRI-CHAIN-App' } }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              setSelectedAddress(data.display_name);
            }
          })
          .catch((error) => {
            console.error('❌ Error getting address:', error);
            setSelectedAddress(`${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`);
          });

        // Send data back to parent
        if (onAreaCalculated) {
          onAreaCalculated({
            area: parseFloat(areaInHectares),
            center: { lat: center.lat, lng: center.lng },
            bounds: layer.getLatLngs()[0],
            type: e.layerType
          });
        }

        if (onLocationSelect) {
          onLocationSelect({
            lat: center.lat,
            lng: center.lng,
            address: selectedAddress || ''
          });
        }

        // Add area label to the shape
        const areaLabel = L.tooltip({
          permanent: true,
          direction: 'center',
          className: 'area-label'
        })
          .setContent(`<strong>${areaInHectares} hectares</strong>`)
          .setLatLng(center);
        
        layer.bindTooltip(areaLabel).openTooltip();
      });

      // Handle drawing edited
      map.on(L.Draw.Event.EDITED, (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
          let areaInSquareMeters = 0;
          
          if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            const latlngs = layer.getLatLngs()[0];
            areaInSquareMeters = calculateGeodesicArea(latlngs);
          }

          const areaInHectares = (areaInSquareMeters / 10000).toFixed(4);
          setCalculatedArea(areaInHectares);

          if (onAreaCalculated) {
            const bounds = layer.getBounds();
            const center = bounds.getCenter();
            onAreaCalculated({
              area: parseFloat(areaInHectares),
              center: { lat: center.lat, lng: center.lng },
              bounds: layer.getLatLngs()[0],
              type: layer instanceof L.Rectangle ? 'rectangle' : 'polygon'
            });
          }
        });
      });

      // Handle drawing deleted
      map.on(L.Draw.Event.DELETED, () => {
        setCalculatedArea(0);
        setSelectedAddress('');
        if (onAreaCalculated) {
          onAreaCalculated({ area: 0, center: null, bounds: null, type: null });
        }
      });

      // Center map and finish loading
      setTimeout(() => {
        map.setView(kapalongDACenter, kapalongZoom, { animate: false });
        map.invalidateSize();
        setLoading(false);
        console.log('✅ Drawable farm location picker ready!');
      }, 300);

    } catch (error) {
      console.error('❌ Error initializing drawable map:', error);
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        console.log('🗑️ Cleaning up drawable map...');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        drawnItemsRef.current = null;
      }
    };
  }, [onAreaCalculated, onLocationSelect, selectedAddress]);

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-md z-50">
      <style>{`
        .area-label {
          background: rgba(132, 204, 22, 0.9);
          border: 2px solid #65a30d;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          padding: 8px 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .leaflet-draw-toolbar a {
          background-color: #84cc16 !important;
        }
        .leaflet-draw-toolbar a:hover {
          background-color: #65a30d !important;
        }
      `}</style>
      
      <div className="bg-white w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-lime-600 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Ruler size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">🌾 Draw Farm Field Area</h2>
                <p className="text-lime-100 text-sm mt-1">
                  Use drawing tools to mark your crop field boundary - Area will be calculated automatically
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Instructions Bar */}
        <div className="bg-lime-50 border-b-2 border-lime-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Square className="text-lime-700" size={20} />
              <span className="text-sm font-semibold text-lime-800">Rectangle Tool</span>
              <span className="text-xs text-gray-600">- For regular fields</span>
            </div>
            <div className="flex items-center gap-2">
              <Pentagon className="text-lime-700" size={20} />
              <span className="text-sm font-semibold text-lime-800">Polygon Tool</span>
              <span className="text-xs text-gray-600">- For irregular fields</span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 bg-lime-50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-lime-200 border-t-lime-600 mb-3"></div>
                <p className="text-lime-700 font-semibold text-lg">Loading drawing tools...</p>
              </div>
            </div>
          )}
          
          <div
            ref={mapContainerRef}
            className="w-full h-full bg-lime-50"
          />
        </div>

        {/* Area Display Footer */}
        {calculatedArea > 0 && (
          <div className="bg-lime-600 text-white p-6 border-t-4 border-lime-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <Ruler size={32} />
                </div>
                <div>
                  <p className="text-sm text-lime-100 uppercase tracking-wide font-semibold">Calculated Area</p>
                  <p className="text-4xl font-bold">{calculatedArea} hectares</p>
                  {selectedAddress && (
                    <p className="text-sm text-lime-100 mt-2">📍 {selectedAddress}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white text-lime-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-lime-50 transition-all shadow-lg"
              >
                ✓ Confirm & Use This Area
              </button>
            </div>
          </div>
        )}

        {/* Instructions when no area drawn */}
        {calculatedArea === 0 && !loading && (
          <div className="bg-lime-50 border-t-2 border-lime-200 p-6">
            <div className="text-center">
              <Ruler className="inline-block text-lime-600 mb-2" size={32} />
              <p className="text-lime-800 font-semibold text-lg">
                👆 Click the drawing tools on the right to start
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Draw a rectangle or polygon around your crop field area
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawableMapPicker;

