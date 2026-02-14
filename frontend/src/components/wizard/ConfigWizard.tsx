import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { configApi } from '../../utils/api';
import type { ConfigurationCreate, ConfigurationUpdate, IPsecRemoteAccessConfig, TunnelConfig, UserGroupConfig } from '../../types';
import { createDefaultIPsecRemoteAccessConfig } from '../../types';
import IPsecRemoteAccessForm from './sections/IPsecRemoteAccessForm';
import SecurityScore from './sections/SecurityScore';
import OutputPanel from './output/OutputPanel';

const ConfigWizard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [formData, setFormData] = useState<IPsecRemoteAccessConfig>(createDefaultIPsecRemoteAccessConfig());
  const [showOutput, setShowOutput] = useState(false);

  // Fetch existing configuration if editing
  const { data: existingConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['configuration', id],
    queryFn: () => configApi.getById(Number(id)),
    enabled: isEditMode,
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (existingConfig) {
      setConfigName(existingConfig.name);
      setConfigDescription(existingConfig.description || '');
      try {
        const rawData = (existingConfig as any).data || existingConfig.data_json;
        const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        // Merge with defaults to handle any missing fields from older saved configs
        setFormData({ ...createDefaultIPsecRemoteAccessConfig(), ...parsedData });
      } catch {
        setFormData(createDefaultIPsecRemoteAccessConfig());
      }
    }
  }, [existingConfig]);

  // Create mutation
  const createConfigMutation = useMutation({
    mutationFn: (data: ConfigurationCreate) => configApi.create(data),
    onSuccess: () => navigate('/dashboard/library'),
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to save configuration');
    },
  });

  // Update mutation
  const updateConfigMutation = useMutation({
    mutationFn: (data: ConfigurationUpdate) => configApi.update(Number(id), data),
    onSuccess: () => navigate('/dashboard/library'),
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to update configuration');
    },
  });

  // Typed field updater
  const updateField = <K extends keyof IPsecRemoteAccessConfig>(field: K, value: IPsecRemoteAccessConfig[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Tunnel array operations
  const addTunnel = () => {
    setFormData(prev => ({
      ...prev,
      tunnels: [...prev.tunnels, { name: '', comments: '', wanIf: 'wan1', fqdn: '', port: '10428' }],
    }));
  };

  const removeTunnel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tunnels: prev.tunnels.filter((_, i) => i !== index),
    }));
  };

  const updateTunnel = (index: number, field: keyof TunnelConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      tunnels: prev.tunnels.map((t, i) => i === index ? { ...t, [field]: value } : t),
    }));
  };

  // User group array operations
  const addUserGroup = () => {
    setFormData(prev => ({
      ...prev,
      userGroups: [...prev.userGroups, { name: '', objId: '' }],
    }));
  };

  const removeUserGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      userGroups: prev.userGroups.filter((_, i) => i !== index),
    }));
  };

  const updateUserGroup = (index: number, field: keyof UserGroupConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      userGroups: prev.userGroups.map((g, i) => i === index ? { ...g, [field]: value } : g),
    }));
  };

  const handleSave = () => {
    if (!configName.trim()) {
      alert('Please enter a configuration name');
      return;
    }

    if (isEditMode) {
      updateConfigMutation.mutate({
        name: configName,
        description: configDescription,
        data: formData as any,
        change_description: 'Updated via wizard',
      });
    } else {
      createConfigMutation.mutate({
        config_type: 'ipsec',
        name: configName,
        description: configDescription,
        data: formData as any,
      });
    }
  };

  const isSaving = createConfigMutation.isPending || updateConfigMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-900 hover:text-slate-700 transition-colors mb-1 flex items-center gap-1 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Dashboard
              </button>
              <h1 className="text-2xl font-black text-slate-900">
                {isEditMode ? 'Edit VPN Configuration' : 'IPSEC Remote Access VPN'}
              </h1>
              <p className="text-slate-900/60 text-xs mt-0.5">
                FortiOS 7.4.11+ &bull; Entra ID SAML Authentication
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SecurityScore config={formData} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOutput(true)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold"
                >
                  Generate Output
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isLoadingConfig}
                  className="px-5 py-2.5 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors text-sm font-bold disabled:opacity-50"
                >
                  {isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {isEditMode && isLoadingConfig && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 mb-6 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 mb-4" />
            <p className="text-cyan-400 font-bold">Loading configuration...</p>
          </div>
        )}

        {!isLoadingConfig && (
          <div className="space-y-6">
            {/* Configuration Name/Description */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    Configuration Name *
                  </label>
                  <input
                    type="text"
                    value={configName}
                    onChange={e => setConfigName(e.target.value)}
                    placeholder="e.g., HQ Remote Access VPN"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={configDescription}
                    onChange={e => setConfigDescription(e.target.value)}
                    placeholder="Brief description of this configuration..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Main Form */}
            <IPsecRemoteAccessForm
              config={formData}
              updateField={updateField}
              addTunnel={addTunnel}
              removeTunnel={removeTunnel}
              updateTunnel={updateTunnel}
              addUserGroup={addUserGroup}
              removeUserGroup={removeUserGroup}
              updateUserGroup={updateUserGroup}
            />
          </div>
        )}

        {/* Output Panel */}
        {showOutput && (
          <div className="mt-6">
            <OutputPanel
              config={formData}
              onClose={() => setShowOutput(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigWizard;
