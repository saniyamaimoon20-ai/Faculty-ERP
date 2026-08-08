// =====================================================================
// JWT auth middleware — optional, apply to any router you want to
// restrict to logged-in admins:
//   const authenticate = require('../middleware/authenticate');
//   router.post('/', authenticate, departmentController.create);
// =====================================================================
const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    try {
        req.admin = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
