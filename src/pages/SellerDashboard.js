import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/config';
import { Plus, CheckCircle, XCircle, TrendingUp, Tag } from 'lucide-react';

export default function SellerDashboard() {
  const [myPlots, setMyPlots]         = useState([]);
  const [myListings, setMyListings]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('listings');
  const [showForm, setShowForm]       = useState(false);
  const [message, setMessage]         = useState('');
  const [form, setForm]               = useState({
    plot: '', sale_type: 'FIXED', asking_price: '',
    minimum_bid: '', bidding_deadline: '', description: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [plotsRes, listingsRes] = await Promise.all([
        API.get('/plots/'),
        API.get('/listings/?my_listings=true&status=all')
      ]);
      setMyPlots(plotsRes.data.results || []);
      setMyListings(listingsRes.data.results || []);
    } catch {}
    finally { setLoading(false); }
  };

  const createListing = async (e) => {
    e.preventDefault();
    try {
      await API.post('/listings/', form);
      setMessage('Listing created successfully! Activate it to make it visible to buyers.');
      setShowForm(false);
      setForm({ plot: '', sale_type: 'FIXED', asking_price: '', minimum_bid: '', bidding_deadline: '', description: '' });
      fetchData();
    } catch (err) {
      const data = err.response && err.response.data;
      if (data) {
        setMessage(Object.values(data).flat().join(' '));
      } else {
        setMessage('Error creating listing');
      }
    }
  };

  const activateListing = async (listingRef) => {
    try {
      await API.post('/listings/' + listingRef + '/activate/');
      setMessage('Listing activated successfully!');
      fetchData();
    } catch (err) {
      setMessage((err.response && err.response.data && err.response.data.error) || 'Error activating listing');
    }
  };

  const closeListing = async (listingRef) => {
    if (!window.confirm('Are you sure you want to close this listing?')) return;
    try {
      await API.post('/listings/' + listingRef + '/close/');
      setMessage('Listing closed successfully');
      fetchData();
    } catch (err) {
      setMessage((err.response && err.response.data && err.response.data.error) || 'Error closing listing');
    }
  };

  const acceptBid = async (bidRef) => {
    try {
      const res = await API.post('/listings/bids/' + bidRef + '/accept/');
      setMessage('Bid accepted! Transaction ' + res.data.transaction_ref + ' created.');
      fetchData();
    } catch (err) {
      setMessage((err.response && err.response.data && err.response.data.error) || 'Error accepting bid');
    }
  };

  const rejectBid = async (bidRef) => {
    try {
      await API.post('/listings/bids/' + bidRef + '/reject/');
      setMessage('Bid rejected');
      fetchData();
    } catch (err) {
      setMessage((err.response && err.response.data && err.response.data.error) || 'Error rejecting bid');
    }
  };

  const approvedPlots = myPlots.filter(function(p) {
    return p.status === 'APPROVED';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Land & Listings</h2>
            <p className="text-gray-500">Manage your plots and sale listings</p>
          </div>
          {approvedPlots.length > 0 && (
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition">
              <Plus size={18} />
              List Plot for Sale
            </button>
          )}
        </div>

        {message && (
          <div className={'p-4 rounded-lg mb-6 border ' + (message.includes('success') || message.includes('created') || message.includes('activated') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')}>
            {message}
            <button onClick={() => setMessage('')} className="float-right text-gray-400">x</button>
          </div>
        )}

        {/* Create Listing Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Listing</h3>
            <form onSubmit={createListing} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Plot to Sell</label>
                <select value={form.plot} onChange={e => setForm({...form, plot: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  required>
                  <option value="">-- Select a plot --</option>
                  {approvedPlots.map(function(plot) {
                    return (
                      <option key={plot.id} value={plot.id}>
                        {plot.plot_id} — {plot.full_location} — {plot.area_sqm} m²
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Type</label>
                <select value={form.sale_type} onChange={e => setForm({...form, sale_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="FIXED">Fixed Price</option>
                  <option value="AUCTION">Open Bidding (Auction)</option>
                </select>
              </div>
              {form.sale_type === 'FIXED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price (XAF)</label>
                  <input type="number" value={form.asking_price}
                    onChange={e => setForm({...form, asking_price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="e.g. 15000000" required />
                </div>
              )}
              {form.sale_type === 'AUCTION' && (
                <React.Fragment>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Bid (XAF)</label>
                    <input type="number" value={form.minimum_bid}
                      onChange={e => setForm({...form, minimum_bid: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="e.g. 10000000" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bidding Deadline</label>
                    <input type="datetime-local" value={form.bidding_deadline}
                      onChange={e => setForm({...form, bidding_deadline: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      required />
                  </div>
                </React.Fragment>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={3} placeholder="Describe the plot, its features and why it's a good investment..." />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit"
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition font-medium">
                  Create Listing
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'listings', label: 'My Listings (' + myListings.length + ')' },
            { key: 'plots',    label: 'My Plots (' + myPlots.length + ')' },
          ].map(function(tab) {
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={'px-4 py-2 rounded-lg font-medium transition ' + (activeTab === tab.key ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> :
             myListings.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <Tag size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No listings yet. Click "List Plot for Sale" to get started.</p>
              </div>
            ) : myListings.map(function(listing) {
              return (
                <div key={listing.id} className="bg-white rounded-xl shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-mono font-bold text-primary">{listing.listing_ref}</p>
                      <p className="text-sm text-gray-600">{listing.plot_details && listing.plot_details.full_location}</p>
                      <p className="text-sm text-gray-500">{listing.plot_details && listing.plot_details.area_sqm} m² • {listing.plot_details && listing.plot_details.land_use}</p>
                    </div>
                    <div className="text-right">
                      <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (
                        listing.status === 'ACTIVE'  ? 'bg-green-100 text-green-700' :
                        listing.status === 'SOLD'    ? 'bg-blue-100 text-blue-700' :
                        listing.status === 'CLOSED'  ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700')}>
                        {listing.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {listing.sale_type === 'AUCTION' ? 'Auction' : 'Fixed Price'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">{listing.sale_type === 'AUCTION' ? 'Min Bid' : 'Price'}</p>
                      <p className="font-bold text-gray-800">
                        {parseInt(listing.sale_type === 'AUCTION' ? listing.minimum_bid : listing.asking_price).toLocaleString()} XAF
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Bids</p>
                      <p className="font-bold text-gray-800">{listing.total_bids}</p>
                    </div>
                    {listing.highest_bid && (
                      <div>
                        <p className="text-xs text-gray-400">Highest Bid</p>
                        <p className="font-bold text-green-600">{parseInt(listing.highest_bid.amount).toLocaleString()} XAF</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mb-4">
                    {listing.status === 'DRAFT' && (
                      <button onClick={() => activateListing(listing.listing_ref)}
                        className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-600 transition">
                        Activate Listing
                      </button>
                    )}
                    {listing.status === 'ACTIVE' && (
                      <button onClick={() => closeListing(listing.listing_ref)}
                        className="bg-gray-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-gray-600 transition">
                        Close Listing
                      </button>
                    )}
                  </div>

                  {/* Bids */}
                  {listing.bids && listing.bids.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Bids ({listing.bids.length})</p>
                      <div className="space-y-2">
                        {listing.bids.map(function(bid) {
                          return (
                            <div key={bid.id} className={'rounded-lg p-3 flex justify-between items-center ' + (
                              bid.status === 'ACCEPTED' ? 'bg-green-50 border border-green-200' :
                              bid.status === 'REJECTED' ? 'bg-red-50 border border-red-200' :
                              'bg-gray-50 border border-gray-200')}>
                              <div>
                                <p className="text-sm font-medium">{bid.bidder_name}</p>
                                <p className="text-xs text-gray-500">{bid.message}</p>
                                <p className="text-xs text-gray-400">{new Date(bid.submitted_at).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-800">{parseInt(bid.amount).toLocaleString()} XAF</p>
                                <span className={'text-xs px-2 py-0.5 rounded-full ' + (
                                  bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                  bid.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700')}>
                                  {bid.status}
                                </span>
                                {bid.status === 'PENDING' && listing.status === 'ACTIVE' && (
                                  <div className="flex gap-1 mt-1 justify-end">
                                    <button onClick={() => acceptBid(bid.bid_ref)}
                                      className="bg-green-500 text-white px-2 py-0.5 rounded text-xs hover:bg-green-600">
                                      Accept
                                    </button>
                                    <button onClick={() => rejectBid(bid.bid_ref)}
                                      className="bg-red-500 text-white px-2 py-0.5 rounded text-xs hover:bg-red-600">
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Plots Tab */}
        {activeTab === 'plots' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">My Land Plots ({myPlots.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Plot ID', 'Location', 'Area', 'Land Use', 'Status'].map(function(h) {
                      return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myPlots.map(function(plot) {
                    return (
                      <tr key={plot.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{plot.plot_id}</td>
                        <td className="px-4 py-3 text-sm">{plot.full_location}</td>
                        <td className="px-4 py-3 text-sm">{plot.area_sqm} m²</td>
                        <td className="px-4 py-3 text-sm">{plot.land_use}</td>
                        <td className="px-4 py-3">
                          <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (
                            plot.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            plot.status === 'SOLD'     ? 'bg-blue-100 text-blue-700' :
                            plot.status === 'LISTED'   ? 'bg-purple-100 text-purple-700' :
                            'bg-yellow-100 text-yellow-700')}>
                            {plot.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
