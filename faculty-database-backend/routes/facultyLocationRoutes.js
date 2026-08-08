const express = require('express');
const router = express.Router();
const facultyLocationController = require('../controllers/facultyLocationController');

// GET /api/faculty-location/:facultyId -> current room/subject/class/attendance/next class
router.get('/:facultyId', facultyLocationController.getLocation);

module.exports = router;
