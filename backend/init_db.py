"""Database initialization script - Create indexes and admin user"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from auth.password import hash_password
from models.user import UserInDB, UserRole
from datetime import datetime


async def init_database():
    """Initialize database with indexes and default admin user"""

    # Connect to MongoDB
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "erp_db")

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    print(f"🔧 Initializing database: {db_name}")

    # Create indexes
    print("\n📊 Creating indexes...")

    # Users indexes
    await db.users.create_index([("email", 1)], unique=True)
    await db.users.create_index([("username", 1)], unique=True)
    await db.users.create_index([("id", 1)], unique=True)
    await db.users.create_index([("is_active", 1)])
    print("   ✓ Users indexes created")

    # Items indexes
    await db.items.create_index([("item_code", 1)], unique=True)
    await db.items.create_index([("category_id", 1)])
    await db.items.create_index([("is_active", 1)])
    await db.items.create_index([("item_name", "text")])  # Text search
    print("   ✓ Items indexes created")

    # Categories indexes
    await db.item_categories.create_index([("id", 1)], unique=True)
    await db.item_categories.create_index([("parent_category", 1)])
    await db.item_categories.create_index([("level", 1)])
    await db.item_categories.create_index([("is_active", 1)])
    print("   ✓ Categories indexes created")

    # UOMs indexes
    await db.uoms.create_index([("uom_code", 1)], unique=True)
    await db.uoms.create_index([("is_active", 1)])
    print("   ✓ UOMs indexes created")

    # Create default admin user if doesn't exist
    print("\n👤 Creating default admin user...")

    admin_email = os.getenv("ADMIN_EMAIL", "admin@ccpl-erp.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin@123")
    admin_username = os.getenv("ADMIN_USERNAME", "admin")

    existing_admin = await db.users.find_one({"email": admin_email})

    if existing_admin:
        print(f"   ⚠ Admin user already exists: {admin_email}")
    else:
        admin_user = UserInDB(
            email=admin_email,
            username=admin_username,
            full_name="System Administrator",
            role=UserRole.ADMIN,
            hashed_password=hash_password(admin_password),
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        await db.users.insert_one(admin_user.model_dump())

        print(f"   ✓ Admin user created successfully!")
        print(f"   📧 Email: {admin_email}")
        print(f"   👤 Username: {admin_username}")
        print(f"   🔑 Password: {admin_password}")
        print(f"   ⚠ IMPORTANT: Change the password after first login!")

    # Create test users if in development
    if os.getenv("ENVIRONMENT", "development") == "development":
        print("\n👥 Creating test users...")

        test_users = [
            {
                "email": "manager@test.com",
                "username": "manager",
                "full_name": "Test Manager",
                "role": UserRole.MANAGER,
                "password": "manager@123"
            },
            {
                "email": "staff@test.com",
                "username": "staff",
                "full_name": "Test Staff",
                "role": UserRole.STAFF,
                "password": "staff@123"
            },
            {
                "email": "viewer@test.com",
                "username": "viewer",
                "full_name": "Test Viewer",
                "role": UserRole.VIEWER,
                "password": "viewer@123"
            }
        ]

        for user_data in test_users:
            existing = await db.users.find_one({"email": user_data["email"]})
            if not existing:
                password = user_data.pop("password")
                test_user = UserInDB(
                    **user_data,
                    hashed_password=hash_password(password),
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                await db.users.insert_one(test_user.model_dump())
                print(f"   ✓ Created test user: {user_data['email']} (password: {password})")

    client.close()
    print("\n✅ Database initialization completed!")


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    # Run initialization
    asyncio.run(init_database())
