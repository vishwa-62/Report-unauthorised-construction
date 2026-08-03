import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Leaflet assets styling fix (resolves standard icon loading bug in webpack/vite environments)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapContainer = ({ 
  complaints = [], 
  center = [18.5204, 73.8567], 
  zoom = 13, 
  interactive = false, 
  onLocationSelect = null,
  selectedLocation = null
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);
  const heatmapGroup = useRef(null);
  const clickMarker = useRef(null);
  const navigate = useNavigate();

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Define Tile Layers
    const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    const terrainTiles = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap'
    });

    // Create Leaflet Instance
    mapInstance.current = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      layers: [streetTiles] // Default layer
    });

    // Layer Controller
    const baseMaps = {
      "Street Map": streetTiles,
      "Satellite": satelliteTiles,
      "Terrain": terrainTiles
    };
    L.control.layers(baseMaps).addTo(mapInstance.current);

    // Initialize groups
    markersGroup.current = L.layerGroup().addTo(mapInstance.current);
    heatmapGroup.current = L.layerGroup().addTo(mapInstance.current);

    // Click to select location (if interactive registration)
    if (interactive && onLocationSelect) {
      mapInstance.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        if (clickMarker.current) {
          clickMarker.current.setLatLng(e.latlng);
        } else {
          clickMarker.current = L.marker(e.latlng, {
            draggable: true,
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })
          }).addTo(mapInstance.current);

          clickMarker.current.on('dragend', () => {
            const pos = clickMarker.current.getLatLng();
            onLocationSelect(pos.lat, pos.lng);
          });
        }
        
        onLocationSelect(lat, lng);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Sync selected location external marker
  useEffect(() => {
    if (!mapInstance.current) return;

    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      const pos = [selectedLocation.lat, selectedLocation.lng];
      mapInstance.current.setView(pos, 15);
      
      if (clickMarker.current) {
        clickMarker.current.setLatLng(pos);
      } else {
        clickMarker.current = L.marker(pos, {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
          })
        }).addTo(mapInstance.current);
      }
    }
  }, [selectedLocation]);

  // Sync markers and heatmaps
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current || !heatmapGroup.current) return;

    // Clear old layers
    markersGroup.current.clearLayers();
    heatmapGroup.current.clearLayers();

    if (complaints.length === 0) return;

    complaints.forEach((item) => {
      if (!item.latitude || !item.longitude) return;

      const position = [parseFloat(item.latitude), parseFloat(item.longitude)];

      // 1. Determine Marker Icon Color based on status
      let iconColor = 'blue';
      if (item.status === 'pending') iconColor = 'red';
      else if (item.status === 'under_review') iconColor = 'orange';
      else if (item.status === 'assigned') iconColor = 'gold';
      else if (item.status === 'inspected') iconColor = 'violet';
      else if (item.status === 'verified') iconColor = 'black';
      else if (item.status === 'resolved') iconColor = 'green';
      else if (item.status === 'rejected') iconColor = 'grey';

      const customIcon = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });

      // 2. Setup popup content
      const popupHtml = `
        <div class="p-1 min-w-[160px] text-slate-800 dark:text-slate-100">
          <p class="font-extrabold text-xs text-brand-600">${item.complaint_number || 'Complaint Details'}</p>
          <p class="text-[10px] text-slate-400 capitalize font-semibold mb-1">${item.category_name || item.custom_category || 'General Violation'}</p>
          <p class="text-[11px] font-normal leading-snug truncate max-w-[150px] mb-2">${item.description}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="px-2 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider bg-slate-100 text-slate-700" style="
              background-color: ${item.status === 'resolved' ? '#dcfce7' : item.status === 'pending' ? '#fee2e2' : '#fef9c3'};
              color: ${item.status === 'resolved' ? '#15803d' : item.status === 'pending' ? '#b91c1c' : '#a16207'};
            ">${item.status}</span>
            <button id="btn-${item.id}" class="text-[10px] bg-brand-500 hover:bg-brand-600 text-white font-bold py-1 px-2 rounded cursor-pointer transition-colors">Details</button>
          </div>
        </div>
      `;

      // 3. Add marker
      const marker = L.marker(position, { icon: customIcon })
        .bindPopup(popupHtml)
        .addTo(markersGroup.current);

      // Handle popup redirect link callback
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/complaints/${item.id}`);
          };
        }
      });

      // 4. Draw density/severity heatmap circles (semi-transparent overlays)
      const severityColor = item.severity === 'critical' ? '#ef4444' : item.severity === 'high' ? '#f97316' : '#eab308';
      const radius = item.severity === 'critical' ? 120 : item.severity === 'high' ? 80 : 50;

      L.circle(position, {
        color: severityColor,
        fillColor: severityColor,
        fillOpacity: 0.12,
        radius: radius,
        stroke: false
      }).addTo(heatmapGroup.current);
    });

    // Auto fit map bounds if multiple markers exist and center isn't customized
    if (complaints.length > 1 && !selectedLocation) {
      const bounds = complaints.map(c => [c.latitude, c.longitude]);
      mapInstance.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [complaints, selectedLocation]);

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800/50">
      <div ref={mapRef} className="h-full w-full z-0" />
      {interactive && (
        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-bold z-10">
          💡 Click map to pick location coordinates
        </div>
      )}
    </div>
  );
};

export default MapContainer;
