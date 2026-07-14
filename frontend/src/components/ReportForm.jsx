import React, { useState, useEffect } from 'react';
import { X, MapPin, Clipboard, Send, User, Phone } from 'lucide-react';

export default function ReportForm({ coords, onClose, onSubmitReport }) {
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Autofill coords if passed from map click
  useEffect(() => {
    if (coords) {
      setLatitude(coords.lat.toString());
      setLongitude(coords.lng.toString());
      // Mock geocoding search address based on coordinates
      setAddress(`Approximate near GIS Lat ${coords.lat}, Lng ${coords.lng}, San Francisco`);
    }
  }, [coords]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !latitude || !longitude || !description) {
      alert("Please fill in address, coordinates, and report description.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          description,
          reporter_name: reporterName || 'Anonymous Citizen',
          reporter_contact: reporterContact || 'N/A',
          image_url: '/images/report_default.jpg'
        })
      });
      const newReport = await res.json();
      onSubmitReport(newReport);
      alert("Unauthorized construction report registered. Thank you for your alert.");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to submit report. Please check API connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 7, 12, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div 
        className="glass-panel animate-slide-in" 
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Report Violation</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
              CITIZEN / INSPECTOR VIOLATION REGISTRY
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              transition: 'background 0.2s'
            }}
            className="glass-panel-interactive"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Coordinates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Latitude *</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} color="var(--accent-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="number" 
                  step="0.000001"
                  required
                  placeholder="e.g. 37.7749"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(10, 15, 30, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '8px 10px 8px 30px',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Longitude *</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} color="var(--accent-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="number" 
                  step="0.000001"
                  required
                  placeholder="e.g. -122.4194"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(10, 15, 30, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '8px 10px 8px 30px',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Site Location / Address *</label>
            <input 
              type="text" 
              required
              placeholder="Input street address, intersection, or city quadrant details..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 30, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Observation Details *</label>
            <textarea 
              required
              placeholder="Describe details of suspected unauthorized construction (e.g. encroachment, extra floors, building without permit signboard)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 30, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                height: '80px',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

          {/* Reporter Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Reporter Name (Optional)</label>
              <div style={{ position: 'relative' }}>
                <User size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Anonymous Citizen"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(10, 15, 30, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '8px 10px 8px 30px',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Reporter Contact (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Email or phone"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(10, 15, 30, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '8px 10px 8px 30px',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontWeight: '600',
              padding: '12px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
            }}
          >
            <Send size={14} />
            <span>{submitting ? "Registering Alert..." : "Transmit Report"}</span>
          </button>
          
        </form>
      </div>
    </div>
  );
}
