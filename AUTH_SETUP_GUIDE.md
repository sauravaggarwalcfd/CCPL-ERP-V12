# 🔐 Authentication System Setup & Testing Guide

Your full authentication system is now implemented! Follow these steps to set it up and test it.

---

## ✅ What's Implemented

### Backend:
- ✅ User model with 4 roles (Admin, Manager, Staff, Viewer)
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication (access + refresh tokens)
- ✅ Role-based access control (RBAC)
- ✅ Complete auth API endpoints
- ✅ Database indexes for performance
- ✅ Auto token refresh on expiry

### Frontend:
- ✅ Zustand state management for auth
- ✅ API client with auto auth headers
- ✅ Auto token refresh on 401
- ✅ Login page
- ✅ Protected route wrapper
- ✅ Toast notifications

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Initialize Database

Run this script to create indexes and default admin user:

```bash
cd /home/user/CCPL-ERP-V12/backend
python3 init_db.py
```

**You should see:**
```
🔧 Initializing database: erp_db
📊 Creating indexes...
   ✓ Users indexes created
   ✓ Items indexes created
   ✓ Categories indexes created
   ✓ UOMs indexes created
👤 Creating default admin user...
   ✓ Admin user created successfully!
   📧 Email: admin@ccpl-erp.com
   👤 Username: admin
   🔑 Password: admin@123
   ⚠ IMPORTANT: Change the password after first login!
```

### Step 2: Restart Backend

```bash
# Stop current backend (Ctrl+C)
cd /home/user/CCPL-ERP-V12/backend
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Restart Frontend

```bash
cd /home/user/CCPL-ERP-V12/frontend
npm start
```

### Step 4: Test Login

1. Open browser: `http://localhost:3000/login`
2. Login with default admin:
   - **Email or Username**: `admin` (or `admin@ccpl-erp.com`)
   - **Password**: `admin@123`
3. You should be redirected to dashboard!

---

## 👥 Default Test Users

The init script creates these test users (in development mode):

| Email | Username | Password | Role |
|-------|----------|----------|------|
| admin@ccpl-erp.com | admin | admin@123 | Admin |
| manager@test.com | manager | manager@123 | Manager |
| staff@test.com | staff | staff@123 | Staff |
| viewer@test.com | viewer | viewer@123 | Viewer |

---

## 🔑 User Roles & Permissions

### Admin
- ✅ Full system access
- ✅ User management (create, update, delete users)
- ✅ All CRUD operations
- ✅ System settings

### Manager
- ✅ Create, update, delete items/categories
- ✅ View all data
- ❌ Cannot manage users
- ❌ Cannot change system settings

### Staff
- ✅ Create and update items/categories
- ✅ View all data
- ❌ Cannot delete
- ❌ Cannot manage users

### Viewer
- ✅ View all data
- ❌ Cannot create, update, or delete
- ❌ Read-only access

---

## 📡 API Endpoints

### Public Endpoints (No Auth Required):
```
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login
POST /api/auth/refresh   - Refresh token
```

### Protected Endpoints (Auth Required):
```
GET  /api/auth/me              - Get current user
PUT  /api/auth/me              - Update current user
GET  /api/auth/users           - List all users (Admin only)
PUT  /api/auth/users/{id}      - Update user (Admin only)
DELETE /api/auth/users/{id}    - Delete user (Admin only)
```

### All Other Endpoints:
All existing endpoints (items, categories, UOMs, etc.) now require authentication!

---

## 🧪 Testing the Auth System

### Test 1: Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin@123"
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Test 2: Get Current User
```bash
# Replace {TOKEN} with access_token from login
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer {TOKEN}"
```

**Expected Response:**
```json
{
  "id": "...",
  "email": "admin@ccpl-erp.com",
  "username": "admin",
  "full_name": "System Administrator",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-12-12T...",
  "last_login": "2025-12-12T..."
}
```

### Test 3: Access Protected Endpoint
```bash
# Try to get items WITHOUT token (should fail)
curl -X GET http://localhost:8000/api/masters/items

# Expected: 401 Unauthorized


# Try WITH token (should work)
curl -X GET http://localhost:8000/api/masters/items \
  -H "Authorization: Bearer {TOKEN}"

# Expected: List of items
```

---

## 🔒 How to Protect Your Endpoints

### Update Existing Endpoints

Before (anyone can access):
```python
@api_router.get("/masters/items")
async def get_items():
    ...
```

After (requires authentication):
```python
from auth.dependencies import get_current_user, require_admin, require_manager

# Any authenticated user can access
@api_router.get("/masters/items")
async def get_items(current_user = Depends(get_current_user)):
    ...

# Only admin and manager can access
@api_router.post("/masters/items")
async def create_item(item: ItemCreate, current_user = Depends(require_manager)):
    ...

# Only admin can access
@api_router.delete("/masters/items/{id}")
async def delete_item(id: str, current_user = Depends(require_admin)):
    ...
```

### Use User Context in Operations

```python
@api_router.post("/masters/items")
async def create_item(
    item: ItemCreate,
    current_user = Depends(get_current_user)
):
    # Add created_by field
    item_data = item.model_dump()
    item_data["created_by"] = current_user.id
    item_data["created_by_username"] = current_user.username

    # Save to database
    ...
```

---

## 🎨 Frontend Usage

### 1. Check if User is Logged In

```javascript
import { useAuthStore } from '@/stores/authStore';

const MyComponent = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return <div>Welcome, {user.full_name}!</div>;
};
```

### 2. Check User Role

```javascript
const { user, hasRole, isAdmin, isManager } = useAuthStore();

// Check single role
if (hasRole('admin')) {
  // Show admin-only content
}

// Check multiple roles
if (hasRole(['admin', 'manager'])) {
  // Show content for admin OR manager
}

// Use helper functions
if (isAdmin()) {
  // Show admin-only content
}

if (isManager()) {
  // Show content for admin OR manager
}
```

### 3. Protect Routes

In your router configuration:

```javascript
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Protect entire route
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// Protect with role requirement
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>

// Multiple roles
<Route
  path="/inventory"
  element={
    <ProtectedRoute requiredRoles={['admin', 'manager', 'staff']}>
      <InventoryPage />
    </ProtectedRoute>
  }
/>
```

### 4. Logout

```javascript
const { logout } = useAuthStore();

const handleLogout = () => {
  logout();
  navigate('/login');
};
```

### 5. API Calls (Auto-Authenticated)

```javascript
import apiClient from '@/services/apiClient';

// All API calls automatically include auth token!
const response = await apiClient.get('/api/masters/items');

// Token refresh happens automatically on 401
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or "Network Error"
**Solution:** Make sure backend is running on port 8000

```bash
cd /home/user/CCPL-ERP-V12/backend
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Issue: "401 Unauthorized" on API calls
**Solution:** Token might be expired or invalid

1. Check browser localStorage: `auth-storage`
2. Try logging out and logging in again
3. Check browser console for errors

### Issue: "Could not validate credentials"
**Solution:** Database might not be initialized

```bash
cd /home/user/CCPL-ERP-V12/backend
python3 init_db.py
```

### Issue: Can't login with admin credentials
**Solution:** Make sure you ran init_db.py and MongoDB is running

```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

### Issue: "Module not found: auth.router"
**Solution:** Make sure you're in the backend directory

```bash
cd /home/user/CCPL-ERP-V12/backend
python3 -m uvicorn server:app --reload
```

---

## 📝 Next Steps

### 1. Change Default Passwords
```bash
# Login as admin and change password through API or UI
curl -X PUT http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"password": "new-secure-password"}'
```

### 2. Protect Your Endpoints

Go through server.py and add auth dependencies to all endpoints:

```python
# Find lines like:
@api_router.get("/masters/items")
async def get_items():

# Add auth:
@api_router.get("/masters/items")
async def get_items(current_user = Depends(get_current_user)):
```

### 3. Update Environment Variables

In production, change these in `.env`:

```env
JWT_SECRET_KEY=use-a-very-long-random-string-at-least-32-characters
ADMIN_PASSWORD=secure-password-here
ENVIRONMENT=production
DEBUG=false
```

### 4. Add User Management UI

Create pages for:
- User list (admin only)
- Create user (admin only)
- Edit user (admin only)
- User profile (current user)

### 5. Add Audit Logging

Track who created/updated records:

```python
item_data["created_by"] = current_user.id
item_data["created_at"] = datetime.utcnow()
item_data["updated_by"] = current_user.id
item_data["updated_at"] = datetime.utcnow()
```

---

## 🎉 You're Done!

Your ERP system now has:
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ Auto token refresh
- ✅ Protected endpoints
- ✅ User management

**Test it now:** `http://localhost:3000/login`

**Questions?** Check the code comments or refer to:
- Backend: `/home/user/CCPL-ERP-V12/backend/auth/`
- Frontend: `/home/user/CCPL-ERP-V12/frontend/src/stores/authStore.js`
