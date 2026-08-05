from flask import Blueprint, jsonify
from flask_login import login_required

try:
    from models import BiometricLog
except ImportError:
    from backend.models import BiometricLog  # type: ignore

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api')

@attendance_bp.route('/attendance', methods=['GET'])
@attendance_bp.route('/biometric-logs', methods=['GET'])
@login_required
def get_biometric_logs():
    """Returns read-only attendance / biometric punch logs."""
    logs = BiometricLog.query.order_by(BiometricLog.punch_time.desc()).limit(100).all()
    return jsonify([l.to_dict() for l in logs]), 200
