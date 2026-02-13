/**
 * IPsec VPN Configuration Generators
 * Generates FortiGate-specific CLI commands, GUI steps, and scripts
 */

export interface IPsecFormData {
  // Network Configuration
  tunnel_name?: string;
  local_gateway?: string;
  remote_gateway?: string;
  local_subnet?: string;
  remote_subnet?: string;
  interface?: string;

  // Phase 1 Configuration
  phase1_mode?: string;
  phase1_version?: string;
  phase1_encryption?: string;
  phase1_authentication?: string;
  phase1_dh_group?: string;
  phase1_lifetime?: string;
  preshared_key?: string;

  // Phase 2 Configuration
  phase2_encryption?: string;
  phase2_authentication?: string;
  phase2_pfs?: string;
  phase2_lifetime?: string;
}

/**
 * Generate FortiGate CLI commands for IPsec VPN
 */
export function generateIPsecCLI(data: IPsecFormData): string {
  const timestamp = new Date().toLocaleString();
  const tunnelName = data.tunnel_name || 'vpn-tunnel-1';
  const phase1Name = `${tunnelName}-p1`;
  const phase2Name = `${tunnelName}-p2`;

  return `# ============================================
# FortiGate IPsec VPN Configuration
# Generated: ${timestamp}
# Tunnel: ${tunnelName}
# ============================================

# Phase 1 Configuration (IKE)
config vpn ipsec phase1-interface
    edit "${phase1Name}"
        set type static
        set interface "${data.interface || 'wan1'}"
        set ike-version ${data.phase1_version === 'ikev1' ? '1' : '2'}
        set local-gw ${data.local_gateway || '0.0.0.0'}
        set remote-gw ${data.remote_gateway || '0.0.0.0'}
        set peertype any
        set net-device disable
        set mode-cfg disable
        set proposal ${data.phase1_encryption || 'aes256'}-${data.phase1_authentication || 'sha256'}
        set dhgrp ${data.phase1_dh_group || '14'}
        set psksecret "${data.preshared_key || 'ChangeMe123!'}"
        set dpd on-idle
        set dpd-retryinterval 5
        set keylife ${data.phase1_lifetime || '86400'}
    next
end

# Phase 2 Configuration (IPsec)
config vpn ipsec phase2-interface
    edit "${phase2Name}"
        set phase1name "${phase1Name}"
        set proposal ${data.phase2_encryption || 'aes256'}-${data.phase2_authentication || 'sha256'}
        set pfs ${data.phase2_pfs === 'disable' ? 'disable' : 'enable'}
        ${data.phase2_pfs && data.phase2_pfs !== 'disable' ? `set dhgrp ${data.phase2_pfs}` : ''}
        set replay enable
        set keylifeseconds ${data.phase2_lifetime || '43200'}
        set src-subnet ${data.local_subnet || '0.0.0.0/0'}
        set dst-subnet ${data.remote_subnet || '0.0.0.0/0'}
    next
end

# Firewall Policy - Outbound
config firewall policy
    edit 0
        set name "${tunnelName}-outbound"
        set srcintf "internal"
        set dstintf "${phase1Name}"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set logtraffic all
        set comments "IPsec VPN ${tunnelName} outbound traffic"
    next
end

# Firewall Policy - Inbound
config firewall policy
    edit 0
        set name "${tunnelName}-inbound"
        set srcintf "${phase1Name}"
        set dstintf "internal"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set logtraffic all
        set comments "IPsec VPN ${tunnelName} inbound traffic"
    next
end

# Static Route (if needed)
config router static
    edit 0
        set dst ${data.remote_subnet || '0.0.0.0/0'}
        set device "${phase1Name}"
        set comment "Route to remote network via ${tunnelName}"
    next
end

# ============================================
# Configuration Complete
# ============================================
# Next Steps:
# 1. Verify Phase 1 status: get vpn ipsec phase1-interface
# 2. Verify Phase 2 status: get vpn ipsec phase2-interface
# 3. Test connectivity: execute ping-options source ${data.local_subnet?.split('/')[0] || '192.168.1.1'}
# 4. Check tunnel status: diagnose vpn tunnel list
# ============================================
`;
}

/**
 * Generate GUI configuration steps for IPsec VPN
 */
export function generateIPsecGUI(data: IPsecFormData): string {
  const tunnelName = data.tunnel_name || 'vpn-tunnel-1';
  const phase1Name = `${tunnelName}-p1`;

  return `📋 FortiGate IPsec VPN - GUI Configuration Steps
Generated: ${new Date().toLocaleString()}
Tunnel: ${tunnelName}

══════════════════════════════════════════════════
PHASE 1: Create IPsec Tunnel (IKE)
══════════════════════════════════════════════════

1. Navigate to VPN → IPsec Wizard
   - OR: VPN → IPsec Tunnels → Create New → Custom

2. Configure Phase 1 Settings:
   ┌─────────────────────────────────────────────┐
   │ Name:                ${phase1Name.padEnd(25)} │
   │ Template Type:       Custom                 │
   │ Remote Gateway:      ${(data.remote_gateway || 'Site-to-Site').padEnd(25)} │
   │ Interface:           ${(data.interface || 'wan1').padEnd(25)} │
   │ Remote IP Address:   ${(data.remote_gateway || '0.0.0.0').padEnd(25)} │
   │ Local IP Address:    ${(data.local_gateway || 'auto').padEnd(25)} │
   └─────────────────────────────────────────────┘

3. Authentication Settings:
   ┌─────────────────────────────────────────────┐
   │ Method:              Pre-shared Key         │
   │ Pre-shared Key:      ****************       │
   │ IKE Version:         ${data.phase1_version === 'ikev1' ? 'IKEv1' : 'IKEv2 (Recommended)'.padEnd(25)} │
   │ Mode:                ${data.phase1_mode === 'aggressive' ? 'Aggressive' : 'Main'.padEnd(25)} │
   └─────────────────────────────────────────────┘

4. Advanced Options:
   ┌─────────────────────────────────────────────┐
   │ Encryption:          ${(data.phase1_encryption || 'AES256').toUpperCase().padEnd(25)} │
   │ Authentication:      ${(data.phase1_authentication || 'SHA256').toUpperCase().padEnd(25)} │
   │ Diffie-Hellman:      Group ${(data.phase1_dh_group || '14').padEnd(20)} │
   │ Key Lifetime:        ${(data.phase1_lifetime || '86400').padEnd(25)} sec │
   │ DPD:                 On Idle                 │
   │ NAT Traversal:       Enable                  │
   └─────────────────────────────────────────────┘

5. Click OK to create Phase 1

══════════════════════════════════════════════════
PHASE 2: Configure IPsec Settings
══════════════════════════════════════════════════

6. In the Phase 2 Selectors section:
   - Click "Create Phase 2"

7. Configure Phase 2 Settings:
   ┌─────────────────────────────────────────────┐
   │ Name:                ${(tunnelName + '-p2').padEnd(25)} │
   │ Local Address:       ${(data.local_subnet || '192.168.1.0/24').padEnd(25)} │
   │ Remote Address:      ${(data.remote_subnet || '10.0.0.0/24').padEnd(25)} │
   └─────────────────────────────────────────────┘

8. Advanced Options:
   ┌─────────────────────────────────────────────┐
   │ Encryption:          ${(data.phase2_encryption || 'AES256').toUpperCase().padEnd(25)} │
   │ Authentication:      ${(data.phase2_authentication || 'SHA256').toUpperCase().padEnd(25)} │
   │ PFS:                 ${data.phase2_pfs === 'disable' ? 'Disabled' : `Group ${data.phase2_pfs || '14'}`.padEnd(25)} │
   │ Key Lifetime:        ${(data.phase2_lifetime || '43200').padEnd(25)} sec │
   │ Replay Detection:    Enable                  │
   └─────────────────────────────────────────────┘

9. Click OK to create Phase 2

══════════════════════════════════════════════════
PHASE 3: Create Firewall Policies
══════════════════════════════════════════════════

10. Navigate to Policy & Objects → Firewall Policy

11. Create OUTBOUND policy:
    ┌─────────────────────────────────────────────┐
    │ Name:                ${tunnelName}-outbound │
    │ Incoming Interface:  internal               │
    │ Outgoing Interface:  ${phase1Name.padEnd(25)} │
    │ Source:              all                    │
    │ Destination:         all                    │
    │ Service:             ALL                    │
    │ Action:              ACCEPT                 │
    │ NAT:                 Disable                │
    │ Security Profiles:   As needed              │
    │ Log:                 All Sessions           │
    └─────────────────────────────────────────────┘

12. Create INBOUND policy:
    ┌─────────────────────────────────────────────┐
    │ Name:                ${tunnelName}-inbound  │
    │ Incoming Interface:  ${phase1Name.padEnd(25)} │
    │ Outgoing Interface:  internal               │
    │ Source:              all                    │
    │ Destination:         all                    │
    │ Service:             ALL                    │
    │ Action:              ACCEPT                 │
    │ NAT:                 Disable                │
    │ Security Profiles:   As needed              │
    │ Log:                 All Sessions           │
    └─────────────────────────────────────────────┘

══════════════════════════════════════════════════
PHASE 4: Verification
══════════════════════════════════════════════════

13. Verify VPN Status:
    - Navigate to Monitor → IPsec Monitor
    - Check that ${phase1Name} shows as UP (green)
    - Verify Phase 2 selector is established

14. Test Connectivity:
    - Dashboard → Network → Interfaces
    - Verify ${phase1Name} interface is up
    - Send test traffic between networks

15. Check Logs:
    - Log & Report → Forward Traffic
    - Filter by policy name: ${tunnelName}
    - Verify traffic is passing through tunnel

══════════════════════════════════════════════════
✅ Configuration Complete!
══════════════════════════════════════════════════

⚠️  Security Checklist:
  ☐ Strong pre-shared key used (20+ characters)
  ☐ IKEv2 enabled (more secure than IKEv1)
  ☐ AES-256 encryption enabled
  ☐ SHA-256 or higher authentication
  ☐ DH Group 14 or higher (2048-bit minimum)
  ☐ PFS enabled for Phase 2
  ☐ Logging enabled for all policies
  ☐ Firewall policies reviewed and scoped appropriately
`;
}

/**
 * Generate complete bash script for IPsec VPN
 */
export function generateIPsecScript(data: IPsecFormData): string {
  const tunnelName = data.tunnel_name || 'vpn-tunnel-1';

  return `#!/bin/bash
# ============================================
# FortiGate IPsec VPN Deployment Script
# Generated: ${new Date().toLocaleString()}
# Tunnel: ${tunnelName}
# ============================================

# Configuration Variables
FORTIGATE_IP="192.168.1.99"
ADMIN_PORT="443"
TUNNEL_NAME="${tunnelName}"
REMOTE_IP="${data.remote_gateway || '0.0.0.0'}"
LOCAL_SUBNET="${data.local_subnet || '192.168.1.0/24'}"
REMOTE_SUBNET="${data.remote_subnet || '10.0.0.0/24'}"

echo "=================================================="
echo "FortiGate IPsec VPN Deployment Script"
echo "=================================================="
echo "Tunnel: $TUNNEL_NAME"
echo "Remote Gateway: $REMOTE_IP"
echo "Local Subnet: $LOCAL_SUBNET"
echo "Remote Subnet: $REMOTE_SUBNET"
echo "=================================================="
echo ""

# Function to execute FortiGate CLI commands
execute_cli() {
    echo "[INFO] Executing CLI commands..."
    ssh admin@$FORTIGATE_IP << 'EOF'
${generateIPsecCLI(data)}
EOF

    if [ $? -eq 0 ]; then
        echo "[SUCCESS] Configuration applied successfully"
    else
        echo "[ERROR] Configuration failed"
        exit 1
    fi
}

# Function to verify VPN status
verify_vpn() {
    echo ""
    echo "[INFO] Verifying VPN status..."

    ssh admin@$FORTIGATE_IP << 'EOF'
# Check Phase 1 status
echo "Phase 1 Status:"
get vpn ipsec phase1-interface

# Check Phase 2 status
echo ""
echo "Phase 2 Status:"
get vpn ipsec phase2-interface

# Check tunnel list
echo ""
echo "Tunnel List:"
diagnose vpn tunnel list
EOF
}

# Function to test connectivity
test_connectivity() {
    echo ""
    echo "[INFO] Testing connectivity..."

    REMOTE_IP_FIRST=$(echo $REMOTE_SUBNET | cut -d'/' -f1)

    ssh admin@$FORTIGATE_IP << EOF
# Ping remote subnet
execute ping-options source ${data.local_subnet?.split('/')[0] || '192.168.1.1'}
execute ping $REMOTE_IP_FIRST
EOF
}

# Main execution flow
main() {
    echo "Starting deployment..."
    echo ""

    # Step 1: Apply configuration
    execute_cli

    # Step 2: Wait for configuration to settle
    echo ""
    echo "[INFO] Waiting 10 seconds for configuration to settle..."
    sleep 10

    # Step 3: Verify VPN status
    verify_vpn

    # Step 4: Test connectivity
    test_connectivity

    echo ""
    echo "=================================================="
    echo "Deployment complete!"
    echo "=================================================="
    echo ""
    echo "Next steps:"
    echo "1. Verify VPN status in FortiGate GUI"
    echo "2. Check logs: Log & Report → Forward Traffic"
    echo "3. Test application connectivity"
    echo "4. Configure remote peer with matching settings"
    echo ""
}

# Execute main function
main
`;
}
