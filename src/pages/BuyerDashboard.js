import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/config';
import { Search, MapPin, CheckCircle, AlertCircle, Filter, ShoppingBag, TrendingUp } from 'lucide-react';

export default function BuyerDashboard() {
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [plotId, setPlotId]   = useState('');
  const [plot, setPlot]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [myBids, setMyBids]   = useState([]);
  const [loadingBids, setLoadingBids] = useState(true);

  const [searchForm, setSearchForm] = useState({
    region: '', department: '', arrondissement: '',
    locality: '', land_use: '', status: 'APPROVED'
  });
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching]         = useState(false);

  const [lat, setLat]             = useState('');
  const [lon, setLon]             = useState('');
  const [nearby, setNearby]       = useState(null);
  const [searchingNearby, setSearchingNearby] = useState(false);

  const [activeTab, setActiveTab] = useState('marketplace');

  useEffect(() => { fetchMyBids(); }, []);

  const fetchMyBids = async () => {
    try {
      const res = await API.get('/listings/bids/my/');
      setMyBids(res.data.results || []);
    } catch {}
    finally { setLoadingBids(false); }
  };

  const withdrawBid = async (bidRef) => {
    try {
      await API.post('/listings/bids/' + bidRef + '/withdraw/');
      fetchMyBids();
    } catch {}
  };

  const checkPlotById = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPlot(null);
    try {
      const res = await API.get('/plots/check/' + plotId + '/');
      setPlot(res.data);
    } catch {
      setError('Plot not found. Please check the Plot ID and try again.');
    } finally { setLoading(false); }
  };

  const searchByLocation = async (e) => {
    e.preventDefault();
    setSearching(true);
    setSearchResults(null);
    try {
      var params = new URLSearchParams();
      if (searchForm.region)         params.append('region', searchForm.region);
      if (searchForm.department)     params.append('department', searchForm.department);
      if (searchForm.arrondissement) params.append('arrondissement', searchForm.arrondissement);
      if (searchForm.locality)       params.append('locality', searchForm.locality);
      if (searchForm.land_use)       params.append('land_use', searchForm.land_use);
      if (searchForm.status)         params.append('status', searchForm.status);
      const res = await API.get('/plots/search/?' + params.toString());
      setSearchResults(res.data);
    } catch {
      setSearchResults({ count: 0, results: [] });
    } finally { setSearching(false); }
  };

  const searchNearby = async (e) => {
    e.preventDefault();
    setSearchingNearby(true);
    setNearby(null);
    try {
      const res = await API.get('/plots/nearby/?lat=' + lat + '&lon=' + lon + '&radius=1000');
      setNearby(res.data);
    } catch {
      setNearby({ count: 0, plots: [] });
    } finally { setSearchingNearby(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Buyer Dashboard</h2>
          <p className="text-gray-500">Search, verify and purchase land across Cameroon</p>
        </div>

        {!user.is_verified && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">Account Not Yet Verified</p>
              <p className="text-yellow-700 text-sm mt-1">
                Visit your nearest Land Registry office with your CNI to verify your account and unlock purchasing.
              </p>
            </div>
          </div>
        )}

        {user.is_verified && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">Account Verified — You can search and purchase land</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'marketplace', label: 'Marketplace', icon: <ShoppingBag size={16} /> },
            { key: 'my_bids',     label: 'My Bids (' + myBids.length + ')', icon: <TrendingUp size={16} /> },
            { key: 'search',      label: 'Search by ID', icon: <Search size={16} /> },
            { key: 'location',    label: 'Search by Location', icon: <Filter size={16} /> },
            { key: 'nearby',      label: 'Nearby Plots', icon: <MapPin size={16} /> },
          ].map(function(tab) {
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={'flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition ' + (activeTab === tab.key ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}>
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <ShoppingBag size={64} className="text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Land Marketplace</h3>
            <p className="text-gray-500 mb-6">Browse plots listed for sale, place bids and purchase land across Cameroon</p>
            <button onClick={() => navigate('/marketplace')}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition font-medium text-lg">
              Browse Available Plots
            </button>
          </div>
        )}

        {/* My Bids Tab */}
        {activeTab === 'my_bids' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">My Bids ({myBids.length})</h3>
            </div>
            {loadingBids ? <div className="p-8 text-center text-gray-500">Loading...</div> :
             myBids.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <TrendingUp size={48} className="text-gray-300 mx-auto mb-3" />
                <p>No bids placed yet. Browse the marketplace to find plots!</p>
              </div>
            ) : (
              <div className="divide-y">
                {myBids.map(function(bid) {
                  return (
                    <div key={bid.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-sm font-medium text-primary">{bid.plot_id}</p>
                          <p className="text-sm text-gray-600">Bid Ref: {bid.bid_ref}</p>
                          <p className="text-sm font-bold text-gray-800">{parseInt(bid.amount).toLocaleString()} XAF</p>
                          <p className="text-xs text-gray-400">{new Date(bid.submitted_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (
                            bid.status === 'ACCEPTED'  ? 'bg-green-100 text-green-700' :
                            bid.status === 'REJECTED'  ? 'bg-red-100 text-red-700' :
                            bid.status === 'WITHDRAWN' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700')}>
                            {bid.status}
                          </span>
                          {bid.status === 'PENDING' && (
                            <div className="mt-2">
                              <button onClick={() => withdrawBid(bid.bid_ref)}
                                className="text-xs text-red-500 hover:text-red-700 underline">
                                Withdraw
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Search by ID Tab */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Search size={20} className="text-primary" />
              Check Plot by ID
            </h3>
            <form onSubmit={checkPlotById} className="flex gap-3">
              <input type="text" value={plotId} onChange={e => setPlotId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g. CM-CE-MFOUNDI-YDE-1-793790" required />
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
                <div className={'p-4 text-white ' + (plot.is_verified ? 'bg-green-500' : 'bg-yellow-500')}>
                  <div className="flex items-center gap-2">
                    {plot.is_verified ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    <div>
                      <p className="font-bold text-lg">{plot.is_verified ? 'VERIFIED PLOT' : 'UNVERIFIED PLOT'}</p>
                      <p className="text-sm opacity-90">{plot.plot_id}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500 uppercase">Current Owner</p><p className="font-semibold">{plot.owner}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Status</p>
                    <span className={'inline-block px-3 py-1 rounded-full text-sm font-medium ' + (plot.status === 'APPROVED' ? 'bg-green-100 text-green-700' : plot.status === 'SOLD' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700')}>{plot.status}</span>
                  </div>
                  <div><p className="text-xs text-gray-500 uppercase">Location</p><p className="font-semibold">{plot.full_location}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Area</p><p className="font-semibold">{plot.area_sqm} m²</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Land Use</p><p className="font-semibold">{plot.land_use}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Title Number</p><p className="font-semibold">{plot.title_number || 'Not yet issued'}</p></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location Search Tab */}
        {activeTab === 'location' && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Filter size={20} className="text-primary" />
              Search by Location
            </h3>
            <form onSubmit={searchByLocation} className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input type="text" value={searchForm.region} onChange={e => setSearchForm({...searchForm, region: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Centre" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" value={searchForm.department} onChange={e => setSearchForm({...searchForm, department: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Mfoundi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrondissement</label>
                <input type="text" value={searchForm.arrondissement} onChange={e => setSearchForm({...searchForm, arrondissement: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Yaounde I" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                <input type="text" value={searchForm.locality} onChange={e => setSearchForm({...searchForm, locality: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Bastos" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Use</label>
                <select value={searchForm.land_use} onChange={e => setSearchForm({...searchForm, land_use: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">All Types</option>
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="AGRICULTURAL">Agricultural</option>
                  <option value="INDUSTRIAL">Industrial</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={searching}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 font-medium">
                  {searching ? 'Searching...' : 'Search Plots'}
                </button>
              </div>
            </form>
            {searchResults && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Found {searchResults.count} plot(s)</p>
                {searchResults.results && searchResults.results.map(function(p, i) {
                  return (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3 hover:border-primary transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono font-bold text-primary text-sm">{p.plot_id}</p>
                          <p className="text-sm text-gray-600 mt-1">{p.full_location}</p>
                          <p className="text-sm text-gray-500">Owner: {p.owner} • {p.area_sqm} m² • {p.land_use}</p>
                        </div>
                        <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (p.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Nearby Tab */}
        {activeTab === 'nearby' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              Find Nearby Plots
            </h3>
            <p className="text-sm text-gray-500 mb-4">Enter your GPS coordinates to find registered plots within 1km</p>
            <form onSubmit={searchNearby} className="grid grid-cols-2 gap-3 mb-4">
              <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Latitude e.g. 3.8481" required />
              <input type="number" step="any" value={lon} onChange={e => setLon(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Longitude e.g. 11.5019" required />
              <button type="submit" disabled={searchingNearby}
                className="col-span-2 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50">
                {searchingNearby ? 'Searching...' : 'Search Nearby Plots'}
              </button>
            </form>
            {nearby && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Found {nearby.count} plot(s) within 1km</p>
                {nearby.plots && nearby.plots.map(function(p, i) {
                  return (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono font-bold text-primary text-sm">{p.plot_id}</p>
                          <p className="text-sm text-gray-500">Owner: {p.owner} • {p.area_sqm} m²</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{p.status}</span>
                          <p className="text-xs text-gray-400 mt-1">{p.distance_m}m away</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
