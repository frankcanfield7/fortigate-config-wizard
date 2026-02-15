import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../../utils/api';
import type { ConfigurationCreate, ConfigurationUpdate, IPsecRemoteAccessConfig, TunnelConfig, UserGroupConfig } from '../../types';
import { createDefaultIPsecRemoteAccessConfig } from '../../types';
import IPsecRemoteAccessForm from './sections/IPsecRemoteAccessForm';
import SecurityScore from './sections/SecurityScore';
import OutputPanel from './output/OutputPanel';

const ConfigWizard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [formData, setFormData] = useState<IPsecRemoteAccessConfig>(createDefaultIPsecRemoteAccessConfig());

  // Fetch existing configuration if editing
  const { data: existingConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['configuration', id],
    queryFn: () => configApi.getById(Number(id)),
    enabled: isEditMode,
    staleTime: 0, // Always fetch fresh data when entering edit mode
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
    onSuccess: async () => {
      // Invalidate cache so fresh data loads on library page
      await queryClient.invalidateQueries({ queryKey: ['configurations'] });
      navigate('/dashboard/library');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to save configuration');
    },
  });

  // Update mutation
  const updateConfigMutation = useMutation({
    mutationFn: (data: ConfigurationUpdate) => configApi.update(Number(id), data),
    onSuccess: () => {
      // Invalidate cache so fresh data loads next time
      queryClient.invalidateQueries({ queryKey: ['configuration', id] });
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      navigate('/dashboard/library');
    },
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
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-950 to-red-900 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-red-300/70 hover:text-white transition-colors mb-1 flex items-center gap-1 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Dashboard
              </button>
              <h1 className="text-2xl font-medium text-white">
                {isEditMode ? 'Edit VPN Configuration' : 'IPSEC Remote Access VPN'}
              </h1>
              <p className="text-red-300/50 text-xs mt-0.5">
                FortiOS 7.4.11+ &bull; Entra ID SAML Authentication
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SecurityScore config={formData} />
              <button
                onClick={handleSave}
                disabled={isSaving || isLoadingConfig}
                className="px-5 py-2.5 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {isEditMode && isLoadingConfig && (
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-12 mb-6 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4" />
            <p className="text-red-400 font-medium">Loading configuration...</p>
          </div>
        )}

        {!isLoadingConfig && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left Column: Form (3/5 width) */}
            <div className="xl:col-span-3 space-y-6">
              {/* Configuration Name/Description */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">
                      Configuration Name *
                    </label>
                    <input
                      type="text"
                      value={configName}
                      onChange={e => setConfigName(e.target.value)}
                      placeholder="e.g., HQ Remote Access VPN"
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500/40 focus:border-red-600 hover:border-neutral-400 hover:bg-neutral-800/80 hover:shadow-[0_0_12px_rgba(120,120,120,0.06)] transition-all duration-200 text-sm"
                    />
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">A descriptive name to identify this config in the library.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={configDescription}
                      onChange={e => setConfigDescription(e.target.value)}
                      placeholder="Brief description of this configuration..."
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500/40 focus:border-red-600 hover:border-neutral-400 hover:bg-neutral-800/80 hover:shadow-[0_0_12px_rgba(120,120,120,0.06)] transition-all duration-200 text-sm"
                    />
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">Notes about this configuration's purpose, site, or client.</p>
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

            {/* Right Column: Output Panel (2/5 width, sticky) */}
            <div className="xl:col-span-2">
              <div className="xl:sticky xl:top-6">
                <OutputPanel config={formData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigWizard;
