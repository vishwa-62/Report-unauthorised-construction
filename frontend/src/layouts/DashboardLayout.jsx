import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Shield, Menu, X, Sun, Moon, Bell, LogOut, 
  LayoutDashboard, FileText, ClipboardList, Map, 
  Users, Settings, HardDrive, User, CheckCircle 
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch in-app notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for alerts
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = {
    citizen: [
      { name: 'Dashboard', path: '/citizen', icon: LayoutDashboard },
      { name: 'My Complaints', path: '/citizen/complaints', icon: ClipboardList },
      { name: 'Report Violation', path: '/citizen/new-complaint', icon: FileText },
      { name: 'Profile Settings', path: '/profile', icon: User }
    ],
    officer: [
      { name: 'Dashboard', path: '/officer', icon: LayoutDashboard },
      { name: 'My Inspections', path: '/officer/inspections', icon: ClipboardList },
      { name: 'Profile Settings', path: '/profile', icon: User }
    ],
    engineer: [
      { name: 'Dashboard', path: '/engineer', icon: LayoutDashboard },
      { name: 'Audit Complaints', path: '/engineer/complaints', icon: ClipboardList },
      { name: 'Reports Portal', path: '/reports', icon: FileText },
      { name: 'Profile Settings', path: '/profile', icon: User }
    ],
    admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Complaints Directory', path: '/admin/complaints', icon: ClipboardList },
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'Reports Portal', path: '/reports', icon: FileText },
      { name: 'System Settings', path: '/admin/settings', icon: Settings },
      { name: 'Audit Logs', path: '/admin/audit-logs', icon: HardDrive },
      { name: 'Profile Settings', path: '/profile', icon: User }
    ]
  };

  const activeRole = user?.role || 'citizen';
  const links = menuItems[activeRole] || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200 dark:border-slate-800 m-4 rounded-2xl p-4 shrink-0">
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <Shield className="h-8 w-8 text-brand-500 animate-pulse" />
          <div>
            <h1 className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight">CityGuard AI</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-500">Smart City System</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-500 flex items-center justify-center font-bold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{user?.full_name || 'Guest User'}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* 2. Mobile Nav Header */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 glass-panel border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-brand-500" />
          <span className="font-bold text-base text-slate-800 dark:text-white">CityGuard AI</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Notification bell on mobile */}
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl text-slate-600 dark:text-slate-300">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="absolute top-20 left-4 right-4 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-brand-500 text-white' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
            <hr className="my-2 border-slate-100 dark:border-slate-800" />
            <button
              onClick={() => { setMobileOpen(false); handleLogoutClick(); }}
              className="flex items-center gap-3 px-4 py-3 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-xl"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </aside>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-x-hidden">
        {/* Workspace Top Header Bar */}
        <header className="hidden md:flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
              {location.pathname.split('/').pop() || 'Dashboard'}
            </h2>
            <p className="text-xs text-slate-400">Online Monitoring Panel</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition-all"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition-all"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 h-5 w-5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">Recent Notifications</span>
                    <span className="text-[10px] text-brand-600 font-semibold">{unreadCount} Unread</span>
                  </div>
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                            n.is_read 
                              ? 'bg-transparent text-slate-500' 
                              : 'bg-brand-50/50 dark:bg-brand-900/10 text-slate-800 dark:text-slate-200 border-l-2 border-brand-500'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-1">
                            <span>{n.title}</span>
                            {!n.is_read && <span className="h-1.5 w-1.5 bg-brand-500 rounded-full"></span>}
                          </div>
                          <p className="text-slate-400 dark:text-slate-350">{n.message}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile pill */}
            <div className="flex items-center gap-3 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{user?.full_name}</span>
              <div className="h-7 w-7 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="flex-1 min-h-0 bg-transparent">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
