import React, { useState } from 'react';
import { Check, ClipboardList, MapPin, User, FileText } from 'lucide-react';

export default function ReportsList({ reports, onApproveReport }) {
  const [approvingId, setApprovingId] = useState(null);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/reports/${id}/approve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        onApproveReport(id, data.site);
        alert("Citizen report approved. Site is now registered under active GIS monitoring.");
      } else {
        alert("Failed to approve report: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process approval.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="glass-panel animate-slide-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Incoming Citizen & Inspector Reports</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Incidents reported via citizen portal or mobile inspection units waiting for verification.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No pending violation reports in the queue.
          </div>
        ) : (
          reports.map(report => (
            <div 
              key={report.id} 
              className="glass-panel" 
              style={{ 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.01)',
                borderColor: report.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'
              }}
            >
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-review" style={{ fontSize: '0.65rem' }}>REPORT #{report.id}</span>
                  <span className="badge" style={{ 
                    fontSize: '0.65rem',
                    backgroundColor: report.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: report.status === 'Approved' ? 'var(--status-authorized)' : 'var(--status-review)',
                    borderColor: report.status === 'Approved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                  }}>{report.status}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Submitted: {new Date(report.created_at).toLocaleString()}
                </span>
              </div>

              {/* Grid content */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} style={{ color: 'var(--accent-secondary)' }} />
                    <strong style={{ color: '#fff' }}>Address & Location</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', paddingLeft: '20px' }}>
                    {report.address}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: '20px' }}>
                    GIS coordinates: {report.latitude}, {report.longitude}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <User size={14} />
                    <strong style={{ color: '#fff' }}>Reporter Info</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', paddingLeft: '20px' }}>
                    {report.reporter_name}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: '20px' }}>
                    Contact: {report.reporter_contact}
                  </span>
                </div>

              </div>

              {/* Description */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <FileText size={14} />
                  <span>Observation Details</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {report.description}
                </p>
              </div>

              {/* Action Buttons */}
              {report.status === 'Pending' && (
                <div style={{ display: 'flex', justifyContent: 'end', marginTop: '8px' }}>
                  <button
                    onClick={() => handleApprove(report.id)}
                    disabled={approvingId !== null}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid var(--status-authorized)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    className="glass-panel-interactive"
                  >
                    <Check size={14} style={{ color: 'var(--status-authorized)' }} />
                    <span>{approvingId === report.id ? "Approving site..." : "Approve & Start Monitoring"}</span>
                  </button>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}
