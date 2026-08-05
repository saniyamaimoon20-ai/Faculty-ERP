from typing import Any
from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from functools import wraps

try:
    from database import db
    from models import Room, ActivityLog
except ImportError:
    from backend.database import db  # type: ignore
    from backend.models import Room, ActivityLog  # type: ignore

rooms_bp = Blueprint('rooms', __name__, url_prefix='/api')

def hod_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        c_user: Any = current_user
        if c_user.role != 'HOD':
            return jsonify({'error': 'Access denied. HOD privilege required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

@rooms_bp.route('/rooms', methods=['GET'])
@login_required
def get_rooms():
    """Gets searchable, sortable, paginated rooms list."""
    search = request.args.get('search', '').strip()
    room_type = request.args.get('type', '').strip()
    sort_by = request.args.get('sort_by', 'room_number')
    order = request.args.get('order', 'asc')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Room.query

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Room.room_number.ilike(search_filter)) |
            (Room.building.ilike(search_filter)) |
            (Room.floor.ilike(search_filter)) |
            (Room.room_type.ilike(search_filter))
        )

    if room_type:
        query = query.filter(Room.room_type == room_type)

    if hasattr(Room, sort_by):
        column = getattr(Room, sort_by)
        query = query.order_by(column.asc() if order == 'asc' else column.desc())
    else:
        query = query.order_by(Room.room_number.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    rooms_list = [r.to_dict() for r in pagination.items]

    return jsonify({
        'rooms': rooms_list,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@rooms_bp.route('/rooms', methods=['POST'])
@hod_required
def add_room():
    """Add a new room (HOD only)."""
    c_user: Any = current_user
    data = request.get_json() or {}

    room_number = data.get('room_number', '').strip().upper()
    building = data.get('building', 'SSMIET Cyber Block').strip()
    floor = data.get('floor', '1st Floor').strip()
    try:
        capacity = int(data.get('capacity', 60))
    except (ValueError, TypeError):
        capacity = 60
    room_type = data.get('room_type', 'Lecture Hall').strip()

    if not room_number:
        return jsonify({'error': 'Room number is required.'}), 400

    # Duplicate check
    if Room.query.filter_by(room_number=room_number).first():
        return jsonify({'error': f'Room number "{room_number}" already exists.'}), 400

    new_room = Room(
        room_number=room_number,
        building=building,
        floor=floor,
        capacity=capacity,
        room_type=room_type
    )
    db.session.add(new_room)

    act_log = ActivityLog(
        user_id=c_user.id,
        username=c_user.username,
        action='Room Added',
        details=f'Created new room: {room_number} ({room_type}, Capacity: {capacity})'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({
        'message': 'Room added successfully.',
        'room': new_room.to_dict()
    }), 201


@rooms_bp.route('/rooms/<int:room_id>', methods=['PUT'])
@hod_required
def update_room(room_id):
    """Update room details (HOD only)."""
    c_user: Any = current_user
    room = Room.query.get_or_404(room_id)
    data = request.get_json() or {}

    if 'room_number' in data:
        new_num = data['room_number'].strip().upper()
        if new_num != room.room_number and Room.query.filter_by(room_number=new_num).first():
            return jsonify({'error': f'Room number "{new_num}" already exists.'}), 400
        room.room_number = new_num

    if 'building' in data:
        room.building = data['building'].strip()
    if 'floor' in data:
        room.floor = data['floor'].strip()
    if 'capacity' in data:
        room.capacity = int(data['capacity'])
    if 'room_type' in data:
        room.room_type = data['room_type'].strip()

    act_log = ActivityLog(
        user_id=c_user.id,
        username=c_user.username,
        action='Room Updated',
        details=f'Updated room: {room.room_number}'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({
        'message': 'Room updated successfully.',
        'room': room.to_dict()
    }), 200


@rooms_bp.route('/rooms/<int:room_id>', methods=['DELETE'])
@hod_required
def delete_room(room_id):
    """Delete room (HOD only)."""
    c_user: Any = current_user
    room = Room.query.get_or_404(room_id)
    r_num = room.room_number

    db.session.delete(room)

    act_log = ActivityLog(
        user_id=c_user.id,
        username=c_user.username,
        action='Room Deleted',
        details=f'Deleted room: {r_num}'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({'message': f'Room {r_num} deleted successfully.'}), 200
