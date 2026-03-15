import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/config';
import { MapPin, User, Phone, Mail, Lock, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const [form, setForm]       = useState({
    first_name: '', last_name: '', email: '',
    phone: '', national_id: '', password: '', password2: ''
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await API.post('/accounts/register/', { ...form, role: 'BUYER' });
      setSuccess(true);
    } catch (err) {
      const data = err.response && err.response.data;
      if (data) {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="text-green-500" size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been created. To fully activate your account, please visit your nearest
            <strong> Land Registry office</strong> with your original
            <strong> CNI (Carte Nationale d'Identité)</strong> for identity verification.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-yellow-800 text-sm font-medium mb-2">What to bring to the office:</p>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>✓ Original CNI card</li>
              <li>✓ One passport photo</li>
              <li>✓ Your registration email</li>
            </ul>
          </div>
          <button onClick={() => navigate('/login')}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-secondary transition font-medium">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-4">
              <MapPin className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Buyer Account</h1>
          <p className="text-gray-500 mt-1">Cameroon Land Registry System</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-700 text-xs">
            After registration, visit a Land Registry office with your CNI to verify your account before you can initiate land purchases.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" value={form.first_name}
                  onChange={e => setForm({...form, first_name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="First name" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" value={form.last_name}
                  onChange={e => setForm({...form, last_name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Last name" required />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="email" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="your@email.com" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="text" value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g. 677123456" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNI Number (Carte Nationale d'Identité)</label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="text" value={form.national_id}
                onChange={e => setForm({...form, national_id: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g. CM123456789" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="password" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Min 8 characters" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="password" value={form.password2}
                onChange={e => setForm({...form, password2: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Repeat password" required />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          Republic of Cameroon — Secure Land Registry System
        </p>
      </div>
    </div>
  );
}
