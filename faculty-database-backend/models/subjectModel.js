// =====================================================================
// Subject data access layer
// =====================================================================
const pool = require('../config/db');

function validate(data) {
    const required = ['subject_code', 'subject_name', 'semester', 'credits', 'department_id'];
    for (const field of required) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            throw new Error(`Missing required field: ${field}`);
        }
    }
}

async function createSubject(data) {
    validate(data);
    const conn = await pool.getConnection();
    try {
        await conn.query(
            `CALL sp_subject_create(?,?,?,?,?,@new_id)`,
            [data.subject_code, data.subject_name, data.semester, data.credits, data.department_id]
        );
        const [[{ new_id }]] = await conn.query('SELECT @new_id AS new_id');
        return getSubjectById(new_id);
    } finally {
        conn.release();
    }
}

async function getAllSubjects(filters = {}) {
    const [result] = await pool.query('CALL sp_subject_get_all(?,?)', [filters.department_id || null, filters.semester || null]);
    return result[0];
}

async function getSubjectById(id) {
    const [result] = await pool.query('CALL sp_subject_get_by_id(?)', [id]);
    return result[0][0] || null;
}

async function updateSubject(id, data) {
    validate(data);
    await pool.query(
        'CALL sp_subject_update(?,?,?,?,?,?)',
        [id, data.subject_code, data.subject_name, data.semester, data.credits, data.department_id]
    );
    return getSubjectById(id);
}

async function deleteSubject(id) {
    await pool.query('CALL sp_subject_delete(?)', [id]);
}

module.exports = { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject };
