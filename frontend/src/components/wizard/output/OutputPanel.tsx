import React, { useState, useMemo } from 'react';
import type { IPsecRemoteAccessConfig } from '../../../types';
import {
  generateRemoteAccessCLI,
  generateRemoteAccessGUI,
  generateRemoteAccessAzure,
  generateRemoteAccessXML,
} from '../../../utils/generators/remoteAccess';
import { generateDocumentation } from '../../../utils/generators/documentation';

interface OutputPanelProps {
  config: IPsecRemoteAccessConfig;
}

type TabId = 'cli' | 'gui' | 'az' | 'xml' | 'docs';

const tabs: { id: TabId; label: string }[] = [
  { id: 'cli', label: 'CLI' },
  { id: 'gui', label: 'GUI' },
  { id: 'az', label: 'Azure' },
  { id: 'xml', label: 'XML' },
  { id: 'docs', label: 'Docs' },
];

const OutputPanel: React.FC<OutputPanelProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<TabId>('cli');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const outputs = useMemo(
    () => ({
      cli: generateRemoteAccessCLI(config),
      gui: generateRemoteAccessGUI(config),
      az: generateRemoteAccessAzure(config),
      xml: generateRemoteAccessXML(config),
      docs: generateDocumentation(config),
    }),
    [config]
  );

  const tunnelName = config.tunnels[0]?.name || 'vpn';
  const dateSuffix = new Date().toISOString().slice(0, 10);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputs[activeTab]);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    const extensionMap: Record<TabId, string> = {
      cli: 'txt',
      gui: 'txt',
      az: 'txt',
      xml: 'conf',
      docs: 'md',
    };
    const prefixMap: Record<TabId, string> = {
      cli: 'fortigate-vpn-cli',
      gui: 'fortigate-vpn-gui',
      az: 'fortigate-vpn-azure',
      xml: 'fortigate-vpn-forticlient',
      docs: 'fortigate-vpn-documentation',
    };

    const filename = `${prefixMap[activeTab]}-${tunnelName}-${dateSuffix}.${extensionMap[activeTab]}`;
    const blob = new Blob([outputs[activeTab]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-border bg-dark-bg/50">
        <h2 className="text-sm font-medium text-accent-primary uppercase tracking-wide">
          Configuration Output
        </h2>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-dark-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-accent-primary border-b-2 border-accent-primary bg-dark-surface'
                : 'text-dark-muted border-b-2 border-transparent hover:text-dark-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-dark-border">
        <button
          onClick={handleCopy}
          className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
        >
          {copyFeedback ? (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="6" height="3" rx="0.5" />
                <path d="M5 3.5H3.5A1.5 1.5 0 0 0 2 5v8.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V5a1.5 1.5 0 0 0-1.5-1.5H11" />
              </svg>
              Copy
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v9" />
            <polyline points="4 8 8 12 12 8" />
            <line x1="3" y1="14" x2="13" y2="14" />
          </svg>
          Download
        </button>
      </div>

      {/* Output Display */}
      <div className="p-3">
        <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap bg-dark-bg text-dark-text p-3 rounded-lg overflow-auto max-h-[calc(100vh-320px)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-dark-elevated [&::-webkit-scrollbar-thumb]:bg-accent-primary [&::-webkit-scrollbar-thumb]:rounded-full">
          {outputs[activeTab]}
        </pre>
      </div>
    </div>
  );
};

export default OutputPanel;
