const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');

// POST /api/admin/login   -> public, returns a JWT
// POST /api/admin          -> create a new admin account (protect this in production —
//                              e.g. require an existing admin token, or run it once via
//                              a seed script instead of exposing it publicly)

router.post('/login', adminController.login);
router.post('/', authenticate, adminController.create);

module.exports = router;
