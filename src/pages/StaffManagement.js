import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../api/config';
import { Users, Plus, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function StaffManagement() {
  const { user }                    = useAuth();
  const [staff, setStaff]           = useState([]);
  const [regions, setRegions]       = useState([]);
  const [departments, setDepartments] = useState([]);
  const [arrondissements, setArrondissements] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [message, setMessage]       = useState('');
  const [errors, setErrors]         = useState({});
  const [form, setForm]             = useState({
    first_name: '', last_name: '', email: '',
    phone: '', national_id: '', role: '',
    jurisdiction_level: '', jurisdiction_region: '',
    jurisdiction_department: '', jurisdiction_arrondissement: '',
    password: '', password2: ''
  });

  useEffect(() => {
    fetchData();
    fetchRegions();
  }, []);

  useEffect(() => {
    if (form.jurisdiction_region) {
      API.get('/locations/departments/?region=' + form.jurisdiction_region)
        .then(res => setDepartments(res.data.results || []));
      setArrondissements([]);
      setForm(f => ({ ...f, jurisdiction_department: '', jurisdiction_arrondissement: '' }));
    }
  }, [form.jurisdiction_region]);

  useEffect(() => {
    if (form.jurisdiction_department) {
      API.get('/locations/arrondissements/?department=' + form.jurisdiction_department)
        .then(res => setArrondissements(res.data.results || []));
      setForm(f => ({ ...f, jurisdiction_arrondissement: '' }));
    }
  }, [form.jurisdiction_department]);

  useEffect(() => {
    // Auto set jurisdiction level based on role
    var levelMap = {
      'NATIONAL_ADMIN': 'NATIONAL',
      'REGIONAL_DIR':   'REGIONAL',
      'DIVISIONAL_OFF': 'DIVISIONAL',
      'SUBDIV_OFF':     'SUBDIVISIONAL',
      'SURVEYOR':       'SUBDIVISIONAL',
    };
    if (form.role && levelMap[form.role]) {
      setForm(f => ({ ...f, jurisdiction_level: levelMap[form.role] }));
    }
  }, [form.role]);

  const fetchData = async () => {
    try {
      const res = await API.get('/accounts/staff/');
      setStaff(res.data.results || []);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchRegions = async () => {
    try {
      const res = await API.get('/locations/regions/');
      setRegions(res.data.results || []);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    var newErrors = {};
    if (!form.first_name)  newErrors.first_name = 'First name is required';
    if (!form.last_name)   newErrors.last_name  = 'Last name is required';
    if (!form.email)       newErrors.email      = 'Email is required';
    if (!form.role)        newErrors.role       = 'Role is required';
    if (!form.password)    newErrors.password   = 'Password is required';
    if (form.password !== form.password2) newErrors.password2 = 'Passwords do not match';

    if (form.role === 'REGIONAL_DIR' && !form.jurisdiction_region)
      newErrors.jurisdiction_region = 'Region is required for Regional Director';
    if (form.role === 'DIVISIONAL_OFF' && !form.jurisdiction_department)
      newErrors.jurisdiction_department = 'Department is required for Divisional Officer';
    if (['SUBDIV_OFF', 'SURVEYOR'].includes(form.role) && !form.jurisdiction_arrondissement)
      newErrors.jurisdiction_arrondissement = 'Arrondissement is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      var data = { ...form };
      if (!data.jurisdiction_region)        delete data.jurisdiction_region;
      if (!data.jurisdiction_department)    delete data.jurisdiction_department;
      if (!data.jurisdiction_arrondissement) delete data.jurisdiction_arrondissement;

      await API.post('/accounts/staff/register/', data);
      setMessage('Staff account created successfully!');
      setShowForm(false);
      setForm({
        first_name: '', last_name: '', email: '',
        phone: '', national_id: '', role: '',
        jurisdiction_level: '', jurisdiction_region: '',
        jurisdiction_department: '', jurisdiction_arrondissement: '',
        password: '', password2: ''
      });
      fetchData();
    } catch (err) {
      if (err.response && err.response.data) {
        var data2 = err.response.data;
        if (data2.error) {
          setMessage(data2.error);
        } else {
          var fieldErrors = {};
          Object.keys(data2).forEach(function(key) {
            fieldErrors[key] = Array.isArray(data2[key]) ? data2[key].join(', ') : data2[key];
          });
          setErrors(fieldErrors);
        }
      }
    }
  };

  const getRoleOptions = () => {
    var allRoles = [
      { value: 'REGIONAL_DIR',   label: 'Regional Director' },
      { value: 'DIVISIONAL_OFF', label: 'Divisional Officer' },
      { value: 'SUBDIV_OFF',     label: 'Sub-Divisional Officer' },
      { value: 'SURVEYOR',       label: 'Surveyor' },
    ];
    if (user.role === 'NATIONAL_ADMIN') {
      return [{ value: 'NATIONAL_ADMIN', label: 'National Admin' }, ...allRoles];
    }
    if (user.role === 'REGIONAL_DIR') {
      return allRoles.slice(1);
    }
    if (user.role === 'DIVISIONAL_OFF') {
      return allRoles.slice(2);
    }
    if (user.role === 'SUBDIV_OFF') {
      return [{ value: 'SURVEYOR', label: 'Surveyor' }];
    }
    return [];
  };

  const roleColor = (role) => {
    if (role === 'NATIONAL_ADMIN') return 'bg-red-100 text-red-700';
    if (role === 'REGIONAL_DIR')   return 'bg-purple-100 text-purple-700';
    if (role === 'DIVISIONAL_OFF') return 'bg-blue-100 text-blue-700';
    if (role === 'SUBDIV_OFF')     return 'bg-green-100 text-green-700';
    if (role === 'SURVEYOR')       return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const groupedStaff = {};
  staff.forEach(function(s) {
    var region = s.region_name || 'National';
    if (!groupedStaff[region]) groupedStaff[region] = [];
    groupedStaff[region].push(s);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
            <p className="text-gray-500">
              Manage staff accounts following the Ministry of Lands hierarchy
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition">
            <Plus size={18} /> Create Staff Account
          </button>
        </div>

        {/* Hierarchy Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-800 font-medium mb-2">Ministry Hierarchy — Your Level: {user.role.replace(/_/g, ' ')}</p>
          <div className="flex items-center gap-2 text-sm text-blue-700 flex-wrap">
            {['NATIONAL_ADMIN', 'REGIONAL_DIR', 'DIVISIONAL_OFF', 'SUBDIV_OFF', 'SURVEYOR'].map(function(role, i, arr) {
              return (
                <React.Fragment key={role}>
                  <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (user.role === role ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700')}>
                    {role.replace(/_/g, ' ')}
                  </span>
                  {i < arr.length - 1 && <span className="text-blue-400">→</span>}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-blue-600 text-xs mt-2">
            Your jurisdiction: <strong>{user.jurisdiction_name || 'National'}</strong>
          </p>
        </div>

        {message && (
          <div className={'p-4 rounded-lg mb-6 border ' + (message.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')}>
            {message}
            <button onClick={() => setMessage('')} className="float-right">x</button>
          </div>
        )}

        {/* Create Staff Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Create New Staff Account</h3>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Personal Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3 border-b pb-2">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input type="text" value={form.first_name}
                      onChange={e => setForm({...form, first_name: e.target.value})}
                      className={'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ' + (errors.first_name ? 'border-red-400' : 'border-gray-300')}
                      placeholder="First name" />
                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input type="text" value={form.last_name}
                      onChange={e => setForm({...form, last_name: e.target.value})}
                      className={'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ' + (errors.last_name ? 'border-red-400' : 'border-gray-300')}
                      placeholder="Last name" />
                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className={'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ' + (errors.email ? 'border-red-400' : 'border-gray-300')}
                      placeholder="official@mindcaf.cm" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="e.g. 677123456" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNI Number</label>
                    <input type="text" value={form.national_id}
                      onChange={e => setForm({...form, national_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="e.g. CM123456789" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select value={form.role}
                      onChange={e => setForm({...form, role: e.target.value})}
                      className={'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ' + (errors.role ? 'border-red-400' : 'border-gray-300')}>
                      <option value="">-- Select Role --</option>
                      {getRoleOptions().map(function(opt) {
                        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                      })}
                    </select>
                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                  </div>
                </div>
              </div>

              {/* Jurisdiction */}
              {form.role && form.role !== 'NATIONAL_ADMIN' && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3 border-b pb-2">
                    Jurisdiction Assignment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['REGIONAL_DIR', 'DIVISIONAL_OFF', 'SUBDIV_OFF', 'SURVEYOR'].includes(form.role) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Region {form.role === 'REGIONAL_DIR' ? '*' : ''}
                        </label>
                        <select value={form.jurisdiction_region}
                          onChange={e => setForm({...form, jurisdiction_region: e.target.value})}
                          className={'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ' + (errors.jurisdiction_region ? 'border-red-400' : 'border-gray-300')}>
                          <option value="">-- Select Region --</option>
                          {regions.map(function(r) {
                            return <option key={r.id} value={r.id}>{r.name}</option>;
                          })}
                        </select>
                        {errors.jurisdiction_region && <p className="text-red-500 text-xs mt-1">{errors.jurisdiction_region}</p>}
                      </div>
                    )}

                    {['DIVISIONAL_OFF', 'SUBDIV_OFF', 'SURVEYOR'].includes(form.role) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department {form.role === 'DIVISIONAL_OFF' ? '*' : ''}
                        </label>
                        <select value={form.jurisdiction_department}
                          onChange={e => setForm({...form, jurisdiction_department: e.target.value})}
                          disabled={!form.jurisdiction_region}
                          className={'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-100 ' + (errors.jurisdiction_department ? 'border-red-400' : 'border-gray-300')}>
                          <option value="">-- Select Department --</option>
                          {departments.map(function(d) {
                            return <option key={d.id} value={d.id}>{d.name}</option>;
                          })}
                        </select>
                        {errors.jurisdiction_department && <p className="text-red-500 text-xs mt-1">{errors.jurisdiction_department}</p>}
                      </div>
                    )}

                    {['SUBDIV_OFF', 'SURVEYOR'].includes(form.role) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arrondissement *</label>
                        <select value={form.jurisdiction_arrondissement}
                          onChange={e => setForm({...form, jurisdiction_arrondissement: e.target.value})}
                          disabled={!form.jurisdiction_department}
                          className={'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-100 ' + (errors.jurisdiction_arrondissement ? 'border-red-400' : 'border-gray-300')}>
                          <option value="">-- Select Arrondissement --</option>
                          {arrondissements.map(function(a) {
                            return <option key={a.id} value={a.id}>{a.name}</option>;
                          })}
                        </select>
                        {errors.jurisdiction_arrondissement && <p className="text-red-500 text-xs mt-1">{errors.jurisdiction_arrondissement}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3 border-b pb-2">Login Credentials</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input type="password" value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      className={'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ' + (errors.password ? 'border-red-400' : 'border-gray-300')}
                      placeholder="Min 8 characters" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <input type="password" value={form.password2}
                      onChange={e => setForm({...form, password2: e.target.value})}
                      className={'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ' + (errors.password2 ? 'border-red-400' : 'border-gray-300')}
                      placeholder="Repeat password" />
                    {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit"
                  className="bg-primary text-white px-8 py-2 rounded-lg hover:bg-secondary transition font-medium">
                  Create Account
                </button>
                <button type="button" onClick={() => { setShowForm(false); setErrors({}); }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff List grouped by Region */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <Users size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No staff accounts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(groupedStaff).sort().map(function(region) {
              return (
                <div key={region} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="px-6 py-3 bg-primary text-white flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="font-semibold">{region}</span>
                    <span className="ml-auto text-green-200 text-sm">{groupedStaff[region].length} staff</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Name', 'Email', 'Role', 'Jurisdiction', 'CNI', 'Phone', 'Status', 'Joined'].map(function(h) {
                            return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {groupedStaff[region].map(function(s) {
                          return (
                            <tr key={s.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium">{s.full_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
                              <td className="px-4 py-3">
                                <span className={'px-2 py-1 rounded-full text-xs font-medium ' + roleColor(s.role)}>
                                  {s.role.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {s.arrondissement_name || s.department_name || s.region_name || 'National'}
                              </td>
                              <td className="px-4 py-3 text-sm font-mono">{s.national_id || '—'}</td>
                              <td className="px-4 py-3 text-sm">{s.phone || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={'flex items-center gap-1 text-xs ' + (s.is_verified ? 'text-green-600' : 'text-red-500')}>
                                  {s.is_verified ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                  {s.is_verified ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(s.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
