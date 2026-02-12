import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { configApi } from '../../utils/api';
import type { ConfigurationCreate } from '../../types';
import OutputDisplay from './output/OutputDisplay';
import IPsecForm from './sections/IPsecForm';
import SdwanForm from './sections/SdwanForm';
import FirewallForm from './sections/FirewallForm';
import InterfaceForm from './sections/InterfaceForm';

// Configuration type options
const CONFIG_TYPES = [
  { value: 'ipsec', label: 'IPsec VPN', icon: '🔒' },
  { value: 'sdwan', label: 'SD-WAN', icon: '🌐' },
  { value: 'firewall', label: 'Firewall Policy', icon: '🛡️' },
  { value: 'routing', label: 'Static Routes', icon: '🗺️' },
  { value: 'interfaces', label: 'Interface Config', icon: '🔌' },
];

const ConfigWizard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('ipsec');
  const [configName, setConfigName] = useState<string>('');
  const [configDescription, setConfigDescription] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showOutput, setShowOutput] = useState<boolean>(false);

  // Mutation for creating configuration
  const createConfigMutation = useMutation({
    mutationFn: (data: ConfigurationCreate) => configApi.create(data),
    onSuccess: (data) => {
      console.log('Configuration created:', data);
      // Navigate to config library or detail view
      navigate('/dashboard/library');
    },
    onError: (error: any) => {
      console.error('Failed to create configuration:', error);
      alert(error.response?.data?.error || 'Failed to save configuration');
    },
  });

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerate = () => {
    setShowOutput(true);
  };

  const handleSave = async () => {
    if (!configName.trim()) {
      alert('Please enter a configuration name');
      return;
    }

    const configData: ConfigurationCreate = {
      config_type: selectedType,
      name: configName,
      description: configDescription,
      data: formData,
    };

    createConfigMutation.mutate(configData);
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[#0f172a] hover:text-[#1e293b] transition-colors mb-2 flex items-center gap-2"
              >
                <span>←</span> Back to Dashboard
              </button>
              <h1 className="text-3xl font-black text-[#0f172a]">
                Configuration Wizard ⚙️
              </h1>
              <p className="text-[#0f172a]/70 text-sm mt-1">
                Create FortiGate configurations with precision
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerate}
                className="px-6 py-3 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-bold"
              >
                Generate Output
              </button>
              <button
                onClick={handleSave}
                disabled={createConfigMutation.isPending}
                className="px-6 py-3 bg-white text-[#0f172a] rounded-lg hover:bg-gray-100 transition-colors font-bold disabled:opacity-50"
              >
                {createConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Type Selection */}
        <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-[#22d3ee] mb-4">
            Step 1: Select Configuration Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CONFIG_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedType === type.value
                    ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                    : 'border-[#334155] hover:border-[#475569]'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm font-bold text-white">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Metadata */}
        <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-[#22d3ee] mb-4">
            Step 2: Configuration Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Configuration Name *
              </label>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="e.g., HQ-to-Branch VPN"
                className="w-full px-4 py-2 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white placeholder-gray-500 focus:border-[#06b6d4] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={configDescription}
                onChange={(e) => setConfigDescription(e.target.value)}
                placeholder="Brief description of this configuration..."
                rows={3}
                className="w-full px-4 py-2 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white placeholder-gray-500 focus:border-[#06b6d4] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-[#22d3ee] mb-4">
            Step 3: Configuration Parameters
          </h2>
          <div className="text-gray-300">
            {/* Render form based on selected type */}
            {selectedType === 'ipsec' && (
              <IPsecForm formData={formData} onChange={handleFormChange} />
            )}
            {selectedType === 'sdwan' && (
              <SdwanForm formData={formData} onChange={handleFormChange} />
            )}
            {selectedType === 'firewall' && (
              <FirewallForm formData={formData} onChange={handleFormChange} />
            )}
            {selectedType === 'interfaces' && (
              <InterfaceForm formData={formData} onChange={handleFormChange} />
            )}

            {/* Placeholder for remaining config types */}
            {!['ipsec', 'sdwan', 'firewall', 'interfaces'].includes(selectedType) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-xl font-bold text-[#22d3ee] mb-2">
                  {CONFIG_TYPES.find((t) => t.value === selectedType)?.label} Form
                </p>
                <p className="text-gray-400">
                  This configuration type will be available in a future update.
                  Currently available: IPsec VPN, SD-WAN, Firewall Policy, and Interface Config.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Output Display */}
        {showOutput && (
          <OutputDisplay
            configType={selectedType}
            formData={formData}
            onClose={() => setShowOutput(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ConfigWizard;
