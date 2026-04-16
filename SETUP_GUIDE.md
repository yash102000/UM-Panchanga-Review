# UM Panchanga Review Panel - User Setup Guide

## For Non-Technical Users

This guide helps you set up and run the UM Panchanga Review Panel without needing technical knowledge.

---

## Prerequisites

Before you begin, ensure you have:

1. **Windows Computer** (Windows 7 or later)
2. **Python 3.8 or later** - [Download here](https://www.python.org/downloads/)
3. **Internet Connection**

### Installing Python (If not already installed)

1. Visit [python.org/downloads](https://www.python.org/downloads/)
2. Click the yellow "Download Python 3.x.x" button
3. Run the installer
4. **IMPORTANT:** Check the box "Add Python to PATH"
5. Click "Install Now"
6. Wait for installation to complete
7. Click "Disable path length limit" (if prompted)

---

## Option 1: Simple Start (Recommended for beginners)

### Step 1: Unzip the folder
Extract the provided ZIP file to your desired location.

### Step 2: Run START.bat
Double-click the `START.bat` file in the folder.

This will:
- ✅ Check if Python is installed
- ✅ Install all required software packages
- ✅ Start the backend server
- ✅ Optionally start ngrok tunnel for public access

### Step 3: Open your browser
- **Local access:** http://localhost:5000
- **Public access:** Check the ngrok window for the public URL

---

## Option 2: Advanced Setup

For more control over the setup process, double-click `SETUP_ADVANCED.bat`

This allows you to:
- Choose what to start
- Update database credentials (optional)
- Select from multiple startup options

---

## Understanding the Components

### Backend Server (Flask)
- **What it is:** The server that handles all data operations
- **Runs on:** http://localhost:5000 (local only)
- **Window name:** "UM Panchanga Backend"

### ngrok Tunnel
- **What it is:** Makes your local server accessible from anywhere on the internet
- **Runs on:** Multiple terminals open automatically
- **Window name:** "UM Panchanga - ngrok Tunnel"

### Frontend (Your App)
- **What it is:** The website interface you interact with
- **Accessed via:** Browser (Chrome, Firefox, Edge, etc.)

---

## Using the Public Link (With ngrok)

If you want to share your app with others:

1. Look at the **ngrok tunnel window** for a line like:
   ```
   Forwarding    https://xxxx-xxxx-xxxx.ngrok-free.dev -> http://localhost:5000
   ```

2. Copy the HTTPS link (e.g., `https://xxxx-xxxx-xxxx.ngrok-free.dev`)

3. Share this link with others

4. **Optional:** To make the API work through this link:
   - Open `index.html` in a text editor
   - Add this inside the `<head>` section:
   ```html
   <script>
       window.API_BASE = "https://your-ngrok-url.ngrok-free.dev";
   </script>
   ```
   - Replace `your-ngrok-url` with your actual ngrok URL

---

## Common Issues & Solutions

### Issue: "Python is not installed or not in PATH"
**Solution:** 
1. Uninstall Python from Control Panel
2. Reinstall Python and make sure to check "Add Python to PATH"
3. Restart your computer
4. Try again

### Issue: "pip not found"
**Solution:**
1. Close the batch file
2. Right-click Command Prompt and select "Run as Administrator"
3. Type: `python -m ensurepip --upgrade`
4. Try running the batch file again

### Issue: "Port 5000 is already in use"
**Solution:**
1. Close any other running backend windows
2. Wait 10 seconds
3. Try running START.bat again

### Issue: "ngrok not installed"
**Solution:**
1. Download from [ngrok.com/download](https://ngrok.com/download)
2. Extract to a folder
3. Add ngrok.exe to your PATH
4. Or run ngrok manually: `ngrok http 5000` in Command Prompt

### Issue: "Server unreachable" error when submitting data
**Solutions:**
- Make sure the backend window is still open
- Check internet connection to database
- Verify database credentials in `backend/app.py`

---

## How to Use the Application

### Login
1. Enter your email
2. Enter your password
3. Click "Login"

### Review Panel
1. Select a language from the dropdown
2. Select a date range
3. Click "Generate" to create rows
4. Fill in the Panchanga data
5. Check the rows you want to submit
6. Click "Submit"

---

## Stopping the Application

### To stop everything:
1. Close the "Backend" window
2. Close the "ngrok Tunnel" window (if running)
3. Close your browser

### The next time:
- Just double-click `START.bat` again

---

## Need Help?

If you encounter issues:

1. **Check the error message** carefully
2. **Try the Solutions** section above
3. **Restart your computer** and try again
4. **Reinstall Python** if issues persist
5. **Contact support** with:
   - Your error message (screenshot)
   - Your Python version: `python --version`
   - Your OS (Windows 7/10/11)

---

## Technical Details (For Reference)

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python Flask
- **Database:** MySQL (AWS RDS)
- **Tunneling:** ngrok
- **Server Port:** 5000
- **Default Credentials:** 
  - User: admin
  - Database: panchanga_db
  - Host: AWS RDS (pre-configured)

---

## Summary

1. **Install Python** (if needed)
2. **Double-click START.bat**
3. **Open browser to http://localhost:5000**
4. **Share the ngrok link** with others (optional)
5. **Done!**

Enjoy using UM Panchanga Review Panel! 🎉
