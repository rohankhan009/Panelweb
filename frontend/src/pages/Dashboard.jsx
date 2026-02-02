import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, MessageSquare, Sparkles, Settings, User, LogOut,
  AlertTriangle, Shield
} from 'lucide-react';
import DevicePanel from '../components/DevicePanel';
import SmsHub from '../components/SmsHub';
import MagicSort from '../components/MagicSort';
import SettingsPanel from '../components/SettingsPanel';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('device');
  const [show2FAWarning, setShow2FAWarning] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
  };

  const tabs = [
    { id: 'device', label: 'Device', icon: Smartphone, color: 'from-blue-500 to-cyan-400' },
    { id: 'sms', label: 'SMS Hub', icon: MessageSquare, color: 'from-green-500 to-emerald-400' },
    { id: 'magic', label: 'Magic Sort', icon: Sparkles, color: 'from-yellow-500 to-orange-400' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-purple-500 to-pink-400' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'device':
        return <DevicePanel />;
      case 'sms':
        return <SmsHub />;
      case 'magic':
        return <MagicSort />;
      case 'settings':
        return <SettingsPanel user={user} />;
      default:
        return <DevicePanel />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'device':
        return { title: 'Device Panel', subtitle: 'Monitor and manage your connected devices' };
      case 'sms':
        return { title: 'SMS Hub', subtitle: 'View and manage incoming messages' };
      case 'magic':
        return { title: 'Magic Sort', subtitle: 'Smart filtering and organization' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Configure your preferences' };
      default:
        return { title: 'Dashboard', subtitle: '' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* 2FA Warning Banner */}
      {show2FAWarning && (
        <div className="bg-[#1a1510] border-b border-yellow-600/30">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-yellow-500 font-semibold text-sm">2FA Not Enabled</p>
                <p className="text-yellow-600/80 text-xs">Enable 2FA to secure your account.</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-500 text-xs font-medium hover:bg-yellow-500/30 transition-colors flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Enable 2FA Now
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tabs.find(t => t.id === activeTab)?.color} flex items-center justify-center shadow-lg`}>
              {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Smartphone, { className: 'w-7 h-7 text-white' })}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{pageInfo.title}</h1>
              <p className="text-gray-400 text-sm">{pageInfo.subtitle}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/30 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#1a1a25] border border-[#3a3a4a] text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#15151f]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
