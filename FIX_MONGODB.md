# 🔧 Fix MongoDB Connection Issues

Your backend can't connect to MongoDB. Follow these steps to fix:

---

## ✅ **STEP 1: Test Your Connection**

Run this diagnostic script:

```bash
cd CCPL-ERP-V12
python test_connection.py
```

This will tell you exactly what's wrong!

---

## 🔧 **SOLUTION A: Start Local MongoDB**

If you have MongoDB installed locally:

### Windows:
```bash
# Check if MongoDB service exists
sc query MongoDB

# Start the service
net start MongoDB

# If service doesn't exist, start manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### Mac:
```bash
# Start MongoDB service
brew services start mongodb-community

# OR start manually
mongod --config /usr/local/etc/mongod.conf
```

### Linux:
```bash
# Start MongoDB service
sudo systemctl start mongod

# Check status
sudo systemctl status mongod

# Enable on boot (optional)
sudo systemctl enable mongod
```

### Verify it's running:
```bash
mongosh
# Should connect successfully!
```

---

## ☁️ **SOLUTION B: Use MongoDB Atlas (Cloud) - EASIEST!**

Don't want to install MongoDB locally? Use the free cloud version:

### Step 1: Create Free Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (it's free!)
3. Choose **FREE M0** tier

### Step 2: Create Cluster
1. Click **"Build a Database"**
2. Choose **FREE** tier (M0)
3. Select a region close to you
4. Click **"Create"**

### Step 3: Create Database User
1. Go to **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `erp_user`
4. Password: Create a strong password (save it!)
5. Click **"Add User"**

### Step 4: Allow IP Access
1. Go to **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **"Database"**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://erp_user:<password>@cluster0.xxxxx.mongodb.net/
   ```
5. Replace `<password>` with your actual password

### Step 6: Update Your .env File

Edit `backend/.env`:

```env
MONGO_URL=mongodb+srv://erp_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/
DB_NAME=erp_db
JWT_SECRET=your-secret-key-change-in-production
```

**IMPORTANT:** Replace `YOUR_PASSWORD` with your actual password!

### Step 7: Restart Backend

```bash
# Stop backend (Ctrl+C in backend terminal)
# Start it again
python -m uvicorn backend.server:app --reload --host 0.0.0.0 --port 8000
```

---

## 🔍 **SOLUTION C: Check if MongoDB Port is Already Used**

Maybe something else is using port 27017?

```bash
# Windows
netstat -ano | findstr :27017

# Mac/Linux
lsof -i :27017
```

If another process is using it, kill it or use a different port.

---

## 🧪 **After Fix: Verify Everything Works**

1. **Test connection:**
   ```bash
   python test_connection.py
   ```
   Should show: ✅ All connections successful!

2. **Check backend logs:**
   Look at your backend terminal - should NOT show connection errors

3. **Refresh browser:**
   Go to http://localhost:3000 and refresh

4. **Add sample data** (if database is empty):
   ```bash
   python add_sample_data.py
   ```

---

## 📋 **Quick Checklist**

- [ ] MongoDB is running (local) OR MongoDB Atlas is set up (cloud)
- [ ] `backend/.env` has correct MONGO_URL
- [ ] Test connection script passes
- [ ] Backend server is running without errors
- [ ] Frontend can load data

---

## 🆘 **Still Not Working?**

Share this info:

1. Output of `python test_connection.py`
2. Error messages from backend terminal
3. Your backend/.env content (hide password!)
4. Are you using local MongoDB or Atlas?

---

## 💡 **Pro Tip**

For development, **MongoDB Atlas** (cloud) is easier because:
- ✅ No installation needed
- ✅ Works from anywhere
- ✅ Free tier is generous
- ✅ Automatic backups
- ✅ No maintenance needed

For production, use a proper deployment setup!
