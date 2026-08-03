import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MapContainer from '../components/MapContainer';
import { ClipboardList, MapPin, RefreshCcw, Navigation, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const OfficerInspections = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPin, setSelectedPin] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/officers/assigned');
      setAssignments(res.data);
      if (res.data.length > 0) {
        setSelectedPin({
          lat: parseFloat(res.data[0].latitude),
          lng: parseFloat(res.data[0].longitude)
        });
      }
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* Table list of inspections (7 columns) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-850 dark:text-white">Site Assignments Directory</h2>
            <p className="text-xs text-slate-400 font-medium">Verify setback coordinates and file findings</p>
          </div>
          <button 
            onClick={fetchAssignments}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 border-l-2 border-rose-500 rounded-lg text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-28 w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-600">No Assignments Found</h4>
            <p className="text-xs text-slate-400">All coordinates clear.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((item) => (
              <motion.div
                key={item.assignment_id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedPin({ lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) })}
                className={`p-5 border rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  selectedPin?.lat === parseFloat(item.latitude)
                    ? 'border-brand-500 bg-brand-50/10 dark:bg-brand-900/5'
                    : 'border-slate-200 dark:border-slate-850 hover:border-slate-350'
                }`}
              >
                <div className="space-y-1.5 max-w-md text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-600">{item.complaint_number}</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-extrabold text-[8px] uppercase">
                      {item.severity}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(item.assigned_date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.category_name || 'Encroachment'}</h4>
                  <p className="text-slate-450 leading-relaxed line-clamp-1">{item.description}</p>
                  <p className="text-[10px] flex items-center gap-1 font-semibold text-slate-400">
                    📍 {item.address}
                  </p>
                </div>

                <div className="shrink-0 flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPin({ lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) });
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                  <Link
                    to={`/complaints/${item.complaint_id}`}
                    className="flex-1 sm:flex-none px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <Eye className="h-4 w-4" />
                    Open
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Map mapping preview (5 columns) */}
      <div className="lg:col-span-5">
        <div className="glass-panel rounded-3xl p-4 border border-slate-200 dark:border-slate-800 h-[360px] lg:h-[480px]">
          <div className="flex-1 h-full min-h-0">
            <MapContainer 
              complaints={assignments.map(a => ({
                id: a.complaint_id,
                complaint_number: a.complaint_number,
                latitude: a.latitude,
                longitude: a.longitude,
                description: a.description,
                category_name: a.category_name,
                status: 'assigned',
                severity: a.severity
              }))}
              selectedLocation={selectedPin}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default OfficerInspections;
