import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, LogOut, User, ShoppingBag, Tag } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const roleColors = {
    ADMIN:        'bg-purple-100 text-purple-700',
    SURVEYOR:     'bg-blue-100 text-blue-700',
    GOV_OFFICIAL: 'bg-green-100 text-green-700',
    BUYER:        'bg-yellow-100 text-yellow-700',
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
            if (user) {
              if (user.role === 'BUYER') navigate('/buyer');
              else if (user.role === 'SURVEYOR') navigate('/surveyor');
              else if (user.role === 'GOV_OFFICIAL') navigate('/official');
              else navigate('/admin');
            }
          }}>
            <MapPin size={24} />
            <div>
              <h1 className="font-bold text-lg leading-tight">Cameroon Land Registry</h1>
              <p className="text-xs text-green-200">Ministry of State Property</p>
            </div>
          </div>

          {/* Buyer Navigation Links */}
          {user && user.role === 'BUYER' && (
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => navigate('/buyer')}
                className={'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ' + (location.pathname === '/buyer' ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10')}>
                <User size={14} /> Dashboard
              </button>
              <button onClick={() => navigate('/marketplace')}
                className={'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ' + (location.pathname === '/marketplace' ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10')}>
                <ShoppingBag size={14} /> Marketplace
              </button>
              <button onClick={() => navigate('/seller')}
                className={'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ' + (location.pathname === '/seller' ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10')}>
                <Tag size={14} /> My Listings
              </button>
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User size={16} />
              <div className="text-right">
                <p className="text-sm font-medium">{user.full_name}</p>
                <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + roleColors[user.role]}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg text-sm transition">
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
