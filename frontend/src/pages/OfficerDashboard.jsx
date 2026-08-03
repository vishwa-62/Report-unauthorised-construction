import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getStoredComplaints } from '../utils/mockStore';
import { ClipboardList, CheckCircle, RefreshCcw, Loader2, Calendar, AlertTriangle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const OfficerDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/officers/assigned');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAssignments(res.data);
      } else {
        const stored = getStoredComplaints();
        setAssignments(stored.filter(c => c.assigned_officer_name || c.status === 'assigned' || c.status === 'inspected'));
      }
    } catch (err) {
      console.warn('Backend assigned officer API unavailable. Using fallback assignments list.');
      const stored = getStoredComplaints();
      setAssignments(stored.filter(c => c.assigned_officer_name || c.status === 'assigned' || c.status === 'inspected' || c.status === 'under_review'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-500/10">
        <h3 className="font-extrabold text-lg">Welcome to the Inspector Dashboard</h3>
        <p className="text-xs text-white/80 mt-0.5">Access assigned inspections, navigate using GIS maps, and submit findings in seconds.</p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <ClipboardList className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Total Assignments</span>
            <p className="text-xl font-extrabold text-slate-850 dark:text-white">{assignments.length}</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
            <RefreshCcw className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Pending Site Visits</span>
            <p className="text-xl font-extrabold text-amber-500">
              {assignments.filter(a => a.status === 'assigned' || a.status === 'under_review').length}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Inspections Completed</span>
            <p className="text-xl font-extrabold text-emerald-500">
              {assignments.filter(a => a.status === 'inspected' || a.status === 'resolved').length}
            </p>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-brand-500" />
            Assigned Inspection Directives ({assignments.length})
          </h3>
          <button onClick={fetchAssignments} className="p-1 rounded text-slate-400 hover:text-white">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2].map(i => (
              <div key={i} className="h-16 w-full bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No field inspection tasks assigned currently.</p>
        ) : (
          <div className="space-y-3">
            {assignments.map((item) => (
              <div 
                key={item.id}
                className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-brand-500">{item.complaint_number}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500">
                      ● {item.status}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{item.description}</p>
                  <p className="text-[10px] text-slate-400">{item.ward_name} • Address: {item.address}</p>
                </div>

                <Link
                  to={`/complaints/${item.id}`}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-md shadow-brand-500/20"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Inspect Site
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default OfficerDashboard;
