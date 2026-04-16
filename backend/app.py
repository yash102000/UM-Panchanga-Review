import sys, io, os, socket
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from auth import register_user, login_user, forgot_password, reset_password, token_serializer
from itsdangerous import SignatureExpired, BadSignature
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # Use environment variables directly if dotenv not installed
app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), ".."),
    static_url_path=""
)
CORS(app)

# ✅ DATABASE CONFIG (from environment variables)
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_CHARSET = os.getenv("DB_CHARSET", "utf8mb4")
DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", "5"))

TABLE_MAP = {
    "English":  "panchanga_updatedenglish",
    "Kannada":  "panchanga_updatedkannada",
    "Telugu":   "panchanga_updatedtelugu",
    "Tamil":    "panchanga_updatedtamil",
    "Sanskrit": "panchanga_updatedsanskrit",
    "Marathi":  "panchanga_updatedmarathi"
}

def get_db():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
        charset=DB_CHARSET,
        connect_timeout=DB_CONNECT_TIMEOUT
    )

def init_db():
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                reset_token VARCHAR(255) DEFAULT NULL
            )
        """)
        conn.commit()
        print("[OK] Database ready")
    except Exception as e:
        print(f"[WARN] DB init error: {e}")
    finally:
        if conn:
            conn.close()

@app.route("/")
def home():
    return app.send_static_file("pages/login.html")

@app.route("/reset-page")
def reset_page():
    return app.send_static_file("pages/reset.html")

@app.route("/signup", methods=["POST"])
def signup():
    conn = None
    try:
        conn = get_db()
        return register_user(conn)
    except Exception as e:
        print("Signup error:", e)
        return jsonify({"message": "Signup failed"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/login", methods=["POST"])
def login():
    conn = None
    try:
        conn = get_db()
        return login_user(conn)
    except Exception as e:
        print("Login error:", e)
        return jsonify({"message": "Login failed"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/forgot", methods=["POST"])
def forgot():
    conn = None
    try:
        conn = get_db()
        return forgot_password(conn)
    except Exception as e:
        print("Forgot error:", e)
        return jsonify({"message": "Error"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/reset", methods=["POST"])
def reset():
    conn = None
    try:
        conn = get_db()
        return reset_password(conn)
    except Exception as e:
        print("Reset error:", e)
        return jsonify({"message": "Error"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/save", methods=["POST"])
def save():
    conn = None
    try:
        data = request.get_json(force=True, silent=True)

        if not data:
            return jsonify({"message": "No data received"}), 400

        language = data[0].get("language")

        if language not in TABLE_MAP:
            return jsonify({"message": "Invalid language"}), 400

        table = TABLE_MAP[language]
        conn = get_db()
        cursor = conn.cursor()

        query = f"""
        INSERT INTO {table} (
            date, month, year,
            samvatsara, ayana, rutu, masa, masaniyamaka,
            paksha, tithi, calendarmark, vasara,
            nakshatra, yoga, karana,
            sunrise, sunset, shradhatithi, vishesha
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        for item in data:
            cursor.execute(query, (
                item.get("date"),
                item.get("month"),
                item.get("year"),
                item.get("samvatsara"),
                item.get("ayana"),
                item.get("rutu"),
                item.get("masa"),
                item.get("masaNiyamaka"),
                item.get("paksha"),
                item.get("thithi"),
                item.get("calendarmark"),
                item.get("vasara"),
                item.get("nakshatra"),
                item.get("yoga"),
                item.get("karana"),
                item.get("sunrise"),
                item.get("sunset"),
                item.get("shradhatithi"),
                item.get("todaysSpecial")
            ))

        conn.commit()
        return jsonify({"message": "Saved successfully"})

    except Exception as e:
        print("Save error:", e)
        return jsonify({"message": "Error saving data"}), 500
    finally:
        if conn:
            conn.close()

# ✅ CLEAN PRODUCTION START (for Render)
if __name__ == "__main__":
    print("Starting app...", flush=True)
    init_db()

    from waitress import serve

    port = int(os.environ.get("PORT", 10000))
    serve(app, host="0.0.0.0", port=port)