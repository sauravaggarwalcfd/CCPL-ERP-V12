import sys
sys.path.append('/app/backend')
from pymongo import MongoClient
from datetime import datetime, timezone
import uuid

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017')
db = client['erp_inventory_db']

def clear_existing_data():
    """Clear existing master data"""
    collections = [
        'item_categories', 'items', 'uoms', 'suppliers', 
        'warehouses', 'bin_locations', 'tax_hsn'
    ]
    for coll in collections:
        db[coll].delete_many({})
    print("✓ Cleared existing data")

def create_item_categories():
    """Create hierarchical item categories"""
    categories = [
        # Fabric hierarchy
        {'id': str(uuid.uuid4()), 'code': 'FAB', 'name': 'Fabric', 'parent_category': None, 'level': 0, 'inventory_type': 'RAW', 'default_uom': 'MTR', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'FAB-KNT', 'name': 'Knits', 'parent_category': None, 'level': 1, 'inventory_type': 'RAW', 'default_uom': 'MTR', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'FAB-KNT-COT', 'name': 'Cotton', 'parent_category': None, 'level': 2, 'inventory_type': 'RAW', 'default_uom': 'MTR', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'FAB-KNT-POL', 'name': 'Polyester', 'parent_category': None, 'level': 2, 'inventory_type': 'RAW', 'default_uom': 'MTR', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'FAB-WVN', 'name': 'Woven', 'parent_category': None, 'level': 1, 'inventory_type': 'RAW', 'default_uom': 'MTR', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'FAB-WVN-COT', 'name': 'Cotton', 'parent_category': None, 'level': 2, 'inventory_type': 'RAW', 'default_uom': 'MTR', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'FAB-WVN-SLK', 'name': 'Silk', 'parent_category': None, 'level': 2, 'inventory_type': 'RAW', 'default_uom': 'MTR', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        
        # Trim hierarchy
        {'id': str(uuid.uuid4()), 'code': 'TRM', 'name': 'Trim', 'parent_category': None, 'level': 0, 'inventory_type': 'RAW', 'default_uom': 'PCS', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'TRM-BTN', 'name': 'Button', 'parent_category': None, 'level': 1, 'inventory_type': 'RAW', 'default_uom': 'PCS', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'TRM-BTN-POL', 'name': 'Polyester', 'parent_category': None, 'level': 2, 'inventory_type': 'RAW', 'default_uom': 'PCS', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'TRM-BTN-MET', 'name': 'Metal', 'parent_category': None, 'level': 2, 'inventory_type': 'RAW', 'default_uom': 'PCS', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'TRM-ZIP', 'name': 'Zipper', 'parent_category': None, 'level': 1, 'inventory_type': 'RAW', 'default_uom': 'PCS', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        
        # Accessory hierarchy
        {'id': str(uuid.uuid4()), 'code': 'ACC', 'name': 'Accessory', 'parent_category': None, 'level': 0, 'inventory_type': 'RAW', 'default_uom': 'PCS', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'ACC-LBL', 'name': 'Label', 'parent_category': None, 'level': 1, 'inventory_type': 'RAW', 'default_uom': 'PCS', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'code': 'ACC-TAG', 'name': 'Tag', 'parent_category': None, 'level': 1, 'inventory_type': 'RAW', 'default_uom': 'PCS', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
    ]
    
    # Set parent relationships
    fabric_id = categories[0]['id']
    knits_id = categories[1]['id']
    woven_id = categories[4]['id']
    trim_id = categories[7]['id']
    button_id = categories[8]['id']
    acc_id = categories[12]['id']
    
    categories[1]['parent_category'] = fabric_id
    categories[2]['parent_category'] = knits_id
    categories[3]['parent_category'] = knits_id
    categories[4]['parent_category'] = fabric_id
    categories[5]['parent_category'] = woven_id
    categories[6]['parent_category'] = woven_id
    categories[8]['parent_category'] = trim_id
    categories[9]['parent_category'] = button_id
    categories[10]['parent_category'] = button_id
    categories[11]['parent_category'] = trim_id
    categories[13]['parent_category'] = acc_id
    categories[14]['parent_category'] = acc_id
    
    db.item_categories.insert_many(categories)
    print(f"✓ Created {len(categories)} item categories")
    return categories

def create_uoms():
    """Create UOM master data"""
    uoms = [
        {'id': str(uuid.uuid4()), 'uom_name': 'Piece', 'uom_type': 'QUANTITY', 'uom_category': 'COUNT', 'decimal_precision': 0, 'symbol': 'PCS', 'is_base_unit': True, 'conversion_factor': 1.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'uom_name': 'Kilogram', 'uom_type': 'WEIGHT', 'uom_category': 'WEIGHT', 'decimal_precision': 3, 'symbol': 'KG', 'is_base_unit': True, 'conversion_factor': 1.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'uom_name': 'Gram', 'uom_type': 'WEIGHT', 'uom_category': 'WEIGHT', 'decimal_precision': 2, 'symbol': 'GM', 'is_base_unit': False, 'conversion_factor': 0.001, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'uom_name': 'Meter', 'uom_type': 'LENGTH', 'uom_category': 'LENGTH', 'decimal_precision': 2, 'symbol': 'MTR', 'is_base_unit': True, 'conversion_factor': 1.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'uom_name': 'Centimeter', 'uom_type': 'LENGTH', 'uom_category': 'LENGTH', 'decimal_precision': 1, 'symbol': 'CM', 'is_base_unit': False, 'conversion_factor': 0.01, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'uom_name': 'Yard', 'uom_type': 'LENGTH', 'uom_category': 'LENGTH', 'decimal_precision': 2, 'symbol': 'YD', 'is_base_unit': False, 'conversion_factor': 0.9144, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'uom_name': 'Box', 'uom_type': 'QUANTITY', 'uom_category': 'COUNT', 'decimal_precision': 0, 'symbol': 'BOX', 'is_base_unit': False, 'conversion_factor': 100.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'uom_name': 'Dozen', 'uom_type': 'QUANTITY', 'uom_category': 'COUNT', 'decimal_precision': 0, 'symbol': 'DZN', 'is_base_unit': False, 'conversion_factor': 12.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
    ]
    
    # Set base UOM references
    kg_id = uoms[1]['id']
    mtr_id = uoms[3]['id']
    pcs_id = uoms[0]['id']
    
    uoms[2]['base_uom_id'] = kg_id
    uoms[2]['base_uom_name'] = 'Kilogram'
    uoms[4]['base_uom_id'] = mtr_id
    uoms[4]['base_uom_name'] = 'Meter'
    uoms[5]['base_uom_id'] = mtr_id
    uoms[5]['base_uom_name'] = 'Meter'
    uoms[6]['base_uom_id'] = pcs_id
    uoms[6]['base_uom_name'] = 'Piece'
    uoms[7]['base_uom_id'] = pcs_id
    uoms[7]['base_uom_name'] = 'Piece'
    
    db.uoms.insert_many(uoms)
    print(f"✓ Created {len(uoms)} UOMs")
    return uoms

def create_suppliers():
    """Create supplier master data"""
    suppliers = [
        {
            'id': str(uuid.uuid4()), 'supplier_code': 'SUP-001', 'vendor_code': 'VEND-001',
            'name': 'Textile Mills India', 'supplier_group': 'MANUFACTURER', 
            'gst': '29ABCDE1234F1Z5', 'pan': 'ABCDE1234F',
            'contact_person': 'Rajesh Kumar', 'phone': '+91 9876543210', 'email': 'rajesh@textiles.com',
            'address': '123 Industrial Area, Phase 1', 'city': 'Mumbai', 'state': 'Maharashtra', 'pincode': '400001', 'country': 'India',
            'payment_terms': 'NET_30', 'credit_days': 30, 'currency': 'INR',
            'bank_name': 'HDFC Bank', 'bank_account': '1234567890', 'bank_ifsc': 'HDFC0001234', 'bank_branch': 'Mumbai Main',
            'transporter_name': 'Fast Logistics', 'transport_mode': 'ROAD',
            'supplier_rating': 4, 'lead_time_days': 7,
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'supplier_code': 'SUP-002', 'vendor_code': 'VEND-002',
            'name': 'Button Suppliers Co', 'supplier_group': 'TRADER',
            'gst': '27XYZAB5678G1Z3', 'pan': 'XYZAB5678G',
            'contact_person': 'Amit Shah', 'phone': '+91 9123456789', 'email': 'amit@buttons.com',
            'address': '456 Market Street', 'city': 'Delhi', 'state': 'Delhi', 'pincode': '110001', 'country': 'India',
            'payment_terms': 'NET_15', 'credit_days': 15, 'currency': 'INR',
            'bank_name': 'ICICI Bank', 'bank_account': '9876543210', 'bank_ifsc': 'ICIC0009876', 'bank_branch': 'Delhi South',
            'transporter_name': 'Quick Transport', 'transport_mode': 'COURIER',
            'supplier_rating': 5, 'lead_time_days': 3,
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'supplier_code': 'SUP-003', 'vendor_code': 'VEND-003',
            'name': 'Global Fabrics Ltd', 'supplier_group': 'INTERNATIONAL',
            'gst': '19PQRST9012H1Z7', 'pan': 'PQRST9012H',
            'contact_person': 'John Smith', 'phone': '+1 234 567 8900', 'email': 'john@globalfabrics.com',
            'address': '789 Export Zone', 'city': 'Bangalore', 'state': 'Karnataka', 'pincode': '560001', 'country': 'India',
            'payment_terms': 'NET_45', 'credit_days': 45, 'currency': 'USD',
            'bank_name': 'Axis Bank', 'bank_account': '5555666677', 'bank_ifsc': 'AXIS0005555', 'bank_branch': 'Bangalore CBD',
            'transporter_name': 'Sea Freight Co', 'transport_mode': 'SEA',
            'supplier_rating': 3, 'lead_time_days': 21,
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    db.suppliers.insert_many(suppliers)
    print(f"✓ Created {len(suppliers)} suppliers")
    return suppliers

def create_warehouses():
    """Create warehouse master data"""
    warehouses = [
        {
            'id': str(uuid.uuid4()), 'warehouse_code': 'WH-001', 'warehouse_name': 'Main Store',
            'warehouse_type': 'STORE', 'location': 'Building A, Floor 1',
            'address': 'Plot 123, Industrial Estate', 'city': 'Mumbai', 'state': 'Maharashtra', 'pincode': '400001',
            'capacity': 50000, 'responsible_person': 'Suresh Patel', 'contact_number': '+91 9988776655',
            'email': 'suresh@company.com', 'enable_qc': True, 'is_transit_warehouse': False, 'is_wip_warehouse': False,
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'warehouse_code': 'WH-002', 'warehouse_name': 'Cutting Department',
            'warehouse_type': 'CUTTING', 'location': 'Building B, Floor 2',
            'address': 'Plot 124, Industrial Estate', 'city': 'Mumbai', 'state': 'Maharashtra', 'pincode': '400001',
            'capacity': 10000, 'responsible_person': 'Ramesh Kumar', 'contact_number': '+91 9876543211',
            'email': 'ramesh@company.com', 'enable_qc': True, 'is_transit_warehouse': False, 'is_wip_warehouse': True,
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'warehouse_code': 'WH-003', 'warehouse_name': 'Stitching Floor',
            'warehouse_type': 'STITCHING', 'location': 'Building C, Floor 3',
            'address': 'Plot 125, Industrial Estate', 'city': 'Mumbai', 'state': 'Maharashtra', 'pincode': '400001',
            'capacity': 15000, 'responsible_person': 'Priya Sharma', 'contact_number': '+91 9123456780',
            'email': 'priya@company.com', 'enable_qc': True, 'is_transit_warehouse': False, 'is_wip_warehouse': True,
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'warehouse_code': 'WH-004', 'warehouse_name': 'Scrap Store',
            'warehouse_type': 'SCRAP', 'location': 'Building D',
            'address': 'Plot 126, Industrial Estate', 'city': 'Mumbai', 'state': 'Maharashtra', 'pincode': '400001',
            'capacity': 5000, 'responsible_person': 'Vijay Singh', 'contact_number': '+91 9876501234',
            'email': 'vijay@company.com', 'enable_qc': False, 'is_transit_warehouse': False, 'is_wip_warehouse': False,
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    db.warehouses.insert_many(warehouses)
    print(f"✓ Created {len(warehouses)} warehouses")
    return warehouses

def create_bin_locations(warehouses):
    """Create BIN location data"""
    main_wh = warehouses[0]['id']
    bins = [
        {'id': str(uuid.uuid4()), 'bin_code': 'BIN-A01', 'bin_name': 'Aisle A Rack 01', 'warehouse_id': main_wh, 'aisle': 'A', 'rack': '01', 'level': '1', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'bin_code': 'BIN-A02', 'bin_name': 'Aisle A Rack 02', 'warehouse_id': main_wh, 'aisle': 'A', 'rack': '02', 'level': '1', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'bin_code': 'BIN-B01', 'bin_name': 'Aisle B Rack 01', 'warehouse_id': main_wh, 'aisle': 'B', 'rack': '01', 'level': '1', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'bin_code': 'BIN-B02', 'bin_name': 'Aisle B Rack 02', 'warehouse_id': main_wh, 'aisle': 'B', 'rack': '02', 'level': '2', 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
    ]
    db.bin_locations.insert_many(bins)
    print(f"✓ Created {len(bins)} BIN locations")

def create_tax_hsn():
    """Create Tax/HSN master data"""
    taxes = [
        {'id': str(uuid.uuid4()), 'hsn_code': '5208', 'description': 'Cotton Fabrics', 'cgst_rate': 2.5, 'sgst_rate': 2.5, 'igst_rate': 5.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'hsn_code': '5407', 'description': 'Synthetic Fabrics', 'cgst_rate': 6.0, 'sgst_rate': 6.0, 'igst_rate': 12.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'hsn_code': '9606', 'description': 'Buttons', 'cgst_rate': 9.0, 'sgst_rate': 9.0, 'igst_rate': 18.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'hsn_code': '9607', 'description': 'Zippers', 'cgst_rate': 9.0, 'sgst_rate': 9.0, 'igst_rate': 18.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'hsn_code': '6217', 'description': 'Garment Accessories', 'cgst_rate': 6.0, 'sgst_rate': 6.0, 'igst_rate': 12.0, 'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()},
    ]
    db.tax_hsn.insert_many(taxes)
    print(f"✓ Created {len(taxes)} tax/HSN codes")

def create_items(categories, uoms):
    """Create item master data"""
    fabric_cat = next((c['id'] for c in categories if c['code'] == 'FAB-KNT-COT'), None)
    trim_cat = next((c['id'] for c in categories if c['code'] == 'TRM-BTN-POL'), None)
    mtr_uom = next((u for u in uoms if u['symbol'] == 'MTR'), {}).get('uom_name', 'MTR')
    pcs_uom = next((u for u in uoms if u['symbol'] == 'PCS'), {}).get('uom_name', 'PCS')
    
    items = [
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-001', 'item_name': 'Cotton Jersey Knit - Navy',
            'item_type': 'FABRIC', 'category_id': fabric_cat or '', 'sub_category': 'Jersey',
            'stock_uom': mtr_uom, 'min_stock_level': 100, 'reorder_level': 150,
            'opening_stock': 500, 'opening_rate': 250.00,
            'costing_method': 'FIFO', 'is_batch_controlled': True, 'is_serial_controlled': False,
            'has_expiry_tracking': False, 'hsn': '5208', 'gst_rate': '5',
            'gsm': 180, 'width': 60, 'shade': 'Navy Blue', 'composition': '100% Cotton',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-002', 'item_name': 'Polyester Button - White - 15mm',
            'item_type': 'TRIM', 'category_id': trim_cat or '', 'sub_category': 'Shirt Button',
            'stock_uom': pcs_uom, 'min_stock_level': 5000, 'reorder_level': 10000,
            'opening_stock': 25000, 'opening_rate': 0.50,
            'costing_method': 'AVERAGE', 'is_batch_controlled': True, 'is_serial_controlled': False,
            'has_expiry_tracking': False, 'hsn': '9606', 'gst_rate': '18',
            'trim_size': '15mm', 'trim_color': 'White', 'trim_material': 'Polyester',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-003', 'item_name': 'Cotton Poplin - White',
            'item_type': 'FABRIC', 'category_id': fabric_cat or '', 'sub_category': 'Poplin',
            'stock_uom': mtr_uom, 'min_stock_level': 200, 'reorder_level': 300,
            'opening_stock': 800, 'opening_rate': 180.00,
            'costing_method': 'FIFO', 'is_batch_controlled': True,
            'hsn': '5208', 'gst_rate': '5',
            'gsm': 120, 'width': 58, 'shade': 'White', 'composition': '100% Cotton',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-004', 'item_name': 'Metal Zipper - Black - 20cm',
            'item_type': 'TRIM', 'category_id': trim_cat or '', 'sub_category': 'Metal Zipper',
            'stock_uom': pcs_uom, 'min_stock_level': 1000, 'reorder_level': 2000,
            'opening_stock': 5000, 'opening_rate': 5.00,
            'costing_method': 'FIFO', 'is_batch_controlled': True,
            'hsn': '9607', 'gst_rate': '18',
            'trim_size': '20cm', 'trim_color': 'Black', 'trim_material': 'Metal',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()), 'item_code': 'ITM-005', 'item_name': 'Polyester Thread - Black - 5000m',
            'item_type': 'ACCESSORY', 'category_id': fabric_cat or '', 'sub_category': 'Thread',
            'stock_uom': pcs_uom, 'min_stock_level': 50, 'reorder_level': 100,
            'opening_stock': 200, 'opening_rate': 150.00,
            'costing_method': 'AVERAGE', 'is_batch_controlled': False,
            'hsn': '5508', 'gst_rate': '12',
            'status': 'Active', 'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    db.items.insert_many(items)
    print(f"✓ Created {len(items)} items")

def main():
    print("Creating dummy master data...")
    print("=" * 50)
    
    clear_existing_data()
    
    categories = create_item_categories()
    uoms = create_uoms()
    suppliers = create_suppliers()
    warehouses = create_warehouses()
    create_bin_locations(warehouses)
    create_tax_hsn()
    create_items(categories, uoms)
    
    print("=" * 50)
    print("✅ All dummy master data created successfully!")
    print("\nSummary:")
    print(f"  - Item Categories: {len(categories)}")
    print(f"  - UOMs: {len(uoms)}")
    print(f"  - Suppliers: {len(suppliers)}")
    print(f"  - Warehouses: {len(warehouses)}")
    print(f"  - BIN Locations: 4")
    print(f"  - Tax/HSN: 5")
    print(f"  - Items: 5")
    
    client.close()

if __name__ == "__main__":
    main()
