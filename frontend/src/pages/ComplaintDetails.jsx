import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getStoredComplaints, updateComplaintInStore } from '../utils/mockStore';
import MapContainer from '../components/MapContainer';
import { 
  FileText, Calendar, MapPin, User, ChevronRight, Star, 
  Send, ShieldAlert, BadgeAlert, CheckCircle, RefreshCcw, Loader2, Clipboard, Map
} from 'lucide-react';
import { motion } from 'framer-motion';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states inside page
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Field Officer Inspection Form states
  const [findings, setFindings] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [proposedStatus, setProposedStatus] = useState('verified');
  const [inspectLat, setInspectLat] = useState('');
  const [inspectLng, setInspectLng] = useState('');
  const [inspectLoading, setInspectLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/complaints/${id}`);
      if (res.data) {
        setComplaint(res.data);
        setInspectLat(res.data.latitude);
        setInspectLng(res.data.longitude);
      }
    } catch (err) {
      console.warn(`Backend complaint details endpoint unavailable for ID ${id}. Searching client store.`);
      const storedList = getStoredComplaints();
      const match = storedList.find(c => String(c.id) === String(id)) || storedList[0];
      if (match) {
        setComplaint(match);
        setInspectLat(match.latitude || 18.5204);
        setInspectLng(match.longitude || 73.8567);
      } else {
        setError('Complaint record not found.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await axios.get('/officers');
      if (res.data && Array.isArray(res.data)) {
        setOfficers(res.data);
      }
    } catch (err) {
      console.warn('Backend officers list unavailable. Using demo officers list.');
      setOfficers([
        { id: 1, full_name: 'Inspector Vikram Singh', badge_number: 'CG-OFF-101' },
        { id: 2, full_name: 'Inspector Sunita Rao', badge_number: 'CG-OFF-102' }
      ]);
    }
  };

  useEffect(() => {
    fetchDetails();
    if (user && (user.role === 'engineer' || user.role === 'admin')) {
      fetchOfficers();
    }
  }, [id, user]);

  // Handler: Assign Officer
  const handleAssignOfficer = async (e) => {
    e.preventDefault();
    if (!selectedOfficer) return;
    setAssignLoading(true);
    try {
      await axios.post('/officers/assign', {
        complaint_id: complaint.id,
        officer_id: selectedOfficer,
        remarks: assignRemarks
      });
      fetchDetails();
    } catch (err) {
      console.warn('Backend assignment endpoint unavailable. Updating locally.');
      const offObj = officers.find(o => String(o.id) === String(selectedOfficer));
      const updated = updateComplaintInStore(complaint.id, {
        assigned_officer_name: offObj?.full_name || 'Inspector Vikram Singh',
        status: 'assigned'
      });
      const match = updated.find(c => String(c.id) === String(complaint.id));
      if (match) setComplaint(match);
      alert('Officer assigned successfully!');
    } finally {
      setAssignLoading(false);
    }
  };

  // Handler: Update Status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setStatusLoading(true);
    try {
      await axios.put(`/complaints/${complaint.id}/status`, {
        status: newStatus,
        remarks: statusRemarks
      });
      fetchDetails();
    } catch (err) {
      console.warn('Backend status update endpoint unavailable. Updating locally.');
      const updated = updateComplaintInStore(complaint.id, { status: newStatus });
      const match = updated.find(c => String(c.id) === String(complaint.id));
      if (match) setComplaint(match);
      alert(`Complaint status updated to ${newStatus}!`);
    } finally {
      setStatusLoading(false);
    }
  };

  // Handler: Submit Officer Inspection
  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!findings || !recommendation) return;
    setInspectLoading(true);
    try {
      await axios.post('/officers/report', {
        complaint_id: complaint.id,
        findings,
        recommendation,
        proposed_status: proposedStatus,
        latitude: inspectLat,
        longitude: inspectLng
      });
      fetchDetails();
    } catch (err) {
      console.warn('Backend inspection endpoint unavailable. Updating locally.');
      const updated = updateComplaintInStore(complaint.id, {
        status: proposedStatus,
        inspection_report: {
          findings,
          recommendation,
          inspected_at: new Date().toISOString()
        }
      });
      const match = updated.find(c => String(c.id) === String(complaint.id));
      if (match) setComplaint(match);
      alert('Inspection report submitted successfully!');
    } finally {
      setInspectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading complaint details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="text-center py-16 space-y-4">
        <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
        <p className="text-sm font-bold text-slate-800 dark:text-white">{error || 'Complaint Record Not Found'}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-brand-500 text-white rounded-xl font-bold text-xs">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-sm text-brand-500">{complaint.complaint_number}</span>
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-black bg-brand-500/10 text-brand-500">
              ● {complaint.status}
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white">{complaint.ward_name}</h2>
          <p className="text-xs text-slate-400">Filed on {new Date(complaint.created_at).toLocaleDateString()}</p>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs"
        >
          ← Back
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Case Details & Map */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">Violation Summary</h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{complaint.description}</p>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                <span className="font-bold text-slate-800 dark:text-white">{complaint.category_name || 'General Violation'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Severity Level</span>
                <span className="font-bold text-rose-500 uppercase">{complaint.severity || 'Medium'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Address</span>
                <span className="font-bold text-slate-800 dark:text-white">{complaint.address}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Landmark</span>
                <span className="font-bold text-slate-800 dark:text-white">{complaint.nearby_landmark || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* GIS Location */}
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Map className="h-4 w-4 text-brand-500" />
              GIS Geotag Location
            </h3>
            <div className="h-[240px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <MapContainer latitude={complaint.latitude} longitude={complaint.longitude} />
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Role Forms */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Precheck Analysis Box */}
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider">AI Pre-Analysis System</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-500">{complaint.ai_predicted_label || 'Structural Anomaly Detected'}</span>
                <span className="px-2 py-0.5 bg-brand-500/10 text-brand-500 font-bold rounded text-[10px]">
                  {complaint.ai_confidence || 92.5}% Confidence
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{complaint.ai_recommendation || 'High structural impact. Dispatch field inspector.'}</p>
            </div>
          </div>

          {/* Officer Form (If officer) */}
          {(user?.role === 'officer' || user?.role === 'admin' || user?.role === 'engineer') && (
            <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
                <Clipboard className="h-4 w-4 text-brand-500" />
                Submit Field Inspection Report
              </h3>
              <form onSubmit={handleSubmitInspection} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Field Findings *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter on-site structural observations..."
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Official Recommendation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Issue Stop Work Notice / Demolish"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={inspectLoading}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Submit Inspection Report
                </button>
              </form>
            </div>
          )}

          {/* Engineer / Admin Officer Assignment Form */}
          {(user?.role === 'engineer' || user?.role === 'admin') && (
            <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-extrabold text-xs uppercase text-slate-450 tracking-wider">Assign Field Inspector</h3>
              <form onSubmit={handleAssignOfficer} className="space-y-3">
                <select
                  required
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl outline-none cursor-pointer"
                >
                  <option value="">Choose Inspector</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.full_name} ({o.badge_number || 'Inspector'})</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Assign Inspector
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default ComplaintDetails;
