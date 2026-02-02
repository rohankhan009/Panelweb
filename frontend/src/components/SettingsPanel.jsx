import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Monitor, Bell, Database, ChevronDown, ChevronRight,
  Edit2, Key, LogOut, Trash2, Plus, X
} from 'lucide-react';
import { 
  getFirebaseAccounts, createFirebaseAccount, deleteFirebaseAccount,
  getSessions, deleteSession 
} from '../services/api';

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

const SettingsPanel = ({ user }) => {
  const [expandedSection, setExpandedSection] = useState('profile');
  const [firebaseAccounts, setFirebaseAccounts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showAddFirebase, setShowAddFirebase] = useState(false);
  const [newFirebase, setNewFirebase] = useState({ name: '', project_id: '', api_key: '' });
  const [notifications, setNotifications] = useState([
    { label: 'New Device Connected', enabled: true },
    { label: 'OTP Messages', enabled: true },
    { label: 'Bank Alerts', enabled: false },
    { label: 'Security Alerts', enabled: true }
  ]);

  useEffect(() => {
    if (user?.id) {
      fetchFirebase();
      fetchSessions();
    }
  }, [user]);

  const fetchFirebase = async () => {
    try {
      const res = await getFirebaseAccounts(user.id);
      setFirebaseAccounts(res.data);
    } catch (err) {
      console.error('Failed to fetch firebase accounts:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await getSessions(user.id);
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const handleAddFirebase = async () => {
    try {
      await createFirebaseAccount(user.id, newFirebase);
      setShowAddFirebase(false);
      setNewFirebase({ name: '', project_id: '', api_key: '' });
      fetchFirebase();
    } catch (err) {
      console.error('Failed to add firebase:', err);
    }
  };

  const handleDeleteFirebase = async (accountId) => {
    if (window.confirm('Delete this Firebase account?')) {
      try {
        await deleteFirebaseAccount(accountId);
        fetchFirebase();
      } catch (err) {
        console.error('Failed to delete firebase:', err);
      }
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      fetchSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleNotification = (idx) => {
    const updated = [...notifications];
    updated[idx].enabled = !updated[idx].enabled;
    setNotifications(updated);
  };

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('profile')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getIconColor('profile')} flex items-center justify-center`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">Profile</h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  {user?.plan || 'Unlimited'}
                </span>
              </div>
              <p className="text-gray-500 text-sm">Logged in as {user?.username}</p>
            </div>
          </div>
          {expandedSection === 'profile' ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
        </button>
        
        {expandedSection === 'profile' && (
          <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Username</label>
                <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white">{user?.username}</div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Role</label>
                <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white capitalize">{user?.role}</div>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Telegram ID</label>
              <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-cyan-400">{user?.telegram_id || 'Not set'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Firebase Accounts */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('firebase')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getIconColor('firebase')} flex items-center justify-center`}>
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Firebase Accounts</h3>
              <p className="text-gray-500 text-sm">{firebaseAccounts.length} configuration(s)</p>
            </div>
          </div>
          {expandedSection === 'firebase' ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
        </button>
        
        {expandedSection === 'firebase' && (
          <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
            <div className="space-y-3">
              {firebaseAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{account.name}</p>
                    <p className="text-gray-500 text-xs">{account.project_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">{account.status}</span>
                    <button onClick={() => handleDeleteFirebase(account.id)} className="w-7 h-7 rounded bg-[#12121a] flex items-center justify-center text-gray-400 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setShowAddFirebase(true)}
                className="w-full py-2 border border-dashed border-[#3a3a4a] rounded-lg text-gray-400 text-sm hover:border-yellow-500/30 hover:text-yellow-400 transition-colors"
              >
                + Add Firebase Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('security')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getIconColor('security')} flex items-center justify-center`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Security</h3>
              <p className="text-gray-500 text-sm">2FA and password settings</p>
            </div>
          </div>
          {expandedSection === 'security' ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
        </button>
        
        {expandedSection === 'security' && (
          <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-gray-500 text-xs">Add an extra layer of security</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">Enable</button>
              </div>
              
              <div className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
                <div>
                  <p className="text-white font-medium">Change Password</p>
                  <p className="text-gray-500 text-xs">Last changed 30 days ago</p>
                </div>
                <button className="px-3 py-1.5 bg-[#12121a] border border-[#3a3a4a] rounded-lg text-gray-300 text-sm hover:border-green-500/30">Update</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('sessions')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getIconColor('sessions')} flex items-center justify-center`}>
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">Active Sessions</h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">{sessions.length} active</span>
              </div>
              <p className="text-gray-500 text-sm">{sessions.length} devices logged in</p>
            </div>
          </div>
          {expandedSection === 'sessions' ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
        </button>
        
        {expandedSection === 'sessions' && (
          <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active sessions</p>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium flex items-center gap-2">
                          {session.device_info}
                          {session.is_current && <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Current</span>}
                        </p>
                        <p className="text-gray-500 text-xs">{session.ip} - {session.location}</p>
                      </div>
                    </div>
                    {!session.is_current && (
                      <button onClick={() => handleDeleteSession(session.id)} className="w-7 h-7 rounded bg-[#12121a] flex items-center justify-center text-gray-400 hover:text-red-400">
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('notifications')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getIconColor('notifications')} flex items-center justify-center`}>
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Notifications</h3>
              <p className="text-gray-500 text-sm">Telegram message forwarding</p>
            </div>
          </div>
          {expandedSection === 'notifications' ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
        </button>
        
        {expandedSection === 'notifications' && (
          <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
            <div className="space-y-4">
              {notifications.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-gray-300">{item.label}</span>
                  <button 
                    onClick={() => toggleNotification(idx)}
                    className={`w-10 h-6 rounded-full transition-colors ${item.enabled ? 'bg-blue-500' : 'bg-[#2a2a3a]'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Firebase Modal */}
      {showAddFirebase && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-yellow-400" />
                Add Firebase Account
              </h2>
              <button onClick={() => setShowAddFirebase(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Account Name</label>
                <input
                  type="text"
                  value={newFirebase.name}
                  onChange={(e) => setNewFirebase({...newFirebase, name: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50"
                  placeholder="e.g., Primary Firebase"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Project ID</label>
                <input
                  type="text"
                  value={newFirebase.project_id}
                  onChange={(e) => setNewFirebase({...newFirebase, project_id: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50"
                  placeholder="e.g., my-project-12345"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">API Key</label>
                <input
                  type="text"
                  value={newFirebase.api_key}
                  onChange={(e) => setNewFirebase({...newFirebase, api_key: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50"
                  placeholder="AIza..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddFirebase(false)}
                className="flex-1 py-2.5 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-gray-300 font-medium hover:bg-[#20202a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFirebase}
                className="flex-1 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white font-medium hover:from-yellow-400 hover:to-orange-400 transition-all"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
