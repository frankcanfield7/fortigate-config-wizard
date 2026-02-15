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
    staleTime: 0,
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (existingConfig) {
      setConfigName(existingConfig.name);
      setConfigDescription(existingConfig.description || '');
      try {
        const rawData = (existingConfig as any).data || existingConfig.data_json;
        const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-surface/50 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-dark-muted hover:text-dark-text transition-colors mb-1 flex items-center gap-1 text-sm tracking-wide"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Dashboard
              </button>
              <h1 className="font-display text-2xl tracking-wide text-dark-text">
                {isEditMode ? 'Edit VPN Configuration' : 'IPSEC Remote Access VPN'}
              </h1>
              <p className="text-dark-muted text-xs mt-0.5 tracking-wide">
                FortiOS 7.4.11+ | Entra ID SAML Authentication
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SecurityScore config={formData} />
              <button
                onClick={handleSave}
                disabled={isSaving || isLoadingConfig}
                className="btn-primary"
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
          <div className="card-elevated rounded-lg p-12 mb-6 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-accent-primary mb-4" />
            <p className="text-dark-muted tracking-wide">Loading configuration...</p>
          </div>
        )}

        {!isLoadingConfig && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left Column: Form (3/5 width) */}
            <div className="xl:col-span-3 space-y-6">
              {/* Configuration Name/Description */}
              <div className="card-elevated rounded-lg p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-wide text-dark-muted uppercase mb-1.5">
                      Configuration Name *
                    </label>
                    <input
                      type="text"
                      value={configName}
                      onChange={e => setConfigName(e.target.value)}
                      placeholder="e.g., HQ Remote Access VPN"
                      className="input-field text-sm"
                    />
                    <p className="text-xs text-dark-muted mt-1.5 leading-relaxed">A descriptive name to identify this config in the library.</p>
                  </div>
                  <div>
                    <label className="block text-xs tracking-wide text-dark-muted uppercase mb-1.5">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={configDescription}
                      onChange={e => setConfigDescription(e.target.value)}
                      placeholder="Brief description of this configuration..."
                      className="input-field text-sm"
                    />
                    <p className="text-xs text-dark-muted mt-1.5 leading-relaxed">Notes about this configuration's purpose, site, or client.</p>
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
