// User types
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Configuration types
export interface Configuration {
  id: number;
  user_id: number;
  config_type: string;
  name: string;
  description?: string;
  data_json: string;
  tags?: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfigurationCreate {
  config_type: string;
  name: string;
  description?: string;
  data: Record<string, any>;
  tags?: string;
  is_template?: boolean;
}

export interface ConfigurationUpdate {
  name?: string;
  description?: string;
  data?: Record<string, any>;
  tags?: string;
  is_template?: boolean;
  change_description?: string;
}

// Version types
export interface ConfigurationVersion {
  id: number;
  config_id: number;
  version: number;
  data_json: string;
  change_description?: string;
  created_at: string;
  created_by: number;
}

// IPSEC Remote Access VPN Configuration types
export interface TunnelConfig {
  name: string;
  comments: string;
  wanIf: string;
  fqdn: string;
  port: string;
}

export interface UserGroupConfig {
  name: string;
  objId: string;
}

export interface IPsecRemoteAccessConfig {
  // Section 1: IPSEC Tunnels
  tunnels: TunnelConfig[];

  // Section 2: Phase 1 (IKEv2)
  p1p: string[];
  p1d: string[];
  p1kl: string;
  natTrav: boolean;
  dpdOn: boolean;
  dpdInt: string;
  dpdRet: string;

  // Section 3: Phase 2 (IPsec)
  p2p: string[];
  pfsOn: boolean;
  pfsDh: string;
  p2kl: string;

  // Section 4: IP Addressing & DNS
  startIp: string;
  endIp: string;
  dnsMode: string;
  dns1: string;
  dns2: string;

  // Section 5: Split Tunneling
  splitMode: string;
  splitGrpName: string;
  splitNets: string;

  // Section 6: Entra ID / SAML
  samlName: string;
  eLoginUrl: string;
  eEntityId: string;
  eLogoutUrl: string;
  idpCert: string;
  srvCert: string;
  userGroups: UserGroupConfig[];

  // Section 7: Advanced Options
  grpP1: boolean;
  autoNeg: boolean;
  keepAlive: boolean;
  childless: boolean;
  savePw: boolean;
  banner: string;
  psk: string;
}

export function createDefaultIPsecRemoteAccessConfig(): IPsecRemoteAccessConfig {
  return {
    tunnels: [{ name: 'Corporate-VPN-SAML', comments: '', wanIf: 'wan1', fqdn: '', port: '10428' }],
    p1p: ['aes256-sha256', 'aes128-sha256'],
    p1d: ['19', '20', '21'],
    p1kl: '86400',
    natTrav: true,
    dpdOn: true,
    dpdInt: '5',
    dpdRet: '3',
    p2p: ['aes256-sha256', 'aes128-sha256'],
    pfsOn: true,
    pfsDh: '19',
    p2kl: '43200',
    startIp: '',
    endIp: '',
    dnsMode: 'auto',
    dns1: '',
    dns2: '',
    splitMode: 'disabled',
    splitGrpName: '',
    splitNets: '',
    samlName: '',
    eLoginUrl: '',
    eEntityId: '',
    eLogoutUrl: '',
    idpCert: '',
    srvCert: 'Fortinet_Factory',
    userGroups: [{ name: 'SAML-Entra-VPN-Users', objId: '' }],
    grpP1: false,
    autoNeg: true,
    keepAlive: true,
    childless: true,
    savePw: true,
    banner: '',
    psk: '',
  };
}

// API response types
export interface ApiError {
  error: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
