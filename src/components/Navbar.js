import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const roleColors = {
    ADMIN:        'bg-purple-100 text-purple-700',
    SURVEYOR:     'bg-blue-100 text-blue-700',
    GOV_OFFICIAL: 'bg-green-100 text-green-700',
    BUYER:        'bg-yellow-100 text-yellow-700',
  };

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin size={24} />
          <div>
            <h1 className="font-bold text-lg leading-tight">Cameroon Land Registry</h1>
            <p className="text-xs text-green-200">Ministry of State Property</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User size={16} />
              <div className="text-right">
                <p className="text-sm font-medium">{user.full_name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[user.role]}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg text-sm transition"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
