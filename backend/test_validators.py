#!/usr/bin/env python3
"""
Comprehensive unit tests for FortiGate configuration validators.
Tests all validation functions with valid inputs, invalid inputs, and edge cases.
"""
import pytest
from app.utils.validators import (
    validate_ip_address,
    validate_subnet,
    validate_port,
    validate_port_range,
    validate_interface_name,
    validate_vdom_name,
    validate_phase1_name,
    validate_policy_name,
    validate_config_type,
    validate_tags
)


class TestIPAddressValidation:
    """Test IP address validation."""

    def test_valid_ipv4(self):
        """Test valid IPv4 addresses."""
        valid_ips = [
            "192.168.1.1",
            "10.0.0.1",
            "172.16.0.1",
            "8.8.8.8",
            "255.255.255.255",
            "0.0.0.0"
        ]
        for ip in valid_ips:
            is_valid, error = validate_ip_address(ip)
            assert is_valid, f"Expected {ip} to be valid, got error: {error}"
            assert error is None

    def test_valid_ipv6(self):
        """Test valid IPv6 addresses."""
        valid_ips = [
            "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
            "2001:db8:85a3::8a2e:370:7334",
            "::1",
            "fe80::1",
            "::"
        ]
        for ip in valid_ips:
            is_valid, error = validate_ip_address(ip)
            assert is_valid, f"Expected {ip} to be valid, got error: {error}"
            assert error is None

    def test_invalid_ipv4(self):
        """Test invalid IPv4 addresses."""
        invalid_ips = [
            "256.1.1.1",  # Octet > 255
            "192.168.1",  # Missing octet
            "192.168.1.1.1",  # Extra octet
            "192.168.-1.1",  # Negative number
            "abc.def.ghi.jkl",  # Letters
            "192.168.1.1/24",  # CIDR notation (not an IP)
            "192.168.1.1:8080"  # IP with port
        ]
        for ip in invalid_ips:
            is_valid, error = validate_ip_address(ip)
            assert not is_valid, f"Expected {ip} to be invalid"
            assert error is not None
            assert "Invalid IP address" in error

    def test_empty_ip(self):
        """Test empty IP address (should be valid as optional)."""
        is_valid, error = validate_ip_address("")
        assert is_valid
        assert error is None

        is_valid, error = validate_ip_address(None)
        assert is_valid
        assert error is None


class TestSubnetValidation:
    """Test subnet validation."""

    def test_valid_ipv4_subnets(self):
        """Test valid IPv4 subnets in CIDR notation."""
        valid_subnets = [
            "192.168.1.0/24",
            "10.0.0.0/8",
            "172.16.0.0/12",
            "192.168.1.100/32",  # Single host
            "0.0.0.0/0",  # All addresses
            "192.168.1.0/0"  # Valid but not strict
        ]
        for subnet in valid_subnets:
            is_valid, error = validate_subnet(subnet)
            assert is_valid, f"Expected {subnet} to be valid, got error: {error}"
            assert error is None

    def test_valid_ipv6_subnets(self):
        """Test valid IPv6 subnets."""
        valid_subnets = [
            "2001:db8::/32",
            "fe80::/10",
            "::1/128"
        ]
        for subnet in valid_subnets:
            is_valid, error = validate_subnet(subnet)
            assert is_valid, f"Expected {subnet} to be valid, got error: {error}"
            assert error is None

    def test_invalid_subnets(self):
        """Test invalid subnet formats."""
        invalid_subnets = [
            "192.168.1.0",  # Missing CIDR
            "192.168.1.0/33",  # Invalid CIDR (> 32)
            "192.168.1.0/-1",  # Negative CIDR
            "192.168.1.0/abc",  # Non-numeric CIDR
            "256.1.1.0/24",  # Invalid IP
            "192.168.1/24"  # Incomplete IP
        ]
        for subnet in invalid_subnets:
            is_valid, error = validate_subnet(subnet)
            assert not is_valid, f"Expected {subnet} to be invalid"
            assert error is not None
            assert "Invalid subnet" in error

    def test_empty_subnet(self):
        """Test empty subnet (should be valid as optional)."""
        is_valid, error = validate_subnet("")
        assert is_valid
        assert error is None


class TestPortValidation:
    """Test port number validation."""

    def test_valid_ports(self):
        """Test valid port numbers."""
        valid_ports = [1, 80, 443, 8080, 65535]
        for port in valid_ports:
            is_valid, error = validate_port(port)
            assert is_valid, f"Expected port {port} to be valid, got error: {error}"
            assert error is None

    def test_valid_port_strings(self):
        """Test valid port numbers as strings."""
        valid_ports = ["1", "80", "443", "8080", "65535"]
        for port in valid_ports:
            is_valid, error = validate_port(port)
            assert is_valid, f"Expected port {port} to be valid, got error: {error}"
            assert error is None

    def test_invalid_ports(self):
        """Test invalid port numbers."""
        invalid_ports = [
            0,  # Too low
            -1,  # Negative
            65536,  # Too high
            100000,  # Way too high
            "abc",  # Non-numeric
            "80.5",  # Decimal
            "80-443"  # Range (not single port)
        ]
        for port in invalid_ports:
            is_valid, error = validate_port(port)
            assert not is_valid, f"Expected port {port} to be invalid"
            assert error is not None

    def test_boundary_ports(self):
        """Test boundary port numbers."""
        # Minimum valid port
        is_valid, error = validate_port(1)
        assert is_valid
        assert error is None

        # Maximum valid port
        is_valid, error = validate_port(65535)
        assert is_valid
        assert error is None

        # Just below minimum
        is_valid, error = validate_port(0)
        assert not is_valid
        assert "between 1 and 65535" in error

        # Just above maximum
        is_valid, error = validate_port(65536)
        assert not is_valid
        assert "between 1 and 65535" in error

    def test_empty_port(self):
        """Test empty port (should be valid as optional)."""
        is_valid, error = validate_port("")
        assert is_valid
        assert error is None


class TestPortRangeValidation:
    """Test port range validation."""

    def test_valid_port_ranges(self):
        """Test valid port ranges."""
        valid_ranges = [
            "80-443",
            "1-65535",
            "8000-9000",
            "1024-1024",  # Same port (valid range)
        ]
        for range_str in valid_ranges:
            is_valid, error = validate_port_range(range_str)
            assert is_valid, f"Expected range {range_str} to be valid, got error: {error}"
            assert error is None

    def test_valid_single_port_as_range(self):
        """Test single port without hyphen (valid)."""
        valid_ports = ["80", "443", "8080"]
        for port in valid_ports:
            is_valid, error = validate_port_range(port)
            assert is_valid, f"Expected single port {port} to be valid, got error: {error}"
            assert error is None

    def test_invalid_port_ranges(self):
        """Test invalid port ranges."""
        # Reversed range (start > end)
        is_valid, error = validate_port_range("443-80")
        assert not is_valid
        assert "start must be less than or equal to end" in error

        # Invalid format (multiple hyphens)
        is_valid, error = validate_port_range("80-443-8080")
        assert not is_valid
        assert "Invalid port range format" in error

        # Invalid port numbers in range
        is_valid, error = validate_port_range("0-443")
        assert not is_valid

        is_valid, error = validate_port_range("80-100000")
        assert not is_valid

        # Non-numeric
        is_valid, error = validate_port_range("abc-def")
        assert not is_valid

    def test_empty_port_range(self):
        """Test empty port range (should be valid as optional)."""
        is_valid, error = validate_port_range("")
        assert is_valid
        assert error is None


class TestInterfaceNameValidation:
    """Test FortiGate interface name validation."""

    def test_valid_interface_names(self):
        """Test valid FortiGate interface names."""
        valid_names = [
            "wan1",
            "wan2",
            "lan",
            "port1",
            "port10",
            "dmz",
            "internal",
            "ssl.root",
            "test-interface",
            "test_interface",
            "Interface123"
        ]
        for name in valid_names:
            is_valid, error = validate_interface_name(name)
            assert is_valid, f"Expected interface {name} to be valid, got error: {error}"
            assert error is None

    def test_invalid_interface_names(self):
        """Test invalid interface names."""
        # Special characters (not allowed except . - _)
        is_valid, error = validate_interface_name("wan@1")
        assert not is_valid
        assert "Invalid interface name" in error

        is_valid, error = validate_interface_name("wan 1")  # Space
        assert not is_valid
        assert "Invalid interface name" in error

        # Too long (> 35 characters)
        long_name = "a" * 36
        is_valid, error = validate_interface_name(long_name)
        assert not is_valid
        assert "too long" in error

    def test_interface_name_max_length(self):
        """Test interface name maximum length."""
        # Exactly 35 characters (valid)
        max_valid = "a" * 35
        is_valid, error = validate_interface_name(max_valid)
        assert is_valid
        assert error is None

        # 36 characters (invalid)
        too_long = "a" * 36
        is_valid, error = validate_interface_name(too_long)
        assert not is_valid
        assert "max 35 characters" in error

    def test_empty_interface_name(self):
        """Test empty interface name (should be valid as optional)."""
        is_valid, error = validate_interface_name("")
        assert is_valid
        assert error is None


class TestVDOMNameValidation:
    """Test FortiGate VDOM name validation."""

    def test_valid_vdom_names(self):
        """Test valid VDOM names."""
        valid_names = [
            "root",
            "vdom1",
            "customer-vdom",
            "test_vdom",
            "VDOM123"
        ]
        for name in valid_names:
            is_valid, error = validate_vdom_name(name)
            assert is_valid, f"Expected VDOM {name} to be valid, got error: {error}"
            assert error is None

    def test_invalid_vdom_names(self):
        """Test invalid VDOM names."""
        # Special characters (only alphanumeric, -, _ allowed)
        is_valid, error = validate_vdom_name("vdom.test")
        assert not is_valid
        assert "Invalid VDOM name" in error

        is_valid, error = validate_vdom_name("vdom@123")
        assert not is_valid

        # Too long (> 31 characters)
        long_name = "a" * 32
        is_valid, error = validate_vdom_name(long_name)
        assert not is_valid
        assert "too long" in error

    def test_vdom_name_max_length(self):
        """Test VDOM name maximum length."""
        # Exactly 31 characters (valid)
        max_valid = "a" * 31
        is_valid, error = validate_vdom_name(max_valid)
        assert is_valid
        assert error is None

        # 32 characters (invalid)
        too_long = "a" * 32
        is_valid, error = validate_vdom_name(too_long)
        assert not is_valid
        assert "max 31 characters" in error

    def test_empty_vdom_name(self):
        """Test empty VDOM name (should be valid as optional)."""
        is_valid, error = validate_vdom_name("")
        assert is_valid
        assert error is None


class TestPhase1NameValidation:
    """Test IPsec Phase1 interface name validation."""

    def test_valid_phase1_names(self):
        """Test valid Phase1 names."""
        valid_names = [
            "aws-vpn",
            "azure_tunnel",
            "site2site",
            "VPN123",
            "tunnel-1"
        ]
        for name in valid_names:
            is_valid, error = validate_phase1_name(name)
            assert is_valid, f"Expected Phase1 name {name} to be valid, got error: {error}"
            assert error is None

    def test_invalid_phase1_names(self):
        """Test invalid Phase1 names."""
        # Special characters (only alphanumeric, -, _ allowed)
        is_valid, error = validate_phase1_name("vpn.tunnel")
        assert not is_valid
        assert "alphanumeric, hyphens, underscores only" in error

        is_valid, error = validate_phase1_name("vpn@123")
        assert not is_valid

        # Too long (> 35 characters)
        long_name = "a" * 36
        is_valid, error = validate_phase1_name(long_name)
        assert not is_valid
        assert "too long" in error

    def test_empty_phase1_name(self):
        """Test empty Phase1 name (should be INVALID - it's required)."""
        is_valid, error = validate_phase1_name("")
        assert not is_valid
        assert "Phase1 name is required" in error

        is_valid, error = validate_phase1_name(None)
        assert not is_valid
        assert "Phase1 name is required" in error


class TestPolicyNameValidation:
    """Test firewall policy name validation."""

    def test_valid_policy_names(self):
        """Test valid policy names."""
        valid_names = [
            "Allow-Internal-to-DMZ",
            "Block Malicious Traffic",
            "Policy #123",
            "VPN-Access",
            "a" * 255  # Maximum length
        ]
        for name in valid_names:
            is_valid, error = validate_policy_name(name)
            assert is_valid, f"Expected policy name {name} to be valid, got error: {error}"
            assert error is None

    def test_invalid_policy_names(self):
        """Test invalid policy names."""
        # Too long (> 255 characters)
        long_name = "a" * 256
        is_valid, error = validate_policy_name(long_name)
        assert not is_valid
        assert "too long" in error
        assert "max 255 characters" in error

    def test_empty_policy_name(self):
        """Test empty policy name (should be valid as optional)."""
        is_valid, error = validate_policy_name("")
        assert is_valid
        assert error is None


class TestConfigTypeValidation:
    """Test configuration type validation."""

    def test_valid_config_types(self):
        """Test all valid configuration types."""
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
        for config_type in valid_types:
            is_valid, error = validate_config_type(config_type)
            assert is_valid, f"Expected config type {config_type} to be valid, got error: {error}"
            assert error is None

    def test_invalid_config_types(self):
        """Test invalid configuration types."""
        invalid_types = [
            'invalid',
            'test',
            'foo',
            'IPSEC',  # Case sensitive
            'firewall-policy',
            ''
        ]
        for config_type in invalid_types:
            is_valid, error = validate_config_type(config_type)
            assert not is_valid, f"Expected config type {config_type} to be invalid"
            assert error is not None
            assert "Invalid configuration type" in error


class TestTagsValidation:
    """Test tags validation."""

    def test_valid_tags_as_list(self):
        """Test valid tags as list."""
        valid_tags = [
            ['aws', 'vpn', 'production'],
            ['tag1'],
            ['a', 'b', 'c', 'd', 'e']
        ]
        for tags in valid_tags:
            is_valid, error = validate_tags(tags)
            assert is_valid, f"Expected tags {tags} to be valid, got error: {error}"
            assert error is None

    def test_valid_tags_as_string(self):
        """Test valid tags as comma-separated string."""
        valid_tags = [
            'aws,vpn,production',
            'single-tag',
            'tag1, tag2, tag3'  # With spaces
        ]
        for tags in valid_tags:
            is_valid, error = validate_tags(tags)
            assert is_valid, f"Expected tags {tags} to be valid, got error: {error}"
            assert error is None

    def test_invalid_tags(self):
        """Test invalid tags."""
        # Tag too long (> 50 characters)
        long_tag = 'a' * 51
        is_valid, error = validate_tags([long_tag])
        assert not is_valid
        assert "too long" in error
        assert "max 50 characters" in error

        # Invalid type (not list or string)
        is_valid, error = validate_tags(123)
        assert not is_valid
        assert "must be a list or comma-separated string" in error

    def test_empty_tags(self):
        """Test empty tags (should be valid)."""
        is_valid, error = validate_tags([])
        assert is_valid
        assert error is None

        is_valid, error = validate_tags("")
        assert is_valid
        assert error is None

        is_valid, error = validate_tags(None)
        assert is_valid
        assert error is None


if __name__ == "__main__":
    # Run with pytest
    pytest.main([__file__, "-v", "--tb=short"])
