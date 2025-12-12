# 🚀 CCPL ERP - Quick Start Guide

**Your authentication system is fully implemented!** Follow these steps to get started.

---

## ⚡ Super Quick Start (3 Steps)

### Step 1: Start MongoDB

**Choose one option:**

#### Option A: Local MongoDB
```bash
# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community

# Check if running
mongosh --eval "db.adminCommand('ping')"
```

#### Option B: MongoDB with Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

#### Option C: MongoDB Atlas (Cloud - Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `backend/.env`:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/erp_db
   ```

### Step 2: Run Setup Script

```bash
cd /home/user/CCPL-ERP-V12
./setup_and_start.sh
```

This will:
- ✅ Check MongoDB connection
- ✅ Create database indexes
- ✅ Create admin user
- ✅ Install frontend dependencies

### Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
cd /home/user/CCPL-ERP-V12/backend
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /home/user/CCPL-ERP-V12/frontend
npm start
```

### Step 4: Login!

Open browser: **http://localhost:3000/login**

**Default Admin:**
- Username: `admin`
- Password: `admin@123`

🎉 **You're in!**

---

## 📋 What's Implemented

### ✅ Backend (Complete)
- **Authentication**: JWT tokens (access + refresh)
- **Authorization**: 4 user roles (Admin, Manager, Staff, Viewer)
- **API Endpoints**: `/api/auth/*` for login, register, user management
- **Security**: Password hashing, token expiry, role checks
- **Database**: Auto indexes, admin user creation

### ✅ Frontend (Complete)
- **State Management**: Zustand for auth state
- **Auto Auth**: API client adds tokens automatically
- **Auto Refresh**: Tokens refresh on expiry
- **Login Page**: Updated with new auth system
- **Protected Routes**: Role-based access control

---

## 👥 Default Users

| Username | Password | Role | Access |
|----------|----------|------|--------|
| admin | admin@123 | Admin | Full access |
| manager | manager@123 | Manager | Create/Edit/Delete |
| staff | staff@123 | Staff | Create/Edit only |
| viewer | viewer@123 | Viewer | Read-only |

---

## 🔧 Manual Setup (If Script Fails)

### 1. Check MongoDB
```bash
mongosh
# If error, MongoDB is not running
```

### 2. Initialize Database
```bash
cd /home/user/CCPL-ERP-V12/backend
python3 init_db.py
```

Expected output:
```
🔧 Initializing database: erp_db
📊 Creating indexes...
   ✓ Users indexes created
   ✓ Items indexes created
   ✓ Categories indexes created
   ✓ UOMs indexes created
👤 Creating default admin user...
   ✓ Admin user created successfully!
```

### 3. Install Frontend Dependencies
```bash
cd /home/user/CCPL-ERP-V12/frontend
npm install zustand --legacy-peer-deps
```

### 4. Start Servers
```bash
# Terminal 1 - Backend
cd backend
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## 🧪 Test Authentication

### Test 1: Login via UI
1. Open http://localhost:3000/login
2. Enter: admin / admin@123
3. Should redirect to dashboard ✅

### Test 2: Login via API
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin@123"
```

Expected: JSON with `access_token` and `refresh_token`

### Test 3: Get Current User
```bash
# Replace YOUR_TOKEN with access_token from above
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: User info JSON

---

## 🐛 Troubleshooting

### "Connection refused" Error
**Problem**: MongoDB not running

**Solution**:
```bash
# Check MongoDB status
sudo systemctl status mongod  # Linux
brew services list  # Mac

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

### "Module not found: zustand"
**Problem**: Frontend dependencies not installed

**Solution**:
```bash
cd frontend
npm install zustand --legacy-peer-deps
```

### Can't Login
**Problem**: Admin user not created

**Solution**:
```bash
cd backend
python3 init_db.py
```

### "401 Unauthorized" on API calls
**Problem**: Token expired or invalid

**Solution**: Logout and login again

---

## 📁 Project Structure

```
CCPL-ERP-V12/
├── backend/
│   ├── auth/              ✨ NEW - Authentication module
│   ├── models/            ✨ NEW - User models
│   ├── middleware/        ✨ NEW - Future middleware
│   ├── init_db.py         ✨ NEW - Database setup
│   ├── server.py          📝 UPDATED - Added auth router
│   └── .env               📝 UPDATED - JWT config
│
├── frontend/
│   └── src/
│       ├── stores/        ✨ NEW - Zustand stores
│       ├── services/      📝 UPDATED - Auth API, API client
│       ├── components/auth/  ✨ NEW - Protected routes
│       └── pages/Login.jsx   📝 UPDATED - New auth system
│
├── setup_and_start.sh     ✨ NEW - Auto setup script
├── AUTH_SETUP_GUIDE.md    ✨ NEW - Detailed auth guide
├── PRODUCTION_READINESS_GUIDE.md  ✨ NEW - Production tips
└── QUICK_START.md         📖 YOU ARE HERE
```

---

## 📚 Documentation

1. **QUICK_START.md** (this file) - Get started fast
2. **AUTH_SETUP_GUIDE.md** - Detailed authentication guide
3. **PRODUCTION_READINESS_GUIDE.md** - Production deployment guide

---

## 🎯 Next Steps

### Immediate:
1. ✅ Login with admin account
2. ✅ Change admin password
3. ✅ Create your own admin user
4. ✅ Test creating items with different user roles

### This Week:
1. Protect existing API endpoints
2. Add user management UI
3. Add role badges to UI
4. Test all user roles

### This Month:
1. Add password reset
2. Add email verification
3. Deploy to production
4. Add monitoring

---

## 🆘 Need Help?

1. **Setup Issues**: Check AUTH_SETUP_GUIDE.md - Troubleshooting section
2. **API Documentation**: Check AUTH_SETUP_GUIDE.md - API Endpoints
3. **Production Deployment**: Check PRODUCTION_READINESS_GUIDE.md

---

## ✅ Verification Checklist

Before using the system, verify:

- [ ] MongoDB is running (mongosh connects successfully)
- [ ] `python3 init_db.py` ran successfully
- [ ] Backend starts without errors on port 8000
- [ ] Frontend starts without errors on port 3000
- [ ] Can access http://localhost:3000/login
- [ ] Can login with admin/admin@123
- [ ] Redirected to dashboard after login
- [ ] Can see user info in top-right corner
- [ ] Backend logs show successful auth requests

---

**Ready? Run:** `./setup_and_start.sh`

Then login at: http://localhost:3000/login (admin / admin@123)

🎉 **Enjoy your secure ERP system!**
