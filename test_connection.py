"""
Test MongoDB Connection
Run this to diagnose connection issues
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# Load environment
ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'NOT_SET')
db_name = os.environ.get('DB_NAME', 'NOT_SET')

print("=" * 50)
print("🔍 MongoDB Connection Test")
print("=" * 50)
print(f"MONGO_URL: {mongo_url}")
print(f"DB_NAME: {db_name}")
print()

if mongo_url == 'NOT_SET':
    print("❌ MONGO_URL is not set in backend/.env")
    print()
    print("Create backend/.env with:")
    print("MONGO_URL=mongodb://localhost:27017")
    print("DB_NAME=erp_db")
    exit(1)

# Test 1: Sync connection
print("Test 1: Testing MongoDB Connection (Sync)...")
try:
    client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
    # Force connection
    client.admin.command('ping')
    print("✅ MongoDB is reachable!")

    # List databases
    dbs = client.list_database_names()
    print(f"✅ Available databases: {dbs}")

    # Check if our database exists
    if db_name in dbs:
        print(f"✅ Database '{db_name}' exists!")
        db = client[db_name]
        collections = db.list_collection_names()
        print(f"✅ Collections: {collections if collections else '(empty)'}")

        # Count documents
        if 'item_categories' in collections:
            count = db.item_categories.count_documents({})
            print(f"   - item_categories: {count} documents")
        if 'items' in collections:
            count = db.items.count_documents({})
            print(f"   - items: {count} documents")
    else:
        print(f"⚠️  Database '{db_name}' doesn't exist yet (will be created on first write)")

    client.close()
    print()
    print("✅ All tests passed! Backend should work fine.")

except Exception as e:
    print(f"❌ Connection failed: {e}")
    print()
    print("💡 Solutions:")
    print("1. Make sure MongoDB is running:")
    print("   Windows: net start MongoDB")
    print("   Mac: brew services start mongodb-community")
    print("   Linux: sudo systemctl start mongod")
    print()
    print("2. OR use MongoDB Atlas (cloud):")
    print("   - Go to mongodb.com/cloud/atlas")
    print("   - Create free cluster")
    print("   - Get connection string")
    print("   - Update backend/.env with that string")
    exit(1)

# Test 2: Async connection (what backend uses)
print()
print("Test 2: Testing Async Connection...")
async def test_async():
    try:
        client = AsyncIOMotorClient(mongo_url)
        # Test connection
        await client.admin.command('ping')
        print("✅ Async connection works!")
        return True
    except Exception as e:
        print(f"❌ Async connection failed: {e}")
        return False

result = asyncio.run(test_async())

if result:
    print()
    print("=" * 50)
    print("✅ All connections successful!")
    print("=" * 50)
    print()
    print("Your backend should work. Try:")
    print("1. Restart backend server")
    print("2. Refresh browser at http://localhost:3000")
