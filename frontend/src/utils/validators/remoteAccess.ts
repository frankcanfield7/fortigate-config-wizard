/**
 * Validators for IPSEC Remote Access VPN configuration
 * Ported from fortigatevpngenerator-index.html validation logic
 * Non-blocking: empty fields are always valid (all fields optional)
 */

import type { ValidationResult } from '../validators';

// Regex patterns matching the HTML generator
const reIP = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const reCIDR = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)\/(3[0-2]|[12]?\d)$/;
const reUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const reFQDN = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

function ip2n(ip: string): number {
  return ip.split('.').reduce((a, b) => (a << 8) + parseInt(b), 0) >>> 0;
}

export function validateFQDN(value: string): ValidationResult {
  if (!value || value.trim() === '') return { isValid: true };
  const v = value.trim();
  if (reFQDN.test(v) || reIP.test(v)) return { isValid: true };
  return { isValid: false, error: 'Enter a valid FQDN or IP address' };
}

export function validateIPAddress(value: string): ValidationResult {
  if (!value || value.trim() === '') return { isValid: true };
  if (reIP.test(value.trim())) return { isValid: true };
  return { isValid: false, error: 'Invalid IP address format' };
}

export function validateIPRange(startIp: string, endIp: string): ValidationResult {
  if (!startIp && !endIp) return { isValid: true };
  if (startIp && !reIP.test(startIp)) return { isValid: false, error: 'Invalid start IP format' };
  if (endIp && !reIP.test(endIp)) return { isValid: false, error: 'Invalid end IP format' };
  if (startIp && endIp && reIP.test(startIp) && reIP.test(endIp)) {
    if (ip2n(startIp) >= ip2n(endIp)) {
      return { isValid: false, error: 'Start IP must be less than End IP' };
    }
  }
  return { isValid: true };
}

export function validateUUID(value: string): ValidationResult {
  if (!value || value.trim() === '') return { isValid: true };
  if (reUUID.test(value.trim())) return { isValid: true };
  return { isValid: false, error: 'Invalid UUID format (8-4-4-4-12)' };
}

export function validateURL(value: string): ValidationResult {
  if (!value || value.trim() === '') return { isValid: true };
  try {
    new URL(value.trim());
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

export function validateSAMLPort(value: string): ValidationResult {
  if (!value || value.trim() === '') return { isValid: true };
  const port = parseInt(value, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    return { isValid: false, error: 'Port must be between 1 and 65535' };
  }
  return { isValid: true };
}

export function validateCIDRList(text: string): ValidationResult {
  if (!text || text.trim() === '') return { isValid: true };
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return { isValid: true };
  const bad = lines.filter(l => !reCIDR.test(l));
  if (bad.length > 0) {
    return { isValid: false, error: 'Invalid CIDR: ' + bad.join(', ') };
  }
  return { isValid: true };
}

export function validateTunnelName(value: string): ValidationResult {
  if (!value || value.trim() === '') return { isValid: true };
  if (/^[A-Za-z0-9-]+$/.test(value.trim())) return { isValid: true };
  return { isValid: false, error: 'Only letters, numbers, and hyphens allowed' };
}

export function validateGroupName(value: string): ValidationResult {
  if (!value || value.trim() === '') return { isValid: true };
  if (/^[A-Za-z0-9_-]+$/.test(value.trim())) return { isValid: true };
  return { isValid: false, error: 'Only letters, numbers, underscores, and hyphens allowed' };
}

export function validateKeyLifetime(value: string): ValidationResult {
  if (!value || value.trim() === '') return { isValid: true };
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 120 || num > 172800) {
    return { isValid: false, error: 'Key lifetime must be between 120 and 172800 seconds' };
  }
  return { isValid: true };
}
