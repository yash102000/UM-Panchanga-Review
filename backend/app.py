import sys, io, os, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from auth import register_user, login_user, forgot_password, reset_password, token_serializer
from itsdangerous import SignatureExpired, BadSignature

app = Flask(__name__,
            static_folder=os.path.join(os.path.dirname(__file__), ".."),
            static_url_path="")
CORS(app)


DB_HOST            = os.getenv("DB_HOST", "panchanga-db.cxgu0ko8m1a7.ap-south-1.rds.amazonaws.com")
DB_USER            = os.getenv("DB_USER", "admin")
DB_PASSWORD        = os.getenv("DB_PASSWORD", "Pthinks123")
DB_NAME            = os.getenv("DB_NAME", "panchanga_db")
DB_PORT            = int(os.getenv("DB_PORT", "3306"))
DB_CHARSET         = os.getenv("DB_CHARSET", "utf8mb4")
DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", "5"))

@app.route("/reset-page")
def reset_page():
    return app.send_static_file("pages/reset.html")

TABLE_MAP = {
    "English":  "panchanga_updatedenglish",
    "Kannada":  "panchanga_updatedkannada",
    "Telugu":   "panchanga_updatedtelugu",
    "Tamil":    "panchanga_updatedtamil",
    "Sanskrit": "panchanga_updatedsanskrit",
    "Marathi":  "panchanga_updatedmarathi"
}
TABLE_MAP_ENV = os.getenv("TABLE_MAP")
if TABLE_MAP_ENV:
    try:
        TABLE_MAP = json.loads(TABLE_MAP_ENV)
    except Exception as exc:
        print(f"[WARN] Failed to parse TABLE_MAP env, using defaults. Details: {exc}")

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
    """Auto-create the users table if it doesn't exist yet."""
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                name         VARCHAR(100)  NOT NULL,
                email        VARCHAR(150)  NOT NULL UNIQUE,
                password     VARCHAR(255)  NOT NULL,
                reset_token  VARCHAR(255)  DEFAULT NULL
            )
        """)
        conn.commit()
        print("[OK] Database ready - users table OK.")
    except Exception as e:
        print(f"[WARN] DB init warning: {e}")
        print("    (The app will still start, but login/signup needs the DB.)")
    finally:
        if conn:
            conn.close()

@app.route("/")
def home():
    return "API Running"



@app.route("/signup", methods=["POST"])
def signup():
    conn = None
    try:
        conn = get_db()
        return register_user(conn)
    except pymysql.err.OperationalError:
        return jsonify({"message": "Database connection failed. Please try again."}), 503
    except Exception as e:
        print("Signup error:", e)
        return jsonify({"message": "Server error during signup."}), 500
    finally:
        if conn:
            conn.close()

@app.route("/login", methods=["POST"])
def login():
    conn = None
    try:
        conn = get_db()
        return login_user(conn)
    except pymysql.err.OperationalError:
        return jsonify({"status": "fail", "message": "Database connection failed. Please try again."}), 503
    except Exception as e:
        print("Login error:", e)
        return jsonify({"status": "fail", "message": "Server error during login."}), 500
    finally:
        if conn:
            conn.close()

@app.route("/forgot", methods=["POST"])
def forgot():
    conn = None
    try:
        conn = get_db()
        return forgot_password(conn)
    except pymysql.err.OperationalError:
        return jsonify({"message": "Database connection failed. Please try again."}), 503
    except Exception as e:
        print("Forgot error:", e)
        return jsonify({"message": "Server error. Please try again."}), 500
    finally:
        if conn:
            conn.close()

@app.route("/reset", methods=["POST"])
def reset():
    conn = None
    try:
        conn = get_db()
        return reset_password(conn)
    except pymysql.err.OperationalError:
        return jsonify({"message": "Database connection failed. Please try again."}), 503
    except Exception as e:
        print("Reset error:", e)
        return jsonify({"message": "Server error. Please try again."}), 500
    finally:
        if conn:
            conn.close()

@app.route("/save", methods=["POST"])
def save():
    conn = None
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"message": "Missing or invalid authorization token."}), 401
            
        token = auth_header.split(" ")[1]
        try:
            # Token valid for 24 hours
            email = token_serializer.loads(token, salt="auth-salt", max_age=86400)
        except SignatureExpired:
            return jsonify({"message": "Session expired. Please log in again."}), 401
        except BadSignature:
            return jsonify({"message": "Invalid token. Please log in again."}), 401

        data = request.get_json(force=True, silent=True)

        if not data:
            return jsonify({"message": "No data received."}), 400

        language = data[0].get("language")

        if language not in TABLE_MAP:
            return jsonify({"message": "Invalid language selected."}), 400

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
        return jsonify({"message": f"Saved in {table} successfully!"})

    except pymysql.err.OperationalError:
        return jsonify({"message": "Database connection failed. Please try again."}), 503
    except Exception as e:
        print("Save error:", e)
        return jsonify({"message": "Error saving data. Please try again."}), 500
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    init_db()
    from waitress import serve
    print("Starting production server with Waitress on port 5000...")
    serve(app, host="0.0.0.0", port=5000)