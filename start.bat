@echo off
REM ERP Inventory System - Quick Start Script for Windows
REM This script starts both backend and frontend servers

echo 🚀 Starting ERP Inventory System...
echo.

REM Check if backend .env exists
if not exist "backend\.env" (
    echo ⚠️  Creating backend\.env file...
    (
        echo MONGO_URL=mongodb://localhost:27017
        echo DB_NAME=erp_db
        echo JWT_SECRET=your-secret-key-change-in-production-12345
    ) > backend\.env
    echo ✅ Backend .env created
)

REM Check if frontend .env exists
if not exist "frontend\.env" (
    echo ⚠️  Creating frontend\.env file...
    (
        echo REACT_APP_BACKEND_URL=http://localhost:8000
        echo PORT=3000
    ) > frontend\.env
    echo ✅ Frontend .env created
)

echo.
echo 📋 Checking prerequisites...
echo.

REM Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+
    pause
    exit /b 1
)
python --version
echo ✅ Python installed

REM Check Node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+
    pause
    exit /b 1
)
node --version
echo ✅ Node.js installed

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules\" (
    echo.
    echo 📦 Installing frontend dependencies...
    cd frontend
    where yarn >nul 2>nul
    if %errorlevel% equ 0 (
        yarn install
    ) else (
        npm install
    )
    cd ..
)

echo.
echo 🎯 Starting servers...
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop servers
echo.

REM Start backend in a new window
echo 🔧 Starting backend...
start "ERP Backend" cmd /k "python -m uvicorn backend.server:app --reload --host 0.0.0.0 --port 8000"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend...
cd frontend
where yarn >nul 2>nul
if %errorlevel% equ 0 (
    yarn start
) else (
    npm start
)

cd ..
echo.
echo 🛑 Frontend stopped. Close the backend window manually if needed.
pause
