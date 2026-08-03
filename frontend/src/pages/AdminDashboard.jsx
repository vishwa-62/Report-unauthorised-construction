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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'settings', 'reports'
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Report filters state
  const [repStatus, setRepStatus] = useState('');
  const [repTitle, setRepTitle] = useState('CityGuard Municipal Board General Report');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/analytics/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/admin/settings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
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
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentState } : u));
    } catch (err) {
      alert('Failed to update user status.');
    }
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
      alert('Failed to update system settings.');
    }
  };

  // Report Export Actions
  const handleExport = (format) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      title: repTitle,
      status: repStatus
    }).toString();
    
    // Redirect browser directly to download endpoint with token query parameter (handled in API / auth check or simply open new window)
    const exportUrl = `http://localhost:5000/api/reports/${format}?${params}`;
    
    // Since browser needs to send auth token header, we can fetch as a blob and save, or we can use custom download helper with Axios!
    // Fetching as a blob is very professional and ensures JWT security header is fully sent! Let's do that!
    axios({
      url: `/reports/${format}?${params}`,
      method: 'GET',
      responseType: 'blob' // Important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cityguard-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(err => {
      console.error(err);
      alert('Failed to generate export file.');
    });
  };

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Compiling executive records...</p>
      </div>
    );
  }

  // Define Chart Data Models
  const monthlyTrendsData = {
    labels: metrics.monthlyTrends?.map(t => t.month) || [],
    datasets: [
      {
        label: 'Filed Complaints',
        data: metrics.monthlyTrends?.map(t => t.count) || [],
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
    labels: metrics.zoneStats?.map(z => z.zone_name) || [],
    datasets: [
      {
        label: 'Complaints',
        data: metrics.zoneStats?.map(z => z.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(168, 85, 247, 0.7)'
        ],
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  const categoryBreakdownData = {
    labels: metrics.categoryStats?.map(c => c.category_name) || [],
    datasets: [
      {
        data: metrics.categoryStats?.map(c => c.count) || [],
        backgroundColor: [
          '#ef4444',
          '#f97316',
          '#3b82f6',
          '#8b5cf6',
          '#eab308'
        ],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        {[
          { id: 'overview', label: 'Executive Stats', icon: LayoutDashboard },
          { id: 'users', label: 'User Control', icon: Users },
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'reports', label: 'Export Reports', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                isActive 
                  ? 'border-brand-500 text-brand-500' 
                  : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW PANEL TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Card list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="h-10 w-10 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20">
                <Activity className="h-5 w-5 text-brand-500" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Total Filed Cases</span>
                <p className="text-xl font-extrabold text-slate-850 dark:text-white">{metrics.counts?.total || 0}</p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Active Officers</span>
                <p className="text-xl font-extrabold text-slate-850 dark:text-white">{metrics.activeOfficers}</p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                <CheckCircle className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Resolution SLA</span>
                <p className="text-xl font-extrabold text-slate-850 dark:text-white">{metrics.avgResolutionTimeDays} Days</p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <Cpu className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">AI Vision Accuracy</span>
                <p className="text-xl font-extrabold text-slate-850 dark:text-white">{metrics.aiAccuracy}%</p>
              </div>
            </div>

          </div>

          {/* Charts container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Trends Line chart (8 cols) */}
            <div className="lg:col-span-8 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col h-[320px]">
              <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-4">12-Month Construction Violation Trends</h4>
              <div className="flex-1 min-h-0">
                <Line 
                  data={monthlyTrendsData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } } }
                  }} 
                />
              </div>
            </div>

            {/* Category Doughnut (4 cols) */}
            <div className="lg:col-span-4 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col h-[320px]">
              <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-4">Violation Class Breakdown</h4>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <Doughnut 
                  data={categoryBreakdownData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, fontSize: 9 } } }
                  }}
                />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Zone bar chart (7 cols) */}
            <div className="lg:col-span-7 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col h-[300px]">
              <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-4">Zone Densities</h4>
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

            {/* Recent activities feed list (5 cols) */}
            <div className="lg:col-span-5 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col h-[300px]">
              <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-3">Live Log Feed</h4>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {metrics.recentActivity?.map((act) => (
                  <div key={act.id} className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-250/20">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-brand-600">{act.complaint_number}</span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-350 mt-0.5">{act.remarks}</p>
                    <div className="text-[9px] text-slate-400 mt-1">
                      Action by: {act.user_name} ({act.user_role})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER CONTROL MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">User Directory</h3>
              <p className="text-[11px] text-slate-400">Lock, unlock or modify system login access clearances</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 uppercase font-extrabold tracking-wider">
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Role Type</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Clearance Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-100">{u.full_name}</td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium">{u.email}</td>
                    <td className="py-3.5 px-3 text-slate-500">{u.phone_number || 'N/A'}</td>
                    <td className="py-3.5 px-3 font-semibold uppercase text-brand-650">{u.role}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        u.email_verified 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.email_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`h-2.5 w-2.5 rounded-full inline-block mr-1.5 ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {u.is_active ? 'Active' : 'Locked'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {u.email !== 'admin@cityguard.gov' ? (
                        <button
                          onClick={() => handleToggleUser(u.id, u.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                            u.is_active 
                              ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {u.is_active ? 'Block Access' : 'Unlock Access'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SYSTEM CONFIGURATION TAB */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSettingsSave} className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">System Settings Dashboard</h3>
            <p className="text-[11px] text-slate-400">Modify global boundaries, uploads and trigger thresholds</p>
          </div>

          <div className="space-y-4">
            {settings.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-slate-100 dark:border-slate-850 pb-3 text-xs">
                <div className="md:col-span-4 font-bold text-slate-800 dark:text-slate-250">
                  {item.setting_key}
                  <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{item.description}</span>
                </div>
                <div className="md:col-span-8">
                  <input
                    type="text"
                    value={item.setting_value}
                    onChange={(e) => handleSettingChange(index, e.target.value)}
                    className="w-full max-w-md px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            Save All Configurations
          </button>
        </form>
      )}

      {/* REPORTS MANAGER TAB */}
      {activeTab === 'reports' && (
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Executive Report Compiler</h3>
            <p className="text-[11px] text-slate-400">Query complaint segments and generate formatted PDF summaries or Excel sheets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs max-w-xl">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Custom Report Title</label>
              <input
                type="text"
                value={repTitle}
                onChange={(e) => setRepTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Filter by Status</label>
              <select
                value={repStatus}
                onChange={(e) => setRepStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 cursor-pointer"
              >
                <option value="">All Complaints</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="inspected">Inspected</option>
                <option value="verified">Verified Violation</option>
                <option value="resolved">Resolved Case</option>
                <option value="rejected">Rejected Case</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleExport('pdf')}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download PDF Report
            </button>
            
            <button
              onClick={() => handleExport('excel')}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download Excel grid
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
