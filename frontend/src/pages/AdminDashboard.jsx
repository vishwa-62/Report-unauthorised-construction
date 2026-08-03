import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  LayoutDashboard, FileText, Download, Users, Settings, 
  Cpu, Activity, CheckCircle, RefreshCcw, Loader2, Edit 
} from 'lucide-react';

// Register Chart.js elements
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend
);

// Fallback Mock Data for Client-Only / Offline Standalone Mode
const MOCK_METRICS = {
  totalComplaints: 142,
  pendingComplaints: 28,
  resolvedComplaints: 89,
  criticalSeverity: 12,
  resolutionRate: '62.7%',
  avgResolutionTimeDays: 4.2,
  monthlyTrends: [
    { month: 'Jan', count: 18 },
    { month: 'Feb', count: 24 },
    { month: 'Mar', count: 32 },
    { month: 'Apr', count: 29 },
    { month: 'May', count: 39 }
  ],
  zoneBreakdown: [
    { zone_name: 'North Zone', count: 45 },
    { zone_name: 'South Zone', count: 38 },
    { zone_name: 'East Zone', count: 31 },
    { zone_name: 'West Zone', count: 28 }
  ]
};

const MOCK_USERS = [
  { id: 1, full_name: 'Commissioner Rajesh Kumar', email: 'admin@cityguard.gov', role: 'admin', is_active: true, created_at: '2026-01-10' },
  { id: 3, full_name: 'Chief Engineer Anjali Sharma', email: 'engineer@cityguard.gov', role: 'engineer', is_active: true, created_at: '2026-01-12' },
  { id: 4, full_name: 'Inspector Vikram Singh', email: 'officer1@cityguard.gov', role: 'officer', is_active: true, created_at: '2026-01-15' },
  { id: 5, full_name: 'Inspector Sunita Rao', email: 'officer2@cityguard.gov', role: 'officer', is_active: true, created_at: '2026-01-18' },
  { id: 8, full_name: 'Amit Patel', email: 'citizen1@cityguard.gov', role: 'citizen', is_active: true, created_at: '2026-02-01' }
];

const MOCK_SETTINGS = [
  { id: 1, setting_key: 'auto_assign_officer', setting_value: 'true', description: 'Auto-assign nearest officer on complaint creation' },
  { id: 2, setting_key: 'sla_resolution_hours', setting_value: '72', description: 'Resolution SLA limit in hours' },
  { id: 3, setting_key: 'ai_confidence_threshold', setting_value: '0.85', description: 'AI Image Verification confidence threshold' },
  { id: 4, setting_key: 'citizen_notifications_email', setting_value: 'enabled', description: 'Send email updates to citizens' }
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'settings', 'reports'
  const [metrics, setMetrics] = useState(MOCK_METRICS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [settings, setSettings] = useState(MOCK_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Report filters state
  const [repStatus, setRepStatus] = useState('');
  const [repTitle, setRepTitle] = useState('CityGuard Municipal Board General Report');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/analytics/metrics');
      if (res.data) setMetrics(res.data);
    } catch (err) {
      console.warn('Backend metrics unavailable. Using demo analytics metrics.');
      setMetrics(MOCK_METRICS);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/users');
      if (res.data && Array.isArray(res.data)) setUsers(res.data);
    } catch (err) {
      console.warn('Backend users unavailable. Using demo users list.');
      setUsers(MOCK_USERS);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/admin/settings');
      if (res.data && Array.isArray(res.data)) setSettings(res.data);
    } catch (err) {
      console.warn('Backend settings unavailable. Using demo settings.');
      setSettings(MOCK_SETTINGS);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchUsers();
    fetchSettings();
  }, []);

  const handleToggleUser = async (userId, currentState) => {
    try {
      await axios.put(`/admin/users/${userId}/toggle`, { is_active: !currentState });
    } catch (err) {
      console.warn('Backend toggle endpoint unavailable. Updating locally.');
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentState } : u));
  };

  const handleSettingChange = (index, value) => {
    const next = [...settings];
    next[index].setting_value = value;
    setSettings(next);
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/admin/settings', { settings });
      alert('System configurations updated successfully!');
    } catch (err) {
      console.warn('Backend settings save unavailable. Saved locally.');
      alert('System configurations saved successfully (Demo Mode)!');
    }
  };

  // Report Export Actions (PDF/Excel download with client CSV fallback)
  const handleExport = (format) => {
    const params = new URLSearchParams({
      title: repTitle,
      status: repStatus
    }).toString();

    axios({
      url: `/reports/${format}?${params}`,
      method: 'GET',
      responseType: 'blob'
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cityguard-admin-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(err => {
      console.warn('Backend report generator endpoint unavailable. Generating client-side CSV export.');
      
      // Client-side CSV generation fallback
      const csvHeader = 'Report Title,Status Filter,Total Complaints,Pending,Resolved,Resolution Rate,Export Date\n';
      const csvRow = `"${repTitle}","${repStatus || 'All'}",${metrics.totalComplaints || 142},${metrics.pendingComplaints || 28},${metrics.resolvedComplaints || 89},"${metrics.resolutionRate || '62.7%'}","${new Date().toLocaleDateString()}"\n`;
      const blob = new Blob([csvHeader + csvRow], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cityguard-admin-report.${format === 'pdf' ? 'csv' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Compiling executive records...</p>
      </div>
    );
  }

  // Define Chart Data Models
  const monthlyTrendsData = {
    labels: metrics?.monthlyTrends?.map(t => t.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Filed Complaints',
        data: metrics?.monthlyTrends?.map(t => t.count) || [18, 24, 32, 29, 39],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#16a34a'
      }
    ]
  };

  const zoneBreakdownData = {
    labels: metrics?.zoneBreakdown?.map(z => z.zone_name) || ['North Zone', 'South Zone', 'East Zone', 'West Zone'],
    datasets: [
      {
        label: 'Complaints by Zone',
        data: metrics?.zoneBreakdown?.map(z => z.count) || [45, 38, 31, 28],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Tab Controls */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-brand-500" />
            Executive Control & System Operations
          </h2>
          <p className="text-xs text-slate-400">Manage user access, configure municipal SLAs, and export audit reports</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'settings', label: 'System SLA', icon: Settings },
            { id: 'reports', label: 'Report Export', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Complaints</span>
                <Activity className="h-4 w-4 text-brand-500" />
              </div>
              <p className="text-2xl font-black text-slate-850 dark:text-white">{metrics?.totalComplaints || 142}</p>
            </div>

            <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Pending Review</span>
                <RefreshCcw className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-500">{metrics?.pendingComplaints || 28}</p>
            </div>

            <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Resolved & Closed</span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-500">{metrics?.resolvedComplaints || 89}</p>
            </div>

            <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Resolution Rate</span>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-blue-500">{metrics?.resolutionRate || '62.7%'}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 h-[320px] flex flex-col">
              <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-4">Monthly Filing Trends</h4>
              <div className="flex-1 min-h-0">
                <Line 
                  data={monthlyTrendsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-5 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 h-[320px] flex flex-col">
              <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-4">Zone Distribution</h4>
              <div className="flex-1 min-h-0">
                <Bar 
                  data={zoneBreakdownData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 overflow-hidden space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-500" />
              System Users Directory ({users.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 uppercase font-extrabold tracking-wider">
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-white">{u.full_name}</td>
                    <td className="py-3.5 px-3 text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'engineer' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'officer' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`font-bold uppercase text-[9px] ${u.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                        ● {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleToggleUser(u.id, u.is_active)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          u.is_active 
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM SLA SETTINGS */}
      {activeTab === 'settings' && (
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider flex items-center gap-2">
              <Settings className="h-4 w-4 text-brand-500" />
              Municipal SLA & AI Verification Rules
            </h3>
          </div>

          <form onSubmit={handleSettingsSave} className="space-y-4">
            {settings.map((st, idx) => (
              <div key={st.id || idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                <div className="md:col-span-5">
                  <p className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">{st.setting_key}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{st.description}</p>
                </div>
                <div className="md:col-span-7">
                  <input
                    type="text"
                    value={st.setting_value}
                    onChange={(e) => handleSettingChange(idx, e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white rounded-xl text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Save System Settings
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: REPORT EXPORT */}
      {activeTab === 'reports' && (
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-500" />
              Executive Audit & Compliance Export
            </h3>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Title Header</label>
              <input
                type="text"
                value={repTitle}
                onChange={(e) => setRepTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl text-xs outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Scope Filter</label>
              <select
                value={repStatus}
                onChange={(e) => setRepStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl text-xs outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="">All Statuses (Full Municipal Audit)</option>
                <option value="pending">Pending Review Only</option>
                <option value="under_review">Under Review Only</option>
                <option value="assigned">Assigned Officer Cases</option>
                <option value="inspected">Field Inspected Cases</option>
                <option value="resolved">Resolved & Closed Cases</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleExport('pdf')}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-red-500/20 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Generate & Export PDF Report
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Generate & Export Excel/CSV
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
