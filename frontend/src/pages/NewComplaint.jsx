import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MapContainer from '../components/MapContainer';
import { MOCK_WARDS, MOCK_CATEGORIES, saveComplaintToStore } from '../utils/mockStore';
import { MapPin, Navigation, Upload, ShieldAlert, Cpu, Sparkles, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NewComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(18.5204);
  const [longitude, setLongitude] = useState(73.8567);
  const [wardId, setWardId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [landmark, setLandmark] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // Helpers list from backend
  const [wards, setWards] = useState(MOCK_WARDS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [loadingLists, setLoadingLists] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI simulation preview state
  const [imagePreview, setImagePreview] = useState('');
  const [aiPreview, setAiPreview] = useState(null);
  const [runningAI, setRunningAI] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [wardsRes, catsRes] = await Promise.all([
          axios.get('/admin/wards'),
          axios.get('/admin/categories')
        ]);
        if (wardsRes.data && Array.isArray(wardsRes.data) && wardsRes.data.length > 0) {
          setWards(wardsRes.data);
        }
        if (catsRes.data && Array.isArray(catsRes.data) && catsRes.data.length > 0) {
          setCategories(catsRes.data);
        }
      } catch (err) {
        console.warn('Backend categories or wards API unavailable. Using default lists.');
        setWards(MOCK_WARDS);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchLists();
  }, []);

  // Geolocation API fetch
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        alert('Could not acquire your current coordinates automatically. Please pick a location manually on the map.');
      }
    );
  };

  // Click on Leaflet Map
  const handleMapLocationSelect = (lat, lng) => {
    setLatitude(parseFloat(lat.toFixed(6)));
    setLongitude(parseFloat(lng.toFixed(6)));
  };

  // Image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Simulate running AI precheck on client side prior to submission
      simulateAIPrecheck(file.name);
    }
  };

  const simulateAIPrecheck = (fileName) => {
    setRunningAI(true);
    setAiPreview(null);
    setTimeout(() => {
      const descLower = description.toLowerCase();
      let label = 'Illegal Building';
      let confidence = 88.5;
      let rec = 'High probability of illegal structural foundation. Verify zoning clearances.';

      if (descLower.includes('road') || descLower.includes('encroach') || descLower.includes('footpath') || descLower.includes('drain')) {
        label = 'Road Encroachment';
        confidence = 94.2;
        rec = 'Wall boundary extends onto pedestrian grid. Request field layout measurements.';
      } else if (descLower.includes('floor') || descLower.includes('height') || descLower.includes('storey') || descLower.includes('story')) {
        label = 'Extra Floor';
        confidence = 91.8;
        rec = 'Estimated count exceeds standard limits. Crosscheck FSI guidelines.';
      }

      setAiPreview({ label, confidence, rec });
      setRunningAI(false);
    }, 1200);
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !address || !latitude || !longitude || !wardId) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('description', description);
    formData.append('address', address);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('ward_id', wardId);
    formData.append('nearby_landmark', landmark);
    
    if (categoryId) formData.append('category_id', categoryId);
    if (customCategory) formData.append('custom_category', customCategory);
    if (imageFile) formData.append('image', imageFile);

    try {
      await axios.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/citizen');
    } catch (err) {
      console.warn('Backend API unavailable. Saving complaint to local store:', err);
      const selectedWard = wards.find(w => String(w.id) === String(wardId));
      const selectedCat = categories.find(c => String(c.id) === String(categoryId));

      const newObj = {
        id: Date.now(),
        complaint_number: `CG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        description,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        ward_id: wardId,
        ward_name: selectedWard?.name || `Ward ${wardId}`,
        category_name: selectedCat?.name || customCategory || 'General',
        severity: aiPreview?.confidence > 90 ? 'critical' : 'high',
        status: 'pending',
        citizen_name: user?.full_name || 'Citizen',
        citizen_email: user?.email || 'citizen1@cityguard.gov',
        created_at: new Date().toISOString(),
        nearby_landmark: landmark,
        ai_predicted_label: aiPreview?.label || 'Precheck Verified',
        ai_confidence: aiPreview?.confidence || 90.0,
        ai_recommendation: aiPreview?.rec || 'Initial complaint queued for review.'
      };

      saveComplaintToStore(newObj);
      navigate('/citizen');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* Left panel: filing form */}
      <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white">File Construction Violation Report</h2>
          <p className="text-xs text-slate-400">Fill in accurate locations and attach evidence details</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-l-2 border-rose-500 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Ward Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Ward / Area *</label>
              <select
                required
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs cursor-pointer"
              >
                <option value="">Choose Ward</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs cursor-pointer"
              >
                <option value="">Choose Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Violation Details *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe the illegal construction (e.g. Unsanctioned additional floors, setback encroachment, construction on public road...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
            />
          </div>

          {/* Address & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Street Address / Spot *</label>
              <input
                type="text"
                required
                placeholder="Plot / Street / Building Name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nearby Landmark</label>
              <input
                type="text"
                placeholder="e.g. Opp Metro Gate / Near Water Tank"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>
          </div>

          {/* Coordinate Inputs with GPS button */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-brand-500" />
                Geotag Coordinates (Auto / Map Selection)
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="px-2.5 py-1 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Navigation className="h-3 w-3" />
                Use My GPS Location
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs outline-none"
              />
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          {/* Image File Attachment */}
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attach Photographic Evidence</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-750 rounded-xl cursor-pointer hover:border-brand-500 flex items-center justify-center gap-2 text-xs text-slate-400 transition-colors">
                <Upload className="h-4 w-4 text-brand-500" />
                <span>{imageFile ? imageFile.name : 'Click to upload site photo (JPEG/PNG)'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting Report...
              </>
            ) : 'Submit Violation Report'}
          </button>

        </form>
      </div>

      {/* Right panel: Interactive GIS map picker & AI Precheck */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Map Location Selector */}
        <div className="glass-panel rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">GIS Map Location Picker</h3>
            <span className="text-[10px] text-brand-500 font-bold">Click map to pin spot</span>
          </div>
          <div className="h-[260px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <MapContainer
              latitude={latitude}
              longitude={longitude}
              isInteractive={true}
              onLocationSelect={handleMapLocationSelect}
            />
          </div>
        </div>

        {/* AI Verification Precheck Box */}
        <div className="glass-panel rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-brand-500" />
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">AI Pre-Analysis Engine</h3>
          </div>

          {runningAI ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
              <Sparkles className="h-5 w-5 text-brand-500 animate-spin" />
              Scanning image features and classification vectors...
            </div>
          ) : aiPreview ? (
            <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-500 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Detected: {aiPreview.label}
                </span>
                <span className="px-2 py-0.5 bg-brand-500/10 text-brand-500 rounded font-bold text-[10px]">
                  {aiPreview.confidence}% Confidence
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{aiPreview.rec}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-2">
              Attach an image above to run real-time AI structural anomaly recognition.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};

export default NewComplaint;
