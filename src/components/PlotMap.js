import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PlotMap({ plots, center, zoom }) {
  const mapCenter = center || [3.848, 11.502];
  const mapZoom   = zoom   || 13;

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {plots && plots.map(plot => {
        if (!plot.boundary_points || plot.boundary_points.length < 3) return null;

        const positions = plot.boundary_points.map(p => [p.latitude, p.longitude]);
        const color = plot.status === 'APPROVED' ? '#22c55e' :
                      plot.status === 'SOLD'     ? '#3b82f6' :
                      plot.status === 'REJECTED' ? '#ef4444' : '#f59e0b';

        return (
          <Polygon
            key={plot.id}
            positions={positions}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.3, weight: 2 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-primary">{plot.plot_id}</p>
                <p><strong>Owner:</strong> {plot.owner_name}</p>
                <p><strong>Location:</strong> {plot.full_location}</p>
                <p><strong>Area:</strong> {plot.area_sqm} m²</p>
                <p><strong>Status:</strong>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    plot.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    plot.status === 'SOLD'     ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'}`}>
                    {plot.status}
                  </span>
                </p>
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </MapContainer>
  );
}
