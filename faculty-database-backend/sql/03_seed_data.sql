-- =====================================================================
-- Faculty Class Engagement Portal
-- File: 03_seed_data.sql  (optional — sample data for local testing)
-- =====================================================================

USE faculty_engagement_portal;

INSERT INTO faculty
    (employee_id, full_name, gender, department, designation, email,
     phone_number, qualification, date_of_joining, biometric_device_id,
     status, profile_photo_path)
VALUES
    ('FAC2021001', 'Dr. Anjali Rao', 'Female', 'Computer Science', 'Associate Professor',
     'anjali.rao@college.edu', '+91 9845012345', 'Ph.D in Computer Science',
     '2021-06-01', 'BIO-CSE-001', 'Active', NULL),

    ('FAC2019014', 'Prof. Suresh Kumar', 'Male', 'Electronics & Communication', 'Professor',
     'suresh.kumar@college.edu', '+91 9845098765', 'Ph.D in Electronics Engineering',
     '2019-07-15', 'BIO-ECE-014', 'Active', NULL),

    ('FAC2022007', 'Ms. Priya Nair', 'Female', 'Mathematics', 'Assistant Professor',
     'priya.nair@college.edu', '+91 9845011122', 'M.Sc Mathematics, NET Qualified',
     '2022-01-10', 'BIO-MAT-007', 'Active', NULL),

    ('FAC2015003', 'Dr. Vinod Shetty', 'Male', 'Mechanical Engineering', 'HOD',
     'vinod.shetty@college.edu', '+91 9845033445', 'Ph.D in Mechanical Engineering',
     '2015-08-01', 'BIO-MECH-003', 'Active', NULL),

    ('FAC2018009', 'Mrs. Deepa Pai', 'Female', 'Computer Science', 'Assistant Professor',
     'deepa.pai@college.edu', '+91 9845077889', 'M.Tech in Computer Science',
     '2018-12-05', 'BIO-CSE-009', 'Inactive', NULL);
