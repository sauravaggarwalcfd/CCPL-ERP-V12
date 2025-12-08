"""
Data migration script to fix Item Category ID inconsistencies.

Problem: Categories have both 'id' and 'category_id' fields with different values,
causing children to be orphaned as their parent_category references don't match.

This script:
1. Identifies categories with id != category_id
2. Updates all children to reference the correct parent id
3. Removes the category_id field to prevent future confusion
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']


async def fix_category_ids():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 80)
    print("ITEM CATEGORY ID CONSISTENCY FIX")
    print("=" * 80)
    
    # Get all categories
    categories = await db.item_categories.find({}, {"_id": 0}).to_list(1000)
    print(f"\n✓ Found {len(categories)} categories\n")
    
    # Identify inconsistencies
    inconsistent_cats = []
    for cat in categories:
        cat_id = cat.get('id')
        category_id = cat.get('category_id')
        
        if category_id and cat_id != category_id:
            inconsistent_cats.append({
                'id': cat_id,
                'category_id': category_id,
                'name': cat.get('name', 'Unknown')
            })
    
    if not inconsistent_cats:
        print("✓ No ID inconsistencies found. All categories have matching IDs.\n")
        client.close()
        return
    
    print(f"❌ Found {len(inconsistent_cats)} categories with ID mismatches:\n")
    for cat in inconsistent_cats:
        print(f"  - {cat['name']}")
        print(f"    id: {cat['id']}")
        print(f"    category_id: {cat['category_id']}\n")
    
    # For each inconsistent category, find and fix its children
    total_children_fixed = 0
    
    for cat in inconsistent_cats:
        old_id = cat['category_id']  # What children are currently referencing
        new_id = cat['id']  # What children should reference
        
        # Find children pointing to the old ID
        children = await db.item_categories.find(
            {"parent_category": old_id}, 
            {"_id": 0, "id": 1, "name": 1}
        ).to_list(1000)
        
        if children:
            print(f"Fixing {len(children)} children of '{cat['name']}':")
            for child in children:
                print(f"  - Updating {child['name']}: parent_category {old_id[:8]}... → {new_id[:8]}...")
                
                # Update child's parent_category to point to correct ID
                await db.item_categories.update_one(
                    {"id": child['id']},
                    {"$set": {"parent_category": new_id}}
                )
                total_children_fixed += 1
            print()
    
    # Remove the redundant category_id field from all categories
    print(f"✓ Fixed {total_children_fixed} children references\n")
    print("Removing redundant 'category_id' field from all categories...")
    
    result = await db.item_categories.update_many(
        {"category_id": {"$exists": True}},
        {"$unset": {"category_id": ""}}
    )
    
    print(f"✓ Removed 'category_id' field from {result.modified_count} categories\n")
    
    # Verify fix
    print("=" * 80)
    print("VERIFICATION")
    print("=" * 80)
    
    all_cats = await db.item_categories.find({}, {"_id": 0}).to_list(1000)
    
    # Check for any remaining category_id fields
    with_category_id = [c for c in all_cats if 'category_id' in c]
    if with_category_id:
        print(f"⚠ Warning: {len(with_category_id)} categories still have 'category_id' field")
    else:
        print("✓ No categories have 'category_id' field")
    
    # Verify parent-child relationships
    orphaned = []
    for cat in all_cats:
        parent_id = cat.get('parent_category')
        if parent_id:
            parent_exists = any(c['id'] == parent_id for c in all_cats)
            if not parent_exists:
                orphaned.append(cat['name'])
    
    if orphaned:
        print(f"⚠ Warning: {len(orphaned)} categories have non-existent parents:")
        for name in orphaned:
            print(f"  - {name}")
    else:
        print("✓ All parent-child relationships are valid")
    
    # Print tree structure to verify
    print("\n" + "=" * 80)
    print("UPDATED CATEGORY TREE")
    print("=" * 80 + "\n")
    
    by_parent = {}
    for cat in all_cats:
        parent = cat.get('parent_category') or 'ROOT'
        if parent not in by_parent:
            by_parent[parent] = []
        by_parent[parent].append(cat)
    
    def print_tree(parent_id='ROOT', indent=0):
        if parent_id not in by_parent:
            return
        for cat in sorted(by_parent[parent_id], key=lambda x: x.get('name', '')):
            name = cat.get('name', 'Unknown')
            code = cat.get('code', 'N/A')
            cat_id = cat['id'][:8]
            print(f'{"  " * indent}{name} ({code}) [ID: {cat_id}...]')
            print_tree(cat['id'], indent + 1)
    
    print_tree()
    
    print("\n" + "=" * 80)
    print("✓ MIGRATION COMPLETE")
    print("=" * 80)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(fix_category_ids())
