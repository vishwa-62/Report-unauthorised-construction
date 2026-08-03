import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getStoredComplaints } from '../utils/mockStore';
import { FileText, AlertCircle, CheckCircle, RefreshCcw, Eye, ArrowRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/complaints');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setComplaints(res.data);
      } else {
        const stored = getStoredComplaints();
        setComplaints(stored);
      }
    } catch (err) {
      console.warn('Backend complaints endpoint unavailable. Using client complaints store.');
      const stored = getStoredComplaints();
      setComplaints(stored);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusStyles = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'resolved') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450';
    if (s === 'rejected') return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-450';
    if (s === 'pending') return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-450';
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-450';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Dashboard Stats Card Headers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Reports</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{complaints.length}</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
            <RefreshCcw className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Under Investigation</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">
              {complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cases Resolved</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">
              {complaints.filter(c => c.status === 'resolved').length}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Banner CTA */}
      <div className="p-6 bg-gradient-to-r from-brand-600 to-emerald-600 rounded-2xl text-white shadow-xl shadow-brand-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-lg">Witnessed an unauthorized construction activity?</h3>
          <p className="text-xs text-white/80 mt-0.5">Submit immediate geotagged photos. Our AI Vision system will pre-analyze and route the file in seconds.</p>
        </div>
        <Link 
          to="/citizen/new-complaint"
          className="px-5 py-2.5 bg-white text-brand-700 font-bold rounded-xl text-xs shadow-md hover:bg-slate-50 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Report Violation
        </Link>
      </div>

      {/* 3. Complaints Lists Panel */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-500" />
            Your Submitted Violation Complaints
          </h3>
          <button 
            onClick={fetchComplaints}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
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
          <div className="text-center py-12 space-y-3">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-400">No construction complaints submitted yet.</p>
            <Link to="/citizen/new-complaint" className="inline-block px-4 py-2 bg-brand-500 text-white font-bold rounded-xl text-xs">
              File First Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((item) => (
              <div 
                key={item.id}
                className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-500/30 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-brand-500">{item.complaint_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${getStatusStyles(item.status)}`}>
                      ● {item.status}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{item.description}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.ward_name} • Filed {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  to={`/complaints/${item.id}`}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CitizenDashboard;
