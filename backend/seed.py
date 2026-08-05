from datetime import datetime, timedelta, timezone
from database import db
from models import User, Faculty, Department, Subject, Room, Timetable, Notification, ActivityLog, BiometricLog

def seed_database():
    """Seeds initial database data if it does not already exist."""
    db.create_all()

    # Schema migration safeguard for SQLite
    try:
        with db.engine.connect() as conn:
            from sqlalchemy import text
            result = conn.execute(text("PRAGMA table_info(faculty)")).fetchall()
            cols = [r[1] for r in result] if result else []
            if cols and 'attendance_status' not in cols:
                conn.execute(text("ALTER TABLE faculty ADD COLUMN attendance_status VARCHAR(20) DEFAULT 'Present'"))
                conn.commit()
                print("-> Schema Migration: Added attendance_status column to faculty table")
    except Exception as e:
        print(f"Migration note: {e}")

    # 1. Department (Cyber Security Department ONLY)
    dept = Department.query.filter_by(code='CSE-CY').first()
    if not dept:
        dept = Department(
            name='Cyber Security',
            code='CSE-CY'
        )
        db.session.add(dept)
        db.session.commit()
        print("-> Seeded Department: Cyber Security")

    dept_id = dept.id if dept else 1

    # 2. Subjects
    subjects_data = [
        {'code': 'CY3501', 'name': 'Network Security & Firewalls', 'short': 'NSF', 'sem': 5, 'credits': 4},
        {'code': 'CY3502', 'name': 'Ethical Hacking & Penetration Testing', 'short': 'EHPT', 'sem': 5, 'credits': 4},
        {'code': 'CY3503', 'name': 'Digital Forensics & Incident Response', 'short': 'DFIR', 'sem': 5, 'credits': 3},
        {'code': 'CY3504', 'name': 'Applied Cryptography', 'short': 'CRYPTO', 'sem': 5, 'credits': 4},
        {'code': 'CY3505', 'name': 'Cloud & Infrastructure Security', 'short': 'CIS', 'sem': 7, 'credits': 3},
        {'code': 'CY3506', 'name': 'Malware Analysis & Reverse Engineering', 'short': 'MARE', 'sem': 7, 'credits': 4},
        {'code': 'CY3507', 'name': 'Cyber Laws, Ethics & Compliance', 'short': 'CLEC', 'sem': 7, 'credits': 3},
        {'code': 'CY3508', 'name': 'Security Operations Center (SOC) Practice', 'short': 'SOC', 'sem': 7, 'credits': 3},
    ]
    for s_data in subjects_data:
        if not Subject.query.filter_by(subject_code=s_data['code']).first():
            subject = Subject(
                department_id=dept_id,
                subject_code=s_data['code'],
                subject_name=s_data['name'],
                short_name=s_data['short'],
                semester=s_data['sem'],
                credits=s_data['credits']
            )
            db.session.add(subject)
    db.session.commit()

    # 3. Rooms
    rooms_data = [
        {'number': 'CY-101', 'building': 'SSMIET Cyber Block', 'floor': '1st Floor', 'capacity': 60, 'type': 'Lecture Hall'},
        {'number': 'CY-102', 'building': 'SSMIET Cyber Block', 'floor': '1st Floor', 'capacity': 60, 'type': 'Lecture Hall'},
        {'number': 'CY-LAB-01', 'building': 'SSMIET Cyber Block', 'floor': '2nd Floor', 'capacity': 45, 'type': 'Cyber Forensics Lab'},
        {'number': 'CY-LAB-02', 'building': 'SSMIET Cyber Block', 'floor': '2nd Floor', 'capacity': 45, 'type': 'SOC Center Lab'},
    ]
    for r_data in rooms_data:
        if not Room.query.filter_by(room_number=r_data['number']).first():
            room = Room(
                room_number=r_data['number'],
                building=r_data['building'],
                floor=r_data['floor'],
                capacity=r_data['capacity'],
                room_type=r_data['type']
            )
            db.session.add(room)
    db.session.commit()

    # 4. Users & Faculty
    # HOD Rajesh + 8 Faculty members
    users_to_seed = [
        {
            'username': 'rajesh',
            'email': 'rajesh@ssmiet.ac.in',
            'role': 'HOD',
            'emp_id': 'EMP-CY-HOD',
            'name': 'Dr. Rajesh',
            'gender': 'Male',
            'designation': 'Professor & Head of Department',
            'phone': '+91 98421 10001',
            'qual': 'Ph.D. in Cyber Security & Cryptography',
            'doj': '2015-06-15',
            'bio_id': 'BIO-HOD-01'
        },
        {
            'username': 'helen',
            'email': 'helen@ssmiet.ac.in',
            'role': 'Faculty',
            'emp_id': 'EMP-CY-001',
            'name': 'Dr. Helen Sushma',
            'gender': 'Female',
            'designation': 'Associate Professor',
            'phone': '+91 98421 10002',
            'qual': 'Ph.D. in Network Security',
            'doj': '2017-08-01',
            'bio_id': 'BIO-CY-001'
        },
        {
            'username': 'kayalvizhi',
            'email': 'kayalvizhi@ssmiet.ac.in',
            'role': 'Faculty',
            'emp_id': 'EMP-CY-002',
            'name': 'Prof. Kayalvizhi',
            'gender': 'Female',
            'designation': 'Assistant Professor',
            'phone': '+91 98421 10003',
            'qual': 'M.E. in Cybersecurity',
            'doj': '2019-06-10',
            'bio_id': 'BIO-CY-002'
        },
        {
            'username': 'saranya',
            'email': 'saranya@ssmiet.ac.in',
            'role': 'Faculty',
            'emp_id': 'EMP-CY-003',
            'name': 'Prof. Saranya',
            'gender': 'Female',
            'designation': 'Assistant Professor',
            'phone': '+91 98421 10004',
            'qual': 'M.Tech in Information Security',
            'doj': '2020-01-15',
            'bio_id': 'BIO-CY-003'
        },
        {
            'username': 'nisha',
            'email': 'nisha@ssmiet.ac.in',
            'role': 'Faculty',
            'emp_id': 'EMP-CY-004',
            'name': 'Prof. Nisha',
            'gender': 'Female',
            'designation': 'Assistant Professor',
            'phone': '+91 98421 10005',
            'qual': 'M.E. in Computer Science & Engineering',
            'doj': '2020-09-01',
            'bio_id': 'BIO-CY-004'
        },
        {
            'username': 'karuppusamy',
            'email': 'karuppusamy@ssmiet.ac.in',
            'role': 'Faculty',
            'emp_id': 'EMP-CY-005',
            'name': 'Dr. Karuppusamy',
            'gender': 'Male',
            'designation': 'Associate Professor',
            'phone': '+91 98421 10006',
            'qual': 'Ph.D. in Cloud Security & Blockchain',
            'doj': '2018-05-20',
            'bio_id': 'BIO-CY-005'
        },
        {
            'username': 'aashika',
            'email': 'aashika@ssmiet.ac.in',
            'role': 'Faculty',
            'emp_id': 'EMP-CY-006',
            'name': 'Prof. Aashika',
            'gender': 'Female',
            'designation': 'Assistant Professor',
            'phone': '+91 98421 10007',
            'qual': 'M.E. in Cybersecurity',
            'doj': '2021-07-12',
            'bio_id': 'BIO-CY-006'
        },
        {
            'username': 'anitha',
            'email': 'anitha@ssmiet.ac.in',
            'role': 'Faculty',
            'emp_id': 'EMP-CY-007',
            'name': 'Prof. Anitha',
            'gender': 'Female',
            'designation': 'Assistant Professor',
            'phone': '+91 98421 10008',
            'qual': 'M.Tech in Digital Forensics',
            'doj': '2022-02-01',
            'bio_id': 'BIO-CY-007'
        },
        {
            'username': 'hemalatha',
            'email': 'hemalatha@ssmiet.ac.in',
            'role': 'Faculty',
            'emp_id': 'EMP-CY-008',
            'name': 'Prof. Hemalatha',
            'gender': 'Female',
            'designation': 'Assistant Professor',
            'phone': '+91 98421 10009',
            'qual': 'M.E. in Cyber Forensics & Information Security',
            'doj': '2022-08-15',
            'bio_id': 'BIO-CY-008'
        }
    ]

    for u_data in users_to_seed:
        user = User.query.filter_by(username=u_data['username']).first()
        if not user:
            user = User(
                username=u_data['username'],
                email=u_data['email'],
                role=u_data['role'],
                is_password_set=True
            )
            user.set_password('password123')
            db.session.add(user)
            db.session.flush()
        else:
            user.set_password('password123')
            user.is_password_set = True

        user_id = user.id if user else None

        faculty = Faculty.query.filter(
            (Faculty.employee_id == u_data['emp_id']) | 
            (Faculty.email == u_data['email']) | 
            (Faculty.user_id == user_id)
        ).first()

        if not faculty and user_id is not None:
            faculty = Faculty(
                user_id=user_id,
                employee_id=u_data['emp_id'],
                full_name=u_data['name'],
                gender=u_data['gender'],
                department_name='Cyber Security',
                designation=u_data['designation'],
                email=u_data['email'],
                phone_number=u_data['phone'],
                qualification=u_data['qual'],
                date_of_joining=u_data['doj'],
                biometric_device_id=u_data['bio_id'],
                profile_photo=f"https://api.dicebear.com/7.x/avataaars/svg?seed={u_data['emp_id']}"
            )
            db.session.add(faculty)
            print(f"-> Seeded User & Faculty: {u_data['name']} ({u_data['role']})")

    db.session.commit()

    # 5. Timetable Entries
    # Create sample timetable entries if timetable table is empty
    if Timetable.query.count() == 0:
        all_faculty = Faculty.query.all()
        all_subjects = Subject.query.all()
        all_rooms = Room.query.all()

        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        periods = [
            (1, "09:00 AM", "09:50 AM"),
            (2, "09:50 AM", "10:40 AM"),
            (3, "10:55 AM", "11:45 AM"),
            (4, "11:45 AM", "12:35 PM"),
            (5, "01:30 PM", "02:20 PM"),
            (6, "02:20 PM", "03:10 PM"),
            (7, "03:20 PM", "04:10 PM"),
        ]

        if all_faculty and all_subjects and all_rooms:
            slot_index = 0
            for day in days:
                for p_num, s_time, e_time in periods[:4]: # Sample schedule slots
                    fac = all_faculty[slot_index % len(all_faculty)]
                    subj = all_subjects[slot_index % len(all_subjects)]
                    rm = all_rooms[slot_index % len(all_rooms)]

                    tt_entry = Timetable(
                        faculty_id=fac.id,
                        subject_id=subj.id,
                        room_id=rm.id,
                        day_of_week=day,
                        period_number=p_num,
                        start_time=s_time,
                        end_time=e_time,
                        semester=subj.semester,
                        section='A',
                        academic_year='2025-2026'
                    )
                    db.session.add(tt_entry)
                    slot_index += 1
            
            db.session.commit()
            print("-> Seeded Initial Timetable Matrix")

            # Update workload counts for each faculty
            for fac in all_faculty:
                fac.calculate_workload()

    # 6. Notifications
    if Notification.query.count() == 0:
        notifs = [
            Notification(title="Semester V Timetable Published", message="The dynamic timetable for Cyber Security Semester V (Sec A & B) has been approved by HOD.", type="info"),
            Notification(title="Cyber Lab Maintenance Scheduled", message="Room CY-LAB-01 will undergo biometric scanner calibration on Saturday.", type="warning"),
            Notification(title="Welcome to SSMIET ERP", message="Smart Faculty Class Engagement System successfully initialized for Cyber Security Dept.", type="success"),
        ]
        for n in notifs:
            db.session.add(n)
        db.session.commit()

    # 7. Activity Logs
    if ActivityLog.query.count() == 0:
        logs = [
            ActivityLog(username="system", action="System Initialized", details="Database auto-seeded with 9 Cyber Security departmental accounts & master timetable."),
            ActivityLog(username="rajesh", action="Timetable Published", details="HOD Dr. Rajesh published the weekly master timetable for 2025-2026."),
        ]
        for l in logs:
            db.session.add(l)
        db.session.commit()

    # 8. Biometric Logs
    if BiometricLog.query.count() == 0:
        fac = Faculty.query.first()
        if fac:
            b_log = BiometricLog(
                faculty_id=fac.id,
                faculty_name=fac.full_name,
                device_id=fac.biometric_device_id or "BIO-DEV-01",
                punch_time=datetime.now(timezone.utc) - timedelta(minutes=15),
                punch_type="IN",
                status="Verified"
            )
            db.session.add(b_log)
            db.session.commit()
