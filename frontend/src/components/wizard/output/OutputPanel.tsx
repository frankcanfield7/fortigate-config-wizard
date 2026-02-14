import React, { useState, useMemo } from 'react';
import type { IPsecRemoteAccessConfig } from '../../../types';
import {
  generateRemoteAccessCLI,
  generateRemoteAccessGUI,
  generateRemoteAccessAzure,
  generateRemoteAccessXML,
} from '../../../utils/generators/remoteAccess';

interface OutputPanelProps {
  config: IPsecRemoteAccessConfig;
  onClose: () => void;
}

type TabId = 'cli' | 'gui' | 'az' | 'xml';

const tabs: { id: TabId; label: string }[] = [
  { id: 'cli', label: 'CLI Script' },
  { id: 'gui', label: 'GUI Steps' },
  { id: 'az', label: 'Azure Setup' },
  { id: 'xml', label: 'FortiClient XML' },
];

const OutputPanel: React.FC<OutputPanelProps> = ({ config, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cli' | 'gui' | 'az' | 'xml'>('cli');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const outputs = useMemo(
    () => ({
      cli: generateRemoteAccessCLI(config),
      gui: generateRemoteAccessGUI(config),
      az: generateRemoteAccessAzure(config),
      xml: generateRemoteAccessXML(config),
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
    };
    const prefixMap: Record<TabId, string> = {
      cli: 'fortigate-vpn-cli',
      gui: 'fortigate-vpn-gui',
      az: 'fortigate-vpn-azure',
      xml: 'fortigate-vpn-forticlient',
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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Configuration Output
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close output panel"
        >
          {/* Close X icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="5" x2="15" y2="15" />
            <line x1="15" y1="5" x2="5" y2="15" />
          </svg>
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white dark:text-cyan-400 border-b-2 border-cyan-500'
                : 'text-slate-500 dark:text-slate-400 border-b-2 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-end gap-2 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
        >
          {copyFeedback ? (
            <>
              {/* Checkmark icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              {/* Clipboard icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="6" height="3" rx="0.5" />
                <path d="M5 3.5H3.5A1.5 1.5 0 0 0 2 5v8.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V5a1.5 1.5 0 0 0-1.5-1.5H11" />
              </svg>
              Copy
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors"
        >
          {/* Download arrow icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v9" />
            <polyline points="4 8 8 12 12 8" />
            <line x1="3" y1="14" x2="13" y2="14" />
          </svg>
          Download
        </button>
      </div>

      {/* Output Display */}
      <div className="p-4">
        <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap bg-slate-950 text-slate-300 p-4 rounded-lg overflow-auto max-h-[600px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:bg-cyan-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          {outputs[activeTab]}
        </pre>
      </div>
    </div>
  );
};

export default OutputPanel;
