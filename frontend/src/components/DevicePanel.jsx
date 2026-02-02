import React, { useState } from 'react';
import { 
  RefreshCw, Plus, Search, Smartphone, Wifi, WifiOff, Key,
  Lock, Send, Trash2, FileText, Eye, ChevronDown, Battery
} from 'lucide-react';
import { mockDevices, mockStats } from '../data/mockData';

const DevicePanel = () => {
  const [devices, setDevices] = useState(mockDevices);
  const [stats] = useState(mockStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCount, setShowCount] = useState(100);
  const [lastUpdated] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.model.toLowerCase().includes(searchTerm.toLowerCase());
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
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded bg-[#1a1a25] border-[#3a3a4a]" />
            </label>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg text-gray-300 text-sm hover:border-cyan-500/30 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            {/* Dropdowns */}
            {[{ label: 'Status', value: statusFilter }, { label: 'Checked', value: 'All' }, { label: 'Notes', value: 'All' }, { label: 'PIN', value: 'All' }].map((filter, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">{filter.label}:</span>
                <button className="flex items-center gap-1 px-2 py-1 bg-[#1a1a25] border border-[#3a3a4a] rounded text-gray-300 text-sm">
                  {filter.value}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Show:</span>
              <button className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-sm font-medium">
                {showCount}
                <ChevronDown className="w-3 h-3" />
              </button>
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

      {/* Create Folder Button */}
      <button className="w-full py-3 bg-[#12121a] border border-[#2a2a3a] border-dashed rounded-xl text-gray-400 flex items-center justify-center gap-2 hover:border-cyan-500/30 hover:text-cyan-400 transition-all">
        <Plus className="w-5 h-5" />
        Create Folder
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
                    <p className="text-white font-medium">{device.device}</p>
                    <p className="text-gray-500 text-xs">{device.model}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {device.upiPin ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                      {device.upiPin}
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
                <td className="px-4 py-4 text-gray-400 text-sm">{device.lastSeen}</td>
                <td className="px-4 py-4 text-gray-500 text-sm">{device.note}</td>
                <td className="px-4 py-4 text-gray-400 text-sm">{device.added}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    {[
                      { icon: Lock, color: 'text-yellow-400 hover:bg-yellow-500/20' },
                      { icon: Send, color: 'text-blue-400 hover:bg-blue-500/20' },
                      { icon: Trash2, color: 'text-red-400 hover:bg-red-500/20' },
                      { icon: FileText, color: 'text-purple-400 hover:bg-purple-500/20' },
                      { icon: Eye, color: 'text-cyan-400 hover:bg-cyan-500/20' }
                    ].map((action, i) => (
                      <button key={i} className={`w-7 h-7 rounded flex items-center justify-center ${action.color} transition-colors`}>
                        <action.icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DevicePanel;
