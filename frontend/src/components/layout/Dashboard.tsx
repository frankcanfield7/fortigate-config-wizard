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
      <header className="border-b border-dark-border bg-dark-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display text-2xl tracking-wide text-dark-text">
                FortiGate Spartan Wizard
              </h1>
              <p className="text-dark-muted text-sm mt-1 tracking-wide">
                Precision. Excellence. No compromise.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-dark-text">{user?.username}</p>
                <p className="text-xs text-dark-muted">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary px-4 py-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Decorative accent */}
        <div className="flex mb-8">
          <div className="w-12 h-1 bg-accent-primary/40 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade-in">
          {/* Configuration Card */}
          <div className="card-interactive rounded-lg p-6 flex flex-col group cursor-pointer"
               onClick={() => navigate('/dashboard/wizard')}>
            <h3 className="font-display text-lg tracking-wide text-dark-text/90 mb-3">
              New VPN Configuration
            </h3>
            <p className="text-dark-muted text-sm mb-4 flex-1">
              Create an IPSEC Remote Access VPN with Entra ID SAML authentication
            </p>
            <button
              className="btn-primary w-full mt-auto"
            >
              Start Wizard
            </button>
          </div>

          {/* Library Card */}
          <div className="card-interactive rounded-lg p-6 flex flex-col group cursor-pointer"
               onClick={() => navigate('/dashboard/library')}>
            <h3 className="font-display text-lg tracking-wide text-dark-text/90 mb-3">
              My Configurations
            </h3>
            <p className="text-dark-muted text-sm mb-4 flex-1">
              View and manage your saved configurations
            </p>
            <button
              className="btn-secondary w-full mt-auto"
            >
              View Library
            </button>
          </div>

          {/* Templates Card */}
          <div className="card-interactive rounded-lg p-6 flex flex-col group cursor-pointer"
               onClick={() => navigate('/dashboard/templates')}>
            <h3 className="font-display text-lg tracking-wide text-dark-text/90 mb-3">
              Templates
            </h3>
            <p className="text-dark-muted text-sm mb-4 flex-1">
              Browse and use pre-built configuration templates
            </p>
            <button
              className="btn-secondary w-full mt-auto"
            >
              Browse Templates
            </button>
          </div>

          {/* Audit Log Card (admin only) */}
          {user?.is_admin && (
            <div className="card-interactive rounded-lg p-6 flex flex-col group cursor-pointer"
                 onClick={() => navigate('/dashboard/audit-log')}>
              <h3 className="font-display text-lg tracking-wide text-dark-text/90 mb-3">
                Audit Log
              </h3>
              <p className="text-dark-muted text-sm mb-4 flex-1">
                View all user actions and system events
              </p>
              <button
                className="btn-secondary w-full mt-auto"
              >
                View Audit Log
              </button>
            </div>
          )}
        </div>

        {/* Footer accent */}
        <div className="flex justify-center mt-12">
          <div className="w-24 h-px bg-dark-border" />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
