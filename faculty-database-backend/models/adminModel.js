// =====================================================================
// Admin data access layer
// Requires: npm install bcrypt jsonwebtoken  (not yet in package.json —
// see README_MODULE3.md for the exact command to run)
// =====================================================================
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

function validateCreate(data) {
    const required = ['username', 'password', 'email'];
    for (const field of required) {
        if (!data[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    if (data.password.length < 8) {
        throw new Error('password must be at least 8 characters');
    }
}

async function createAdmin(data) {
    validateCreate(data);
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const conn = await pool.getConnection();
    try {
        await conn.query(
            `CALL sp_admin_create(?,?,?,?,@new_id)`,
            [data.username, password_hash, data.role || 'Admin', data.email]
        );
        const [[{ new_id }]] = await conn.query('SELECT @new_id AS new_id');
        return getAdminById(new_id);
    } finally {
        conn.release();
    }
}

async function getAdminById(id) {
    const [result] = await pool.query('CALL sp_admin_get_by_id(?)', [id]);
    return result[0][0] || null;
}

// Used only by the login flow — includes the hash, never returned to the client
async function getAdminWithHashByUsername(username) {
    const [result] = await pool.query('CALL sp_admin_get_by_username(?)', [username]);
    return result[0][0] || null;
}

async function verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
}

module.exports = { createAdmin, getAdminById, getAdminWithHashByUsername, verifyPassword };
