import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-[#0f172a]">
                FortiGate Spartan Wizard 🏛️⚔️
              </h1>
              <p className="text-[#0f172a]/70 text-sm mt-1">
                Precision. Excellence. No compromise.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-[#0f172a]">{user?.username}</p>
                <p className="text-xs text-[#0f172a]/70">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Configuration Card */}
          <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6 hover:border-[#06b6d4] transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#22d3ee]">New Configuration</h3>
              <span className="text-3xl group-hover:scale-110 transition-transform">⚙️</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Create a new FortiGate configuration using the wizard
            </p>
            <button
              onClick={() => navigate('/dashboard/wizard')}
              className="w-full py-2 px-4 bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-[#0f172a] font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Start Wizard
            </button>
          </div>

          {/* Library Card */}
          <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6 hover:border-[#06b6d4] transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#22d3ee]">My Configurations</h3>
              <span className="text-3xl group-hover:scale-110 transition-transform">📚</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              View and manage your saved configurations
            </p>
            <button
              onClick={() => navigate('/dashboard/library')}
              className="w-full py-2 px-4 bg-[#334155] text-white font-bold rounded-lg hover:bg-[#475569] transition-colors"
            >
              View Library
            </button>
          </div>

          {/* Templates Card */}
          <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6 hover:border-[#06b6d4] transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#22d3ee]">Templates</h3>
              <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Browse and use pre-built configuration templates
            </p>
            <button className="w-full py-2 px-4 bg-[#334155] text-white font-bold rounded-lg hover:bg-[#475569] transition-colors">
              Browse Templates
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Configurations</p>
                <p className="text-3xl font-bold text-[#22d3ee] mt-1">0</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Templates Created</p>
                <p className="text-3xl font-bold text-[#22d3ee] mt-1">0</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Last Activity</p>
                <p className="text-lg font-bold text-[#22d3ee] mt-1">Just now</p>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-gradient-to-r from-[#06b6d4]/10 to-[#22d3ee]/10 border-2 border-[#06b6d4]/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-[#22d3ee] mb-4">
            Welcome to FortiGate Spartan Wizard! 🏛️⚔️
          </h2>
          <p className="text-gray-300 mb-4">
            This enterprise-grade configuration wizard helps you create, manage, and export FortiGate
            configurations with precision and excellence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="font-bold text-white mb-1">Multi-format Export</h3>
                <p className="text-sm text-gray-400">
                  Export as CLI scripts, JSON, YAML, or documentation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-bold text-white mb-1">Version Control</h3>
                <p className="text-sm text-gray-400">
                  Track changes and restore previous configurations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <h3 className="font-bold text-white mb-1">Team Collaboration</h3>
                <p className="text-sm text-gray-400">Share configurations and templates with your team</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-bold text-white mb-1">Enterprise Ready</h3>
                <p className="text-sm text-gray-400">
                  Built for production with security and audit logging
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
