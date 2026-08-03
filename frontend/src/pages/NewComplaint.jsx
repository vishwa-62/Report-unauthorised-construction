import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MapContainer from '../components/MapContainer';
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
  const [wards, setWards] = useState([]);
  const [categories, setCategories] = useState([]);
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
        setWards(wardsRes.data);
        setCategories(catsRes.data);
      } catch (err) {
        console.error('Error fetching categories or wards:', err);
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
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
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
      // Logic matching our backend aiMock keywords
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
    }, 1500);
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
      setError(err.response?.data?.message || 'Server error uploading complaint');
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
                  <option key={w.id} value={w.id}>{w.name} ({w.zone_name})</option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Construction Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs cursor-pointer"
              >
                <option value="">Other / General</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom category (if Other selected) */}
          {!categoryId && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specify Violation Type</label>
              <input
                type="text"
                placeholder="e.g. Construction near water body"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description *</label>
            <textarea
              required
              rows="4"
              placeholder="Provide a description of the construction (e.g. number of floors, road encroachment extent, absence of license permissions, structural materials...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
            />
          </div>

          {/* Address & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location Address *</label>
              <input
                type="text"
                required
                placeholder="Plot/Flat, Street name, Locality"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nearby Landmark</label>
              <input
                type="text"
                placeholder="e.g. opposite Green Park"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>
          </div>

          {/* Coordinates inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latitude *</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Longitude *</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-500/50 text-xs"
              />
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer h-[38px]"
            >
              <Navigation className="h-4 w-4" />
              My GPS Location
            </button>
          </div>

          {/* Upload Image and Preview */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attach Photo Evidence</label>
            <div className="flex items-center gap-4">
              <label className="px-5 py-4 border-2 border-dashed border-slate-200 dark:border-slate-850 hover:border-brand-500/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all grow text-center">
                <Upload className="h-6 w-6 text-slate-450 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upload PNG, JPEG, WEBP</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading Report...
              </>
            ) : 'Submit Report'}
          </button>

        </form>
      </div>

      {/* Right panel: map picker and AI preview card */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Map picker container */}
        <div className="glass-panel rounded-3xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 h-[320px] lg:h-[400px]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-500" />
              GIS Geolocation Picker
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <MapContainer 
              interactive={true} 
              onLocationSelect={handleMapLocationSelect}
              selectedLocation={{ lat: latitude, lng: longitude }}
            />
          </div>
        </div>

        {/* AI Precheck Results Card */}
        {imagePreview && (
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="font-extrabold text-xs text-slate-850 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-brand-500" />
                AI Pre-Verification Insight
              </h3>
              <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[8px] font-extrabold tracking-wide uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-spin" />
                Vision Engine
              </span>
            </div>

            <div className="flex gap-4">
              {/* Photo Thumbnail */}
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                className="h-20 w-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
              />

              {/* AI Insights content */}
              <div className="flex-1 space-y-1.5 min-w-0">
                {runningAI ? (
                  <div className="flex flex-col gap-1.5 py-2">
                    <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-900 animate-pulse rounded" />
                    <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-900 animate-pulse rounded" />
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded" />
                  </div>
                ) : aiPreview ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-850 dark:text-white truncate">
                        {aiPreview.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        {aiPreview.confidence}% Match
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      💡 {aiPreview.rec}
                    </p>
                  </>
                ) : (
                  <p className="text-[10px] text-slate-400 py-3">Write description to trigger predictive AI check.</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default NewComplaint;
