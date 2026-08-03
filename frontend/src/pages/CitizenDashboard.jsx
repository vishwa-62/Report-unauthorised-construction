import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, AlertCircle, CheckCircle, RefreshCcw, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CitizenDashboard = () => {
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

  const getStatusStep = (status) => {
    const steps = ['pending', 'assigned', 'inspected', 'verified', 'resolved'];
    const currentIdx = steps.indexOf(status.toLowerCase());
    return currentIdx === -1 ? 0 : currentIdx;
  };

  const getStatusStyles = (status) => {
    const s = status.toLowerCase();
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
          className="px-5 py-2.5 bg-white text-brand-700 font-bold rounded-xl text-xs shadow-md hover:bg-slate-50 transition-all flex items-center gap-1.5 shrink-0"
        >
          Report Violation
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 3. Complaints Lists Panel */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-white">My Complaint History</h3>
            <p className="text-xs text-slate-400">All submissions and inspection milestones</p>
          </div>
          <button 
            onClick={fetchComplaints}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2 animate-bounce" />
            <h4 className="font-bold text-slate-600 dark:text-slate-450">No complaints registered</h4>
            <p className="text-xs text-slate-400 mt-0.5">Use the button above to file your first report.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((item) => {
              const currentStep = getStatusStep(item.status);
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:border-brand-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left segment: info */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-brand-600 dark:text-brand-500">{item.complaint_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${getStatusStyles(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug">
                      {item.category_name || item.custom_category || 'Unauthorized Activity'}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="text-[11px] text-slate-450 truncate">
                      📍 {item.address}
                    </div>
                  </div>

                  {/* Middle segment: milestone progress bar */}
                  <div className="hidden sm:flex flex-col gap-2 min-w-[240px] grow lg:grow-0 lg:max-w-[340px]">
                    <div className="flex justify-between text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                      <span>Submitted</span>
                      <span>Assigned</span>
                      <span>Resolved</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden relative border border-slate-200/20">
                      <div 
                        className="h-full bg-brand-500 transition-all duration-500" 
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] italic text-slate-450 mt-0.5 text-center">
                      AI Confidence Score:{' '}
                      <span className="font-bold text-slate-800 dark:text-slate-350">
                        {item.ai_confidence ? `${item.ai_confidence}%` : 'Pending'}
                      </span>
                    </p>
                  </div>

                  {/* Right segment: view button */}
                  <div className="shrink-0 flex items-center">
                    <Link
                      to={`/complaints/${item.id}`}
                      className="w-full lg:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs border border-slate-200/50 dark:border-slate-800 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default CitizenDashboard;
