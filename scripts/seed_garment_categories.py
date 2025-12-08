import sys
sys.path.append('/app/backend')
from pymongo import MongoClient
from datetime import datetime, timezone
import uuid

client = MongoClient('mongodb://localhost:27017')
db = client['erp_inventory_db']

def clear_categories():
    """Clear existing item categories"""
    db.item_categories.delete_many({})
    print("✓ Cleared existing categories")

def create_category(cat_id, name, code, short_code, item_type, parent_id=None, level=0):
    """Helper to create a category"""
    category = {
        'id': cat_id,
        'category_id': cat_id,
        'category_name': name.upper(),
        'name': name.upper(),
        'code': short_code,
        'category_short_code': short_code,
        'item_type': item_type,
        'inventory_type': item_type,
        'parent_category': parent_id,
        'level': level,
        'description': '',
        'is_active': True,
        'status': 'Active',
        'default_uom': 'PCS',
        'allow_purchase': True,
        'allow_issue': True,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    return category

def seed_garment_categories():
    """Seed garment industry categories"""
    categories = []
    
    # ============ FABRIC (RM) ============
    fabric_id = str(uuid.uuid4())
    categories.append(create_category(
        fabric_id, 'FABRIC', 'FAB', 'FAB', 'RM', None, 0
    ))
    
    # Fabric children
    cotton_knit_id = str(uuid.uuid4())
    categories.append(create_category(
        cotton_knit_id, 'Cotton Knit', 'CKNIT', 'CKNIT', 'RM', fabric_id, 1
    ))
    
    rib_id = str(uuid.uuid4())
    categories.append(create_category(
        rib_id, 'Rib', 'RIB', 'RIB', 'RM', fabric_id, 1
    ))
    
    fleece_id = str(uuid.uuid4())
    categories.append(create_category(
        fleece_id, 'Fleece', 'FLCE', 'FLCE', 'RM', fabric_id, 1
    ))
    
    woven_id = str(uuid.uuid4())
    categories.append(create_category(
        woven_id, 'Woven', 'WVN', 'WVN', 'RM', fabric_id, 1
    ))
    
    # ============ TRIMS (RM) ============
    trims_id = str(uuid.uuid4())
    categories.append(create_category(
        trims_id, 'TRIMS', 'TRIM', 'TRIM', 'RM', None, 0
    ))
    
    # Label sub-tree
    label_id = str(uuid.uuid4())
    categories.append(create_category(
        label_id, 'Label', 'LABL', 'LABL', 'RM', trims_id, 1
    ))
    
    main_label_id = str(uuid.uuid4())
    categories.append(create_category(
        main_label_id, 'Main Label', 'MLBL', 'MLBL', 'RM', label_id, 2
    ))
    
    size_label_id = str(uuid.uuid4())
    categories.append(create_category(
        size_label_id, 'Size Label', 'SLBL', 'SLBL', 'RM', label_id, 2
    ))
    
    washcare_label_id = str(uuid.uuid4())
    categories.append(create_category(
        washcare_label_id, 'Washcare Label', 'WCLBL', 'WC', 'RM', label_id, 2
    ))
    
    # Other trims
    tape_id = str(uuid.uuid4())
    categories.append(create_category(
        tape_id, 'Tape', 'TAPE', 'TAPE', 'RM', trims_id, 1
    ))
    
    zipper_id = str(uuid.uuid4())
    categories.append(create_category(
        zipper_id, 'Zipper', 'ZIP', 'ZIP', 'RM', trims_id, 1
    ))
    
    button_id = str(uuid.uuid4())
    categories.append(create_category(
        button_id, 'Button', 'BTN', 'BTN', 'RM', trims_id, 1
    ))
    
    care_card_id = str(uuid.uuid4())
    categories.append(create_category(
        care_card_id, 'Care Card', 'CCARD', 'CCARD', 'RM', trims_id, 1
    ))
    
    # ============ PACKING MATERIAL (PACKING) ============
    packing_id = str(uuid.uuid4())
    categories.append(create_category(
        packing_id, 'PACKING MATERIAL', 'PKG', 'PKG', 'PACKING', None, 0
    ))
    
    polybags_id = str(uuid.uuid4())
    categories.append(create_category(
        polybags_id, 'Polybags', 'POLY', 'POLY', 'PACKING', packing_id, 1
    ))
    
    cartons_id = str(uuid.uuid4())
    categories.append(create_category(
        cartons_id, 'Master Cartons', 'CRTN', 'CRTN', 'PACKING', packing_id, 1
    ))
    
    stickers_id = str(uuid.uuid4())
    categories.append(create_category(
        stickers_id, 'Stickers', 'STCK', 'STCK', 'PACKING', packing_id, 1
    ))
    
    # ============ GENERAL ITEMS (CONSUMABLE) ============
    general_id = str(uuid.uuid4())
    categories.append(create_category(
        general_id, 'GENERAL ITEMS', 'GEN', 'GEN', 'CONSUMABLE', None, 0
    ))
    
    needles_id = str(uuid.uuid4())
    categories.append(create_category(
        needles_id, 'Needles', 'NDL', 'NDL', 'CONSUMABLE', general_id, 1
    ))
    
    thread_id = str(uuid.uuid4())
    categories.append(create_category(
        thread_id, 'Thread', 'THD', 'THD', 'CONSUMABLE', general_id, 1
    ))
    
    stationery_id = str(uuid.uuid4())
    categories.append(create_category(
        stationery_id, 'Stationery', 'STAT', 'STAT', 'CONSUMABLE', general_id, 1
    ))
    
    cleaning_id = str(uuid.uuid4())
    categories.append(create_category(
        cleaning_id, 'Cleaning Supplies', 'CLN', 'CLN', 'CONSUMABLE', general_id, 1
    ))
    
    return categories

def main():
    print("=" * 70)
    print("Seeding Item Category Master with Garment Industry Categories")
    print("=" * 70)
    
    clear_categories()
    
    categories = seed_garment_categories()
    
    # Insert all categories
    db.item_categories.insert_many(categories)
    
    print(f"\n✅ Created {len(categories)} categories")
    print("\n📋 Category Structure:")
    print("\n1. FABRIC (FAB) - RM")
    print("   ├─ Cotton Knit (CKNIT)")
    print("   ├─ Rib (RIB)")
    print("   ├─ Fleece (FLCE)")
    print("   └─ Woven (WVN)")
    print("\n2. TRIMS (TRIM) - RM")
    print("   ├─ Label (LABL)")
    print("   │  ├─ Main Label (MLBL)")
    print("   │  ├─ Size Label (SLBL)")
    print("   │  └─ Washcare Label (WC)")
    print("   ├─ Tape (TAPE)")
    print("   ├─ Zipper (ZIP)")
    print("   ├─ Button (BTN)")
    print("   └─ Care Card (CCARD)")
    print("\n3. PACKING MATERIAL (PKG) - PACKING")
    print("   ├─ Polybags (POLY)")
    print("   ├─ Master Cartons (CRTN)")
    print("   └─ Stickers (STCK)")
    print("\n4. GENERAL ITEMS (GEN) - CONSUMABLE")
    print("   ├─ Needles (NDL)")
    print("   ├─ Thread (THD)")
    print("   ├─ Stationery (STAT)")
    print("   └─ Cleaning Supplies (CLN)")
    
    print("\n" + "=" * 70)
    print("✅ Garment industry categories seeded successfully!")
    print("=" * 70)
    
    # Verify
    print("\nVerification:")
    root_cats = db.item_categories.find({'level': 0}, {'_id': 0, 'name': 1, 'category_short_code': 1, 'item_type': 1})
    for cat in root_cats:
        print(f"  ✓ {cat.get('name')}: {cat.get('category_short_code')} | Type: {cat.get('item_type')}")
    
    client.close()

if __name__ == "__main__":
    main()
