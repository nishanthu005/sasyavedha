"""Session-based authentication routes."""
import re
from functools import wraps
from flask import Blueprint, g, jsonify, request
import database as db

auth_bp = Blueprint('auth', __name__)
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        header = request.headers.get('Authorization', '')
        token = header[7:] if header.startswith('Bearer ') else header
        user = db.get_session_user(token) if token else None
        if not user:
            return jsonify(success=False, message='Authentication required'), 401
        g.user = user
        return view(*args, **kwargs)
    return wrapped


def roles_required(*roles):
    """Require an authenticated user with one of the supplied roles."""
    def decorator(view):
        @wraps(view)
        @login_required
        def wrapped(*args, **kwargs):
            if g.user["role"] not in roles:
                return jsonify(success=False, message="You do not have permission to perform this action"), 403
            return view(*args, **kwargs)
        return wrapped
    return decorator


@auth_bp.post('/signup')
def signup():
    data = request.get_json(silent=True) or {}
    username, email, password = data.get('username', '').strip(), data.get('email', '').strip().lower(), data.get('password', '')
    if not username or not email or not password:
        return jsonify(success=False, message='Username, email and password are required'), 400
    if len(username) < 3 or len(password) < 6 or not EMAIL_RE.match(email):
        return jsonify(success=False, message='Use a valid email, a 3-character username, and a 6-character password'), 400
    user, error = db.create_user(username, email, password)
    if error:
        return jsonify(success=False, message=error), 409
    return jsonify(success=True, user=user, session_token=db.create_session(user['id'])), 201


@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True) or {}
    identifier = (data.get('email') or data.get('username') or '').strip().lower()
    user, error = db.verify_user_credentials(identifier, data.get('password', ''))
    if error:
        return jsonify(success=False, message=error), 401
    return jsonify(success=True, user=user, session_token=db.create_session(user['id']))


@auth_bp.post('/logout')
def logout():
    token = request.headers.get('Authorization', '').removeprefix('Bearer ')
    if token:
        db.delete_session(token)
    return jsonify(success=True, message='Logged out successfully')


@auth_bp.get('/verify')
def verify():
    token = request.headers.get('Authorization', '').removeprefix('Bearer ')
    user = db.get_session_user(token) if token else None
    if not user:
        return jsonify(success=False, message='Invalid session'), 401
    return jsonify(success=True, user=user)


@auth_bp.get('/users')
@roles_required('owner', 'admin')
def users():
    return jsonify(success=True, users=db.list_users())


@auth_bp.put('/users/<user_id>')
@roles_required('owner', 'admin')
def update_user(user_id):
    data = request.get_json(silent=True) or {}
    target = db.get_user_by_id(user_id)
    if not target:
        return jsonify(success=False, message='User not found'), 404

    role = str(data['role']).lower() if 'role' in data else None
    is_active = data.get('is_active')
    if is_active is not None and not isinstance(is_active, bool):
        return jsonify(success=False, message='is_active must be true or false'), 400

    # Owners manage the team but may not take control of privileged accounts.
    if g.user['role'] == 'owner' and (target['role'] in ('owner', 'admin') or role in ('owner', 'admin')):
        return jsonify(success=False, message='Only an admin can manage owner or admin access'), 403

    updated, error = db.update_user_access(user_id, role, is_active)
    if error:
        return jsonify(success=False, message=error), 400
    return jsonify(success=True, user=updated)
