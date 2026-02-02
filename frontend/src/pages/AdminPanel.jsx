import React, { useState } from 'react';
import { 
  Users, Plus, Search, Edit2, Trash2, Calendar, Shield,
  User, Key, Clock, Check, X, AlertTriangle
} from 'lucide-react';
import { mockUsers } from '../data/mockData';

const AdminPanel = () => {
  const [clients, setClients] = useState(mockUsers.filter(u => u.role === 'client'));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newClient, setNewClient] = useState({
    username: '',
    password: '',
    plan: 'Basic',
    expiryDate: '',
    telegramId: ''
  });

  const handleCreateClient = () => {
    const client = {
      id: Date.now().toString(),
      ...newClient,
      role: 'client',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients([...clients, client]);
    setShowCreateModal(false);
    setNewClient({ username: '', password: '', plan: 'Basic', expiryDate: '', telegramId: '' });
  };

  const handleDeleteClient = (id) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const getDaysLeft = (date) => {
    if (!date) return 'Unlimited';
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    return `${diff} days left`;
  };

  const filteredClients = clients.filter(c => 
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-sm">Manage clients and subscriptions</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-medium hover:from-pink-400 hover:to-purple-500 transition-all shadow-lg shadow-pink-500/25"
          >
            <Plus className="w-5 h-5" />
            Create Client
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Clients', value: clients.length, color: 'text-blue-400', icon: Users },
            { label: 'Active', value: clients.filter(c => !isExpired(c.expiryDate)).length, color: 'text-green-400', icon: Check },
            { label: 'Expired', value: clients.filter(c => isExpired(c.expiryDate)).length, color: 'text-red-400', icon: X },
            { label: 'Premium', value: clients.filter(c => c.plan === 'Premium').length, color: 'text-yellow-400', icon: Shield }
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-[#1a1a25] flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Clients Table */}
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase">Username</th>
                <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase">Expiry Date</th>
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
                        {client.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{client.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      client.plan === 'Premium' 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {client.plan}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {client.expiryDate || 'No expiry'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {isExpired(client.expiryDate) ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Expired
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        <Check className="w-3 h-3" />
                        {getDaysLeft(client.expiryDate)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-cyan-400 text-sm">
                    {client.telegramId || '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingClient(client)}
                        className="w-8 h-8 rounded bg-[#1a1a25] flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="w-8 h-8 rounded bg-[#1a1a25] flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredClients.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No clients found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-pink-400" />
              Create New Client
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={newClient.username}
                    onChange={(e) => setNewClient({...newClient, username: e.target.value})}
                    className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={newClient.password}
                    onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                    className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Plan</label>
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
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Expiry Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="date"
                    value={newClient.expiryDate}
                    onChange={(e) => setNewClient({...newClient, expiryDate: e.target.value})}
                    className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Telegram ID</label>
                <input
                  type="text"
                  value={newClient.telegramId}
                  onChange={(e) => setNewClient({...newClient, telegramId: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50"
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-gray-300 font-medium hover:bg-[#20202a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClient}
                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-medium hover:from-pink-400 hover:to-purple-500 transition-all"
              >
                Create Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
