import React, { useState } from 'react';
import { 
  User, Shield, Monitor, Bell, Database, ChevronDown, ChevronRight,
  Check, X, Edit2, Key, LogOut, Trash2
} from 'lucide-react';
import { mockActiveSessions, mockFirebaseAccounts } from '../data/mockData';

const SettingsPanel = ({ user }) => {
  const [expandedSection, setExpandedSection] = useState('profile');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const SettingSection = ({ id, icon: Icon, title, subtitle, badge, badgeColor, children }) => (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#15151f] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getIconColor(id)} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">{title}</h3>
              {badge && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">{subtitle}</p>
          </div>
        </div>
        {expandedSection === id ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {expandedSection === id && (
        <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
          {children}
        </div>
      )}
    </div>
  );

  const getIconColor = (id) => {
    const colors = {
      profile: 'from-cyan-500 to-blue-500',
      firebase: 'from-yellow-500 to-orange-500',
      security: 'from-green-500 to-emerald-500',
      sessions: 'from-purple-500 to-pink-500',
      notifications: 'from-blue-500 to-indigo-500'
    };
    return colors[id] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <SettingSection
        id="profile"
        icon={User}
        title="Profile"
        subtitle={`Logged in as ${user?.username}`}
        badge={user?.plan}
        badgeColor="bg-green-500/20 text-green-400"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Username</label>
              <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white">
                {user?.username}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Role</label>
              <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white capitalize">
                {user?.role}
              </div>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Telegram ID</label>
            <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-cyan-400">
              {user?.telegramId || 'Not set'}
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </SettingSection>

      {/* Firebase Accounts */}
      <SettingSection
        id="firebase"
        icon={Database}
        title="Firebase Accounts"
        subtitle={`${mockFirebaseAccounts.length} configuration(s)`}
      >
        <div className="space-y-3">
          {mockFirebaseAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
              <div>
                <p className="text-white font-medium">{account.name}</p>
                <p className="text-gray-500 text-xs">{account.projectId}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                  {account.status}
                </span>
                <button className="w-7 h-7 rounded bg-[#12121a] flex items-center justify-center text-gray-400 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button className="w-full py-2 border border-dashed border-[#3a3a4a] rounded-lg text-gray-400 text-sm hover:border-yellow-500/30 hover:text-yellow-400 transition-colors">
            + Add Firebase Account
          </button>
        </div>
      </SettingSection>

      {/* Security */}
      <SettingSection
        id="security"
        icon={Shield}
        title="Security"
        subtitle="2FA and password settings"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-gray-500 text-xs">Add an extra layer of security</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
              Enable
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
            <div>
              <p className="text-white font-medium">Change Password</p>
              <p className="text-gray-500 text-xs">Last changed 30 days ago</p>
            </div>
            <button className="px-3 py-1.5 bg-[#12121a] border border-[#3a3a4a] rounded-lg text-gray-300 text-sm hover:border-green-500/30">
              Update
            </button>
          </div>
        </div>
      </SettingSection>

      {/* Active Sessions */}
      <SettingSection
        id="sessions"
        icon={Monitor}
        title="Active Sessions"
        subtitle={`${mockActiveSessions.length}/${mockActiveSessions.length} devices logged in`}
        badge={`${mockActiveSessions.length} active`}
        badgeColor="bg-purple-500/20 text-purple-400"
      >
        <div className="space-y-3">
          {mockActiveSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    {session.device}
                    {session.current && (
                      <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs">{session.ip} • {session.location}</p>
                </div>
              </div>
              {!session.current && (
                <button className="w-7 h-7 rounded bg-[#12121a] flex items-center justify-center text-gray-400 hover:text-red-400">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection
        id="notifications"
        icon={Bell}
        title="Notifications"
        subtitle="Telegram message forwarding"
      >
        <div className="space-y-4">
          {[
            { label: 'New Device Connected', enabled: true },
            { label: 'OTP Messages', enabled: true },
            { label: 'Bank Alerts', enabled: false },
            { label: 'Security Alerts', enabled: true }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-gray-300">{item.label}</span>
              <button className={`w-10 h-6 rounded-full transition-colors ${
                item.enabled ? 'bg-blue-500' : 'bg-[#2a2a3a]'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  item.enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  );
};

export default SettingsPanel;
