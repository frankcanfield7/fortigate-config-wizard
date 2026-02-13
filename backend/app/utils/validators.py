"""
Input validation utilities for FortiGate configurations.
"""
import ipaddress
import re


def validate_ip_address(ip_str):
    """
    Validate IPv4 or IPv6 address.

    Args:
        ip_str (str): IP address string

    Returns:
        tuple: (is_valid, error_message)
    """
    if not ip_str:
        return True, None  # Empty is valid (optional field)

    try:
        ipaddress.ip_address(ip_str)
        return True, None
    except ValueError:
        return False, f"Invalid IP address: {ip_str}"


def validate_subnet(subnet_str):
    """
    Validate IPv4 or IPv6 subnet in CIDR notation.

    Args:
        subnet_str (str): Subnet string (e.g., "192.168.1.0/24")

    Returns:
        tuple: (is_valid, error_message)
    """
    if not subnet_str:
        return True, None  # Empty is valid (optional field)

    # Ensure CIDR notation is present (must contain "/")
    if '/' not in subnet_str:
        return False, f"Invalid subnet (missing CIDR notation): {subnet_str}"

    try:
        ipaddress.ip_network(subnet_str, strict=False)
        return True, None
    except ValueError:
        return False, f"Invalid subnet: {subnet_str}"


def validate_port(port):
    """
    Validate port number.

    Args:
        port (int or str): Port number

    Returns:
        tuple: (is_valid, error_message)
    """
    # Check for empty/None (not just falsy, since 0 is falsy but invalid)
    if port is None or port == '':
        return True, None  # Empty is valid (optional field)

    try:
        port_num = int(port)
        if 1 <= port_num <= 65535:
            return True, None
        else:
            return False, f"Port must be between 1 and 65535: {port}"
    except (ValueError, TypeError):
        return False, f"Invalid port number: {port}"


def validate_port_range(port_range_str):
    """
    Validate port range (e.g., "80-443" or "8080").

    Args:
        port_range_str (str): Port range string

    Returns:
        tuple: (is_valid, error_message)
    """
    if not port_range_str:
        return True, None  # Empty is valid (optional field)

    if '-' in port_range_str:
        # Range format: "80-443"
        parts = port_range_str.split('-')
        if len(parts) != 2:
            return False, f"Invalid port range format: {port_range_str}"

        start_valid, start_error = validate_port(parts[0])
        if not start_valid:
            return False, start_error

        end_valid, end_error = validate_port(parts[1])
        if not end_valid:
            return False, end_error

        if int(parts[0]) > int(parts[1]):
            return False, f"Port range start must be less than or equal to end: {port_range_str}"

        return True, None
    else:
        # Single port
        return validate_port(port_range_str)


def validate_interface_name(interface_name):
    """
    Validate FortiGate interface name.

    Args:
        interface_name (str): Interface name

    Returns:
        tuple: (is_valid, error_message)
    """
    if not interface_name:
        return True, None  # Empty is valid (optional field)

    # Interface names are typically alphanumeric with underscores and hyphens
    # Examples: wan1, wan2, lan, internal, port1, dmz, ssl.root
    if not re.match(r'^[a-zA-Z0-9._-]+$', interface_name):
        return False, f"Invalid interface name: {interface_name}"

    if len(interface_name) > 35:
        return False, f"Interface name too long (max 35 characters): {interface_name}"

    return True, None


def validate_vdom_name(vdom_name):
    """
    Validate FortiGate VDOM name.

    Args:
        vdom_name (str): VDOM name

    Returns:
        tuple: (is_valid, error_message)
    """
    if not vdom_name:
        return True, None  # Empty is valid (optional field)

    # VDOM names can contain alphanumeric, hyphens, underscores
    if not re.match(r'^[a-zA-Z0-9_-]+$', vdom_name):
        return False, f"Invalid VDOM name: {vdom_name}"

    if len(vdom_name) > 31:
        return False, f"VDOM name too long (max 31 characters): {vdom_name}"

    return True, None


def validate_phase1_name(name):
    """
    Validate IPsec Phase1 interface name.

    Args:
        name (str): Phase1 name

    Returns:
        tuple: (is_valid, error_message)
    """
    if not name:
        return False, "Phase1 name is required"

    # Phase1 names are alphanumeric with underscores and hyphens
    if not re.match(r'^[a-zA-Z0-9_-]+$', name):
        return False, f"Invalid Phase1 name (alphanumeric, hyphens, underscores only): {name}"

    if len(name) > 35:
        return False, f"Phase1 name too long (max 35 characters): {name}"

    return True, None


def validate_policy_name(name):
    """
    Validate firewall policy name.

    Args:
        name (str): Policy name

    Returns:
        tuple: (is_valid, error_message)
    """
    if not name:
        return True, None  # Empty is valid (optional field, can use policy ID)

    if len(name) > 255:
        return False, f"Policy name too long (max 255 characters): {name}"

    return True, None


def validate_config_type(config_type):
    """
    Validate configuration type.

    Args:
        config_type (str): Configuration type

    Returns:
        tuple: (is_valid, error_message)
    """
    valid_types = [
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
    ]

    if config_type not in valid_types:
        return False, f"Invalid configuration type. Must be one of: {', '.join(valid_types)}"

    return True, None


def validate_tags(tags):
    """
    Validate tags format.

    Args:
        tags (list or str): Tags as list or comma-separated string

    Returns:
        tuple: (is_valid, error_message)
    """
    if not tags:
        return True, None  # Empty is valid

    if isinstance(tags, str):
        tags = [tag.strip() for tag in tags.split(',')]

    if not isinstance(tags, list):
        return False, "Tags must be a list or comma-separated string"

    for tag in tags:
        if len(tag) > 50:
            return False, f"Tag too long (max 50 characters): {tag}"

    return True, None
