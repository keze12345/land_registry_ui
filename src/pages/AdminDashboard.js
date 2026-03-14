import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/config';
import { Users, Map, ArrowLeftRight, FileCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats]   = useState({ users: 0, plots: 0, transactions: 0 });
  const [users, setUsers]   = useState([]);
  const [plots, setPlots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [usersRes, plotsRes, txRes] = await Promise.all([
        API.get('/accounts/users/'),
        API.get('/plots/'),
        API.get('/transactions/')
      ]);
      setUsers(usersRes.data.results || []);
      setPlots(plotsRes.data.results || []);
      setStats({
        users:        usersRes.data.count || 0,
        plots:        plotsRes.data.count || 0,
        transactions: txRes.data.count    || 0,
      });
    } catch {}
    finally { setLoading(false); }
  };

  const roleColor = (role) => {
    if (role === 'ADMIN')        return 'bg-purple-100 text-purple-700';
    if (role === 'SURVEYOR')     return 'bg-blue-100 text-blue-700';
    if (role === 'GOV_OFFICIAL') return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500">Full system overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users',        value: stats.users,        icon: <Users size={24} />,          color: 'bg-blue-500' },
            { label: 'Total Plots',        value: stats.plots,        icon: <Map size={24} />,            color: 'bg-green-500' },
            { label: 'Transactions',       value: stats.transactions, icon: <ArrowLeftRight size={24} />, color: 'bg-purple-500' },
            { label: 'Pending Plots',      value: plots.filter(p => p.status === 'PENDING').length, icon: <FileCheck size={24} />, color: 'bg-orange-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6">
              <div className={`${stat.color} text-white rounded-lg p-3 w-fit mb-3`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview', 'users', 'plots'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition ${activeTab === tab ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">All Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Name', 'Email', 'Role', 'Verified', 'Joined'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{user.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{user.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {user.is_verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Plots Tab */}
        {activeTab === 'plots' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">All Plots ({plots.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Plot ID', 'Owner', 'Location', 'Area', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plots.map(plot => (
                    <tr key={plot.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm font-medium text-primary">{plot.plot_id}</td>
                      <td className="px-4 py-3 text-sm">{plot.owner_name}</td>
                      <td className="px-4 py-3 text-sm">{plot.locality}, {plot.city}</td>
                      <td className="px-4 py-3 text-sm">{plot.area_sqm} m²</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plot.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          plot.status === 'SOLD'     ? 'bg-blue-100 text-blue-700' :
                          plot.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'}`}>
                          {plot.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(plot.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Plot Status Breakdown</h3>
              {['PENDING', 'APPROVED', 'SOLD', 'REJECTED'].map(s => {
                const count = plots.filter(p => p.status === s).length;
                const pct   = plots.length ? Math.round((count / plots.length) * 100) : 0;
                return (
                  <div key={s} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{s}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${
                        s === 'APPROVED' ? 'bg-green-500' :
                        s === 'SOLD'     ? 'bg-blue-500' :
                        s === 'REJECTED' ? 'bg-red-500' :
                        'bg-yellow-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">User Roles Breakdown</h3>
              {['ADMIN', 'SURVEYOR', 'GOV_OFFICIAL', 'BUYER'].map(role => {
                const count = users.filter(u => u.role === role).length;
                const pct   = users.length ? Math.round((count / users.length) * 100) : 0;
                return (
                  <div key={role} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{role}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${
                        role === 'ADMIN'        ? 'bg-purple-500' :
                        role === 'SURVEYOR'     ? 'bg-blue-500' :
                        role === 'GOV_OFFICIAL' ? 'bg-green-500' :
                        'bg-yellow-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
