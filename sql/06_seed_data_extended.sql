-- =====================================================================
-- Faculty Class Engagement Portal
-- File: 06_seed_data_extended.sql (optional — sample data for local testing)
-- Run after: 05_procedures_extended.sql
-- =====================================================================

USE faculty_engagement_portal;

-- Departments (link back to the 5 faculty rows seeded in 03_seed_data.sql)
INSERT INTO department (department_name, hod_name) VALUES
    ('Computer Science', 'Dr. Vinod Shetty'),
    ('Electronics & Communication', 'Prof. Suresh Kumar'),
    ('Mathematics', 'Dr. Anjali Rao'),
    ('Mechanical Engineering', 'Dr. Vinod Shetty');

UPDATE faculty f
JOIN department d ON d.department_name = f.department
SET f.department_id = d.department_id;

-- Subjects
INSERT INTO subject (subject_code, subject_name, semester, credits, department_id) VALUES
    ('CS301', 'Database Management Systems', '5', 4, 1),
    ('CS302', 'Operating Systems', '5', 4, 1),
    ('EC201', 'Digital Electronics', '3', 3, 2),
    ('MA101', 'Engineering Mathematics I', '1', 4, 3);

-- Rooms
INSERT INTO room (room_number, building, floor, capacity, room_type) VALUES
    ('101', 'Main Block', '1', 60, 'Classroom'),
    ('204', 'Main Block', '2', 40, 'Classroom'),
    ('Lab-1', 'CS Block', 'Ground', 30, 'Lab');

-- Timetable (assumes faculty_id 1 = Dr. Anjali Rao, seeded earlier)
CALL sp_timetable_create(1, 1, 1, 'Monday', '09:00:00', '10:00:00', '5', 'A', '2025-2026', @tt1);
CALL sp_timetable_create(2, 3, 2, 'Monday', '10:00:00', '11:00:00', '3', 'B', '2025-2026', @tt2);

-- Admin (password_hash below is a placeholder — replace by actually
-- hashing a real password with bcrypt before inserting in production)
INSERT INTO admin (username, password_hash, role, email) VALUES
    ('admin', '$2b$10$replace.with.a.real.bcrypt.hash........................', 'SuperAdmin', 'admin@college.edu');
