import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import Analytics from './components/Analytics';
import ConstructionList from './components/ConstructionList';
import DetailsModal from './components/DetailsModal';
import ReportForm from './components/ReportForm';
import ReportsList from './components/ReportsList';
import { Eye, ShieldAlert, FileWarning } from 'lucide-react';

export default function App() {
  const [activeTab, setTab] = useState('dashboard');
  const [constructions, setConstructions] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [mapClickCoords, setMapClickCoords] = useState(null);

  // Fetch initial datasets
  const fetchData = async () => {
    try {
      // Fetch constructions list
      const constructionsRes = await fetch('http://localhost:5000/api/constructions');
      const constructionsData = await constructionsRes.json();
      setConstructions(constructionsData);

      // Fetch reports list
      const reportsRes = await fetch('http://localhost:5000/api/reports');
      const reportsData = await reportsRes.json();
      setReports(reportsData);

      // Fetch analytics summary
      const analyticsRes = await fetch('http://localhost:5000/api/analytics');
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Failed to connect to Express backend API:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update a site's status locally and trigger data refresh
  const handleSiteUpdate = (updatedSite) => {
    setConstructions(prev => prev.map(c => c.id === updatedSite.id ? updatedSite : c));
    fetchData(); // Refetch analytics & logs
  };

  // Submit citizen report
  const handleNewReport = (newReport) => {
    setReports(prev => [newReport, ...prev]);
    fetchData();
  };

  // Approve a citizen report and register it as an active construction site
  const handleApproveReport = (reportId, newSite) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'Approved' } : r));
    setConstructions(prev => [newSite, ...prev]);
    fetchData();
  };

  // Map clicked coordinates callback
  const handleMapClickCoords = (coords) => {
    setMapClickCoords(coords);
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setMapClickCoords(null);
  };

  // Quick Action / AI alert selection from Dashboard
  const handleSelectSite = (id) => {
    setSelectedSiteId(id);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 20px 20px 20px' }}>
      
      {/* Top Banner Navigation Bar */}
      <Header 
        constructions={constructions} 
        onSelectSite={handleSelectSite}
        setTab={setTab}
      />

      {/* Main Core Container */}
      <div style={{ display: 'flex', gap: '20px', flexGrow: 1 }}>
        
        {/* Left Sidebar Menu */}
        <Sidebar 
          activeTab={activeTab} 
          setTab={setTab} 
          constructions={constructions}
          reports={reports}
          onOpenReportModal={() => setShowReportModal(true)}
        />

        {/* Right Content Space */}
        <main style={{ flexGrow: 1, display: 'flex', minWidth: 0 }}>
          
          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '20px', width: '100%' }} className="animate-slide-in">
              
              {/* Interactive GIS Map Panel */}
              <div className="glass-panel" style={{ height: 'calc(100vh - 120px)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>City Aerial GIS Control Map</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Click on map tiles to manually pin a report</p>
                  </div>
                  <span className="badge badge-authorized" style={{ fontSize: '0.65rem' }}>AI Drone Scan Online</span>
                </div>
                
                <div style={{ flexGrow: 1, minHeight: '400px' }}>
                  <MapView 
                    constructions={constructions} 
                    onSelectSite={handleSelectSite}
                    onMapClickCoords={handleMapClickCoords}
                  />
                </div>
              </div>

              {/* Sidebar Alerts Queue Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                
                {/* AI Alerts Header Card */}
                <div className="glass-panel pulse-glow-border" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <ShieldAlert size={28} color="var(--status-violation)" />
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--status-violation)' }}>CRITICAL VIOLATIONS</h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Requires immediate code enforcement action</p>
                  </div>
                </div>

                {/* Construction Queue List */}
                <div className="glass-panel" style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                    Action items queue ({constructions.filter(c => c.status !== 'Authorized' && c.status !== 'Resolved').length})
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {constructions
                      .filter(c => c.status !== 'Authorized' && c.status !== 'Resolved')
                      .map(site => {
                        const isCritical = ['Violation Confirmed', 'Stop Work Order', 'Demolition Scheduled'].includes(site.status);
                        return (
                          <div 
                            key={site.id} 
                            style={{ 
                              padding: '12px', 
                              borderRadius: '8px', 
                              background: 'rgba(255,255,255,0.01)', 
                              border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.15)' : 'var(--border-color)'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>SITE #{site.id}</span>
                              <span className="badge" style={{ 
                                fontSize: '0.6rem',
                                padding: '2px 6px',
                                backgroundColor: isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                color: isCritical ? 'var(--status-violation)' : 'var(--status-review)',
                                borderColor: isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'
                              }}>{site.status}</span>
                            </div>
                            
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {site.address}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                Match: <strong style={{ color: '#fff' }}>{site.ai_confidence}%</strong>
                              </span>
                              <button 
                                onClick={() => handleSelectSite(site.id)}
                                style={{
                                  background: 'rgba(99, 102, 241, 0.1)',
                                  border: 'none',
                                  color: 'var(--accent-secondary)',
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Eye size={12} />
                                <span>Inspect</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'constructions' && (
            <ConstructionList 
              constructions={constructions} 
              onSelectSite={handleSelectSite}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsList 
              reports={reports} 
              onApproveReport={handleApproveReport}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics analytics={analytics} />
          )}

        </main>
      </div>

      {/* Profile Details Modal Overlay */}
      {selectedSiteId && (
        <DetailsModal 
          siteId={selectedSiteId} 
          onClose={() => setSelectedSiteId(null)}
          onUpdateStatus={handleSiteUpdate}
        />
      )}

      {/* Citizens Filing Report Dialog Box */}
      {showReportModal && (
        <ReportForm 
          coords={mapClickCoords}
          onClose={handleCloseReportModal}
          onSubmitReport={handleNewReport}
        />
      )}

    </div>
  );
}
