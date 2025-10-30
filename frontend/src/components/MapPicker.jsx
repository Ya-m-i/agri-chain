import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapPicker = ({ onLocationSelect, initialCenter = [7.5815, 125.8235], initialZoom = 13 }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Wait for container to be ready
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    console.log('🗺️ MapPicker: Initializing map...');

    // Always use Kapalong as center
    const kapalongCenter = [7.5815, 125.8235];
    const kapalongZoom = 13;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: kapalongCenter,
      zoom: kapalongZoom,
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: 11,
      maxZoom: 18,
      // Keep map centered on Kapalong area
      maxBounds: [
        [7.3, 125.5],  // Southwest corner
        [7.9, 126.1]   // Northeast corner
      ],
      maxBoundsViscosity: 0.5,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Store map instance
    mapInstanceRef.current = map;
    
    // Force set view to Kapalong after initialization
    setTimeout(() => {
      map.setView(kapalongCenter, kapalongZoom);
      console.log('📍 MapPicker centered on Kapalong:', kapalongCenter);
    }, 100);

    // Add click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log('🗺️ MapPicker: Location selected:', { lat, lng });

      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      // Add new marker
      markerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker-lime',
          html: `<div style="
            background-color: #84cc16; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            border: 3px solid #000;
            box-shadow: 0 0 10px rgba(132, 204, 22, 0.8);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(map);

      // Call callback with location
      if (onLocationSelect) {
        onLocationSelect({ lat, lng });
      }
    });

    // Invalidate size after short delay and ensure centered
    setTimeout(() => {
      map.invalidateSize();
      map.setView(kapalongCenter, kapalongZoom); // Ensure centered after size calculation
      console.log('✅ MapPicker: Map initialized and centered on Kapalong successfully');
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
  }, []); // Empty dependency array - only run once on mount

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '500px',
        minHeight: '500px',
        backgroundColor: '#e5e7eb',
        borderRadius: '8px',
        border: '2px solid #84cc16',
      }}
    />
  );
};

export default MapPicker;

