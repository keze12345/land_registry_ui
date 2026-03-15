import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN')             navigate('/admin');
      else if (user.role === 'SURVEYOR')     navigate('/surveyor');
      else if (user.role === 'GOV_OFFICIAL') navigate('/official');
      else navigate('/buyer');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-4">
              <MapPin className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Cameroon Land Registry</h1>
          <p className="text-gray-500 mt-1">Ministry of State Property, Surveys and Land Tenure</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="your@email.com" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Want to buy land in Cameroon?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create a Buyer Account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Republic of Cameroon — Secure Land Registry System
        </p>
      </div>
    </div>
  );
}
