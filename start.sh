#!/bin/bash

# ERP Inventory System - Quick Start Script
# This script starts both backend and frontend servers

echo "🚀 Starting ERP Inventory System..."
echo ""

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Creating backend/.env file..."
    cat > backend/.env << EOL
MONGO_URL=mongodb://localhost:27017
DB_NAME=erp_db
JWT_SECRET=your-secret-key-change-in-production-12345
EOL
    echo "✅ Backend .env created"
fi

# Check if frontend .env exists
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Creating frontend/.env file..."
    cat > frontend/.env << EOL
REACT_APP_BACKEND_URL=http://localhost:8000
PORT=3000
EOL
    echo "✅ Frontend .env created"
fi

echo ""
echo "📋 Checking prerequisites..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi
echo "✅ Python: $(python3 --version)"

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo ""
    echo "📦 Installing frontend dependencies..."
    cd frontend
    if command -v yarn &> /dev/null; then
        yarn install
    else
        npm install
    fi
    cd ..
fi

echo ""
echo "🎯 Starting servers..."
echo ""
echo "Backend will run on: http://localhost:8000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
echo "🔧 Starting backend..."
python3 -m uvicorn backend.server:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
if command -v yarn &> /dev/null; then
    yarn start
else
    npm start
fi

# When frontend stops, kill backend too
kill $BACKEND_PID
