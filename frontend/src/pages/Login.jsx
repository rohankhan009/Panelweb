import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Key, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { login as loginApi } from '../services/api';

const MatrixBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="matrix-rain">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="matrix-column"
            style={{
              left: `${i * 2}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 10}s`
            }}
          >
            {[...Array(30)].map((_, j) => (
              <span
                key={j}
                className="matrix-char"
                style={{
                  animationDelay: `${j * 0.1}s`,
                  opacity: Math.random() * 0.5 + 0.1
                }}
              >
                {String.fromCharCode(0x30A0 + Math.random() * 96)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginApi(username, password);
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden p-4">
      <MatrixBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#12121a]/90 backdrop-blur-xl border border-[#2a2a3a] rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            PapiAtma Panel
          </h1>
          <p className="text-center text-pink-400/80 text-sm tracking-wider mb-8">
            {'>'} SECURE ACCESS REQUIRED
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-pink-400 text-xs font-semibold tracking-wider mb-2">
                <User className="w-4 h-4" />
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-pink-400 text-xs font-semibold tracking-wider mb-2">
                <Key className="w-4 h-4" />
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 disabled:opacity-50"
            >
              <Key className="w-5 h-5" />
              {isLoading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              SECURE CONNECTION ESTABLISHED
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </p>
            <p className="text-gray-600 text-xs mt-2">
              © 2026 Device Panel • All Access Monitored
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            made with <span className="text-pink-500">❤️</span> by PapiAtma
          </p>
          <a
            href="https://t.me/papiatma"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 border border-gray-700 rounded-full text-gray-400 text-sm hover:border-pink-500/50 hover:text-pink-400 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Tap to contact
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
