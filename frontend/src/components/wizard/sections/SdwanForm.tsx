import React, { useState } from 'react';

interface SdwanFormProps {
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

const SdwanForm: React.FC<SdwanFormProps> = ({ formData, onChange }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['general', 'members'])
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
      title: 'General Settings',
      icon: '⚙️',
      fields: [
        { name: 'zone_name', label: 'SD-WAN Zone Name', type: 'text', placeholder: 'virtual-wan-link' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'enable', label: 'Enable' },
          { value: 'disable', label: 'Disable' },
        ]},
        { name: 'load_balance_mode', label: 'Load Balance Mode', type: 'select', options: [
          { value: 'source-ip-based', label: 'Source IP Based' },
          { value: 'weight-based', label: 'Weight Based' },
          { value: 'usage-based', label: 'Usage Based' },
          { value: 'source-dest-ip-based', label: 'Source-Dest IP Based' },
          { value: 'measured-volume-based', label: 'Measured Volume Based' },
        ]},
      ],
    },
    {
      id: 'members',
      title: 'SD-WAN Members',
      icon: '🔗',
      fields: [
        { name: 'member1_interface', label: 'Member 1 - Interface', type: 'select', options: [
          { value: 'wan1', label: 'wan1' },
          { value: 'wan2', label: 'wan2' },
          { value: 'port1', label: 'port1' },
          { value: 'port2', label: 'port2' },
        ]},
        { name: 'member1_gateway', label: 'Member 1 - Gateway IP', type: 'text', placeholder: '0.0.0.0' },
        { name: 'member1_weight', label: 'Member 1 - Weight', type: 'number', placeholder: '1' },
        { name: 'member1_priority', label: 'Member 1 - Priority', type: 'number', placeholder: '1' },
        { name: 'member2_interface', label: 'Member 2 - Interface', type: 'select', options: [
          { value: '', label: 'None' },
          { value: 'wan1', label: 'wan1' },
          { value: 'wan2', label: 'wan2' },
          { value: 'port1', label: 'port1' },
          { value: 'port2', label: 'port2' },
        ]},
        { name: 'member2_gateway', label: 'Member 2 - Gateway IP', type: 'text', placeholder: '0.0.0.0' },
        { name: 'member2_weight', label: 'Member 2 - Weight', type: 'number', placeholder: '1' },
        { name: 'member2_priority', label: 'Member 2 - Priority', type: 'number', placeholder: '1' },
      ],
    },
    {
      id: 'healthcheck',
      title: 'Health Check',
      icon: '❤️',
      fields: [
        { name: 'health_check_name', label: 'Health Check Name', type: 'text', placeholder: 'Default_Health_Check' },
        { name: 'health_check_server', label: 'Server IP', type: 'text', placeholder: '8.8.8.8' },
        { name: 'health_check_protocol', label: 'Protocol', type: 'select', options: [
          { value: 'ping', label: 'Ping' },
          { value: 'tcp-echo', label: 'TCP Echo' },
          { value: 'udp-echo', label: 'UDP Echo' },
          { value: 'http', label: 'HTTP' },
          { value: 'dns', label: 'DNS' },
        ]},
        { name: 'health_check_interval', label: 'Interval (sec)', type: 'number', placeholder: '5' },
        { name: 'health_check_failtime', label: 'Fail Time (sec)', type: 'number', placeholder: '5' },
        { name: 'health_check_recoverytime', label: 'Recovery Time (sec)', type: 'number', placeholder: '5' },
      ],
    },
    {
      id: 'rules',
      title: 'SD-WAN Rules',
      icon: '📋',
      fields: [
        { name: 'rule1_name', label: 'Rule 1 - Name', type: 'text', placeholder: 'Rule_1' },
        { name: 'rule1_dst', label: 'Rule 1 - Destination', type: 'text', placeholder: '0.0.0.0/0' },
        { name: 'rule1_mode', label: 'Rule 1 - Mode', type: 'select', options: [
          { value: 'auto', label: 'Auto' },
          { value: 'manual', label: 'Manual' },
          { value: 'priority', label: 'Priority' },
          { value: 'sla', label: 'SLA' },
        ]},
        { name: 'rule1_quality_link', label: 'Rule 1 - Quality Link', type: 'select', options: [
          { value: 'latency-sensitive', label: 'Latency Sensitive' },
          { value: 'jitter-sensitive', label: 'Jitter Sensitive' },
          { value: 'bandwidth-sensitive', label: 'Bandwidth Sensitive' },
        ]},
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

      {/* Info Box */}
      <div className="bg-[#06b6d4]/10 border-2 border-[#06b6d4]/30 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <strong className="text-[#22d3ee]">💡 SD-WAN Best Practices:</strong> Use health checks to monitor link quality,
          configure multiple members for redundancy, and define rules based on application requirements (latency, bandwidth, etc.).
        </p>
      </div>
    </div>
  );
};

export default SdwanForm;
