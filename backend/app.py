import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from backend.auth import register_user, login_user, forgot_password, reset_password, token_serializer
from itsdangerous import SignatureExpired, BadSignature

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), ".."),
    static_url_path=""
)

CORS(app)

# ================= DATABASE =================
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

def get_db():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT
    )

def init_db():
    try:
        conn = get_db()
        cursor = conn.cursor()
        # Ensure 'users' table has all required columns including reset_token
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(150) UNIQUE,
                password VARCHAR(255),
                reset_token VARCHAR(255) DEFAULT NULL
            )
        """)
        conn.commit()
        conn.close()
        print("✅ Database initialized and schema verified.")
    except Exception as e:
        print("❌ DATABASE INITIALIZATION ERROR:", e)

# Run initialization immediately when the app starts
init_db()

# ================= ROUTES =================

@app.route("/")
def home():
    return app.send_static_file("index.html")

@app.route("/login", methods=["GET"])
def login_page():
    return app.send_static_file("pages/login.html")

@app.route("/signup", methods=["GET"])
def signup_page():
    return app.send_static_file("pages/signup.html")

@app.route("/forgot-page", methods=["GET"])
def forgot_page():
    return app.send_static_file("pages/forgot.html")

@app.route("/reset-page", methods=["GET"])
def reset_page():
    return app.send_static_file("pages/reset.html")

# Fallback routes for .html legacy links
@app.route("/login.html")
def login_html():
    return login_page()

@app.route("/signup.html")
def signup_html():
    return signup_page()

@app.route("/index.html")
def index_html():
    return home()

# ================= AUTH APIs =================

@app.route("/signup", methods=["POST"])
def signup():
    try:
        conn = get_db()
        return register_user(conn)
    except Exception as e:
        print("Signup error:", e)
        return jsonify({"message": f"Signup failed: {str(e)}"}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        conn = get_db()
        return login_user(conn)
    except Exception as e:
        print("Login error:", e)
        return jsonify({"message": "Login failed"}), 500

@app.route("/forgot", methods=["POST"])
def forgot():
    try:
        conn = get_db()
        return forgot_password(conn)
    except Exception as e:
        print("Forgot error:", e)
        return jsonify({"message": "Error processing forgot password"}), 500

@app.route("/reset", methods=["POST"])
def reset():
    try:
        conn = get_db()
        return reset_password(conn)
    except Exception as e:
        print("Reset error:", e)
        return jsonify({"message": "Error resetting password"}), 500

@app.route("/save", methods=["POST"])
def save():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"message": "No data"}), 400

        conn = get_db()
        cursor = conn.cursor()

        for item in data:
            # Note: Ensure panchanga_updatedenglish table exists in your DB
            cursor.execute("INSERT INTO panchanga_updatedenglish (date) VALUES (%s)", (item.get("date"),))

        conn.commit()
        return jsonify({"message": "Saved"})
    except Exception as e:
        print("Save error:", e)
        return jsonify({"message": "Error saving data"}), 500

# ================= START =================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"🚀 Starting app on port {port}...")
    from waitress import serve
    serve(app, host="0.0.0.0", port=port)