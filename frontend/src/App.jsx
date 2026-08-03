import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts & Pages
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import OfficerDashboard from './pages/OfficerDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportsPortal from './pages/ReportsPortal';
import CitizenComplaints from './pages/CitizenComplaints';
import OfficerInspections from './pages/OfficerInspections';
import EngineerComplaints from './pages/EngineerComplaints';
import AdminComplaints from './pages/AdminComplaints';
import Profile from './pages/Profile';
import Home from './pages/Home';
import { Loader2 } from 'lucide-react';

// Route Guarding Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Verifying session authority...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If not authorized for this specific dashboard, route back to their default dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'engineer') return <Navigate to="/engineer" replace />;
    if (user.role === 'officer') return <Navigate to="/officer" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return children;
};

// Root redirection controller based on user role
const RootRedirect = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'engineer') return <Navigate to="/engineer" replace />;
  if (user.role === 'officer') return <Navigate to="/officer" replace />;
  return <Navigate to="/citizen" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Public Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure role-based dashboard routes */}
          <Route element={<DashboardLayout />}>
            
            {/* Citizen Routes */}
            <Route 
              path="/citizen" 
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/citizen/complaints" 
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenComplaints />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/citizen/new-complaint" 
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <NewComplaint />
                </ProtectedRoute>
              } 
            />

            {/* Officer Routes */}
            <Route 
              path="/officer" 
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/officer/inspections" 
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerInspections />
                </ProtectedRoute>
              } 
            />

            {/* Engineer Routes */}
            <Route 
              path="/engineer" 
              element={
                <ProtectedRoute allowedRoles={['engineer']}>
                  <EngineerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/engineer/complaints" 
              element={
                <ProtectedRoute allowedRoles={['engineer']}>
                  <EngineerComplaints />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/complaints" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminComplaints />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/audit-logs" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'engineer']}>
                  <ReportsPortal />
                </ProtectedRoute>
              } 
            />

            {/* Common Auth profile settings */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Common Details Route (accessible to citizen owners, assigned officers, engineers, and admins) */}
            <Route 
              path="/complaints/:id" 
              element={
                <ProtectedRoute>
                  <ComplaintDetails />
                </ProtectedRoute>
              } 
            />

          </Route>

          {/* General routes */}
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
