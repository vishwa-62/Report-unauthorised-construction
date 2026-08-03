import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Activity, CheckCircle, RefreshCcw, Loader2, ClipboardCheck, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const EngineerDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricRes, officerRes] = await Promise.all([
        axios.get('/analytics/metrics'),
        axios.get('/officers')
      ]);
      setMetrics(metricRes.data);
      setOfficers(officerRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading Auditor Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-brand-650 to-blue-600 rounded-3xl text-white shadow-xl shadow-brand-500/10">
        <h3 className="font-extrabold text-lg">Welcome to the Auditor Dashboard</h3>
        <p className="text-xs text-white/80 mt-0.5">Identify violations, review field officer reports, and check zoning boundary alerts in real time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="h-10 w-10 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20">
            <ClipboardCheck className="h-5 w-5 text-brand-500" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Awaiting Audit</span>
            <p className="text-xl font-extrabold text-slate-850 dark:text-white">
              {metrics.counts?.pending + metrics.counts?.under_review + metrics.counts?.inspected || 0}
            </p>
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
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Resolved Cases</span>
            <p className="text-xl font-extrabold text-slate-850 dark:text-white">{metrics.counts?.resolved || 0}</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Avg SLA Resolution</span>
            <p className="text-xl font-extrabold text-slate-850 dark:text-white">{metrics.avgResolutionTimeDays} Days</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Officer workloads list (7 columns) */}
        <div className="lg:col-span-7 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
          <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-4">Field Inspector Workloads</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider text-[10px]">
                  <th className="py-2.5">Inspector Name</th>
                  <th className="py-2.5">Badge</th>
                  <th className="py-2.5 text-center">Active Cases</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {officers.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{o.officer_name}</td>
                    <td className="py-3 text-slate-450 font-medium">{o.badge_number}</td>
                    <td className="py-3 text-center font-bold text-slate-800 dark:text-slate-100">{o.active_assignments}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        o.availability_status === 'available' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.availability_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live log feed (5 columns) */}
        <div className="lg:col-span-5 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col h-[360px] lg:h-auto">
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
                <p className="text-slate-650 dark:text-slate-300 mt-0.5">{act.remarks}</p>
                <div className="text-[9px] text-slate-400 mt-1">
                  Action by: {act.user_name} ({act.user_role})
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default EngineerDashboard;
