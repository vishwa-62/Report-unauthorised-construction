import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, ShieldAlert, Check, Loader2, Save } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) {
      setError('Full name is required.');
      return;
    }

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await axios.put('/auth/profile', {
        full_name: fullName,
        phone_number: phoneNumber
      });
      
      // Update local context user details
      setUser(prev => ({
        ...prev,
        full_name: fullName,
        phone_number: phoneNumber
      }));
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
      
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white">Profile Settings</h2>
        <p className="text-xs text-slate-400">View and update your personal information and roles</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 border-l-2 border-rose-500 rounded-lg text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-l-2 border-emerald-500 rounded-lg text-xs flex items-center gap-1.5 font-bold">
          <Check className="h-4 w-4" />
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Email read only */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address (Read Only)</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-400 rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Role read only */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portal Access Role</label>
          <div className="relative">
            <ShieldAlert className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              disabled
              value={user?.role?.toUpperCase() || ''}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-400 font-bold rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Full Name editable */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 rounded-xl outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        {/* Phone number editable */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 rounded-xl outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default Profile;
