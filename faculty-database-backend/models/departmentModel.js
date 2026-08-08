// =====================================================================
// Department data access layer
// =====================================================================
const pool = require('../config/db');

function validate(data) {
    if (!data.department_name) {
        throw new Error('Missing required field: department_name');
    }
}

async function createDepartment(data) {
    validate(data);
    const conn = await pool.getConnection();
    try {
        await conn.query(
            `CALL sp_department_create(?,?,@new_id)`,
            [data.department_name, data.hod_name || null]
        );
        const [[{ new_id }]] = await conn.query('SELECT @new_id AS new_id');
        return getDepartmentById(new_id);
    } finally {
        conn.release();
    }
}

async function getAllDepartments() {
    const [result] = await pool.query('CALL sp_department_get_all()');
    return result[0];
}

async function getDepartmentById(id) {
    const [result] = await pool.query('CALL sp_department_get_by_id(?)', [id]);
    return result[0][0] || null;
}

async function updateDepartment(id, data) {
    validate(data);
    await pool.query('CALL sp_department_update(?,?,?)', [id, data.department_name, data.hod_name || null]);
    return getDepartmentById(id);
}

async function deleteDepartment(id) {
    await pool.query('CALL sp_department_delete(?)', [id]);
}

module.exports = { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment };
