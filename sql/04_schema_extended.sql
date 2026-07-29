-- =====================================================================
-- Faculty Class Engagement Portal
-- File     : 04_schema_extended.sql
-- Purpose  : Department, Subject, Room, Timetable, Room Allocation,
--            Biometric_Log, Attendance, Admin.
-- Run after: 01 schema.sql (faculty), before 05_procedures_extended.sql
-- Engine   : MySQL 8.0.16+
-- =====================================================================

USE faculty_engagement_portal;

-- ---------------------------------------------------------------------
-- 2. DEPARTMENT
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS department;

CREATE TABLE department (
    department_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    hod_name         VARCHAR(100) NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (department_id),
    UNIQUE KEY uq_department_name (department_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Link faculty -> department without breaking the existing `department`
-- VARCHAR column (kept for backward compatibility / existing data).
-- New code should prefer department_id; the varchar can be phased out later.
ALTER TABLE faculty
    ADD COLUMN department_id INT UNSIGNED NULL AFTER department,
    ADD CONSTRAINT fk_faculty_department
        FOREIGN KEY (department_id) REFERENCES department(department_id)
        ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- 3. SUBJECT
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS subject;

CREATE TABLE subject (
    subject_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    subject_code   VARCHAR(20)  NOT NULL,
    subject_name   VARCHAR(150) NOT NULL,
    semester       VARCHAR(20)  NOT NULL,
    credits        TINYINT UNSIGNED NOT NULL,
    department_id  INT UNSIGNED NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (subject_id),
    UNIQUE KEY uq_subject_code (subject_code),
    KEY idx_subject_department (department_id),
    CONSTRAINT fk_subject_department
        FOREIGN KEY (department_id) REFERENCES department(department_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. ROOM (classroom / lab)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS room;

CREATE TABLE room (
    room_id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    room_number  VARCHAR(20)  NOT NULL,
    building     VARCHAR(50)  NULL,
    floor        VARCHAR(10)  NULL,
    capacity     SMALLINT UNSIGNED NULL,
    room_type    ENUM('Lab','Classroom') NOT NULL DEFAULT 'Classroom',
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id),
    UNIQUE KEY uq_room_number_building (room_number, building)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. TIMETABLE
-- Overlap prevention (same faculty or same room, same day/semester/year)
-- is enforced in the stored procedures (05_procedures_extended.sql),
-- not here — MySQL has no native "no overlapping ranges" constraint.
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS timetable;

CREATE TABLE timetable (
    timetable_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    faculty_id     INT UNSIGNED NOT NULL,
    subject_id     INT UNSIGNED NOT NULL,
    room_id        INT UNSIGNED NOT NULL,
    day_of_week    ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    start_time     TIME NOT NULL,
    end_time       TIME NOT NULL,
    semester       VARCHAR(20) NOT NULL,
    section        VARCHAR(10) NULL,
    academic_year  VARCHAR(9)  NOT NULL,   -- e.g. '2025-2026'
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (timetable_id),
    KEY idx_timetable_faculty_day (faculty_id, day_of_week),
    KEY idx_timetable_room_day (room_id, day_of_week),
    CONSTRAINT fk_timetable_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    CONSTRAINT fk_timetable_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_room    FOREIGN KEY (room_id)    REFERENCES room(room_id)    ON DELETE RESTRICT,
    CONSTRAINT chk_timetable_times  CHECK (end_time > start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. ROOM ALLOCATION (date-specific, separate from the recurring timetable)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS room_allocation;

CREATE TABLE room_allocation (
    allocation_id  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    faculty_id     INT UNSIGNED NOT NULL,
    room_id        INT UNSIGNED NOT NULL,
    subject_id     INT UNSIGNED NOT NULL,
    date           DATE NOT NULL,
    start_time     TIME NOT NULL,
    end_time       TIME NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (allocation_id),
    KEY idx_allocation_room_date (room_id, date),
    KEY idx_allocation_faculty_date (faculty_id, date),
    CONSTRAINT fk_allocation_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    CONSTRAINT fk_allocation_room    FOREIGN KEY (room_id)    REFERENCES room(room_id)    ON DELETE RESTRICT,
    CONSTRAINT fk_allocation_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE RESTRICT,
    CONSTRAINT chk_allocation_times  CHECK (end_time > start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. BIOMETRIC_LOG (raw device feed — one row per scan event)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS biometric_log;

CREATE TABLE biometric_log (
    log_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    faculty_id      INT UNSIGNED NOT NULL,
    device_id       VARCHAR(50)  NOT NULL,
    date            DATE NOT NULL,
    check_in_time   TIME NULL,
    check_out_time  TIME NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (log_id),
    KEY idx_biometric_faculty_date (faculty_id, date),
    CONSTRAINT fk_biometric_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. ATTENDANCE (processed — one row per faculty per scheduled class)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS attendance;

CREATE TABLE attendance (
    attendance_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    faculty_id        INT UNSIGNED NOT NULL,
    timetable_id      INT UNSIGNED NOT NULL,
    date              DATE NOT NULL,
    check_in_time     TIME NULL,
    check_out_time    TIME NULL,
    attendance_status ENUM('On Time','Late','Absent') NOT NULL DEFAULT 'Absent',
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (attendance_id),
    UNIQUE KEY uq_attendance_faculty_class_date (faculty_id, timetable_id, date),
    KEY idx_attendance_date (date),
    CONSTRAINT fk_attendance_faculty   FOREIGN KEY (faculty_id)   REFERENCES faculty(faculty_id)   ON DELETE CASCADE,
    CONSTRAINT fk_attendance_timetable FOREIGN KEY (timetable_id) REFERENCES timetable(timetable_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. ADMIN
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS admin;

CREATE TABLE admin (
    admin_id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username       VARCHAR(50)  NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,   -- bcrypt hash, never plaintext
    role           VARCHAR(30)  NOT NULL DEFAULT 'Admin',
    email          VARCHAR(150) NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id),
    UNIQUE KEY uq_admin_username (username),
    UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Views used by "Faculty Current Location" (module 9)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_faculty_current_status AS
SELECT
    f.faculty_id,
    f.full_name                AS faculty_name,
    d.department_name,
    sub.subject_name            AS current_subject,
    r.room_number                AS current_room,
    t.section                    AS current_class,
    t.timetable_id,
    a.check_in_time,
    COALESCE(a.attendance_status, 'Absent') AS attendance_status
FROM faculty f
LEFT JOIN department d ON d.department_id = f.department_id
LEFT JOIN timetable t
    ON t.faculty_id = f.faculty_id
   AND t.day_of_week = DAYNAME(CURDATE())
   AND CURTIME() BETWEEN t.start_time AND t.end_time
LEFT JOIN subject sub ON sub.subject_id = t.subject_id
LEFT JOIN room r ON r.room_id = t.room_id
LEFT JOIN attendance a
    ON a.faculty_id = f.faculty_id
   AND a.timetable_id = t.timetable_id
   AND a.date = CURDATE();

CREATE OR REPLACE VIEW vw_faculty_next_class AS
SELECT faculty_id, timetable_id, subject_id, room_id, start_time, end_time, section
FROM (
    SELECT t.*, ROW_NUMBER() OVER (PARTITION BY t.faculty_id ORDER BY t.start_time) AS rn
    FROM timetable t
    WHERE t.day_of_week = DAYNAME(CURDATE())
      AND t.start_time > CURTIME()
) ranked
WHERE rn = 1;
