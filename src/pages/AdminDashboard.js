import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/config';
import { Users, Map, ArrowLeftRight, FileCheck, Search, Eye, ChevronDown, ChevronRight, MapPin } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats]         = useState({ users: 0, plots: 0, transactions: 0, certificates: 0 });
  const [users, setUsers]         = useState([]);
  const [plots, setPlots]         = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [regions, setRegions]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // User filters
  const [userSearch, setUserSearch]   = useState('');
  const [userRole, setUserRole]       = useState('');
  const [userVerified, setUserVerified] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Plot filters
  const [plotSearch, setPlotSearch]   = useState('');
  const [plotStatus, setPlotStatus]   = useState('');
  const [plotRegion, setPlotRegion]   = useState('');
  const [plotDept, setPlotDept]       = useState('');
  const [plotArr, setPlotArr]         = useState('');

  // Region tree expand state
  const [expandedRegions, setExpandedRegions]   = useState({});
  const [expandedDepts, setExpandedDepts]       = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [usersRes, plotsRes, txRes, certRes, regRes] = await Promise.all([
        API.get('/accounts/users/'),
        API.get('/plots/'),
        API.get('/transactions/'),
        API.get('/certificates/'),
        API.get('/locations/regions/')
      ]);
      setUsers(usersRes.data.results || []);
      setPlots(plotsRes.data.results || []);
      setTransactions(txRes.data.results || []);
      setCertificates(certRes.data.results || []);
      setRegions(regRes.data.results || []);
      setStats({
        users:        usersRes.data.count  || 0,
        plots:        plotsRes.data.count  || 0,
        transactions: txRes.data.count     || 0,
        certificates: certRes.data.count   || 0,
      });
    } catch {}
    finally { setLoading(false); }
  };

  const toggleRegion = (code) => {
    setExpandedRegions(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleDept = (code) => {
    setExpandedDepts(prev => ({ ...prev, [code]: !prev[code] }));
  };

  // Filter users
  const filteredUsers = users.filter(function(u) {
    var matchSearch = !userSearch ||
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.national_id && u.national_id.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(userSearch));
    var matchRole     = !userRole     || u.role === userRole;
    var matchVerified = !userVerified || String(u.is_verified) === userVerified;
    return matchSearch && matchRole && matchVerified;
  });

  // Filter plots
  const filteredPlots = plots.filter(function(p) {
    var matchSearch = !plotSearch ||
      p.plot_id.toLowerCase().includes(plotSearch.toLowerCase()) ||
      (p.owner_name && p.owner_name.toLowerCase().includes(plotSearch.toLowerCase())) ||
      (p.locality_name && p.locality_name.toLowerCase().includes(plotSearch.toLowerCase()));
    var matchStatus = !plotStatus || p.status === plotStatus;
    var matchRegion = !plotRegion || (p.region_name && p.region_name.toLowerCase().includes(plotRegion.toLowerCase()));
    var matchDept   = !plotDept   || (p.department_name && p.department_name.toLowerCase().includes(plotDept.toLowerCase()));
    var matchArr    = !plotArr    || (p.arrondissement_name && p.arrondissement_name.toLowerCase().includes(plotArr.toLowerCase()));
    return matchSearch && matchStatus && matchRegion && matchDept && matchArr;
  });

  // Group plots by region > department > arrondissement
  const groupedPlots = {};
  plots.forEach(function(plot) {
    var region = plot.region_name || 'Unknown Region';
    var dept   = plot.department_name || 'Unknown Department';
    var arr    = plot.arrondissement_name || 'Unknown Arrondissement';
    if (!groupedPlots[region]) groupedPlots[region] = {};
    if (!groupedPlots[region][dept]) groupedPlots[region][dept] = {};
    if (!groupedPlots[region][dept][arr]) groupedPlots[region][dept][arr] = [];
    groupedPlots[region][dept][arr].push(plot);
  });

  // Group users by region (based on their plots)
  const getUserRegion = (userId) => {
    var userPlots = plots.filter(function(p) { return p.owner === userId; });
    if (userPlots.length > 0) return userPlots[0].region_name;
    return null;
  };

  const roleColor = (role) => {
    if (role === 'ADMIN')        return 'bg-purple-100 text-purple-700';
    if (role === 'SURVEYOR')     return 'bg-blue-100 text-blue-700';
    if (role === 'GOV_OFFICIAL') return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const statusColor = (status) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    if (status === 'SOLD')     return 'bg-blue-100 text-blue-700';
    if (status === 'LISTED')   return 'bg-purple-100 text-purple-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500">Full system oversight and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users',        value: stats.users,        icon: <Users size={24} />,          color: 'bg-blue-500' },
            { label: 'Total Plots',        value: stats.plots,        icon: <Map size={24} />,            color: 'bg-green-500' },
            { label: 'Transactions',       value: stats.transactions, icon: <ArrowLeftRight size={24} />, color: 'bg-purple-500' },
            { label: 'Certificates',       value: stats.certificates, icon: <FileCheck size={24} />,      color: 'bg-orange-500' },
          ].map(function(stat, i) {
            return (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <div className={stat.color + ' text-white rounded-lg p-3 w-fit mb-3'}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'overview',     label: 'Overview' },
            { key: 'users',        label: 'Users (' + stats.users + ')' },
            { key: 'plots_tree',   label: 'Plots by Region' },
            { key: 'plots_table',  label: 'Plots Table' },
            { key: 'transactions', label: 'Transactions' },
          ].map(function(tab) {
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={'px-4 py-2 rounded-lg font-medium capitalize transition ' + (activeTab === tab.key ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Plot Status Breakdown</h3>
              {['PENDING', 'APPROVED', 'SOLD', 'REJECTED', 'LISTED', 'SUBDIVIDED'].map(function(s) {
                var count = plots.filter(function(p) { return p.status === s; }).length;
                var pct   = plots.length ? Math.round((count / plots.length) * 100) : 0;
                return (
                  <div key={s} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{s}</span>
                      <span className="font-medium">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={' h-2 rounded-full ' + (
                        s === 'APPROVED'   ? 'bg-green-500' :
                        s === 'SOLD'       ? 'bg-blue-500' :
                        s === 'REJECTED'   ? 'bg-red-500' :
                        s === 'LISTED'     ? 'bg-purple-500' :
                        s === 'SUBDIVIDED' ? 'bg-gray-500' :
                        'bg-yellow-500')}
                        style={{ width: pct + '%' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Users by Role</h3>
              {['ADMIN', 'SURVEYOR', 'GOV_OFFICIAL', 'BUYER'].map(function(role) {
                var count = users.filter(function(u) { return u.role === role; }).length;
                var pct   = users.length ? Math.round((count / users.length) * 100) : 0;
                return (
                  <div key={role} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{role.replace('_', ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={' h-2 rounded-full ' + (
                        role === 'ADMIN'        ? 'bg-purple-500' :
                        role === 'SURVEYOR'     ? 'bg-blue-500' :
                        role === 'GOV_OFFICIAL' ? 'bg-green-500' :
                        'bg-yellow-500')}
                        style={{ width: pct + '%' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Plots by Region</h3>
              {Object.keys(groupedPlots).sort().map(function(region) {
                var count = 0;
                Object.keys(groupedPlots[region]).forEach(function(dept) {
                  Object.keys(groupedPlots[region][dept]).forEach(function(arr) {
                    count += groupedPlots[region][dept][arr].length;
                  });
                });
                var pct = plots.length ? Math.round((count / plots.length) * 100) : 0;
                return (
                  <div key={region} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{region}</span>
                      <span className="font-medium">{count} plots</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-primary" style={{ width: pct + '%' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {plots.slice(0, 5).map(function(plot) {
                  return (
                    <div key={plot.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={'w-2 h-2 rounded-full ' + (plot.status === 'APPROVED' ? 'bg-green-500' : plot.status === 'SOLD' ? 'bg-blue-500' : 'bg-yellow-500')}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{plot.plot_id}</p>
                        <p className="text-xs text-gray-500">{plot.full_location}</p>
                      </div>
                      <span className={'px-2 py-0.5 rounded-full text-xs ' + statusColor(plot.status)}>{plot.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            {/* Search and filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative md:col-span-2">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    placeholder="Search by name, email, CNI or phone..." />
                </div>
                <select value={userRole} onChange={e => setUserRole(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm">
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SURVEYOR">Surveyor</option>
                  <option value="GOV_OFFICIAL">Gov Official</option>
                  <option value="BUYER">Buyer</option>
                </select>
                <select value={userVerified} onChange={e => setUserVerified(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm">
                  <option value="">All Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-2">Showing {filteredUsers.length} of {users.length} users</p>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['ID', 'Full Name', 'Email', 'Phone', 'CNI', 'Role', 'Verified', 'Plots', 'Joined', 'Actions'].map(function(h) {
                        return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(function(user) {
                      var userPlots = plots.filter(function(p) { return p.owner === user.id; });
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono">{user.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">{user.full_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                          <td className="px-4 py-3 text-sm">{user.phone || '—'}</td>
                          <td className="px-4 py-3 text-sm font-mono">{user.national_id || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={'px-2 py-1 rounded-full text-xs font-medium ' + roleColor(user.role)}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={'px-2 py-1 rounded-full text-xs ' + (user.is_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                              {user.is_verified ? '✓ Verified' : '✗ Unverified'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-center">{userPlots.length}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setSelectedUser(user)}
                              className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-100 transition">
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Plots by Region Tree */}
        {activeTab === 'plots_tree' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Plots Grouped by Administrative Division</h3>
            </div>
            <div className="p-4">
              {Object.keys(groupedPlots).sort().map(function(region) {
                var regionPlots = 0;
                Object.keys(groupedPlots[region]).forEach(function(dept) {
                  Object.keys(groupedPlots[region][dept]).forEach(function(arr) {
                    regionPlots += groupedPlots[region][dept][arr].length;
                  });
                });
                return (
                  <div key={region} className="mb-2">
                    <button
                      onClick={() => toggleRegion(region)}
                      className="w-full flex items-center gap-2 p-3 bg-primary text-white rounded-lg hover:bg-secondary transition">
                      {expandedRegions[region] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="font-semibold">{region} Region</span>
                      <span className="ml-auto bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                        {regionPlots} plots
                      </span>
                    </button>

                    {expandedRegions[region] && (
                      <div className="ml-4 mt-1 space-y-1">
                        {Object.keys(groupedPlots[region]).sort().map(function(dept) {
                          var deptPlots = 0;
                          Object.keys(groupedPlots[region][dept]).forEach(function(arr) {
                            deptPlots += groupedPlots[region][dept][arr].length;
                          });
                          return (
                            <div key={dept}>
                              <button
                                onClick={() => toggleDept(dept)}
                                className="w-full flex items-center gap-2 p-2 bg-green-50 text-green-800 rounded-lg hover:bg-green-100 transition">
                                {expandedDepts[dept] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                <span className="font-medium text-sm">{dept} Department</span>
                                <span className="ml-auto bg-green-200 px-2 py-0.5 rounded-full text-xs">
                                  {deptPlots} plots
                                </span>
                              </button>

                              {expandedDepts[dept] && (
                                <div className="ml-4 mt-1 space-y-1">
                                  {Object.keys(groupedPlots[region][dept]).sort().map(function(arr) {
                                    var arrPlots = groupedPlots[region][dept][arr];
                                    return (
                                      <div key={arr} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="flex items-center gap-2 p-2 bg-gray-50">
                                          <MapPin size={14} className="text-gray-400" />
                                          <span className="text-sm font-medium text-gray-700">{arr}</span>
                                          <span className="ml-auto text-xs text-gray-500">{arrPlots.length} plots</span>
                                        </div>
                                        <table className="w-full">
                                          <thead>
                                            <tr className="bg-gray-50 border-t">
                                              {['Plot ID', 'Owner', 'Area', 'Use', 'Status'].map(function(h) {
                                                return <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-400">{h}</th>;
                                              })}
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100">
                                            {arrPlots.map(function(plot) {
                                              return (
                                                <tr key={plot.id} className="hover:bg-gray-50">
                                                  <td className="px-3 py-2 font-mono text-xs text-primary">{plot.plot_id}</td>
                                                  <td className="px-3 py-2 text-xs">{plot.owner_name}</td>
                                                  <td className="px-3 py-2 text-xs">{plot.area_sqm} m²</td>
                                                  <td className="px-3 py-2 text-xs">{plot.land_use}</td>
                                                  <td className="px-3 py-2">
                                                    <span className={'px-2 py-0.5 rounded-full text-xs ' + statusColor(plot.status)}>
                                                      {plot.status}
                                                    </span>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plots Table Tab */}
        {activeTab === 'plots_table' && (
          <div>
            <div className="bg-white rounded-xl shadow p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="relative md:col-span-2">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" value={plotSearch}
                    onChange={e => setPlotSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    placeholder="Search by plot ID, owner, locality..." />
                </div>
                <input type="text" value={plotRegion}
                  onChange={e => setPlotRegion(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Filter by region..." />
                <input type="text" value={plotDept}
                  onChange={e => setPlotDept(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Filter by department..." />
                <select value={plotStatus} onChange={e => setPlotStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SOLD">Sold</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="LISTED">Listed</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-2">Showing {filteredPlots.length} of {plots.length} plots</p>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Plot ID', 'Owner', 'Region', 'Department', 'Arrondissement', 'Locality', 'Area', 'Use', 'Status', 'Date'].map(function(h) {
                        return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPlots.map(function(plot) {
                      return (
                        <tr key={plot.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{plot.plot_id}</td>
                          <td className="px-4 py-3 text-sm">{plot.owner_name}</td>
                          <td className="px-4 py-3 text-sm">{plot.region_name}</td>
                          <td className="px-4 py-3 text-sm">{plot.department_name}</td>
                          <td className="px-4 py-3 text-sm">{plot.arrondissement_name}</td>
                          <td className="px-4 py-3 text-sm">{plot.locality_name}</td>
                          <td className="px-4 py-3 text-sm">{plot.area_sqm} m²</td>
                          <td className="px-4 py-3 text-sm">{plot.land_use}</td>
                          <td className="px-4 py-3">
                            <span className={'px-2 py-1 rounded-full text-xs font-medium ' + statusColor(plot.status)}>
                              {plot.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(plot.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">All Transactions ({transactions.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Ref', 'Plot', 'Seller', 'Buyer', 'Price', 'Type', 'Status', 'Date'].map(function(h) {
                      return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(function(tx) {
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-primary">{tx.transaction_ref}</td>
                        <td className="px-4 py-3 text-xs">{tx.plot_details && tx.plot_details.plot_id}</td>
                        <td className="px-4 py-3 text-sm">{tx.seller_name}</td>
                        <td className="px-4 py-3 text-sm">{tx.buyer_name}</td>
                        <td className="px-4 py-3 text-sm">{parseInt(tx.sale_price).toLocaleString()} XAF</td>
                        <td className="px-4 py-3 text-sm">{tx.transaction_type}</td>
                        <td className="px-4 py-3">
                          <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (
                            tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            tx.status === 'REJECTED'  ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700')}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="bg-primary text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.full_name}</h3>
                    <p className="text-green-200 text-sm">{selectedUser.email}</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)}
                    className="text-white hover:text-green-200 text-2xl font-bold">×</button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Info */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'User ID',      value: selectedUser.id },
                      { label: 'Full Name',    value: selectedUser.full_name },
                      { label: 'Email',        value: selectedUser.email },
                      { label: 'Phone',        value: selectedUser.phone || '—' },
                      { label: 'CNI Number',   value: selectedUser.national_id || '—' },
                      { label: 'Role',         value: selectedUser.role },
                      { label: 'Verified',     value: selectedUser.is_verified ? '✓ Yes' : '✗ No' },
                      { label: 'Active',       value: selectedUser.is_active ? '✓ Yes' : '✗ No' },
                      { label: 'Joined',       value: new Date(selectedUser.created_at).toLocaleDateString() },
                    ].map(function(item) {
                      return (
                        <div key={item.label}>
                          <p className="text-xs text-gray-400 uppercase">{item.label}</p>
                          <p className="text-sm font-medium text-gray-800">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* User's Plots */}
                {selectedUser.role === 'BUYER' && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                      Land Plots ({plots.filter(function(p) { return p.owner === selectedUser.id; }).length})
                    </h4>
                    {plots.filter(function(p) { return p.owner === selectedUser.id; }).length === 0 ? (
                      <p className="text-gray-400 text-sm">No plots registered</p>
                    ) : (
                      <div className="space-y-2">
                        {plots.filter(function(p) { return p.owner === selectedUser.id; }).map(function(plot) {
                          return (
                            <div key={plot.id} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-mono text-sm font-bold text-primary">{plot.plot_id}</p>
                                  <p className="text-xs text-gray-500">{plot.full_location}</p>
                                  <p className="text-xs text-gray-400">{plot.area_sqm} m² • {plot.land_use}</p>
                                </div>
                                <span className={'px-2 py-1 rounded-full text-xs h-fit ' + statusColor(plot.status)}>
                                  {plot.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* User's Transactions */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Transaction History</h4>
                  {transactions.filter(function(t) {
                    return t.seller === selectedUser.id || t.buyer === selectedUser.id;
                  }).length === 0 ? (
                    <p className="text-gray-400 text-sm">No transactions</p>
                  ) : (
                    <div className="space-y-2">
                      {transactions.filter(function(t) {
                        return t.seller === selectedUser.id || t.buyer === selectedUser.id;
                      }).map(function(tx) {
                        var isBuyer = tx.buyer === selectedUser.id;
                        return (
                          <div key={tx.id} className="border border-gray-200 rounded-lg p-3 flex justify-between">
                            <div>
                              <p className="font-mono text-xs text-primary">{tx.transaction_ref}</p>
                              <p className="text-xs text-gray-500">
                                {isBuyer ? 'Purchased from ' + tx.seller_name : 'Sold to ' + tx.buyer_name}
                              </p>
                              <p className="text-xs font-medium">{parseInt(tx.sale_price).toLocaleString()} XAF</p>
                            </div>
                            <span className={'px-2 py-1 rounded-full text-xs h-fit ' + (tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                              {tx.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
