@echo off
REM ============================================================
REM One-Time Setup Script
REM Run this ONCE to install all dependencies
REM Then use START.bat to run the app
REM ============================================================

cls
echo.
echo ============================================================
echo   UM Panchanga - One-Time Setup
echo ============================================================
echo.
echo This script will:
echo  1. Check if Python is installed
echo  2. Install all required packages
echo  3. Verify ngrok (optional)
echo.
echo This may take 2-3 minutes...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python 3.8+ is required!
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo [OK] Python installed
python --version

REM Check pip
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip not found!
    pause
    exit /b 1
)

echo [OK] pip ready
echo.

REM Install dependencies
echo Installing Python packages (this may take a minute)...
pip install -q -r requirements.txt

if errorlevel 1 (
    echo [ERROR] Failed to install packages!
    pause
    exit /b 1
)

echo [OK] All packages installed successfully!
echo.

REM Check ngrok
ngrok version >nul 2>&1
if errorlevel 1 (
    echo [INFO] ngrok not found
    echo To get public access links, download ngrok from:
    echo   https://ngrok.com/download
    echo.
) else (
    echo [OK] ngrok is installed
    ngrok version
)

echo.
echo ============================================================
echo   SETUP COMPLETE!
echo ============================================================
echo.
echo You can now use:
echo   START.bat         - To run the application
echo   SETUP_GUIDE.md    - For detailed help
echo.
echo For future runs, just double-click: START.bat
echo.

pause
