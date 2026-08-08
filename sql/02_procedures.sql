-- =====================================================================
-- Faculty Class Engagement Portal
-- Module   : Faculty Management
-- File     : 02_procedures.sql
-- Purpose  : CRUD stored procedures for the `faculty` table.
--            Keeping CRUD logic in procedures means the web app layer
--            only ever calls a proc name + params -> no raw SQL / no
--            SQL-injection surface in the application code.
-- =====================================================================

USE faculty_engagement_portal;

DELIMITER $$

-- ---------------------------------------------------------------------
-- CREATE
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_faculty_create $$
CREATE PROCEDURE sp_faculty_create (
    IN  p_employee_id         VARCHAR(20),
    IN  p_full_name           VARCHAR(100),
    IN  p_gender              VARCHAR(10),
    IN  p_department          VARCHAR(100),
    IN  p_designation         VARCHAR(100),
    IN  p_email               VARCHAR(150),
    IN  p_phone_number        VARCHAR(15),
    IN  p_qualification       VARCHAR(150),
    IN  p_date_of_joining     DATE,
    IN  p_biometric_device_id VARCHAR(50),
    IN  p_status              VARCHAR(10),
    IN  p_profile_photo_path  VARCHAR(255),
    OUT p_new_faculty_id      INT UNSIGNED
)
proc_body: BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO faculty (
        employee_id, full_name, gender, department, designation,
        email, phone_number, qualification, date_of_joining,
        biometric_device_id, status, profile_photo_path
    ) VALUES (
        p_employee_id, p_full_name, p_gender, p_department, p_designation,
        p_email, p_phone_number, p_qualification, p_date_of_joining,
        p_biometric_device_id, IFNULL(p_status, 'Active'), p_profile_photo_path
    );

    SET p_new_faculty_id = LAST_INSERT_ID();

    COMMIT;
END proc_body $$

-- ---------------------------------------------------------------------
-- READ (list, with optional filters — all optional filters pass NULL)
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_faculty_get_all $$
CREATE PROCEDURE sp_faculty_get_all (
    IN p_department VARCHAR(100),
    IN p_status     VARCHAR(10),
    IN p_search     VARCHAR(150)
)
BEGIN
    SELECT
        faculty_id, employee_id, full_name, gender, department, designation,
        email, phone_number, qualification, date_of_joining,
        biometric_device_id, status, profile_photo_path,
        created_at, updated_at
    FROM faculty
    WHERE (p_department IS NULL OR p_department = '' OR department = p_department)
      AND (p_status     IS NULL OR p_status = ''     OR status = p_status)
      AND (
            p_search IS NULL OR p_search = ''
            OR full_name   LIKE CONCAT('%', p_search, '%')
            OR employee_id LIKE CONCAT('%', p_search, '%')
            OR email       LIKE CONCAT('%', p_search, '%')
          )
    ORDER BY full_name ASC;
END $$

-- ---------------------------------------------------------------------
-- READ (single record by primary key)
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_faculty_get_by_id $$
CREATE PROCEDURE sp_faculty_get_by_id (
    IN p_faculty_id INT UNSIGNED
)
BEGIN
    SELECT
        faculty_id, employee_id, full_name, gender, department, designation,
        email, phone_number, qualification, date_of_joining,
        biometric_device_id, status, profile_photo_path,
        created_at, updated_at
    FROM faculty
    WHERE faculty_id = p_faculty_id;
END $$

-- ---------------------------------------------------------------------
-- UPDATE (full record update)
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_faculty_update $$
CREATE PROCEDURE sp_faculty_update (
    IN p_faculty_id           INT UNSIGNED,
    IN p_employee_id          VARCHAR(20),
    IN p_full_name            VARCHAR(100),
    IN p_gender               VARCHAR(10),
    IN p_department           VARCHAR(100),
    IN p_designation          VARCHAR(100),
    IN p_email                VARCHAR(150),
    IN p_phone_number         VARCHAR(15),
    IN p_qualification        VARCHAR(150),
    IN p_date_of_joining      DATE,
    IN p_biometric_device_id  VARCHAR(50),
    IN p_status               VARCHAR(10),
    IN p_profile_photo_path   VARCHAR(255)
)
proc_body: BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF NOT EXISTS (SELECT 1 FROM faculty WHERE faculty_id = p_faculty_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Faculty record not found for the given faculty_id';
    END IF;

    START TRANSACTION;

    UPDATE faculty
    SET employee_id         = p_employee_id,
        full_name           = p_full_name,
        gender              = p_gender,
        department          = p_department,
        designation         = p_designation,
        email               = p_email,
        phone_number        = p_phone_number,
        qualification       = p_qualification,
        date_of_joining     = p_date_of_joining,
        biometric_device_id = p_biometric_device_id,
        status              = p_status,
        profile_photo_path  = p_profile_photo_path
    WHERE faculty_id = p_faculty_id;

    COMMIT;
END proc_body $$

-- ---------------------------------------------------------------------
-- DELETE (soft delete — recommended, since faculty_id will be
-- referenced by future tables like classes/attendance/engagement logs)
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_faculty_deactivate $$
CREATE PROCEDURE sp_faculty_deactivate (
    IN p_faculty_id INT UNSIGNED
)
BEGIN
    UPDATE faculty SET status = 'Inactive' WHERE faculty_id = p_faculty_id;
END $$

DROP PROCEDURE IF EXISTS sp_faculty_reactivate $$
CREATE PROCEDURE sp_faculty_reactivate (
    IN p_faculty_id INT UNSIGNED
)
BEGIN
    UPDATE faculty SET status = 'Active' WHERE faculty_id = p_faculty_id;
END $$

-- ---------------------------------------------------------------------
-- DELETE (hard delete — permanent removal, for admin/data-cleanup use
-- only; will fail once other tables have a foreign key to faculty_id)
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_faculty_delete $$
CREATE PROCEDURE sp_faculty_delete (
    IN p_faculty_id INT UNSIGNED
)
BEGIN
    DELETE FROM faculty WHERE faculty_id = p_faculty_id;
END $$

DELIMITER ;
