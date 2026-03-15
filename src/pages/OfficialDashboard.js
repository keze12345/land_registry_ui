import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/config';
import { CheckCircle, XCircle, Award, Users } from 'lucide-react';

export default function OfficialDashboard() {
  const [plots, setPlots]               = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [unverifiedBuyers, setUnverifiedBuyers] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('plots');
  const [message, setMessage]           = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [plotsRes, txRes, certRes, buyersRes] = await Promise.all([
        API.get('/plots/'),
        API.get('/transactions/'),
        API.get('/certificates/'),
        API.get('/accounts/buyers/unverified/')
      ]);
      setPlots(plotsRes.data.results || []);
      setTransactions(txRes.data.results || []);
      setCertificates(certRes.data.results || []);
      setUnverifiedBuyers(buyersRes.data.results || []);
    } catch {}
    finally { setLoading(false); }
  };

  const verifyPlot = async (plotId, status) => {
    const titleNumber = status === 'APPROVED' ? 'TIT-CM-' + Date.now() : '';
    const rejection   = status === 'REJECTED' ? prompt('Enter rejection reason:') : '';
    try {
      await API.post('/plots/' + plotId + '/verify/', {
        status, title_number: titleNumber, rejection_reason: rejection || ''
      });
      setMessage('Plot ' + plotId + ' has been ' + status);
      fetchData();
    } catch (err) {
      setMessage((err.response && err.response.data && err.response.data.error) || 'Error updating plot');
    }
  };

  const approveTransaction = async (txRef, status) => {
    const rejection = status === 'REJECTED' ? prompt('Enter rejection reason:') : '';
    try {
      await API.post('/transactions/' + txRef + '/approve/', {
        status, rejection_reason: rejection || ''
      });
      setMessage('Transaction ' + txRef + ' has been ' + status);
      fetchData();
    } catch (err) {
      setMessage((err.response && err.response.data && err.response.data.error) || 'Error updating transaction');
    }
  };

  const generateCertificate = async (plotId) => {
    try {
      const res = await API.post('/certificates/generate/' + plotId + '/');
      setMessage('Certificate ' + res.data.certificate.certificate_no + ' generated successfully!');
      fetchData();
    } catch (err) {
      setMessage((err.response && err.response.data && err.response.data.error) || 'Error generating certificate');
    }
  };

  const verifyBuyer = async (userId, buyerName) => {
    try {
      await API.post('/accounts/buyers/' + userId + '/verify/');
      setMessage(buyerName + ' has been verified successfully!');
      fetchData();
    } catch (err) {
      setMessage((err.response && err.response.data && err.response.data.error) || 'Error verifying buyer');
    }
  };

  const getCertificate = (plotId) => {
    return certificates.find(function(c) { return c.plot_id === plotId; });
  };

  const pendingPlots = plots.filter(function(p) { return p.status === 'PENDING'; });
  const pendingTx    = transactions.filter(function(t) { return t.status === 'INITIATED' || t.status === 'PENDING'; });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Government Official Dashboard</h2>
          <p className="text-gray-500">Review and approve land registrations, transactions and buyer accounts</p>
        </div>

        {message && (
          <div className={'p-4 rounded-lg mb-6 border ' + (message.includes('success') || message.includes('APPROVED') || message.includes('COMPLETED') || message.includes('verified') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')}>
            {message}
            <button onClick={() => setMessage('')} className="float-right text-gray-400 hover:text-gray-600">x</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Plots',         value: plots.length,              color: 'bg-blue-50 text-blue-700' },
            { label: 'Pending Plots',        value: pendingPlots.length,       color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Pending Transfers',    value: pendingTx.length,          color: 'bg-orange-50 text-orange-700' },
            { label: 'Certificates',         value: certificates.length,       color: 'bg-green-50 text-green-700' },
            { label: 'Unverified Buyers',    value: unverifiedBuyers.length,   color: 'bg-red-50 text-red-700' },
          ].map(function(stat, i) {
            return (
              <div key={i} className={stat.color + ' rounded-xl p-4 text-center'}>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm font-medium mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'plots',        label: 'Plots (' + pendingPlots.length + ' pending)' },
            { key: 'transactions', label: 'Transactions (' + pendingTx.length + ' pending)' },
            { key: 'certificates', label: 'Certificates (' + certificates.length + ')' },
            { key: 'buyers',       label: 'Buyers (' + unverifiedBuyers.length + ' unverified)' },
          ].map(function(tab) {
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={'px-4 py-2 rounded-lg font-medium transition ' + (activeTab === tab.key ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Plots Tab */}
        {activeTab === 'plots' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">All Land Plots ({plots.length})</h3>
            </div>
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Plot ID', 'Owner', 'Location', 'Area', 'Status', 'Actions'].map(function(h) {
                        return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plots.map(function(plot) {
                      var cert = getCertificate(plot.plot_id);
                      return (
                        <tr key={plot.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{plot.plot_id}</td>
                          <td className="px-4 py-3 text-sm">{plot.owner_name}</td>
                          <td className="px-4 py-3 text-sm">{plot.full_location}</td>
                          <td className="px-4 py-3 text-sm">{plot.area_sqm} m²</td>
                          <td className="px-4 py-3">
                            <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (
                              plot.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              plot.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              plot.status === 'SOLD'     ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700')}>
                              {plot.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {plot.status === 'PENDING' && (
                                <React.Fragment>
                                  <button onClick={() => verifyPlot(plot.plot_id, 'APPROVED')}
                                    className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition">
                                    <CheckCircle size={12} /> Approve
                                  </button>
                                  <button onClick={() => verifyPlot(plot.plot_id, 'REJECTED')}
                                    className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition">
                                    <XCircle size={12} /> Reject
                                  </button>
                                </React.Fragment>
                              )}
                              {(plot.status === 'APPROVED' || plot.status === 'SOLD') && (
                                cert ? (
                                  <a href={'http://127.0.0.1:8000/api/v1/certificates/download/' + cert.certificate_no + '/'}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1 bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition">
                                    <Award size={12} /> Download Certificate
                                  </a>
                                ) : (
                                  <button onClick={() => generateCertificate(plot.plot_id)}
                                    className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition">
                                    <Award size={12} /> Generate Certificate
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">All Transactions ({transactions.length})</h3>
            </div>
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Ref', 'Plot', 'Seller', 'Buyer', 'Price', 'Status', 'Actions'].map(function(h) {
                        return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map(function(tx) {
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{tx.transaction_ref}</td>
                          <td className="px-4 py-3 text-xs">{tx.plot_details && tx.plot_details.plot_id}</td>
                          <td className="px-4 py-3 text-sm">{tx.seller_name}</td>
                          <td className="px-4 py-3 text-sm">{tx.buyer_name}</td>
                          <td className="px-4 py-3 text-sm">{parseInt(tx.sale_price).toLocaleString()} XAF</td>
                          <td className="px-4 py-3">
                            <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (
                              tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              tx.status === 'REJECTED'  ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700')}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {(tx.status === 'INITIATED' || tx.status === 'PENDING') && (
                              <div className="flex gap-2">
                                <button onClick={() => approveTransaction(tx.transaction_ref, 'APPROVED')}
                                  className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition">
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button onClick={() => approveTransaction(tx.transaction_ref, 'REJECTED')}
                                  className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition">
                                  <XCircle size={12} /> Reject
                                </button>
                              </div>
                            )}
                            {tx.status !== 'INITIATED' && tx.status !== 'PENDING' && (
                              <span className="text-xs text-gray-400">No action needed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Issued Certificates ({certificates.length})</h3>
            </div>
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> :
             certificates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No certificates issued yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Certificate No', 'Plot ID', 'Owner', 'Location', 'Status', 'Issued Date', 'Actions'].map(function(h) {
                        return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {certificates.map(function(cert) {
                      return (
                        <tr key={cert.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{cert.certificate_no}</td>
                          <td className="px-4 py-3 font-mono text-xs">{cert.plot_id}</td>
                          <td className="px-4 py-3 text-sm">{cert.owner_name}</td>
                          <td className="px-4 py-3 text-sm">{cert.location}</td>
                          <td className="px-4 py-3">
                            <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (
                              cert.status === 'ACTIVE'  ? 'bg-green-100 text-green-700' :
                              cert.status === 'REVOKED' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700')}>
                              {cert.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(cert.issued_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <a href={'http://127.0.0.1:8000/api/v1/certificates/download/' + cert.certificate_no + '/'}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition w-fit">
                              <Award size={12} /> Download PDF
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Buyers Tab */}
        {activeTab === 'buyers' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">
                Unverified Buyers ({unverifiedBuyers.length}) — Pending CNI Verification
              </h3>
            </div>
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> :
             unverifiedBuyers.length === 0 ? (
              <div className="p-8 text-center">
                <Users size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No unverified buyers at this time</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['ID', 'Full Name', 'Email', 'Phone', 'CNI Number', 'Registered', 'Action'].map(function(h) {
                        return <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {unverifiedBuyers.map(function(buyer) {
                      return (
                        <tr key={buyer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{buyer.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">{buyer.full_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{buyer.email}</td>
                          <td className="px-4 py-3 text-sm">{buyer.phone}</td>
                          <td className="px-4 py-3 font-mono text-sm">{buyer.national_id || 'Not provided'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(buyer.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => verifyBuyer(buyer.id, buyer.full_name)}
                              className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition">
                              <CheckCircle size={12} /> Verify Account
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
