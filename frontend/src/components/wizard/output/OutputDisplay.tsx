import React, { useState } from 'react';
import { generateIPsecCLI, generateIPsecGUI, generateIPsecScript } from '../../../utils/generators/ipsec';

// Placeholder generators for other config types (to be implemented)
const generateSDWANCLI = (_data: Record<string, any>) => `# SD-WAN CLI (placeholder)\n# Implement in generators/sdwan.ts`;
const generateSDWANGUI = (_data: Record<string, any>) => `SD-WAN GUI steps (placeholder)`;
const generateSDWANScript = (_data: Record<string, any>) => `#!/bin/bash\n# SD-WAN script (placeholder)`;

const generateFirewallCLI = (_data: Record<string, any>) => `# Firewall CLI (placeholder)\n# Implement in generators/firewall.ts`;
const generateFirewallGUI = (_data: Record<string, any>) => `Firewall GUI steps (placeholder)`;
const generateFirewallScript = (_data: Record<string, any>) => `#!/bin/bash\n# Firewall script (placeholder)`;

interface OutputDisplayProps {
  configType: string;
  formData: Record<string, any>;
  onClose: () => void;
}

type TabType = 'cli' | 'gui' | 'script';

const OutputDisplay: React.FC<OutputDisplayProps> = ({ configType, formData, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('cli');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate output based on config type and form data
  const generateCLI = (): string => {
    switch (configType) {
      case 'ipsec':
        return generateIPsecCLI(formData);
      case 'sdwan':
        return generateSDWANCLI(formData);
      case 'firewall':
        return generateFirewallCLI(formData);
      default:
        return `# FortiGate CLI Configuration
# Type: ${configType.toUpperCase()}
# Generated: ${new Date().toLocaleString()}

# Configuration for ${configType} will be available in a future update.
# Currently available: IPsec VPN, SD-WAN, Firewall Policy
`;
    }
  };

  const generateGUI = (): string => {
    switch (configType) {
      case 'ipsec':
        return generateIPsecGUI(formData);
      case 'sdwan':
        return generateSDWANGUI(formData);
      case 'firewall':
        return generateFirewallGUI(formData);
      default:
        return `📋 FortiGate GUI Configuration Steps
Type: ${configType.toUpperCase()}

GUI steps for ${configType} will be available in a future update.
Currently available: IPsec VPN, SD-WAN, Firewall Policy
`;
    }
  };

  const generateScript = (): string => {
    switch (configType) {
      case 'ipsec':
        return generateIPsecScript(formData);
      case 'sdwan':
        return generateSDWANScript(formData);
      case 'firewall':
        return generateFirewallScript(formData);
      default:
        return `#!/bin/bash
# FortiGate Complete Configuration Script
# Type: ${configType.toUpperCase()}
# Generated: ${new Date().toLocaleString()}

echo "Starting FortiGate configuration..."

# Connect to FortiGate
ssh admin@192.168.1.99 << 'EOF'

# Enter configuration mode
config system interface
    edit "wan1"
        set ip 192.168.1.1 255.255.255.0
    next
end

# Verify configuration
get system interface

# Exit
exit
EOF

echo "Configuration complete!"`;
    }
  };

  const getOutput = (): string => {
    switch (activeTab) {
      case 'cli':
        return generateCLI();
      case 'gui':
        return generateGUI();
      case 'script':
        return generateScript();
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getOutput());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const output = getOutput();
    const extension = activeTab === 'script' ? 'sh' : 'txt';
    const filename = `fortigate-${configType}-${activeTab}.${extension}`;

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'cli', label: 'CLI Script', icon: '💻' },
    { id: 'gui', label: 'GUI Steps', icon: '🖱️' },
    { id: 'script', label: 'Complete Script', icon: '📜' },
  ];

  return (
    <div className="bg-[#1e293b] border-2 border-[#06b6d4] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0f172a]">
            Configuration Output
          </h2>
          <button
            onClick={onClose}
            className="text-[#0f172a] hover:text-[#1e293b] transition-colors text-2xl"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-[#334155]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-3 font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#0f172a] text-[#22d3ee] border-b-2 border-[#06b6d4]'
                : 'text-gray-400 hover:text-white hover:bg-[#334155]/50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 p-4 bg-[#334155]/30">
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors font-medium flex items-center gap-2"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-[#0f172a] rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-bold flex items-center gap-2"
        >
          💾 Download
        </button>
      </div>

      {/* Output Content */}
      <div className="p-6">
        <pre className="bg-[#0f172a] border-2 border-[#334155] rounded-lg p-6 text-gray-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
          {getOutput()}
        </pre>
      </div>

      {/* Info Footer */}
      <div className="bg-[#334155]/30 px-6 py-4 text-sm text-gray-400">
        <p>
          <strong className="text-[#22d3ee]">💡 Tip:</strong> Always test
          configurations in a lab environment before deploying to production.
        </p>
      </div>
    </div>
  );
};

export default OutputDisplay;
