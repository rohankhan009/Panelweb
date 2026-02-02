import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, MessageSquare, Sparkles, Settings, User, LogOut,
  AlertTriangle, Shield, Users, Menu, X
} from 'lucide-react';
import DevicePanel from '../components/DevicePanel';
import SmsHub from '../components/SmsHub';
import MagicSort from '../components/MagicSort';
import SettingsPanel from '../components/SettingsPanel';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('device');
  const [show2FAWarning, setShow2FAWarning] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
  };

  const tabs = [
    { id: 'device', label: 'Device', icon: Smartphone },
    { id: 'sms', label: 'SMS Hub', icon: MessageSquare },
    { id: 'magic', label: 'Magic Sort', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'device':
        return <DevicePanel user={user} />;
      case 'sms':
        return <SmsHub user={user} />;
      case 'magic':
        return <MagicSort user={user} />;
      case 'settings':
        return <SettingsPanel user={user} />;
      default:
        return <DevicePanel user={user} />;
    }
  };

  const getPageInfo = () => {
    switch (activeTab) {
      case 'device':
        return { title: 'Device Panel', subtitle: 'Monitor connected devices', color: 'from-blue-500 to-cyan-400' };
      case 'sms':
        return { title: 'SMS Hub', subtitle: 'View incoming messages', color: 'from-green-500 to-emerald-400' };
      case 'magic':
        return { title: 'Magic Sort', subtitle: 'Financial message analysis', color: 'from-yellow-500 to-orange-400' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Configure preferences', color: 'from-purple-500 to-pink-400' };
      default:
        return { title: 'Dashboard', subtitle: '', color: 'from-gray-500 to-gray-400' };
    }
  };

  const pageInfo = getPageInfo();
  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* 2FA Warning Banner */}
      {show2FAWarning && (
        <div className="bg-[#1a1510] border-b border-yellow-600/30">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" />
              </div>
              <div className="min-w-0">
                <p className="text-yellow-500 font-semibold text-xs sm:text-sm">2FA Not Enabled</p>
                <p className="text-yellow-600/80 text-xs hidden sm:block">Enable 2FA to secure your account.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-500 text-xs font-medium hover:bg-yellow-500/30 transition-colors flex items-center gap-1">
                <Shield className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="hidden sm:inline">Enable 2FA Now</span>
                <span className="sm:hidden">Enable</span>
              </button>
              <button 
                onClick={() => setShow2FAWarning(false)}
                className="text-yellow-600 hover:text-yellow-500 text-lg sm:text-xl leading-none p-1"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        {activeTab !== 'sms' && (
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 sm:w-14 h-10 sm:h-14 rounded-xl bg-gradient-to-br ${pageInfo.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                {currentTab && <currentTab.icon className="w-5 sm:w-7 h-5 sm:h-7 text-white" />}
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white">{pageInfo.title}</h1>
                <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">{pageInfo.subtitle}</p>
              </div>
            </div>

            {/* Desktop User Info */}
            <div className="hidden sm:flex items-center gap-3">
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-400 text-sm hover:bg-pink-500/30 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-10 h-10 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg flex items-center justify-center text-gray-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* SMS Hub Header */}
        {activeTab === 'sms' && (
          <div className="flex justify-end mb-4">
            {/* Desktop */}
            <div className="hidden sm:flex items-center gap-3">
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-400 text-sm hover:bg-pink-500/30 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
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
            {/* Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-10 h-10 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg flex items-center justify-center text-gray-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#2a2a3a]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
              </div>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-400 text-sm mb-3"
              >
                <Users className="w-4 h-4" />
                Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-gray-300 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#1a1a25] border border-[#3a3a4a] text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#15151f]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
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
