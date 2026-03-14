import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/config';
import { Search, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function BuyerDashboard() {
  const [plotId, setPlotId]   = useState('');
  const [plot, setPlot]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [lat, setLat]         = useState('');
  const [lon, setLon]         = useState('');
  const [nearby, setNearby]   = useState(null);
  const [searching, setSearching] = useState(false);

  const checkPlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPlot(null);
    try {
      const res = await API.get(`/plots/check/${plotId}/`);
      setPlot(res.data);
    } catch {
      setError('Plot not found. Please check the Plot ID and try again.');
    } finally { setLoading(false); }
  };

  const searchNearby = async (e) => {
    e.preventDefault();
    setSearching(true);
    setNearby(null);
    try {
      const res = await API.get(`/plots/nearby/?lat=${lat}&lon=${lon}&radius=1000`);
      setNearby(res.data);
    } catch {
      setNearby({ count: 0, plots: [] });
    } finally { setSearching(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Land Verification Portal</h2>
          <p className="text-gray-500">Check land ownership and verify plot status before buying</p>
        </div>

        {/* Plot Check */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Search size={20} className="text-primary" />
            Check Plot by ID
          </h3>
          <form onSubmit={checkPlot} className="flex gap-3">
            <input
              type="text"
              value={plotId}
              onChange={e => setPlotId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter Plot ID e.g. CM-CE-YDE-831059"
              required
            />
            <button type="submit" disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50">
              {loading ? 'Checking...' : 'Check'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              <span className="text-red-600">{error}</span>
            </div>
          )}

          {plot && (
            <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
              <div className={`p-4 ${plot.is_verified ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                <div className="flex items-center gap-2">
                  {plot.is_verified
                    ? <CheckCircle size={24} />
                    : <AlertCircle size={24} />}
                  <div>
                    <p className="font-bold text-lg">{plot.is_verified ? 'VERIFIED PLOT' : 'UNVERIFIED PLOT'}</p>
                    <p className="text-sm opacity-90">{plot.plot_id}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Current Owner</p>
                  <p className="font-semibold text-gray-800">{plot.owner}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    plot.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    plot.status === 'SOLD'     ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'}`}>
                    {plot.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Location</p>
                  <p className="font-semibold text-gray-800">{plot.locality}, {plot.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Area</p>
                  <p className="font-semibold text-gray-800">{plot.area_sqm} m²</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Land Use</p>
                  <p className="font-semibold text-gray-800">{plot.land_use}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Title Number</p>
                  <p className="font-semibold text-gray-800">{plot.title_number || 'Not yet issued'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nearby Search */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            Find Nearby Plots
          </h3>
          <p className="text-sm text-gray-500 mb-4">Enter your current GPS coordinates to find registered plots within 1km</p>
          <form onSubmit={searchNearby} className="grid grid-cols-2 gap-3 mb-4">
            <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Latitude e.g. 3.8481" required />
            <input type="number" step="any" value={lon} onChange={e => setLon(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Longitude e.g. 11.5019" required />
            <button type="submit" disabled={searching}
              className="col-span-2 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50">
              {searching ? 'Searching...' : 'Search Nearby Plots'}
            </button>
          </form>

          {nearby && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">
                Found {nearby.count} plot(s) within 1km
              </p>
              {nearby.plots.map((p, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono font-bold text-primary">{p.plot_id}</p>
                      <p className="text-sm text-gray-600">{p.locality}, {p.city}</p>
                      <p className="text-sm text-gray-500">Owner: {p.owner} • {p.area_sqm} m²</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{p.status}</span>
                      <p className="text-xs text-gray-400 mt-1">{p.distance_m}m away</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
