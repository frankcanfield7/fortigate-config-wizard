import React, { useState } from 'react';
import type { TunnelConfig } from '../../../types';
import {
  validateTunnelName,
  validateFQDN,
  validateSAMLPort,
} from '../../../utils/validators/remoteAccess';

interface TunnelSectionProps {
  tunnels: TunnelConfig[];
  addTunnel: () => void;
  removeTunnel: (index: number) => void;
  updateTunnel: (index: number, field: keyof TunnelConfig, value: string) => void;
}

const WAN_OPTIONS = [
  { value: 'wan1', label: 'wan1' },
  { value: 'wan2', label: 'wan2' },
  { value: 'port1', label: 'port1' },
  { value: 'port2', label: 'port2' },
  { value: 'port3', label: 'port3' },
  { value: 'port4', label: 'port4' },
];

/**
 * Determine border color class based on validation state.
 * Returns neutral border for empty values, green for valid, red for invalid.
 */
function borderClass(value: string, validate: (v: string) => { isValid: boolean }): string {
  if (!value || value.trim() === '') return 'border-neutral-600';
  return validate(value).isValid ? 'border-green-500' : 'border-red-500';
}

const INPUT_BASE =
  'w-full rounded-lg border bg-neutral-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-600 hover:border-neutral-400 hover:bg-neutral-800/80 hover:shadow-[0_0_12px_rgba(120,120,120,0.06)] text-white placeholder-neutral-500 transition-all duration-200';

const HELP_CLASS = 'text-xs text-neutral-400 mt-1.5 leading-relaxed';

const TunnelSection: React.FC<TunnelSectionProps> = ({
  tunnels,
  addTunnel,
  removeTunnel,
  updateTunnel,
}) => {
  // Track which fields have been touched so validation only fires after interaction
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touchKey = (index: number, field: string) => `${index}-${field}`;

  const markTouched = (index: number, field: string) => {
    const key = touchKey(index, field);
    if (!touched[key]) {
      setTouched((prev) => ({ ...prev, [key]: true }));
    }
  };

  const isTouched = (index: number, field: string) => !!touched[touchKey(index, field)];

  /**
   * Get the appropriate border class for a validated field.
   * Only shows validation colors after the field has been touched.
   */
  const getFieldBorder = (
    index: number,
    field: string,
    value: string,
    validate: (v: string) => { isValid: boolean },
  ): string => {
    if (!isTouched(index, field)) return 'border-neutral-600';
    return borderClass(value, validate);
  };

  return (
    <div className="space-y-4">
      {tunnels.map((tunnel, index) => (
        <div
          key={index}
          className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 shadow-sm transition-all duration-300 relative"
        >
          {/* Tunnel number badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center justify-center bg-red-800 text-white text-xs font-bold rounded px-2 py-0.5">
              #{index + 1}
            </span>

            {/* Remove button - hidden for the first tunnel (index 0) */}
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeTunnel(index)}
                className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
                aria-label={`Remove tunnel #${index + 1}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* VPN Tunnel Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                VPN Tunnel Name
              </label>
              <input
                type="text"
                value={tunnel.name}
                placeholder="Corporate-VPN-SAML"
                onChange={(e) => {
                  markTouched(index, 'name');
                  updateTunnel(index, 'name', e.target.value);
                }}
                onBlur={() => markTouched(index, 'name')}
                className={`${INPUT_BASE} ${getFieldBorder(index, 'name', tunnel.name, validateTunnelName)}`}
              />
              {isTouched(index, 'name') &&
                tunnel.name.trim() !== '' &&
                !validateTunnelName(tunnel.name).isValid && (
                  <p className="mt-1 text-xs text-red-500">
                    {validateTunnelName(tunnel.name).error}
                  </p>
                )}
              <p className={HELP_CLASS}>Unique name for this VPN tunnel. Alphanumeric and hyphens only.</p>
            </div>

            {/* Description / Comments */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Description / Comments
              </label>
              <input
                type="text"
                value={tunnel.comments}
                placeholder="Optional"
                onChange={(e) => updateTunnel(index, 'comments', e.target.value)}
                className={`${INPUT_BASE} border-neutral-600`}
              />
              <p className={HELP_CLASS}>Optional note for identifying this tunnel's purpose.</p>
            </div>

            {/* WAN Interface */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                WAN Interface
              </label>
              <select
                value={tunnel.wanIf}
                onChange={(e) => updateTunnel(index, 'wanIf', e.target.value)}
                className={`${INPUT_BASE} border-neutral-600`}
              >
                {WAN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className={HELP_CLASS}>The physical interface accepting inbound VPN connections.</p>
            </div>

            {/* FortiGate Public FQDN / IP */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                FortiGate Public FQDN / IP
              </label>
              <input
                type="text"
                value={tunnel.fqdn}
                placeholder="vpn.company.com"
                onChange={(e) => {
                  markTouched(index, 'fqdn');
                  updateTunnel(index, 'fqdn', e.target.value);
                }}
                onBlur={() => markTouched(index, 'fqdn')}
                className={`${INPUT_BASE} ${getFieldBorder(index, 'fqdn', tunnel.fqdn, validateFQDN)}`}
              />
              {isTouched(index, 'fqdn') &&
                tunnel.fqdn.trim() !== '' &&
                !validateFQDN(tunnel.fqdn).isValid && (
                  <p className="mt-1 text-xs text-red-500">
                    {validateFQDN(tunnel.fqdn).error}
                  </p>
                )}
              <p className={HELP_CLASS}>Public-facing hostname or IP. Used to build SAML URLs automatically.</p>
            </div>

            {/* IKE-SAML Port */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                IKE-SAML Port
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={tunnel.port}
                placeholder="10428"
                onChange={(e) => {
                  markTouched(index, 'port');
                  updateTunnel(index, 'port', e.target.value);
                }}
                onBlur={() => markTouched(index, 'port')}
                className={`${INPUT_BASE} ${getFieldBorder(index, 'port', tunnel.port, validateSAMLPort)}`}
              />
              {isTouched(index, 'port') &&
                tunnel.port.trim() !== '' &&
                !validateSAMLPort(tunnel.port).isValid && (
                  <p className="mt-1 text-xs text-red-500">
                    {validateSAMLPort(tunnel.port).error}
                  </p>
                )}
              <p className={HELP_CLASS}>TCP port for SAML browser redirect. Default 10428. Use a non-standard port for added security.</p>
            </div>
          </div>
        </div>
      ))}

      {/* Add Tunnel button */}
      <button
        type="button"
        onClick={addTunnel}
        className="bg-red-800 hover:bg-red-900 text-white rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Add Tunnel
      </button>
    </div>
  );
};

export default TunnelSection;
