// =====================================================================
// Faculty Current Location data access layer
// Reads the two views defined in 04_schema_extended.sql. No stored
// procedure wrapper needed since these are simple parameterized selects
// against views, not multi-step writes.
// =====================================================================
const pool = require('../config/db');

async function getCurrentStatus(facultyId) {
    const [rows] = await pool.query('SELECT * FROM vw_faculty_current_status WHERE faculty_id = ?', [facultyId]);
    return rows[0] || null;
}

async function getNextClass(facultyId) {
    const [rows] = await pool.query(
        `SELECT nc.*, sub.subject_name, r.room_number
         FROM vw_faculty_next_class nc
         JOIN subject sub ON sub.subject_id = nc.subject_id
         JOIN room r ON r.room_id = nc.room_id
         WHERE nc.faculty_id = ?`,
        [facultyId]
    );
    return rows[0] || null;
}

module.exports = { getCurrentStatus, getNextClass };
