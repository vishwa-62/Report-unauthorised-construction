import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Register = () => {
  const { registerUser, setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP flow states
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOTP, setSimulatedOTP] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { email, password, full_name, phone_number } = formData;

    if (!email || !password || !full_name) {
      setError('Name, Email and Password are required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await registerUser(email, password, full_name, phone_number);
      setSimulatedOTP(data.simulatedOTP);
      setRegisteredEmail(email);
      setOtpStep(true);
      // Auto save token for verification step
      if (data.token) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
    } catch (err) {
      setError(err || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode) return;

    setError('');
    setOtpLoading(true);
    try {
      const res = await axios.post('/auth/verify-otp', {
        email: registeredEmail,
        otp: otpCode
      });
      
      // Auto login user after OTP is verified
      const profileRes = await axios.get('/auth/profile');
      setUser(profileRes.data);
      navigate('/citizen');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden px-4">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-850/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-500/20 mb-3 animate-pulse">
            <Shield className="h-8 w-8 text-brand-500" />
          </div>
          <h2 className="text-xl font-black text-white">Create Portal Account</h2>
          <p className="text-xs text-slate-400 mt-1">Smart Construction Verification</p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-xs font-semibold bg-red-950/30 border border-red-500/30 text-red-400 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {!otpStep ? (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 text-white placeholder-slate-550 rounded-xl outline-none focus:border-brand-500/50 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 text-white placeholder-slate-550 rounded-xl outline-none focus:border-brand-500/50 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="+91 99999 88888"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 text-white placeholder-slate-550 rounded-xl outline-none focus:border-brand-500/50 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 text-white placeholder-slate-550 rounded-xl outline-none focus:border-brand-500/50 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Register'}
            </button>
          </form>
        ) : (
          /* OTP VERIFICATION STEP */
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="p-3 bg-brand-500/10 border border-brand-500/25 rounded-2xl text-center">
              <p className="text-xs text-slate-300">
                A verification code has been simulated for test environment:
              </p>
              <p className="text-xl font-extrabold tracking-widest text-brand-400 mt-2">
                {simulatedOTP}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enter OTP Code</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full py-3 bg-slate-900 border border-slate-850 text-white font-extrabold text-center tracking-widest placeholder-slate-600 rounded-xl outline-none focus:border-brand-500/50 text-base"
              />
            </div>

            <button
              type="submit"
              disabled={otpLoading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {otpLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Code & Complete Sign In'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/60 pt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
