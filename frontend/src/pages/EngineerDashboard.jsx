import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getStoredComplaints } from '../utils/mockStore';
import { Activity, CheckCircle, RefreshCcw, Loader2, Eye, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const EngineerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/complaints');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setComplaints(res.data);
      } else {
        setComplaints(getStoredComplaints());
      }
    } catch (err) {
      console.warn('Backend complaints endpoint unavailable. Using stored complaints list.');
      setComplaints(getStoredComplaints());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl text-white shadow-xl shadow-blue-500/10">
        <h3 className="font-extrabold text-lg">Welcome to the Auditor / Engineer Portal</h3>
        <p className="text-xs text-white/80 mt-0.5">Review AI structural prechecks, assign field inspectors, and authorize final demolition/resolution orders.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Total Cases</span>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{complaints.length}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Critical Violations</span>
          <p className="text-2xl font-black text-rose-500">
            {complaints.filter(c => c.severity === 'critical').length}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Inspector Assigned</span>
          <p className="text-2xl font-black text-amber-500">
            {complaints.filter(c => c.status === 'assigned' || c.assigned_officer_name).length}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Inspections Verified</span>
          <p className="text-2xl font-black text-emerald-500">
            {complaints.filter(c => c.status === 'inspected' || c.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Complaints List */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-500" />
            Engineering Audit Queue ({complaints.length})
          </h3>
          <button onClick={fetchComplaints} className="p-1 rounded text-slate-400 hover:text-white">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 w-full bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No active complaints found in engineering audit queue.</p>
        ) : (
          <div className="space-y-3">
            {complaints.map((item) => (
              <div 
                key={item.id}
                className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-brand-500">{item.complaint_number}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-500/10 text-brand-500">
                      ● {item.status}
                    </span>
                    {item.severity === 'critical' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-500/10 text-red-500">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{item.description}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.ward_name} • Category: {item.category_name || 'General'}
                  </p>
                </div>

                <Link
                  to={`/complaints/${item.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-md shadow-blue-500/20"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Review Case
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default EngineerDashboard;
