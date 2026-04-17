# Panchanga Review – Configuration Quick Guide

Backend environment variables (override defaults without changing code):
- `DB_HOST` - database host (default panchanga-db.cxgu0ko8m1a7.ap-south-1.rds.amazonaws.com)
- `DB_PORT` - port (default 3306)
- `DB_USER` - username (default admin)
- `DB_PASSWORD` - password (default Pthinks123)
- `DB_NAME` - database name (default panchanga_db)
- `DB_CHARSET` - charset (default utf8mb4)
- `DB_CONNECT_TIMEOUT` - connect timeout seconds (default 5)
- `TABLE_MAP` - JSON mapping of language label -> table (default is the hardcoded map in code)
- `MAIL_SENDER` - email address used to send reset links (default ruraldevelopment2024@gmail.com)
- `MAIL_APP_PASSWORD` - app password for the sender account
- `RESET_BASE_URL` - base URL for reset links (if unset, the app falls back to the incoming request host/port)
- `SMTP_HOST` / `SMTP_PORT` - SMTP settings (default smtp.gmail.com / 587)

Frontend runtime overrides (set in a script tag before loading `js/config.js`, or assign on `window` before other scripts):
- `window.API_BASE_URL` - base URL for API calls (default falls back to current origin or http://127.0.0.1:5000)
- `window.PANCHANGA_DATE_MIN` - min date for form pickers (default 2026-03-20)
- `window.PANCHANGA_DATE_MAX` - max date for form pickers (default 2027-04-08)

Share/reset from another machine (quick recipe):
1) Expose backend on a reachable host (e.g., deploy, or run `python -m flask run --host 0.0.0.0 --port 5000` behind an ngrok tunnel `ngrok http 5000`).
2) Set backend env `RESET_BASE_URL` to that public HTTPS URL (e.g., `https://<ngrok-id>.ngrok.app`) before starting Flask so emails contain a reachable link. If you leave it unset, links will use the host that served the request.
3) For the frontend on any laptop, open the page and run `window.setApiBase("https://<ngrok-id>.ngrok.app")` in the console once (or add `<script>window.API_BASE_URL="https://...";</script>` before `js/config.js`). The value is persisted in localStorage.
4) Use the app normally; reset links will redirect back to `/pages/login.html` on that host.

## Troubleshooting

### "Database connection failed. Please try again." Error on Login/Signup
If you encounter this red popup error in the UI, your local machine cannot reach the AWS RDS Database (`panchanga-db.cxgu0ko8m1a7...`). 
This happens because:
1. **You don't have internet access**, or
2. **AWS Security Group** is blocking your IP address. 

**How to Fix It:**
* **Option A (AWS):** Log into your AWS RDS Console, examine the Security Group assigned to `panchanga-db`, and add an Inbound Rule for MySQL/Aurora (Port 3306) allowing connection from your current IP (or `0.0.0.0/0` temporarily).
* **Option B (Local MySQL):** Run a local MySQL server (like XAMPP or MySQL Desktop). Then,## 🚀 Deployment on Render

This project is configured for easy deployment on **Render**.

### 1. Create a Web Service
- Connect your GitHub repository to Render.
- Set **Runtime** to `Python 3`.
- Set **Build Command** to `pip install -r requirements.txt`.
- Set **Start Command** to `gunicorn backend.app:app`. (This is also handled by the `Procfile`).

### 2. Environment Variables
In the Render dashboard, go to **Environment** and add the following keys:
- `DB_HOST`: Your RDS endpoint (e.g., `xxx.amazonaws.com`)
- `DB_USER`: Your DB username
- `DB_PASSWORD`: Your DB password
- `DB_NAME`: Your DB name
- `DB_PORT`: `3306`
- `APP_SECRET_KEY`: A random long string for security.
- `MAIL_SENDER`: (Optional) Your Gmail address.
- `MAIL_APP_PASSWORD`: (Optional) Your Gmail App Password.

### 3. Database Notes
- The application automatically initializes the `users` table upon startup if it doesn't exist.
- If you encounter issues, ensure your RDS Security Group allows inbound traffic from `0.0.0.0/0` or the Render IP range.
 override the backend variables in your terminal before running Flask:
  ```bash
  set DB_HOST=localhost
  set DB_USER=root
  set DB_PASSWORD=your_local_password
  set DB_NAME=panchanga_db
  python app.py
  ```
