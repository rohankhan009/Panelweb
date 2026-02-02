#!/usr/bin/env python3
"""
PapiAtma Panel Backend API Test Suite
Tests all backend API endpoints for functionality and data integrity.
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Base URL from frontend environment
BASE_URL = "https://binary-clone-1.preview.emergentagent.com/api"

class PapiAtmaAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.admin_user = None
        self.test_client_id = None
        self.test_device_id = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if message:
            print(f"    {message}")
        if response_data and not success:
            print(f"    Response: {response_data}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
        print()
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    params: Optional[Dict] = None) -> tuple[bool, Any]:
        """Make HTTP request and return success status and response data"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == "GET":
                response = self.session.get(url, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url)
            else:
                return False, f"Unsupported method: {method}"
            
            # Check if response is successful
            if response.status_code >= 200 and response.status_code < 300:
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = response.text
                return False, f"HTTP {response.status_code}: {error_data}"
                
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error: {str(e)}"
    
    def test_api_info(self):
        """Test GET / - API info endpoint"""
        success, data = self.make_request("GET", "/")
        
        if success and isinstance(data, dict) and "message" in data:
            self.log_result("API Info", True, f"API responded: {data.get('message')}")
        else:
            self.log_result("API Info", False, "API info endpoint failed or returned unexpected format", data)
    
    def test_admin_login(self):
        """Test POST /auth/login - Admin login"""
        login_data = {
            "username": "papiatma",
            "password": "freefire123@"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict):
            if "user" in data and data["user"].get("role") == "admin":
                self.admin_user = data["user"]
                self.log_result("Admin Login", True, f"Admin logged in successfully. User ID: {self.admin_user.get('id')}")
            else:
                self.log_result("Admin Login", False, "Login successful but user role is not admin", data)
        else:
            self.log_result("Admin Login", False, "Admin login failed", data)
    
    def test_get_clients(self):
        """Test GET /admin/clients - Get all clients"""
        success, data = self.make_request("GET", "/admin/clients")
        
        if success and isinstance(data, list):
            self.log_result("Get Clients", True, f"Retrieved {len(data)} clients")
        else:
            self.log_result("Get Clients", False, "Failed to get clients or unexpected format", data)
    
    def test_create_client(self):
        """Test POST /admin/clients - Create new client"""
        # Generate unique username with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        client_data = {
            "username": f"testclient_{timestamp}",
            "password": "testpass123",
            "plan": "Premium",
            "expiry_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "telegram_id": "@testclient"
        }
        
        success, data = self.make_request("POST", "/admin/clients", client_data)
        
        if success and isinstance(data, dict):
            if "client" in data and data["client"].get("username") == client_data["username"]:
                self.test_client_id = data["client"].get("id")
                self.log_result("Create Client", True, f"Client created successfully. ID: {self.test_client_id}")
            else:
                self.log_result("Create Client", False, "Client creation response format unexpected", data)
        else:
            self.log_result("Create Client", False, "Failed to create client", data)
    
    def test_admin_stats(self):
        """Test GET /admin/stats - Get admin statistics"""
        success, data = self.make_request("GET", "/admin/stats")
        
        if success and isinstance(data, dict):
            required_keys = ["total", "active", "expired", "premium"]
            if all(key in data for key in required_keys):
                self.log_result("Admin Stats", True, 
                    f"Stats: Total={data['total']}, Active={data['active']}, Expired={data['expired']}, Premium={data['premium']}")
            else:
                self.log_result("Admin Stats", False, "Stats response missing required fields", data)
        else:
            self.log_result("Admin Stats", False, "Failed to get admin stats", data)
    
    def test_get_devices(self):
        """Test GET /devices/{user_id} - Get devices for a user"""
        if not self.test_client_id:
            self.log_result("Get Devices", False, "No test client ID available for device testing")
            return
        
        success, data = self.make_request("GET", f"/devices/{self.test_client_id}")
        
        if success and isinstance(data, list):
            self.log_result("Get Devices", True, f"Retrieved {len(data)} devices for user {self.test_client_id}")
        else:
            self.log_result("Get Devices", False, "Failed to get devices or unexpected format", data)
    
    def test_get_device_stats(self):
        """Test GET /devices/{user_id}/stats - Get device statistics"""
        if not self.test_client_id:
            self.log_result("Get Device Stats", False, "No test client ID available for device stats testing")
            return
        
        success, data = self.make_request("GET", f"/devices/{self.test_client_id}/stats")
        
        if success and isinstance(data, dict):
            required_keys = ["total", "online", "offline", "pin"]
            if all(key in data for key in required_keys):
                self.log_result("Get Device Stats", True, 
                    f"Device Stats: Total={data['total']}, Online={data['online']}, Offline={data['offline']}, With PIN={data['pin']}")
            else:
                self.log_result("Get Device Stats", False, "Device stats response missing required fields", data)
        else:
            self.log_result("Get Device Stats", False, "Failed to get device stats", data)
    
    def test_add_device(self):
        """Test POST /devices/{user_id} - Add device"""
        if not self.test_client_id:
            self.log_result("Add Device", False, "No test client ID available for device creation")
            return
        
        device_data = {
            "name": "Samsung Galaxy S21",
            "model": "SM-G991B",
            "note": "Test device for API testing"
        }
        
        success, data = self.make_request("POST", f"/devices/{self.test_client_id}", device_data)
        
        if success and isinstance(data, dict):
            if "device" in data and data["device"].get("name") == device_data["name"]:
                self.test_device_id = data["device"].get("id")
                self.log_result("Add Device", True, f"Device added successfully. ID: {self.test_device_id}")
            else:
                self.log_result("Add Device", False, "Device creation response format unexpected", data)
        else:
            self.log_result("Add Device", False, "Failed to add device", data)
    
    def test_get_sms(self):
        """Test GET /sms/{user_id} - Get SMS messages"""
        if not self.test_client_id:
            self.log_result("Get SMS", False, "No test client ID available for SMS testing")
            return
        
        success, data = self.make_request("GET", f"/sms/{self.test_client_id}")
        
        if success and isinstance(data, list):
            self.log_result("Get SMS", True, f"Retrieved {len(data)} SMS messages for user {self.test_client_id}")
        else:
            self.log_result("Get SMS", False, "Failed to get SMS messages or unexpected format", data)
    
    def test_get_firebase_accounts(self):
        """Test GET /firebase/{user_id} - Get Firebase accounts"""
        if not self.test_client_id:
            self.log_result("Get Firebase Accounts", False, "No test client ID available for Firebase testing")
            return
        
        success, data = self.make_request("GET", f"/firebase/{self.test_client_id}")
        
        if success and isinstance(data, list):
            self.log_result("Get Firebase Accounts", True, f"Retrieved {len(data)} Firebase accounts for user {self.test_client_id}")
        else:
            self.log_result("Get Firebase Accounts", False, "Failed to get Firebase accounts or unexpected format", data)
    
    def test_add_firebase_account(self):
        """Test POST /firebase/{user_id} - Add Firebase account"""
        if not self.test_client_id:
            self.log_result("Add Firebase Account", False, "No test client ID available for Firebase account creation")
            return
        
        firebase_data = {
            "name": "Test Firebase Project",
            "project_id": "test-project-12345",
            "api_key": "AIzaSyDummyApiKeyForTesting123456789"
        }
        
        success, data = self.make_request("POST", f"/firebase/{self.test_client_id}", firebase_data)
        
        if success and isinstance(data, dict):
            if "account" in data and data["account"].get("name") == firebase_data["name"]:
                self.log_result("Add Firebase Account", True, f"Firebase account added successfully. ID: {data['account'].get('id')}")
            else:
                self.log_result("Add Firebase Account", False, "Firebase account creation response format unexpected", data)
        else:
            self.log_result("Add Firebase Account", False, "Failed to add Firebase account", data)
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("=" * 60)
        print("PapiAtma Panel Backend API Test Suite")
        print("=" * 60)
        print(f"Base URL: {self.base_url}")
        print()
        
        # Test sequence
        self.test_api_info()
        self.test_admin_login()
        self.test_get_clients()
        self.test_create_client()
        self.test_admin_stats()
        self.test_get_devices()
        self.test_get_device_stats()
        self.test_add_device()
        self.test_get_sms()
        self.test_get_firebase_accounts()
        self.test_add_firebase_account()
        
        # Print summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Total: {self.results['passed'] + self.results['failed']}")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  - {error}")
        
        print("\n" + "=" * 60)
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = PapiAtmaAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)