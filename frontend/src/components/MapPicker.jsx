import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ensure Leaflet is available globally
if (typeof window !== 'undefined') {
  window.L = L;
}

const MapPicker = ({ onLocationSelect, initialCenter = [7.6042, 125.8450], initialZoom = 13 }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Wait for container to be ready
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    console.log('🗺️ MapPicker: Initializing map...');

    // Always use Kapalong DA area as center (Pag-asa/Maniki area)
    const kapalongDACenter = [7.6042, 125.8450]; // Kapalong center (near DA office and Pag-asa)
    const kapalongZoom = 13; // Good zoom to see the area

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: kapalongDACenter,
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
    
    // Force set view to Kapalong DA area after initialization
    setTimeout(() => {
      map.setView(kapalongDACenter, kapalongZoom, { animate: false });
      console.log('📍 MapPicker centered on Kapalong (Pag-asa area):', kapalongDACenter);
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

    // Invalidate size after short delay and ensure centered on Kapalong
    setTimeout(() => {
      map.invalidateSize();
      map.setView(kapalongDACenter, kapalongZoom, { animate: false }); 
      console.log('✅ MapPicker: Map initialized and centered on Kapalong DA area');
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
      className="w-full h-full"
      style={{
        backgroundColor: '#e5e7eb',
      }}
    />
  );
};

export default MapPicker;

