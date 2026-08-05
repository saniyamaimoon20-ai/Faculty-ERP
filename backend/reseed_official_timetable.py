import os
import sys
from datetime import datetime

from app import create_app
from database import db
from models import User, Faculty, Department, Subject, Room, Timetable, Notification, ActivityLog

app = create_app()

with app.app_context():
    # Clear existing timetable, subjects, rooms, faculty, users, departments
    Timetable.query.delete()
    Subject.query.delete()
    Room.query.delete()
    Faculty.query.delete()
    User.query.delete()
    Department.query.delete()
    db.session.commit()

    print("Cleared old database tables.")

    # 1. Department
    dept = Department(name='Department of CSE (Cyber Security)', code='CSE-CY')
    db.session.add(dept)
    db.session.commit()

    # 2. Main Hall / Room T403
    room_t403 = Room(
        room_number='T403',
        building='SSMIET Main Block',
        floor='4th Floor',
        capacity=60,
        room_type='Lecture Hall (T403)'
    )
    db.session.add(room_t403)
    db.session.commit()

    # 3. Faculty Members from Official Document
    faculty_members_data = [
        {
            'username': 'rajesh',
            'name': 'Dr. K. Rajesh',
            'designation': 'Professor & Head of Department',
            'emp_id': 'EMP-CY-001',
            'role': 'HOD',
            'email': 'rajesh@ssmiet.ac.in'
        },
        {
            'username': 'karuppusamy',
            'name': 'Mr. M. N. Karuppusamy',
            'designation': 'Assistant Professor',
            'emp_id': 'EMP-CY-002',
            'role': 'Faculty',
            'email': 'karuppusamy@ssmiet.ac.in'
        },
        {
            'username': 'nisha',
            'name': 'Mrs. M. Nisha',
            'designation': 'Assistant Professor',
            'emp_id': 'EMP-CY-003',
            'role': 'Faculty',
            'email': 'nisha@ssmiet.ac.in'
        },
        {
            'username': 'helen',
            'name': 'A. Arockia Helen Sushma',
            'designation': 'Assistant Professor',
            'emp_id': 'EMP-CY-004',
            'role': 'Faculty',
            'email': 'helen@ssmiet.ac.in'
        },
        {
            'username': 'ashika',
            'name': 'Mrs. V. Ashika',
            'designation': 'Assistant Professor',
            'emp_id': 'EMP-CY-005',
            'role': 'Faculty',
            'email': 'ashika@ssmiet.ac.in'
        },
        {
            'username': 'saranya',
            'name': 'Ms. R. Saranya',
            'designation': 'Assistant Professor',
            'emp_id': 'EMP-CY-006',
            'role': 'Faculty',
            'email': 'saranya@ssmiet.ac.in'
        },
        {
            'username': 'kayalvizhi',
            'name': 'Ms. A. Kayalvizhi',
            'designation': 'Assistant Professor',
            'emp_id': 'EMP-CY-007',
            'role': 'Faculty',
            'email': 'kayalvizhi@ssmiet.ac.in'
        },
        {
            'username': 'hemalatha',
            'name': 'Ms. A. Hemalatha',
            'designation': 'Assistant Professor',
            'emp_id': 'EMP-CY-008',
            'role': 'Faculty',
            'email': 'hemalatha@ssmiet.ac.in'
        },
        {
            'username': 'anitha',
            'name': 'Mrs. G. Anitha',
            'designation': 'Assistant Professor',
            'emp_id': 'EMP-CY-009',
            'role': 'Faculty',
            'email': 'anitha@ssmiet.ac.in'
        },
        {
            'username': 'rathi',
            'name': 'Mrs. N. Rathi',
            'designation': 'Assistant Professor (PED)',
            'emp_id': 'EMP-PED-010',
            'role': 'Faculty',
            'email': 'rathi@ssmiet.ac.in'
        }
    ]

    fac_obj_map = {}
    for fd in faculty_members_data:
        user = User(
            username=fd['username'],
            email=fd['email'],
            role=fd['role'],
            is_password_set=True
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.flush()

        fac = Faculty(
            user_id=user.id,
            employee_id=fd['emp_id'],
            full_name=fd['name'],
            designation=fd['designation'],
            department_name='Cyber Security',
            email=fd['email'],
            profile_photo=f"https://api.dicebear.com/7.x/avataaars/svg?seed={fd['emp_id']}"
        )
        db.session.add(fac)
        db.session.flush()
        fac_obj_map[fd['name']] = fac

    db.session.commit()
    print("Seeded Official Faculty Members.")

    # 4. Official Subjects
    subjects_list = [
        {'code': 'CS3551', 'name': 'Distributed Computing', 'short': 'CS3551', 'sem': 5, 'fac': 'Mr. M. N. Karuppusamy'},
        {'code': 'CB3591', 'name': 'Engineering Secure Software Systems', 'short': 'CB3591', 'sem': 5, 'fac': 'Dr. K. Rajesh'},
        {'code': 'CS3691', 'name': 'Embedded Systems & IoT', 'short': 'CS3691', 'sem': 5, 'fac': 'Mrs. M. Nisha'},
        {'code': 'CS3591', 'name': 'Computer Networks', 'short': 'CS3591', 'sem': 5, 'fac': 'A. Arockia Helen Sushma'},
        {'code': 'CCS335', 'name': 'Cloud Computing', 'short': 'CCS335', 'sem': 5, 'fac': 'Mrs. V. Ashika'},
        {'code': 'CCS344', 'name': 'Ethical Hacking', 'short': 'CCS344', 'sem': 5, 'fac': 'Ms. R. Saranya'},
        {'code': 'MX3084', 'name': 'Disaster Risk Reduction and Management', 'short': 'MX3084', 'sem': 5, 'fac': 'Ms. A. Kayalvizhi'},
        {'code': 'PED', 'name': 'Physical Education', 'short': 'PED', 'sem': 5, 'fac': 'Mrs. N. Rathi'},
        {'code': 'PLT', 'name': 'Library / Placement', 'short': 'PLT', 'sem': 5, 'fac': 'Mrs. G. Anitha'},
        {'code': 'LIB', 'name': 'Library', 'short': 'LIB', 'sem': 5, 'fac': 'A. Arockia Helen Sushma'},
        {'code': 'Mentor', 'name': 'Mentoring', 'short': 'Mentor', 'sem': 5, 'fac': 'A. Arockia Helen Sushma'},

        # Integrated Lab Combinations
        {'code': 'CS3591/ CCS335', 'name': 'Computer Networks / Cloud Computing Lab', 'short': 'CS3591/ CCS335', 'sem': 5, 'fac': 'A. Arockia Helen Sushma'},
        {'code': 'CS3691/ CB3591', 'name': 'Embedded Systems & IoT / Secure Software Lab', 'short': 'CS3691/ CB3591', 'sem': 5, 'fac': 'Mrs. M. Nisha'},
        {'code': 'CCS344/ CS3591', 'name': 'Ethical Hacking / Computer Networks Lab', 'short': 'CCS344/ CS3591', 'sem': 5, 'fac': 'Ms. R. Saranya'},
        {'code': 'CCS335/ CCS344', 'name': 'Cloud Computing / Ethical Hacking Lab', 'short': 'CCS335/ CCS344', 'sem': 5, 'fac': 'Mrs. V. Ashika'},
    ]

    sub_obj_map = {}
    for sd in subjects_list:
        sub = Subject(
            department_id=dept.id,
            subject_code=sd['code'],
            subject_name=sd['name'],
            short_name=sd['short'],
            semester=sd['sem'],
            credits=3
        )
        db.session.add(sub)
        db.session.flush()
        sub_obj_map[sd['code']] = (sub, fac_obj_map.get(sd['fac']))

    db.session.commit()
    print("Seeded Official Subjects.")

    # 5. Timetable Timings
    # 7 Periods per day
    PERIOD_TIMINGS = {
        1: ("09:00 AM", "09:50 AM"),
        2: ("09:50 AM", "10:40 AM"),
        3: ("10:40 AM", "11:30 AM"),
        4: ("11:50 AM", "12:40 PM"),
        5: ("12:40 PM", "01:30 PM"),
        6: ("02:20 PM", "03:10 PM"),
        7: ("03:10 PM", "04:00 PM"),
    }

    # Complete Matrix Grid from Official Document (Monday to Saturday, 7 Periods)
    OFFICIAL_GRID = {
        'Monday': {
            1: 'CS3691',
            2: 'CCS335',
            3: 'CS3591',
            4: 'CS3551',
            5: 'CB3591',
            6: 'MX3084',
            7: 'PED'
        },
        'Tuesday': {
            1: 'CS3591/ CCS335',
            2: 'CS3551',
            3: 'CS3551',
            4: 'CCS335',
            5: 'PLT',
            6: 'CS3691/ CB3591',
            7: 'CS3691/ CB3591'
        },
        'Wednesday': {
            1: 'CS3551',
            2: 'CB3591',
            3: 'CS3691',
            4: 'CCS344',
            5: 'CS3591',
            6: 'CS3691/ CB3591',
            7: 'CS3691/ CB3591'
        },
        'Thursday': {
            1: 'CCS344/ CS3591',
            2: 'CCS344/ CS3591',
            3: 'MX3084',
            4: 'CS3551',
            5: 'CCS344',
            6: 'CS3591',
            7: 'Mentor'
        },
        'Friday': {
            1: 'CS3591',
            2: 'CS3551',
            3: 'CB3591',
            4: 'CCS335/ CCS344',
            5: 'CCS335/ CCS344',
            6: 'PLT',
            7: 'CCS335'
        },
        'Saturday': {
            1: 'CB3591',
            2: 'CS3691',
            3: 'LIB',
            4: 'CS3691',
            5: 'CCS335',
            6: 'CCS344',
            7: 'MX3084'
        }
    }

    count = 0
    for day, p_dict in OFFICIAL_GRID.items():
        for p_num, sub_code in p_dict.items():
            sub_info = sub_obj_map.get(sub_code)
            if not sub_info:
                print(f"Warning: Subject code {sub_code} not found")
                continue
            sub_obj, fac_obj = sub_info
            s_time, e_time = PERIOD_TIMINGS[p_num]

            tt = Timetable(
                faculty_id=fac_obj.id if fac_obj else 1,
                subject_id=sub_obj.id,
                room_id=room_t403.id,
                day_of_week=day,
                period_number=p_num,
                start_time=s_time,
                end_time=e_time,
                semester=5,
                section='A',
                academic_year='2026-2027'
            )
            db.session.add(tt)
            count += 1

    db.session.commit()
    print(f"Successfully inserted all {count} official timetable slots for Hall T403!")

    # Calculate workloads for all faculty members
    all_fac = Faculty.query.all()
    for f in all_fac:
        f.calculate_workload()

    print("Recalculated all faculty workload counters.")
