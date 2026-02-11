#!/usr/bin/env python3
"""
Comprehensive API test script for FortiGate Spartan Wizard Backend.
Tests all Phase 1 endpoints: auth and configuration CRUD.
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5003"
API_URL = f"{BASE_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name):
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}Testing: {name}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.YELLOW}→ {message}{Colors.END}")

# Test results storage
results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def test(name, func):
    """Run a test and track results."""
    try:
        func()
        results["passed"] += 1
        results["tests"].append((name, True))
        print_success(f"{name} PASSED")
    except AssertionError as e:
        results["failed"] += 1
        results["tests"].append((name, False))
        print_error(f"{name} FAILED: {str(e)}")
    except Exception as e:
        results["failed"] += 1
        results["tests"].append((name, False))
        print_error(f"{name} ERROR: {str(e)}")

# Global storage for test data
test_data = {}

def test_health_check():
    """Test health check endpoint."""
    print_test("Health Check")
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "healthy", f"Expected healthy status"
    print_info(f"Response: {json.dumps(data, indent=2)}")

def test_register():
    """Test user registration."""
    print_test("User Registration")
    timestamp = int(datetime.now().timestamp())
    payload = {
        "username": f"testuser_{timestamp}",
        "email": f"test_{timestamp}@graphenenetworks.com",
        "password": "SecurePass123"
    }
    test_data["username"] = payload["username"]
    test_data["password"] = payload["password"]

    response = requests.post(f"{API_URL}/auth/register", json=payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    assert "data" in data
    assert data["data"]["username"] == payload["username"]
    print_info(f"Registered user: {data['data']['username']}")

def test_login():
    """Test user login."""
    print_test("User Login")
    payload = {
        "username": test_data["username"],
        "password": test_data["password"]
    }

    response = requests.post(f"{API_URL}/auth/login", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]

    test_data["access_token"] = data["data"]["access_token"]
    test_data["refresh_token"] = data["data"]["refresh_token"]
    test_data["user_id"] = data["data"]["user"]["id"]

    print_info(f"Logged in as: {data['data']['user']['username']}")
    print_info(f"User ID: {test_data['user_id']}")

def test_get_current_user():
    """Test get current user endpoint."""
    print_test("Get Current User")
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}

    response = requests.get(f"{API_URL}/auth/me", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    assert data["data"]["username"] == test_data["username"]
    print_info(f"Current user: {data['data']['username']}")

def test_create_configuration():
    """Test creating a configuration."""
    print_test("Create Configuration")
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}
    payload = {
        "name": "Test VPN to AWS",
        "config_type": "ipsec",
        "description": "IPsec VPN tunnel to AWS VPC",
        "data": {
            "phase1_name": "aws-vpn-test",
            "remote_gateway": "52.123.45.67",
            "local_interface": "wan1",
            "local_subnet": "192.168.1.0/24",
            "remote_subnet": "10.0.0.0/16"
        },
        "tags": ["aws", "vpn", "test"]
    }

    response = requests.post(f"{API_URL}/configs", json=payload, headers=headers)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    assert data["data"]["name"] == payload["name"]
    assert data["data"]["config_type"] == "ipsec"

    test_data["config_id"] = data["data"]["id"]
    print_info(f"Created configuration ID: {test_data['config_id']}")
    print_info(f"Name: {data['data']['name']}")

def test_list_configurations():
    """Test listing configurations."""
    print_test("List Configurations")
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}

    response = requests.get(f"{API_URL}/configs", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    assert "data" in data
    assert "items" in data["data"]
    assert len(data["data"]["items"]) > 0
    print_info(f"Found {len(data['data']['items'])} configurations")

def test_get_configuration():
    """Test getting a specific configuration."""
    print_test("Get Configuration")
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}
    config_id = test_data["config_id"]

    response = requests.get(f"{API_URL}/configs/{config_id}", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    assert data["data"]["id"] == config_id
    print_info(f"Retrieved configuration: {data['data']['name']}")

def test_update_configuration():
    """Test updating a configuration."""
    print_test("Update Configuration")
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}
    config_id = test_data["config_id"]
    payload = {
        "name": "Updated VPN Configuration",
        "description": "Updated description",
        "data": {
            "phase1_name": "aws-vpn-updated",
            "remote_gateway": "52.99.88.77"
        },
        "change_description": "Updated remote gateway IP"
    }

    response = requests.put(f"{API_URL}/configs/{config_id}", json=payload, headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    assert data["data"]["name"] == payload["name"]
    print_info(f"Updated configuration: {data['data']['name']}")

def test_get_versions():
    """Test getting configuration version history."""
    print_test("Get Version History")
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}
    config_id = test_data["config_id"]

    response = requests.get(f"{API_URL}/configs/{config_id}/versions", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    assert "versions" in data["data"]
    assert len(data["data"]["versions"]) >= 2  # Initial version + update
    print_info(f"Found {len(data['data']['versions'])} versions")

def test_delete_configuration():
    """Test deleting a configuration."""
    print_test("Delete Configuration")
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}
    config_id = test_data["config_id"]

    response = requests.delete(f"{API_URL}/configs/{config_id}", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    print_info(f"Deleted configuration ID: {config_id}")

def test_refresh_token():
    """Test refreshing JWT token."""
    print_test("Refresh Token")
    headers = {"Authorization": f"Bearer {test_data['refresh_token']}"}

    response = requests.post(f"{API_URL}/auth/refresh", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] == True
    assert "access_token" in data["data"]
    print_info("Successfully refreshed access token")

def print_summary():
    """Print test summary."""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")

    total = results["passed"] + results["failed"]
    pass_rate = (results["passed"] / total * 100) if total > 0 else 0

    print(f"\n{Colors.GREEN}Passed: {results['passed']}/{total}{Colors.END}")
    print(f"{Colors.RED}Failed: {results['failed']}/{total}{Colors.END}")
    print(f"\n{Colors.YELLOW}Pass Rate: {pass_rate:.1f}%{Colors.END}\n")

    if results["failed"] > 0:
        print(f"\n{Colors.RED}Failed Tests:{Colors.END}")
        for name, passed in results["tests"]:
            if not passed:
                print(f"  {Colors.RED}✗ {name}{Colors.END}")

    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}\n")

if __name__ == "__main__":
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}FortiGate Spartan Wizard - Phase 1 API Tests{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    print_info(f"Base URL: {BASE_URL}")
    print_info(f"API URL: {API_URL}\n")

    # Run all tests in sequence
    test("Health Check", test_health_check)
    test("User Registration", test_register)
    test("User Login", test_login)
    test("Get Current User", test_get_current_user)
    test("Create Configuration", test_create_configuration)
    test("List Configurations", test_list_configurations)
    test("Get Configuration", test_get_configuration)
    test("Update Configuration", test_update_configuration)
    test("Get Version History", test_get_versions)
    test("Delete Configuration", test_delete_configuration)
    test("Refresh Token", test_refresh_token)

    # Print summary
    print_summary()

    # Exit with appropriate code
    exit(0 if results["failed"] == 0 else 1)
