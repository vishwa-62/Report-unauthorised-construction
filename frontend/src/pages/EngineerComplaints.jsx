import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getStoredComplaints } from '../utils/mockStore';
import { Activity, Eye, RefreshCcw } from 'lucide-react';

const EngineerComplaints = () => {
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
      console.warn('Backend complaints endpoint unavailable. Using client store.');
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
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Engineering Violations Audit Queue
          </h2>
          <p className="text-xs text-slate-400">Review structural violations, assign inspectors, and approve orders</p>
        </div>
        <button onClick={fetchComplaints} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900">
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />)}
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No active complaints found in engineering queue.</p>
        ) : (
          complaints.map(item => (
            <div key={item.id} className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-brand-500">{item.complaint_number}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/10 text-blue-500">
                    ● {item.status}
                  </span>
                </div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1">{item.description}</p>
                <p className="text-[10px] text-slate-400">{item.ward_name} • Filed {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              <Link to={`/complaints/${item.id}`} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                Audit
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EngineerComplaints;
