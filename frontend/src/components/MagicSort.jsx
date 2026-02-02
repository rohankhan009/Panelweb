import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Wifi, Users, Play, Zap
} from 'lucide-react';
import { getDevices, getDeviceStats } from '../services/api';

const MagicSort = ({ user }) => {
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, pin: 0 });
  const [filter, setFilter] = useState('online');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);

  const fetchData = async () => {
    try {
      const [devicesRes, statsRes] = await Promise.all([
        getDevices(user.id),
        getDeviceStats(user.id)
      ]);
      setDevices(devicesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const handleStartScan = () => {
    setScanning(true);
    setScanResults([]);
    
    setTimeout(() => {
      setScanning(false);
      setScanResults([
        { device: 'Device 1', type: 'UPI', amount: '₹500', time: 'Just now' },
        { device: 'Device 2', type: 'Bank', amount: '₹1,200', time: '2 min ago' }
      ]);
    }, 3000);
  };

  const filteredCount = filter === 'online' ? stats.online : stats.total;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Magic Scan Card */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Magic Scan</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Scan devices for financial activity</p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="inline-flex bg-[#1a1a25] rounded-lg p-1 mb-6">
          <button
            onClick={() => setFilter('online')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              filter === 'online'
                ? 'bg-[#12121a] text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <Wifi className="w-4 h-4" />
            <span className="hidden sm:inline">ONLINE</span>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-[#12121a] text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            ALL
          </button>
        </div>

        {/* Scan Status Card */}
        <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Ready to Scan</p>
              <p className="text-gray-500 text-xs sm:text-sm">{filteredCount} {filter} devices will be scanned</p>
            </div>
          </div>

          <button
            onClick={handleStartScan}
            disabled={scanning || filteredCount === 0}
            className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              scanning 
                ? 'bg-yellow-500/50 text-yellow-200 cursor-wait'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-400 hover:to-orange-400 shadow-lg shadow-yellow-500/25'
            }`}
          >
            <Play className="w-4 h-4" fill="currentColor" />
            {scanning ? 'SCANNING...' : 'START SCAN'}
          </button>
        </div>
      </div>

      {/* Scanning Animation */}
      {scanning && (
        <div className="bg-[#12121a] border border-yellow-500/30 rounded-xl p-6 sm:p-8 text-center">
          <div className="relative w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto w-6 sm:w-8 h-6 sm:h-8 text-yellow-400" />
          </div>
          <p className="text-white font-semibold text-base sm:text-lg">Scanning Devices...</p>
          <p className="text-gray-400 text-xs sm:text-sm">Looking for financial activity</p>
        </div>
      )}

      {/* Scan Results */}
      {!scanning && scanResults.length > 0 && (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold mb-4">Scan Results</h3>
          <div className="space-y-3">
            {scanResults.map((result, idx) => (
              <div key={idx} className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3 sm:p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{result.device}</p>
                  <p className="text-gray-500 text-xs sm:text-sm">{result.type} Transaction</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{result.amount}</p>
                  <p className="text-gray-500 text-xs">{result.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!scanning && scanResults.length === 0 && (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-8 sm:p-12 text-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[#1a1a25] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 sm:w-10 h-8 sm:h-10 text-gray-600" />
          </div>
          <p className="text-gray-400">No scan results yet</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Click "Start Scan" to scan devices</p>
        </div>
      )}
    </div>
  );
};

export default MagicSort;
