import React, { useState, useEffect } from 'react';
import { validateIPAddress, validateSubnet, validatePhase1Name } from '../../../utils/validators';

interface IPsecFormProps {
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  section: 'phase1' | 'phase2' | 'network';
  validator?: (value: any) => { isValid: boolean; error?: string };
}

const IPsecForm: React.FC<IPsecFormProps> = ({ formData, onChange }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['network', 'phase1'])
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const fields: FormField[] = [
    // Network Configuration
    { name: 'tunnel_name', label: 'Tunnel Name', type: 'text', placeholder: 'HQ-to-Branch', section: 'network', required: true, validator: validatePhase1Name },
    { name: 'local_gateway', label: 'Local Gateway IP', type: 'text', placeholder: '203.0.113.1', section: 'network', required: true, validator: validateIPAddress },
    { name: 'remote_gateway', label: 'Remote Gateway IP', type: 'text', placeholder: '198.51.100.1', section: 'network', required: true, validator: validateIPAddress },
    { name: 'local_subnet', label: 'Local Subnet', type: 'text', placeholder: '192.168.1.0/24', section: 'network', required: true, validator: validateSubnet },
    { name: 'remote_subnet', label: 'Remote Subnet', type: 'text', placeholder: '10.0.1.0/24', section: 'network', required: true, validator: validateSubnet },
    { name: 'interface', label: 'WAN Interface', type: 'select', section: 'network', options: [
      { value: 'wan1', label: 'wan1' },
      { value: 'wan2', label: 'wan2' },
      { value: 'port1', label: 'port1' },
      { value: 'port2', label: 'port2' },
    ]},

    // Phase 1 Configuration
    { name: 'phase1_mode', label: 'IKE Mode', type: 'select', section: 'phase1', options: [
      { value: 'main', label: 'Main Mode' },
      { value: 'aggressive', label: 'Aggressive Mode' },
    ]},
    { name: 'phase1_version', label: 'IKE Version', type: 'select', section: 'phase1', options: [
      { value: 'ikev2', label: 'IKEv2 (Recommended)' },
      { value: 'ikev1', label: 'IKEv1' },
    ]},
    { name: 'phase1_encryption', label: 'Encryption', type: 'select', section: 'phase1', options: [
      { value: 'aes256', label: 'AES-256' },
      { value: 'aes192', label: 'AES-192' },
      { value: 'aes128', label: 'AES-128' },
      { value: '3des', label: '3DES' },
    ]},
    { name: 'phase1_authentication', label: 'Authentication', type: 'select', section: 'phase1', options: [
      { value: 'sha256', label: 'SHA-256' },
      { value: 'sha1', label: 'SHA-1' },
      { value: 'md5', label: 'MD5' },
    ]},
    { name: 'phase1_dh_group', label: 'DH Group', type: 'select', section: 'phase1', options: [
      { value: '14', label: 'Group 14 (2048-bit)' },
      { value: '15', label: 'Group 15 (3072-bit)' },
      { value: '16', label: 'Group 16 (4096-bit)' },
      { value: '5', label: 'Group 5 (1536-bit)' },
    ]},
    { name: 'phase1_lifetime', label: 'Key Lifetime (seconds)', type: 'number', placeholder: '86400', section: 'phase1' },
    { name: 'preshared_key', label: 'Pre-Shared Key', type: 'text', placeholder: 'Enter strong PSK', section: 'phase1', required: true },

    // Phase 2 Configuration
    { name: 'phase2_encryption', label: 'Encryption', type: 'select', section: 'phase2', options: [
      { value: 'aes256', label: 'AES-256' },
      { value: 'aes192', label: 'AES-192' },
      { value: 'aes128', label: 'AES-128' },
      { value: '3des', label: '3DES' },
    ]},
    { name: 'phase2_authentication', label: 'Authentication', type: 'select', section: 'phase2', options: [
      { value: 'sha256', label: 'SHA-256' },
      { value: 'sha1', label: 'SHA-1' },
      { value: 'md5', label: 'MD5' },
    ]},
    { name: 'phase2_pfs', label: 'PFS Group', type: 'select', section: 'phase2', options: [
      { value: '14', label: 'Group 14 (2048-bit)' },
      { value: '15', label: 'Group 15 (3072-bit)' },
      { value: '16', label: 'Group 16 (4096-bit)' },
      { value: '5', label: 'Group 5 (1536-bit)' },
      { value: 'disable', label: 'Disabled' },
    ]},
    { name: 'phase2_lifetime', label: 'Key Lifetime (seconds)', type: 'number', placeholder: '43200', section: 'phase2' },
  ];

  // Set default values on mount
  useEffect(() => {
    const defaults: Record<string, any> = {
      interface: 'wan1',
      phase1_mode: 'main',
      phase1_version: 'ikev2',
      phase1_encryption: 'aes256',
      phase1_authentication: 'sha256',
      phase1_dh_group: '14',
      phase1_lifetime: '86400',
      phase2_encryption: 'aes256',
      phase2_authentication: 'sha256',
      phase2_pfs: '14',
      phase2_lifetime: '43200',
    };

    Object.entries(defaults).forEach(([key, value]) => {
      if (!formData[key]) {
        onChange(key, value);
      }
    });
  }, []);

  // Handle field validation
  const handleFieldChange = (field: FormField, value: any) => {
    onChange(field.name, value);

    // Clear error when user starts typing
    if (fieldErrors[field.name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field.name];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: FormField, value: any) => {
    if (!field.validator) return;

    const result = field.validator(value);
    if (!result.isValid && result.error) {
      setFieldErrors((prev) => ({
        ...prev,
        [field.name]: result.error!,
      }));
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const hasError = fieldErrors[field.name];
    const borderColor = hasError ? 'border-red-500' : 'border-[#334155]';
    const focusBorderColor = hasError ? 'focus:border-red-400' : 'focus:border-[#06b6d4]';

    return (
      <div key={field.name} className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {field.type === 'select' ? (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={(e) => handleFieldBlur(field, e.target.value)}
            className={`w-full px-4 py-2 bg-[#0f172a] border-2 ${borderColor} rounded-lg text-white ${focusBorderColor} focus:outline-none transition-colors`}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === 'number' ? (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={(e) => handleFieldBlur(field, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-2 bg-[#0f172a] border-2 ${borderColor} rounded-lg text-white placeholder-gray-500 ${focusBorderColor} focus:outline-none transition-colors`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={(e) => handleFieldBlur(field, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-2 bg-[#0f172a] border-2 ${borderColor} rounded-lg text-white placeholder-gray-500 ${focusBorderColor} focus:outline-none transition-colors`}
          />
        )}

        {/* Error Message */}
        {hasError && (
          <p className="text-red-400 text-sm flex items-center gap-1">
            <span>⚠️</span>
            <span>{hasError}</span>
          </p>
        )}
      </div>
    );
  };

  const sections = [
    {
      id: 'network',
      title: 'Network Configuration',
      icon: '🌐',
      description: 'Define tunnel endpoints and subnets',
    },
    {
      id: 'phase1',
      title: 'Phase 1 (IKE) Settings',
      icon: '🔐',
      description: 'Configure IKE authentication and encryption',
    },
    {
      id: 'phase2',
      title: 'Phase 2 (IPsec) Settings',
      icon: '🔒',
      description: 'Configure IPsec data encryption',
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        const sectionFields = fields.filter((f) => f.section === section.id);

        return (
          <div
            key={section.id}
            className="bg-[#0f172a] border-2 border-[#334155] rounded-lg overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1e293b] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-[#22d3ee]">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-400">{section.description}</p>
                </div>
              </div>
              <span
                className={`text-[#22d3ee] text-2xl transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectionFields.map(renderField)}
              </div>
            )}
          </div>
        );
      })}

      {/* Security Recommendations */}
      <div className="bg-[#06b6d4]/10 border-2 border-[#06b6d4]/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#22d3ee] mb-3 flex items-center gap-2">
          <span>🛡️</span> Security Recommendations
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Use IKEv2 for better security and performance</li>
          <li>✓ Use AES-256 with SHA-256 for strong encryption</li>
          <li>✓ Enable PFS (Perfect Forward Secrecy) for Phase 2</li>
          <li>✓ Use DH Group 14 or higher (2048-bit minimum)</li>
          <li>✓ Generate strong pre-shared keys (20+ characters, mixed case, numbers, symbols)</li>
          <li>✓ Set Phase 1 lifetime to 86400 seconds (24 hours)</li>
          <li>✓ Set Phase 2 lifetime to 43200 seconds (12 hours)</li>
        </ul>
      </div>
    </div>
  );
};

export default IPsecForm;
