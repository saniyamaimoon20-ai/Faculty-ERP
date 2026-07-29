// =====================================================================
// Attendance data access layer
// Records here are written automatically by the biometric_log trigger,
// plus the daily sp_attendance_mark_absentees batch job for no-shows.
// This layer is read-mostly from the app side.
// =====================================================================
const pool = require('../config/db');

async function getByFaculty(facultyId, date) {
    const [result] = await pool.query('CALL sp_attendance_get_by_faculty(?,?)', [facultyId, date || null]);
    return result[0];
}

async function getByDate(date) {
    if (!date) throw new Error('Missing required query param: date');
    const [result] = await pool.query('CALL sp_attendance_get_by_date(?)', [date]);
    return result[0];
}

// Trigger the end-of-day absentee sweep for a given date (normally run by a cron job)
async function markAbsentees(date) {
    if (!date) throw new Error('Missing required field: date');
    await pool.query('CALL sp_attendance_mark_absentees(?)', [date]);
}

module.exports = { getByFaculty, getByDate, markAbsentees };
