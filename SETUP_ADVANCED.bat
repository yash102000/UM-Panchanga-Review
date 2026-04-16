@echo off
REM ============================================================
REM UM Panchanga Review Panel - Advanced Setup Script
REM ============================================================
REM This script provides interactive setup for all components
REM ============================================================

cls
echo.
echo ============================================================
echo   UM Panchanga Review Panel - Advanced Setup
echo ============================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Install from https://www.python.org/
    pause
    exit /b 1
)

REM Check pip
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip not found!
    pause
    exit /b 1
)

echo [OK] Python and pip found
echo.

REM Ask for database configuration
echo ============================================================
echo Database Configuration
echo ============================================================
echo.
echo Current configuration (hardcoded):
echo   Host: panchanga-db.cxgu0ko8m1a7.ap-south-1.rds.amazonaws.com
echo   User: admin
echo   Database: panchanga_db
echo.
set /p db_change="Do you want to change database credentials? (y/n): "

if /i "%db_change%"=="y" (
    set /p db_host="Enter Database Host: "
    set /p db_user="Enter Database User: "
    set /p db_password="Enter Database Password: "
    
    echo Updating backend configuration...
    REM Note: This would require updating app.py - show user instructions instead
    echo [INFO] Update these values in backend/app.py (lines 15-21)
)

echo.
echo Installing dependencies...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies installed

echo.
echo ============================================================
echo Available Options
echo ============================================================
echo.
echo 1. Start Backend Only (localhost:5000)
echo 2. Start Backend + ngrok Tunnel
echo 3. Start Backend + Open Browser
echo 4. Full Setup (Backend + ngrok + Browser)
echo.
set /p choice="Select option (1-4): "

if "%choice%"=="1" (
    start "UM Panchanga Backend" cmd /k "cd /d %~dp0backend && python app.py"
    echo Backend started on http://localhost:5000
    pause
)

if "%choice%"=="2" (
    ngrok version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] ngrok not installed. Install from https://ngrok.com/download
        pause
        exit /b 1
    )
    start "UM Panchanga Backend" cmd /k "cd /d %~dp0backend && python app.py"
    timeout /t 3
    start "ngrok Tunnel" cmd /k "ngrok http 5000"
    echo.
    echo Backend and ngrok started!
    echo Check ngrok window for your public URL
    pause
)

if "%choice%"=="3" (
    start "UM Panchanga Backend" cmd /k "cd /d %~dp0backend && python app.py"
    timeout /t 3
    start http://localhost/index.html
    echo Backend started and browser opened
    pause
)

if "%choice%"=="4" (
    ngrok version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] ngrok not installed. Install from https://ngrok.com/download
        pause
        exit /b 1
    )
    start "UM Panchanga Backend" cmd /k "cd /d %~dp0backend && python app.py"
    timeout /t 3
    start "ngrok Tunnel" cmd /k "ngrok http 5000"
    timeout /t 2
    start http://localhost/index.html
    echo.
    echo All services started!
    echo Check ngrok window for your public URL
    pause
)

echo Invalid option. Exiting.
pause
exit /b 1
