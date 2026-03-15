import React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, TrendingUp, Tag, CheckCircle, AlertCircle } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PlotDetailModal({ listing, onClose, onBid, user }) {
  if (!listing) return null;

  const plot  = listing.plot_details;
  const points = plot && plot.boundary_points ? plot.boundary_points : [];

  const positions = points.map(function(p) {
    return [p.latitude, p.longitude];
  });

  const center = positions.length > 0
    ? [
        positions.reduce(function(s, p) { return s + p[0]; }, 0) / positions.length,
        positions.reduce(function(s, p) { return s + p[1]; }, 0) / positions.length
      ]
    : [3.848, 11.502];

  const formatPrice = (amount) => {
    return parseInt(amount).toLocaleString() + ' XAF';
  };

  const daysLeft = (deadline) => {
    var now  = new Date();
    var end  = new Date(deadline);
    var diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff + ' days left' : 'Expired';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-screen overflow-y-auto">

        {/* Header */}
        <div className="bg-primary text-white p-5 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono font-bold text-lg">{plot && plot.plot_id}</p>
              <p className="text-green-200 text-sm flex items-center gap-1">
                <MapPin size={14} />
                {plot && plot.full_location}
              </p>
            </div>
            <button onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">

          {/* Site Plan Map */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Site Plan — Plot Boundary
            </h3>

            {positions.length >= 3 ? (
              <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '300px' }}>
                <MapContainer center={center} zoom={18} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Plot polygon */}
                  <Polygon
                    positions={positions}
                    pathOptions={{
                      color:       '#1B4332',
                      fillColor:   '#52B788',
                      fillOpacity: 0.4,
                      weight:      3
                    }}
                  />

                  {/* Label each corner */}
                  {points.map(function(point, i) {
                    var icon = L.divIcon({
                      html: '<div style="background:#1B4332;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;">' + point.point_label + '</div>',
                      className: '',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    });
                    return (
                      <Marker key={i} position={[point.latitude, point.longitude]} icon={icon}>
                        <Popup>
                          <strong>Point {point.point_label}</strong><br />
                          Lat: {point.latitude}<br />
                          Lon: {point.longitude}
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No boundary points available</p>
              </div>
            )}

            {/* GPS Coordinates Table */}
            {points.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">GPS Boundary Coordinates</p>
                <div className="grid grid-cols-3 gap-2">
                  {points.map(function(point, i) {
                    return (
                      <div key={i} className="bg-gray-50 rounded-lg p-2 text-xs">
                        <span className="font-bold text-primary mr-1">Point {point.point_label}</span>
                        <span className="font-mono text-gray-600">{point.latitude}, {point.longitude}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Plot Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Plot ID',      value: plot && plot.plot_id },
              { label: 'Title Number', value: (plot && plot.title_number) || 'Not yet issued' },
              { label: 'Area',         value: plot && plot.area_sqm + ' m²' },
              { label: 'Land Use',     value: plot && plot.land_use },
              { label: 'Status',       value: plot && plot.status },
              { label: 'Owner',        value: listing.seller_name },
            ].map(function(item) {
              return (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                </div>
              );
            })}
          </div>

          {/* Listing Details */}
          <div className="border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Listing Details</h3>
              <span className={'px-3 py-1 rounded-full text-xs font-medium ' + (listing.sale_type === 'AUCTION' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700')}>
                {listing.sale_type === 'AUCTION' ? '🔨 Auction' : '🏷️ Fixed Price'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">{listing.sale_type === 'AUCTION' ? 'Minimum Bid' : 'Asking Price'}</p>
                <p className="text-xl font-bold text-primary">
                  {formatPrice(listing.sale_type === 'AUCTION' ? listing.minimum_bid : listing.asking_price)}
                </p>
              </div>
              {listing.sale_type === 'AUCTION' && (
                <React.Fragment>
                  <div>
                    <p className="text-xs text-gray-400">Total Bids</p>
                    <p className="text-xl font-bold text-gray-800">{listing.total_bids}</p>
                  </div>
                  {listing.highest_bid && (
                    <div>
                      <p className="text-xs text-gray-400">Highest Bid</p>
                      <p className="text-xl font-bold text-green-600">{formatPrice(listing.highest_bid.amount)}</p>
                    </div>
                  )}
                  {listing.bidding_deadline && (
                    <div>
                      <p className="text-xs text-gray-400">Time Left</p>
                      <p className="text-sm font-bold text-orange-600">{daysLeft(listing.bidding_deadline)}</p>
                    </div>
                  )}
                </React.Fragment>
              )}
            </div>
            {listing.description && (
              <p className="text-sm text-gray-500 mt-3 border-t pt-3">{listing.description}</p>
            )}
          </div>

          {/* Verification Status */}
          <div className={'flex items-center gap-3 p-3 rounded-lg mb-6 ' + (plot && plot.status === 'APPROVED' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200')}>
            {plot && plot.status === 'APPROVED'
              ? <CheckCircle size={20} className="text-green-600" />
              : <AlertCircle size={20} className="text-yellow-600" />
            }
            <div>
              <p className={'text-sm font-medium ' + (plot && plot.status === 'APPROVED' ? 'text-green-800' : 'text-yellow-800')}>
                {plot && plot.status === 'APPROVED' ? 'This plot is officially registered and verified' : 'Plot verification status: ' + (plot && plot.status)}
              </p>
              {plot && plot.title_number && (
                <p className="text-xs text-green-600">Title: {plot.title_number}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {user && user.is_verified ? (
              <button onClick={() => onBid(listing)}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-secondary transition font-medium text-lg">
                {listing.sale_type === 'AUCTION' ? '🔨 Place Bid' : '🏷️ Buy Now'}
              </button>
            ) : (
              <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-yellow-700 text-sm">Verify your account at a Land Registry office to purchase</p>
              </div>
            )}
            <button onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
