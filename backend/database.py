"""
SasyaVedha - SQLite-backed authentication storage.

Handles the users and sessions tables used by the auth system in app.py.
Uses werkzeug's password hashing (PBKDF2) so plaintext passwords are never stored.
"""
import sqlite3
import secrets
import os
from datetime import datetime, timedelta
from pathlib import Path

from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = Path(__file__).parent / "sasyavedha.db"

SESSION_LIFETIME_HOURS = 24
VALID_ROLES = {"owner", "admin", "manager", "supervisor", "user"}
SEED_ADMIN_EMAIL = "admin@sasyavedha.com"
SEED_ADMIN_USERNAME = "admin"


def get_db():
    """Open a new connection with row access by column name."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create the users and sessions tables if they don't already exist."""
    conn = get_db()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TEXT NOT NULL,
                last_login TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS farms (
                id TEXT PRIMARY KEY,
                owner_id TEXT NOT NULL,
                name TEXT NOT NULL,
                location TEXT NOT NULL,
                area_hectares REAL NOT NULL CHECK(area_hectares > 0),
                field_count INTEGER NOT NULL DEFAULT 0 CHECK(field_count >= 0),
                crops_json TEXT NOT NULL DEFAULT '[]',
                status TEXT NOT NULL DEFAULT 'Active',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)")}
        if "is_active" not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1")

        admin = conn.execute("SELECT id FROM users WHERE email = ?", (SEED_ADMIN_EMAIL,)).fetchone()
        if admin is None:
            now = datetime.now().isoformat()
            conn.execute(
                """INSERT INTO users (id, username, email, password_hash, role, created_at, last_login, is_active)
                   VALUES (?, ?, ?, ?, 'admin', ?, ?, 1)""",
                (secrets.token_hex(16), SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL,
                 generate_password_hash(os.environ.get("SASYAVEDHA_ADMIN_PASSWORD", "Admin@123")), now, now),
            )
        conn.commit()
    finally:
        conn.close()


def _user_row_to_dict(row):
    if row is None:
        return None
    return {
        "id": row["id"],
        "username": row["username"],
        "name": row["username"],  # alias kept for components that read user.name
        "email": row["email"],
        "role": row["role"],
        "created_at": row["created_at"],
        "last_login": row["last_login"],
        "is_active": bool(row["is_active"]) if "is_active" in row.keys() else True,
    }


def create_user(username, email, password):
    """Create a new user with a securely hashed password.

    Returns (user_dict, error_message). On success error_message is None.
    """
    conn = get_db()
    try:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ? OR username = ?",
            (email, username),
        ).fetchone()
        if existing:
            return None, "An account with that email or username already exists"

        user_id = secrets.token_hex(16)
        password_hash = generate_password_hash(password)
        created_at = datetime.now().isoformat()
        role = "user"

        conn.execute(
            """INSERT INTO users (id, username, email, password_hash, role, created_at, last_login, is_active)
               VALUES (?, ?, ?, ?, ?, ?, ?, 1)""",
            (user_id, username, email, password_hash, role, created_at, created_at),
        )
        conn.commit()

        return _user_row_to_dict({
            "id": user_id, "username": username, "email": email,
            "role": role, "created_at": created_at, "last_login": created_at, "is_active": True,
        }), None
    finally:
        conn.close()


def verify_user_credentials(identifier, password):
    """Look up a user by email or username and verify the password.

    Returns (user_dict, error_message).
    """
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            (identifier, identifier),
        ).fetchone()
        if row is None:
            return None, "No account found with that email/username"

        if not row["is_active"]:
            return None, "This account has been deactivated"

        if not check_password_hash(row["password_hash"], password):
            return None, "Incorrect password"

        now = datetime.now().isoformat()
        conn.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, row["id"]))
        conn.commit()

        user = _user_row_to_dict(row)
        user["last_login"] = now
        return user, None
    finally:
        conn.close()


def get_user_by_id(user_id):
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return _user_row_to_dict(row)
    finally:
        conn.close()


def create_session(user_id):
    conn = get_db()
    try:
        token = secrets.token_hex(32)
        created_at = datetime.now()
        expires_at = created_at + timedelta(hours=SESSION_LIFETIME_HOURS)
        conn.execute(
            "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
            (token, user_id, created_at.isoformat(), expires_at.isoformat()),
        )
        conn.commit()
        return token
    finally:
        conn.close()


def get_session_user(token):
    """Return the user dict for a valid, non-expired session token, else None."""
    if not token:
        return None
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM sessions WHERE token = ?", (token,)).fetchone()
        if row is None:
            return None
        if datetime.fromisoformat(row["expires_at"]) < datetime.now():
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
            conn.commit()
            return None

        user_row = conn.execute("SELECT * FROM users WHERE id = ?", (row["user_id"],)).fetchone()
        return _user_row_to_dict(user_row)
    finally:
        conn.close()


def delete_session(token):
    conn = get_db()
    try:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
    finally:
        conn.close()


def list_users():
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
        return [_user_row_to_dict(row) for row in rows]
    finally:
        conn.close()


def update_user_access(user_id, role=None, is_active=None):
    if role is not None and role not in VALID_ROLES:
        return None, "Invalid role"
    if role is None and is_active is None:
        return None, "No user changes were supplied"
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if row is None:
            return None, "User not found"
        updates, values = [], []
        if role is not None:
            updates.append("role = ?")
            values.append(role)
        if is_active is not None:
            updates.append("is_active = ?")
            values.append(1 if is_active else 0)
        values.append(user_id)
        conn.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", values)
        conn.commit()
        return _user_row_to_dict(conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()), None
    finally:
        conn.close()


def _farm_to_dict(row):
    import json
    return {"id": row["id"], "name": row["name"], "location": row["location"], "area": row["area_hectares"], "fields": row["field_count"], "crops": json.loads(row["crops_json"]), "status": row["status"], "created_at": row["created_at"], "updated_at": row["updated_at"]}


def list_farms(owner_id):
    conn = get_db()
    try:
        return [_farm_to_dict(row) for row in conn.execute("SELECT * FROM farms WHERE owner_id = ? ORDER BY updated_at DESC", (owner_id,))]
    finally:
        conn.close()


def create_farm(owner_id, data):
    import json
    now, farm_id = datetime.now().isoformat(), secrets.token_hex(12)
    conn = get_db()
    try:
        conn.execute("INSERT INTO farms (id, owner_id, name, location, area_hectares, field_count, crops_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (farm_id, owner_id, data["name"], data["location"], data["area"], data["fields"], json.dumps(data["crops"]), data["status"], now, now))
        conn.commit()
        return _farm_to_dict(conn.execute("SELECT * FROM farms WHERE id = ?", (farm_id,)).fetchone())
    finally:
        conn.close()


def update_farm(owner_id, farm_id, data):
    import json
    now = datetime.now().isoformat()
    conn = get_db()
    try:
        conn.execute("UPDATE farms SET name = ?, location = ?, area_hectares = ?, field_count = ?, crops_json = ?, status = ?, updated_at = ? WHERE id = ? AND owner_id = ?", (data["name"], data["location"], data["area"], data["fields"], json.dumps(data["crops"]), data["status"], now, farm_id, owner_id))
        conn.commit()
        row = conn.execute("SELECT * FROM farms WHERE id = ? AND owner_id = ?", (farm_id, owner_id)).fetchone()
        return _farm_to_dict(row) if row else None
    finally:
        conn.close()
