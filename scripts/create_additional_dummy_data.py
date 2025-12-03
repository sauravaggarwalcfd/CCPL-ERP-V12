import sys
sys.path.append('/app/backend')
from pymongo import MongoClient
from datetime import datetime, timezone
import uuid

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017')
db = client['erp_inventory_db']

def create_colors():
    """Create color master data"""
    colors = [
        {
            'id': str(uuid.uuid4()), 'color_code': 'CLR-001', 'color_name': 'Navy Blue',
            'color_family': 'BLUE', 'hex_code': '#000080', 'pantone_code': '19-4052 TPX',
            'rgb_value': '0,0,128', 'season': 'ALL', 'is_standard': True,
            'dyeing_cost_factor': '1.0', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'color_code': 'CLR-002', 'color_name': 'Pure White',
            'color_family': 'NEUTRAL', 'hex_code': '#FFFFFF', 'pantone_code': '11-0601 TPX',
            'rgb_value': '255,255,255', 'season': 'ALL', 'is_standard': True,
            'dyeing_cost_factor': '0.8', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'color_code': 'CLR-003', 'color_name': 'Black',
            'color_family': 'NEUTRAL', 'hex_code': '#000000', 'pantone_code': '19-0303 TPX',
            'rgb_value': '0,0,0', 'season': 'ALL', 'is_standard': True,
            'dyeing_cost_factor': '1.2', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'color_code': 'CLR-004', 'color_name': 'Crimson Red',
            'color_family': 'RED', 'hex_code': '#DC143C', 'pantone_code': '18-1664 TPX',
            'rgb_value': '220,20,60', 'season': 'WINTER', 'is_standard': True,
            'dyeing_cost_factor': '1.3', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'color_code': 'CLR-005', 'color_name': 'Emerald Green',
            'color_family': 'GREEN', 'hex_code': '#50C878', 'pantone_code': '17-5641 TPX',
            'rgb_value': '80,200,120', 'season': 'SPRING', 'is_standard': True,
            'dyeing_cost_factor': '1.1', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'color_code': 'CLR-006', 'color_name': 'Sky Blue',
            'color_family': 'BLUE', 'hex_code': '#87CEEB', 'pantone_code': '14-4318 TPX',
            'rgb_value': '135,206,235', 'season': 'SUMMER', 'is_standard': True,
            'dyeing_cost_factor': '0.9', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'color_code': 'CLR-007', 'color_name': 'Beige',
            'color_family': 'BROWN', 'hex_code': '#F5F5DC', 'pantone_code': '12-0605 TPX',
            'rgb_value': '245,245,220', 'season': 'ALL', 'is_standard': True,
            'dyeing_cost_factor': '0.85', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'color_code': 'CLR-008', 'color_name': 'Mustard Yellow',
            'color_family': 'YELLOW', 'hex_code': '#FFDB58', 'pantone_code': '13-0755 TPX',
            'rgb_value': '255,219,88', 'season': 'FALL', 'is_standard': True,
            'dyeing_cost_factor': '1.0', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    db.colors.insert_many(colors)
    print(f"✓ Created {len(colors)} colors")
    return colors

def create_sizes():
    """Create size master data"""
    sizes = [
        {
            'id': str(uuid.uuid4()), 'size_code': 'SZ-XS', 'size_name': 'Extra Small',
            'category': 'APPAREL', 'age_group': 'ADULT', 'gender': 'UNISEX',
            'size_order': 1, 'measurements': {'chest': '34', 'waist': '28', 'hip': '36', 'shoulder': '15', 'length': '26', 'sleeve': '22'},
            'international_equivalent': 'US: XS, EU: 44', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'size_code': 'SZ-S', 'size_name': 'Small',
            'category': 'APPAREL', 'age_group': 'ADULT', 'gender': 'UNISEX',
            'size_order': 2, 'measurements': {'chest': '36', 'waist': '30', 'hip': '38', 'shoulder': '16', 'length': '27', 'sleeve': '23'},
            'international_equivalent': 'US: S, EU: 46', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'size_code': 'SZ-M', 'size_name': 'Medium',
            'category': 'APPAREL', 'age_group': 'ADULT', 'gender': 'UNISEX',
            'size_order': 3, 'measurements': {'chest': '38', 'waist': '32', 'hip': '40', 'shoulder': '17', 'length': '28', 'sleeve': '24'},
            'international_equivalent': 'US: M, EU: 48', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'size_code': 'SZ-L', 'size_name': 'Large',
            'category': 'APPAREL', 'age_group': 'ADULT', 'gender': 'UNISEX',
            'size_order': 4, 'measurements': {'chest': '40', 'waist': '34', 'hip': '42', 'shoulder': '18', 'length': '29', 'sleeve': '25'},
            'international_equivalent': 'US: L, EU: 50', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'size_code': 'SZ-XL', 'size_name': 'Extra Large',
            'category': 'APPAREL', 'age_group': 'ADULT', 'gender': 'UNISEX',
            'size_order': 5, 'measurements': {'chest': '42', 'waist': '36', 'hip': '44', 'shoulder': '19', 'length': '30', 'sleeve': '26'},
            'international_equivalent': 'US: XL, EU: 52', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'size_code': 'SZ-XXL', 'size_name': 'Double XL',
            'category': 'APPAREL', 'age_group': 'ADULT', 'gender': 'UNISEX',
            'size_order': 6, 'measurements': {'chest': '44', 'waist': '38', 'hip': '46', 'shoulder': '20', 'length': '31', 'sleeve': '27'},
            'international_equivalent': 'US: XXL, EU: 54', 'status': 'Active',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    db.sizes.insert_many(sizes)
    print(f"✓ Created {len(sizes)} sizes")
    return sizes

def create_brands():
    """Create brand master data"""
    brands = [
        {
            'id': str(uuid.uuid4()), 'brand_code': 'BRN-001', 'brand_name': 'Zara',
            'brand_category': 'PREMIUM', 'country_of_origin': 'Spain', 'target_market': 'INTERNATIONAL',
            'website': 'https://www.zara.com', 'contact_person': 'Miguel Rodriguez', 
            'email': 'miguel@zara.com', 'phone': '+34 912345678',
            'license_number': 'LIC-ZRA-2024', 'quality_standard': 'ISO 9001:2015',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'brand_code': 'BRN-002', 'brand_name': 'H&M',
            'brand_category': 'MID_RANGE', 'country_of_origin': 'Sweden', 'target_market': 'BOTH',
            'website': 'https://www.hm.com', 'contact_person': 'Anna Svensson',
            'email': 'anna@hm.com', 'phone': '+46 812345678',
            'license_number': 'LIC-HNM-2024', 'quality_standard': 'ISO 9001',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'brand_code': 'BRN-003', 'brand_name': 'Raymond',
            'brand_category': 'PREMIUM', 'country_of_origin': 'India', 'target_market': 'DOMESTIC',
            'website': 'https://www.raymond.in', 'contact_person': 'Karan Mehta',
            'email': 'karan@raymond.in', 'phone': '+91 2267777777',
            'license_number': 'LIC-RAY-2024', 'quality_standard': 'ISO 9001:2015, SA 8000',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'brand_code': 'BRN-004', 'brand_name': 'Fab India',
            'brand_category': 'MID_RANGE', 'country_of_origin': 'India', 'target_market': 'BOTH',
            'website': 'https://www.fabindia.com', 'contact_person': 'Sunita Verma',
            'email': 'sunita@fabindia.com', 'phone': '+91 1140404040',
            'license_number': 'LIC-FBI-2024', 'quality_standard': 'ISO 9001',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'brand_code': 'BRN-005', 'brand_name': 'Uniqlo',
            'brand_category': 'MID_RANGE', 'country_of_origin': 'Japan', 'target_market': 'INTERNATIONAL',
            'website': 'https://www.uniqlo.com', 'contact_person': 'Takeshi Yamamoto',
            'email': 'takeshi@uniqlo.com', 'phone': '+81 312345678',
            'license_number': 'LIC-UNQ-2024', 'quality_standard': 'ISO 9001:2015',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    db.brands.insert_many(brands)
    print(f"✓ Created {len(brands)} brands")
    return brands

def create_more_items(categories):
    """Create additional item master data"""
    fabric_knit_cot = next((c['id'] for c in categories if c['code'] == 'FAB-KNT-COT'), None)
    fabric_woven_cot = next((c['id'] for c in categories if c['code'] == 'FAB-WVN-COT'), None)
    trim_button = next((c['id'] for c in categories if c['code'] == 'TRM-BTN-POL'), None)
    trim_zip = next((c['id'] for c in categories if c['code'] == 'TRM-ZIP'), None)
    acc_label = next((c['id'] for c in categories if c['code'] == 'ACC-LBL'), None)
    
    items = [
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-006', 'item_name': 'Cotton Jersey - Black',
            'item_type': 'FABRIC', 'category_id': fabric_knit_cot or '', 'sub_category': 'Jersey',
            'stock_uom': 'MTR', 'min_stock_level': 150, 'reorder_level': 200, 'reorder_qty': 500,
            'opening_stock': 600, 'opening_rate': 220.00,
            'costing_method': 'FIFO', 'is_batch_controlled': True, 'is_serial_controlled': False,
            'has_expiry_tracking': False, 'hsn': '5208', 'gst_rate': '5',
            'gsm': 160, 'width': 60, 'shade': 'Black', 'composition': '95% Cotton, 5% Elastane',
            'barcode': 'BAR-ITM-006', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-007', 'item_name': 'Cotton Poplin - Sky Blue',
            'item_type': 'FABRIC', 'category_id': fabric_woven_cot or '', 'sub_category': 'Poplin',
            'stock_uom': 'MTR', 'min_stock_level': 100, 'reorder_level': 150, 'reorder_qty': 400,
            'opening_stock': 450, 'opening_rate': 190.00,
            'costing_method': 'FIFO', 'is_batch_controlled': True,
            'hsn': '5208', 'gst_rate': '5',
            'gsm': 110, 'width': 58, 'shade': 'Sky Blue', 'composition': '100% Cotton',
            'barcode': 'BAR-ITM-007', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-008', 'item_name': 'Polyester Button - Black - 12mm',
            'item_type': 'TRIM', 'category_id': trim_button or '', 'sub_category': 'Shirt Button',
            'stock_uom': 'PCS', 'min_stock_level': 3000, 'reorder_level': 5000, 'reorder_qty': 10000,
            'opening_stock': 15000, 'opening_rate': 0.45,
            'costing_method': 'AVERAGE', 'is_batch_controlled': True,
            'hsn': '9606', 'gst_rate': '18',
            'trim_size': '12mm', 'trim_color': 'Black', 'trim_material': 'Polyester',
            'barcode': 'BAR-ITM-008', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-009', 'item_name': 'Metal Button - Gold - 18mm',
            'item_type': 'TRIM', 'category_id': trim_button or '', 'sub_category': 'Coat Button',
            'stock_uom': 'PCS', 'min_stock_level': 1000, 'reorder_level': 2000, 'reorder_qty': 5000,
            'opening_stock': 8000, 'opening_rate': 1.20,
            'costing_method': 'FIFO', 'is_batch_controlled': True,
            'hsn': '9606', 'gst_rate': '18',
            'trim_size': '18mm', 'trim_color': 'Gold', 'trim_material': 'Metal',
            'barcode': 'BAR-ITM-009', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-010', 'item_name': 'Plastic Zipper - Navy - 30cm',
            'item_type': 'TRIM', 'category_id': trim_zip or '', 'sub_category': 'Plastic Zipper',
            'stock_uom': 'PCS', 'min_stock_level': 2000, 'reorder_level': 3000, 'reorder_qty': 8000,
            'opening_stock': 12000, 'opening_rate': 3.50,
            'costing_method': 'FIFO', 'is_batch_controlled': True,
            'hsn': '9607', 'gst_rate': '18',
            'trim_size': '30cm', 'trim_color': 'Navy', 'trim_material': 'Plastic',
            'barcode': 'BAR-ITM-010', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-011', 'item_name': 'Woven Label - Brand Logo',
            'item_type': 'ACCESSORY', 'category_id': acc_label or '', 'sub_category': 'Woven Label',
            'stock_uom': 'PCS', 'min_stock_level': 500, 'reorder_level': 1000, 'reorder_qty': 3000,
            'opening_stock': 5000, 'opening_rate': 2.00,
            'costing_method': 'AVERAGE', 'is_batch_controlled': False,
            'hsn': '6217', 'gst_rate': '12',
            'barcode': 'BAR-ITM-011', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-012', 'item_name': 'Satin Ribbon - Red - 1 inch',
            'item_type': 'ACCESSORY', 'category_id': acc_label or '', 'sub_category': 'Ribbon',
            'stock_uom': 'MTR', 'min_stock_level': 100, 'reorder_level': 200, 'reorder_qty': 500,
            'opening_stock': 750, 'opening_rate': 15.00,
            'costing_method': 'FIFO', 'is_batch_controlled': False,
            'hsn': '5806', 'gst_rate': '12',
            'barcode': 'BAR-ITM-012', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    db.items.insert_many(items)
    print(f"✓ Created {len(items)} additional items (Total items now: 12)")

def main():
    print("Creating additional dummy data for Colors, Sizes, Brands, and Items...")
    print("=" * 70)
    
    # Get existing categories
    categories = list(db.item_categories.find({}, {'_id': 0}))
    
    if len(categories) == 0:
        print("⚠ No categories found. Please run create_dummy_data.py first!")
        return
    
    # Clear only these collections
    db.colors.delete_many({})
    db.sizes.delete_many({})
    db.brands.delete_many({})
    print("✓ Cleared existing colors, sizes, and brands")
    
    colors = create_colors()
    sizes = create_sizes()
    brands = create_brands()
    create_more_items(categories)
    
    print("=" * 70)
    print("✅ Additional dummy data created successfully!")
    print("\nSummary:")
    print(f"  - Colors: {len(colors)}")
    print(f"  - Sizes: {len(sizes)}")
    print(f"  - Brands: {len(brands)}")
    print(f"  - Additional Items: 7")
    print(f"  - Total Items in DB: {db.items.count_documents({})}")
    
    client.close()

if __name__ == "__main__":
    main()
