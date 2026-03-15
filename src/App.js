import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import SurveyorDashboard from './pages/SurveyorDashboard';
import OfficialDashboard from './pages/OfficialDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Marketplace from './pages/Marketplace';
import SellerDashboard from './pages/SellerDashboard';
import SubdivisionPage from './pages/SubdivisionPage';
import StaffManagement from './pages/StaffManagement';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

const GOV_ROLES = ['NATIONAL_ADMIN', 'REGIONAL_DIR', 'DIVISIONAL_OFF', 'SUBDIV_OFF'];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/surveyor"    element={<ProtectedRoute roles={['SURVEYOR']}><SurveyorDashboard /></ProtectedRoute>} />
          <Route path="/official"    element={<ProtectedRoute roles={[...GOV_ROLES]}><OfficialDashboard /></ProtectedRoute>} />
          <Route path="/staff"       element={<ProtectedRoute roles={[...GOV_ROLES]}><StaffManagement /></ProtectedRoute>} />
          <Route path="/buyer"       element={<ProtectedRoute roles={['BUYER']}><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/seller"      element={<ProtectedRoute roles={['BUYER']}><SellerDashboard /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute roles={['BUYER']}><Marketplace /></ProtectedRoute>} />
          <Route path="/subdivide"   element={<ProtectedRoute roles={['BUYER']}><SubdivisionPage /></ProtectedRoute>} />
          <Route path="/admin"       element={<ProtectedRoute roles={['NATIONAL_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*"            element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
