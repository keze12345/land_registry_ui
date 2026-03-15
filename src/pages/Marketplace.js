import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../api/config';
import { MapPin, Clock, TrendingUp, Tag, AlertCircle, CheckCircle } from 'lucide-react';

export default function Marketplace() {
  const { user }                    = useAuth();
  const [listings, setListings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [bidAmount, setBidAmount]   = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState('');
  const [filters, setFilters]       = useState({
    region: '', sale_type: '', land_use: ''
  });

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try {
      var params = new URLSearchParams();
      if (filters.region)    params.append('region', filters.region);
      if (filters.sale_type) params.append('sale_type', filters.sale_type);
      if (filters.land_use)  params.append('land_use', filters.land_use);
      const res = await API.get('/listings/public/?' + params.toString());
      setListings(res.data.results || []);
    } catch {}
    finally { setLoading(false); }
  };

  const placeBid = async (e) => {
    e.preventDefault();
    if (!user.is_verified) {
      setMessage('Your account must be verified before placing bids');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const res = await API.post('/listings/' + selectedListing.listing_ref + '/bid/', {
        listing: selectedListing.id,
        amount:  bidAmount,
        currency: 'XAF',
        message: bidMessage
      });
      setMessage('Bid placed successfully! Ref: ' + res.data.bid.bid_ref);
      setBidAmount('');
      setBidMessage('');
      setSelectedListing(null);
      fetchListings();
    } catch (err) {
      const data = err.response && err.response.data;
      if (data) {
        const msgs = Object.values(data).flat().join(' ');
        setMessage(msgs);
      } else {
        setMessage('Error placing bid. Please try again.');
      }
    } finally { setSubmitting(false); }
  };

  const formatPrice = (amount) => {
    return parseInt(amount).toLocaleString() + ' XAF';
  };

  const daysLeft = (deadline) => {
    const now  = new Date();
    const end  = new Date(deadline);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff + ' days left' : 'Expired';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Land Marketplace</h2>
          <p className="text-gray-500">Browse available plots for sale across Cameroon</p>
        </div>

        {!user.is_verified && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800 text-sm">
              Your account is not verified. You can browse listings but cannot place bids until
              you visit a Land Registry office with your CNI.
            </p>
          </div>
        )}

        {message && (
          <div className={'p-4 rounded-lg mb-6 border ' + (message.includes('success') || message.includes('successfully') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')}>
            {message}
            <button onClick={() => setMessage('')} className="float-right text-gray-400">x</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" value={filters.region}
              onChange={e => setFilters({...filters, region: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              placeholder="Filter by region..." />
            <select value={filters.sale_type}
              onChange={e => setFilters({...filters, sale_type: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm">
              <option value="">All Sale Types</option>
              <option value="FIXED">Fixed Price</option>
              <option value="AUCTION">Auction</option>
            </select>
            <select value={filters.land_use}
              onChange={e => setFilters({...filters, land_use: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm">
              <option value="">All Land Uses</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="AGRICULTURAL">Agricultural</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
            <button onClick={fetchListings}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition text-sm font-medium">
              Search
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No active listings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(function(listing) {
              return (
                <div key={listing.id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
                  {/* Header */}
                  <div className={'p-4 ' + (listing.sale_type === 'AUCTION' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-primary to-secondary')}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (listing.sale_type === 'AUCTION' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800')}>
                          {listing.sale_type === 'AUCTION' ? '🔨 Auction' : '🏷️ Fixed Price'}
                        </span>
                        <p className="text-white font-mono text-sm mt-2">{listing.plot_details && listing.plot_details.plot_id}</p>
                      </div>
                      <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                        {listing.plot_details && listing.plot_details.land_use}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                      <MapPin size={14} />
                      <span>{listing.plot_details && listing.plot_details.full_location}</span>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-xs text-gray-400">
                          {listing.sale_type === 'AUCTION' ? 'Minimum Bid' : 'Asking Price'}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(listing.sale_type === 'AUCTION' ? listing.minimum_bid : listing.asking_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Area</p>
                        <p className="font-semibold text-gray-700">{listing.plot_details && listing.plot_details.area_sqm} m²</p>
                      </div>
                    </div>

                    {listing.sale_type === 'AUCTION' && (
                      <div className="flex justify-between items-center mb-3 bg-purple-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-purple-600 text-sm">
                          <TrendingUp size={14} />
                          <span>{listing.total_bids} bid(s)</span>
                        </div>
                        {listing.highest_bid && (
                          <span className="text-purple-700 text-sm font-medium">
                            Highest: {formatPrice(listing.highest_bid.amount)}
                          </span>
                        )}
                        {listing.bidding_deadline && (
                          <div className="flex items-center gap-1 text-orange-600 text-xs">
                            <Clock size={12} />
                            <span>{daysLeft(listing.bidding_deadline)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{listing.description}</p>

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">Seller: {listing.seller_name}</p>
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className={'px-4 py-2 rounded-lg text-sm font-medium transition ' + (user.is_verified ? 'bg-primary text-white hover:bg-secondary' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}>
                        {listing.sale_type === 'AUCTION' ? 'Place Bid' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bid Modal */}
        {selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {selectedListing.sale_type === 'AUCTION' ? 'Place a Bid' : 'Purchase Request'}
              </h3>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="font-mono text-sm font-medium text-primary">{selectedListing.plot_details && selectedListing.plot_details.plot_id}</p>
                <p className="text-sm text-gray-600">{selectedListing.plot_details && selectedListing.plot_details.full_location}</p>
                <p className="text-sm text-gray-500">{selectedListing.plot_details && selectedListing.plot_details.area_sqm} m² • {selectedListing.plot_details && selectedListing.plot_details.land_use}</p>
                {selectedListing.sale_type === 'AUCTION' && (
                  <p className="text-sm text-purple-600 font-medium mt-1">
                    Minimum bid: {formatPrice(selectedListing.minimum_bid)}
                  </p>
                )}
                {selectedListing.sale_type === 'FIXED' && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Asking price: {formatPrice(selectedListing.asking_price)}
                  </p>
                )}
              </div>

              <form onSubmit={placeBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedListing.sale_type === 'AUCTION' ? 'Your Bid Amount (XAF)' : 'Offered Amount (XAF)'}
                  </label>
                  <input type="number" value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder={selectedListing.sale_type === 'AUCTION' ? 'Enter your bid amount' : 'Enter offered amount'}
                    min={selectedListing.minimum_bid || selectedListing.asking_price}
                    required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message to Seller (optional)</label>
                  <textarea value={bidMessage}
                    onChange={e => setBidMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    rows={3}
                    placeholder="Introduce yourself and explain your interest..." />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 font-medium">
                    {submitting ? 'Submitting...' : selectedListing.sale_type === 'AUCTION' ? 'Submit Bid' : 'Submit Request'}
                  </button>
                  <button type="button" onClick={() => setSelectedListing(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
