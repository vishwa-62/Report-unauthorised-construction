import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FileText, Download, Filter, Search, RefreshCcw, Eye, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Register Chart.js structures
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MOCK_COMPLAINTS_REPORT = [
  { id: 101, complaint_number: 'CG-2026-00101', ward_id: 1, ward_name: 'Ward 1 - Green Valley', category_name: 'Illegal Floor Construction', severity: 'critical', status: 'pending', created_at: '2026-07-28' },
  { id: 102, complaint_number: 'CG-2026-00102', ward_id: 2, ward_name: 'Ward 2 - Metro Hub', category_name: 'Footpath Encroachment', severity: 'high', status: 'under_review', created_at: '2026-07-29' },
  { id: 103, complaint_number: 'CG-2026-00103', ward_id: 3, ward_name: 'Ward 3 - Harbor View', category_name: 'Setback Deviation', severity: 'medium', status: 'assigned', created_at: '2026-07-30' },
  { id: 104, complaint_number: 'CG-2026-00104', ward_id: 4, ward_name: 'Ward 6 - Tech Corridor', category_name: 'Unauthorized Commercial Shed', severity: 'critical', status: 'inspected', created_at: '2026-08-01' },
  { id: 105, complaint_number: 'CG-2026-00105', ward_id: 5, ward_name: 'Ward 9 - Business District', category_name: 'Drainage Block Encroachment', severity: 'low', status: 'resolved', created_at: '2026-08-02' }
];

const MOCK_WARDS = [
  { id: 1, name: 'Ward 1 - Green Valley' },
  { id: 2, name: 'Ward 2 - Metro Hub' },
  { id: 3, name: 'Ward 3 - Harbor View' },
  { id: 4, name: 'Ward 6 - Tech Corridor' },
  { id: 5, name: 'Ward 9 - Business District' },
  { id: 6, name: 'Ward 13 - Western Gate' }
];

const ReportsPortal = () => {
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS_REPORT);
  const [wards, setWards] = useState(MOCK_WARDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [wardId, setWardId] = useState('');
  const [severity, setSeverity] = useState('');
  
  // Custom export details
  const [reportTitle, setReportTitle] = useState('CityGuard Municipal Construction Audit Summary');

  const fetchWards = async () => {
    try {
      const res = await axios.get('/admin/wards');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setWards(res.data);
      }
    } catch (err) {
      console.warn('Backend wards API unavailable. Using default wards.');
      setWards(MOCK_WARDS);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (status) params.status = status;
      if (wardId) params.ward_id = wardId;
      if (severity) params.severity = severity;
      if (search) params.search = search;

      const res = await axios.get('/complaints', { params });
      if (res.data && Array.isArray(res.data)) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.warn('Backend complaints API unavailable. Filtering local demo records.');
      // Local client filtering fallback
      let list = [...MOCK_COMPLAINTS_REPORT];
      if (status) list = list.filter(c => c.status === status);
      if (wardId) list = list.filter(c => String(c.ward_id) === String(wardId));
      if (severity) list = list.filter(c => c.severity === severity);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(c => 
          c.complaint_number.toLowerCase().includes(q) || 
          c.ward_name.toLowerCase().includes(q) || 
          (c.category_name && c.category_name.toLowerCase().includes(q))
        );
      }
      setComplaints(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [status, wardId, severity, search]);

  // Download logic (With client CSV export fallback)
  const handleExport = (format) => {
    const params = new URLSearchParams({
      title: reportTitle,
      status: status,
      ward_id: wardId,
      severity: severity
    }).toString();

    axios({
      url: `/reports/${format}?${params}`,
      method: 'GET',
      responseType: 'blob'
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cityguard-audit-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(err => {
      console.warn('Backend PDF/Excel endpoint unavailable. Generating CSV report export on client.');
      let csvContent = 'Complaint Number,Ward Name,Category,Severity,Status,Date Filed\n';
      complaints.forEach(c => {
        csvContent += `"${c.complaint_number}","${c.ward_name}","${c.category_name || 'General'}","${c.severity}","${c.status}","${c.created_at}"\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cityguard-audit-report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Compile Dynamic Pie Chart Data
  const statusProportions = complaints.reduce((acc, c) => {
    const s = c.status || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(statusProportions).map(s => s.toUpperCase()),
    datasets: [
      {
        data: Object.values(statusProportions),
        backgroundColor: [
          '#ef4444', // pending
          '#f59e0b', // under_review
          '#eab308', // assigned
          '#8b5cf6', // inspected
          '#10b981', // resolved
          '#6b7280', // rejected
          '#000000', // verified
        ],
        borderWidth: 0,
      }
    ]
  };

  // Compile Dynamic Bar Chart Data
  const wardProportions = complaints.reduce((acc, c) => {
    const w = c.ward_name || `Ward ${c.ward_id}`;
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(wardProportions),
    datasets: [
      {
        label: 'Violations Count',
        data: Object.values(wardProportions),
        backgroundColor: 'rgba(34, 197, 94, 0.75)',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return 'bg-red-100 text-red-800';
    if (s === 'high') return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick Actions */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-500" />
            Audit & Reports Center
          </h2>
          <p className="text-xs text-slate-400">Generate compliance exports, view status distributions, and review case details</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow shadow-red-500/10"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow shadow-emerald-500/10"
          >
            <Download className="h-4 w-4" />
            Export Excel/CSV
          </button>
        </div>
      </div>

      {/* 2. Visual Analytics (Pie & Bar Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pie Chart of Statuses (5 columns) */}
        <div className="lg:col-span-5 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col h-[320px]">
          <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-4">Status Proportions (Pie Chart)</h4>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {complaints.length === 0 ? (
              <p className="text-xs text-slate-450">No data available for charts.</p>
            ) : (
              <Pie 
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'right', labels: { boxWidth: 10, fontSize: 9 } } }
                }}
              />
            )}
          </div>
        </div>

        {/* Bar Chart of Wards (7 columns) */}
        <div className="lg:col-span-7 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col h-[320px]">
          <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-4">Violation Densities by Ward</h4>
          <div className="flex-1 min-h-0">
            {complaints.length === 0 ? (
              <p className="text-xs text-slate-450">No data available for charts.</p>
            ) : (
              <Bar 
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }}
              />
            )}
          </div>
        </div>

      </div>

      {/* 3. Query Filters */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
            <Filter className="h-4.5 w-4.5 text-brand-500" />
            Query Filters
          </h3>
          <button 
            onClick={fetchComplaints}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500/50"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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

          {/* Ward */}
          <select
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs cursor-pointer"
          >
            <option value="">All Wards</option>
            {wards.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Severity */}
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
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

      {/* 4. Table Grid */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 overflow-hidden">
        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No records found matching current query parameters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 uppercase font-extrabold tracking-wider">
                  <th className="py-3 px-3">Complaint #</th>
                  <th className="py-3 px-3">Ward</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date Filed</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-3 font-extrabold text-brand-600">{item.complaint_number}</td>
                    <td className="py-3.5 px-3 font-semibold">{item.ward_name}</td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium">{item.category_name || item.custom_category || 'General'}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400">
                        ● {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-3 text-right">
                      <Link 
                        to={`/complaints/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-lg text-[10px] font-bold border border-slate-200/50 dark:border-slate-800"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Open
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
  );
};

export default ReportsPortal;
