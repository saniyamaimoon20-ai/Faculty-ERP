-- =====================================================================
-- Faculty Class Engagement Portal
-- File     : 05_procedures_extended.sql
-- Purpose  : CRUD stored procedures for Department, Subject, Room,
--            Timetable, Room Allocation, Biometric_Log, Attendance, Admin.
-- Run after: 04_schema_extended.sql
-- =====================================================================

USE faculty_engagement_portal;

DELIMITER $$

-- =====================================================================
-- DEPARTMENT
-- =====================================================================
DROP PROCEDURE IF EXISTS sp_department_create $$
CREATE PROCEDURE sp_department_create (
    IN  p_department_name VARCHAR(100),
    IN  p_hod_name        VARCHAR(100),
    OUT p_new_department_id INT UNSIGNED
)
BEGIN
    INSERT INTO department (department_name, hod_name) VALUES (p_department_name, p_hod_name);
    SET p_new_department_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_department_get_all $$
CREATE PROCEDURE sp_department_get_all ()
BEGIN
    SELECT department_id, department_name, hod_name, created_at, updated_at FROM department ORDER BY department_name;
END $$

DROP PROCEDURE IF EXISTS sp_department_get_by_id $$
CREATE PROCEDURE sp_department_get_by_id (IN p_department_id INT UNSIGNED)
BEGIN
    SELECT department_id, department_name, hod_name, created_at, updated_at FROM department WHERE department_id = p_department_id;
END $$

DROP PROCEDURE IF EXISTS sp_department_update $$
CREATE PROCEDURE sp_department_update (
    IN p_department_id INT UNSIGNED,
    IN p_department_name VARCHAR(100),
    IN p_hod_name VARCHAR(100)
)
proc_body: BEGIN
    IF NOT EXISTS (SELECT 1 FROM department WHERE department_id = p_department_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Department not found';
    END IF;
    UPDATE department SET department_name = p_department_name, hod_name = p_hod_name WHERE department_id = p_department_id;
END proc_body $$

DROP PROCEDURE IF EXISTS sp_department_delete $$
CREATE PROCEDURE sp_department_delete (IN p_department_id INT UNSIGNED)
BEGIN
    DELETE FROM department WHERE department_id = p_department_id;
END $$


-- =====================================================================
-- SUBJECT
-- =====================================================================
DROP PROCEDURE IF EXISTS sp_subject_create $$
CREATE PROCEDURE sp_subject_create (
    IN  p_subject_code VARCHAR(20),
    IN  p_subject_name VARCHAR(150),
    IN  p_semester VARCHAR(20),
    IN  p_credits TINYINT UNSIGNED,
    IN  p_department_id INT UNSIGNED,
    OUT p_new_subject_id INT UNSIGNED
)
BEGIN
    INSERT INTO subject (subject_code, subject_name, semester, credits, department_id)
    VALUES (p_subject_code, p_subject_name, p_semester, p_credits, p_department_id);
    SET p_new_subject_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_subject_get_all $$
CREATE PROCEDURE sp_subject_get_all (IN p_department_id INT UNSIGNED, IN p_semester VARCHAR(20))
BEGIN
    SELECT s.subject_id, s.subject_code, s.subject_name, s.semester, s.credits,
           s.department_id, d.department_name, s.created_at, s.updated_at
    FROM subject s
    JOIN department d ON d.department_id = s.department_id
    WHERE (p_department_id IS NULL OR s.department_id = p_department_id)
      AND (p_semester IS NULL OR p_semester = '' OR s.semester = p_semester)
    ORDER BY s.subject_name;
END $$

DROP PROCEDURE IF EXISTS sp_subject_get_by_id $$
CREATE PROCEDURE sp_subject_get_by_id (IN p_subject_id INT UNSIGNED)
BEGIN
    SELECT subject_id, subject_code, subject_name, semester, credits, department_id, created_at, updated_at
    FROM subject WHERE subject_id = p_subject_id;
END $$

DROP PROCEDURE IF EXISTS sp_subject_update $$
CREATE PROCEDURE sp_subject_update (
    IN p_subject_id INT UNSIGNED,
    IN p_subject_code VARCHAR(20),
    IN p_subject_name VARCHAR(150),
    IN p_semester VARCHAR(20),
    IN p_credits TINYINT UNSIGNED,
    IN p_department_id INT UNSIGNED
)
proc_body: BEGIN
    IF NOT EXISTS (SELECT 1 FROM subject WHERE subject_id = p_subject_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Subject not found';
    END IF;
    UPDATE subject
    SET subject_code = p_subject_code, subject_name = p_subject_name, semester = p_semester,
        credits = p_credits, department_id = p_department_id
    WHERE subject_id = p_subject_id;
END proc_body $$

DROP PROCEDURE IF EXISTS sp_subject_delete $$
CREATE PROCEDURE sp_subject_delete (IN p_subject_id INT UNSIGNED)
BEGIN
    DELETE FROM subject WHERE subject_id = p_subject_id;
END $$


-- =====================================================================
-- ROOM
-- =====================================================================
DROP PROCEDURE IF EXISTS sp_room_create $$
CREATE PROCEDURE sp_room_create (
    IN  p_room_number VARCHAR(20),
    IN  p_building VARCHAR(50),
    IN  p_floor VARCHAR(10),
    IN  p_capacity SMALLINT UNSIGNED,
    IN  p_room_type VARCHAR(10),
    OUT p_new_room_id INT UNSIGNED
)
BEGIN
    INSERT INTO room (room_number, building, floor, capacity, room_type)
    VALUES (p_room_number, p_building, p_floor, p_capacity, IFNULL(p_room_type, 'Classroom'));
    SET p_new_room_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_room_get_all $$
CREATE PROCEDURE sp_room_get_all (IN p_room_type VARCHAR(10), IN p_building VARCHAR(50))
BEGIN
    SELECT room_id, room_number, building, floor, capacity, room_type, created_at, updated_at
    FROM room
    WHERE (p_room_type IS NULL OR p_room_type = '' OR room_type = p_room_type)
      AND (p_building IS NULL OR p_building = '' OR building = p_building)
    ORDER BY building, room_number;
END $$

DROP PROCEDURE IF EXISTS sp_room_get_by_id $$
CREATE PROCEDURE sp_room_get_by_id (IN p_room_id INT UNSIGNED)
BEGIN
    SELECT room_id, room_number, building, floor, capacity, room_type, created_at, updated_at
    FROM room WHERE room_id = p_room_id;
END $$

DROP PROCEDURE IF EXISTS sp_room_update $$
CREATE PROCEDURE sp_room_update (
    IN p_room_id INT UNSIGNED,
    IN p_room_number VARCHAR(20),
    IN p_building VARCHAR(50),
    IN p_floor VARCHAR(10),
    IN p_capacity SMALLINT UNSIGNED,
    IN p_room_type VARCHAR(10)
)
proc_body: BEGIN
    IF NOT EXISTS (SELECT 1 FROM room WHERE room_id = p_room_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room not found';
    END IF;
    UPDATE room
    SET room_number = p_room_number, building = p_building, floor = p_floor,
        capacity = p_capacity, room_type = p_room_type
    WHERE room_id = p_room_id;
END proc_body $$

DROP PROCEDURE IF EXISTS sp_room_delete $$
CREATE PROCEDURE sp_room_delete (IN p_room_id INT UNSIGNED)
BEGIN
    DELETE FROM room WHERE room_id = p_room_id;
END $$


-- =====================================================================
-- TIMETABLE — with overlap prevention for the same faculty OR same room
-- =====================================================================
DROP PROCEDURE IF EXISTS sp_timetable_create $$
CREATE PROCEDURE sp_timetable_create (
    IN  p_faculty_id INT UNSIGNED,
    IN  p_subject_id INT UNSIGNED,
    IN  p_room_id INT UNSIGNED,
    IN  p_day_of_week VARCHAR(10),
    IN  p_start_time TIME,
    IN  p_end_time TIME,
    IN  p_semester VARCHAR(20),
    IN  p_section VARCHAR(10),
    IN  p_academic_year VARCHAR(9),
    OUT p_new_timetable_id INT UNSIGNED
)
proc_body: BEGIN
    IF EXISTS (
        SELECT 1 FROM timetable
        WHERE academic_year = p_academic_year
          AND day_of_week = p_day_of_week
          AND (faculty_id = p_faculty_id OR room_id = p_room_id)
          AND p_start_time < end_time
          AND p_end_time > start_time
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Schedule conflict: faculty or room already booked for an overlapping time slot';
    END IF;

    INSERT INTO timetable (faculty_id, subject_id, room_id, day_of_week, start_time, end_time, semester, section, academic_year)
    VALUES (p_faculty_id, p_subject_id, p_room_id, p_day_of_week, p_start_time, p_end_time, p_semester, p_section, p_academic_year);

    SET p_new_timetable_id = LAST_INSERT_ID();
END proc_body $$

DROP PROCEDURE IF EXISTS sp_timetable_update $$
CREATE PROCEDURE sp_timetable_update (
    IN p_timetable_id INT UNSIGNED,
    IN p_faculty_id INT UNSIGNED,
    IN p_subject_id INT UNSIGNED,
    IN p_room_id INT UNSIGNED,
    IN p_day_of_week VARCHAR(10),
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_semester VARCHAR(20),
    IN p_section VARCHAR(10),
    IN p_academic_year VARCHAR(9)
)
proc_body: BEGIN
    IF NOT EXISTS (SELECT 1 FROM timetable WHERE timetable_id = p_timetable_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Timetable entry not found';
    END IF;

    IF EXISTS (
        SELECT 1 FROM timetable
        WHERE timetable_id <> p_timetable_id
          AND academic_year = p_academic_year
          AND day_of_week = p_day_of_week
          AND (faculty_id = p_faculty_id OR room_id = p_room_id)
          AND p_start_time < end_time
          AND p_end_time > start_time
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Schedule conflict: faculty or room already booked for an overlapping time slot';
    END IF;

    UPDATE timetable
    SET faculty_id = p_faculty_id, subject_id = p_subject_id, room_id = p_room_id,
        day_of_week = p_day_of_week, start_time = p_start_time, end_time = p_end_time,
        semester = p_semester, section = p_section, academic_year = p_academic_year
    WHERE timetable_id = p_timetable_id;
END proc_body $$

DROP PROCEDURE IF EXISTS sp_timetable_delete $$
CREATE PROCEDURE sp_timetable_delete (IN p_timetable_id INT UNSIGNED)
BEGIN
    DELETE FROM timetable WHERE timetable_id = p_timetable_id;
END $$

DROP PROCEDURE IF EXISTS sp_timetable_get_by_id $$
CREATE PROCEDURE sp_timetable_get_by_id (IN p_timetable_id INT UNSIGNED)
BEGIN
    SELECT * FROM timetable WHERE timetable_id = p_timetable_id;
END $$

DROP PROCEDURE IF EXISTS sp_timetable_get_by_faculty $$
CREATE PROCEDURE sp_timetable_get_by_faculty (IN p_faculty_id INT UNSIGNED, IN p_academic_year VARCHAR(9))
BEGIN
    SELECT t.*, sub.subject_name, r.room_number
    FROM timetable t
    JOIN subject sub ON sub.subject_id = t.subject_id
    JOIN room r ON r.room_id = t.room_id
    WHERE t.faculty_id = p_faculty_id
      AND (p_academic_year IS NULL OR p_academic_year = '' OR t.academic_year = p_academic_year)
    ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), t.start_time;
END $$

DROP PROCEDURE IF EXISTS sp_timetable_get_by_room $$
CREATE PROCEDURE sp_timetable_get_by_room (IN p_room_id INT UNSIGNED)
BEGIN
    SELECT t.*, f.full_name AS faculty_name, sub.subject_name
    FROM timetable t
    JOIN faculty f ON f.faculty_id = t.faculty_id
    JOIN subject sub ON sub.subject_id = t.subject_id
    WHERE t.room_id = p_room_id
    ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), t.start_time;
END $$


-- =====================================================================
-- ROOM ALLOCATION
-- =====================================================================
DROP PROCEDURE IF EXISTS sp_allocation_create $$
CREATE PROCEDURE sp_allocation_create (
    IN  p_faculty_id INT UNSIGNED,
    IN  p_room_id INT UNSIGNED,
    IN  p_subject_id INT UNSIGNED,
    IN  p_date DATE,
    IN  p_start_time TIME,
    IN  p_end_time TIME,
    OUT p_new_allocation_id INT UNSIGNED
)
proc_body: BEGIN
    IF EXISTS (
        SELECT 1 FROM room_allocation
        WHERE room_id = p_room_id AND date = p_date
          AND p_start_time < end_time AND p_end_time > start_time
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room already allocated for an overlapping time on this date';
    END IF;

    INSERT INTO room_allocation (faculty_id, room_id, subject_id, date, start_time, end_time)
    VALUES (p_faculty_id, p_room_id, p_subject_id, p_date, p_start_time, p_end_time);
    SET p_new_allocation_id = LAST_INSERT_ID();
END proc_body $$

DROP PROCEDURE IF EXISTS sp_allocation_update $$
CREATE PROCEDURE sp_allocation_update (
    IN p_allocation_id INT UNSIGNED,
    IN p_room_id INT UNSIGNED,
    IN p_subject_id INT UNSIGNED,
    IN p_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME
)
proc_body: BEGIN
    IF NOT EXISTS (SELECT 1 FROM room_allocation WHERE allocation_id = p_allocation_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Allocation not found';
    END IF;

    IF EXISTS (
        SELECT 1 FROM room_allocation
        WHERE allocation_id <> p_allocation_id AND room_id = p_room_id AND date = p_date
          AND p_start_time < end_time AND p_end_time > start_time
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room already allocated for an overlapping time on this date';
    END IF;

    UPDATE room_allocation
    SET room_id = p_room_id, subject_id = p_subject_id, date = p_date,
        start_time = p_start_time, end_time = p_end_time
    WHERE allocation_id = p_allocation_id;
END proc_body $$

DROP PROCEDURE IF EXISTS sp_allocation_delete $$
CREATE PROCEDURE sp_allocation_delete (IN p_allocation_id INT UNSIGNED)
BEGIN
    DELETE FROM room_allocation WHERE allocation_id = p_allocation_id;
END $$

DROP PROCEDURE IF EXISTS sp_allocation_get_current $$
CREATE PROCEDURE sp_allocation_get_current (IN p_faculty_id INT UNSIGNED)
BEGIN
    SELECT ra.*, r.room_number, r.building
    FROM room_allocation ra
    JOIN room r ON r.room_id = ra.room_id
    WHERE ra.faculty_id = p_faculty_id AND ra.date = CURDATE()
      AND CURTIME() BETWEEN ra.start_time AND ra.end_time
    LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_allocation_get_by_faculty $$
CREATE PROCEDURE sp_allocation_get_by_faculty (IN p_faculty_id INT UNSIGNED)
BEGIN
    SELECT ra.*, r.room_number, r.building
    FROM room_allocation ra
    JOIN room r ON r.room_id = ra.room_id
    WHERE ra.faculty_id = p_faculty_id
    ORDER BY ra.date DESC, ra.start_time;
END $$


-- =====================================================================
-- BIOMETRIC_LOG — raw device feed. Inserting a log auto-triggers
-- attendance processing (see trg_biometric_log_after_insert below).
-- =====================================================================
DROP PROCEDURE IF EXISTS sp_biometric_log_create $$
CREATE PROCEDURE sp_biometric_log_create (
    IN  p_faculty_id INT UNSIGNED,
    IN  p_device_id VARCHAR(50),
    IN  p_date DATE,
    IN  p_check_in_time TIME,
    IN  p_check_out_time TIME,
    OUT p_new_log_id INT UNSIGNED
)
BEGIN
    INSERT INTO biometric_log (faculty_id, device_id, date, check_in_time, check_out_time)
    VALUES (p_faculty_id, p_device_id, p_date, p_check_in_time, p_check_out_time);
    SET p_new_log_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_biometric_log_get_by_faculty $$
CREATE PROCEDURE sp_biometric_log_get_by_faculty (IN p_faculty_id INT UNSIGNED, IN p_date DATE)
BEGIN
    SELECT * FROM biometric_log
    WHERE faculty_id = p_faculty_id
      AND (p_date IS NULL OR date = p_date)
    ORDER BY date DESC, check_in_time DESC;
END $$


-- =====================================================================
-- ATTENDANCE PROCESSING
-- Matches a biometric log to the faculty member's closest scheduled
-- class that day and writes/updates the Attendance row with the
-- correct status. Runs automatically after every biometric_log insert.
-- =====================================================================
DROP PROCEDURE IF EXISTS sp_attendance_process_log $$
CREATE PROCEDURE sp_attendance_process_log (IN p_log_id INT UNSIGNED)
proc_body: BEGIN
    DECLARE v_faculty_id INT UNSIGNED;
    DECLARE v_date DATE;
    DECLARE v_check_in TIME;
    DECLARE v_check_out TIME;
    DECLARE v_timetable_id INT UNSIGNED;
    DECLARE v_start_time TIME;
    DECLARE v_status VARCHAR(10);

    SELECT faculty_id, date, check_in_time, check_out_time
      INTO v_faculty_id, v_date, v_check_in, v_check_out
      FROM biometric_log WHERE log_id = p_log_id;

    IF v_check_in IS NULL THEN
        LEAVE proc_body; -- nothing to match against yet
    END IF;

    -- Closest scheduled class that day (by day-of-week name) to this check-in
    SELECT t.timetable_id, t.start_time
      INTO v_timetable_id, v_start_time
      FROM timetable t
      WHERE t.faculty_id = v_faculty_id
        AND t.day_of_week = DAYNAME(v_date)
      ORDER BY ABS(TIME_TO_SEC(TIMEDIFF(t.start_time, v_check_in)))
      LIMIT 1;

    IF v_timetable_id IS NULL THEN
        LEAVE proc_body; -- no class scheduled that day, nothing to record
    END IF;

    SET v_status = IF(v_check_in <= v_start_time, 'On Time', 'Late');

    INSERT INTO attendance (faculty_id, timetable_id, date, check_in_time, check_out_time, attendance_status)
    VALUES (v_faculty_id, v_timetable_id, v_date, v_check_in, v_check_out, v_status)
    ON DUPLICATE KEY UPDATE
        check_in_time = VALUES(check_in_time),
        check_out_time = VALUES(check_out_time),
        attendance_status = VALUES(attendance_status);
END proc_body $$

-- Trigger: every time the biometric device feed writes a log, process it immediately
DROP TRIGGER IF EXISTS trg_biometric_log_after_insert $$
CREATE TRIGGER trg_biometric_log_after_insert
AFTER INSERT ON biometric_log
FOR EACH ROW
BEGIN
    CALL sp_attendance_process_log(NEW.log_id);
END $$

-- Batch job (run once daily, e.g. at end of day via cron): marks every
-- scheduled class with no attendance record as Absent. This is what makes
-- "no biometric record -> Absent" work, since absence can't be triggered
-- by an insert that never happens.
DROP PROCEDURE IF EXISTS sp_attendance_mark_absentees $$
CREATE PROCEDURE sp_attendance_mark_absentees (IN p_date DATE)
BEGIN
    INSERT INTO attendance (faculty_id, timetable_id, date, attendance_status)
    SELECT t.faculty_id, t.timetable_id, p_date, 'Absent'
    FROM timetable t
    WHERE t.day_of_week = DAYNAME(p_date)
      AND NOT EXISTS (
          SELECT 1 FROM attendance a
          WHERE a.timetable_id = t.timetable_id AND a.date = p_date
      );
END $$

DROP PROCEDURE IF EXISTS sp_attendance_get_by_faculty $$
CREATE PROCEDURE sp_attendance_get_by_faculty (IN p_faculty_id INT UNSIGNED, IN p_date DATE)
BEGIN
    SELECT a.*, sub.subject_name, t.start_time AS class_start_time
    FROM attendance a
    JOIN timetable t ON t.timetable_id = a.timetable_id
    JOIN subject sub ON sub.subject_id = t.subject_id
    WHERE a.faculty_id = p_faculty_id
      AND (p_date IS NULL OR a.date = p_date)
    ORDER BY a.date DESC, t.start_time;
END $$

DROP PROCEDURE IF EXISTS sp_attendance_get_by_date $$
CREATE PROCEDURE sp_attendance_get_by_date (IN p_date DATE)
BEGIN
    SELECT a.*, f.full_name AS faculty_name, sub.subject_name
    FROM attendance a
    JOIN faculty f ON f.faculty_id = a.faculty_id
    JOIN timetable t ON t.timetable_id = a.timetable_id
    JOIN subject sub ON sub.subject_id = t.subject_id
    WHERE a.date = p_date
    ORDER BY f.full_name;
END $$


-- =====================================================================
-- ADMIN
-- =====================================================================
DROP PROCEDURE IF EXISTS sp_admin_create $$
CREATE PROCEDURE sp_admin_create (
    IN  p_username VARCHAR(50),
    IN  p_password_hash VARCHAR(255),
    IN  p_role VARCHAR(30),
    IN  p_email VARCHAR(150),
    OUT p_new_admin_id INT UNSIGNED
)
BEGIN
    INSERT INTO admin (username, password_hash, role, email)
    VALUES (p_username, p_password_hash, IFNULL(p_role, 'Admin'), p_email);
    SET p_new_admin_id = LAST_INSERT_ID();
END $$

-- Used only by the login flow — returns the hash so bcrypt.compare() can run in Node.
DROP PROCEDURE IF EXISTS sp_admin_get_by_username $$
CREATE PROCEDURE sp_admin_get_by_username (IN p_username VARCHAR(50))
BEGIN
    SELECT admin_id, username, password_hash, role, email FROM admin WHERE username = p_username;
END $$

DROP PROCEDURE IF EXISTS sp_admin_get_by_id $$
CREATE PROCEDURE sp_admin_get_by_id (IN p_admin_id INT UNSIGNED)
BEGIN
    SELECT admin_id, username, role, email, created_at, updated_at FROM admin WHERE admin_id = p_admin_id;
END $$

DELIMITER ;
