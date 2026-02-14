/**
 * Documentation Generator
 *
 * Generates a Markdown document summarizing the IPSEC Remote Access VPN
 * configuration for change management, handoff, or archival purposes.
 */

import type { IPsecRemoteAccessConfig } from '../../types';

// Proposal label mappings
const PROPOSAL_LABELS: Record<string, string> = {
  'aes256-sha256': 'AES-256 / SHA-256',
  'aes128-sha256': 'AES-128 / SHA-256',
  'aes256gcm': 'AES-256 GCM',
  'aes128gcm': 'AES-128 GCM',
  'chacha20poly1305': 'ChaCha20-Poly1305',
};

const DH_LABELS: Record<string, string> = {
  '14': 'Group 14 (2048-bit MODP)',
  '15': 'Group 15 (3072-bit MODP)',
  '16': 'Group 16 (4096-bit MODP)',
  '19': 'Group 19 (256-bit ECP)',
  '20': 'Group 20 (384-bit ECP)',
  '21': 'Group 21 (521-bit ECP)',
};

function propLabel(p: string): string {
  return PROPOSAL_LABELS[p] || p;
}

function dhLabel(g: string): string {
  return DH_LABELS[g] || `Group ${g}`;
}

function boolStr(v: boolean): string {
  return v ? 'Enabled' : 'Disabled';
}

export function generateDocumentation(config: IPsecRemoteAccessConfig): string {
  const lines: string[] = [];
  const date = new Date().toISOString().slice(0, 10);
  const firstTunnel = config.tunnels[0];
  const tunnelName = firstTunnel?.name || 'VPN';

  lines.push(`# IPSEC Remote Access VPN — ${tunnelName}`);
  lines.push('');
  lines.push(`**Generated:** ${date}  `);
  lines.push('**Platform:** FortiOS 7.4.11+  ');
  lines.push('**Authentication:** Entra ID SAML  ');
  lines.push('');
  lines.push('---');
  lines.push('');

  // ─── Overview ───
  lines.push('## Overview');
  lines.push('');
  lines.push(`This document describes the IPSEC Remote Access VPN configuration for **${tunnelName}**.`);
  lines.push(`It uses IKEv2 with Entra ID (Azure AD) SAML authentication and ${config.tunnels.length > 1 ? `${config.tunnels.length} redundant tunnels` : 'a single tunnel'}.`);
  lines.push('');

  // ─── Tunnel Configuration ───
  lines.push('## Tunnel Configuration');
  lines.push('');
  lines.push('| # | Tunnel Name | WAN Interface | FQDN | IKE-SAML Port |');
  lines.push('|---|-------------|---------------|------|---------------|');
  config.tunnels.forEach((t, i) => {
    lines.push(`| ${i + 1} | ${t.name || '—'} | ${t.wanIf} | ${t.fqdn || '—'} | ${t.port || '10428'} |`);
  });
  lines.push('');

  // ─── Phase 1 ───
  lines.push('## Phase 1 (IKEv2)');
  lines.push('');
  lines.push(`- **Proposals:** ${config.p1p.map(propLabel).join(', ') || 'None selected'}`);
  lines.push(`- **DH Groups:** ${config.p1d.map(dhLabel).join(', ') || 'None selected'}`);
  lines.push(`- **Key Lifetime:** ${config.p1kl || '86400'} seconds`);
  lines.push(`- **NAT Traversal:** ${boolStr(config.natTrav)}`);
  lines.push(`- **Dead Peer Detection:** ${boolStr(config.dpdOn)}`);
  if (config.dpdOn) {
    lines.push(`  - Interval: ${config.dpdInt || '5'}s / Retries: ${config.dpdRet || '3'}`);
  }
  lines.push('');

  // ─── Phase 2 ───
  lines.push('## Phase 2 (IPsec)');
  lines.push('');
  lines.push(`- **Proposals:** ${config.p2p.map(propLabel).join(', ') || 'None selected'}`);
  lines.push(`- **PFS:** ${boolStr(config.pfsOn)}${config.pfsOn && config.pfsDh ? ` (${dhLabel(config.pfsDh)})` : ''}`);
  lines.push(`- **Key Lifetime:** ${config.p2kl || '43200'} seconds`);
  lines.push('');

  // ─── IP Addressing ───
  lines.push('## IP Addressing & DNS');
  lines.push('');
  lines.push(`- **VPN Pool Start:** ${config.startIp || '(not set)'}`);
  lines.push(`- **VPN Pool End:** ${config.endIp || '(not set)'}`);
  lines.push(`- **DNS Mode:** ${config.dnsMode === 'manual' ? 'Manual' : 'Auto (FortiGate system DNS)'}`);
  if (config.dnsMode === 'manual') {
    lines.push(`  - Primary: ${config.dns1 || '(not set)'}`);
    if (config.dns2) lines.push(`  - Secondary: ${config.dns2}`);
  }
  lines.push('');

  // ─── Split Tunneling ───
  lines.push('## Split Tunneling');
  lines.push('');
  if (config.splitMode === 'disabled') {
    lines.push('Split tunneling is **disabled** — all traffic routes through VPN.');
  } else if (config.splitMode === 'enabled') {
    lines.push(`Split tunneling is **enabled** for group: \`${config.splitGrpName || '(not set)'}\``);
    if (config.splitNets) {
      lines.push('');
      lines.push('Protected subnets:');
      config.splitNets.split('\n').filter(Boolean).forEach((net) => {
        lines.push(`- \`${net.trim()}\``);
      });
    }
  } else {
    lines.push('Split tunneling mode: **Inverse** (exclude specific subnets).');
  }
  lines.push('');

  // ─── Entra SAML ───
  lines.push('## Entra ID / SAML Authentication');
  lines.push('');
  lines.push(`- **SAML Server Name:** ${config.samlName || '(not set)'}`);
  lines.push(`- **Login URL:** ${config.eLoginUrl || '(not set)'}`);
  lines.push(`- **Entity ID:** ${config.eEntityId || '(not set)'}`);
  lines.push(`- **Logout URL:** ${config.eLogoutUrl || '(not set)'}`);
  lines.push(`- **IDP Certificate:** ${config.idpCert || '(not set)'}`);
  lines.push(`- **Server Certificate:** ${config.srvCert || 'Fortinet_Factory'}`);
  lines.push('');

  if (config.userGroups.length > 0) {
    lines.push('### User Groups');
    lines.push('');
    lines.push('| Group Name | Azure Object ID |');
    lines.push('|------------|-----------------|');
    config.userGroups.forEach((g) => {
      lines.push(`| ${g.name || '—'} | \`${g.objId || '—'}\` |`);
    });
    lines.push('');
  }

  // ─── Advanced Options ───
  lines.push('## Advanced Options');
  lines.push('');
  lines.push(`- **Group Phase 1:** ${boolStr(config.grpP1)}`);
  lines.push(`- **Auto-negotiate:** ${boolStr(config.autoNeg)}`);
  lines.push(`- **Keepalive:** ${boolStr(config.keepAlive)}`);
  lines.push(`- **Childless IKEv2:** ${boolStr(config.childless)}`);
  lines.push(`- **Save Password:** ${boolStr(config.savePw)}`);
  if (config.banner) {
    lines.push(`- **Login Banner:** "${config.banner}"`);
  }
  lines.push('');

  // ─── Validation Checklist ───
  lines.push('---');
  lines.push('');
  lines.push('## Validation Checklist');
  lines.push('');
  lines.push('- [ ] Tunnel interfaces created on FortiGate');
  lines.push('- [ ] Entra ID Enterprise Application configured');
  lines.push('- [ ] SAML IdP certificate uploaded to FortiGate');
  lines.push('- [ ] User groups created with correct Azure Object IDs');
  lines.push('- [ ] Firewall policies allow VPN traffic');
  lines.push('- [ ] VPN IP pool does not overlap with LAN subnets');
  lines.push('- [ ] DNS resolution confirmed from VPN clients');
  lines.push('- [ ] FortiClient tested from external network');
  lines.push('- [ ] DPD and NAT-T verified operational');
  lines.push('- [ ] Split tunneling routes verified (if applicable)');
  lines.push('');

  return lines.join('\n');
}
