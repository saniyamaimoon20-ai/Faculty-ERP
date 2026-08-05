from flask import Flask, jsonify
from flask_cors import CORS
from flask_login import LoginManager
from config import Config
from database import db
from models import User
from seed import seed_database

# Blueprints
from routes.auth import auth_bp
from routes.faculty import faculty_bp
from routes.rooms import rooms_bp
from routes.timetable import timetable_bp
from routes.dropdowns import dropdowns_bp
from routes.logs import logs_bp
from routes.notifications import notifications_bp
from routes.attendance import attendance_bp
from routes.profile import profile_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    
    # Enable CORS for React frontend (port 5173 / localhost)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

    # Setup Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.session_protection = 'strong'

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({'error': 'Authentication required. Please log in.'}), 401

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(faculty_bp)
    app.register_blueprint(rooms_bp)
    app.register_blueprint(timetable_bp)
    app.register_blueprint(dropdowns_bp)
    app.register_blueprint(logs_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(profile_bp)

    # Error handlers
    @app.errorhandler(404)  # type: ignore
    def not_found_error(error):
        return jsonify({'error': 'Requested resource not found.'}), 404

    @app.errorhandler(500)  # type: ignore
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error occurred.'}), 500

    # Auto-seed database on first startup
    with app.app_context():
        try:
            seed_database()
        except Exception as e:
            print(f"Database initialization exception: {e}")

    return app

app = create_app()

if __name__ == '__main__':
    print("Starting SSMIET Cyber Security ERP Flask Server on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
