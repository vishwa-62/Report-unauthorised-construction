import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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
      setComplaint(res.data);
      
      // Auto-set inspection coordinates from complaint
      if (res.data) {
        setInspectLat(res.data.latitude);
        setInspectLng(res.data.longitude);
      }
    } catch (err) {
      setError('Failed to fetch complaint details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficersList = async () => {
    if (user && (user.role === 'engineer' || user.role === 'admin')) {
      try {
        const res = await axios.get('/officers');
        setOfficers(res.data);
      } catch (err) {
        console.error('Error fetching officers:', err);
      }
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchOfficersList();
  }, [id]);

  // Submit Feedback (Citizen)
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    try {
      await axios.post(`/complaints/${id}/feedback`, { rating, comments: feedbackComments });
      alert('Feedback submitted successfully!');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Submit Assignment (Engineer/Admin)
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficer) return;
    setAssignLoading(true);
    try {
      await axios.post('/officers/assign', {
        complaint_id: id,
        officer_id: selectedOfficer,
        remarks: assignRemarks
      });
      alert('Inspection assigned successfully!');
      setAssignRemarks('');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign officer.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Update Status (Engineer/Admin)
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setStatusLoading(true);
    try {
      await axios.put(`/complaints/${id}/status`, {
        status: newStatus,
        remarks: statusRemarks
      });
      alert('Status updated successfully!');
      setStatusRemarks('');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Submit Field Officer Inspection Report
  const handleInspectionSubmit = async (e) => {
    e.preventDefault();
    if (!findings) return;
    
    // Find relevant active assignment id
    const activeAssignment = complaint.assignments?.find(a => a.status === 'assigned');
    if (!activeAssignment) {
      alert('No active assignment found.');
      return;
    }

    setInspectLoading(true);
    try {
      await axios.post('/officers/report', {
        assignment_id: activeAssignment.id,
        findings,
        recommendation,
        status_update: proposedStatus,
        latitude: inspectLat,
        longitude: inspectLng
      });
      alert('Inspection report filed successfully!');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to file inspection report.');
    } finally {
      inspectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading Case File...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl text-center font-bold">
        ⚠️ {error || 'Complaint not found.'}
      </div>
    );
  }

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s === 'resolved') return 'bg-emerald-500 text-white';
    if (s === 'rejected') return 'bg-rose-500 text-white';
    if (s === 'pending') return 'bg-blue-500 text-white';
    return 'bg-amber-500 text-slate-900';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* 1. Main Case File Cards (7 Cols) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-850 dark:text-white">{complaint.complaint_number}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Submitted on {new Date(complaint.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-red-155 text-red-500 border border-red-500/25">
                Severity: {complaint.severity}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Violation Type</h4>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {complaint.category_name || complaint.custom_category || 'General Violation'}
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Description Findings</h4>
              <p className="text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                {complaint.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Address</h4>
                <p className="text-slate-800 dark:text-slate-200 font-semibold">{complaint.address}</p>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Nearby Landmark</h4>
                <p className="text-slate-850 dark:text-slate-200 font-semibold">{complaint.nearby_landmark || 'None specified'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Ward & Zone Coordinates</h4>
                <p className="text-slate-850 dark:text-slate-200 font-semibold">
                  {complaint.ward_name} ({complaint.zone_name})
                </p>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">GPS Geolocation</h4>
                <p className="text-slate-850 dark:text-slate-200 font-semibold">
                  Lat: {complaint.latitude} | Lng: {complaint.longitude}
                </p>
              </div>
            </div>
          </div>

          {/* Photo Evidence attachments */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Uploaded Evidence</h4>
              <div className="flex flex-wrap gap-4">
                {complaint.images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img 
                      src={`http://localhost:5000${img.file_path}`} 
                      alt="Complaint evidence" 
                      className="h-32 w-32 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                    />
                    <a 
                      href={`http://localhost:5000${img.file_path}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-bold text-[10px] text-white"
                    >
                      Open Full Size
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI verification card details */}
        {complaint.ai_analysis && (
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clipboard className="h-4.5 w-4.5 text-brand-500" />
                AI Auto-Verification Log
              </h4>
              <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-450 text-[9px] font-extrabold">
                {complaint.ai_analysis.confidence_score}% CONFIDENCE
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Predicted Class</span>
                <span className="font-bold text-slate-800 dark:text-slate-150">{complaint.ai_analysis.prediction_label}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Action Recommendation</span>
                <p className="text-slate-600 dark:text-slate-350 leading-relaxed mt-0.5">{complaint.ai_analysis.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Field officer inspection reports details */}
        {complaint.inspection_reports && complaint.inspection_reports.length > 0 && (
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Field Officer Inspection Findings
            </h4>
            {complaint.inspection_reports.map((rep) => (
              <div key={rep.id} className="text-xs space-y-3">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Inspector: <span className="font-bold text-slate-650 dark:text-slate-300">{rep.officer_name}</span></span>
                  <span>Date: {new Date(rep.inspection_date).toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Findings Log</span>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed">{rep.findings}</p>
                </div>
                {rep.recommendation && (
                  <div className="text-slate-600 dark:text-slate-350">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Proposed Action</span>
                    <p className="mt-0.5">{rep.recommendation}</p>
                  </div>
                )}
                <div className="flex gap-4 text-[10px] text-slate-400">
                  <span>Proposed Status: <span className="font-bold uppercase text-brand-600">{rep.status_update}</span></span>
                  {rep.latitude && <span>Verified GPS: {rep.latitude}, {rep.longitude}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Citizen Feedback Widget */}
        {complaint.status.toLowerCase() === 'resolved' && !complaint.feedback && user?.role === 'citizen' && (
          <form onSubmit={handleFeedbackSubmit} className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Rate Resolution Quality
            </h4>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setRating(val)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`h-6 w-6 ${val <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Comments</label>
              <textarea
                rows="2"
                placeholder="Let us know how satisfied you are with the clearing resolution..."
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={feedbackLoading}
              className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Feedback
            </button>
          </form>
        )}

        {/* Display Citizen Feedback results (if already exists) */}
        {complaint.feedback && (
          <div className="glass-panel border border-emerald-500/20 dark:border-emerald-500/10 rounded-3xl p-5 space-y-3 bg-emerald-50/10 dark:bg-emerald-950/5">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
              <h4 className="font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider">
                Citizen Feedback & Satisfaction
              </h4>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <Star 
                    key={val} 
                    className={`h-4.5 w-4.5 ${val <= complaint.feedback.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} 
                  />
                ))}
              </div>
            </div>
            <p className="text-xs italic text-slate-650 dark:text-slate-350">
              "{complaint.feedback.comments || 'No comments left.'}"
            </p>
          </div>
        )}
      </div>

      {/* 2. Side Panel (4 Cols) - Timeline, Assignment Drawer & Status Update */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Case Timeline tracking status updates */}
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
          <h4 className="font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Timeline Progress
          </h4>
          <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-1">
            {complaint.status_history?.map((h, index) => (
              <div key={h.id} className="relative text-xs">
                {/* Visual bullet marker pin */}
                <span className="absolute left-[-21px] top-1.5 h-2 w-2 rounded-full bg-brand-500 border border-white dark:border-slate-950 ring-2 ring-brand-500/20" />
                <div className="font-extrabold text-[10px] text-brand-600 uppercase tracking-wide">
                  {h.status}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-normal mt-0.5">{h.remarks}</p>
                <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
                  <span>By: {h.updated_by_name} ({h.updated_by_role})</span>
                  <span>{new Date(h.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. ENGINEER / ADMIN ACTIONS */}
        {(user?.role === 'engineer' || user?.role === 'admin') && (
          <div className="space-y-6">
            
            {/* Drawer 1: Assign Officer */}
            {complaint.status === 'pending' || complaint.status === 'under_review' ? (
              <form onSubmit={handleAssignSubmit} className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                <h4 className="font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  Assign Field Officer
                </h4>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Select Officer</label>
                  <select
                    required
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
                  >
                    <option value="">Choose Officer</option>
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.officer_name} ({o.active_assignments} active - {o.availability_status})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Remarks / Checklist</label>
                  <textarea
                    rows="2"
                    placeholder="Check setback limit or wall encroachment measurements..."
                    value={assignRemarks}
                    onChange={(e) => setAssignRemarks(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="w-full py-2.5 bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Assignment'}
                </button>
              </form>
            ) : null}

            {/* Drawer 2: Update Complaint Status */}
            <form onSubmit={handleStatusUpdate} className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
              <h4 className="font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                Executive Action
              </h4>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Set Case Status</label>
                <select
                  required
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
                >
                  <option value="">Select Status</option>
                  <option value="under_review">Under Review</option>
                  <option value="verified">Verify (Confirm Violation)</option>
                  <option value="resolved">Mark Resolved (Action Taken)</option>
                  <option value="rejected">Reject (No violation found)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Remarks / Orders</label>
                <textarea
                  rows="2"
                  placeholder="Official comment or clearing order references..."
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={statusLoading}
                className="w-full py-2.5 bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                {statusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Order'}
              </button>
            </form>

          </div>
        )}

        {/* 4. FIELD OFFICER INSPECTION REPORT INPUT */}
        {user?.role === 'officer' && complaint.status === 'assigned' && (
          <form onSubmit={handleInspectionSubmit} className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              File Site Inspection
            </h4>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Recommended Decision</label>
              <select
                value={proposedStatus}
                onChange={(e) => setProposedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              >
                <option value="verified">Confirm Violation (Verify)</option>
                <option value="rejected">No Violation (Reject)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Physical Findings</label>
              <textarea
                required
                rows="3"
                placeholder="Mention wall measurements, concrete layers, or other physical indicators observed..."
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Proposed Clearing Action</label>
              <textarea
                rows="2"
                placeholder="e.g. Demolition of compound wall..."
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>

            {/* Coordinates verification */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Verified Lat</label>
                <input 
                  type="number" 
                  step="any"
                  value={inspectLat} 
                  onChange={(e) => setInspectLat(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Verified Lng</label>
                <input 
                  type="number" 
                  step="any"
                  value={inspectLng} 
                  onChange={(e) => setInspectLng(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={inspectLoading}
              className="w-full py-2.5 bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
            >
              {inspectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'File Verification Report'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ComplaintDetails;
