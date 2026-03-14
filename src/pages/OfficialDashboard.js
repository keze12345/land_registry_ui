import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/config';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

export default function OfficialDashboard() {
  const [plots, setPlots]             = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('plots');
  const [message, setMessage]         = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [plotsRes, txRes] = await Promise.all([
        API.get('/plots/'),
        API.get('/transactions/')
      ]);
      setPlots(plotsRes.data.results || []);
      setTransactions(txRes.data.results || []);
    } catch {}
    finally { setLoading(false); }
  };

  const verifyPlot = async (plotId, status) => {
    const titleNumber = status === 'APPROVED' ? `TIT-CM-${Date.now()}` : '';
    const rejection   = status === 'REJECTED' ? prompt('Enter rejection reason:') : '';
    try {
      await API.post(`/plots/${plotId}/verify/`, {
        status, title_number: titleNumber, rejection_reason: rejection || ''
      });
      setMessage(`Plot ${plotId} has been ${status}`);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating plot');
    }
  };

  const approveTransaction = async (txRef, status) => {
    const rejection = status === 'REJECTED' ? prompt('Enter rejection reason:') : '';
    try {
      await API.post(`/transactions/${txRef}/approve/`, {
        status, rejection_reason: rejection || ''
      });
      setMessage(`Transaction ${txRef} has been ${status}`);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating transaction');
    }
  };

  const pendingPlots = plots.filter(p => p.status === 'PENDING');
  const pendingTx    = transactions.filter(t => t.status === 'INITIATED' || t.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Government Official Dashboard</h2>
          <p className="text-gray-500">Review and approve land registrations and transactions</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('APPROVED') || message.includes('COMPLETED') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Plots',        value: plots.length,                                      color: 'bg-blue-50 text-blue-700' },
            { label: 'Pending Plots',      value: pendingPlots.length,                               color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Total Transactions', value: transactions.length,                               color: 'bg-purple-50 text-purple-700' },
            { label: 'Pending Transfers',  value: pendingTx.length,                                  color: 'bg-orange-50 text-orange-700' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 text-center`}>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'plots',        label: `Plot Verifications (${pendingPlots.length})` },
            { key: 'transactions', label: `Transactions (${pendingTx.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === tab.key ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plots Tab */}
        {activeTab === 'plots' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">All Land Plots</h3>
            </div>
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Plot ID', 'Owner', 'Surveyor', 'Location', 'Area', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plots.map(plot => (
                      <tr key={plot.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm font-medium text-primary">{plot.plot_id}</td>
                        <td className="px-4 py-3 text-sm">{plot.owner_name}</td>
                        <td className="px-4 py-3 text-sm">{plot.surveyor_name}</td>
                        <td className="px-4 py-3 text-sm">{plot.locality}, {plot.city}</td>
                        <td className="px-4 py-3 text-sm">{plot.area_sqm} m²</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plot.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            plot.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            plot.status === 'SOLD'     ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'}`}>
                            {plot.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {plot.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button onClick={() => verifyPlot(plot.plot_id, 'APPROVED')}
                                className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition">
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button onClick={() => verifyPlot(plot.plot_id, 'REJECTED')}
                                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition">
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          )}
                          {plot.status !== 'PENDING' && (
                            <span className="text-xs text-gray-400">No action needed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">All Transactions</h3>
            </div>
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Ref', 'Plot', 'Seller', 'Buyer', 'Price', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm font-medium text-primary">{tx.transaction_ref}</td>
                        <td className="px-4 py-3 text-sm">{tx.plot_details?.plot_id}</td>
                        <td className="px-4 py-3 text-sm">{tx.seller_name}</td>
                        <td className="px-4 py-3 text-sm">{tx.buyer_name}</td>
                        <td className="px-4 py-3 text-sm">{parseInt(tx.sale_price).toLocaleString()} XAF</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            tx.status === 'REJECTED'  ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {(tx.status === 'INITIATED' || tx.status === 'PENDING') && (
                            <div className="flex gap-2">
                              <button onClick={() => approveTransaction(tx.transaction_ref, 'APPROVED')}
                                className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition">
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button onClick={() => approveTransaction(tx.transaction_ref, 'REJECTED')}
                                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition">
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          )}
                          {tx.status !== 'INITIATED' && tx.status !== 'PENDING' && (
                            <span className="text-xs text-gray-400">No action needed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
