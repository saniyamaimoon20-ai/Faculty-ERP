from typing import Any
from datetime import datetime, timezone
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from database import db

class BaseModel(db.Model):
    __abstract__ = True
    query: Any
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class User(UserMixin, BaseModel):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=True)
    is_password_set = db.Column(db.Boolean, default=False, nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Faculty')  # HOD or Faculty
    status = db.Column(db.String(20), nullable=False, default='Active')  # Active or Inactive
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    faculty_profile = db.relationship('Faculty', backref='user', uselist=False, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        self.is_password_set = True

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        profile = self.faculty_profile.to_dict() if self.faculty_profile else None
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'is_password_set': self.is_password_set,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'profile': profile
        }


class Faculty(BaseModel):
    __tablename__ = 'faculty'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    employee_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(20), default='Male')
    department_name = db.Column(db.String(100), default='Cyber Security')
    designation = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    qualification = db.Column(db.String(100), nullable=True)
    date_of_joining = db.Column(db.String(20), nullable=True)
    biometric_device_id = db.Column(db.String(50), nullable=True)
    profile_photo = db.Column(db.Text, nullable=True)
    weekly_workload = db.Column(db.Integer, default=0)
    attendance_status = db.Column(db.String(20), default='Present', nullable=False) # Present, Absent, On Leave

    # Relationships
    timetables = db.relationship('Timetable', backref='faculty', cascade='all, delete-orphan')

    def calculate_workload(self):
        # Calculate total periods assigned in timetable
        total_slots = Timetable.query.filter_by(faculty_id=self.id).count()
        self.weekly_workload = total_slots
        db.session.commit()
        return total_slots

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'employee_id': self.employee_id,
            'full_name': self.full_name,
            'gender': self.gender,
            'department_name': self.department_name,
            'designation': self.designation,
            'email': self.email,
            'phone_number': self.phone_number,
            'qualification': self.qualification,
            'date_of_joining': self.date_of_joining,
            'biometric_device_id': self.biometric_device_id,
            'profile_photo': self.profile_photo or f"https://api.dicebear.com/7.x/avataaars/svg?seed={self.employee_id}",
            'weekly_workload': self.weekly_workload,
            'attendance_status': self.attendance_status or 'Present'
        }


class Department(BaseModel):
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code
        }


class Subject(BaseModel):
    __tablename__ = 'subjects'
    
    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    subject_code = db.Column(db.String(50), unique=True, nullable=False)
    subject_name = db.Column(db.String(100), nullable=False)
    short_name = db.Column(db.String(20), nullable=False)
    semester = db.Column(db.Integer, nullable=False, default=5)
    credits = db.Column(db.Integer, nullable=False, default=3)

    def to_dict(self):
        return {
            'id': self.id,
            'department_id': self.department_id,
            'subject_code': self.subject_code,
            'subject_name': self.subject_name,
            'short_name': self.short_name,
            'semester': self.semester,
            'credits': self.credits
        }


class Room(BaseModel):
    __tablename__ = 'rooms'
    
    id = db.Column(db.Integer, primary_key=True)
    room_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    building = db.Column(db.String(100), nullable=False, default='Main Block')
    floor = db.Column(db.String(50), nullable=False, default='2nd Floor')
    capacity = db.Column(db.Integer, nullable=False, default=60)
    room_type = db.Column(db.String(50), nullable=False, default='Lecture Hall') # Lecture Hall, Cyber Lab, SOC Center

    timetables = db.relationship('Timetable', backref='room', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'room_number': self.room_number,
            'building': self.building,
            'floor': self.floor,
            'capacity': self.capacity,
            'room_type': self.room_type
        }


class Timetable(BaseModel):
    __tablename__ = 'timetable'
    
    id = db.Column(db.Integer, primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id', ondelete='CASCADE'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False)
    day_of_week = db.Column(db.String(20), nullable=False)  # Monday .. Friday
    period_number = db.Column(db.Integer, nullable=False)   # 1 .. 7
    start_time = db.Column(db.String(20), nullable=False)   # e.g., "09:00 AM"
    end_time = db.Column(db.String(20), nullable=False)     # e.g., "09:50 AM"
    semester = db.Column(db.Integer, nullable=False, default=5)
    section = db.Column(db.String(10), nullable=False, default='A')
    academic_year = db.Column(db.String(20), nullable=False, default='2025-2026')

    subject = db.relationship('Subject', backref='timetables')

    def to_dict(self):
        return {
            'id': self.id,
            'faculty_id': self.faculty_id,
            'faculty_name': self.faculty.full_name if self.faculty else 'N/A',
            'employee_id': self.faculty.employee_id if self.faculty else 'N/A',
            'subject_id': self.subject_id,
            'subject_name': self.subject.subject_name if self.subject else 'N/A',
            'subject_code': self.subject.subject_code if self.subject else 'N/A',
            'short_name': self.subject.short_name if self.subject else 'N/A',
            'room_id': self.room_id,
            'room_number': self.room.room_number if self.room else 'N/A',
            'building': self.room.building if self.room else 'N/A',
            'day_of_week': self.day_of_week,
            'period_number': self.period_number,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'semester': self.semester,
            'section': self.section,
            'academic_year': self.academic_year
        }


class Notification(BaseModel):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True) # Null = Broadcast to all
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), default='info') # info, warning, success, danger
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }


class LoginLog(BaseModel):
    __tablename__ = 'login_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    username = db.Column(db.String(80), nullable=False)
    login_time = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    logout_time = db.Column(db.DateTime, nullable=True)
    session_duration = db.Column(db.String(50), nullable=True)
    ip_address = db.Column(db.String(50), default='127.0.0.1')
    browser = db.Column(db.String(100), default='Chrome / Windows')
    device = db.Column(db.String(100), default='Desktop PC')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.username,
            'login_time': self.login_time.strftime('%Y-%m-%d %H:%M:%S') if self.login_time else None,
            'logout_time': self.logout_time.strftime('%Y-%m-%d %H:%M:%S') if self.logout_time else 'Active Session',
            'session_duration': self.session_duration or 'Ongoing',
            'ip_address': self.ip_address,
            'browser': self.browser,
            'device': self.device
        }


class ActivityLog(BaseModel):
    __tablename__ = 'activity_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    username = db.Column(db.String(80), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.username,
            'action': self.action,
            'details': self.details,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }


class BiometricLog(BaseModel):
    __tablename__ = 'biometric_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id', ondelete='CASCADE'), nullable=False)
    faculty_name = db.Column(db.String(100), nullable=False)
    device_id = db.Column(db.String(50), nullable=False)
    punch_time = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    punch_type = db.Column(db.String(20), default='IN') # IN or OUT
    status = db.Column(db.String(50), default='Verified')

    def to_dict(self):
        return {
            'id': self.id,
            'faculty_id': self.faculty_id,
            'faculty_name': self.faculty_name,
            'device_id': self.device_id,
            'punch_time': self.punch_time.strftime('%Y-%m-%d %H:%M:%S'),
            'punch_type': self.punch_type,
            'status': self.status
        }
