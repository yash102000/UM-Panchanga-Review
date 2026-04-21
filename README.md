# UM Panchanga Review Panel - Full Documentation

## Project Overview
The **UM Panchanga Review Panel** is a specialized web application designed for the precise, targeted entry and review of Panchanga data. Unlike traditional grid-based spreadsheets, this tool focus on a "Targeted Worklist" model, allowing users to pick specific dates and specific fields to update in a single, efficient operation.

---

## Technical Stack
*   **Backend**: Python (Flask) with Waitress (WSGI Server).
*   **Database**: MySQL (hosted on AWS/Local).
*   **Frontend**: Vanilla JavaScript (ES6+), HTML5, and Modern CSS3.
*   **Deployment**: Optimized for Render (backend) and Static Hosting (frontend).

---

## Build Evolution: From Concept to Production

### Phase 1: Range-Based Grid (Initial Concept)
The project started as a standard grid view where users would fetch a range of dates and see an massive table of all data. While functional, this was found to be inefficient for making specific, scattered corrections.

### Phase 2: Targeted Worklist Pivot
Based on user feedback, the architecture pivoted to the **Targeted Worklist** model. 
*   **The Innovation**: Users select a single date and a checklist of fields.
*   **The Workflow**: Instead of searching for a cell, the user "creates" the task, adding it to a review list.

### Phase 3: Multi-Table Isolation & "Single-Shot" Logic
To ensure total clarity, the UI was refined to generate **independent tables** for each date selection.
*   Verified that Date A's fields do not "mix" with Date B's fields.
*   Implemented the "Single-Shot" submission, allowing the user to fill out multiple isolated tables and submit them all to the backend in one network request.

### Phase 4: Mobile-First Overhaul
Recognizing that reviewers often work on the go, the entire styling was rebuilt to be responsive:
*   Added Viewport scaling.
*   Implemented a responsive grid that stacks on small screens.
*   Optimized touch targets and input sizes for mobile browsers.

---

## Key Features

### 1. Targeted Data Entry
Select from 11 core Panchanga fields (Rutu, Masa, Thithi, Nakshatra, etc.) for any specific date. The UI dynamically generates only the inputs you need.

### 2. Multi-Table Worklist
Each session's selections are isolated into their own horizontal tables. This keeps your Workspace clean and prevents entry errors.

### 3. Smart Persistence (UPSERT)
The backend uses `INSERT ON DUPLICATE KEY UPDATE` logic. This means if a record for a specific date already exists, it is updated; if not, it is created automatically.

### 4. Comprehensive Authentication
A full auth flow including:
*   Secure Login & Signup.
*   JWT-based Token handling.
*   Forgot Password & Reset Token email flow (via `itsdangerous` and SMTP).

---

## Setup & Local Development

### Prerequisites
*   Python 3.8+
*   MySQL Database
*   `.env` file with `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

### Running Locally
1.  Clone the repository.
2.  Install dependencies: `pip install -r requirements.txt`.
3.  Run **`START.bat`**. This script automates:
    *   Starting the Flask Backend on port **5000**.
    *   (Optional) Setting up an **ngrok** tunnel for external access.
4.  Open `dashboard.html` in your browser.

---

## API Reference

### `POST /save`
Saves or updates Panchanga data.
*   **Payload**: An array of objects.
*   **Structure**: `{ "language": "...", "date": "..", "month": "..", "year": "..", "update_fields": ["field1"], "field1": "value" }`

### `POST /login` / `POST /signup`
Handles user authentication and generates session tokens.

---

## Project Status: Production Ready
The project is currently optimized for production deployment on **Render**. It features a robust, mobile-responsive frontend and a dynamic, scalable backend.
