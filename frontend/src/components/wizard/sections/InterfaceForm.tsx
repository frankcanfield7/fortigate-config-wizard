import React, { useState } from 'react';

interface InterfaceFormProps {
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

const InterfaceForm: React.FC<InterfaceFormProps> = ({ formData, onChange }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(section) ? newSet.delete(section) : newSet.add(section);
      return newSet;
    });
  };

  const sections = [
    {
      id: 'basic',
      title: 'Basic Configuration',
      icon: '🔌',
      fields: [
        { name: 'interface_name', label: 'Interface Name', type: 'select', options: [
          { value: 'port1', label: 'port1' },
          { value: 'port2', label: 'port2' },
          { value: 'wan1', label: 'wan1' },
          { value: 'wan2', label: 'wan2' },
          { value: 'internal', label: 'internal' },
        ]},
        { name: 'alias', label: 'Alias', type: 'text', placeholder: 'LAN' },
        { name: 'mode', label: 'Addressing Mode', type: 'select', options: [
          { value: 'static', label: 'Static' },
          { value: 'dhcp', label: 'DHCP' },
          { value: 'pppoe', label: 'PPPoE' },
        ]},
        { name: 'ip', label: 'IP Address', type: 'text', placeholder: '192.168.1.1' },
        { name: 'netmask', label: 'Netmask', type: 'select', options: [
          { value: '255.255.255.0', label: '255.255.255.0 (/24)' },
          { value: '255.255.0.0', label: '255.255.0.0 (/16)' },
          { value: '255.0.0.0', label: '255.0.0.0 (/8)' },
        ]},
        { name: 'allowaccess', label: 'Administrative Access', type: 'text', placeholder: 'ping https ssh' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'up', label: 'Up' },
          { value: 'down', label: 'Down' },
        ]},
      ],
    },
    {
      id: 'dhcp',
      title: 'DHCP Server',
      icon: '📡',
      fields: [
        { name: 'dhcp_server', label: 'Enable DHCP Server', type: 'select', options: [
          { value: 'disable', label: 'Disable' },
          { value: 'enable', label: 'Enable' },
        ]},
        { name: 'dhcp_start_ip', label: 'Start IP', type: 'text', placeholder: '192.168.1.10' },
        { name: 'dhcp_end_ip', label: 'End IP', type: 'text', placeholder: '192.168.1.250' },
        { name: 'dhcp_netmask', label: 'Netmask', type: 'text', placeholder: '255.255.255.0' },
        { name: 'dhcp_gateway', label: 'Default Gateway', type: 'text', placeholder: '192.168.1.1' },
        { name: 'dhcp_dns1', label: 'DNS Server 1', type: 'text', placeholder: '8.8.8.8' },
        { name: 'dhcp_dns2', label: 'DNS Server 2', type: 'text', placeholder: '8.8.4.4' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="border-2 border-[#334155] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-6 py-4 bg-[#334155] flex items-center justify-between hover:bg-[#475569] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{section.icon}</span>
              <h3 className="text-lg font-bold text-white">{section.title}</h3>
            </div>
            <span className="text-[#22d3ee] text-xl">{expandedSections.has(section.id) ? '▼' : '▶'}</span>
          </button>
          {expandedSections.has(section.id) && (
            <div className="p-6 space-y-4">
              {section.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || (field.options?.[0]?.value || '')}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      className="w-full px-4 py-2 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white focus:border-[#06b6d4] focus:outline-none"
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
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
    </div>
  );
};

export default InterfaceForm;
