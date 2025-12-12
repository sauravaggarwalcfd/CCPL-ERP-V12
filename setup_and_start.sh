#!/bin/bash

echo "🚀 CCPL ERP - Complete Setup & Startup Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${RED}✗ MongoDB is NOT running${NC}"
    echo ""
    echo -e "${YELLOW}Please start MongoDB first:${NC}"
    echo "  - Linux: sudo systemctl start mongod"
    echo "  - Mac: brew services start mongodb-community"
    echo "  - Docker: docker run -d -p 27017:27017 mongo:7.0"
    echo ""
    echo "Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
    echo "  - Update backend/.env with your MongoDB Atlas connection string"
    exit 1
fi

# Initialize database
echo ""
echo "🔧 Initializing database..."
cd backend
python3 init_db.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database initialized successfully${NC}"
else
    echo -e "${RED}✗ Database initialization failed${NC}"
    exit 1
fi

# Install frontend dependencies if needed
echo ""
echo "📦 Checking frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules/zustand" ]; then
    echo "Installing Zustand..."
    npm install zustand --legacy-peer-deps
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Success message
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "=============================================="
echo "🎯 Next Steps:"
echo "=============================================="
echo ""
echo "1. Start Backend (in this terminal):"
echo "   cd backend"
echo "   python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Start Frontend (in new terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Login:"
echo "   URL: http://localhost:3000/login"
echo "   Username: admin"
echo "   Password: admin@123"
echo ""
echo "=============================================="
echo "📚 Documentation:"
echo "=============================================="
echo "  - AUTH_SETUP_GUIDE.md - Authentication setup"
echo "  - PRODUCTION_READINESS_GUIDE.md - Production tips"
echo ""
