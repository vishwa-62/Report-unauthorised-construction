import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getStoredComplaints } from '../utils/mockStore';
import { FileText, Eye, RefreshCcw, Plus } from 'lucide-react';

const CitizenComplaints = () => {
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
      console.warn('Backend complaints unavailable. Using client store.');
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
            <FileText className="h-5 w-5 text-brand-500" />
            My Filed Violation Reports
          </h2>
          <p className="text-xs text-slate-400">Track current case statuses and active resolution stages</p>
        </div>
        <Link 
          to="/citizen/new-complaint" 
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Report
        </Link>
      </div>

      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />)}
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No complaints found.</p>
        ) : (
          complaints.map(item => (
            <div key={item.id} className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-brand-500">{item.complaint_number}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-500/10 text-brand-500">
                    ● {item.status}
                  </span>
                </div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1">{item.description}</p>
                <p className="text-[10px] text-slate-400">{item.ward_name} • {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              <Link to={`/complaints/${item.id}`} className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                View
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CitizenComplaints;
