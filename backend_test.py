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
        self.categories = []
        self.created_item_id = None

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
        success, categories = self.run_test(
            "Get Item Categories",
            "GET",
            "masters/item-categories",
            200
        )
        
        # Store categories for later use
        self.categories = categories if success else []
        
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

    def test_item_master_enhanced_features(self):
        """Test Item Master Enhanced Features"""
        print("\n" + "="*60)
        print("ITEM MASTER ENHANCED FEATURES TESTS")
        print("="*60)
        
        # Test 1: Get leaf categories with is_leaf flag
        print("\n📋 Test 1: Leaf Categories Endpoint")
        success, leaf_categories = self.run_test(
            "Get Leaf Categories with is_leaf flag",
            "GET",
            "masters/item-categories/leaf-only",
            200
        )
        
        if success and leaf_categories:
            # Verify is_leaf flag exists
            has_is_leaf = all('is_leaf' in cat for cat in leaf_categories)
            if has_is_leaf:
                print(f"   ✅ All categories have is_leaf flag")
                leaf_count = sum(1 for cat in leaf_categories if cat.get('is_leaf'))
                print(f"   📊 Found {leaf_count} leaf categories out of {len(leaf_categories)} total")
            else:
                print(f"   ❌ Some categories missing is_leaf flag")
                self.failed_tests.append({
                    "test": "Leaf Categories - is_leaf flag",
                    "error": "Not all categories have is_leaf flag"
                })
            
            # Find a leaf category for testing
            leaf_cats = [cat for cat in leaf_categories if cat.get('is_leaf')]
            if leaf_cats:
                test_category = leaf_cats[0]
                test_category_id = test_category['id']
                test_category_name = test_category['name']
                test_item_type = test_category.get('item_type', 'GENERAL')
                print(f"   🎯 Using category: {test_category_name} (Type: {test_item_type})")
            else:
                print(f"   ⚠️  No leaf categories found for testing")
                test_category_id = None
        else:
            test_category_id = None
        
        # Test 2: Preview next item code
        if test_category_id:
            print("\n📋 Test 2: Preview Next Item Code")
            success, preview_data = self.run_test(
                "Preview Next Item Code",
                "GET",
                f"masters/items/preview/next-code?category_id={test_category_id}",
                200
            )
            
            if success and preview_data:
                preview_code = preview_data.get('preview_code')
                item_type = preview_data.get('item_type')
                type_code = preview_data.get('type_code')
                category_short_code = preview_data.get('category_short_code')
                running_number = preview_data.get('running_number')
                
                print(f"   ✅ Preview Code: {preview_code}")
                print(f"   📊 Item Type: {item_type}")
                print(f"   📊 Type Code: {type_code}")
                print(f"   📊 Category Short Code: {category_short_code}")
                print(f"   📊 Running Number: {running_number}")
                
                # Verify format: TYPE-SHORTCODE-0001
                if preview_code and '-' in preview_code:
                    parts = preview_code.split('-')
                    if len(parts) == 3:
                        print(f"   ✅ Code format is correct: {parts[0]}-{parts[1]}-{parts[2]}")
                    else:
                        print(f"   ❌ Code format incorrect: expected 3 parts, got {len(parts)}")
                        self.failed_tests.append({
                            "test": "Preview Code Format",
                            "error": f"Expected format TYPE-SHORTCODE-NUMBER, got {preview_code}"
                        })
        
        # Test 3: Validate item name (unique name)
        if test_category_id:
            print("\n📋 Test 3: Validate Item Name (Unique)")
            unique_name = f"Test Item {datetime.now().strftime('%Y%m%d%H%M%S')}"
            success, validation = self.run_test(
                "Validate Unique Item Name",
                "GET",
                f"masters/items/validate/name?item_name={unique_name}&category_id={test_category_id}",
                200
            )
            
            if success and validation:
                is_unique = validation.get('is_unique')
                exists = validation.get('exists')
                message = validation.get('message')
                
                if is_unique and not exists:
                    print(f"   ✅ Name validation works: {message}")
                else:
                    print(f"   ❌ Unexpected validation result: is_unique={is_unique}, exists={exists}")
                    self.failed_tests.append({
                        "test": "Name Validation - Unique",
                        "error": f"Expected unique name to be valid, got is_unique={is_unique}"
                    })
        
        # Test 4: Create item with AUTO code generation
        if test_category_id:
            print("\n📋 Test 4: Create Item with AUTO Code Generation")
            
            # Create item with type-specific attributes
            item_data = {
                "item_code": "AUTO",
                "item_name": f"Enhanced Test Item {datetime.now().strftime('%Y%m%d%H%M%S')}",
                "category_id": test_category_id,
                "description": "Test item with enhanced features",
                "uom": "PCS",
                "purchase_uom": "BOX",
                "conversion_factor": 12.0,
                "brand": "Test Brand",
                "color": "Blue",
                "size": "Medium",
                "type_specific_attributes": {
                    "gsm": 180,
                    "width": 60,
                    "composition": "100% Cotton",
                    "weave_type": "Plain"
                },
                "hsn": "5208",
                "reorder_level": 100.0,
                "min_stock": 50.0,
                "max_stock": 500.0,
                "is_active": True,
                "status": "Active"
            }
            
            success, created_item = self.run_test(
                "Create Item with AUTO Code",
                "POST",
                "masters/items",
                200,
                data=item_data
            )
            
            if success and created_item:
                self.created_item_id = created_item.get('id')
                generated_code = created_item.get('item_code')
                inherited_type = created_item.get('item_type')
                category_name = created_item.get('category_name')
                purchase_uom = created_item.get('purchase_uom')
                conversion_factor = created_item.get('conversion_factor')
                type_attrs = created_item.get('type_specific_attributes')
                
                print(f"   ✅ Item created with ID: {self.created_item_id}")
                print(f"   📊 Generated Code: {generated_code}")
                print(f"   📊 Inherited Item Type: {inherited_type}")
                print(f"   📊 Category Name: {category_name}")
                print(f"   📊 Purchase UOM: {purchase_uom}")
                print(f"   📊 Conversion Factor: {conversion_factor}")
                print(f"   📊 Type-Specific Attributes: {type_attrs}")
                
                # Verify AUTO code was generated
                if generated_code and generated_code != "AUTO":
                    print(f"   ✅ AUTO code generation works")
                else:
                    print(f"   ❌ AUTO code not generated properly")
                    self.failed_tests.append({
                        "test": "AUTO Code Generation",
                        "error": f"Expected generated code, got {generated_code}"
                    })
                
                # Verify item type inheritance
                if inherited_type == test_item_type:
                    print(f"   ✅ Item type inherited correctly from category")
                else:
                    print(f"   ❌ Item type not inherited: expected {test_item_type}, got {inherited_type}")
                    self.failed_tests.append({
                        "test": "Item Type Inheritance",
                        "error": f"Expected {test_item_type}, got {inherited_type}"
                    })
                
                # Verify new fields
                if purchase_uom == "BOX" and conversion_factor == 12.0:
                    print(f"   ✅ Purchase UOM and conversion factor saved correctly")
                else:
                    print(f"   ❌ Purchase UOM or conversion factor not saved correctly")
                
                if type_attrs and isinstance(type_attrs, dict):
                    print(f"   ✅ Type-specific attributes saved as JSON")
                else:
                    print(f"   ❌ Type-specific attributes not saved correctly")
        
        # Test 5: Validate duplicate item name
        if test_category_id and self.created_item_id:
            print("\n📋 Test 5: Validate Item Name (Duplicate)")
            
            # Get the created item name
            success, item = self.run_test(
                "Get Created Item",
                "GET",
                f"masters/items/{self.created_item_id}",
                200
            )
            
            if success and item:
                duplicate_name = item.get('item_name')
                
                success, validation = self.run_test(
                    "Validate Duplicate Item Name",
                    "GET",
                    f"masters/items/validate/name?item_name={duplicate_name}&category_id={test_category_id}",
                    200
                )
                
                if success and validation:
                    is_unique = validation.get('is_unique')
                    exists = validation.get('exists')
                    message = validation.get('message')
                    
                    if not is_unique and exists:
                        print(f"   ✅ Duplicate name detected correctly: {message}")
                    else:
                        print(f"   ❌ Duplicate name not detected: is_unique={is_unique}, exists={exists}")
                        self.failed_tests.append({
                            "test": "Name Validation - Duplicate",
                            "error": f"Expected duplicate to be detected, got is_unique={is_unique}"
                        })
        
        # Test 6: Update item and verify updated_at timestamp
        if self.created_item_id:
            print("\n📋 Test 6: Update Item and Verify updated_at")
            
            # Get current item
            success, current_item = self.run_test(
                "Get Item Before Update",
                "GET",
                f"masters/items/{self.created_item_id}",
                200
            )
            
            if success and current_item:
                # Update item
                current_item['description'] = "Updated description"
                current_item['brand'] = "Updated Brand"
                
                success, updated_item = self.run_test(
                    "Update Item",
                    "PUT",
                    f"masters/items/{self.created_item_id}",
                    200,
                    data=current_item
                )
                
                if success and updated_item:
                    updated_at = updated_item.get('updated_at')
                    if updated_at:
                        print(f"   ✅ updated_at timestamp set: {updated_at}")
                    else:
                        print(f"   ❌ updated_at timestamp not set")
                        self.failed_tests.append({
                            "test": "Updated At Timestamp",
                            "error": "updated_at field not set on update"
                        })
        
        # Test 7: Test different item types
        print("\n📋 Test 7: Test Multiple Item Types")
        
        # Find categories with different item types
        item_types_to_test = ["FABRIC", "RM", "FG", "PACKING", "CONSUMABLE", "ACCESSORY"]
        tested_types = []
        
        for item_type in item_types_to_test:
            matching_cats = [cat for cat in leaf_categories if cat.get('item_type') == item_type and cat.get('is_leaf')]
            if matching_cats:
                cat = matching_cats[0]
                cat_id = cat['id']
                
                # Preview code for this type
                success, preview = self.run_test(
                    f"Preview Code for {item_type}",
                    "GET",
                    f"masters/items/preview/next-code?category_id={cat_id}",
                    200
                )
                
                if success and preview:
                    preview_code = preview.get('preview_code')
                    type_code = preview.get('type_code')
                    print(f"   ✅ {item_type}: {preview_code} (Type Code: {type_code})")
                    tested_types.append(item_type)
        
        if len(tested_types) >= 3:
            print(f"   ✅ Successfully tested {len(tested_types)} different item types")
        else:
            print(f"   ⚠️  Only tested {len(tested_types)} item types (need more test data)")
        
        # Test 8: Filter items by type and status
        print("\n📋 Test 8: Get All Items and Verify Enhanced Fields")
        
        success, all_items = self.run_test(
            "Get All Items",
            "GET",
            "masters/items",
            200
        )
        
        if success and all_items:
            print(f"   📊 Total items: {len(all_items)}")
            
            # Check if items have new fields
            items_with_type = [item for item in all_items if item.get('item_type')]
            items_with_purchase_uom = [item for item in all_items if item.get('purchase_uom')]
            items_with_type_attrs = [item for item in all_items if item.get('type_specific_attributes')]
            
            print(f"   📊 Items with item_type: {len(items_with_type)}")
            print(f"   📊 Items with purchase_uom: {len(items_with_purchase_uom)}")
            print(f"   📊 Items with type_specific_attributes: {len(items_with_type_attrs)}")
            
            if items_with_type:
                print(f"   ✅ Items have item_type field")
            
            # Count by item type
            type_counts = {}
            for item in all_items:
                item_type = item.get('item_type', 'Unknown')
                type_counts[item_type] = type_counts.get(item_type, 0) + 1
            
            print(f"   📊 Items by type:")
            for itype, count in sorted(type_counts.items(), key=lambda x: (x[0] is None, x[0])):
                print(f"      - {itype}: {count}")
        
        print("\n" + "="*60)
        print("ITEM MASTER ENHANCED FEATURES TESTS COMPLETE")
        print("="*60)

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
    
    # Test login - use credentials from review request
    if not tester.test_login("testuser@erp.com", "testpass123"):
        print("\n⚠️  Login with testuser@erp.com failed. Trying admin credentials...")
        if not tester.test_login("admin@erp.com", "admin123"):
            print("\n❌ Login failed with both credentials. Cannot proceed with other tests.")
            print("   Please ensure:")
            print("   1. Backend server is running")
            print("   2. User exists in database")
            print("   3. Credentials are correct")
            tester.print_summary()
            return 1
    
    # Run all tests
    tester.test_dashboard()
    tester.test_masters()
    
    # NEW: Test Item Master Enhanced Features
    tester.test_item_master_enhanced_features()
    
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
