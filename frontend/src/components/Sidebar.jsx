import React from 'react';
import { Map, List, FileWarning, BarChart3, Plus, Building, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeTab, setTab, constructions, reports, onOpenReportModal }) {
  const activeViolationsCount = constructions.filter(c => 
    ['Violation Confirmed', 'Stop Work Order', 'Demolition Scheduled'].includes(c.status)
  ).length;

  const pendingReportsCount = reports.filter(r => r.status === 'Pending').length;

  const menuItems = [
    { id: 'dashboard', label: 'Control Map', icon: Map, badge: null },
    { id: 'constructions', label: 'Monitored Sites', icon: List, badge: activeViolationsCount > 0 ? { count: activeViolationsCount, type: 'violation' } : null },
    { id: 'reports', label: 'Citizen Reports', icon: FileWarning, badge: pendingReportsCount > 0 ? { count: pendingReportsCount, type: 'review' } : null },
    { id: 'analytics', label: 'Analytics Portal', icon: BarChart3, badge: null },
  ];

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: 'calc(100vh - 120px)',
      position: 'sticky',
      top: '100px',
      background: 'rgba(15, 23, 42, 0.7)'
    }}>
      {/* Navigation Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '4px' }}>
          Navigation
        </span>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid transparent',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderColor: isActive ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 0 15px rgba(99, 102, 241, 0.1)' : 'none'
              }}
              className="glass-panel-interactive"
            >
              <Icon size={18} style={{ color: isActive ? 'var(--accent-secondary)' : 'inherit' }} />
              <span style={{ flexGrow: 1, fontSize: '0.85rem' }}>{item.label}</span>
              {item.badge && (
                <span 
                  className={`badge badge-${item.badge.type}`} 
                  style={{ 
                    padding: '2px 6px', 
                    fontSize: '0.65rem', 
                    borderRadius: '4px',
                    minWidth: '20px',
                    justifyContent: 'center'
                  }}
                >
                  {item.badge.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      <button
        onClick={onOpenReportModal}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '14px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: '600',
          cursor: 'pointer',
          marginTop: 'auto',
          fontSize: '0.85rem',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
        }}
      >
        <Plus size={18} />
        <span>Report Violation</span>
      </button>

      {/* Footer System Status Panel */}
      <div className="glass-panel" style={{
        padding: '12px',
        fontSize: '0.7rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'rgba(10, 15, 30, 0.4)',
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Building size={14} style={{ color: 'var(--accent-secondary)' }} />
          <span>Active Scans: 24/7 Live</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <ShieldAlert size={14} style={{ color: 'var(--status-violation)' }} />
          <span>Alerts Issued: {constructions.filter(c => c.status !== 'Authorized' && c.status !== 'Resolved').length}</span>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '2px', textAlign: 'center' }}>
          Municipal Drone & Satellite Link
        </div>
      </div>
    </aside>
  );
}
