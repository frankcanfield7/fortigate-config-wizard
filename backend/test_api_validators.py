#!/usr/bin/env python3
"""
Integration tests for validator usage in API endpoints.
Tests that validators are properly called when creating/updating configurations.
"""
import pytest
import json
from datetime import datetime
from app import create_app, db
from app.models import User, Configuration


@pytest.fixture
def app():
    """Create and configure a test Flask application."""
    app = create_app('testing')

    # Create the database and tables
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client for the Flask application."""
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Create a user and return authentication headers."""
    # Register a user
    timestamp = int(datetime.now().timestamp())
    register_data = {
        "username": f"testuser_{timestamp}",
        "email": f"test_{timestamp}@test.com",
        "password": "TestPass123"
    }
    client.post('/api/auth/register', json=register_data)

    # Login to get token
    login_data = {
        "username": register_data["username"],
        "password": register_data["password"]
    }
    response = client.post('/api/auth/login', json=login_data)
    data = json.loads(response.data)
    access_token = data["data"]["access_token"]

    return {"Authorization": f"Bearer {access_token}"}


class TestConfigurationValidation:
    """Test that configuration creation/update properly validates fields."""

    def test_create_config_with_invalid_config_type(self, client, auth_headers):
        """Test that invalid config_type is rejected."""
        payload = {
            "name": "Test Config",
            "config_type": "invalid_type",  # Invalid type
            "data": {"test": "data"}
        }

        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 422
        data = json.loads(response.data)
        assert data["success"] is False
        assert data["error"] == "Validation failed"
        assert "config_type" in data["errors"]

    def test_create_config_with_valid_config_types(self, client, auth_headers):
        """Test that all valid config types are accepted."""
        valid_types = ['ipsec', 'sdwan', 'firewall', 'interface', 'ha',
                      'saml', 'routing', 'dns', 'dhcp', 'vpn', 'other']

        for config_type in valid_types:
            payload = {
                "name": f"Test {config_type} Config",
                "config_type": config_type,
                "data": {"test": "data"}
            }

            response = client.post('/api/configs', json=payload, headers=auth_headers)
            assert response.status_code == 201, f"Config type {config_type} should be valid"

    def test_create_config_with_invalid_tags(self, client, auth_headers):
        """Test that tags that are too long are rejected."""
        long_tag = "a" * 51  # Max is 50 characters
        payload = {
            "name": "Test Config",
            "config_type": "ipsec",
            "data": {"test": "data"},
            "tags": [long_tag]
        }

        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 422
        data = json.loads(response.data)
        assert data["success"] is False
        assert data["error"] == "Validation failed"
        assert "tags" in data["errors"]

    def test_create_config_with_valid_tags(self, client, auth_headers):
        """Test that valid tags are accepted."""
        payload = {
            "name": "Test Config",
            "config_type": "ipsec",
            "data": {"test": "data"},
            "tags": ["aws", "vpn", "production"]
        }

        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["tags"] == ["aws", "vpn", "production"]

    def test_create_config_with_tags_as_string(self, client, auth_headers):
        """Test that tags can be provided as comma-separated string."""
        payload = {
            "name": "Test Config",
            "config_type": "ipsec",
            "data": {"test": "data"},
            "tags": "aws,vpn,production"
        }

        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["success"] is True
        # Should be stored as comma-separated string internally
        assert "aws" in data["data"]["tags"]
        assert "vpn" in data["data"]["tags"]

    def test_create_config_missing_required_fields(self, client, auth_headers):
        """Test that missing required fields are rejected."""
        # Missing name
        payload = {
            "config_type": "ipsec",
            "data": {"test": "data"}
        }
        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "name is required" in data["error"]

        # Missing config_type
        payload = {
            "name": "Test Config",
            "data": {"test": "data"}
        }
        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "type is required" in data["error"]

        # Missing data
        payload = {
            "name": "Test Config",
            "config_type": "ipsec"
        }
        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "data is required" in data["error"]


class TestIPsecConfigurationData:
    """Test IPsec configuration with FortiGate-specific field validation."""

    def test_create_ipsec_config_with_valid_data(self, client, auth_headers):
        """Test creating IPsec config with valid FortiGate data."""
        payload = {
            "name": "AWS VPN Tunnel",
            "config_type": "ipsec",
            "description": "IPsec tunnel to AWS VPC",
            "data": {
                "phase1_name": "aws-vpn-prod",
                "remote_gateway": "52.123.45.67",
                "local_interface": "wan1",
                "local_subnet": "192.168.1.0/24",
                "remote_subnet": "10.0.0.0/16",
                "psk": "SecurePreSharedKey123",
                "ike_version": "2",
                "phase1_proposal": "aes256-sha256",
                "phase2_proposal": "aes256-sha256",
                "dpd": "on-idle",
                "nat_traversal": "enable"
            },
            "tags": ["aws", "vpn", "production"]
        }

        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["name"] == "AWS VPN Tunnel"
        assert data["data"]["config_type"] == "ipsec"
        assert data["data"]["data"]["phase1_name"] == "aws-vpn-prod"


class TestSDWANConfigurationData:
    """Test SD-WAN configuration data."""

    def test_create_sdwan_config_with_valid_data(self, client, auth_headers):
        """Test creating SD-WAN config with valid data."""
        payload = {
            "name": "Dual-WAN SD-WAN Config",
            "config_type": "sdwan",
            "description": "SD-WAN configuration with two ISPs",
            "data": {
                "zone": "virtual-wan-link",
                "members": [
                    {
                        "interface": "wan1",
                        "gateway": "192.168.1.1",
                        "cost": 0,
                        "weight": 10,
                        "priority": 1
                    },
                    {
                        "interface": "wan2",
                        "gateway": "10.0.0.1",
                        "cost": 0,
                        "weight": 5,
                        "priority": 2
                    }
                ],
                "health_check": {
                    "name": "google-dns",
                    "server": "8.8.8.8",
                    "protocol": "ping",
                    "interval": 1000,
                    "failtime": 5,
                    "recoverytime": 5
                }
            },
            "tags": ["sdwan", "dual-wan", "ha"]
        }

        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["config_type"] == "sdwan"
        assert len(data["data"]["data"]["members"]) == 2


class TestFirewallPolicyConfigurationData:
    """Test firewall policy configuration data."""

    def test_create_firewall_config_with_valid_data(self, client, auth_headers):
        """Test creating firewall policy config with valid data."""
        payload = {
            "name": "Allow Internal to DMZ",
            "config_type": "firewall",
            "description": "Firewall policy allowing internal network to DMZ",
            "data": {
                "policy_id": "100",
                "policy_name": "Internal-to-DMZ",
                "src_interface": "internal",
                "dst_interface": "dmz",
                "src_address": "LAN_Subnet",
                "dst_address": "DMZ_Servers",
                "service": "HTTP HTTPS",
                "action": "accept",
                "nat": "disable",
                "log": "all",
                "comments": "Allow web access from internal to DMZ web servers"
            },
            "tags": ["firewall", "dmz", "web-access"]
        }

        response = client.post('/api/configs', json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["config_type"] == "firewall"
        assert data["data"]["data"]["action"] == "accept"


class TestConfigurationUpdate:
    """Test configuration update with validation."""

    def test_update_config_with_invalid_tags(self, client, auth_headers):
        """Test that updating with invalid tags is rejected."""
        # First create a config
        payload = {
            "name": "Test Config",
            "config_type": "ipsec",
            "data": {"test": "data"}
        }
        response = client.post('/api/configs', json=payload, headers=auth_headers)
        config_id = json.loads(response.data)["data"]["id"]

        # Try to update with invalid tags
        long_tag = "a" * 51
        update_payload = {
            "tags": [long_tag]
        }
        response = client.put(f'/api/configs/{config_id}', json=update_payload, headers=auth_headers)
        assert response.status_code == 422
        data = json.loads(response.data)
        assert data["success"] is False
        assert data["error"] == "Validation failed"
        assert "tags" in data["errors"]

    def test_update_config_with_valid_data(self, client, auth_headers):
        """Test updating configuration with valid data."""
        # Create a config
        payload = {
            "name": "Original Name",
            "config_type": "ipsec",
            "data": {"phase1_name": "original"}
        }
        response = client.post('/api/configs', json=payload, headers=auth_headers)
        config_id = json.loads(response.data)["data"]["id"]

        # Update the config
        update_payload = {
            "name": "Updated Name",
            "data": {"phase1_name": "updated"},
            "change_description": "Updated phase1 name"
        }
        response = client.put(f'/api/configs/{config_id}', json=update_payload, headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["data"]["name"] == "Updated Name"
        assert data["data"]["data"]["phase1_name"] == "updated"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
