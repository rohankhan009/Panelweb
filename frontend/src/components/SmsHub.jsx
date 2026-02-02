import React, { useState, useEffect } from 'react';
import { 
  Search, Smartphone, Clock, Trash2, RefreshCw, SlidersHorizontal
} from 'lucide-react';
import { getSms, deleteSms, getDevices } from '../services/api';

const SmsHub = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalMessages] = useState(200); // Mock total limit

  const fetchData = async () => {
    try {
      setLoading(true);
      const [messagesRes, devicesRes] = await Promise.all([
        getSms(user.id),
        getDevices(user.id)
      ]);
      setMessages(messagesRes.data);
      setDevices(devicesRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const handleDelete = async (messageId) => {
    try {
      await deleteSms(messageId);
      fetchData();
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const getDeviceInfo = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device || { name: 'Unknown', model: '', status: 'offline' };
  };

  const filteredMessages = messages.filter(msg =>
    msg.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with LIVE badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">SMS HUB</h1>
          <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            LIVE
          </span>
        </div>
        <p className="text-gray-400">{messages.length} / {totalMessages} messages</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search messages, sender, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg pl-4 pr-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center text-white hover:bg-cyan-400 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-gray-300 hover:border-cyan-500/30 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-gray-300 hover:border-cyan-500/30 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => {
          const deviceInfo = getDeviceInfo(msg.device_id);
          return (
            <div key={msg.id} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 hover:border-[#3a3a4a] transition-colors">
              <div className="flex items-start gap-4">
                {/* Device Icon */}
                <div className="flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{msg.sender}</span>
                      <span className="text-gray-500 text-sm">{msg.device_name || deviceInfo.model}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs capitalize">
                        {msg.msg_type || 'Other'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        deviceInfo.status === 'online' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {deviceInfo.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Message Icon and Text */}
                  <div className="flex items-start gap-3 mb-3">
                    <Smartphone className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">{msg.message}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Smartphone className="w-3 h-3" />
                      <span>{msg.device_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{msg.timestamp}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMessages.length === 0 && (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-12 text-center">
          <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{loading ? 'Loading messages...' : 'No messages found'}</p>
          <p className="text-gray-500 text-sm mt-2">Messages from connected devices will appear here</p>
        </div>
      )}
    </div>
  );
};

export default SmsHub;
