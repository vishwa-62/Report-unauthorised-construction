import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardList, CheckCircle, RefreshCcw, Loader2, Calendar, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

const OfficerDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/officers/assigned');
      setAssignments(res.data);
    } catch (err) {
      setError('Failed to fetch assigned inspections.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading Officer Dashboard...</p>
      </div>
    );
  }

  // Group assignments by days
  const pendingCount = assignments.filter(a => a.assignment_status === 'assigned').length;

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
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Pending Site checks</span>
            <p className="text-xl font-extrabold text-slate-850 dark:text-white">{pendingCount}</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Completed Checks</span>
            <p className="text-xl font-extrabold text-slate-850 dark:text-white">
              {assignments.filter(a => a.assignment_status === 'completed').length}
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Widget Panel (7 columns) */}
        <div className="lg:col-span-7 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-brand-500" />
              Inspection Schedule
            </h4>
          </div>
          {/* Simple mock calendar layout */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="font-extrabold text-slate-400 py-1 text-[10px] uppercase">{d}</span>
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasAssignment = day === 26 || day === 28;
              return (
                <div 
                  key={day} 
                  className={`py-3.5 rounded-xl border font-bold text-xs relative transition-all ${
                    day === 26
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/15'
                      : hasAssignment
                      ? 'border-brand-500/30 bg-brand-50/20 text-brand-600 dark:text-brand-450 hover:bg-brand-50/40'
                      : 'border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-750'
                  }`}
                >
                  {day}
                  {hasAssignment && day !== 26 && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-brand-500 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick details of pending lists (5 columns) */}
        <div className="lg:col-span-5 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider mb-4"> Caseload Brief</h4>
            {assignments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No assignments loaded.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {assignments.map(a => (
                  <div key={a.assignment_id} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/20">
                    <div className="min-w-0">
                      <span className="font-bold text-brand-600">{a.complaint_number}</span>
                      <p className="text-slate-400 truncate text-[10px]">{a.address}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 italic font-semibold shrink-0">
                      {a.assignment_status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={fetchAssignments}
            className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-850 transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Calendar
          </button>
        </div>

      </div>

    </div>
  );
};

export default OfficerDashboard;
