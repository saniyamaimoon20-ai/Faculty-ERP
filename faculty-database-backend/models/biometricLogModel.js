// =====================================================================
// Biometric Log data access layer
// Inserting a log auto-triggers attendance processing on the DB side
// (trg_biometric_log_after_insert -> sp_attendance_process_log), so
// this layer stays a thin passthrough to the device feed.
// =====================================================================
const pool = require('../config/db');

function validate(data) {
    const required = ['faculty_id', 'device_id', 'date'];
    for (const field of required) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    if (!data.check_in_time && !data.check_out_time) {
        throw new Error('At least one of check_in_time or check_out_time is required');
    }
}

async function createLog(data) {
    validate(data);
    const conn = await pool.getConnection();
    try {
        await conn.query(
            `CALL sp_biometric_log_create(?,?,?,?,?,@new_id)`,
            [data.faculty_id, data.device_id, data.date, data.check_in_time || null, data.check_out_time || null]
        );
        const [[{ new_id }]] = await conn.query('SELECT @new_id AS new_id');
        return { log_id: new_id, ...data };
    } finally {
        conn.release();
    }
}

async function getLogsByFaculty(facultyId, date) {
    const [result] = await pool.query('CALL sp_biometric_log_get_by_faculty(?,?)', [facultyId, date || null]);
    return result[0];
}

module.exports = { createLog, getLogsByFaculty };
