import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowUpDown, Tag, Star, Trash2, Archive, RefreshCw
} from 'lucide-react';
import { getSms } from '../services/api';

const MagicSort = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [sortBy, setSortBy] = useState('time');
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getSms(user.id, 100);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchMessages();
  }, [user]);

  const sortOptions = [
    { id: 'time', label: 'Time', icon: ArrowUpDown },
    { id: 'type', label: 'Type', icon: Tag },
    { id: 'starred', label: 'Starred', icon: Star }
  ];

  // Calculate counts by type
  const otpCount = messages.filter(m => m.msg_type === 'otp').length;
  const bankCount = messages.filter(m => m.msg_type === 'bank').length;
  const paymentCount = messages.filter(m => m.msg_type === 'payment').length;
  const generalCount = messages.filter(m => m.msg_type === 'general').length;

  const quickFilters = [
    { label: 'OTP Messages', count: otpCount, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { label: 'Bank Alerts', count: bankCount, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { label: 'Payment', count: paymentCount, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { label: 'General', count: generalCount, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
  ];

  // Sort messages
  const sortedMessages = [...messages].sort((a, b) => {
    if (sortBy === 'time') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else if (sortBy === 'type') {
      return a.msg_type.localeCompare(b.msg_type);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Magic Sort Header */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Magic Sort</h2>
              <p className="text-gray-400 text-sm">Smart message organization and filtering</p>
            </div>
          </div>
          <button 
            onClick={fetchMessages}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg text-gray-300 text-sm hover:border-yellow-500/30 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-4 gap-3">
          {quickFilters.map((filter, idx) => (
            <button key={idx} className={`px-4 py-3 rounded-lg border ${filter.color} text-sm font-medium transition-all hover:scale-105`}>
              <span className="block text-lg font-bold">{filter.count}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Sort by:</span>
            {sortOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sortBy === opt.id
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a25]'
                }`}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg text-gray-400 text-sm hover:text-white transition-colors">
              <Archive className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg text-gray-400 text-sm hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sorted Messages */}
      {sortedMessages.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {sortedMessages.map((msg) => (
            <div key={msg.id} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 hover:border-yellow-500/30 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-white font-medium">{msg.sender}</span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star className="w-4 h-4 text-gray-500 hover:text-yellow-400" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{msg.message}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{msg.device_name}</span>
                <span className="text-gray-600 text-xs">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-12 text-center">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{loading ? 'Loading messages...' : 'No messages to sort'}</p>
          <p className="text-gray-500 text-sm mt-2">Messages will appear here when received</p>
        </div>
      )}
    </div>
  );
};

export default MagicSort;
