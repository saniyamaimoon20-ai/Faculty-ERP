from typing import Any
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, current_user, login_required

try:
    from database import db
    from models import User, Faculty, LoginLog, ActivityLog
except ImportError:
    from backend.database import db  # type: ignore
    from backend.models import User, Faculty, LoginLog, ActivityLog  # type: ignore

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/activate-account', methods=['POST'])
def activate_account():
    """First-time password creation endpoint for seeded users."""
    data = request.get_json() or {}
    identifier = data.get('identifier', '').strip()  # Username, Email, or Employee ID
    new_password = data.get('new_password', '').strip()

    if not identifier or not new_password:
        return jsonify({'error': 'Please provide your Username/Email/Employee ID and a new password.'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    # Search by Username, Email, or Employee ID
    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user:
        faculty = Faculty.query.filter_by(employee_id=identifier).first()
        if faculty:
            user = faculty.user

    if not user:
        return jsonify({'error': 'Account not found. Please check your details or contact HOD.'}), 404

    user.set_password(new_password)
    db.session.commit()

    # Log Activity
    log = ActivityLog(
        user_id=user.id,
        username=user.username,
        action='Account Activated / Password Set',
        details=f'Initial password created for user {user.username}'
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'message': 'Password created successfully! You can now log in.',
        'username': user.username
    }), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint for HOD and Faculty."""
    data = request.get_json() or {}
    username_or_email = data.get('username', '').strip()
    password = data.get('password', '').strip()
    remember = data.get('remember', False)

    # Flexible case-insensitive lookup by Username, Email, or Employee ID
    user = User.query.filter(
        (User.username.ilike(username_or_email)) | 
        (User.email.ilike(username_or_email))
    ).first()

    if not user:
        faculty = Faculty.query.filter(Faculty.employee_id.ilike(username_or_email)).first()
        if faculty:
            user = faculty.user

    if not user:
        return jsonify({'error': 'Invalid username or password.'}), 401

    if not user.is_password_set:
        return jsonify({
            'error': 'First-time user detected. Please create your password using the "Activate Account" button first.',
            'requires_activation': True,
            'username': user.username
        }), 403

    if not user.check_password(password):
        return jsonify({'error': 'Invalid username or password.'}), 401

    if user.status != 'Active':
        return jsonify({'error': 'Your account is disabled. Please contact the HOD.'}), 403

    # Authenticate via Flask-Login
    login_user(user, remember=remember)

    # Capture Login Log details
    user_agent = request.headers.get('User-Agent', 'Browser / Unknown')
    ip_address = request.remote_addr or '127.0.0.1'
    
    login_log = LoginLog(
        user_id=user.id,
        username=user.username,
        login_time=datetime.now(timezone.utc),
        ip_address=ip_address,
        browser=user_agent[:90],
        device='Desktop / Mobile Web'
    )
    db.session.add(login_log)
    db.session.flush()
    session['login_log_id'] = login_log.id

    # Log Activity
    act_log = ActivityLog(
        user_id=user.id,
        username=user.username,
        action='Login',
        details=f'User {user.username} ({user.role}) logged in successfully.'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({
        'message': 'Login successful.',
        'user': user.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout endpoint."""
    user: Any = current_user
    user_id = user.id
    username = user.username

    # Update session duration in LoginLog if present
    log_id = session.get('login_log_id')
    if log_id:
        log = db.session.get(LoginLog, log_id)
        if log:
            log.logout_time = datetime.now(timezone.utc)
            duration_secs = (log.logout_time - log.login_time).total_seconds()
            mins = int(duration_secs // 60)
            secs = int(duration_secs % 60)
            log.session_duration = f"{mins}m {secs}s"

    act_log = ActivityLog(
        user_id=user_id,
        username=username,
        action='Logout',
        details=f'User {username} logged out.'
    )
    db.session.add(act_log)
    db.session.commit()

    logout_user()
    session.pop('login_log_id', None)

    return jsonify({'message': 'Logged out successfully.'}), 200


@auth_bp.route('/session', methods=['GET'])
def get_session():
    """Returns authenticated user info or unauthenticated status."""
    user: Any = current_user
    if user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': user.to_dict()
        }), 200
    return jsonify({
        'authenticated': False,
        'user': None
    }), 200


@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Allows user to change their password."""
    user: Any = current_user
    data = request.get_json() or {}
    current_pw = data.get('current_password', '')
    new_pw = data.get('new_password', '')

    if not current_pw or not new_pw:
        return jsonify({'error': 'Current and new password are required.'}), 400

    if not user.check_password(current_pw):
        return jsonify({'error': 'Incorrect current password.'}), 400

    if len(new_pw) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long.'}), 400

    user.set_password(new_pw)
    
    act_log = ActivityLog(
        user_id=user.id,
        username=user.username,
        action='Password Changed',
        details=f'User {user.username} updated their password.'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({'message': 'Password updated successfully.'}), 200
