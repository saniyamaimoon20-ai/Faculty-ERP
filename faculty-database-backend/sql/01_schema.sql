-- =====================================================================
-- Faculty Class Engagement Portal
-- Module   : Faculty Management
-- File     : 01_schema.sql
-- Purpose  : Creates the database and the `faculty` master table.
-- Engine   : MySQL 8.0.16+ (required for CHECK constraint enforcement)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS faculty_engagement_portal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE faculty_engagement_portal;

-- ---------------------------------------------------------------------
-- Table: faculty
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS faculty;

CREATE TABLE faculty (
    faculty_id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    employee_id           VARCHAR(20)     NOT NULL,
    full_name             VARCHAR(100)    NOT NULL,
    gender                ENUM('Male','Female','Other') NOT NULL,
    department            VARCHAR(100)    NOT NULL,
    designation           VARCHAR(100)    NOT NULL,
    email                 VARCHAR(150)    NOT NULL,
    phone_number          VARCHAR(15)     NOT NULL,
    qualification         VARCHAR(150)    NOT NULL,
    date_of_joining       DATE            NOT NULL,
    biometric_device_id   VARCHAR(50)     NOT NULL,
    status                ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    profile_photo_path    VARCHAR(255)    NULL,
    created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (faculty_id),

    -- Uniqueness rules
    UNIQUE KEY uq_faculty_employee_id   (employee_id),
    UNIQUE KEY uq_faculty_email         (email),
    UNIQUE KEY uq_faculty_biometric_id  (biometric_device_id),

    -- Lookup / filter performance
    KEY idx_faculty_department (department),
    KEY idx_faculty_designation (designation),
    KEY idx_faculty_status (status),
    KEY idx_faculty_full_name (full_name),

    -- Basic data validation (enforced from MySQL 8.0.16 onward)
    CONSTRAINT chk_faculty_email_format
        CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_faculty_phone_format
        CHECK (phone_number REGEXP '^[+]?[0-9 ()-]{7,15}$')
    -- Note: "date_of_joining must not be in the future" is validated at the
    -- application layer (see backend/models/facultyModel.js). MySQL/MariaDB
    -- do not allow non-deterministic functions like CURDATE() inside CHECK
    -- constraints, so it can't be enforced here.

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Master table of all teaching faculty in the college';

-- ---------------------------------------------------------------------
-- Convenience view: active faculty only (commonly needed by the UI
-- for dropdowns, class-assignment screens, engagement dashboards etc.)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_active_faculty AS
    SELECT faculty_id, employee_id, full_name, department, designation,
           email, phone_number, biometric_device_id, profile_photo_path
    FROM faculty
    WHERE status = 'Active';
