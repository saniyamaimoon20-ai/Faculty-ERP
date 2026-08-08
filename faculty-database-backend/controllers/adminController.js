// =====================================================================
// Admin REST controller — account creation + login
// Requires JWT_SECRET set in .env (see README_MODULE3.md)
// =====================================================================
const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');
const handleDbError = require('../utils/handleDbError');

exports.create = async (req, res) => {
    try {
        res.status(201).json(await adminModel.createAdmin(req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

// POST /api/admin/login  { username, password }
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        const admin = await adminModel.getAdminWithHashByUsername(username);
        if (!admin) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const valid = await adminModel.verifyPassword(password, admin.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { admin_id: admin.admin_id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            admin: { admin_id: admin.admin_id, username: admin.username, role: admin.role, email: admin.email }
        });
    } catch (err) {
        handleDbError(res, err);
    }
};
