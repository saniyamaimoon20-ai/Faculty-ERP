// =====================================================================
// Timetable data access layer
// Overlap checking (same faculty / same room) happens inside the
// stored procedures — sp_timetable_create/update raise SQLSTATE 45000
// on conflict, which handleDbError.js turns into a 409.
// =====================================================================
const pool = require('../config/db');

const ALLOWED_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function validate(data) {
    const required = ['faculty_id', 'subject_id', 'room_id', 'day_of_week', 'start_time', 'end_time', 'semester', 'academic_year'];
    for (const field of required) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    if (!ALLOWED_DAYS.includes(data.day_of_week)) {
        throw new Error(`day_of_week must be one of: ${ALLOWED_DAYS.join(', ')}`);
    }
    if (data.start_time >= data.end_time) {
        throw new Error('start_time must be before end_time');
    }
}

async function createTimetable(data) {
    validate(data);
    const conn = await pool.getConnection();
    try {
        await conn.query(
            `CALL sp_timetable_create(?,?,?,?,?,?,?,?,?,@new_id)`,
            [data.faculty_id, data.subject_id, data.room_id, data.day_of_week, data.start_time,
             data.end_time, data.semester, data.section || null, data.academic_year]
        );
        const [[{ new_id }]] = await conn.query('SELECT @new_id AS new_id');
        return getTimetableById(new_id);
    } finally {
        conn.release();
    }
}

async function updateTimetable(id, data) {
    validate(data);
    await pool.query(
        'CALL sp_timetable_update(?,?,?,?,?,?,?,?,?,?)',
        [id, data.faculty_id, data.subject_id, data.room_id, data.day_of_week, data.start_time,
         data.end_time, data.semester, data.section || null, data.academic_year]
    );
    return getTimetableById(id);
}

async function deleteTimetable(id) {
    await pool.query('CALL sp_timetable_delete(?)', [id]);
}

async function getTimetableById(id) {
    const [result] = await pool.query('CALL sp_timetable_get_by_id(?)', [id]);
    return result[0][0] || null;
}

async function getTimetableByFaculty(facultyId, academicYear) {
    const [result] = await pool.query('CALL sp_timetable_get_by_faculty(?,?)', [facultyId, academicYear || null]);
    return result[0];
}

async function getTimetableByRoom(roomId) {
    const [result] = await pool.query('CALL sp_timetable_get_by_room(?)', [roomId]);
    return result[0];
}

module.exports = { createTimetable, updateTimetable, deleteTimetable, getTimetableById, getTimetableByFaculty, getTimetableByRoom };
