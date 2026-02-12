import React, { useState } from 'react';

interface FirewallFormProps {
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

const FirewallForm: React.FC<FirewallFormProps> = ({ formData, onChange }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['general', 'source'])
  );

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

  const sections = [
    {
      id: 'general',
      title: 'Policy Configuration',
      icon: '📋',
      fields: [
        { name: 'policy_name', label: 'Policy Name', type: 'text', placeholder: 'Allow-Internet-Access' },
        { name: 'policy_id', label: 'Policy ID', type: 'number', placeholder: 'Auto-assign' },
        { name: 'action', label: 'Action', type: 'select', options: [
          { value: 'accept', label: 'ACCEPT' },
          { value: 'deny', label: 'DENY' },
          { value: 'ipsec', label: 'IPsec' },
        ]},
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'enable', label: 'Enable' },
          { value: 'disable', label: 'Disable' },
        ]},
      ],
    },
    {
      id: 'source',
      title: 'Source Configuration',
      icon: '🔵',
      fields: [
        { name: 'srcintf', label: 'Source Interface', type: 'select', options: [
          { value: 'any', label: 'any' },
          { value: 'internal', label: 'internal' },
          { value: 'port1', label: 'port1' },
          { value: 'port2', label: 'port2' },
          { value: 'dmz', label: 'dmz' },
        ]},
        { name: 'srcaddr', label: 'Source Address', type: 'text', placeholder: 'all or specific object' },
        { name: 'srcaddr_negate', label: 'Negate Source', type: 'select', options: [
          { value: 'disable', label: 'Disable' },
          { value: 'enable', label: 'Enable' },
        ]},
      ],
    },
    {
      id: 'destination',
      title: 'Destination Configuration',
      icon: '🔴',
      fields: [
        { name: 'dstintf', label: 'Destination Interface', type: 'select', options: [
          { value: 'any', label: 'any' },
          { value: 'wan1', label: 'wan1' },
          { value: 'wan2', label: 'wan2' },
          { value: 'port1', label: 'port1' },
          { value: 'port2', label: 'port2' },
        ]},
        { name: 'dstaddr', label: 'Destination Address', type: 'text', placeholder: 'all or specific object' },
        { name: 'dstaddr_negate', label: 'Negate Destination', type: 'select', options: [
          { value: 'disable', label: 'Disable' },
          { value: 'enable', label: 'Enable' },
        ]},
      ],
    },
    {
      id: 'service',
      title: 'Service & Schedule',
      icon: '🔌',
      fields: [
        { name: 'service', label: 'Service', type: 'select', options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'HTTP', label: 'HTTP' },
          { value: 'HTTPS', label: 'HTTPS' },
          { value: 'SSH', label: 'SSH' },
          { value: 'FTP', label: 'FTP' },
          { value: 'DNS', label: 'DNS' },
          { value: 'SMTP', label: 'SMTP' },
        ]},
        { name: 'schedule', label: 'Schedule', type: 'select', options: [
          { value: 'always', label: 'always' },
          { value: 'business-hours', label: 'business-hours' },
          { value: 'weekend', label: 'weekend' },
        ]},
      ],
    },
    {
      id: 'nat',
      title: 'NAT Configuration',
      icon: '🔄',
      fields: [
        { name: 'nat', label: 'NAT', type: 'select', options: [
          { value: 'disable', label: 'Disable' },
          { value: 'enable', label: 'Enable' },
        ]},
        { name: 'ippool', label: 'Use IP Pool', type: 'select', options: [
          { value: 'disable', label: 'Disable' },
          { value: 'enable', label: 'Enable' },
        ]},
        { name: 'poolname', label: 'IP Pool Name', type: 'text', placeholder: 'pool-name' },
      ],
    },
    {
      id: 'security',
      title: 'Security Profiles',
      icon: '🛡️',
      fields: [
        { name: 'av_profile', label: 'Antivirus Profile', type: 'select', options: [
          { value: '', label: 'None' },
          { value: 'default', label: 'default' },
          { value: 'g-default', label: 'g-default' },
        ]},
        { name: 'webfilter_profile', label: 'Web Filter Profile', type: 'select', options: [
          { value: '', label: 'None' },
          { value: 'default', label: 'default' },
          { value: 'g-default', label: 'g-default' },
        ]},
        { name: 'ips_sensor', label: 'IPS Sensor', type: 'select', options: [
          { value: '', label: 'None' },
          { value: 'default', label: 'default' },
          { value: 'g-default', label: 'g-default' },
          { value: 'protect_client', label: 'protect_client' },
          { value: 'protect_server', label: 'protect_server' },
        ]},
        { name: 'application_list', label: 'Application Control', type: 'select', options: [
          { value: '', label: 'None' },
          { value: 'default', label: 'default' },
          { value: 'g-default', label: 'g-default' },
        ]},
        { name: 'ssl_ssh_profile', label: 'SSL/SSH Inspection', type: 'select', options: [
          { value: '', label: 'None' },
          { value: 'certificate-inspection', label: 'certificate-inspection' },
          { value: 'deep-inspection', label: 'deep-inspection' },
        ]},
      ],
    },
    {
      id: 'logging',
      title: 'Logging & Comments',
      icon: '📝',
      fields: [
        { name: 'logtraffic', label: 'Log Allowed Traffic', type: 'select', options: [
          { value: 'all', label: 'All Sessions' },
          { value: 'utm', label: 'Security Events' },
          { value: 'disable', label: 'Disable' },
        ]},
        { name: 'logtraffic_start', label: 'Log at Session Start', type: 'select', options: [
          { value: 'disable', label: 'Disable' },
          { value: 'enable', label: 'Enable' },
        ]},
        { name: 'comments', label: 'Comments', type: 'textarea', placeholder: 'Policy description and purpose...' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="border-2 border-[#334155] rounded-lg overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-6 py-4 bg-[#334155] flex items-center justify-between hover:bg-[#475569] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{section.icon}</span>
              <h3 className="text-lg font-bold text-white">{section.title}</h3>
            </div>
            <span className="text-[#22d3ee] text-xl">
              {expandedSections.has(section.id) ? '▼' : '▶'}
            </span>
          </button>

          {/* Section Content */}
          {expandedSections.has(section.id) && (
            <div className="p-6 space-y-4">
              {section.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || (field.options?.[0]?.value || '')}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      className="w-full px-4 py-2 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white focus:border-[#06b6d4] focus:outline-none"
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-4 py-2 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white placeholder-gray-500 focus:border-[#06b6d4] focus:outline-none"
                    />
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={formData[field.name] || ''}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white placeholder-gray-500 focus:border-[#06b6d4] focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white placeholder-gray-500 focus:border-[#06b6d4] focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Security Warning */}
      <div className="bg-red-900/20 border-2 border-red-500/30 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <strong className="text-red-400">⚠️ Security Best Practices:</strong> Avoid using "ANY" for source/destination unless absolutely necessary.
          Always enable appropriate security profiles (AV, IPS, Web Filter). Use specific services instead of "ALL" when possible.
          Enable logging to monitor policy usage and troubleshoot issues.
        </p>
      </div>
    </div>
  );
};

export default FirewallForm;
