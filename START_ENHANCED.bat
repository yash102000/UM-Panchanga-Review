@echo off
REM ============================================================
REM UM Panchanga Review Panel - Ultimate Automation Script
REM ============================================================
REM Features:
REM  • Auto-finds project folder (anywhere)
REM  • Auto-downloads & installs Python
REM  • Auto-installs dependencies
REM  • Starts backend + ngrok
REM  • Works from any location
REM ============================================================

setlocal enabledelayedexpansion
cls

echo.
echo ============================================================
echo   UM Panchanga Review Panel - Ultimate Setup
echo ============================================================
echo.

REM Get the script's directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Check if we're in the right directory
if not exist "backend\app.py" (
    echo [ERROR] Cannot find backend\app.py
    echo.
    echo Searching for project folder...
    
    REM Search for the project folder
    for /r %USERPROFILE% %%d in (Panachanga_review) do (
        if exist "%%d\backend\app.py" (
            set "SCRIPT_DIR=%%d\"
            cd /d "!SCRIPT_DIR!"
            echo [OK] Found project at: !SCRIPT_DIR!
            goto found_project
        )
    )
    
    for /r C:\ %%d in (Panachanga_review) do (
        if exist "%%d\backend\app.py" (
            set "SCRIPT_DIR=%%d\"
            cd /d "!SCRIPT_DIR!"
            echo [OK] Found project at: !SCRIPT_DIR!
            goto found_project
        )
    )
    
    echo [ERROR] Project folder not found!
    echo Please ensure the folder structure includes:
    echo   - backend\app.py
    echo   - requirements.txt
    pause
    exit /b 1
)

:found_project

echo [OK] Project folder: %SCRIPT_DIR%
echo.

REM ============================================================
REM Check and Install Python
REM ============================================================

echo Checking Python installation...

python --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Python not found!
    echo.
    echo Do you want to automatically download and install Python?
    echo This may take 5-10 minutes.
    echo.
    set /p install_python="Install Python now? (y/n): "
    
    if /i "!install_python!"=="y" (
        echo.
        echo Downloading Python 3.11 installer...
        echo.
        
        REM Download Python
        powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.11.0/python-3.11.0-amd64.exe', '%TEMP%\python-installer.exe')}"
        
        if errorlevel 1 (
            echo [ERROR] Failed to download Python
            echo.
            echo Please download manually from: https://www.python.org/downloads/
            echo Then run this script again.
            pause
            exit /b 1
        )
        
        echo [OK] Downloaded Python installer
        echo Installing Python...
        echo.
        
        REM Install Python with options
        "%TEMP%\python-installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_pip=1
        
        if errorlevel 1 (
            echo [ERROR] Python installation failed
            pause
            exit /b 1
        )
        
        echo [OK] Python installed successfully
        echo.
        echo Restarting this script...
        timeout /t 3
        
        REM Restart the script
        python "%SCRIPT_DIR%\START_ENHANCED.bat"
        exit /b 0
    ) else (
        echo.
        echo Please install Python manually from: https://www.python.org/downloads/
        echo Make sure to check "Add Python to PATH" during installation
        echo Then run this script again.
        pause
        exit /b 1
    )
)

echo [OK] Python is installed
python --version
echo.

REM ============================================================
REM Check pip
REM ============================================================

echo Checking pip...
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip not found!
    echo Installing pip...
    python -m ensurepip --upgrade
    
    if errorlevel 1 (
        echo [ERROR] Failed to install pip
        pause
        exit /b 1
    )
)

echo [OK] pip is ready
echo.

REM ============================================================
REM Install Dependencies
REM ============================================================

echo Installing Python dependencies...
echo (This may take 2-3 minutes on first run)
echo.

if not exist "%SCRIPT_DIR%requirements.txt" (
    echo [ERROR] requirements.txt not found!
    pause
    exit /b 1
)

pip install -q -r "%SCRIPT_DIR%requirements.txt"

if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    echo.
    echo Try running this command manually:
    echo   pip install -r requirements.txt
    pause
    exit /b 1
)

echo [OK] All dependencies installed successfully
echo.

REM ============================================================
REM Start Backend Server
REM ============================================================

echo.
echo ============================================================
echo   Starting Backend Server...
echo ============================================================
echo.

REM Check if port 5000 is in use
netstat -ano | findstr ":5000" >nul 2>&1
if errorlevel 0 (
    echo [WARNING] Port 5000 may already be in use
    echo Attempting to use it anyway...
)

echo Starting Flask backend on port 5000...
echo.

start "UM Panchanga Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && python app.py"

if errorlevel 1 (
    echo [ERROR] Failed to start backend
    pause
    exit /b 1
)

timeout /t 3

echo [OK] Backend started!
echo.

REM ============================================================
REM ngrok Setup (Optional)
REM ============================================================

ngrok version >nul 2>&1
if errorlevel 1 (
    echo [INFO] ngrok not installed
    echo.
    echo ngrok allows public access to your app.
    echo.
    set /p install_ngrok="Download and install ngrok? (y/n): "
    
    if /i "!install_ngrok!"=="y" (
        echo.
        echo Downloading ngrok...
        
        REM Detect Windows architecture
        for /f "tokens=*" %%i in ('wmic os get osarchitecture ^| findstr bit') do set ARCH=%%i
        
        if "!ARCH!"=="32-bit" (
            set NGROK_URL=https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-386.zip
        ) else (
            set NGROK_URL=https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip
        )
        
        powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('!NGROK_URL!', '%TEMP%\ngrok.zip')}"
        
        if errorlevel 1 (
            echo [ERROR] Failed to download ngrok
            echo Download manually from: https://ngrok.com/download
            pause
        ) else (
            echo [OK] Downloaded ngrok
            echo Extracting ngrok...
            
            powershell -Command "& {Expand-Archive -Path '%TEMP%\ngrok.zip' -DestinationPath '%TEMP%\ngrok' -Force}"
            
            if errorlevel 1 (
                echo [ERROR] Failed to extract ngrok
                pause
            ) else (
                echo [OK] ngrok ready
            )
        )
    )
)

ngrok version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Skipping ngrok (not installed)
) else (
    echo [OK] ngrok installed
    echo.
    echo Starting ngrok tunnel...
    start "UM Panchanga - ngrok Tunnel" cmd /k "ngrok http 5000"
)

echo.
echo ============================================================
echo   SETUP COMPLETE!
echo ============================================================
echo.
echo Backend is running on: http://localhost:5000
echo.

if not errorlevel 1 (
    echo Opening in browser...
    timeout /t 2
    start http://localhost:5000
)

echo.
echo ============================================================
echo   STATUS
echo ============================================================
echo.
echo [OK] Backend Server ......... Running
echo [OK] Dependencies ........... Installed
if not errorlevel 1 (
    echo [OK] ngrok Tunnel .......... Available
) else (
    echo [!] ngrok Tunnel .......... Optional (can be added later)
)
echo.
echo ============================================================
echo.
echo NEXT STEPS:
echo 1. Your browser should open to: http://localhost:5000
echo 2. Login with your credentials
echo 3. Start reviewing Panchanga data!
echo.
echo To share with others:
echo  - Check ngrok window for public URL
echo  - Share that URL with others
echo.
echo TO STOP:
echo  - Close the Backend window
echo  - Close the ngrok window (if running)
echo.

pause
