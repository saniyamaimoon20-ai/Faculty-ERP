from typing import Any
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user

try:
    from database import db
    from models import Department, Subject
except ImportError:
    from backend.database import db  # type: ignore
    from backend.models import Department, Subject  # type: ignore

dropdowns_bp = Blueprint('dropdowns', __name__, url_prefix='/api')

@dropdowns_bp.route('/departments', methods=['GET'])
@login_required
def get_departments():
    """Returns dynamic departmental list (Locked strictly to Cyber Security)."""
    depts = Department.query.all()
    return jsonify([d.to_dict() for d in depts]), 200

@dropdowns_bp.route('/subjects', methods=['GET'])
@login_required
def get_subjects():
    """Returns dynamic subject catalog for Cyber Security Department."""
    subjects = Subject.query.order_by(Subject.semester.asc(), Subject.subject_code.asc()).all()
    return jsonify([s.to_dict() for s in subjects]), 200

@dropdowns_bp.route('/subjects', methods=['POST'])
@login_required
def add_subject():
    """Add a new subject (HOD only)."""
    c_user: Any = current_user
    if c_user.role != 'HOD':
        return jsonify({'error': 'Access denied. HOD privilege required.'}), 403

    data = request.get_json() or {}
    code = data.get('subject_code', '').strip().upper()
    name = data.get('subject_name', '').strip()
    try:
        sem = int(data.get('semester', 5))
    except (ValueError, TypeError):
        sem = 5

    try:
        credits = int(data.get('credits', 3))
    except (ValueError, TypeError):
        credits = 3

    if not code or not name or not short:
        return jsonify({'error': 'Subject Code, Name, and Short Name are required.'}), 400

    if Subject.query.filter_by(subject_code=code).first():
        return jsonify({'error': f'Subject code "{code}" already exists.'}), 400

    dept = Department.query.first()
    new_sub = Subject(
        department_id=dept.id if dept else 1,
        subject_code=code,
        subject_name=name,
        short_name=short,
        semester=sem,
        credits=credits
    )
    db.session.add(new_sub)
    db.session.commit()

    return jsonify({
        'message': 'Subject added successfully.',
        'subject': new_sub.to_dict()
    }), 201
