// =====================================================================
// Room Allocation data access layer
// =====================================================================
const pool = require('../config/db');

function validate(data) {
    const required = ['faculty_id', 'room_id', 'subject_id', 'date', 'start_time', 'end_time'];
    for (const field of required) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    if (data.start_time >= data.end_time) {
        throw new Error('start_time must be before end_time');
    }
}

async function createAllocation(data) {
    validate(data);
    const conn = await pool.getConnection();
    try {
        await conn.query(
            `CALL sp_allocation_create(?,?,?,?,?,?,@new_id)`,
            [data.faculty_id, data.room_id, data.subject_id, data.date, data.start_time, data.end_time]
        );
        const [[{ new_id }]] = await conn.query('SELECT @new_id AS new_id');
        return new_id;
    } finally {
        conn.release();
    }
}

// "Support room allocation updates" — partial update of room/subject/date/time
async function updateAllocation(id, data) {
    validate(data);
    await pool.query(
        'CALL sp_allocation_update(?,?,?,?,?,?)',
        [id, data.room_id, data.subject_id, data.date, data.start_time, data.end_time]
    );
}

async function deleteAllocation(id) {
    await pool.query('CALL sp_allocation_delete(?)', [id]);
}

async function getCurrentAllocation(facultyId) {
    const [result] = await pool.query('CALL sp_allocation_get_current(?)', [facultyId]);
    return result[0][0] || null;
}

async function getAllocationsByFaculty(facultyId) {
    const [result] = await pool.query('CALL sp_allocation_get_by_faculty(?)', [facultyId]);
    return result[0];
}

module.exports = { createAllocation, updateAllocation, deleteAllocation, getCurrentAllocation, getAllocationsByFaculty };
