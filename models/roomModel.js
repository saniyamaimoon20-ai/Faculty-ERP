// =====================================================================
// Room data access layer
// =====================================================================
const pool = require('../config/db');

const ALLOWED_TYPES = ['Lab', 'Classroom'];

function validate(data) {
    if (!data.room_number) {
        throw new Error('Missing required field: room_number');
    }
    if (data.room_type && !ALLOWED_TYPES.includes(data.room_type)) {
        throw new Error(`room_type must be one of: ${ALLOWED_TYPES.join(', ')}`);
    }
}

async function createRoom(data) {
    validate(data);
    const conn = await pool.getConnection();
    try {
        await conn.query(
            `CALL sp_room_create(?,?,?,?,?,@new_id)`,
            [data.room_number, data.building || null, data.floor || null, data.capacity || null, data.room_type || 'Classroom']
        );
        const [[{ new_id }]] = await conn.query('SELECT @new_id AS new_id');
        return getRoomById(new_id);
    } finally {
        conn.release();
    }
}

async function getAllRooms(filters = {}) {
    const [result] = await pool.query('CALL sp_room_get_all(?,?)', [filters.room_type || null, filters.building || null]);
    return result[0];
}

async function getRoomById(id) {
    const [result] = await pool.query('CALL sp_room_get_by_id(?)', [id]);
    return result[0][0] || null;
}

async function updateRoom(id, data) {
    validate(data);
    await pool.query(
        'CALL sp_room_update(?,?,?,?,?,?)',
        [id, data.room_number, data.building || null, data.floor || null, data.capacity || null, data.room_type || 'Classroom']
    );
    return getRoomById(id);
}

async function deleteRoom(id) {
    await pool.query('CALL sp_room_delete(?)', [id]);
}

module.exports = { createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom };
