import React, { useMemo } from 'react';
import type { IPsecRemoteAccessConfig } from '../../../types';

interface SecurityScoreProps {
  config: IPsecRemoteAccessConfig;
}

const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function computeScore(config: IPsecRemoteAccessConfig): number {
  let s = 0;

  // DH Group strength (0-30 points)
  const dh = config.p1d.map(Number);
  if (dh.every(g => g >= 19) && dh.length) s += 30;
  else if (dh.every(g => g >= 15) && dh.length) s += 20;
  else if (dh.length) s += 5;

  // Phase 1 encryption (0-20 points)
  const p1 = config.p1p;
  if (p1.includes('aes256-sha256')) s += 15;
  else if (p1.length) s += 8;
  if (p1.some(x => x.includes('gcm') || x.includes('chacha'))) s += 5;

  // PFS (15 points)
  if (config.pfsOn) s += 15;

  // Port security (0-10 points)
  const port = parseInt(config.tunnels[0]?.port) || 0;
  if (port > 0 && port !== 10428) s += 10;
  else if (port === 10428) s += 3;

  // Features (5 points each)
  if (config.dpdOn) s += 5;
  if (config.natTrav) s += 5;
  if (config.childless) s += 5;

  // Phase 2 encryption (0-10 points)
  const p2 = config.p2p;
  if (p2.includes('aes256-sha256') || p2.some(x => x.includes('gcm'))) s += 10;
  else if (p2.length) s += 5;

  return Math.min(s, 100);
}

function computeCompleteness(config: IPsecRemoteAccessConfig): number {
  const sharedFields = ['startIp', 'endIp', 'samlName', 'eLoginUrl', 'eEntityId', 'eLogoutUrl', 'idpCert'] as const;
  let filled = sharedFields.filter(id => config[id as keyof IPsecRemoteAccessConfig]).length;

  // Count filled tunnel fields (name, fqdn, port per tunnel)
  config.tunnels.forEach(t => {
    if (t.name) filled++;
    if (t.fqdn) filled++;
    if (t.port) filled++;
  });

  // Count filled user groups
  filled += config.userGroups.filter(g => g.name || g.objId).length;

  const tunnelFields = config.tunnels.length * 3;
  const totalFields = sharedFields.length + tunnelFields + 2;
  const extras = (config.p1p.length > 0 ? 1 : 0) + (config.p1d.length > 0 ? 1 : 0) + (config.p2p.length > 0 ? 1 : 0);
  const pct = Math.round(((filled + extras) / (totalFields + 3)) * 100);

  return pct;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

function getDhBadge(config: IPsecRemoteAccessConfig): { label: string; color: string } | null {
  const dh = config.p1d.map(Number);
  if (!dh.length) return null;
  if (dh.every(g => g >= 19)) return { label: 'STRONG', color: 'text-green-500' };
  if (dh.some(g => g < 15)) return { label: 'WEAK', color: 'text-red-500' };
  return null;
}

const SecurityScore: React.FC<SecurityScoreProps> = ({ config }) => {
  const score = useMemo(() => computeScore(config), [config]);
  const completeness = useMemo(() => computeCompleteness(config), [config]);
  const scoreColor = useMemo(() => getScoreColor(score), [score]);
  const dhBadge = useMemo(() => getDhBadge(config), [config]);
  const dashOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="flex items-center gap-4">
      {/* Security Score Ring */}
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10">
          <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-90">
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r={RADIUS}
              fill="none"
              strokeWidth="4"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            {/* Foreground circle (score arc) */}
            <circle
              cx="20"
              cy="20"
              r={RADIUS}
              fill="none"
              strokeWidth="4"
              stroke={scoreColor}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.6s ease-in-out',
              }}
            />
          </svg>
          {/* Score number in center */}
          <span
            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
            style={{ color: scoreColor }}
          >
            {score}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Security
          </span>
          {dhBadge && (
            <span className={`text-[10px] font-bold ${dhBadge.color}`}>
              DH: {dhBadge.label}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

      {/* Completeness Bar */}
      <div className="flex flex-col gap-1 min-w-[100px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Completeness
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {completeness}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-500 ease-in-out"
            style={{ width: `${Math.min(completeness, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SecurityScore;
