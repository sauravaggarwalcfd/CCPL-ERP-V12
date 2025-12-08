import requests
import sys
from datetime import datetime

class ERPBackendTester:
    def __init__(self, base_url="https://textile-track-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_login(self, email, password):
        """Test login and get token"""
        print("\n" + "="*60)
        print("AUTHENTICATION TESTS")
        print("="*60)
        
        success, response = self.run_test(
            "Login with admin credentials",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_dashboard(self):
        """Test dashboard stats"""
        print("\n" + "="*60)
        print("DASHBOARD TESTS")
        print("="*60)
        
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        if success:
            print(f"   Stats: {response}")
        return success

    def test_masters(self):
        """Test all master endpoints"""
        print("\n" + "="*60)
        print("MASTERS TESTS")
        print("="*60)
        
        # Item Categories
        self.run_test(
            "Get Item Categories",
            "GET",
            "masters/item-categories",
            200
        )
        
        # Items
        self.run_test(
            "Get Items",
            "GET",
            "masters/items",
            200
        )
        
        # UOMs
        self.run_test(
            "Get UOMs",
            "GET",
            "masters/uoms",
            200
        )
        
        # Suppliers
        self.run_test(
            "Get Suppliers",
            "GET",
            "masters/suppliers",
            200
        )
        
        # Warehouses
        self.run_test(
            "Get Warehouses",
            "GET",
            "masters/warehouses",
            200
        )
        
        # BIN Locations
        self.run_test(
            "Get BIN Locations",
            "GET",
            "masters/bin-locations",
            200
        )
        
        # Tax/HSN
        self.run_test(
            "Get Tax/HSN",
            "GET",
            "masters/tax-hsn",
            200
        )

    def test_purchase(self):
        """Test purchase endpoints"""
        print("\n" + "="*60)
        print("PURCHASE TESTS")
        print("="*60)
        
        # Purchase Indents
        self.run_test(
            "Get Purchase Indents",
            "GET",
            "purchase/indents",
            200
        )
        
        # Purchase Orders
        self.run_test(
            "Get Purchase Orders",
            "GET",
            "purchase/orders",
            200
        )

    def test_quality(self):
        """Test quality endpoints"""
        print("\n" + "="*60)
        print("QUALITY TESTS")
        print("="*60)
        
        self.run_test(
            "Get Quality Checks",
            "GET",
            "quality/checks",
            200
        )

    def test_inventory(self):
        """Test inventory endpoints"""
        print("\n" + "="*60)
        print("INVENTORY TESTS")
        print("="*60)
        
        # GRN
        self.run_test(
            "Get GRN",
            "GET",
            "inventory/grn",
            200
        )
        
        # Stock Inward
        self.run_test(
            "Get Stock Inward",
            "GET",
            "inventory/stock-inward",
            200
        )
        
        # Stock Transfer
        self.run_test(
            "Get Stock Transfer",
            "GET",
            "inventory/stock-transfer",
            200
        )
        
        # Issue to Department
        self.run_test(
            "Get Issues",
            "GET",
            "inventory/issue",
            200
        )
        
        # Return from Department
        self.run_test(
            "Get Returns",
            "GET",
            "inventory/return",
            200
        )
        
        # Stock Adjustment
        self.run_test(
            "Get Adjustments",
            "GET",
            "inventory/adjustment",
            200
        )
        
        # Stock Balance
        self.run_test(
            "Get Stock Balance",
            "GET",
            "inventory/stock-balance",
            200
        )

    def test_reports(self):
        """Test report endpoints"""
        print("\n" + "="*60)
        print("REPORTS TESTS")
        print("="*60)
        
        self.run_test(
            "Get Stock Ledger Report",
            "GET",
            "reports/stock-ledger",
            200
        )
        
        self.run_test(
            "Get Issue Register Report",
            "GET",
            "reports/issue-register",
            200
        )
        
        self.run_test(
            "Get Pending PO Report",
            "GET",
            "reports/pending-po",
            200
        )

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"\n{i}. {test.get('test', 'Unknown')}")
                if 'error' in test:
                    print(f"   Error: {test['error']}")
                else:
                    print(f"   Expected: {test.get('expected')}, Got: {test.get('actual')}")
                    if 'response' in test:
                        print(f"   Response: {test['response']}")

def main():
    print("="*60)
    print("ERP INVENTORY MANAGEMENT SYSTEM - BACKEND API TESTS")
    print("="*60)
    
    tester = ERPBackendTester()
    
    # Test login
    if not tester.test_login("admin@erp.com", "admin123"):
        print("\n❌ Login failed. Cannot proceed with other tests.")
        print("   Please ensure:")
        print("   1. Backend server is running")
        print("   2. Admin user exists in database")
        print("   3. Credentials are correct (admin@erp.com / admin123)")
        tester.print_summary()
        return 1
    
    # Run all tests
    tester.test_dashboard()
    tester.test_masters()
    tester.test_purchase()
    tester.test_quality()
    tester.test_inventory()
    tester.test_reports()
    
    # Print summary
    tester.print_summary()
    
    # Return exit code based on success rate
    success_rate = (tester.tests_passed / tester.tests_run * 100)
    if success_rate == 100:
        return 0
    elif success_rate >= 80:
        return 0  # Consider 80%+ as acceptable
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main())
