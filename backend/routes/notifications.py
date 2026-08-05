from typing import Any
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from functools import wraps

try:
    from database import db
    from models import Notification, ActivityLog
except ImportError:
    from backend.database import db  # type: ignore
    from backend.models import Notification, ActivityLog  # type: ignore

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api')

def hod_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        c_user: Any = current_user
        if c_user.role != 'HOD':
            return jsonify({'error': 'Access denied. HOD privilege required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

@notifications_bp.route('/notifications', methods=['GET'])
@login_required
def get_notifications():
    """Gets notifications broadcasted or targeted to user."""
    c_user: Any = current_user
    user_id = c_user.id
    fac_id = c_user.faculty_profile.id if c_user.faculty_profile else None

    if c_user.role == 'HOD':
        notifs = Notification.query.order_by(Notification.created_at.desc()).limit(50).all()
    else:
        filters = [
            (Notification.user_id == None),
            (Notification.user_id == ''),
            (Notification.user_id == user_id)
        ]
        if fac_id:
            filters.append(Notification.user_id == fac_id)

        notifs = Notification.query.filter(db.or_(*filters)).order_by(Notification.created_at.desc()).limit(50).all()
    
    return jsonify([n.to_dict() for n in notifs]), 200

@notifications_bp.route('/notifications', methods=['POST'])
@hod_required
def send_notification():
    """Broadcast or send targeted notification to faculties (HOD only)."""
    c_user: Any = current_user
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    message = data.get('message', '').strip()
    notif_type = data.get('type', 'info').strip()  # info, warning, success, danger
    raw_user_id = data.get('user_id')

    if not title or not message:
        return jsonify({'error': 'Title and Message are required.'}), 400

    target_user_id = None
    if raw_user_id and str(raw_user_id).strip() not in ('', '0', 'null', 'None'):
        try:
            target_user_id = int(raw_user_id)
        except ValueError:
            target_user_id = None

    notif = Notification(
        user_id=target_user_id,
        title=title,
        message=message,
        type=notif_type,
        is_read=False
    )
    db.session.add(notif)

    act_log = ActivityLog(
        user_id=c_user.id,
        username=c_user.username,
        action='Notification Sent',
        details=f'Sent notification "{title}" ({notif_type})'
    )
    db.session.add(act_log)
    db.session.commit()

    return jsonify({
        'message': 'Notification sent successfully.',
        'notification': notif.to_dict()
    }), 201

@notifications_bp.route('/notifications/<int:notif_id>/read', methods=['PUT'])
@login_required
def mark_read(notif_id):
    """Mark a notification as read."""
    notif = Notification.query.get_or_404(notif_id)
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read.'}), 200

