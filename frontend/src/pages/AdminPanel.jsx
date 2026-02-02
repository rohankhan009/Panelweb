import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Search, Edit2, Trash2, Calendar, Shield,
  User, Key, Check, X, AlertTriangle, ArrowLeft, Menu
} from 'lucide-react';
import { getClients, createClient, updateClient, deleteClient, getAdminStats } from '../services/api';

const AdminPanel = ({ user }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, premium: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({
    username: '',
    password: '',
    plan: 'Basic',
    expiry_date: '',
    telegram_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, statsRes] = await Promise.all([
        getClients(),
        getAdminStats()
      ]);
      setClients(clientsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClient = async () => {
    if (!newClient.username || !newClient.password) {
      alert('Username and Password are required');
      return;
    }
    try {
      await createClient(newClient);
      setShowCreateModal(false);
      setNewClient({ username: '', password: '', plan: 'Basic', expiry_date: '', telegram_id: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create client');
    }
  };

  const handleUpdateClient = async () => {
    try {
      await updateClient(editingClient.id, {
        plan: editingClient.plan,
        expiry_date: editingClient.expiry_date,
        telegram_id: editingClient.telegram_id,
        is_active: editingClient.is_active
      });
      setEditingClient(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update client');
    }
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm('Delete this client and all their data?')) {
      try {
        await deleteClient(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete client');
      }
    }
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const getDaysLeft = (date) => {
    if (!date) return 'Unlimited';
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    return `${diff}d left`;
  };

  const filteredClients = clients.filter(c => 
    c.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-3 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Users className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">Manage clients and subscriptions</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-medium hover:from-pink-400 hover:to-purple-500 transition-all shadow-lg shadow-pink-500/25"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Client</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg pl-10 pr-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-pink-500/50"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-blue-400', icon: Users },
            { label: 'Active', value: stats.active, color: 'text-green-400', icon: Check },
            { label: 'Expired', value: stats.expired, color: 'text-red-400', icon: X },
            { label: 'Premium', value: stats.premium, color: 'text-yellow-400', icon: Shield }
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-[#1a1a25] flex items-center justify-center ${stat.color} flex-shrink-0`}>
                <stat.icon className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div>
                <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Clients - Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {client.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{client.username}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      client.plan === 'Premium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {client.plan}
                    </span>
                  </div>
                </div>
                {!client.is_active ? (
                  <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">Inactive</span>
                ) : isExpired(client.expiry_date) ? (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Expired</span>
                ) : (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">{getDaysLeft(client.expiry_date)}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{client.expiry_date || 'No expiry'}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingClient({...client})}
                    className="w-8 h-8 rounded bg-[#1a1a25] flex items-center justify-center text-blue-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="w-8 h-8 rounded bg-[#1a1a25] flex items-center justify-center text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase">Plan</th>
                  <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase">Expiry</th>
                  <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase">Telegram</th>
                  <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-[#1a1a25] hover:bg-[#15151f] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {client.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{client.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        client.plan === 'Premium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {client.plan}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-sm">
                      {client.expiry_date || 'No expiry'}
                    </td>
                    <td className="px-4 py-4">
                      {!client.is_active ? (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">Inactive</span>
                      ) : isExpired(client.expiry_date) ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Expired</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">{getDaysLeft(client.expiry_date)}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-cyan-400 text-sm">{client.telegram_id || '-'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingClient({...client})} className="w-8 h-8 rounded bg-[#1a1a25] flex items-center justify-center text-blue-400 hover:bg-blue-500/20">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClient(client.id)} className="w-8 h-8 rounded bg-[#1a1a25] flex items-center justify-center text-red-400 hover:bg-red-500/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">{loading ? 'Loading...' : 'No clients found'}</p>
            </div>
          )}
        </div>

        {/* Mobile Empty State */}
        {filteredClients.length === 0 && (
          <div className="sm:hidden bg-[#12121a] border border-[#2a2a3a] rounded-xl p-8 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{loading ? 'Loading...' : 'No clients'}</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-pink-400" />
              Create Client
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">Username *</label>
                <input
                  type="text"
                  value={newClient.username}
                  onChange={(e) => setNewClient({...newClient, username: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500/50"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">Password *</label>
                <input
                  type="text"
                  value={newClient.password}
                  onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500/50"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">Plan</label>
                <select
                  value={newClient.plan}
                  onChange={(e) => setNewClient({...newClient, plan: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500/50"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">Expiry Date</label>
                <input
                  type="date"
                  value={newClient.expiry_date}
                  onChange={(e) => setNewClient({...newClient, expiry_date: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">Telegram ID</label>
                <input
                  type="text"
                  value={newClient.telegram_id}
                  onChange={(e) => setNewClient({...newClient, telegram_id: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500/50"
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClient}
                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Edit: {editingClient.username}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">Plan</label>
                <select
                  value={editingClient.plan}
                  onChange={(e) => setEditingClient({...editingClient, plan: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">Expiry Date</label>
                <input
                  type="date"
                  value={editingClient.expiry_date || ''}
                  onChange={(e) => setEditingClient({...editingClient, expiry_date: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">Telegram ID</label>
                <input
                  type="text"
                  value={editingClient.telegram_id || ''}
                  onChange={(e) => setEditingClient({...editingClient, telegram_id: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="@username"
                />
              </div>

              <div className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
                <span className="text-gray-300">Account Active</span>
                <button
                  onClick={() => setEditingClient({...editingClient, is_active: !editingClient.is_active})}
                  className={`w-10 h-6 rounded-full ${editingClient.is_active ? 'bg-green-500' : 'bg-[#2a2a3a]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${editingClient.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button onClick={() => setEditingClient(null)} className="flex-1 py-2.5 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-gray-300 font-medium">
                Cancel
              </button>
              <button onClick={handleUpdateClient} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-medium">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
