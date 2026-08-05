from typing import Any
from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required

try:
    from database import db
    from models import Faculty, ActivityLog
except ImportError:
    from backend.database import db  # type: ignore
    from backend.models import Faculty, ActivityLog  # type: ignore

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

@profile_bp.route('/profile', methods=['GET'])
@login_required
def get_user_profile():
    """Gets currently logged-in user profile."""
    c_user: Any = current_user
    return jsonify(c_user.to_dict()), 200

@profile_bp.route('/profile', methods=['PUT'])
@login_required
def update_user_profile():
    """Self-service profile editor allowing any user (Faculty or HOD) to update Name, Email, Phone, Photo, and Password."""
    c_user: Any = current_user
    data = request.get_json() or {}
    faculty = c_user.faculty_profile

    # If user doesn't have a faculty profile record yet, auto-create one
    if not faculty:
        emp_id = f"HOD-{c_user.id:03d}" if c_user.role == 'HOD' else f"EMP-{c_user.id:03d}"
        full_name = data.get('full_name', c_user.username).strip()
        faculty = Faculty(
            user_id=c_user.id,
            employee_id=emp_id,
            full_name=full_name,
            designation='Head of Department' if c_user.role == 'HOD' else 'Faculty Member',
            email=c_user.email
        )
        db.session.add(faculty)
        db.session.flush()

    if 'full_name' in data and data['full_name'].strip():
        faculty.full_name = data['full_name'].strip()
    if 'phone_number' in data:
        faculty.phone_number = data['phone_number'].strip()
    if 'profile_photo' in data:
        faculty.profile_photo = data['profile_photo'].strip()

    if 'email' in data and data['email'].strip() and data['email'].strip().lower() != c_user.email:
        new_email = data['email'].strip().lower()
        c_user.email = new_email
        faculty.email = new_email

    if 'new_password' in data and data['new_password'].strip():
        new_pw = data['new_password'].strip()
        if len(new_pw) < 6:
            return jsonify({'error': 'Password must be at least 6 characters.'}), 400
        c_user.set_password(new_pw)

    act_log = ActivityLog(
        user_id=c_user.id,
        username=c_user.username,
        action='Profile Updated',
        details=f'User {c_user.username} updated profile photo and details.'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully.',
        'user': c_user.to_dict()
    }), 200
