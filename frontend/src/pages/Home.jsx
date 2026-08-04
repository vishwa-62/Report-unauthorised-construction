import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getStoredComplaints } from '../utils/mockStore';
import { 
  Shield, Sparkles, Map, ClipboardCheck, ArrowRight, Eye, ShieldAlert,
  ChevronDown, ChevronUp, HelpCircle, FileText, Camera, Send, Clock,
  MapPin, Search, Filter, Cpu, AlertTriangle, CheckCircle, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const { token, user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoadingComplaints(true);
        const res = await axios.get('/complaints');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setComplaints(res.data);
        } else {
          setComplaints(getStoredComplaints());
        }
      } catch (err) {
        setComplaints(getStoredComplaints());
      } finally {
        setLoadingComplaints(false);
      }
    };
    fetchComplaints();
  }, []);

  const stats = [
    { value: '1,420+', label: 'Violations Tracked' },
    { value: '94.2%', label: 'AI Accuracy Rating' },
    { value: '4.2 Days', label: 'Average Resolution SLA' },
    { value: '16 Wards', label: 'Complete City Coverage' }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Assisted Vision',
      desc: 'Citizen uploaded photos undergo immediate machine-learning classification checking for setbacks, road encroachments, and extra floors.'
    },
    {
      icon: Map,
      title: 'Interactive GIS Map',
      desc: 'Visualizes city-wide violations in cluster groups and custom heatmaps with street, satellite and terrain layers.'
    },
    {
      icon: ClipboardCheck,
      title: 'Site Assignment Audit',
      desc: 'Provides seamless task handoff: engineers inspect logs, assign officers via maps, and sign off compliance reports.'
    }
  ];

  const workflowSteps = [
    {
      icon: Camera,
      title: '1. Report Filed',
      desc: 'Citizen uploads building photo, selects category, and marks the GPS coordinate.'
    },
    {
      icon: Sparkles,
      title: '2. AI Scan',
      desc: 'Computer vision processes the photo to estimate setback compliance and floor count.'
    },
    {
      icon: Send,
      title: '3. Task Dispatched',
      desc: 'Engineers assign field inspectors to verify building coordinates on site.'
    },
    {
      icon: Clock,
      title: '4. Compliance Enforced',
      desc: 'Reports are compiled into PDF/Excel format and routed for executive sign-off.'
    }
  ];

  const faqs = [
    {
      q: 'How does the AI vision scanner work?',
      a: 'The system uses custom convolutional neural networks trained on municipal setback rules. When an image is uploaded, it runs visual segmentations to estimate building boundaries, counts floor levels, and flags potential road encroachments.'
    },
    {
      q: 'Can citizens report violations anonymously?',
      a: 'Yes. Citizens register accounts securely via simulated OTP phone checks, but reporting identities are hidden on public portals. Officers and engineers only see the coordinates, description, and photo attachments.'
    },
    {
      q: 'What types of construction violations are tracked?',
      a: 'We monitor unauthorized extra floors (above zone restrictions), side/front setback violations (building too close to boundaries), road encroachments, and building without building permits.'
    },
    {
      q: 'How long does a field verification take?',
      a: 'Under our strict Service Level Agreement (SLA), once a complaint is verified by the AI, it is routed to a ward engineer within 24 hours. Field inspections are typically completed within 4.2 days.'
    }
  ];

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'resolved') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Resolved</span>;
    }
    if (s === 'rejected') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Rejected</span>;
    }
    if (s === 'under_review' || s === 'inspected') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1"><Eye className="h-3 w-3" /> In Review</span>;
    }
    if (s === 'assigned') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Clock className="h-3 w-3" /> Assigned</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1"><RefreshCcw className="h-3 w-3" /> Pending</span>;
  };

  const categories = ['All', 'Illegal Floor Construction', 'Footpath Encroachment', 'Drainage Block Encroachment', 'Unauthorized Commercial Shed', 'Setback Violation'];

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = (c.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.complaint_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || c.category_name === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans">
      
      {/* Background glowing blobs */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand-600/10 blur-[130px] z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[130px] z-0" />

      {/* 1. Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-brand-500" />
          <span className="font-extrabold text-base tracking-tight">CityGuard AI</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          {token && user ? (
            <Link 
              to={user.role === 'admin' ? '/admin' : user.role === 'engineer' ? '/engineer' : user.role === 'officer' ? '/officer' : '/citizen'}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white shadow shadow-brand-500/10 transition-all flex items-center gap-1 cursor-pointer"
            >
              Enter Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors cursor-pointer">Sign In</Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white shadow shadow-brand-500/10 transition-all cursor-pointer"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-brand-400 font-semibold mb-2"
        >
          <Sparkles className="h-4 w-4 animate-spin text-brand-500" />
          Smart City Infrastructure Monitoring
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black leading-tight sm:leading-none text-white tracking-tight"
        >
          Online Monitoring of <br />
          <span className="bg-gradient-to-r from-emerald-400 via-brand-450 to-green-300 bg-clip-text text-transparent font-black drop-shadow-md inline-block">
            Unauthorized Construction
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          CityGuard AI connects citizens with municipal offices, leveraging computer vision checking, interactive GIS map overlays, and automated reporting systems to monitor city development.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 text-xs font-bold uppercase tracking-wider"
        >
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-7 py-4 bg-brand-500 hover:bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Citizen Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-7 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Authority Entrance
            <ShieldAlert className="h-4 w-4 text-slate-400" />
          </Link>
        </motion.div>
      </section>

      {/* 3. Live Reported Unauthorized Construction Violations Feed */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="p-6 bg-slate-900/90 border border-white/10 rounded-3xl space-y-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="h-5 w-5 text-brand-450" />
                <h2 className="text-xl font-black text-white tracking-tight">Active Unauthorized Construction Reports</h2>
              </div>
              <p className="text-xs text-slate-400">Live monitoring of flagged site violations and citizen complaint status</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search violations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
                />
              </div>
              <Link 
                to={token ? '/citizen/new-complaint' : '/login'} 
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1 shadow-md shadow-brand-500/20"
              >
                Report New Violation
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-none">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer text-[11px] ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white font-bold shadow'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Violations Cards Grid */}
          {filteredComplaints.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching unauthorized construction reports found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComplaints.slice(0, 6).map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 bg-slate-950/70 border border-white/10 rounded-2xl space-y-3 hover:border-brand-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-brand-450">{item.complaint_number}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <h3 className="font-extrabold text-xs text-white line-clamp-1">{item.category_name}</h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-450 shrink-0" />
                      <span className="truncate">{item.address}</span>
                    </div>
                    {item.ai_predicted_label && (
                      <div className="flex items-center justify-between bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <Cpu className="h-3 w-3 text-brand-450" /> AI Detection:
                        </span>
                        <span className="text-brand-400 font-bold">{item.ai_confidence}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Visual Dashboard Preview Card */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="p-3 bg-white/5 border border-white/10 rounded-3xl shadow-2xl relative"
        >
          {/* Mock Dashboard Layout */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-white/5 flex flex-col sm:flex-row h-72 sm:h-96">
            {/* Sidebar */}
            <div className="w-full sm:w-48 bg-slate-950/60 p-4 border-r border-white/5 space-y-4 shrink-0 flex sm:flex-col justify-between sm:justify-start">
              <div className="flex items-center gap-2 font-bold text-xs"><Shield className="h-4 w-4 text-brand-500" /> CityGuard</div>
              <div className="hidden sm:block space-y-2 text-[10px] text-slate-450 uppercase font-semibold">
                <div className="h-6 bg-white/5 rounded px-2 flex items-center">Dashboard</div>
                <div className="h-6 px-2 flex items-center">Complaints</div>
                <div className="h-6 px-2 flex items-center">Reports</div>
              </div>
            </div>
            {/* Body preview */}
            <div className="flex-1 p-6 space-y-6 bg-slate-900/60 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="h-4 w-28 bg-white/10 rounded" />
                  <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
                <div className="h-8 w-8 bg-brand-500/20 border border-brand-500/30 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 bg-white/5 rounded-xl p-3 space-y-1"><div className="h-2 w-10 bg-white/10 rounded" /><div className="h-4 w-6 bg-white/20 rounded" /></div>
                <div className="h-16 bg-white/5 rounded-xl p-3 space-y-1"><div className="h-2 w-10 bg-white/10 rounded" /><div className="h-4 w-6 bg-white/20 rounded" /></div>
                <div className="h-16 bg-white/5 rounded-xl p-3 space-y-1"><div className="h-2 w-10 bg-white/10 rounded" /><div className="h-4 w-6 bg-white/20 rounded" /></div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. Stats Counter Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-b border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center space-y-1">
              <p className="text-2xl sm:text-4xl font-extrabold text-brand-450 tracking-tight">{s.value}</p>
              <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Features Grid Layout */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <h2 className="text-2xl font-black tracking-tight">Full Operations Lifecycle</h2>
          <p className="text-xs text-slate-400">Complete end-to-end audit capabilities in a single unified dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 hover:border-brand-500/20 hover:scale-[1.01] transition-all">
                <div className="h-10 w-10 bg-brand-500/10 border border-brand-500/25 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5 text-brand-500" />
                </div>
                <h3 className="font-extrabold text-sm text-white">{f.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. How It Works Progression Road */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <h2 className="text-2xl font-black tracking-tight">How It Works</h2>
          <p className="text-xs text-slate-400">A clear, automated loop matching civic engagement with compliance audits</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div key={idx} className="p-5 bg-white/5 border border-white/15 rounded-2xl space-y-3 hover:border-brand-500/30 transition-all relative">
                <div className="h-10 w-10 bg-brand-500/10 rounded-xl border border-brand-500/20 flex items-center justify-center">
                  <StepIcon className="h-5 w-5 text-brand-450" />
                </div>
                <h3 className="font-bold text-xs text-white uppercase tracking-wider">{step.title}</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-brand-500" />
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400">Find answers to common operational processes and technical specifications</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-brand-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 pt-1 text-[11px] text-slate-400 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-slate-500">
        © 2026 CityGuard AI. Smart City Management Platform. All rights reserved.
      </footer>

    </div>
  );
};

export default Home;
