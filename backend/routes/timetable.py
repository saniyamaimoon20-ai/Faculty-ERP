from typing import Any
from datetime import datetime, timezone
from functools import wraps
from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required

try:
    from database import db
    from models import Timetable, Faculty, Subject, Room, ActivityLog, User, Department, Notification
except ImportError:
    from backend.database import db  # type: ignore
    from backend.models import Timetable, Faculty, Subject, Room, ActivityLog, User, Department, Notification  # type: ignore

timetable_bp = Blueprint('timetable', __name__, url_prefix='/api')

def hod_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        c_user: Any = current_user
        if c_user.role != 'HOD':
            return jsonify({'error': 'Access denied. HOD privilege required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def resolve_faculty(data):
    fac_id = data.get('faculty_id')
    if fac_id and str(fac_id).isdigit() and int(fac_id) > 0:
        f = db.session.get(Faculty, int(fac_id))
        if f: return f
    fac_input = data.get('faculty_name')
    if not fac_input: return None
    name_str = str(fac_input).strip()
    f = Faculty.query.filter((Faculty.full_name.ilike(name_str)) | (Faculty.employee_id.ilike(name_str))).first()
    if f: return f
    f = Faculty.query.filter(Faculty.full_name.ilike(f"%{name_str}%")).first()
    if f: return f
    # Auto-create new faculty on the fly if typed
    ts = int(datetime.now(timezone.utc).timestamp()) % 10000
    emp_id = f"EMP-CY-{ts}"
    username = f"fac_{ts}"
    new_user = User(username=username, email=f"{username}@ssmiet.ac.in", role='Faculty', is_password_set=True)
    new_user.set_password('password123')
    db.session.add(new_user)
    db.session.flush()
    f = Faculty(user_id=new_user.id, employee_id=emp_id, full_name=name_str, designation='Assistant Professor', email=new_user.email)
    db.session.add(f)
    db.session.flush()
    return f

def resolve_subject(data):
    sub_id = data.get('subject_id')
    if sub_id and str(sub_id).isdigit() and int(sub_id) > 0:
        s = db.session.get(Subject, int(sub_id))
        if s: return s
    sub_input = data.get('subject_name')
    if not sub_input: return None
    name_str = str(sub_input).strip()
    s = Subject.query.filter((Subject.subject_name.ilike(name_str)) | (Subject.subject_code.ilike(name_str)) | (Subject.short_name.ilike(name_str))).first()
    if s: return s
    s = Subject.query.filter(Subject.subject_name.ilike(f"%{name_str}%")).first()
    if s: return s
    # Auto-create new subject on the fly
    dept = Department.query.first()
    dept_id = dept.id if dept else 1
    ts = int(datetime.now(timezone.utc).timestamp()) % 10000
    s = Subject(department_id=dept_id, subject_code=f"CY{ts}", subject_name=name_str, short_name=name_str[:6].upper(), semester=5, credits=3)
    db.session.add(s)
    db.session.flush()
    return s

def resolve_room(data):
    rm_id = data.get('room_id')
    if rm_id and str(rm_id).isdigit() and int(rm_id) > 0:
        r = db.session.get(Room, int(rm_id))
        if r: return r
    rm_input = data.get('room_number')
    if not rm_input: return None
    num_str = str(rm_input).strip()
    r = Room.query.filter(Room.room_number.ilike(num_str)).first()
    if r: return r
    # Auto-create new room on the fly
    r = Room(room_number=num_str, building='SSMIET Cyber Block', floor='1st Floor', capacity=60, room_type='Lecture Hall')
    db.session.add(r)
    db.session.flush()
    return r

@timetable_bp.route('/timetable', methods=['GET'])
@login_required
def get_all_timetable():
    """Gets timetable entries. HOD gets all entries; Faculty gets their own schedule."""
    c_user: Any = current_user
    day = request.args.get('day', '').strip()
    semester = request.args.get('semester', type=int)
    section = request.args.get('section', '').strip()

    query = Timetable.query

    # Non-HOD faculty users can ONLY view their own schedule
    if current_user.role != 'HOD' and current_user.faculty_profile:
        query = query.filter(Timetable.faculty_id == current_user.faculty_profile.id)

    if day:
        query = query.filter(Timetable.day_of_week == day)
    if semester:
        query = query.filter(Timetable.semester == semester)
    if section:
        query = query.filter(Timetable.section == section)

    entries = query.order_by(Timetable.day_of_week.asc(), Timetable.period_number.asc()).all()
    return jsonify([t.to_dict() for t in entries]), 200


@timetable_bp.route('/timetable/faculty/<int:faculty_id>', methods=['GET'])
@login_required
def get_faculty_timetable(faculty_id):
    """Gets timetable for a specific faculty member."""
    c_user: Any = current_user
    # Non-HOD users requesting someone else's timetable get their own timetable instead
    if c_user.role != 'HOD' and c_user.faculty_profile and c_user.faculty_profile.id != faculty_id:
        faculty_id = c_user.faculty_profile.id

    faculty = db.session.get(Faculty, faculty_id)
    if not faculty:
        return jsonify([]), 200
    entries = Timetable.query.filter_by(faculty_id=faculty_id)\
        .order_by(Timetable.day_of_week.asc(), Timetable.period_number.asc()).all()
    return jsonify([t.to_dict() for t in entries]), 200


@timetable_bp.route('/timetable/room/<int:room_id>', methods=['GET'])
@login_required
def get_room_timetable(room_id):
    """Gets timetable schedule for a specific room."""
    room = db.session.get(Room, room_id)
    if not room:
        return jsonify([]), 200
    entries = Timetable.query.filter_by(room_id=room_id)\
        .order_by(Timetable.day_of_week.asc(), Timetable.period_number.asc()).all()
    return jsonify([t.to_dict() for t in entries]), 200


@timetable_bp.route('/timetable', methods=['POST'])
@hod_required
def create_timetable_slot():
    """Create a new timetable entry with dynamic entity resolution and conflict checking."""
    data = request.get_json() or {}

    faculty = resolve_faculty(data)
    subject = resolve_subject(data)
    room = resolve_room(data)

    day_of_week = str(data.get('day_of_week', '')).strip()
    period_number = int(data['period_number']) if 'period_number' in data and data['period_number'] else 1
    start_time = str(data.get('start_time', '')).strip()
    end_time = str(data.get('end_time', '')).strip()
    semester = int(data['semester']) if 'semester' in data and data['semester'] else 5
    section = str(data.get('section', 'A')).strip()
    academic_year = str(data.get('academic_year', '2025-2026')).strip()

    if not faculty or not subject or not room or not day_of_week or not period_number:
        return jsonify({'error': 'Faculty, Subject, Room, Day, and Period are required fields.'}), 400

    if not start_time or not end_time:
        start_time = "09:00 AM"
        end_time = "09:50 AM"

    # Conflict Check: Faculty availability clash
    fac_clash = Timetable.query.filter_by(
        faculty_id=faculty.id,
        day_of_week=day_of_week,
        period_number=period_number
    ).first()
    if fac_clash:
        return jsonify({'error': f'Faculty {faculty.full_name} is already assigned to period {period_number} on {day_of_week}.'}), 400

    # Conflict Check: Room availability clash
    room_clash = Timetable.query.filter_by(
        room_id=room.id,
        day_of_week=day_of_week,
        period_number=period_number
    ).first()
    if room_clash:
        return jsonify({'error': f'Room {room.room_number} is already occupied during period {period_number} on {day_of_week}.'}), 400

    new_slot = Timetable(
        faculty_id=faculty.id,
        subject_id=subject.id,
        room_id=room.id,
        day_of_week=day_of_week,
        period_number=period_number,
        start_time=start_time,
        end_time=end_time,
        semester=semester,
        section=section,
        academic_year=academic_year
    )
    db.session.add(new_slot)
    db.session.flush()

    faculty.calculate_workload()

    act_log = ActivityLog(
        user_id=current_user.id,
        username=current_user.username,
        action='Timetable Added',
        details=f'Assigned {subject.subject_name} to {faculty.full_name} in {room.room_number} ({day_of_week} Period {period_number})'
    )
    db.session.add(act_log)

    # Dispatch targeted notification directly to assigned faculty
    target_user_id = faculty.user_id if faculty.user_id else faculty.id
    sub_title_name = subject.short_name if subject.short_name else subject.subject_name
    notif = Notification(
        user_id=target_user_id,
        title=f"New Class Assigned: {sub_title_name}",
        message=f"HOD has assigned a new class slot to you: {subject.subject_name} ({subject.subject_code}) on {day_of_week}, Period {period_number} ({start_time} - {end_time}) in Room {room.room_number} (Semester {semester}, Section {section}).",
        type='info',
        is_read=False
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({
        'message': 'Timetable slot created successfully.',
        'slot': new_slot.to_dict()
    }), 201


@timetable_bp.route('/timetable/<int:slot_id>', methods=['PUT'])
@hod_required
def update_timetable_slot(slot_id):
    """Update an existing timetable slot with dynamic entity resolution."""
    slot = Timetable.query.get_or_404(slot_id)
    data = request.get_json() or {}

    faculty = resolve_faculty(data) or slot.faculty
    subject = resolve_subject(data) or slot.subject
    room = resolve_room(data) or slot.room

    day_of_week = str(data.get('day_of_week', slot.day_of_week)).strip()
    period_number = int(data['period_number']) if 'period_number' in data and data['period_number'] else slot.period_number

    # Conflict check excludes current slot_id
    fac_clash = Timetable.query.filter(
        Timetable.id != slot_id,
        Timetable.faculty_id == faculty.id,
        Timetable.day_of_week == day_of_week,
        Timetable.period_number == period_number
    ).first()
    if fac_clash:
        return jsonify({'error': f'Faculty {faculty.full_name} is already assigned to period {period_number} on {day_of_week}.'}), 400

    room_clash = Timetable.query.filter(
        Timetable.id != slot_id,
        Timetable.room_id == room.id,
        Timetable.day_of_week == day_of_week,
        Timetable.period_number == period_number
    ).first()
    if room_clash:
        return jsonify({'error': f'Room {room.room_number} is already occupied during period {period_number} on {day_of_week}.'}), 400

    old_faculty_id = slot.faculty_id
    old_fac = Faculty.query.get(old_faculty_id) if old_faculty_id else None

    slot.faculty_id = faculty.id
    slot.subject_id = subject.id
    slot.room_id = room.id
    slot.day_of_week = day_of_week
    slot.period_number = period_number
    if 'start_time' in data and data['start_time'].strip():
        slot.start_time = data['start_time'].strip()
    if 'end_time' in data and data['end_time'].strip():
        slot.end_time = data['end_time'].strip()
    if 'semester' in data:
        slot.semester = int(data['semester'])
    if 'section' in data:
        slot.section = data['section'].strip()

    db.session.flush()

    if old_faculty_id and old_faculty_id != faculty.id and old_fac:
        old_fac.calculate_workload()
        # Notify previously assigned faculty of reassignment
        old_target_id = old_fac.user_id if old_fac.user_id else old_fac.id
        old_sub_title = subject.short_name if subject.short_name else subject.subject_name
        old_notif = Notification(
            user_id=old_target_id,
            title=f"Class Reassigned: {old_sub_title}",
            message=f"Your class slot for {subject.subject_name} on {day_of_week}, Period {period_number} has been reassigned to another faculty by HOD.",
            type='warning',
            is_read=False
        )
        db.session.add(old_notif)

    faculty.calculate_workload()

    act_log = ActivityLog(
        user_id=current_user.id,
        username=current_user.username,
        action='Timetable Updated',
        details=f'Updated timetable slot #{slot_id} to {subject.subject_name} by {faculty.full_name} in {room.room_number}'
    )
    db.session.add(act_log)

    # Dispatch targeted notification directly to assigned faculty
    target_user_id = faculty.user_id if faculty.user_id else faculty.id
    sub_title_name = subject.short_name if subject.short_name else subject.subject_name
    notif = Notification(
        user_id=target_user_id,
        title=f"Class Schedule Updated: {sub_title_name}",
        message=f"HOD updated your class assignment: {subject.subject_name} ({subject.subject_code}) on {day_of_week}, Period {period_number} ({slot.start_time} - {slot.end_time}) in Room {room.room_number} (Semester {slot.semester}, Section {slot.section}).",
        type='info',
        is_read=False
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({
        'message': 'Timetable slot updated successfully.',
        'slot': slot.to_dict()
    }), 200


@timetable_bp.route('/timetable/<int:slot_id>', methods=['DELETE'])
@hod_required
def delete_timetable_slot(slot_id):
    """Delete a timetable slot and update faculty workload."""
    slot = Timetable.query.get_or_404(slot_id)
    faculty = slot.faculty
    slot_info = f"{slot.subject.short_name if slot.subject else 'Slot'} on {slot.day_of_week} Period {slot.period_number}"
    sub_name = slot.subject.subject_name if slot.subject else 'Class'
    sub_short = slot.subject.short_name if slot.subject else 'Class'

    db.session.delete(slot)
    db.session.flush()

    if faculty:
        faculty.calculate_workload()
        target_user_id = faculty.user_id if faculty.user_id else faculty.id
        del_notif = Notification(
            user_id=target_user_id,
            title=f"Class Unassigned: {sub_short}",
            message=f"HOD unassigned your class slot for {sub_name} on {slot.day_of_week}, Period {slot.period_number}.",
            type='warning',
            is_read=False
        )
        db.session.add(del_notif)

    act_log = ActivityLog(
        user_id=current_user.id,
        username=current_user.username,
        action='Timetable Deleted',
        details=f'Deleted timetable slot: {slot_info}'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({'message': 'Timetable slot deleted successfully.'}), 200
