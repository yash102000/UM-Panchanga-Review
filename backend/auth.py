import uuid
import smtplib
import traceback
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer

APP_SECRET_KEY = os.getenv("APP_SECRET_KEY", "prod-secret-key-12345")
token_serializer = URLSafeTimedSerializer(APP_SECRET_KEY)

EMAIL       = os.getenv("MAIL_SENDER", "")
PASSWORD    = os.getenv("MAIL_APP_PASSWORD", "")

RESET_BASE  = os.getenv("RESET_BASE", "") # Optional override
SMTP_HOST   = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT   = int(os.getenv("SMTP_PORT", "587"))


def send_reset_email(to_email, token):
    # Dynamic detection of base URL
    if RESET_BASE:
        base = RESET_BASE.rstrip("/")
    else:
        # fallback to the request root (e.g. https://myapp.onrender.com)
        base = request.url_root.rstrip("/")
    
    link = f"{base}/reset-page?token={token}"

    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset Your Password - UM Panchanga"
    msg["From"]    = EMAIL
    msg["To"]      = to_email

    plain = f"Click the link below to reset your password:\n\n{link}\n\nThis link will expire once used."
    html  = f"""
    <html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:30px;">
    <div style="max-width:480px;margin:auto;background:#fff;border-radius:10px;padding:30px;">
        <h2 style="color:#e65c00;">UM Panchanga Review</h2>
        <p>
            You requested a password reset. Click the button below:
        </p>
        <a
            href="{link}" style="display:inline-block;padding:12px 24px;background:#e65c00;
            color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            Reset Password
        </a>
        <p
            style="margin-top:20px;font-size:12px;color:#888;">
            If you didn't request this, ignore this email. The link expires once used.
        </p>
    </div>
    </body></html>
    """

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html,  "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(EMAIL, PASSWORD)
            server.sendmail(EMAIL, to_email, msg.as_string())
            print(f"[MAIL] Reset email sent to {to_email}")
    except smtplib.SMTPAuthenticationError:
        print("[MAIL ERROR] Authentication failed. Check EMAIL and App Password in auth.py")
        raise
    except smtplib.SMTPException as e:
        print(f"[MAIL ERROR] SMTP error: {e}")
        traceback.print_exc()
        raise
    except Exception as e:
        print(f"[MAIL ERROR] Unexpected error: {e}")
        traceback.print_exc()
        raise


def register_user(conn):
    data   = request.get_json(force=True, silent=True)
    name   = data.get("name", "").strip()
    email  = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not name or not email or not password:
        return jsonify({"message": "All fields are required."}), 400

    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cursor.fetchone():
        return jsonify({"message": "An account with this email already exists."}), 409

    hashed_password = generate_password_hash(password)

    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed_password)
    )
    conn.commit()
    return jsonify({"message": "Registered successfully! Please log in."}), 201


def login_user(conn):
    data     = request.get_json(force=True, silent=True)
    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"status": "fail", "message": "Please fill in all fields."}), 400

    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE email=%s",
        (email,)
    )
    user = cursor.fetchone()


    if user and check_password_hash(user[3], password):
        
        auth_token = token_serializer.dumps(email, salt="auth-salt")
        return jsonify({
            "status": "success", 
            "message": "Login successful",
            "token": auth_token
        }), 200
    else:
        return jsonify({"status": "fail", "message": "Invalid email or password."}), 401


def forgot_password(conn):
    data  = request.get_json(force=True, silent=True)
    email = data.get("email", "").strip()

    if not email:
        return jsonify({"message": "Please enter your email address."}), 400

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"message": "No account found with that email."}), 404

    token = str(uuid.uuid4())
    cursor.execute(
        "UPDATE users SET reset_token=%s WHERE email=%s",
        (token, email)
    )
    conn.commit()

    try:
        send_reset_email(email, token)
    except Exception as e:
        print("Email send error:", e)
        return jsonify({"message": "Reset token created but email could not be sent. Contact support."}), 500

    return jsonify({"message": "Password reset link sent to your email!"})



def reset_password(conn):
    data         = request.get_json(force=True, silent=True)
    token        = data.get("token", "").strip()
    new_password = data.get("password", "").strip()

    if not token or not new_password:
        return jsonify({"message": "Invalid request."}), 400

    cursor = conn.cursor()
    hashed_password = generate_password_hash(new_password)

    cursor.execute(
        "UPDATE users SET password=%s, reset_token=NULL WHERE reset_token=%s",
        (hashed_password, token)
    )
    conn.commit()

    if cursor.rowcount == 0:
        return jsonify({"message": "Reset token is invalid or already used. Please request a new reset password link."}), 400

    return jsonify({"message": "Password updated successfully! You can now log in."}), 200
