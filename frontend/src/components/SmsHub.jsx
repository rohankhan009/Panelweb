import React, { useState } from 'react';
import { 
  Search, Filter, MessageSquare, Smartphone, Clock, 
  CreditCard, Mail, ChevronDown, RefreshCw
} from 'lucide-react';
import { mockSmsMessages } from '../data/mockData';

const SmsHub = () => {
  const [messages] = useState(mockSmsMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const getTypeIcon = (type) => {
    switch (type) {
      case 'otp': return { icon: Mail, color: 'text-purple-400 bg-purple-500/20' };
      case 'bank': return { icon: CreditCard, color: 'text-green-400 bg-green-500/20' };
      case 'payment': return { icon: CreditCard, color: 'text-blue-400 bg-blue-500/20' };
      default: return { icon: MessageSquare, color: 'text-gray-400 bg-gray-500/20' };
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || msg.type === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg text-gray-300 text-sm hover:border-green-500/30 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Type:</span>
              <button className="flex items-center gap-1 px-2 py-1 bg-[#1a1a25] border border-[#3a3a4a] rounded text-gray-300 text-sm">
                {typeFilter}
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Device:</span>
              <button className="flex items-center gap-1 px-2 py-1 bg-[#1a1a25] border border-[#3a3a4a] rounded text-gray-300 text-sm">
                All
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-[#1a1a25] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-1.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50"
            />
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => {
          const typeInfo = getTypeIcon(msg.type);
          return (
            <div key={msg.id} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 hover:border-green-500/30 transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
                  <typeInfo.icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{msg.sender}</span>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Smartphone className="w-3 h-3" />
                      {msg.device}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">{msg.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${typeInfo.color}`}>
                      {msg.type}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMessages.length === 0 && (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No messages found</p>
        </div>
      )}
    </div>
  );
};

export default SmsHub;
