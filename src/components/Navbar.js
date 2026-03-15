import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, LogOut, User, ShoppingBag, Tag, Scissors, Users, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const roleColors = {
    NATIONAL_ADMIN: 'bg-red-100 text-red-700',
    REGIONAL_DIR:   'bg-purple-100 text-purple-700',
    DIVISIONAL_OFF: 'bg-blue-100 text-blue-700',
    SUBDIV_OFF:     'bg-indigo-100 text-indigo-700',
    SURVEYOR:       'bg-yellow-100 text-yellow-700',
    BUYER:          'bg-green-100 text-green-700',
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'BUYER') return '/buyer';
    if (user.role === 'SURVEYOR') return '/surveyor';
    if (user.role === 'NATIONAL_ADMIN') return '/admin';
    return '/official';
  };

  const isGovStaff = user && ['NATIONAL_ADMIN', 'REGIONAL_DIR', 'DIVISIONAL_OFF', 'SUBDIV_OFF'].includes(user.role);

  const navLink = (path, icon, label) => (
    <button onClick={() => navigate(path)}
      className={'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ' + (location.pathname === path ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10')}>
      {icon} {label}
    </button>
  );

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(getDashboardPath())}>
            <MapPin size={24} />
            <div>
              <h1 className="font-bold text-lg leading-tight">Cameroon Land Registry</h1>
              <p className="text-xs text-green-200">MINDCAF — Ministry of State Property</p>
            </div>
          </div>

          {/* Buyer Navigation */}
          {user && user.role === 'BUYER' && (
            <div className="hidden md:flex items-center gap-1">
              {navLink('/buyer',       <User size={14} />,      'Dashboard')}
              {navLink('/marketplace', <ShoppingBag size={14} />, 'Marketplace')}
              {navLink('/seller',      <Tag size={14} />,       'My Listings')}
              {navLink('/subdivide',   <Scissors size={14} />,  'Subdivide')}
            </div>
          )}

          {/* Gov Staff Navigation */}
          {isGovStaff && (
            <div className="hidden md:flex items-center gap-1">
              {navLink('/official', <LayoutDashboard size={14} />, 'Dashboard')}
              {navLink('/staff',    <Users size={14} />,           'Staff')}
              {user.role === 'NATIONAL_ADMIN' && navLink('/admin', <LayoutDashboard size={14} />, 'Admin')}
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{user.full_name}</p>
              <div className="flex items-center gap-1 justify-end">
                <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (roleColors[user.role] || 'bg-gray-100 text-gray-700')}>
                  {user.role.replace(/_/g, ' ')}
                </span>
                {user.jurisdiction_name && user.jurisdiction_name !== 'National' && (
                  <span className="text-xs text-green-200">— {user.jurisdiction_name}</span>
                )}
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg text-sm transition">
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
