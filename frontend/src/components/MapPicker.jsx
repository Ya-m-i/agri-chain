import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapPicker = ({ onLocationSelect }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Wait for container to be ready
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    console.log('🗺️ MapPicker: Initializing map...');

    // Use exact Kapalong Maniki coordinates as specified
    const kapalongManikiCenter = [7.591509, 125.696724]; // Exact Kapalong Maniki coordinates
    const kapalongZoom = 14; // Closer zoom to see Maniki area better

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: kapalongManikiCenter,
      zoom: kapalongZoom,
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: 11,  // Allow some zoom out to see surrounding areas
      maxZoom: 18,
      // Wider bounds to allow movement within Kapalong municipality
      maxBounds: [
        [7.50, 125.65],  // Southwest - covers Kapalong area
        [7.70, 125.75]   // Northeast - covers Kapalong area
      ],
      maxBoundsViscosity: 1.0, // Allow easier movement within bounds
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Store map instance
    mapInstanceRef.current = map;
    
    // Force set view to Kapalong Maniki area after initialization
    setTimeout(() => {
      map.setView(kapalongManikiCenter, kapalongZoom, { animate: false });
      console.log('📍 MapPicker centered on Kapalong Maniki:', kapalongManikiCenter);
    }, 100);

    // Add click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log('🗺️ MapPicker: Location selected:', { lat, lng });

      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      // Create custom farm marker icon with visible styling
      const farmIcon = L.divIcon({
        className: 'farm-marker-icon',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
              background-color: #84cc16;
              width: 40px;
              height: 40px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 4px solid #000000;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 15px rgba(132, 204, 22, 0.6);
          "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              font-size: 20px;
              line-height: 1;
              z-index: 10;
            ">🌾</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      markerRef.current = L.marker([lat, lng], {
        icon: farmIcon,
        draggable: false,
      }).addTo(map);

      // Call callback with location
      if (onLocationSelect) {
        onLocationSelect({ lat, lng });
      }
    });

    // Invalidate size after short delay and ensure centered on Kapalong Maniki
    setTimeout(() => {
      map.invalidateSize();
      map.setView(kapalongManikiCenter, kapalongZoom, { animate: false }); 
      console.log('✅ MapPicker: Map initialized and centered on Kapalong Maniki');
    }, 300);

    // Cleanup on unmount
    return () => {
      console.log('🗑️ MapPicker: Cleaning up map...');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount (onLocationSelect callback doesn't need to trigger re-init)

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{
        backgroundColor: '#e5e7eb',
      }}
    />
  );
};

export default MapPicker;

