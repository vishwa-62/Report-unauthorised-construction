import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, MapPin, Percent, FileText, AlertTriangle, ShieldCheck, History, Hammer, Check } from 'lucide-react';

export default function DetailsModal({ siteId, onClose, onUpdateStatus }) {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [actionStatus, setActionStatus] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const sliderRef = useRef(null);

  // Fetch site details on load or siteId change
  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/constructions/${siteId}`);
        const data = await res.json();
        setSite(data);
        setActionStatus(data.status);
      } catch (err) {
        console.error("Error fetching site details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (siteId) {
      fetchDetails();
    }
  }, [siteId]);

  // Handle Before/After image slider dragging
  const handleSliderMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) { // Left click dragging
      handleSliderMove(e.clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleSliderClick = (e) => {
    handleSliderMove(e.clientX);
  };

  // Submit status update to backend API
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionStatus) return;

    setSubmittingAction(true);
    try {
      const res = await fetch(`http://localhost:5000/api/constructions/${siteId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionStatus,
          description: actionNotes || `Status updated to ${actionStatus}`,
          userRole: 'Admin'
        })
      });
      const updatedSite = await res.json();
      setSite(updatedSite);
      onUpdateStatus(updatedSite);
      setActionNotes('');
      alert("Municipal control action logged successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update construction status.");
    } finally {
      setSubmittingAction(false);
    }
  };

  if (!siteId) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Authorized': return '#10b981';
      case 'Under Review': return '#f59e0b';
      case 'Violation Confirmed': return '#ef4444';
      case 'Stop Work Order': return '#f97316';
      case 'Demolition Scheduled': return '#8b5cf6';
      case 'Resolved': return '#3b82f6';
      default: return '#6b7280';
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
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
                MONITORING PROFILE
              </span>
              <span className="badge badge-review" style={{ fontSize: '0.65rem' }}>SITE #{siteId}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff' }}>
              {loading ? "Loading site details..." : site.address}
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              transition: 'background 0.2s'
            }}
            className="glass-panel-interactive"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Retrieving site drone registry and GIS datasets...
          </div>
        ) : (
          <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Upper Two-Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              
              {/* Left Column: Image Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                  Interactive Satellite Evidence Slider
                </span>
                
                <div 
                  ref={sliderRef}
                  className="slider-container"
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  onMouseDown={handleSliderClick}
                  style={{ cursor: 'ew-resize' }}
                >
                  {/* Before (Bottom Layer) */}
                  <div 
                    className="slider-image-before"
                    style={{ backgroundImage: `url(${site.image_before})` }}
                  >
                    <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', color: '#fff', fontWeight: '600' }}>
                      BEFORE (PRE-CONSTRUCTION)
                    </span>
                  </div>

                  {/* After (Top Layer, Width cropped) */}
                  <div 
                    className="slider-image-after"
                    style={{ 
                      backgroundImage: `url(${site.image_after})`,
                      width: `${sliderPosition}%`,
                      borderRight: '1px solid #fff'
                    }}
                  >
                    <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', color: '#fff', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      AFTER (CURRENT SCAN)
                    </span>
                  </div>

                  {/* Slider drag bar handle */}
                  <div 
                    className="slider-bar-handle"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="slider-button">↔</div>
                  </div>
                </div>
                
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  *Drag the white handle left/right to compare baseline vs. detected construction.
                </span>
              </div>

              {/* Right Column: Details & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Metrics Card */}
                <div className="glass-panel" style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(10, 15, 30, 0.4)' }}>
                  
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Status Classification</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className="badge" style={{ 
                        backgroundColor: `${getStatusColor(site.status)}1f`,
                        color: getStatusColor(site.status),
                        borderColor: `${getStatusColor(site.status)}4d`
                      }}>{site.status}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>AI Scan Confidence</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: 'bold', color: site.ai_confidence > 75 ? 'var(--status-violation)' : 'inherit' }}>
                      <Percent size={14} />
                      <span>{site.ai_confidence}% Match</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Violation Classification</span>
                    <div style={{ fontSize: '0.8rem', fontWeight: '500', marginTop: '2px', color: site.violation_type !== 'None' ? 'var(--status-violation)' : 'var(--text-primary)' }}>
                      {site.violation_type}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Zoning District</span>
                    <div style={{ fontSize: '0.8rem', fontWeight: '500', marginTop: '2px' }}>{site.zoning_type}</div>
                  </div>

                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} style={{ color: 'var(--accent-secondary)' }} />
                      <span>{site.latitude}, {site.longitude}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>Permit: {site.permit_number || 'N/A'}</span>
                    </div>
                  </div>

                </div>

                {/* Enforcement Actions Form */}
                <form onSubmit={handleActionSubmit} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                    Municipal Enforcement Panel
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Action Command</label>
                    <select
                      value={actionStatus}
                      onChange={(e) => setActionStatus(e.target.value)}
                      style={{
                        background: 'rgba(10, 15, 30, 0.6)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    >
                      <option value="Authorized">Approve / Authorize Construction</option>
                      <option value="Under Review">Dispatch Inspector (Under Review)</option>
                      <option value="Violation Confirmed">Confirm Building Code Violation</option>
                      <option value="Stop Work Order">Post Stop Work Order</option>
                      <option value="Demolition Scheduled">Schedule Forced Demolition</option>
                      <option value="Resolved">Resolve Violation Case</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Action Logging Notes</label>
                    <textarea
                      placeholder="Input legal logs, inspection notes, or field details here..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      style={{
                        background: 'rgba(10, 15, 30, 0.6)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        height: '60px',
                        resize: 'none',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAction}
                    style={{
                      background: 'var(--accent-primary)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '10px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {submittingAction ? "Filing Case Updates..." : "Execute Command"}
                  </button>
                </form>

              </div>

            </div>

            {/* Audit History Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={14} style={{ color: 'var(--accent-secondary)' }} />
                <span>Audit Registry & Chronological Log</span>
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {site.logs && site.logs.map(log => (
                  <div 
                    key={log.id} 
                    style={{ 
                      padding: '12px 16px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                      <div style={{ 
                        marginTop: '2px',
                        padding: '4px',
                        borderRadius: '4px',
                        background: log.user_role === 'System AI' ? 'rgba(99,102,241,0.15)' : log.user_role === 'Inspector' ? 'rgba(6,182,212,0.15)' : 'rgba(139,92,246,0.15)',
                        color: log.user_role === 'System AI' ? 'var(--accent-primary)' : log.user_role === 'Inspector' ? 'var(--accent-secondary)' : 'var(--status-demolition)'
                      }}>
                        <FileText size={14} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                          {log.description}
                        </p>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          Action by: <strong>{log.user_role}</strong>
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
