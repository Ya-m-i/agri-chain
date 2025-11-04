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

    // Always use Kapalong Maniki area as center
    const kapalongManikiCenter = [7.584813, 125.706932]; // Kapalong Maniki area coordinates
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
        [7.50, 125.75],  // Southwest - covers Kapalong area
        [7.70, 125.95]   // Northeast - covers Kapalong area
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
      console.log('📍 MapPicker centered on Kapalong Maniki area:', kapalongManikiCenter);
    }, 100);

    // Add click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log('🗺️ MapPicker: Location selected:', { lat, lng });

      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      // Add new marker with visible geotagging icon
      // Fix Leaflet default icon issue by using a custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker-lime',
        html: `<div style="
          background-color: #84cc16; 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          border: 3px solid #000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background-color: #000;
            border-radius: 50%;
          "></div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      markerRef.current = L.marker([lat, lng], {
        icon: customIcon,
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
      console.log('✅ MapPicker: Map initialized and centered on Kapalong Maniki area');
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

