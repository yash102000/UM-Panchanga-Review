# UM Panchanga Review Panel - Complete Project Documentation

## 1. Project Overview
The **UM Panchanga Review Panel** is a full-stack, secure web application designed to allow users to authenticate securely and submit complex Panchanga (Indian Calendar) data across multiple languages.

---

## 2. Frontend: HTML Files (`/pages` & Root)

The application uses standard structural HTML pages. They are broken down into Authentication pages and the Main Application page.

- **`pages/login.html`**: The entry point. Contains a form with an email and password input. It routes to the `loginForm` submission listener in the Javascript payload.
- **`pages/signup.html`**: Collects `First Name`, `Last Name`, `Email`, and `Password`. It restricts submission if fields are missing.
- **`pages/forgot.html`**: Contains an email field aimed at initiating the password reset process. Submission sends a request to the backend to generate an SMTP email.
- **`pages/reset.html`**: The landing page users arrive at when they click the reset link in their email. It contains two password fields (New and Confirm). It listens to the URL `?token=` parameter to validate the reset.
- **`review_page.html` (Root)**: The core dashboard. It contains:
  - An **Authentication Guard** inline script that prevents access if `localStorage.getItem("isLoggedIn")` is false.
  - A control panel to select the target **Language** and **Date Bounds** (From/To).
  - A dynamic table `<tbody>` where Javascript generates calendar entry rows dynamically.
  - Action buttons (`Submit`, `Clear`, `Delete`).

---

## 3. Frontend: CSS Files (`/css`)

- **`auth.css`**: Powers the visual identity of all pages inside `/pages`.
  - It utilizes a clean `linear-gradient(135deg, #eae5d7, #e6e9f0)` background.
  - Uses flexbox (`display: flex; justify-content: center; align-items: center;`) on `.auth-container` to perfectly center the authentication cards vertically and horizontally.
  - Controls inputs, hover states, and smooth `.btn-primary` transitions.
- **`style.css`**: Powers `review_page.html`. It handles the complex grid layout required for rendering the massive 20-column Panchanga data table, ensuring the table overflows cleanly with scrollbars instead of breaking the layout.

---

## 4. Frontend: JavaScript Files (`/js`)

The Javascript is cleanly chunked into functional modules:

- **`config.js`**: Runs before anything else. It normalizes and sets the `window.API_BASE` (defaulting to `http://127.0.0.1:5000`). It establishes the globally enforced Date Bounds (`PANCHANGA_DATE_MIN` and `MAX`) to restrict what dates can be generated, applying them natively to HTML inputs as `min=""` and `max=""`.
- **`auth.js`**: Handles identity requests.
  - Features an elegant dynamic popup injector (`showErrorPopup()`) running CSS keyframes for smooth error warnings on failed logins.
  - Connects to HTML by hijacking form submissions (`e.preventDefault()`).
  - Calls exactly to `/login`, `/signup`, `/forgot`, and `/reset` on the backend API.
  - Saves the resulting Secure JWT into `localStorage.setItem("authToken")`.
- **`app.js` & `utils.js`**: Handles the UI behavior of `review_page.html`, managing dynamic row creation (building TR/TD nodes on the fly when dates are selected) and UI cleanup.
- **`panchanga.js`**: Contains object definitions/prototypes. It builds the `Panchanga_Database` object schema natively in JS so the payloads sent to the backend perfectly match what the backend expects.
- **`submit.js`**: The heaviest file. Contains `submitData()`.
  1. Searches the HTML table for rows marked with `.rowCheckbox` that are `checked`.
  2. Ensures ALL inputs inside the selected rows are filled (length > 16).
  3. Rejects with an alert if validations fail.
  4. Packs valid rows into an array of `Panchanga_Database` objects.
  5. Injects the Bearer token: `"Authorization": "Bearer " + token`.
  6. Submits mapping payload to the `API/save` route.

---

## 5. Backend App Architecture (`backend/app.py`)

This file connects your Frontend cleanly to the AWS MySQL Database.
1. **Initializes the DB**: Uses `get_db()` and `init_db()` leveraging `PyMySQL`. It ensures the `users` table always exists before allowing traffic.
2. **Defines Language Tables**: Uses a dictionary (`TABLE_MAP`) mapping strings like "English" to their respective DB table names (`panchanga_updatedenglish`).
3. **Serves API Routes**: Maps API requests (like `/login` or `/save`) mapped through `.get_json()`. The `/save` function executes complex SQL mapping by generating `INSERT INTO` queries parametrically to prevent SQL injection.
4. **Starts the Server**: Wraps the Flask application in a **Waitress** WSGI wrapper binding to `0.0.0.0:5000` to run asynchronously without Flask development warnings.

---

## 6. Security with Auth.py (`backend/auth.py`)

This handles all Authentication flows. Below is the explanation merged directly with the code:

### Registration (`register_user`)
```python
def register_user(conn):
    data   = request.get_json(force=True, silent=True)
    name   = data.get("name", "").strip()
    email  = data.get("email", "").strip()
    password = data.get("password", "").strip()

    # Query Database to check for duplicates
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    
    # Generate a secure mathematical hash so plaintext passwords are NEVER saved.
    hashed_password = generate_password_hash(password)

    # Insert into database securely.
    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed_password)
    )
    conn.commit()
    return jsonify({"message": "Registered successfully! Please log in."}), 201
```

### Login & Token Generation (`login_user`)
```python
def login_user(conn):
    data     = request.get_json(force=True, silent=True)
    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()

    # The DB stores the hashed password in column [3]. We securely verify it.
    if user and check_password_hash(user[3], password):
        
        # Generates a JSON Web Token that expires automatically based on the APP_SECRET
        auth_token = token_serializer.dumps(email, salt="auth-salt")
        
        return jsonify({
            "status": "success", 
            "message": "Login successful",
            "token": auth_token
        }), 200
```

### Password Reset Request (`forgot_password`)
```python
def forgot_password(conn):
    # Generates a completely random cryptographic string
    token = str(uuid.uuid4())
    
    # Saves string to DB so we can verify the link later
    cursor.execute("UPDATE users SET reset_token=%s WHERE email=%s", (token, email))

    # Fires our SMTP function to send an HTML-styled email to the user
    send_reset_email(email, token)
```

### Setting the New Password (`reset_password`)
```python
def reset_password(conn):
    # Overwrites DB payload using the Token as the identifying constraint instead of Email
    # Safely resets the token back to NULL so the email link can NEVER be reused.
    cursor.execute(
        "UPDATE users SET password=%s, reset_token=NULL WHERE reset_token=%s",
        (hashed_password, token)
    )
```

---

## 7. Version Control (Git Deployment)

To deploy the code to a remote code repository (Like GitHub/GitLab), a specific Git Workflow was utilized. The server uses `.gitignore` to block malicious payload pushes and caches (like `.db` files and `__pycache__`).

**The command sequence executed manually to deploy the system was:**

1. `git init` - Initializes an empty Git repository locally on the computer.
2. `git add .` - Scans all un-ignored files in the repository and stages them for the save.
3. `git commit -m "Initial commit"` - Compiles all staged files into a version-controlled snapshot checkpoint.
4. `git branch -M main` - Sets the foundational primary branch to commonly be called `main`.
5. `git remote add original https://github.com/yash102000/UM-Panchanga-Review.git` - Binds the local computer's repository directly to exactly where it lives on GitHub's structural servers securely under the alias `original`.
6. `git push -u original main` - Final execution string that authenticates and safely pushes local memory sequentially up into GitHub.
