from typing import Any
from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from functools import wraps

try:
    from models import LoginLog, ActivityLog
except ImportError:
    from backend.models import LoginLog, ActivityLog  # type: ignore

logs_bp = Blueprint('logs', __name__, url_prefix='/api/logs')

def hod_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        c_user: Any = current_user
        if c_user.role != 'HOD':
            return jsonify({'error': 'Access denied. HOD privilege required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

@logs_bp.route('/login', methods=['GET'])
@hod_required
def get_login_logs():
    """Gets login security audit logs (HOD only) with search, filter, and pagination."""
    search = request.args.get('search', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 25, type=int)

    query = LoginLog.query

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (LoginLog.username.ilike(search_filter)) |
            (LoginLog.ip_address.ilike(search_filter)) |
            (LoginLog.browser.ilike(search_filter))
        )

    pagination = query.order_by(LoginLog.login_time.desc()).paginate(page=page, per_page=per_page, error_out=False)
    logs_list = [l.to_dict() for l in pagination.items]

    return jsonify({
        'logs': logs_list,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@logs_bp.route('/activity', methods=['GET'])
@login_required
def get_activity_logs():
    """Gets system activity audit logs."""
    # HOD can view all activity logs; Faculty can view departmental logs
    search = request.args.get('search', '').strip()
    action = request.args.get('action', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 25, type=int)

    query = ActivityLog.query

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ActivityLog.username.ilike(search_filter)) |
            (ActivityLog.action.ilike(search_filter)) |
            (ActivityLog.details.ilike(search_filter))
        )

    if action:
        query = query.filter(ActivityLog.action == action)

    pagination = query.order_by(ActivityLog.timestamp.desc()).paginate(page=page, per_page=per_page, error_out=False)
    logs_list = [l.to_dict() for l in pagination.items]

    return jsonify({
        'logs': logs_list,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200
