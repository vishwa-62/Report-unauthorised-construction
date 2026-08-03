import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, AlertCircle, RefreshCcw, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const CitizenComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      setError('Failed to fetch complaints list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusStyles = (status) => {
    const s = status.toLowerCase();
    if (s === 'resolved') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450';
    if (s === 'rejected') return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455';
    if (s === 'pending') return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-450';
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-450';
  };

  return (
    <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-800 dark:text-white">My Complaints Directory</h3>
          <p className="text-xs text-slate-400">All registered unauthorized construction violations files</p>
        </div>
        <button 
          onClick={fetchComplaints}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-750 rounded-xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-2xl">
          <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h4 className="font-bold text-slate-650 dark:text-slate-450">No reports submitted</h4>
          <p className="text-xs text-slate-400">You have not filed any building complaints yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-500/20"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-xs text-brand-600">{item.complaint_number}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${getStatusStyles(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {item.category_name || item.custom_category || 'General Violation'}
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal line-clamp-1">{item.description}</p>
                <div className="text-[10px] text-slate-400">📍 {item.address}</div>
              </div>

              <div className="shrink-0 flex">
                <Link
                  to={`/complaints/${item.id}`}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenComplaints;
