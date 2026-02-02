import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Plus, Search, Smartphone, Wifi, WifiOff, Key,
  Lock, Send, Trash2, FileText, Eye, ChevronDown, Battery, X
} from 'lucide-react';
import { getDevices, getDeviceStats, createDevice, updateDevice, deleteDevice } from '../services/api';

const DevicePanel = ({ user }) => {
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, pin: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', model: '', note: '' });
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [devicesRes, statsRes] = await Promise.all([
        getDevices(user.id),
        getDeviceStats(user.id)
      ]);
      setDevices(devicesRes.data);
      setStats(statsRes.data);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const handleAddDevice = async () => {
    try {
      await createDevice(user.id, newDevice);
      setShowAddModal(false);
      setNewDevice({ name: '', model: '', note: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to add device:', err);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deleteDevice(deviceId);
        fetchData();
      } catch (err) {
        console.error('Failed to delete device:', err);
      }
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || device.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ value, label, icon: Icon, color }) => (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6 flex flex-col items-center justify-center">
      <Icon className={`w-6 h-6 ${color} mb-2`} />
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-gray-500 text-xs uppercase tracking-wider mt-1">{label}</span>
    </div>
  );

  const getBatteryColor = (level) => {
    if (level >= 60) return 'text-green-400 bg-green-500/20';
    if (level >= 30) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard value={stats.total} label="Total" icon={Smartphone} color="text-blue-400" />
        <StatCard value={stats.online} label="Online" icon={Wifi} color="text-cyan-400" />
        <StatCard value={stats.offline} label="Offline" icon={WifiOff} color="text-red-400" />
        <StatCard value={stats.pin} label="PIN" icon={Key} color="text-yellow-400" />
      </div>

      {/* Filters */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg text-gray-300 text-sm hover:border-cyan-500/30 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Status:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 bg-[#1a1a25] border border-[#3a3a4a] rounded text-gray-300 text-sm"
              >
                <option value="All">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm">Updated: {lastUpdated}</span>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-1.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Device Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="w-full py-3 bg-[#12121a] border border-[#2a2a3a] border-dashed rounded-xl text-gray-400 flex items-center justify-center gap-2 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
      >
        <Plus className="w-5 h-5" />
        Add New Device
      </button>

      {/* Device Table */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a3a]">
              <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">Device</th>
              <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">UPI PIN</th>
              <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">Battery</th>
              <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">Last Seen</th>
              <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">Note</th>
              <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device, idx) => (
              <tr key={device.id} className="border-b border-[#1a1a25] hover:bg-[#15151f] transition-colors">
                <td className="px-4 py-4">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a25] flex items-center justify-center text-gray-400 text-xs">
                    {idx + 1}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                      device.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    {device.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-white font-medium">{device.name}</p>
                    <p className="text-gray-500 text-xs">{device.model}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {device.upi_pin ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                      {device.upi_pin}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-pink-400 text-xs">
                      <Key className="w-3 h-3" />
                      No PIN
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getBatteryColor(device.battery)}`}>
                    <Battery className="w-3 h-3" />
                    {device.battery}%
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-400 text-sm">{device.last_seen}</td>
                <td className="px-4 py-4 text-gray-500 text-sm">{device.note || '-'}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleDeleteDevice(device.id)}
                      className="w-7 h-7 rounded flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDevices.length === 0 && (
          <div className="p-12 text-center">
            <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{loading ? 'Loading devices...' : 'No devices found'}</p>
            <p className="text-gray-500 text-sm mt-2">Add Firebase account to connect devices</p>
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                Add New Device
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Device Name</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., Redmi Note 12"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Model</label>
                <input
                  type="text"
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., redmi note 12 pro"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Note (Optional)</label>
                <input
                  type="text"
                  value={newDevice.note}
                  onChange={(e) => setNewDevice({...newDevice, note: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., Main device"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-gray-300 font-medium hover:bg-[#20202a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDevice}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-all"
              >
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicePanel;
