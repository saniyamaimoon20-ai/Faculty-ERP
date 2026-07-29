// =====================================================================
// Faculty data access layer
// Every function here maps 1:1 to a MySQL stored procedure, so the
// application never sends hand-built SQL to the database.
// =====================================================================
const pool = require('../config/db');

const ALLOWED_GENDER = ['Male', 'Female', 'Other'];
const ALLOWED_STATUS = ['Active', 'Inactive'];

/**
 * Basic field-level validation shared by create & update.
 * Throws an Error with a descriptive message on failure.
 */
function validateFacultyPayload(data) {
    const required = [
        'employee_id', 'full_name', 'gender', 'department', 'designation',
        'email', 'phone_number', 'qualification', 'date_of_joining',
        'biometric_device_id'
    ];
    for (const field of required) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    if (!ALLOWED_GENDER.includes(data.gender)) {
        throw new Error(`gender must be one of: ${ALLOWED_GENDER.join(', ')}`);
    }
    if (data.status && !ALLOWED_STATUS.includes(data.status)) {
        throw new Error(`status must be one of: ${ALLOWED_STATUS.join(', ')}`);
    }
    const today = new Date().toISOString().slice(0, 10);
    if (data.date_of_joining > today) {
        throw new Error('date_of_joining cannot be in the future');
    }
}

async function createFaculty(data) {
    validateFacultyPayload(data);
    const conn = await pool.getConnection();
    try {
        await conn.query(
            `CALL sp_faculty_create(?,?,?,?,?,?,?,?,?,?,?,?,@new_id)`,
            [
                data.employee_id, data.full_name, data.gender, data.department,
                data.designation, data.email, data.phone_number, data.qualification,
                data.date_of_joining, data.biometric_device_id,
                data.status || 'Active', data.profile_photo_path || null
            ]
        );
        const [[{ new_id }]] = await conn.query('SELECT @new_id AS new_id');
        return getFacultyById(new_id);
    } finally {
        conn.release();
    }
}

async function getAllFaculty(filters = {}) {
    const [result] = await pool.query(
        'CALL sp_faculty_get_all(?,?,?)',
        [filters.department || null, filters.status || null, filters.search || null]
    );
    return result[0]; // first result set = the SELECT rows
}

async function getFacultyById(facultyId) {
    const [result] = await pool.query('CALL sp_faculty_get_by_id(?)', [facultyId]);
    return result[0][0] || null;
}

async function updateFaculty(facultyId, data) {
    validateFacultyPayload(data);
    await pool.query(
        `CALL sp_faculty_update(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
            facultyId, data.employee_id, data.full_name, data.gender, data.department,
            data.designation, data.email, data.phone_number, data.qualification,
            data.date_of_joining, data.biometric_device_id,
            data.status || 'Active', data.profile_photo_path || null
        ]
    );
    return getFacultyById(facultyId);
}

async function deactivateFaculty(facultyId) {
    await pool.query('CALL sp_faculty_deactivate(?)', [facultyId]);
    return getFacultyById(facultyId);
}

async function reactivateFaculty(facultyId) {
    await pool.query('CALL sp_faculty_reactivate(?)', [facultyId]);
    return getFacultyById(facultyId);
}

async function deleteFaculty(facultyId) {
    await pool.query('CALL sp_faculty_delete(?)', [facultyId]);
}

module.exports = {
    createFaculty,
    getAllFaculty,
    getFacultyById,
    updateFaculty,
    deactivateFaculty,
    reactivateFaculty,
    deleteFaculty
};
