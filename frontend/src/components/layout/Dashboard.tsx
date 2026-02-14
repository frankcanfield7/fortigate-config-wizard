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
      <header className="bg-gradient-to-r from-red-900 to-red-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold text-white">
                FortiGate Spartan Wizard 🏛️⚔️
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Precision. Excellence. No compromise.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-white/70">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#262626] transition-colors font-medium"
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
          <div className="bg-[#262626] border-2 border-[#404040] rounded-xl p-6 hover:border-red-700 transition-all cursor-pointer group flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-red-400">New VPN Configuration</h3>
              <span className="text-3xl group-hover:scale-110 transition-transform">🔒</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 flex-1">
              Create an IPSEC Remote Access VPN with Entra ID SAML authentication
            </p>
            <button
              onClick={() => navigate('/dashboard/wizard')}
              className="w-full py-2 px-4 bg-gradient-to-r from-red-900 to-red-800 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-red-700/50 transition-all mt-auto"
            >
              Start Wizard
            </button>
          </div>

          {/* Library Card */}
          <div className="bg-[#262626] border-2 border-[#404040] rounded-xl p-6 hover:border-red-700 transition-all cursor-pointer group flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-red-400">My Configurations</h3>
              <span className="text-3xl group-hover:scale-110 transition-transform">📚</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 flex-1">
              View and manage your saved configurations
            </p>
            <button
              onClick={() => navigate('/dashboard/library')}
              className="w-full py-2 px-4 bg-[#404040] text-white font-medium rounded-lg hover:bg-[#525252] transition-colors mt-auto"
            >
              View Library
            </button>
          </div>

          {/* Templates Card */}
          <div className="bg-[#262626] border-2 border-[#404040] rounded-xl p-6 hover:border-red-700 transition-all cursor-pointer group flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-red-400">Templates</h3>
              <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 flex-1">
              Browse and use pre-built configuration templates
            </p>
            <button className="w-full py-2 px-4 bg-[#404040] text-white font-medium rounded-lg hover:bg-[#525252] transition-colors mt-auto">
              Browse Templates
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
