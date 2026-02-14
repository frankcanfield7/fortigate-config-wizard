import React, { useState, useMemo } from 'react';
import type { IPsecRemoteAccessConfig, TunnelConfig, UserGroupConfig } from '../../../types';
import { createDefaultIPsecRemoteAccessConfig } from '../../../types';
import { validateIPRange, validateCIDRList } from '../../../utils/validators/remoteAccess';
import TunnelSection from './TunnelSection';
import UserGroupSection from './UserGroupSection';

interface IPsecRemoteAccessFormProps {
  config: IPsecRemoteAccessConfig;
  updateField: <K extends keyof IPsecRemoteAccessConfig>(field: K, value: IPsecRemoteAccessConfig[K]) => void;
  addTunnel: () => void;
  removeTunnel: (index: number) => void;
  updateTunnel: (index: number, field: keyof TunnelConfig, value: string) => void;
  addUserGroup: () => void;
  removeUserGroup: (index: number) => void;
  updateUserGroup: (index: number, field: keyof UserGroupConfig, value: string) => void;
}

// Phase 1 proposal options
const P1_PROPOSALS = [
  { value: 'aes256-sha256', label: 'aes256-sha256', defaultChecked: true },
  { value: 'aes128-sha256', label: 'aes128-sha256', defaultChecked: true },
  { value: 'aes256gcm-prfsha384', label: 'aes256gcm-prfsha384', defaultChecked: false },
  { value: 'aes128gcm-prfsha256', label: 'aes128gcm-prfsha256', defaultChecked: false },
  { value: 'chacha20poly1305-prfsha256', label: 'chacha20poly1305-prfsha256', defaultChecked: false },
];

// Phase 1 DH group options
const DH_GROUPS = [
  { value: '14', label: '14', strength: 'legacy' },
  { value: '15', label: '15', strength: 'moderate' },
  { value: '19', label: '19', strength: 'strong' },
  { value: '20', label: '20', strength: 'strong' },
  { value: '21', label: '21', strength: 'strong' },
];

// Phase 2 proposal options
const P2_PROPOSALS = [
  { value: 'aes256-sha256', label: 'aes256-sha256', defaultChecked: true },
  { value: 'aes128-sha256', label: 'aes128-sha256', defaultChecked: true },
  { value: 'aes256gcm', label: 'aes256gcm', defaultChecked: false },
  { value: 'aes128gcm', label: 'aes128gcm', defaultChecked: false },
  { value: 'chacha20poly1305', label: 'chacha20poly1305', defaultChecked: false },
];

// PFS DH group options
const PFS_DH_OPTIONS = [
  { value: '14', label: '14' },
  { value: '15', label: '15' },
  { value: '19', label: '19' },
  { value: '20', label: '20' },
  { value: '21', label: '21' },
];

const ChevronIcon = () => (
  <svg className="w-5 h-5 text-neutral-400 group-hover:text-red-500 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const IPsecRemoteAccessForm: React.FC<IPsecRemoteAccessFormProps> = ({
  config,
  updateField,
  addTunnel,
  removeTunnel,
  updateTunnel,
  addUserGroup,
  removeUserGroup,
  updateUserGroup,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['tunnels', 'phase1', 'phase2', 'ipDns', 'entraSaml'])
  );
  const [showPsk, setShowPsk] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // Toggle checkbox array values
  const toggleArrayValue = (field: 'p1p' | 'p1d' | 'p2p', value: string) => {
    const current = config[field];
    if (current.includes(value)) {
      updateField(field, current.filter(v => v !== value));
    } else {
      updateField(field, [...current, value]);
    }
  };

  // IP range validation
  const ipRangeError = useMemo(() => {
    const result = validateIPRange(config.startIp, config.endIp);
    return result.isValid ? null : result.error;
  }, [config.startIp, config.endIp]);

  // CIDR validation
  const cidrError = useMemo(() => {
    if (config.splitMode !== 'enabled') return null;
    const result = validateCIDRList(config.splitNets);
    return result.isValid ? null : result.error;
  }, [config.splitMode, config.splitNets]);

  // Auto-generated SAML URLs
  const samlUrls = useMemo(() => {
    const fqdn = config.tunnels[0]?.fqdn || '';
    const port = config.tunnels[0]?.port || '';
    if (!fqdn || !port) return null;
    const base = `https://${fqdn}:${port}`;
    return {
      entityId: `${base}/remote/saml/metadata`,
      acsUrl: `${base}/remote/saml/login`,
      sloUrl: `${base}/remote/saml/logout`,
    };
  }, [config.tunnels]);

  // DH group strength badge
  const dhBadge = useMemo(() => {
    const dh = config.p1d.map(Number);
    if (!dh.length) return null;
    if (dh.some(g => g < 15)) return { label: 'WEAK', color: 'text-red-500 bg-red-500/10' };
    if (dh.every(g => g >= 19)) return { label: 'STRONG', color: 'text-green-500 bg-green-500/10' };
    return null;
  }, [config.p1d]);

  // Apply best practices
  const applyBestPractices = () => {
    const defaults = createDefaultIPsecRemoteAccessConfig();
    updateField('p1p', defaults.p1p);
    updateField('p1d', defaults.p1d);
    updateField('p2p', defaults.p2p);
    updateField('pfsOn', true);
    updateField('pfsDh', '19');
    updateField('natTrav', true);
    updateField('dpdOn', true);
    updateField('childless', true);
    updateField('keepAlive', true);
    updateField('autoNeg', true);
  };

  const renderSectionHeader = (sectionId: string, num: number, title: string, badge?: React.ReactNode) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionId)}
      className="w-full flex items-center justify-between px-5 py-4 text-left group hover:bg-neutral-700/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold bg-red-800/10 text-red-300">
          {num}
        </span>
        <span className="font-bold text-sm text-neutral-200">{title}</span>
        {badge}
      </div>
      <div className={`transition-transform duration-300 ${expandedSections.has(sectionId) ? 'rotate-0' : '-rotate-90'}`}>
        <ChevronIcon />
      </div>
    </button>
  );

  const inputClass = "w-full rounded-lg border bg-neutral-900 border-neutral-600 px-3 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-red-500/40 focus:border-red-600 hover:border-neutral-400 hover:bg-neutral-800/80 hover:shadow-[0_0_12px_rgba(120,120,120,0.06)] transition-all duration-200";
  const labelClass = "block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1.5";
  const helpClass = "text-xs text-neutral-400 mt-1.5 leading-relaxed";
  const sectionClass = "bg-neutral-800 rounded-xl shadow-md border border-neutral-700/50 overflow-hidden";
  const panelClass = "px-5 pb-5 space-y-4";

  return (
    <div className="space-y-4">
      {/* Best Practices Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={applyBestPractices}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-800 to-red-700 hover:from-red-900 hover:to-red-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Apply Best Practices
        </button>
      </div>

      {/* Section 1: IPSEC Tunnels */}
      <section className={sectionClass}>
        {renderSectionHeader('tunnels', 1, 'IPSEC Tunnels')}
        {expandedSections.has('tunnels') && (
          <div className={panelClass}>
            <TunnelSection
              tunnels={config.tunnels}
              addTunnel={addTunnel}
              removeTunnel={removeTunnel}
              updateTunnel={updateTunnel}
            />
          </div>
        )}
      </section>

      {/* Section 2: Phase 1 (IKEv2) */}
      <section className={sectionClass}>
        {renderSectionHeader('phase1', 2, 'Phase 1 (IKEv2)', dhBadge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dhBadge.color}`}>
            {dhBadge.label}
          </span>
        ))}
        {expandedSections.has('phase1') && (
          <div className={panelClass}>
            {/* Encryption/Hash Proposals */}
            <div>
              <p className="text-xs text-neutral-400 mb-2">
                Select one or more encryption proposals. AES256-SHA256 provides strong security with broad compatibility.
              </p>
              <label className={labelClass}>Encryption/Hash Proposals</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                {P1_PROPOSALS.map(p => (
                  <label key={p.value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-red-500 transition-colors">
                    <input
                      type="checkbox"
                      className="rounded accent-red-700"
                      checked={config.p1p.includes(p.value)}
                      onChange={() => toggleArrayValue('p1p', p.value)}
                    />
                    <span className="text-neutral-300">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* DH Groups */}
            <div>
              <p className="text-xs text-neutral-400 mb-2">
                DH Groups 19-21 (Elliptic Curve) provide the strongest key exchange. Groups below 15 are considered weak.
              </p>
              <label className={labelClass}>DH Groups</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                {DH_GROUPS.map(g => (
                  <label key={g.value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-red-500 transition-colors">
                    <input
                      type="checkbox"
                      className="rounded accent-red-700"
                      checked={config.p1d.includes(g.value)}
                      onChange={() => toggleArrayValue('p1d', g.value)}
                    />
                    <span className={`${g.strength === 'legacy' ? 'text-red-500' : g.strength === 'strong' ? 'text-neutral-300' : 'text-neutral-300'}`}>
                      {g.label}
                    </span>
                  </label>
                ))}
              </div>
              {dhBadge?.label === 'WEAK' && (
                <p className="text-xs text-red-500 font-medium mt-2">DH groups below 15 are not recommended for production use.</p>
              )}
            </div>

            {/* Key Lifetime, NAT Traversal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass} htmlFor="p1kl">Key Lifetime (sec)</label>
                <input
                  id="p1kl"
                  type="number"
                  min={120}
                  placeholder="86400"
                  className={inputClass}
                  value={config.p1kl}
                  onChange={e => updateField('p1kl', e.target.value)}
                />
                <p className={helpClass}>How long before Phase 1 keys are renegotiated. Default 86400 (24 hours).</p>
              </div>
              <div className="flex flex-col justify-center pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer hover:text-red-500 transition-colors">
                  <input
                    type="checkbox"
                    className="rounded accent-red-700"
                    checked={config.natTrav}
                    onChange={e => updateField('natTrav', e.target.checked)}
                  />
                  <span className="text-neutral-300">NAT Traversal</span>
                </label>
                <p className={`${helpClass} ml-6`}>Required when clients are behind NAT. Encapsulates IPsec in UDP 4500.</p>
              </div>
            </div>

            {/* DPD */}
            <div className="border-t border-neutral-700 pt-4">
              <label className="flex items-center gap-2 text-xs font-semibold mb-1 cursor-pointer hover:text-red-500 transition-colors">
                <input
                  type="checkbox"
                  className="rounded accent-red-700"
                  checked={config.dpdOn}
                  onChange={e => updateField('dpdOn', e.target.checked)}
                />
                <span className="text-neutral-300">Dead Peer Detection (DPD)</span>
              </label>
              <p className={`${helpClass} ml-6 mb-3`}>Detects unresponsive peers and tears down stale tunnels to free resources.</p>
              {config.dpdOn && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="dpdInt">DPD Interval (sec)</label>
                    <input
                      id="dpdInt"
                      type="number"
                      min={1}
                      className={inputClass}
                      value={config.dpdInt}
                      onChange={e => updateField('dpdInt', e.target.value)}
                    />
                    <p className={helpClass}>Seconds between keepalive probes. Default 10.</p>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="dpdRet">DPD Retry Count</label>
                    <input
                      id="dpdRet"
                      type="number"
                      min={1}
                      className={inputClass}
                      value={config.dpdRet}
                      onChange={e => updateField('dpdRet', e.target.value)}
                    />
                    <p className={helpClass}>Failed probes before tunnel is declared dead. Default 3.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Phase 2 (IPsec) */}
      <section className={sectionClass}>
        {renderSectionHeader('phase2', 3, 'Phase 2 (IPsec)')}
        {expandedSections.has('phase2') && (
          <div className={panelClass}>
            <div>
              <p className="text-xs text-neutral-400 mb-2">
                Phase 2 proposals protect the actual data traffic. Should match or exceed Phase 1 strength.
              </p>
              <label className={labelClass}>Encryption/Hash Proposals</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                {P2_PROPOSALS.map(p => (
                  <label key={p.value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-red-500 transition-colors">
                    <input
                      type="checkbox"
                      className="rounded accent-red-700"
                      checked={config.p2p.includes(p.value)}
                      onChange={() => toggleArrayValue('p2p', p.value)}
                    />
                    <span className="text-neutral-300">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer hover:text-red-500 transition-colors">
                  <input
                    type="checkbox"
                    className="rounded accent-red-700"
                    checked={config.pfsOn}
                    onChange={e => updateField('pfsOn', e.target.checked)}
                  />
                  <span className="text-neutral-300">Enable PFS</span>
                </label>
                <p className={`${helpClass} ml-6`}>Perfect Forward Secrecy generates fresh keys for each session, preventing bulk decryption if a key is compromised.</p>
              </div>
              {config.pfsOn && (
                <div>
                  <label className={labelClass} htmlFor="pfsDh">PFS DH Group</label>
                  <select
                    id="pfsDh"
                    className={inputClass}
                    value={config.pfsDh}
                    onChange={e => updateField('pfsDh', e.target.value)}
                  >
                    {PFS_DH_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className={helpClass}>DH group used for PFS key exchange. Use 19+ for strongest protection.</p>
                </div>
              )}
              <div>
                <label className={labelClass} htmlFor="p2kl">Key Lifetime (sec)</label>
                <input
                  id="p2kl"
                  type="number"
                  min={120}
                  placeholder="43200"
                  className={inputClass}
                  value={config.p2kl}
                  onChange={e => updateField('p2kl', e.target.value)}
                />
                <p className={helpClass}>Phase 2 rekey interval. Default 43200 (12 hours). Shorter = more secure.</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 4: IP Addressing & DNS */}
      <section className={sectionClass}>
        {renderSectionHeader('ipDns', 4, 'IP Addressing & DNS')}
        {expandedSections.has('ipDns') && (
          <div className={panelClass}>
            <p className="text-xs text-neutral-400 -mt-1 mb-1">
              Define the IP pool assigned to VPN clients and DNS settings for name resolution while connected.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="startIp">IPv4 Start IP</label>
                <input
                  id="startIp"
                  type="text"
                  placeholder="10.212.134.1"
                  className={`${inputClass} ${ipRangeError && config.startIp ? 'border-red-500' : ''}`}
                  value={config.startIp}
                  onChange={e => updateField('startIp', e.target.value)}
                />
                <p className={helpClass}>First address in the VPN client pool. Use a dedicated /24 that doesn't overlap with LAN subnets.</p>
              </div>
              <div>
                <label className={labelClass} htmlFor="endIp">IPv4 End IP</label>
                <input
                  id="endIp"
                  type="text"
                  placeholder="10.212.134.254"
                  className={`${inputClass} ${ipRangeError && config.endIp ? 'border-red-500' : ''}`}
                  value={config.endIp}
                  onChange={e => updateField('endIp', e.target.value)}
                />
                <p className={helpClass}>Last address in the pool. The range determines max concurrent VPN users.</p>
              </div>
            </div>
            {ipRangeError && (
              <p className="text-xs text-red-500 font-semibold -mt-2">{ipRangeError}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass} htmlFor="dnsMode">DNS Mode</label>
                <select
                  id="dnsMode"
                  className={inputClass}
                  value={config.dnsMode}
                  onChange={e => updateField('dnsMode', e.target.value)}
                >
                  <option value="auto">auto</option>
                  <option value="manual">manual</option>
                </select>
                <p className={helpClass}>Auto uses the FortiGate's configured DNS. Manual lets you specify servers below.</p>
              </div>
              {config.dnsMode === 'manual' && (
                <>
                  <div>
                    <label className={labelClass} htmlFor="dns1">Primary DNS</label>
                    <input
                      id="dns1"
                      type="text"
                      placeholder="8.8.8.8"
                      className={inputClass}
                      value={config.dns1}
                      onChange={e => updateField('dns1', e.target.value)}
                    />
                    <p className={helpClass}>DNS server pushed to VPN clients for name resolution.</p>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="dns2">Secondary DNS</label>
                    <input
                      id="dns2"
                      type="text"
                      placeholder="8.8.4.4"
                      className={inputClass}
                      value={config.dns2}
                      onChange={e => updateField('dns2', e.target.value)}
                    />
                    <p className={helpClass}>Fallback DNS if primary is unreachable.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Section 5: Split Tunneling */}
      <section className={sectionClass}>
        {renderSectionHeader('splitTunnel', 5, 'Split Tunneling')}
        {expandedSections.has('splitTunnel') && (
          <div className={panelClass}>
            <div>
              <label className={labelClass} htmlFor="splitMode">Mode</label>
              <select
                id="splitMode"
                className={`${inputClass} w-full sm:w-72`}
                value={config.splitMode}
                onChange={e => updateField('splitMode', e.target.value)}
              >
                <option value="disabled">Disabled [Full Tunnel]</option>
                <option value="enabled">Enabled [Split Tunnel]</option>
              </select>
            </div>
            {config.splitMode === 'enabled' && (
              <div className="space-y-3">
                <div>
                  <label className={labelClass} htmlFor="splitGrpName">Address Group Name (Optional)</label>
                  <input
                    id="splitGrpName"
                    type="text"
                    placeholder="Protected-Networks"
                    className={inputClass}
                    value={config.splitGrpName}
                    onChange={e => updateField('splitGrpName', e.target.value)}
                  />
                  <p className={helpClass}>
                    <strong>Custom name for the address group.</strong> If subnets are listed below, creates a new group with this name.
                    If no subnets, references an existing FortiGate group. Leave empty to auto-generate name.
                  </p>
                </div>
                <div>
                  <label className={labelClass} htmlFor="splitNets">Protected Subnets (CIDR)</label>
                  <textarea
                    id="splitNets"
                    rows={4}
                    placeholder={"192.168.1.0/24\n10.0.0.0/8\n172.16.0.0/12"}
                    className={`${inputClass} font-mono text-sm`}
                    value={config.splitNets}
                    onChange={e => updateField('splitNets', e.target.value)}
                  />
                  <p className={helpClass}>
                    Enter one CIDR subnet per line. Only traffic to these networks will route through the VPN.
                    <strong> Leave empty to reference an existing address group by name above.</strong>
                  </p>
                  {cidrError && (
                    <p className="text-xs text-red-500 font-semibold mt-1">{cidrError}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 6: Entra ID / SAML */}
      <section className={sectionClass}>
        {renderSectionHeader('entraSaml', 6, 'Entra ID / SAML')}
        {expandedSections.has('entraSaml') && (
          <div className="px-5 pb-5 space-y-5">
            {/* SAML Server Name + FQDN display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="samlName">SAML Server Name</label>
                <input
                  id="samlName"
                  type="text"
                  placeholder="Entra-ID-SAML"
                  className={inputClass}
                  value={config.samlName}
                  onChange={e => updateField('samlName', e.target.value)}
                />
                <p className={helpClass}>Unique name for your SAML server object. Use alphanumeric and hyphens.</p>
              </div>
              <div>
                <label className={labelClass}>FortiGate FQDN</label>
                <input
                  type="text"
                  readOnly
                  className={`${inputClass} bg-neutral-950 text-neutral-500 cursor-not-allowed`}
                  value={config.tunnels[0]?.fqdn || ''}
                />
                <p className={helpClass}>Automatically populated from tunnel configuration.</p>
              </div>
            </div>

            {/* Auto-generated SAML URLs */}
            <div className="rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700/50 p-4 space-y-2.5 shadow-inner">
              <p className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                Auto-Generated SAML URLs
              </p>
              <div>
                <span className="text-xs text-neutral-400 font-semibold">Entity ID:</span>
                <p className="text-xs font-mono text-red-400 break-all mt-0.5">
                  {samlUrls?.entityId || '\u2014'}
                </p>
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-semibold">ACS URL:</span>
                <p className="text-xs font-mono text-red-400 break-all mt-0.5">
                  {samlUrls?.acsUrl || '\u2014'}
                </p>
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-semibold">SLO URL:</span>
                <p className="text-xs font-mono text-red-400 break-all mt-0.5">
                  {samlUrls?.sloUrl || '\u2014'}
                </p>
              </div>
            </div>

            {/* Entra URLs */}
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Copy these URLs from your Azure Enterprise Application's SAML configuration page (Single sign-on section).
              </p>
              <div>
                <label className={labelClass} htmlFor="eLoginUrl">Entra ID Login URL</label>
                <input
                  id="eLoginUrl"
                  type="url"
                  placeholder="https://login.microsoftonline.com/{tenant-id}/saml2"
                  className={inputClass}
                  value={config.eLoginUrl}
                  onChange={e => updateField('eLoginUrl', e.target.value)}
                />
                <p className={helpClass}>The SAML 2.0 endpoint where FortiGate redirects users for authentication.</p>
              </div>
              <div>
                <label className={labelClass} htmlFor="eEntityId">Entra ID Entity ID / Identifier</label>
                <input
                  id="eEntityId"
                  type="url"
                  placeholder="https://sts.windows.net/{tenant-id}/"
                  className={inputClass}
                  value={config.eEntityId}
                  onChange={e => updateField('eEntityId', e.target.value)}
                />
                <p className={helpClass}>Azure AD's unique identifier for SAML assertions. Also called the Issuer URL.</p>
              </div>
              <div>
                <label className={labelClass} htmlFor="eLogoutUrl">Entra ID Logout URL</label>
                <input
                  id="eLogoutUrl"
                  type="url"
                  placeholder="https://login.microsoftonline.com/{tenant-id}/saml2"
                  className={inputClass}
                  value={config.eLogoutUrl}
                  onChange={e => updateField('eLogoutUrl', e.target.value)}
                />
                <p className={helpClass}>Where users are redirected when they disconnect from the VPN to end their SSO session.</p>
              </div>
            </div>

            {/* Certificate Prerequisites Alert */}
            <div className="rounded-xl bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-800/50 p-4 shadow-sm">
              <p className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                Certificate Prerequisites
              </p>
              <ol className="text-xs text-amber-400 list-decimal list-inside space-y-1 leading-relaxed">
                <li>Download the Base64 certificate from Azure Enterprise Application</li>
                <li>Import to FortiGate: System &gt; Certificates &gt; Import &gt; Remote Certificate</li>
                <li>Note the certificate name (e.g. &apos;REMOTE_Cert_1&apos; or give it a custom name)</li>
              </ol>
            </div>

            {/* Certificate Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="idpCert">Entra ID Certificate Name</label>
                <input
                  id="idpCert"
                  type="text"
                  placeholder="Entra-SAML-Cert"
                  className={inputClass}
                  value={config.idpCert}
                  onChange={e => updateField('idpCert', e.target.value)}
                />
                <p className={helpClass}>The name you assigned when importing the Entra ID remote certificate to FortiGate.</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">
                  For testing: Use &apos;Fortinet_Factory&apos;. For production: use a cert matching your FQDN.
                </p>
                <label className={labelClass} htmlFor="srvCert">FortiGate Server Certificate</label>
                <input
                  id="srvCert"
                  type="text"
                  placeholder="Fortinet_Factory"
                  className={inputClass}
                  value={config.srvCert}
                  onChange={e => updateField('srvCert', e.target.value)}
                />
                <p className={helpClass}>The local certificate FortiGate presents to VPN clients during connection.</p>
              </div>
            </div>

            {/* User Groups */}
            <div className="border-t border-neutral-700 pt-5 space-y-4">
              <p className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider">User Group Configuration</p>
              <UserGroupSection
                userGroups={config.userGroups}
                addUserGroup={addUserGroup}
                removeUserGroup={removeUserGroup}
                updateUserGroup={updateUserGroup}
              />

              {/* Object ID help */}
              <div className="rounded-xl bg-gradient-to-r from-neutral-800/30 to-neutral-700/20 border border-neutral-600/50 p-3.5 shadow-sm">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  <strong className="font-bold">Finding the Object ID:</strong> Azure Portal &rarr; Microsoft Entra ID &rarr; Groups &rarr; Select group &rarr; Copy Object ID from Overview page
                </p>
              </div>

              {/* Group at Phase 1 checkbox */}
              <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-red-500 transition-colors">
                  <input
                    type="checkbox"
                    className="rounded accent-red-700"
                    checked={config.grpP1}
                    onChange={e => updateField('grpP1', e.target.checked)}
                  />
                  <span className="text-xs font-semibold text-neutral-300">Apply user groups in Phase 1 tunnel configuration</span>
                </label>
                <p className={`${helpClass} ml-6 mt-1`}>
                  <strong>Unchecked (Recommended):</strong> Apply user group authorization in firewall policies for maximum flexibility.
                  <br /><strong>Checked:</strong> Enforce user group restrictions directly at the VPN tunnel level.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 7: Advanced Options */}
      <section className={sectionClass}>
        {renderSectionHeader('advanced', 7, 'Advanced Options')}
        {expandedSections.has('advanced') && (
          <div className={panelClass}>
            {/* Boolean toggles */}
            <div className="flex flex-wrap gap-x-6 gap-y-2.5">
              {[
                { field: 'autoNeg' as const, label: 'Client Auto-Negotiate' },
                { field: 'keepAlive' as const, label: 'Client Keep-Alive' },
                { field: 'childless' as const, label: 'Childless IKE' },
                { field: 'savePw' as const, label: 'Save Password' },
              ].map(toggle => (
                <label key={toggle.field} className="flex items-center gap-2 text-xs font-semibold cursor-pointer hover:text-red-500 transition-colors">
                  <input
                    type="checkbox"
                    className="rounded accent-red-700"
                    checked={config[toggle.field] as boolean}
                    onChange={e => updateField(toggle.field, e.target.checked)}
                  />
                  <span className="text-neutral-300">{toggle.label}</span>
                </label>
              ))}
            </div>

            {/* PSK */}
            <div>
              <label className={labelClass} htmlFor="psk">
                Pre-Shared Key (PSK) <span className="text-amber-500 text-[10px] font-normal normal-case">FortiClient XML only</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="psk"
                  type={showPsk ? 'text' : 'password'}
                  placeholder="Enter PSK for FortiClient XML export"
                  className={`${inputClass} flex-1 font-mono text-sm`}
                  value={config.psk}
                  onChange={e => updateField('psk', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPsk(!showPsk)}
                  className="px-3 py-2.5 rounded-lg border border-neutral-600 hover:bg-neutral-700 transition-all text-xs font-bold"
                  title="Show/Hide PSK"
                >
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {showPsk ? (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </>
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              <p className={helpClass}>Required for FortiClient XML profile. The PSK is excluded from CLI/GUI outputs for security.</p>
            </div>

            {/* Banner */}
            <div>
              <label className={labelClass} htmlFor="banner">Banner Message</label>
              <textarea
                id="banner"
                rows={2}
                placeholder="Welcome to Corporate VPN"
                className={inputClass}
                value={config.banner}
                onChange={e => updateField('banner', e.target.value)}
              />
              <p className={helpClass}>Displayed to users after successful VPN connection. Use for AUP notices or welcome messages.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default IPsecRemoteAccessForm;
