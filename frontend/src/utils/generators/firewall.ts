/**
 * Firewall Policy Configuration Generators
 * Generates FortiGate firewall policy configurations in multiple formats
 */

export interface FirewallFormData {
  // General Policy Configuration
  policy_name?: string;
  policy_id?: string | number;
  action?: string;
  status?: string;

  // Source Configuration
  srcintf?: string;
  srcaddr?: string;
  srcaddr_negate?: string;

  // Destination Configuration
  dstintf?: string;
  dstaddr?: string;
  dstaddr_negate?: string;

  // Service & Schedule
  service?: string;
  schedule?: string;

  // NAT Configuration
  nat?: string;
  ippool?: string;
  poolname?: string;

  // Security Profiles
  av_profile?: string;
  webfilter_profile?: string;
  ips_sensor?: string;
  application_list?: string;
  ssl_ssh_profile?: string;

  // Logging & Comments
  logtraffic?: string;
  logtraffic_start?: string;
  comments?: string;
}

/**
 * Generate Firewall Policy CLI configuration
 */
export function generateFirewallCLI(data: FirewallFormData): string {
  const policyName = data.policy_name || 'Allow-Internet-Access';
  const policyId = data.policy_id || '100';
  const action = data.action || 'accept';
  const status = data.status || 'enable';

  const srcintf = data.srcintf || 'internal';
  const srcaddr = data.srcaddr || 'all';
  const srcaddrNegate = data.srcaddr_negate || 'disable';

  const dstintf = data.dstintf || 'wan1';
  const dstaddr = data.dstaddr || 'all';
  const dstaddrNegate = data.dstaddr_negate || 'disable';

  const service = data.service || 'ALL';
  const schedule = data.schedule || 'always';

  const nat = data.nat || 'enable';
  const ippool = data.ippool || 'disable';
  const poolname = data.poolname || '';

  const avProfile = data.av_profile || '';
  const webfilterProfile = data.webfilter_profile || '';
  const ipsSensor = data.ips_sensor || '';
  const applicationList = data.application_list || '';
  const sslSshProfile = data.ssl_ssh_profile || '';

  const logtraffic = data.logtraffic || 'all';
  const logtrafficStart = data.logtraffic_start || 'disable';
  const comments = data.comments || '';

  let config = `# ============================================
# FortiGate Firewall Policy Configuration
# Policy: ${policyName}
# ============================================

config firewall policy
    edit ${policyId}
        set name "${policyName}"
        set srcintf "${srcintf}"
        set dstintf "${dstintf}"
        set srcaddr "${srcaddr}"
        set srcaddr-negate ${srcaddrNegate}
        set dstaddr "${dstaddr}"
        set dstaddr-negate ${dstaddrNegate}
        set action ${action}
        set schedule "${schedule}"
        set service "${service}"`;

  // Add NAT configuration
  if (nat === 'enable') {
    config += `
        set nat enable`;

    if (ippool === 'enable' && poolname) {
      config += `
        set ippool enable
        set poolname "${poolname}"`;
    }
  } else {
    config += `
        set nat disable`;
  }

  // Add security profiles
  const securityProfiles = [];
  if (avProfile) securityProfiles.push(`av-profile: ${avProfile}`);
  if (webfilterProfile) securityProfiles.push(`webfilter: ${webfilterProfile}`);
  if (ipsSensor) securityProfiles.push(`ips: ${ipsSensor}`);
  if (applicationList) securityProfiles.push(`app-control: ${applicationList}`);
  if (sslSshProfile) securityProfiles.push(`ssl-ssh: ${sslSshProfile}`);

  if (avProfile) {
    config += `
        set av-profile "${avProfile}"`;
  }

  if (webfilterProfile) {
    config += `
        set webfilter-profile "${webfilterProfile}"`;
  }

  if (ipsSensor) {
    config += `
        set ips-sensor "${ipsSensor}"`;
  }

  if (applicationList) {
    config += `
        set application-list "${applicationList}"`;
  }

  if (sslSshProfile) {
    config += `
        set ssl-ssh-profile "${sslSshProfile}"`;
  }

  // Add logging
  config += `
        set logtraffic ${logtraffic}`;

  if (logtrafficStart === 'enable') {
    config += `
        set logtraffic-start enable`;
  }

  // Add comments
  if (comments) {
    config += `
        set comments "${comments}"`;
  }

  // Set status
  config += `
        set status ${status}
    next
end

# ============================================
# Configuration Complete
# ============================================

# Verification Commands:
# show firewall policy ${policyId}
# diagnose firewall policy list
# diagnose debug flow filter policy ${policyId}
# execute ping 8.8.8.8 (test connectivity)

# Security Profile Summary:
${securityProfiles.length > 0 ? securityProfiles.map(p => `#   ✓ ${p}`).join('\n') : '#   ⚠️ No security profiles configured'}

# Security Recommendations:
${avProfile ? '#   ✓ Antivirus protection enabled' : '#   ⚠️ Consider enabling antivirus protection'}
${ipsSensor ? '#   ✓ IPS protection enabled' : '#   ⚠️ Consider enabling IPS protection'}
${webfilterProfile ? '#   ✓ Web filtering enabled' : '#   ⚠️ Consider enabling web filtering for internet access'}
${applicationList ? '#   ✓ Application control enabled' : '#   ⚠️ Consider enabling application control'}
${sslSshProfile ? '#   ✓ SSL/SSH inspection enabled' : '#   ⚠️ Consider SSL inspection for encrypted traffic visibility'}
${logtraffic !== 'disable' ? '#   ✓ Traffic logging enabled' : '#   ⚠️ Logging disabled - enable for security monitoring'}
`;

  return config;
}

/**
 * Generate Firewall Policy GUI configuration steps
 */
export function generateFirewallGUI(data: FirewallFormData): string {
  const policyName = data.policy_name || 'Allow-Internet-Access';
  const policyId = data.policy_id || '100';
  const action = data.action || 'accept';
  const status = data.status || 'enable';

  const srcintf = data.srcintf || 'internal';
  const srcaddr = data.srcaddr || 'all';
  const dstintf = data.dstintf || 'wan1';
  const dstaddr = data.dstaddr || 'all';
  const service = data.service || 'ALL';

  const hasSecurityProfiles = !!(
    data.av_profile ||
    data.webfilter_profile ||
    data.ips_sensor ||
    data.application_list ||
    data.ssl_ssh_profile
  );

  return `# ============================================
# FortiGate Firewall Policy GUI Guide
# ============================================

STEP 1: NAVIGATE TO FIREWALL POLICY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to: Policy & Objects → Firewall Policy
2. Click "+ Create New" button (or "New Policy" in some versions)

STEP 2: BASIC POLICY SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────┐
│ Name:          ${policyName.padEnd(25)}│
│ Policy ID:     ${policyId.toString().padEnd(25)}│
│ Status:        ${(status === 'enable' ? 'Enabled' : 'Disabled').padEnd(25)}│
└─────────────────────────────────────────┘

STEP 3: SOURCE CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────┐
│ Incoming Interface:  ${srcintf.padEnd(19)}│
│ Source Address:      ${srcaddr.padEnd(19)}│${data.srcaddr_negate === 'enable' ? `
│ ☑ Negate Source                         │` : ''}
└─────────────────────────────────────────┘

STEP 4: DESTINATION CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────┐
│ Outgoing Interface:  ${dstintf.padEnd(19)}│
│ Destination Address: ${dstaddr.padEnd(19)}│${data.dstaddr_negate === 'enable' ? `
│ ☑ Negate Destination                    │` : ''}
└─────────────────────────────────────────┘

STEP 5: SERVICE & SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────┐
│ Service:       ${service.padEnd(25)}│
│ Schedule:      ${(data.schedule || 'always').padEnd(25)}│
└─────────────────────────────────────────┘

STEP 6: ACTION & NAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────┐
│ Action:        ${action.toUpperCase().padEnd(25)}│${data.nat === 'enable' ? `
│ NAT:           ☑ Enable                  │${data.ippool === 'enable' && data.poolname ? `
│ IP Pool:       ${data.poolname.padEnd(25)}│` : ''}` : `
│ NAT:           ☐ Disable                 │`}
└─────────────────────────────────────────┘

${hasSecurityProfiles ? `STEP 7: SECURITY PROFILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Expand "Security Profiles" section and configure:

┌─────────────────────────────────────────┐${data.av_profile ? `
│ Antivirus:             ${data.av_profile.padEnd(15)}│` : ''}${data.webfilter_profile ? `
│ Web Filter:            ${data.webfilter_profile.padEnd(15)}│` : ''}${data.ips_sensor ? `
│ IPS:                   ${data.ips_sensor.padEnd(15)}│` : ''}${data.application_list ? `
│ Application Control:   ${data.application_list.padEnd(15)}│` : ''}${data.ssl_ssh_profile ? `
│ SSL/SSH Inspection:    ${data.ssl_ssh_profile.padEnd(15)}│` : ''}
└─────────────────────────────────────────┘

` : ''}STEP ${hasSecurityProfiles ? '8' : '7'}: LOGGING & COMMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Expand "Logging Options" section:

┌─────────────────────────────────────────┐
│ Log Allowed Traffic: ${(data.logtraffic || 'all').padEnd(17)}│${data.logtraffic_start === 'enable' ? `
│ ☑ Log Session Start                     │` : ''}
└─────────────────────────────────────────┘
${data.comments ? `
Comments:
${data.comments}
` : ''}
STEP ${hasSecurityProfiles ? '9' : '8'}: SAVE AND VERIFY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Click "OK" to save the policy
2. Verify policy appears in the list
3. Check policy order (drag to reorder if needed)

VERIFICATION STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Navigate to: Log & Report → Forward Traffic
2. Test connectivity from source to destination
3. Verify logs appear in real-time
4. Check security profile hits if configured

⚠️  SECURITY WARNINGS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${srcaddr === 'any' || srcaddr === 'all' ? '⚠️ Source set to ANY/ALL - ensure this is intentional\n' : ''}${dstaddr === 'any' || dstaddr === 'all' ? '⚠️ Destination set to ANY/ALL - consider limiting scope\n' : ''}${service === 'ALL' ? '⚠️ Service set to ALL - specify exact services when possible\n' : ''}${!hasSecurityProfiles ? '⚠️ No security profiles configured - consider enabling AV/IPS/WebFilter\n' : ''}${data.logtraffic === 'disable' ? '⚠️ Logging disabled - enable for security monitoring\n' : ''}
✅ Policy Configuration Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/**
 * Generate Firewall Policy deployment bash script
 */
export function generateFirewallScript(data: FirewallFormData): string {
  const policyName = data.policy_name || 'Allow-Internet-Access';
  const policyId = data.policy_id || '100';

  return `#!/bin/bash
# ============================================
# FortiGate Firewall Policy Deployment Script
# Policy: ${policyName} (ID: ${policyId})
# Generated: ${new Date().toISOString()}
# ============================================

set -e  # Exit on error

# Color codes for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color

# Configuration Variables
FORTIGATE_IP="${'${FORTIGATE_IP:-192.168.1.99}'}"
ADMIN_USER="${'${ADMIN_USER:-admin}'}"
SSH_PORT="${'${SSH_PORT:-22}'}"

# Policy Configuration
POLICY_NAME="${policyName}"
POLICY_ID="${policyId}"
ACTION="${data.action || 'accept'}"
STATUS="${data.status || 'enable'}"

# Source Configuration
SRCINTF="${data.srcintf || 'internal'}"
SRCADDR="${data.srcaddr || 'all'}"
SRCADDR_NEGATE="${data.srcaddr_negate || 'disable'}"

# Destination Configuration
DSTINTF="${data.dstintf || 'wan1'}"
DSTADDR="${data.dstaddr || 'all'}"
DSTADDR_NEGATE="${data.dstaddr_negate || 'disable'}"

# Service & Schedule
SERVICE="${data.service || 'ALL'}"
SCHEDULE="${data.schedule || 'always'}"

# NAT Configuration
NAT="${data.nat || 'enable'}"
IPPOOL="${data.ippool || 'disable'}"
POOLNAME="${data.poolname || ''}"

# Security Profiles
AV_PROFILE="${data.av_profile || ''}"
WEBFILTER_PROFILE="${data.webfilter_profile || ''}"
IPS_SENSOR="${data.ips_sensor || ''}"
APPLICATION_LIST="${data.application_list || ''}"
SSL_SSH_PROFILE="${data.ssl_ssh_profile || ''}"

# Logging
LOGTRAFFIC="${data.logtraffic || 'all'}"
LOGTRAFFIC_START="${data.logtraffic_start || 'disable'}"
COMMENTS="${(data.comments || '').replace(/"/g, '\\"')}"

echo -e "${'${CYAN}'}============================================${'${NC}'}"
echo -e "${'${CYAN}'}FortiGate Firewall Policy Deployment${'${NC}'}"
echo -e "${'${CYAN}'}============================================${'${NC}'}"
echo ""

# Function to execute FortiGate commands via SSH
execute_fortigate_cmd() {
    local cmd="$1"
    echo -e "${'${YELLOW}'}Executing: $cmd${'${NC}'}"
    ssh -p "$SSH_PORT" "$ADMIN_USER@$FORTIGATE_IP" "$cmd"
    if [ $? -eq 0 ]; then
        echo -e "${'${GREEN}'}✓ Success${'${NC}'}"
    else
        echo -e "${'${RED}'}✗ Failed${'${NC}'}"
        exit 1
    fi
}

# Pre-flight checks
echo -e "${'${CYAN}'}Step 1: Pre-flight Checks${'${NC}'}"
echo -e "Testing SSH connectivity to $FORTIGATE_IP..."
if ! ssh -p "$SSH_PORT" -o ConnectTimeout=5 "$ADMIN_USER@$FORTIGATE_IP" "exit" 2>/dev/null; then
    echo -e "${'${RED}'}✗ Cannot connect to FortiGate${'${NC}'}"
    echo "Please ensure:"
    echo "  - FortiGate IP is correct: $FORTIGATE_IP"
    echo "  - SSH is enabled on FortiGate"
    echo "  - Credentials are valid"
    exit 1
fi
echo -e "${'${GREEN}'}✓ SSH connection successful${'${NC}'}"
echo ""

# Check if policy ID already exists
echo -e "${'${CYAN}'}Step 2: Checking Policy ID Availability${'${NC}'}"
EXISTING_POLICY=$(ssh -p "$SSH_PORT" "$ADMIN_USER@$FORTIGATE_IP" "show firewall policy $POLICY_ID" 2>/dev/null | grep -c "edit $POLICY_ID" || true)
if [ "$EXISTING_POLICY" -gt 0 ]; then
    echo -e "${'${YELLOW}'}⚠️  Policy ID $POLICY_ID already exists${'${NC}'}"
    echo "Do you want to overwrite it? (yes/no)"
    read -r CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo -e "${'${RED}'}Deployment cancelled${'${NC}'}"
        exit 1
    fi
    echo -e "${'${YELLOW}'}Overwriting existing policy...${'${NC}'}"
fi
echo ""

# Configure Firewall Policy
echo -e "${'${CYAN}'}Step 3: Creating Firewall Policy${'${NC}'}"
execute_fortigate_cmd "config firewall policy"
execute_fortigate_cmd "edit $POLICY_ID"
execute_fortigate_cmd "set name \\"$POLICY_NAME\\""
execute_fortigate_cmd "set srcintf \\"$SRCINTF\\""
execute_fortigate_cmd "set dstintf \\"$DSTINTF\\""
execute_fortigate_cmd "set srcaddr \\"$SRCADDR\\""
execute_fortigate_cmd "set srcaddr-negate $SRCADDR_NEGATE"
execute_fortigate_cmd "set dstaddr \\"$DSTADDR\\""
execute_fortigate_cmd "set dstaddr-negate $DSTADDR_NEGATE"
execute_fortigate_cmd "set action $ACTION"
execute_fortigate_cmd "set schedule \\"$SCHEDULE\\""
execute_fortigate_cmd "set service \\"$SERVICE\\""

# NAT Configuration
if [ "$NAT" = "enable" ]; then
    echo -e "${'${YELLOW}'}Configuring NAT...${'${NC}'}"
    execute_fortigate_cmd "set nat enable"

    if [ "$IPPOOL" = "enable" ] && [ -n "$POOLNAME" ]; then
        execute_fortigate_cmd "set ippool enable"
        execute_fortigate_cmd "set poolname \\"$POOLNAME\\""
    fi
else
    execute_fortigate_cmd "set nat disable"
fi

# Security Profiles
if [ -n "$AV_PROFILE" ]; then
    echo -e "${'${YELLOW}'}Applying Antivirus profile...${'${NC}'}"
    execute_fortigate_cmd "set av-profile \\"$AV_PROFILE\\""
fi

if [ -n "$WEBFILTER_PROFILE" ]; then
    echo -e "${'${YELLOW}'}Applying Web Filter profile...${'${NC}'}"
    execute_fortigate_cmd "set webfilter-profile \\"$WEBFILTER_PROFILE\\""
fi

if [ -n "$IPS_SENSOR" ]; then
    echo -e "${'${YELLOW}'}Applying IPS sensor...${'${NC}'}"
    execute_fortigate_cmd "set ips-sensor \\"$IPS_SENSOR\\""
fi

if [ -n "$APPLICATION_LIST" ]; then
    echo -e "${'${YELLOW}'}Applying Application Control...${'${NC}'}"
    execute_fortigate_cmd "set application-list \\"$APPLICATION_LIST\\""
fi

if [ -n "$SSL_SSH_PROFILE" ]; then
    echo -e "${'${YELLOW}'}Applying SSL/SSH Inspection...${'${NC}'}"
    execute_fortigate_cmd "set ssl-ssh-profile \\"$SSL_SSH_PROFILE\\""
fi

# Logging
execute_fortigate_cmd "set logtraffic $LOGTRAFFIC"

if [ "$LOGTRAFFIC_START" = "enable" ]; then
    execute_fortigate_cmd "set logtraffic-start enable"
fi

# Comments
if [ -n "$COMMENTS" ]; then
    execute_fortigate_cmd "set comments \\"$COMMENTS\\""
fi

# Status
execute_fortigate_cmd "set status $STATUS"
execute_fortigate_cmd "next"
execute_fortigate_cmd "end"
echo ""

# Verification
echo -e "${'${CYAN}'}Step 4: Verification${'${NC}'}"
echo -e "Verifying policy configuration..."
execute_fortigate_cmd "show firewall policy $POLICY_ID"
echo ""

# Policy Statistics
echo -e "${'${CYAN}'}Step 5: Policy Statistics${'${NC}'}"
echo -e "Checking policy hit count..."
ssh -p "$SSH_PORT" "$ADMIN_USER@$FORTIGATE_IP" "diagnose firewall policy list | grep -A 5 'policy $POLICY_ID'" || true
echo ""

echo -e "${'${GREEN}'}============================================${'${NC}'}"
echo -e "${'${GREEN}'}✓ Firewall Policy Deployed Successfully!${'${NC}'}"
echo -e "${'${GREEN}'}============================================${'${NC}'}"
echo ""
echo "Policy Summary:"
echo "  Name: $POLICY_NAME"
echo "  ID: $POLICY_ID"
echo "  Action: $ACTION"
echo "  Status: $STATUS"
echo "  Source: $SRCINTF → $SRCADDR"
echo "  Destination: $DSTINTF → $DSTADDR"
echo "  Service: $SERVICE"
echo ""
echo "Next Steps:"
echo "  1. Test connectivity from source to destination"
echo "  2. Monitor logs: Log & Report → Forward Traffic"
echo "  3. Verify policy hit count increases with traffic"
echo "  4. Check security profile blocks if configured"
echo ""
echo "Useful Commands:"
echo "  show firewall policy $POLICY_ID"
echo "  diagnose firewall policy list"
echo "  diagnose debug flow filter policy $POLICY_ID"
echo "  diagnose debug flow trace start"
`;
}
