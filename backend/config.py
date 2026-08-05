import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'ssmiet_cyber_sec_erp_super_secret_key_2026_@#$')
    
    # Try MySQL URL if provided in environment, otherwise fall back to SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(BASE_DIR, 'ssmiet_cybersec.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session & Security configuration
    REMEMBER_COOKIE_DURATION = timedelta(days=7)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = False  # Set to True in production HTTPS
    
    CORS_HEADERS = 'Content-Type'
