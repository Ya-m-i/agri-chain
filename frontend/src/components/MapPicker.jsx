import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapPicker = ({ onLocationSelect, initialCenter = [7.5750, 125.8280], initialZoom = 14 }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Wait for container to be ready
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    console.log('🗺️ MapPicker: Initializing map...');

    // Always use Maniki, Kapalong as center (Department of Agriculture scope)
    const manikiKapalongCenter = [7.5750, 125.8280]; // Maniki area coordinates
    const manikiZoom = 14; // Higher zoom for Maniki focus

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: manikiKapalongCenter,
      zoom: manikiZoom,
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: 12,  // Prevent zooming out too far from Maniki
      maxZoom: 18,
      // Keep map focused on Maniki, Kapalong area (Department of Agriculture scope)
      maxBounds: [
        [7.52, 125.78],  // Southwest corner - Maniki bounds
        [7.63, 125.88]   // Northeast corner - Maniki bounds
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
    
    // Force set view to Maniki, Kapalong after initialization
    setTimeout(() => {
      map.setView(manikiKapalongCenter, manikiZoom, { animate: false });
      console.log('📍 MapPicker centered on Maniki, Kapalong:', manikiKapalongCenter);
    }, 100);

    // Additional force center to ensure Maniki focus
    setTimeout(() => {
      map.setView(manikiKapalongCenter, manikiZoom, { animate: false });
      console.log('🔒 MapPicker locked to Maniki, Kapalong center');
    }, 250);

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

    // Invalidate size after short delay and ensure centered on Maniki
    setTimeout(() => {
      map.invalidateSize();
      map.setView(manikiKapalongCenter, manikiZoom, { animate: false, reset: true }); // Force immediate center
      console.log('✅ MapPicker: Map initialized and centered on Maniki, Kapalong successfully');
    }, 400);

    // Additional forced center after map is fully loaded
    setTimeout(() => {
      map.setView(manikiKapalongCenter, manikiZoom, { animate: false, reset: true });
      console.log('🔄 MapPicker: Final center lock on Maniki, Kapalong');
    }, 600);

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

