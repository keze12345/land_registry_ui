import React, { useState, useEffect } from 'react';
import API from '../api/config';

export default function LocationSelector({ onChange }) {
  const [regions, setRegions]                 = useState([]);
  const [departments, setDepartments]         = useState([]);
  const [arrondissements, setArrondissements] = useState([]);
  const [selected, setSelected]               = useState({
    region: '', department: '', arrondissement: '', locality_name: ''
  });

  useEffect(() => {
    API.get('/locations/regions/').then(res => setRegions(res.data.results || []));
  }, []);

  useEffect(() => {
    if (selected.region) {
      API.get(`/locations/departments/?region=${selected.region}`)
        .then(res => setDepartments(res.data.results || []));
      setArrondissements([]);
      setSelected(s => ({ ...s, department: '', arrondissement: '' }));
    }
  }, [selected.region]);

  useEffect(() => {
    if (selected.department) {
      API.get(`/locations/arrondissements/?department=${selected.department}`)
        .then(res => setArrondissements(res.data.results || []));
      setSelected(s => ({ ...s, arrondissement: '' }));
    }
  }, [selected.department]);

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  const handleChange = (field, value) => {
    setSelected(s => ({ ...s, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Region */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region <span className="text-red-500">*</span>
        </label>
        <select
          value={selected.region}
          onChange={e => handleChange('region', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          required
        >
          <option value="">-- Select Region --</option>
          {regions.map(r => (
            <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
          ))}
        </select>
      </div>

      {/* Department */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          value={selected.department}
          onChange={e => handleChange('department', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-100"
          disabled={!selected.region}
          required
        >
          <option value="">-- Select Department --</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Arrondissement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Arrondissement <span className="text-red-500">*</span>
        </label>
        <select
          value={selected.arrondissement}
          onChange={e => handleChange('arrondissement', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-100"
          disabled={!selected.department}
          required
        >
          <option value="">-- Select Arrondissement --</option>
          {arrondissements.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Locality */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Locality / Quarter <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={selected.locality_name}
          onChange={e => handleChange('locality_name', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="e.g. Bastos, Akwa, Bonamoussadi"
          required
        />
      </div>
    </div>
  );
}
