/**
 * SD-WAN Configuration Generators
 * Generates FortiGate SD-WAN configurations in multiple formats
 */

export interface SDWANFormData {
  // General Settings
  zone_name?: string;
  status?: string;
  load_balance_mode?: string;

  // Member 1
  member1_interface?: string;
  member1_gateway?: string;
  member1_weight?: string | number;
  member1_priority?: string | number;

  // Member 2
  member2_interface?: string;
  member2_gateway?: string;
  member2_weight?: string | number;
  member2_priority?: string | number;

  // Health Check
  health_check_name?: string;
  health_check_server?: string;
  health_check_protocol?: string;
  health_check_interval?: string | number;
  health_check_failtime?: string | number;
  health_check_recoverytime?: string | number;

  // Rules
  rule1_name?: string;
  rule1_dst?: string;
  rule1_mode?: string;
  rule1_quality_link?: string;
}

/**
 * Generate SD-WAN CLI configuration
 */
export function generateSDWANCLI(data: SDWANFormData): string {
  const zoneName = data.zone_name || 'virtual-wan-link';
  const status = data.status || 'enable';
  const loadBalanceMode = data.load_balance_mode || 'source-ip-based';

  // Member 1 (required)
  const member1Interface = data.member1_interface || 'wan1';
  const member1Gateway = data.member1_gateway || '0.0.0.0';
  const member1Weight = data.member1_weight || '1';
  const member1Priority = data.member1_priority || '1';

  // Member 2 (optional)
  const member2Interface = data.member2_interface || '';
  const member2Gateway = data.member2_gateway || '0.0.0.0';
  const member2Weight = data.member2_weight || '1';
  const member2Priority = data.member2_priority || '1';

  // Health Check
  const healthCheckName = data.health_check_name || 'Default_Health_Check';
  const healthCheckServer = data.health_check_server || '8.8.8.8';
  const healthCheckProtocol = data.health_check_protocol || 'ping';
  const healthCheckInterval = data.health_check_interval || '5';
  const healthCheckFailtime = data.health_check_failtime || '5';
  const healthCheckRecoverytime = data.health_check_recoverytime || '5';

  // Rule
  const rule1Name = data.rule1_name || 'Rule_1';
  const rule1Dst = data.rule1_dst || '0.0.0.0/0';
  const rule1Mode = data.rule1_mode || 'auto';
  const rule1QualityLink = data.rule1_quality_link || 'latency-sensitive';

  let config = `# ============================================
# FortiGate SD-WAN Configuration
# Zone: ${zoneName}
# ============================================

# Step 1: Configure SD-WAN Zone and Members
config system sdwan
    set status ${status}
    set load-balance-mode ${loadBalanceMode}
    config zone
        edit "${zoneName}"
        next
    end
    config members
        edit 1
            set interface "${member1Interface}"
            set gateway ${member1Gateway}
            set weight ${member1Weight}
            set priority ${member1Priority}
            set zone "${zoneName}"
        next`;

  // Add Member 2 if interface is specified
  if (member2Interface && member2Interface !== '') {
    config += `
        edit 2
            set interface "${member2Interface}"
            set gateway ${member2Gateway}
            set weight ${member2Weight}
            set priority ${member2Priority}
            set zone "${zoneName}"
        next`;
  }

  config += `
    end
end

# Step 2: Configure Health Check
config system sdwan
    config health-check
        edit "${healthCheckName}"
            set server "${healthCheckServer}"
            set protocol ${healthCheckProtocol}
            set interval ${healthCheckInterval}
            set failtime ${healthCheckFailtime}
            set recoverytime ${healthCheckRecoverytime}
            set members 1`;

  // Add member 2 to health check if configured
  if (member2Interface && member2Interface !== '') {
    config += ` 2`;
  }

  config += `
        next
    end
end

# Step 3: Configure SD-WAN Service Rules
config system sdwan
    config service
        edit 1
            set name "${rule1Name}"
            set mode ${rule1Mode}
            set dst "${rule1Dst}"`;

  // Add quality link if mode is SLA
  if (rule1Mode === 'sla') {
    config += `
            set quality-link ${rule1QualityLink}`;
  }

  config += `
            set zone "${zoneName}"
        next
    end
end

# ============================================
# Configuration Complete
# ============================================

# Verification Commands:
# diagnose sys sdwan health-check status
# diagnose sys sdwan member
# diagnose sys sdwan service
# get system sdwan status
`;

  return config;
}

/**
 * Generate SD-WAN GUI configuration steps
 */
export function generateSDWANGUI(data: SDWANFormData): string {
  const zoneName = data.zone_name || 'virtual-wan-link';
  const member1Interface = data.member1_interface || 'wan1';
  const member2Interface = data.member2_interface || '';
  const healthCheckName = data.health_check_name || 'Default_Health_Check';
  const healthCheckServer = data.health_check_server || '8.8.8.8';
  const rule1Name = data.rule1_name || 'Rule_1';

  const memberCount = member2Interface && member2Interface !== '' ? 2 : 1;

  return `# ============================================
# FortiGate SD-WAN GUI Configuration Guide
# ============================================

STEP 1: ENABLE SD-WAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Navigate to: Network → SD-WAN
2. Click "Enable SD-WAN"
3. Status: ${data.status || 'Enable'}
4. Load Balance Mode: ${data.load_balance_mode || 'Source IP Based'}
5. Click "Apply"

STEP 2: CREATE SD-WAN ZONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Navigate to: Network → SD-WAN → SD-WAN Zones
2. Click "+ Create New"
3. Zone Name: ${zoneName}
4. Click "OK"

STEP 3: ADD SD-WAN MEMBERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Navigate to: Network → SD-WAN → SD-WAN Members
2. Click "+ Create New"

   Member 1:
   ┌─────────────────────────────────────────┐
   │ Interface:     ${member1Interface.padEnd(25)}│
   │ Zone:          ${zoneName.padEnd(25)}│
   │ Gateway:       ${(data.member1_gateway || '0.0.0.0').padEnd(25)}│
   │ Weight:        ${(data.member1_weight || '1').toString().padEnd(25)}│
   │ Priority:      ${(data.member1_priority || '1').toString().padEnd(25)}│
   └─────────────────────────────────────────┘

3. Click "OK"
${memberCount === 2 ? `
4. Repeat for Member 2:

   Member 2:
   ┌─────────────────────────────────────────┐
   │ Interface:     ${member2Interface.padEnd(25)}│
   │ Zone:          ${zoneName.padEnd(25)}│
   │ Gateway:       ${(data.member2_gateway || '0.0.0.0').padEnd(25)}│
   │ Weight:        ${(data.member2_weight || '1').toString().padEnd(25)}│
   │ Priority:      ${(data.member2_priority || '1').toString().padEnd(25)}│
   └─────────────────────────────────────────┘

5. Click "OK"
` : ''}

STEP 4: CONFIGURE HEALTH CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Navigate to: Network → SD-WAN → Performance SLA
2. Click "+ Create New"

   Health Check Settings:
   ┌─────────────────────────────────────────┐
   │ Name:          ${healthCheckName.padEnd(25)}│
   │ Server:        ${healthCheckServer.padEnd(25)}│
   │ Protocol:      ${(data.health_check_protocol || 'ping').padEnd(25)}│
   │ Interval:      ${(data.health_check_interval || '5').toString().padEnd(21)} sec│
   │ Fail Time:     ${(data.health_check_failtime || '5').toString().padEnd(21)} sec│
   │ Recovery Time: ${(data.health_check_recoverytime || '5').toString().padEnd(21)} sec│
   │ Members:       ${memberCount === 2 ? 'Member 1, Member 2        ' : 'Member 1                   '}│
   └─────────────────────────────────────────┘

3. Click "OK"

STEP 5: CREATE SD-WAN SERVICE RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Navigate to: Network → SD-WAN → SD-WAN Rules
2. Click "+ Create New"

   Rule Settings:
   ┌─────────────────────────────────────────┐
   │ Name:          ${rule1Name.padEnd(25)}│
   │ Destination:   ${(data.rule1_dst || '0.0.0.0/0').padEnd(25)}│
   │ Mode:          ${(data.rule1_mode || 'auto').padEnd(25)}│${data.rule1_mode === 'sla' ? `
   │ Quality Link:  ${(data.rule1_quality_link || 'latency-sensitive').padEnd(25)}│` : ''}
   │ Zone:          ${zoneName.padEnd(25)}│
   └─────────────────────────────────────────┘

3. Click "OK"

STEP 6: VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Navigate to: Dashboard → SD-WAN
2. Verify all members show as "Alive"
3. Check health check status is "Up"
4. Monitor traffic distribution

⚠️  IMPORTANT NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ensure interfaces are configured before adding to SD-WAN
• Health check server must be reachable via all members
• Lower priority value = higher priority (1 is highest)
• Higher weight value = more traffic allocation
• Test failover by disconnecting one member

✅ Configuration Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/**
 * Generate SD-WAN deployment bash script
 */
export function generateSDWANScript(data: SDWANFormData): string {
  const zoneName = data.zone_name || 'virtual-wan-link';
  const member1Interface = data.member1_interface || 'wan1';
  const member2Interface = data.member2_interface || '';
  const healthCheckName = data.health_check_name || 'Default_Health_Check';

  return `#!/bin/bash
# ============================================
# FortiGate SD-WAN Deployment Script
# Zone: ${zoneName}
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

# SD-WAN Configuration
ZONE_NAME="${zoneName}"
STATUS="${data.status || 'enable'}"
LOAD_BALANCE_MODE="${data.load_balance_mode || 'source-ip-based'}"

# Member 1
MEMBER1_INTERFACE="${member1Interface}"
MEMBER1_GATEWAY="${data.member1_gateway || '0.0.0.0'}"
MEMBER1_WEIGHT="${data.member1_weight || '1'}"
MEMBER1_PRIORITY="${data.member1_priority || '1'}"

# Member 2 (optional)
MEMBER2_INTERFACE="${member2Interface}"
MEMBER2_GATEWAY="${data.member2_gateway || '0.0.0.0'}"
MEMBER2_WEIGHT="${data.member2_weight || '1'}"
MEMBER2_PRIORITY="${data.member2_priority || '1'}"

# Health Check
HEALTH_CHECK_NAME="${healthCheckName}"
HEALTH_CHECK_SERVER="${data.health_check_server || '8.8.8.8'}"
HEALTH_CHECK_PROTOCOL="${data.health_check_protocol || 'ping'}"
HEALTH_CHECK_INTERVAL="${data.health_check_interval || '5'}"
HEALTH_CHECK_FAILTIME="${data.health_check_failtime || '5'}"
HEALTH_CHECK_RECOVERYTIME="${data.health_check_recoverytime || '5'}"

# Rule
RULE1_NAME="${data.rule1_name || 'Rule_1'}"
RULE1_DST="${data.rule1_dst || '0.0.0.0/0'}"
RULE1_MODE="${data.rule1_mode || 'auto'}"
RULE1_QUALITY_LINK="${data.rule1_quality_link || 'latency-sensitive'}"

echo -e "${'${CYAN}'}============================================${'${NC}'}"
echo -e "${'${CYAN}'}FortiGate SD-WAN Configuration Deployment${'${NC}'}"
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

# Configure SD-WAN
echo -e "${'${CYAN}'}Step 2: Configuring SD-WAN Zone and Members${'${NC}'}"
execute_fortigate_cmd "config system sdwan"
execute_fortigate_cmd "set status $STATUS"
execute_fortigate_cmd "set load-balance-mode $LOAD_BALANCE_MODE"
execute_fortigate_cmd "config zone"
execute_fortigate_cmd "edit \\"$ZONE_NAME\\""
execute_fortigate_cmd "next"
execute_fortigate_cmd "end"
execute_fortigate_cmd "config members"
execute_fortigate_cmd "edit 1"
execute_fortigate_cmd "set interface \\"$MEMBER1_INTERFACE\\""
execute_fortigate_cmd "set gateway $MEMBER1_GATEWAY"
execute_fortigate_cmd "set weight $MEMBER1_WEIGHT"
execute_fortigate_cmd "set priority $MEMBER1_PRIORITY"
execute_fortigate_cmd "set zone \\"$ZONE_NAME\\""
execute_fortigate_cmd "next"

# Add Member 2 if configured
if [ -n "$MEMBER2_INTERFACE" ]; then
    echo -e "${'${YELLOW}'}Adding Member 2...${'${NC}'}"
    execute_fortigate_cmd "edit 2"
    execute_fortigate_cmd "set interface \\"$MEMBER2_INTERFACE\\""
    execute_fortigate_cmd "set gateway $MEMBER2_GATEWAY"
    execute_fortigate_cmd "set weight $MEMBER2_WEIGHT"
    execute_fortigate_cmd "set priority $MEMBER2_PRIORITY"
    execute_fortigate_cmd "set zone \\"$ZONE_NAME\\""
    execute_fortigate_cmd "next"
fi

execute_fortigate_cmd "end"
execute_fortigate_cmd "end"
echo ""

# Configure Health Check
echo -e "${'${CYAN}'}Step 3: Configuring Health Check${'${NC}'}"
execute_fortigate_cmd "config system sdwan"
execute_fortigate_cmd "config health-check"
execute_fortigate_cmd "edit \\"$HEALTH_CHECK_NAME\\""
execute_fortigate_cmd "set server \\"$HEALTH_CHECK_SERVER\\""
execute_fortigate_cmd "set protocol $HEALTH_CHECK_PROTOCOL"
execute_fortigate_cmd "set interval $HEALTH_CHECK_INTERVAL"
execute_fortigate_cmd "set failtime $HEALTH_CHECK_FAILTIME"
execute_fortigate_cmd "set recoverytime $HEALTH_CHECK_RECOVERYTIME"

if [ -n "$MEMBER2_INTERFACE" ]; then
    execute_fortigate_cmd "set members 1 2"
else
    execute_fortigate_cmd "set members 1"
fi

execute_fortigate_cmd "next"
execute_fortigate_cmd "end"
execute_fortigate_cmd "end"
echo ""

# Configure SD-WAN Rule
echo -e "${'${CYAN}'}Step 4: Configuring SD-WAN Service Rule${'${NC}'}"
execute_fortigate_cmd "config system sdwan"
execute_fortigate_cmd "config service"
execute_fortigate_cmd "edit 1"
execute_fortigate_cmd "set name \\"$RULE1_NAME\\""
execute_fortigate_cmd "set mode $RULE1_MODE"
execute_fortigate_cmd "set dst \\"$RULE1_DST\\""

if [ "$RULE1_MODE" = "sla" ]; then
    execute_fortigate_cmd "set quality-link $RULE1_QUALITY_LINK"
fi

execute_fortigate_cmd "set zone \\"$ZONE_NAME\\""
execute_fortigate_cmd "next"
execute_fortigate_cmd "end"
execute_fortigate_cmd "end"
echo ""

# Verification
echo -e "${'${CYAN}'}Step 5: Verification${'${NC}'}"
echo -e "Checking SD-WAN status..."
execute_fortigate_cmd "get system sdwan status"
echo ""
echo -e "Checking health check status..."
execute_fortigate_cmd "diagnose sys sdwan health-check status"
echo ""

echo -e "${'${GREEN}'}============================================${'${NC}'}"
echo -e "${'${GREEN}'}✓ SD-WAN Configuration Complete!${'${NC}'}"
echo -e "${'${GREEN}'}============================================${'${NC}'}"
echo ""
echo "Next steps:"
echo "  1. Verify members are showing as 'Alive'"
echo "  2. Test failover by disconnecting one link"
echo "  3. Monitor traffic distribution"
echo "  4. Adjust weights/priorities as needed"
echo ""
echo "Useful commands:"
echo "  diagnose sys sdwan member"
echo "  diagnose sys sdwan service"
echo "  diagnose sys sdwan health-check status"
`;
}
