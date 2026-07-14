import React, { useState } from 'react';
import { Search, Filter, Eye, ArrowUpDown } from 'lucide-react';

export default function ConstructionList({ constructions, onSelectSite }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [violationFilter, setViolationFilter] = useState('All');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Authorized': return 'badge-authorized';
      case 'Under Review': return 'badge-review';
      case 'Violation Confirmed': return 'badge-violation';
      case 'Stop Work Order': return 'badge-stopwork';
      case 'Demolition Scheduled': return 'badge-demolition';
      case 'Resolved': return 'badge-resolved';
      default: return '';
    }
  };

  // Filter & Sort constructions list
  const filteredConstructions = constructions
    .filter(site => {
      const matchesSearch = site.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (site.permit_number && site.permit_number.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || site.status === statusFilter;
      const matchesViolation = violationFilter === 'All' || site.violation_type === violationFilter;
      return matchesSearch && matchesStatus && matchesViolation;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle strings
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="glass-panel animate-slide-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Header and filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Monitored Construction Sites</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Database of all construction activities analyzed by municipal aerial AI and inspectors.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          
          {/* Search */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by Address, Permit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 30, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 12px 10px 36px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="var(--text-secondary)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: 'rgba(10, 15, 30, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 16px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Authorized">Authorized</option>
              <option value="Under Review">Under Review</option>
              <option value="Violation Confirmed">Violation Confirmed</option>
              <option value="Stop Work Order">Stop Work Order</option>
              <option value="Demolition Scheduled">Demolition Scheduled</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Violation filter */}
          <div>
            <select
              value={violationFilter}
              onChange={(e) => setViolationFilter(e.target.value)}
              style={{
                background: 'rgba(10, 15, 30, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 16px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Violations</option>
              <option value="None">No Violation</option>
              <option value="No Permit">No Permit</option>
              <option value="Zoning Deviation">Zoning Deviation</option>
              <option value="Extra Floor Encroachment">Extra Floor Encroachment</option>
              <option value="Green Belt Encroachment">Green Belt Encroachment</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', width: '100%', marginTop: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th onClick={() => handleSort('id')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>
                ID <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th onClick={() => handleSort('address')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>
                Address <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th onClick={() => handleSort('zoning_type')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>
                Zoning Zone <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th onClick={() => handleSort('status')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>
                Status <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th onClick={() => handleSort('violation_type')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>
                Violation Type <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th onClick={() => handleSort('ai_confidence')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>
                AI Confidence <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </th>
              <th style={{ padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredConstructions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No monitored construction records found matching the search criteria.
                </td>
              </tr>
            ) : (
              filteredConstructions.map(site => (
                <tr 
                  key={site.id} 
                  style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                    fontSize: '0.85rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '16px', color: 'var(--accent-secondary)', fontWeight: '600' }}>#{site.id}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '500' }}>{site.address}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Permit: {site.permit_number || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{site.zoning_type}</td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${getStatusClass(site.status)}`}>
                      {site.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      color: site.violation_type === 'None' ? 'var(--text-muted)' : 'var(--status-violation)',
                      fontWeight: site.violation_type === 'None' ? 'normal' : '500'
                    }}>
                      {site.violation_type}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flexGrow: 1, width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${site.ai_confidence}%`, 
                          height: '100%', 
                          background: site.ai_confidence > 75 ? 'var(--status-violation)' : site.ai_confidence > 40 ? 'var(--status-review)' : 'var(--status-authorized)'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{site.ai_confidence}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => onSelectSite(site.id)}
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid var(--accent-primary)',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      className="glass-panel-interactive"
                    >
                      <Eye size={14} style={{ color: 'var(--accent-secondary)' }} />
                      <span>Review Details</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
