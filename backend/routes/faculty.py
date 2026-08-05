from typing import Any
from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from functools import wraps

try:
    from database import db
    from models import User, Faculty, Timetable, ActivityLog
except ImportError:
    from backend.database import db  # type: ignore
    from backend.models import User, Faculty, Timetable, ActivityLog  # type: ignore

faculty_bp = Blueprint('faculty', __name__, url_prefix='/api')

def hod_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        c_user: Any = current_user
        if c_user.role != 'HOD':
            return jsonify({'error': 'Access denied. HOD privilege required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

@faculty_bp.route('/faculty', methods=['GET'])
@login_required
def get_faculty_list():
    """Gets searchable, sortable, paginated faculty list."""
    search = request.args.get('search', '').strip()
    designation = request.args.get('designation', '').strip()
    status = request.args.get('status', '').strip()
    sort_by = request.args.get('sort_by', 'full_name')
    order = request.args.get('order', 'asc')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Faculty.query.join(User)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Faculty.full_name.ilike(search_filter)) |
            (Faculty.employee_id.ilike(search_filter)) |
            (Faculty.email.ilike(search_filter)) |
            (Faculty.phone_number.ilike(search_filter))
        )

    if designation:
        query = query.filter(Faculty.designation == designation)

    if status:
        query = query.filter(User.status == status)

    # Sorting
    if hasattr(Faculty, sort_by):
        column = getattr(Faculty, sort_by)
        query = query.order_by(column.asc() if order == 'asc' else column.desc())
    else:
        query = query.order_by(Faculty.full_name.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    faculty_list = [f.to_dict() for f in pagination.items]

    return jsonify({
        'faculty': faculty_list,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@faculty_bp.route('/faculty', methods=['POST'])
@hod_required
def add_faculty():
    """Add a new faculty member (HOD only)."""
    data = request.get_json() or {}

    employee_id = data.get('employee_id', '').strip()
    full_name = data.get('full_name', '').strip()
    gender = data.get('gender', 'Male').strip()
    designation = data.get('designation', '').strip()
    email = data.get('email', '').strip().lower()
    phone_number = data.get('phone_number', '').strip()
    qualification = data.get('qualification', '').strip()
    date_of_joining = data.get('date_of_joining', '').strip()
    biometric_device_id = data.get('biometric_device_id', '').strip()
    profile_photo = data.get('profile_photo', '').strip()

    if not employee_id or not full_name or not designation or not email:
        return jsonify({'error': 'Employee ID, Full Name, Designation, and Email are required fields.'}), 400

    # Check uniqueness
    if Faculty.query.filter_by(employee_id=employee_id).first():
        return jsonify({'error': f'Employee ID "{employee_id}" already exists.'}), 400

    if User.query.filter_by(email=email).first() or Faculty.query.filter_by(email=email).first():
        return jsonify({'error': f'Email "{email}" is already registered.'}), 400

    # Auto-generate username from employee_id or email prefix
    username = email.split('@')[0].replace('.', '_')
    if User.query.filter_by(username=username).first():
        username = f"{username}_{employee_id.replace('-', '_')}"

    # Create User
    new_user = User(
        username=username,
        email=email,
        role='Faculty',
        status='Active',
        is_password_set=False
    )
    db.session.add(new_user)
    db.session.flush()

    # Create Faculty Profile
    new_faculty = Faculty(
        user_id=new_user.id,
        employee_id=employee_id,
        full_name=full_name,
        gender=gender,
        department_name='Cyber Security',
        designation=designation,
        email=email,
        phone_number=phone_number,
        qualification=qualification,
        date_of_joining=date_of_joining,
        biometric_device_id=biometric_device_id or f"BIO-{employee_id}",
        profile_photo=profile_photo or f"https://api.dicebear.com/7.x/avataaars/svg?seed={employee_id}",
        weekly_workload=0
    )
    db.session.add(new_faculty)
    
    # Log Activity
    act_log = ActivityLog(
        user_id=current_user.id,
        username=current_user.username,
        action='Faculty Created',
        details=f'Created new faculty member: {full_name} ({employee_id})'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({
        'message': 'Faculty member added successfully.',
        'faculty': new_faculty.to_dict()
    }), 201


@faculty_bp.route('/faculty/<int:faculty_id>', methods=['GET'])
@login_required
def get_faculty_details(faculty_id):
    """Fetch complete details of a faculty member."""
    faculty = Faculty.query.get_or_404(faculty_id)
    
    # Get assigned timetables
    timetables = Timetable.query.filter_by(faculty_id=faculty.id).all()
    tt_list = [t.to_dict() for t in timetables]

    # Calculate assigned subjects unique list
    subjects_dict = {}
    for t in timetables:
        if t.subject:
            subjects_dict[t.subject.id] = t.subject.to_dict()

    assigned_subjects = list(subjects_dict.values())

    # Today's classes
    days_map = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday"}
    import datetime
    today_name = days_map.get(datetime.datetime.today().weekday(), "Monday")

    todays_classes = [t.to_dict() for t in timetables if t.day_of_week == today_name]

    data = faculty.to_dict()
    data['timetables'] = tt_list
    data['assigned_subjects'] = assigned_subjects
    data['todays_classes'] = todays_classes
    data['weekly_workload'] = len(timetables)

    return jsonify(data), 200


@faculty_bp.route('/faculty/<int:faculty_id>', methods=['PUT'])
@login_required
def update_faculty(faculty_id):
    """Update faculty profile. HOD can update all fields; Faculty can update own contact info."""
    c_user: Any = current_user
    faculty = Faculty.query.get_or_404(faculty_id)

    data = request.get_json() or {}

    # Access check: HOD, self, or updating profile_photo
    is_photo_update = 'profile_photo' in data
    if c_user.role != 'HOD' and (not c_user.faculty_profile or c_user.faculty_profile.id != faculty.id) and not is_photo_update:
        return jsonify({'error': 'Unauthorized to edit this profile.'}), 403

    if c_user.role == 'HOD':
        # HOD can update everything
        if 'full_name' in data:
            faculty.full_name = data['full_name'].strip()
        if 'designation' in data:
            faculty.designation = data['designation'].strip()
        if 'gender' in data:
            faculty.gender = data['gender'].strip()
        if 'qualification' in data:
            faculty.qualification = data['qualification'].strip()
        if 'date_of_joining' in data:
            faculty.date_of_joining = data['date_of_joining'].strip()
        if 'biometric_device_id' in data:
            faculty.biometric_device_id = data['biometric_device_id'].strip()
        if 'status' in data and faculty.user:
            faculty.user.status = data['status']

    # Both HOD and self can update contact & photo
    if 'phone_number' in data:
        faculty.phone_number = data['phone_number'].strip()
    if 'profile_photo' in data:
        faculty.profile_photo = data['profile_photo'].strip()
    if 'email' in data and data['email'].strip() != faculty.email:
        new_email = data['email'].strip().lower()
        if User.query.filter(User.id != faculty.user_id, User.email == new_email).first():
            return jsonify({'error': f'Email "{new_email}" is already used by another user.'}), 400
        faculty.email = new_email
        if faculty.user:
            faculty.user.email = new_email

    act_log = ActivityLog(
        user_id=c_user.id,
        username=c_user.username,
        action='Faculty Updated',
        details=f'Updated profile for faculty: {faculty.full_name} ({faculty.employee_id})'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully.',
        'faculty': faculty.to_dict()
    }), 200


@faculty_bp.route('/faculty/<int:faculty_id>', methods=['DELETE'])
@hod_required
def delete_faculty(faculty_id):
    """Delete faculty member (HOD only)."""
    c_user: Any = current_user
    faculty = Faculty.query.get_or_404(faculty_id)
    user = faculty.user

    fac_name = faculty.full_name
    emp_id = faculty.employee_id

    db.session.delete(faculty)
    if user:
        db.session.delete(user)

    act_log = ActivityLog(
        user_id=c_user.id,
        username=c_user.username,
        action='Faculty Deleted',
        details=f'Deleted faculty member: {fac_name} ({emp_id})'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({'message': f'Faculty member {fac_name} deleted successfully.'}), 200


@faculty_bp.route('/faculty/<int:faculty_id>/attendance-status', methods=['PUT'])
@hod_required
def update_faculty_attendance_status(faculty_id):
    """Allows HOD to dynamically set presence/absence status for a faculty member."""
    faculty = Faculty.query.get_or_404(faculty_id)
    data = request.get_json() or {}
    status = data.get('attendance_status', 'Present').strip()
    
    valid_statuses = ['Present', 'Absent', 'On Leave']
    if status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

    faculty.attendance_status = status
    
    act_log = ActivityLog(
        user_id=current_user.id,
        username=current_user.username,
        action='Faculty Attendance Status Changed',
        details=f'Set attendance status for {faculty.full_name} ({faculty.employee_id}) to {status}'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({
        'message': f'Attendance status for {faculty.full_name} set to {status}.',
        'faculty': faculty.to_dict()
    }), 200

