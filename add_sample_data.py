"""
Quick script to add sample data to the ERP system
Run this after starting the backend server
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

print("🚀 Adding sample data to ERP system...")
print()

# 1. Add Item Categories
print("📁 Creating item categories...")
categories = [
    {
        "category_id": "CAT-0001",
        "category_name": "Raw Materials",
        "category_short_code": "RM",
        "item_type": "RM",
        "parent_category": None,
        "description": "Raw materials for production",
        "is_active": True
    },
    {
        "category_id": "CAT-0002",
        "category_name": "Fabric",
        "category_short_code": "FAB",
        "item_type": "RM",
        "parent_category": "CAT-0001",
        "description": "Fabric materials",
        "is_active": True
    },
    {
        "category_id": "CAT-0003",
        "category_name": "Finished Goods",
        "category_short_code": "FG",
        "item_type": "FG",
        "parent_category": None,
        "description": "Finished products",
        "is_active": True
    },
    {
        "category_id": "CAT-0004",
        "category_name": "Packing Materials",
        "category_short_code": "PKG",
        "item_type": "PACKING",
        "parent_category": None,
        "description": "Packing and packaging materials",
        "is_active": True
    }
]

for cat in categories:
    try:
        response = requests.post(f"{BASE_URL}/masters/item-categories", json=cat)
        if response.status_code in [200, 201]:
            print(f"  ✅ Added: {cat['category_name']}")
        else:
            print(f"  ⚠️  {cat['category_name']}: {response.text}")
    except Exception as e:
        print(f"  ❌ Error adding {cat['category_name']}: {e}")

print()

# 2. Add UOMs
print("📏 Creating UOMs...")
uoms = [
    {"uom_code": "PCS", "uom_name": "Pieces", "base_uom": "PCS", "conversion_factor": 1},
    {"uom_code": "MTR", "uom_name": "Meters", "base_uom": "MTR", "conversion_factor": 1},
    {"uom_code": "KG", "uom_name": "Kilograms", "base_uom": "KG", "conversion_factor": 1},
    {"uom_code": "BOX", "uom_name": "Box", "base_uom": "PCS", "conversion_factor": 12}
]

for uom in uoms:
    try:
        response = requests.post(f"{BASE_URL}/masters/uoms", json=uom)
        if response.status_code in [200, 201]:
            print(f"  ✅ Added: {uom['uom_name']}")
        else:
            print(f"  ⚠️  {uom['uom_name']}: {response.text}")
    except Exception as e:
        print(f"  ❌ Error adding {uom['uom_name']}: {e}")

print()

# 3. Add Items
print("📦 Creating items...")
# Get category IDs first
try:
    cat_response = requests.get(f"{BASE_URL}/masters/item-categories")
    categories_data = cat_response.json()

    # Find fabric category
    fabric_cat = next((c for c in categories_data if c.get('category_name') == 'Fabric' or c.get('name') == 'Fabric'), None)
    fg_cat = next((c for c in categories_data if c.get('category_name') == 'Finished Goods' or c.get('name') == 'Finished Goods'), None)
    pkg_cat = next((c for c in categories_data if c.get('category_name') == 'Packing Materials' or c.get('name') == 'Packing Materials'), None)

    items = [
        {
            "item_code": "FAB-COT-0001",
            "item_name": "Cotton White 100% (40s)",
            "item_category": fabric_cat['id'] if fabric_cat else "CAT-0002",
            "item_type": "RM",
            "base_uom": "MTR",
            "description": "Pure cotton fabric white color",
            "is_active": True
        },
        {
            "item_code": "FAB-POL-0001",
            "item_name": "Polyester Black DTY (150D)",
            "item_category": fabric_cat['id'] if fabric_cat else "CAT-0002",
            "item_type": "RM",
            "base_uom": "MTR",
            "description": "Polyester fabric black color",
            "is_active": True
        },
        {
            "item_code": "FG-TSH-0001",
            "item_name": "T-Shirt Round Neck Red (M)",
            "item_category": fg_cat['id'] if fg_cat else "CAT-0003",
            "item_type": "FG",
            "base_uom": "PCS",
            "description": "Red t-shirt medium size",
            "is_active": True
        },
        {
            "item_code": "PKG-BAG-0001",
            "item_name": "Poly Bag 12x18 inch Clear",
            "item_category": pkg_cat['id'] if pkg_cat else "CAT-0004",
            "item_type": "PACKING",
            "base_uom": "PCS",
            "description": "Clear polybag for packing",
            "is_active": True
        }
    ]

    for item in items:
        try:
            response = requests.post(f"{BASE_URL}/masters/items", json=item)
            if response.status_code in [200, 201]:
                print(f"  ✅ Added: {item['item_name']}")
            else:
                print(f"  ⚠️  {item['item_name']}: {response.text}")
        except Exception as e:
            print(f"  ❌ Error adding {item['item_name']}: {e}")

except Exception as e:
    print(f"  ❌ Error fetching categories: {e}")

print()

# 4. Add Suppliers
print("🏢 Creating suppliers...")
suppliers = [
    {
        "supplier_code": "SUP-001",
        "supplier_name": "ABC Fabrics Ltd",
        "contact_person": "John Doe",
        "email": "john@abcfabrics.com",
        "phone": "+1-555-0001",
        "address": "123 Fabric Street, NY",
        "is_active": True
    },
    {
        "supplier_code": "SUP-002",
        "supplier_name": "XYZ Packaging Co",
        "contact_person": "Jane Smith",
        "email": "jane@xyzpack.com",
        "phone": "+1-555-0002",
        "address": "456 Pack Avenue, CA",
        "is_active": True
    }
]

for supplier in suppliers:
    try:
        response = requests.post(f"{BASE_URL}/masters/suppliers", json=supplier)
        if response.status_code in [200, 201]:
            print(f"  ✅ Added: {supplier['supplier_name']}")
        else:
            print(f"  ⚠️  {supplier['supplier_name']}: {response.text}")
    except Exception as e:
        print(f"  ❌ Error adding {supplier['supplier_name']}: {e}")

print()

# 5. Add Warehouses
print("🏭 Creating warehouses...")
warehouses = [
    {
        "warehouse_code": "WH-001",
        "warehouse_name": "Main Warehouse",
        "location": "Building A, Floor 1",
        "is_active": True
    },
    {
        "warehouse_code": "WH-002",
        "warehouse_name": "Finished Goods Warehouse",
        "location": "Building B, Floor 2",
        "is_active": True
    }
]

for wh in warehouses:
    try:
        response = requests.post(f"{BASE_URL}/masters/warehouses", json=wh)
        if response.status_code in [200, 201]:
            print(f"  ✅ Added: {wh['warehouse_name']}")
        else:
            print(f"  ⚠️  {wh['warehouse_name']}: {response.text}")
    except Exception as e:
        print(f"  ❌ Error adding {wh['warehouse_name']}: {e}")

print()
print("✅ Sample data added successfully!")
print()
print("🌐 Now open http://localhost:3000 and you should see data!")
