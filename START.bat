@echo off
REM ============================================================
REM UM Panchanga Review Panel - Automated Setup & Start Script
REM ============================================================
REM This script automates the entire setup and startup process
REM ============================================================

cls
echo.
echo ============================================================
echo   UM Panchanga Review Panel - Setup & Start
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.8+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

echo [OK] Python is installed

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip is not installed!
    pause
    exit /b 1
)

echo [OK] pip is installed
echo.

REM Install Python dependencies
echo Installing Python dependencies...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

echo [OK] Dependencies installed successfully
echo.

REM Check if ngrok is installed
ngrok version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] ngrok is not installed!
    echo.
    echo To use ngrok for public access, please:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Extract and add to PATH, OR
    echo 3. Run ngrok manually in another terminal
    echo.
    echo For now, the backend will run on http://localhost:5000
    echo.
    pause
    timeout /t 3
) else (
    echo [OK] ngrok is installed
)

echo.
echo ============================================================
echo   Starting Backend Server...
echo ============================================================
echo.
echo Backend will run on: http://localhost:5000
echo.

REM Start backend server in a new window
start "UM Panchanga Backend" cmd /k "cd /d %~dp0backend && python app.py"

REM Wait for backend to start
timeout /t 3

echo.
echo ============================================================
echo   Backend Server Started!
echo ============================================================
echo.

REM Check if ngrok is available and start it
ngrok version >nul 2>&1
if errorlevel 1 (
    echo [INFO] ngrok not found. Skipping tunnel setup.
    echo.
    echo To expose your app publicly, install ngrok and run:
    echo   ngrok http 5000
    echo.
    echo Then update the API_BASE in index.html with the ngrok URL.
    echo.
    pause
) else (
    echo [INFO] Starting ngrok tunnel...
    echo.
    start "UM Panchanga - ngrok Tunnel" cmd /k "ngrok http 5000"
    
    echo.
    echo ============================================================
    echo   ngrok tunnel started!
    echo ============================================================
    echo.
    echo Check the ngrok window for your public URL:
    echo   - Look for "Forwarding" line
    echo   - Format: https://xxxx-xxxx-xxxx.ngrok-free.dev
    echo.
    echo To use this URL with your frontend:
    echo 1. Open index.html in VS Code
    echo 2. Add this to the <head> section:
    echo.
    echo    ^<script^>
    echo    window.API_BASE = "https://your-ngrok-url.ngrok-free.dev";
    echo    ^</script^>
    echo.
    echo 3. Replace "your-ngrok-url" with the actual URL from ngrok window
    echo.
)

echo.
echo ============================================================
echo   Setup Complete!
echo ============================================================
echo.
echo Next Steps:
echo 1. Backend is running on http://localhost:5000
echo 2. If using ngrok, check the ngrok window for your public URL
echo 3. Update index.html with the API_BASE if using ngrok
echo 4. Open your app in a browser
echo.
echo To stop the servers:
echo   - Close the "Backend" window
echo   - Close the "ngrok Tunnel" window (if running)
echo.

pause
