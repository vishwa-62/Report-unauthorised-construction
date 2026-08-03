import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('citizen'); // 'citizen', 'officer', 'engineer', 'admin'
  const [email, setEmail] = useState('citizen1@cityguard.gov');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Seeding credentials map for rapid testing auto-fill
  const demoAccounts = {
    citizen: { email: 'citizen1@cityguard.gov', pass: 'password123' },
    officer: { email: 'officer1@cityguard.gov', pass: 'password123' },
    engineer: { email: 'engineer@cityguard.gov', pass: 'password123' },
    admin: { email: 'admin@cityguard.gov', pass: 'password123' }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(demoAccounts[role].email);
    setPassword(demoAccounts[role].pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'engineer') navigate('/engineer');
      else if (user.role === 'officer') navigate('/officer');
      else navigate('/citizen');
      
    } catch (err) {
      setError(err || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden px-4">
      {/* Background visual glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-slate-850/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-500/20 mb-3 animate-pulse">
            <Shield className="h-8 w-8 text-brand-500" />
          </div>
          <h2 className="text-xl font-black text-white">Enter Audit Portals</h2>
          <p className="text-xs text-slate-400 mt-1">Smart Construction Verification Control</p>
        </div>

        {/* ACCOUNT TYPE SELECTOR TABS */}
        <div className="space-y-1.5 mb-6 text-xs">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            Select Account Role (Quick Auto-Fill)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800/80">
            {[
              { id: 'citizen', label: 'Citizen' },
              { id: 'officer', label: 'Inspector' },
              { id: 'engineer', label: 'Auditor' },
              { id: 'admin', label: 'Executive' }
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role.id)}
                className={`py-2 px-1.5 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all cursor-pointer ${
                  selectedRole === role.id 
                    ? 'bg-brand-500 text-white shadow shadow-brand-500/15' 
                    : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 mb-5 text-xs font-semibold bg-red-950/30 border border-red-500/30 text-red-400 rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="citizen@cityguard.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 text-white placeholder-slate-550 rounded-xl outline-none focus:border-brand-500/50 text-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-850 text-white placeholder-slate-550 rounded-xl outline-none focus:border-brand-500/50 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-550 hover:text-slate-350"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/60 pt-5 flex items-center justify-between">
          <Link to="/" className="text-slate-500 hover:text-slate-350 font-bold hover:underline">
            ← Back to Home
          </Link>
          <div>
            New citizen?{' '}
            <Link to="/register" className="text-brand-500 hover:underline font-bold">
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
