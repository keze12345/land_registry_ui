import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
}

export default function MapBoundaryPicker({ points, onChange, center, existingBoundary }) {
  const mapCenter = center || [3.848, 11.502];

  const addPoint = (latlng) => {
    const newPoint = {
      label:     String.fromCharCode(65 + points.length),
      latitude:  parseFloat(latlng.lat.toFixed(6)),
      longitude: parseFloat(latlng.lng.toFixed(6))
    };
    onChange([...points, newPoint]);
  };

  const removePoint = (index) => {
    const updated = points.filter(function(_, i) { return i !== index; })
      .map(function(p, i) { return { ...p, label: String.fromCharCode(65 + i) }; });
    onChange(updated);
  };

  const polygonPositions = points.map(function(p) {
    return [p.latitude, p.longitude];
  });

  const existingPositions = existingBoundary ? existingBoundary.map(function(p) {
    return [p.latitude, p.longitude];
  }) : null;

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <p className="text-blue-700 text-sm font-medium">How to mark boundaries:</p>
        <p className="text-blue-600 text-xs mt-1">
          Click on the map to add boundary points. Add at least 3 points to form a polygon.
          Points are labeled A, B, C... in order. Click a point label to remove it.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 mb-4" style={{ height: '400px' }}>
        <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={addPoint} />

          {/* Existing boundary (for subdivision) */}
          {existingPositions && existingPositions.length >= 3 && (
            <Polygon
              positions={existingPositions}
              pathOptions={{ color: '#6b7280', fillColor: '#6b7280', fillOpacity: 0.1, weight: 2, dashArray: '5,5' }}
            />
          )}

          {/* New boundary being drawn */}
          {polygonPositions.length >= 3 && (
            <Polygon
              positions={polygonPositions}
              pathOptions={{ color: '#1B4332', fillColor: '#52B788', fillOpacity: 0.3, weight: 2 }}
            />
          )}

          {/* Markers for each point */}
          {points.map(function(point, index) {
            return (
              <Marker
                key={index}
                position={[point.latitude, point.longitude]}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Points list */}
      {points.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b">
            <p className="text-sm font-medium text-gray-700">Boundary Points ({points.length})</p>
          </div>
          <div className="divide-y">
            {points.map(function(point, index) {
              return (
                <div key={index} className="px-4 py-2 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {point.label}
                    </span>
                    <span className="text-sm font-mono text-gray-600">
                      {point.latitude}, {point.longitude}
                    </span>
                  </div>
                  <button onClick={() => removePoint(index)}
                    className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition">
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          {points.length >= 3 && (
            <div className="px-4 py-2 bg-green-50 border-t">
              <p className="text-green-700 text-xs">✓ Valid polygon — {points.length} points selected</p>
            </div>
          )}
          {points.length < 3 && (
            <div className="px-4 py-2 bg-yellow-50 border-t">
              <p className="text-yellow-700 text-xs">⚠ Need at least {3 - points.length} more point(s)</p>
            </div>
          )}
        </div>
      )}

      {points.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          Click on the map above to start marking boundary points
        </div>
      )}
    </div>
  );
}
