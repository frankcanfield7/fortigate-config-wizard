/**
 * Frontend validators - Mirror backend validation logic
 * Provides real-time validation for FortiGate configuration fields
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate IPv4 or IPv6 address
 */
export function validateIPAddress(ip: string): ValidationResult {
  if (!ip || ip.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipv4Match = ip.match(ipv4Pattern);

  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    const validOctets = octets.every(octet => octet >= 0 && octet <= 255);

    if (validOctets) {
      return { isValid: true };
    }
    return { isValid: false, error: 'Invalid IP address (octets must be 0-255)' };
  }

  // IPv6 pattern (simplified - matches most common formats)
  const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|::)$/;

  if (ipv6Pattern.test(ip)) {
    return { isValid: true };
  }

  return { isValid: false, error: 'Invalid IP address format' };
}

/**
 * Validate subnet in CIDR notation
 */
export function validateSubnet(subnet: string): ValidationResult {
  if (!subnet || subnet.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  // Must contain "/" for CIDR notation
  if (!subnet.includes('/')) {
    return { isValid: false, error: 'Subnet must include CIDR notation (e.g., 192.168.1.0/24)' };
  }

  const [ip, cidrStr] = subnet.split('/');

  // Validate IP part
  const ipResult = validateIPAddress(ip);
  if (!ipResult.isValid) {
    return { isValid: false, error: 'Invalid IP address in subnet' };
  }

  // Validate CIDR part
  const cidr = parseInt(cidrStr, 10);

  // Check if it's IPv4 or IPv6 based on IP format
  const isIPv6 = ip.includes(':');
  const maxCidr = isIPv6 ? 128 : 32;

  if (isNaN(cidr) || cidr < 0 || cidr > maxCidr) {
    return { isValid: false, error: `CIDR must be 0-${maxCidr}` };
  }

  return { isValid: true };
}

/**
 * Validate port number (1-65535)
 */
export function validatePort(port: string | number): ValidationResult {
  if (port === null || port === undefined || port === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNum)) {
    return { isValid: false, error: 'Port must be a number' };
  }

  if (portNum < 1 || portNum > 65535) {
    return { isValid: false, error: 'Port must be between 1 and 65535' };
  }

  return { isValid: true };
}

/**
 * Validate port range (e.g., "80-443" or "8080")
 */
export function validatePortRange(portRange: string): ValidationResult {
  if (!portRange || portRange.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  if (portRange.includes('-')) {
    // Range format: "80-443"
    const parts = portRange.split('-');

    if (parts.length !== 2) {
      return { isValid: false, error: 'Invalid port range format (use START-END)' };
    }

    const [start, end] = parts;
    const startResult = validatePort(start);
    const endResult = validatePort(end);

    if (!startResult.isValid) {
      return { isValid: false, error: `Invalid start port: ${startResult.error}` };
    }

    if (!endResult.isValid) {
      return { isValid: false, error: `Invalid end port: ${endResult.error}` };
    }

    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);

    if (startNum > endNum) {
      return { isValid: false, error: 'Start port must be less than or equal to end port' };
    }

    return { isValid: true };
  } else {
    // Single port
    return validatePort(portRange);
  }
}

/**
 * Validate FortiGate interface name
 */
export function validateInterfaceName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  // Interface names: alphanumeric, dots, hyphens, underscores
  const pattern = /^[a-zA-Z0-9._-]+$/;

  if (!pattern.test(name)) {
    return { isValid: false, error: 'Interface name can only contain letters, numbers, dots, hyphens, and underscores' };
  }

  if (name.length > 35) {
    return { isValid: false, error: 'Interface name too long (max 35 characters)' };
  }

  return { isValid: true };
}

/**
 * Validate FortiGate VDOM name
 */
export function validateVDOMName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  // VDOM names: alphanumeric, hyphens, underscores
  const pattern = /^[a-zA-Z0-9_-]+$/;

  if (!pattern.test(name)) {
    return { isValid: false, error: 'VDOM name can only contain letters, numbers, hyphens, and underscores' };
  }

  if (name.length > 31) {
    return { isValid: false, error: 'VDOM name too long (max 31 characters)' };
  }

  return { isValid: true };
}

/**
 * Validate IPsec Phase1 tunnel name (required field)
 */
export function validatePhase1Name(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Phase1 name is required' };
  }

  // Phase1 names: alphanumeric, hyphens, underscores
  const pattern = /^[a-zA-Z0-9_-]+$/;

  if (!pattern.test(name)) {
    return { isValid: false, error: 'Phase1 name can only contain letters, numbers, hyphens, and underscores' };
  }

  if (name.length > 35) {
    return { isValid: false, error: 'Phase1 name too long (max 35 characters)' };
  }

  return { isValid: true };
}

/**
 * Validate firewall policy name
 */
export function validatePolicyName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  if (name.length > 255) {
    return { isValid: false, error: 'Policy name too long (max 255 characters)' };
  }

  return { isValid: true };
}

/**
 * Validate configuration type
 */
export function validateConfigType(type: string): ValidationResult {
  const validTypes = [
    'ipsec',
    'sdwan',
    'firewall',
    'interface',
    'ha',
    'saml',
    'routing',
    'dns',
    'dhcp',
    'vpn',
    'other'
  ];

  if (!validTypes.includes(type)) {
    return { isValid: false, error: `Invalid configuration type. Must be one of: ${validTypes.join(', ')}` };
  }

  return { isValid: true };
}

/**
 * Validate tags (array or comma-separated string)
 */
export function validateTags(tags: string[] | string): ValidationResult {
  if (!tags || (Array.isArray(tags) && tags.length === 0) || (typeof tags === 'string' && tags.trim() === '')) {
    return { isValid: true }; // Empty is valid
  }

  const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

  for (const tag of tagArray) {
    if (tag.length > 50) {
      return { isValid: false, error: `Tag too long (max 50 characters): "${tag}"` };
    }
  }

  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Validate hostname (FQDN)
 */
export function validateHostname(hostname: string): ValidationResult {
  if (!hostname || hostname.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  // Hostname pattern: alphanumeric, hyphens, dots
  const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!pattern.test(hostname)) {
    return { isValid: false, error: 'Invalid hostname format' };
  }

  if (hostname.length > 255) {
    return { isValid: false, error: 'Hostname too long (max 255 characters)' };
  }

  return { isValid: true };
}

/**
 * Validate numeric value within range
 */
export function validateNumericRange(value: string | number, min: number, max: number, fieldName: string): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (num < min || num > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }

  return { isValid: true };
}
