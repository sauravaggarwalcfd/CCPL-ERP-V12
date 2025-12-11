# 🚀 Local Setup Guide - ERP Inventory System

Follow these steps to run the full ERP application on your local machine.

---

## 📋 Prerequisites

Before starting, make sure you have installed:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
3. **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
4. **Git** - [Download here](https://git-scm.com/)

### ✅ Verify Installation

Open terminal/command prompt and run:

```bash
node --version    # Should show v16.x.x or higher
python --version  # Should show 3.8.x or higher
mongod --version  # Should show MongoDB version
git --version     # Should show git version
```

---

## 📥 Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/sauravaggarwalcfd/CCPL-ERP-V12.git

# Navigate to the project directory
cd CCPL-ERP-V12
```

---

## 🗄️ Step 2: Set Up MongoDB

### Option A: Use Local MongoDB

1. **Start MongoDB Service:**

   **Windows:**
   ```bash
   # Open Command Prompt as Administrator
   net start MongoDB
   ```

   **Mac:**
   ```bash
   brew services start mongodb-community
   ```

   **Linux:**
   ```bash
   sudo systemctl start mongod
   ```

2. **Verify MongoDB is running:**
   ```bash
   # Open a new terminal
   mongosh
   # You should see MongoDB shell connect successfully
   # Type 'exit' to close the shell
   ```

### Option B: Use MongoDB Atlas (Cloud - Free)

If you don't want to install MongoDB locally:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (Free M0 tier)
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Use this connection string in Step 3

---

## ⚙️ Step 3: Configure Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create environment file:**

   **Windows:**
   ```bash
   copy NUL .env
   ```

   **Mac/Linux:**
   ```bash
   touch .env
   ```

3. **Edit `.env` file** (use Notepad, VS Code, or any text editor):

   **For Local MongoDB:**
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=erp_db
   JWT_SECRET=your-secret-key-change-in-production-12345
   ```

   **For MongoDB Atlas:**
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=erp_db
   JWT_SECRET=your-secret-key-change-in-production-12345
   ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   **If you get permission errors:**
   ```bash
   pip install --user -r requirements.txt
   ```

5. **Go back to project root:**
   ```bash
   cd ..
   ```

---

## 🎨 Step 4: Configure Frontend

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Create environment file:**

   **Windows:**
   ```bash
   copy NUL .env
   ```

   **Mac/Linux:**
   ```bash
   touch .env
   ```

3. **Edit `.env` file:**
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   PORT=3000
   ```

4. **Install dependencies:**
   ```bash
   # If you have yarn installed (recommended)
   yarn install

   # OR if you prefer npm
   npm install
   ```

5. **Go back to project root:**
   ```bash
   cd ..
   ```

---

## 🚀 Step 5: Start the Application

You need to run **TWO terminals** - one for backend, one for frontend.

### Terminal 1: Start Backend

```bash
# Navigate to project root
cd CCPL-ERP-V12

# Start FastAPI backend
python -m uvicorn backend.server:app --reload --host 0.0.0.0 --port 8000
```

**You should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Backend is ready!** Keep this terminal open.

---

### Terminal 2: Start Frontend

Open a **NEW terminal window** (don't close the first one!)

```bash
# Navigate to frontend directory
cd CCPL-ERP-V12/frontend

# Start React development server
yarn start

# OR if using npm
npm start
```

**You should see:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

✅ **Frontend is ready!** Keep this terminal open too.

---

## 🌐 Step 6: Access the Application

Your browser should automatically open. If not:

**Open your browser and go to:**
```
http://localhost:3000
```

**API Documentation (FastAPI):**
```
http://localhost:8000/docs
```

---

## 🎉 You're Done!

You should now see the **ERP Inventory System** login page!

### 🔍 What You Can Do:

1. **Explore the Dashboard** - View KPIs and quick actions
2. **Manage Categories** - Try drag-and-drop category reorganization
3. **Add Items** - Create inventory items with various types
4. **Create Purchase Orders** - Full procurement workflow
5. **Manage Stock** - GRN, transfers, adjustments, issues
6. **View Reports** - Stock ledger, item balance, and more

### 📝 Note:
- The application starts with an **empty database**
- You can start adding data through the UI
- To add sample data, check the `/scripts` folder for seeding scripts

---

## 🛑 Stopping the Application

When you're done:

1. **Stop Frontend**: Go to Terminal 2, press `Ctrl + C`
2. **Stop Backend**: Go to Terminal 1, press `Ctrl + C`
3. **Stop MongoDB** (if using local):
   - Windows: `net stop MongoDB`
   - Mac: `brew services stop mongodb-community`
   - Linux: `sudo systemctl stop mongod`

---

## 🐛 Troubleshooting

### Backend won't start - "No module named 'fastapi'"
```bash
pip install -r backend/requirements.txt
```

### Frontend won't start - "command not found: yarn"
Install yarn or use npm instead:
```bash
npm install -g yarn
# OR just use npm
npm install
npm start
```

### MongoDB connection error
- Make sure MongoDB is running: `mongosh` should connect
- Check your MONGO_URL in backend/.env
- For Atlas, make sure you whitelisted your IP address

### Port already in use
- **Backend (8000)**: Change port in uvicorn command: `--port 8001`
- **Frontend (3000)**: Change PORT in frontend/.env to `3001`

### "Module not found" errors in frontend
```bash
cd frontend
rm -rf node_modules
yarn install
# OR
npm install
```

---

## 🔗 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **MongoDB** | mongodb://localhost:27017 | Database (if local) |

---

## 📞 Need Help?

If you encounter issues:

1. Check that all prerequisites are installed correctly
2. Make sure MongoDB is running
3. Verify .env files are created in both frontend and backend
4. Check terminal output for error messages
5. Try restarting both servers

---

## 🎯 Next Steps

Once running successfully:

1. **Explore the UI** - Click through all the modules
2. **Add Master Data** - Set up categories, items, suppliers
3. **Try Workflows** - Create purchase orders, receive goods
4. **Test Drag & Drop** - Reorganize item categories
5. **Check Reports** - View stock ledger and balance reports

---

**Enjoy your ERP Inventory System!** 🎊
