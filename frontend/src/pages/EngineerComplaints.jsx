import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MapContainer from '../components/MapContainer';
import { Filter, Map, RefreshCcw, Eye, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const EngineerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedPin, setSelectedPin] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedWard) params.ward_id = selectedWard;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedSeverity) params.severity = selectedSeverity;

      const res = await axios.get('/complaints', { params });
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const res = await axios.get('/admin/wards');
      setWards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [selectedWard, selectedStatus, selectedSeverity]);

  const handleRowClick = (item) => {
    setSelectedPin({
      lat: parseFloat(item.latitude),
      lng: parseFloat(item.longitude)
    });
  };

  const getSeverityBadge = (sev) => {
    const s = sev.toLowerCase();
    if (s === 'critical') return 'bg-red-100 dark:bg-red-950/20 text-red-700 font-extrabold';
    if (s === 'high') return 'bg-orange-100 dark:bg-orange-950/20 text-orange-700 font-bold';
    return 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
      
      {/* Verification Grid (7 columns) */}
      <div className="xl:col-span-7 space-y-6">
        
        {/* Filters Panel */}
        <div className="glass-panel rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="h-4.5 w-4.5 text-brand-500" />
              Filter Audits
            </h3>
            <button 
              onClick={fetchComplaints}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-450"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="inspected">Inspected</option>
              <option value="verified">Verified</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs cursor-pointer"
            >
              <option value="">All Wards</option>
              {wards.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs cursor-pointer"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Audit List Table Card */}
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="h-4.5 w-4.5 text-brand-500" />
              Verification Grid
            </h3>
            <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-450 text-[10px] font-extrabold">
              {complaints.length} CASES
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <p className="text-center py-12 text-xs text-slate-400">No complaints match selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 uppercase font-extrabold tracking-wider">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Ward / Zone</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Severity</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {complaints.map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer transition-colors ${
                        selectedPin?.lat === parseFloat(item.latitude) ? 'bg-brand-50/10 dark:bg-brand-900/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-2 font-extrabold text-brand-600">{item.complaint_number}</td>
                      <td className="py-3.5 px-2 font-semibold">
                        {item.ward_name}
                        <span className="block text-[10px] text-slate-400 font-normal">{item.zone_name}</span>
                      </td>
                      <td className="py-3.5 px-2 text-slate-500 font-medium">{item.category_name || item.custom_category || 'General'}</td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400 block">
                          ● {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <Link 
                          to={`/complaints/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-lg text-[10px] font-bold border border-slate-200/50 dark:border-slate-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Audit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* Interactive GIS Mapping with Heatmaps (5 columns) */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        <div className="glass-panel rounded-3xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 h-[420px] xl:h-[600px]">
          <div className="flex-1 min-h-0">
            <MapContainer 
              complaints={complaints}
              selectedLocation={selectedPin}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default EngineerComplaints;
