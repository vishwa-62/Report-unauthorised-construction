import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({ constructions, onSelectSite, onMapClickCoords }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Authorized': return '#10b981'; // Emerald
      case 'Under Review': return '#f59e0b'; // Amber
      case 'Violation Confirmed': return '#ef4444'; // Red
      case 'Stop Work Order': return '#f97316'; // Orange
      case 'Demolition Scheduled': return '#8b5cf6'; // Purple
      case 'Resolved': return '#3b82f6'; // Blue
      default: return '#6b7280'; // Grey
    }
  };

  useEffect(() => {
    // Initialize map if not already initialized
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [37.78, -122.44], // San Francisco center
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      // Add dark tile layer using OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);

      // Add attribution control at bottom right
      L.control.attribution({ prefix: false }).addTo(mapRef.current);

      // Click on map event to report new construction
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onMapClickCoords({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
      });
    }

    return () => {
      // Clean up map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when constructions data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = {};

    // Plot new markers
    constructions.forEach(site => {
      const color = getStatusColor(site.status);
      const isCritical = ['Violation Confirmed', 'Stop Work Order', 'Demolition Scheduled'].includes(site.status);

      // Custom HTML Pin with dynamic pulsating effect
      const pinHtml = `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 12px;
            height: 12px;
            background: ${color};
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 0 10px ${color};
            z-index: 2;
          "></div>
          ${isCritical ? `
            <div style="
              position: absolute;
              width: 24px;
              height: 24px;
              background: ${color};
              border-radius: 50%;
              opacity: 0.4;
              animation: pinPulse 1.5s infinite ease-out;
              z-index: 1;
            "></div>
          ` : ''}
        </div>
      `;

      // CSS keyframe for marker pulsation if not already added
      if (!document.getElementById('leaflet-custom-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'leaflet-custom-pulse-style';
        style.innerHTML = `
          @keyframes pinPulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2.0); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-leaflet-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon })
        .addTo(mapRef.current);

      // Popup content
      const popupContent = `
        <div style="padding: 4px; font-family: var(--font-sans);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
            <strong style="color: #fff; font-size: 0.8rem; font-family: var(--font-display); letter-spacing: 0.5px;">SITE #${site.id}</strong>
            <span style="
              font-size: 0.6rem; 
              font-weight: bold; 
              color: ${color};
              border: 1px solid ${color}4d;
              background: ${color}1a;
              padding: 2px 6px;
              border-radius: 4px;
              text-transform: uppercase;
            ">${site.status}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.75rem; margin: 4px 0 8px 0; max-width: 220px; line-height: 1.3;">
            ${site.address}
          </p>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px;">
            <span style="font-size: 0.65rem; color: var(--text-muted);">
              Confidence: <strong style="color: #fff;">${site.ai_confidence}%</strong>
            </span>
            <button id="marker-btn-${site.id}" style="
              background: var(--accent-primary);
              border: none;
              color: #fff;
              font-size: 0.65rem;
              padding: 3px 8px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 600;
              transition: background 0.2s;
            ">View Details</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 260 });

      // Add click handler inside popup
      marker.on('popupopen', () => {
        const btn = document.getElementById(`marker-btn-${site.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectSite(site.id);
          });
        }
      });

      markersRef.current[site.id] = marker;
    });

  }, [constructions]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%' }}
      />
      {/* HUD overlay info box */}
      <div 
        className="glass-panel" 
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 999,
          padding: '12px 16px',
          pointerEvents: 'none',
          background: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
          Map Viewport Details
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
          <span>Authorized Structures ({constructions.filter(c => c.status === 'Authorized').length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>
          <span>Under Inspection ({constructions.filter(c => c.status === 'Under Review').length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
          <span>Active Violations ({constructions.filter(c => ['Violation Confirmed', 'Stop Work Order', 'Demolition Scheduled'].includes(c.status)).length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
          <span>Resolved Cases ({constructions.filter(c => c.status === 'Resolved').length})</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          *Click anywhere on map to file a new report
        </div>
      </div>
    </div>
  );
}
