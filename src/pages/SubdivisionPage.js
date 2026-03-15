import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapBoundaryPicker from '../components/MapBoundaryPicker';
import API from '../api/config';
import { Scissors, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

export default function SubdivisionPage() {
  const [myPlots, setMyPlots]               = useState([]);
  const [selectedPlot, setSelectedPlot]     = useState(null);
  const [subPlots, setSubPlots]             = useState([{ label: 'Sub-plot A', points: [], area: '' }]);
  const [reason, setReason]                 = useState('');
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [message, setMessage]               = useState('');
  const [activeSubPlot, setActiveSubPlot]   = useState(0);

  useEffect(() => { fetchMyPlots(); }, []);

  const fetchMyPlots = async () => {
    try {
      const res = await API.get('/plots/');
      const approved = (res.data.results || []).filter(function(p) {
        return p.status === 'APPROVED';
      });
      setMyPlots(approved);
    } catch {}
    finally { setLoading(false); }
  };

  const addSubPlot = () => {
    const label = 'Sub-plot ' + String.fromCharCode(65 + subPlots.length);
    setSubPlots([...subPlots, { label, points: [], area: '' }]);
  };

  const removeSubPlot = (index) => {
    if (subPlots.length <= 2) {
      setMessage('A subdivision must have at least 2 sub-plots');
      return;
    }
    setSubPlots(subPlots.filter(function(_, i) { return i !== index; }));
    if (activeSubPlot >= subPlots.length - 1) setActiveSubPlot(0);
  };

  const updateSubPlotPoints = (index, points) => {
    var updated = subPlots.map(function(sp, i) {
      return i === index ? { ...sp, points } : sp;
    });
    setSubPlots(updated);
  };

  const updateSubPlotArea = (index, area) => {
    var updated = subPlots.map(function(sp, i) {
      return i === index ? { ...sp, area } : sp;
    });
    setSubPlots(updated);
  };

  const getTotalArea = () => {
    return subPlots.reduce(function(sum, sp) {
      return sum + (parseFloat(sp.area) || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlot) {
      setMessage('Please select a plot to subdivide');
      return;
    }
    for (var i = 0; i < subPlots.length; i++) {
      if (subPlots[i].points.length < 3) {
        setMessage('Sub-plot ' + subPlots[i].label + ' needs at least 3 boundary points');
        return;
      }
      if (!subPlots[i].area) {
        setMessage('Please enter area for ' + subPlots[i].label);
        return;
      }
    }
    if (!reason) {
      setMessage('Please provide a reason for subdivision');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      await API.post('/listings/subdivisions/request/', {
        plot_id:  selectedPlot.plot_id,
        reason:   reason,
        sub_plots: subPlots.map(function(sp) {
          return {
            label:  sp.label,
            area:   sp.area,
            points: sp.points
          };
        })
      });
      setMessage('Subdivision request submitted successfully! A government official will review it.');
      setSelectedPlot(null);
      setSubPlots([{ label: 'Sub-plot A', points: [], area: '' }]);
      setReason('');
    } catch (err) {
      const data = err.response && err.response.data;
      setMessage(data ? JSON.stringify(data) : 'Error submitting subdivision request');
    } finally { setSubmitting(false); }
  };

  const getPlotCenter = (plot) => {
    if (plot && plot.boundary_points && plot.boundary_points.length > 0) {
      var lats = plot.boundary_points.map(function(p) { return p.latitude; });
      var lons = plot.boundary_points.map(function(p) { return p.longitude; });
      var avgLat = lats.reduce(function(a, b) { return a + b; }, 0) / lats.length;
      var avgLon = lons.reduce(function(a, b) { return a + b; }, 0) / lons.length;
      return [avgLat, avgLon];
    }
    return [3.848, 11.502];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Scissors size={24} className="text-primary" />
            Plot Subdivision
          </h2>
          <p className="text-gray-500">Divide your land plot into smaller sub-plots</p>
        </div>

        {message && (
          <div className={'p-4 rounded-lg mb-6 border ' + (message.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')}>
            {message.includes('success') ? <CheckCircle size={16} className="inline mr-2" /> : <AlertCircle size={16} className="inline mr-2" />}
            {message}
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-800 font-medium mb-1">How Plot Subdivision Works:</p>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>1. Select an approved plot you own</li>
            <li>2. Draw new boundaries for each sub-plot on the map</li>
            <li>3. Submit your request — a Government Official will review it</li>
            <li>4. Once approved, new sub-plots are created with unique Plot IDs</li>
            <li>5. You can sell each sub-plot independently</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Step 1 - Select Plot */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Step 1 — Select Plot to Subdivide</h3>
            {loading ? (
              <p className="text-gray-500">Loading your plots...</p>
            ) : myPlots.length === 0 ? (
              <div className="text-center py-4">
                <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No approved plots available for subdivision</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myPlots.map(function(plot) {
                  return (
                    <div key={plot.id}
                      onClick={() => setSelectedPlot(plot)}
                      className={'border-2 rounded-lg p-4 cursor-pointer transition ' + (selectedPlot && selectedPlot.id === plot.id ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-primary')}>
                      <p className="font-mono text-sm font-bold text-primary">{plot.plot_id}</p>
                      <p className="text-sm text-gray-600">{plot.full_location}</p>
                      <p className="text-sm text-gray-500">{plot.area_sqm} m² • {plot.land_use}</p>
                      {selectedPlot && selectedPlot.id === plot.id && (
                        <p className="text-green-600 text-xs mt-1 font-medium">✓ Selected</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2 - Define Sub-plots */}
          {selectedPlot && (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Step 2 — Define Sub-plot Boundaries</h3>
                <button type="button" onClick={addSubPlot}
                  className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-secondary transition">
                  + Add Sub-plot
                </button>
              </div>

              {/* Area summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Original plot area: <strong>{selectedPlot.area_sqm} m²</strong></span>
                <span className={'text-sm font-medium ' + (Math.abs(getTotalArea() - parseFloat(selectedPlot.area_sqm)) < 1 ? 'text-green-600' : 'text-orange-600')}>
                  Sub-plots total: {getTotalArea()} m²
                  {Math.abs(getTotalArea() - parseFloat(selectedPlot.area_sqm)) < 1 ? ' ✓' : ' ≠ original'}
                </span>
              </div>

              {/* Sub-plot tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {subPlots.map(function(sp, i) {
                  return (
                    <button key={i} type="button"
                      onClick={() => setActiveSubPlot(i)}
                      className={'px-3 py-1.5 rounded-lg text-sm font-medium transition ' + (activeSubPlot === i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                      {sp.label} {sp.points.length > 0 ? '(' + sp.points.length + ' pts)' : ''}
                      {subPlots.length > 2 && (
                        <span onClick={(e) => { e.stopPropagation(); removeSubPlot(i); }}
                          className="ml-2 text-red-400 hover:text-red-600">×</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active sub-plot editor */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">{subPlots[activeSubPlot].label}</h4>
                  <div>
                    <label className="text-sm text-gray-500 mr-2">Area (m²):</label>
                    <input type="number"
                      value={subPlots[activeSubPlot].area}
                      onChange={e => updateSubPlotArea(activeSubPlot, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="e.g. 300" />
                  </div>
                </div>
                <MapBoundaryPicker
                  points={subPlots[activeSubPlot].points}
                  onChange={(pts) => updateSubPlotPoints(activeSubPlot, pts)}
                  center={getPlotCenter(selectedPlot)}
                  existingBoundary={selectedPlot.boundary_points}
                />
              </div>
            </div>
          )}

          {/* Step 3 - Reason */}
          {selectedPlot && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Step 3 — Reason for Subdivision</h3>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                rows={4}
                placeholder="Explain why you want to subdivide this plot (e.g. selling part of the land to fund construction, dividing inheritance between family members, etc.)"
                required />
            </div>
          )}

          {/* Submit */}
          {selectedPlot && (
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition disabled:opacity-50 font-medium flex items-center gap-2">
                <Scissors size={18} />
                {submitting ? 'Submitting...' : 'Submit Subdivision Request'}
              </button>
              <button type="button" onClick={() => { setSelectedPlot(null); setSubPlots([{ label: 'Sub-plot A', points: [], area: '' }]); }}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
