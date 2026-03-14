import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/config';
import { MapPin, Plus, CheckCircle, Clock, XCircle, Map } from 'lucide-react';

export default function SurveyorDashboard() {
  const [plots, setPlots]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({
    owner: '', region: '', city: '', locality: '',
    address: '', area_sqm: '', land_use: 'RESIDENTIAL',
    description: '', points: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState('');

  useEffect(() => { fetchPlots(); }, []);

  const fetchPlots = async () => {
    try {
      const res = await API.get('/plots/');
      setPlots(res.data.results || []);
    } catch {}
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      let points = [];
      const lines = form.points.trim().split('\n');
      lines.forEach((line, i) => {
        const parts = line.split(',');
        if (parts.length >= 2) {
          points.push({
            label: String.fromCharCode(65 + i),
            latitude: parseFloat(parts[0].trim()),
            longitude: parseFloat(parts[1].trim())
          });
        }
      });
      if (points.length < 3) {
        setMessage('Please enter at least 3 boundary points');
        return;
      }
      await API.post('/plots/', {
        owner: parseInt(form.owner),
        region: form.region,
        city: form.city,
        locality: form.locality,
        address: form.address,
        area_sqm: form.area_sqm,
        land_use: form.land_use,
        description: form.description,
        points
      });
      setMessage('Plot registered successfully!');
      setShowForm(false);
      setForm({ owner: '', region: '', city: '', locality: '', address: '', area_sqm: '', land_use: 'RESIDENTIAL', description: '', points: '' });
      fetchPlots();
    } catch (err) {
      setMessage(err.response?.data ? JSON.stringify(err.response.data) : 'Error registering plot');
    } finally { setSubmitting(false); }
  };

  const statusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle size={16} className="text-green-500" />;
    if (status === 'REJECTED') return <XCircle size={16} className="text-red-500" />;
    if (status === 'SOLD')     return <CheckCircle size={16} className="text-blue-500" />;
    return <Clock size={16} className="text-yellow-500" />;
  };

  const statusColor = (status) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    if (status === 'SOLD')     return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Surveyor Dashboard</h2>
            <p className="text-gray-500">Manage and register land plots</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
          >
            <Plus size={18} />
            Register New Plot
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Registration Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Map size={20} className="text-primary" />
              Register New Land Plot
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner User ID</label>
                <input type="number" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter owner user ID" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input type="text" value={form.region} onChange={e => setForm({...form, region: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Centre" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Yaounde" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                <input type="text" value={form.locality} onChange={e => setForm({...form, locality: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Bastos" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (m²)</label>
                <input type="number" value={form.area_sqm} onChange={e => setForm({...form, area_sqm: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. 600" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Use</label>
                <select value={form.land_use} onChange={e => setForm({...form, land_use: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="AGRICULTURAL">Agricultural</option>
                  <option value="INDUSTRIAL">Industrial</option>
                  <option value="MIXED">Mixed Use</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Full address" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Brief description of the plot" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPS Boundary Points (one per line: latitude, longitude)
                </label>
                <textarea value={form.points} onChange={e => setForm({...form, points: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={5}
                  placeholder={"3.8481, 11.5019\n3.8482, 11.5021\n3.8479, 11.5022\n3.8478, 11.5020"}
                  required />
                <p className="text-xs text-gray-400 mt-1">Enter at least 3 points. Format: latitude, longitude</p>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50">
                  {submitting ? 'Registering...' : 'Register Plot'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Plots',  value: plots.length,                                         color: 'bg-blue-50 text-blue-700' },
            { label: 'Pending',      value: plots.filter(p => p.status === 'PENDING').length,     color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Approved',     value: plots.filter(p => p.status === 'APPROVED').length,    color: 'bg-green-50 text-green-700' },
            { label: 'Sold',         value: plots.filter(p => p.status === 'SOLD').length,        color: 'bg-purple-50 text-purple-700' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 text-center`}>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Plots Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">My Surveyed Plots</h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading plots...</div>
          ) : plots.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No plots registered yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Plot ID', 'Owner', 'Location', 'Area', 'Land Use', 'Status', 'Date'].map(h => (
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
                      <td className="px-4 py-3 text-sm">{plot.land_use}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor(plot.status)}`}>
                          {statusIcon(plot.status)}
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
          )}
        </div>
      </div>
    </div>
  );
}
