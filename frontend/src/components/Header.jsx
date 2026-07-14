import React, { useState } from 'react';
import { Shield, Bell, ShieldAlert, Check, Server } from 'lucide-react';

export default function Header({ constructions, onSelectSite, setTab }) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Get high confidence AI-detected issues as alerts
  const alerts = constructions
    .filter(c => c.status === 'Violation Confirmed' || c.status === 'Stop Work Order')
    .slice(0, 4);

  return (
    <header className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'between',
      padding: '12px 24px',
      borderRadius: '0 0 12px 12px',
      borderTop: 'none',
      marginBottom: '20px',
      background: 'rgba(15, 23, 42, 0.8)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Shield size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', lineHeight: '1.2', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
            AEGIS <span style={{ color: 'var(--accent-secondary)' }}>CONSTRUCT</span>
          </h1>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
            Online Municipal Construction Monitoring System
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto' }}>
        {/* API connection indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
          <Server size={14} />
          <span>API Connected</span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              position: 'relative',
              padding: '6px',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            className="glass-panel-interactive"
          >
            <Bell size={20} />
            {alerts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                background: 'var(--status-violation)',
                borderRadius: '50%',
                boxShadow: '0 0 8px var(--status-violation)'
              }}></span>
            )}
          </button>

          {showNotifications && (
            <div className="glass-panel animate-slide-in" style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              width: '320px',
              zIndex: 1000,
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>AI Scan Notifications</h4>
                <span className="badge badge-violation" style={{ fontSize: '0.65rem' }}>{alerts.length} ALERTS</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>
                    No critical alerts detected in last cycle.
                  </p>
                ) : (
                  alerts.map(site => (
                    <div 
                      key={site.id} 
                      onClick={() => {
                        onSelectSite(site.id);
                        setShowNotifications(false);
                      }}
                      className="glass-panel-interactive"
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'start'
                      }}
                    >
                      <ShieldAlert size={16} color="var(--status-violation)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {site.violation_type} Detected
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '220px' }}>
                          {site.address}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--status-review)', fontWeight: '600' }}>
                          Confidence: {site.ai_confidence}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button 
                onClick={() => {
                  setTab('constructions');
                  setShowNotifications(false);
                }}
                style={{
                  width: '100%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid var(--accent-primary)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  padding: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textAlign: 'center',
                  marginTop: '4px'
                }}
              >
                View All Monitored Sites
              </button>
            </div>
          )}
        </div>

        {/* User profile section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}>
            M
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Admin Portal</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Municipal Inspector</span>
          </div>
        </div>
      </div>
    </header>
  );
}
