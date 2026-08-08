const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// GET  /api/attendance?date=YYYY-MM-DD              -> everyone's status for a date
// GET  /api/attendance/faculty/:facultyId?date=      -> one faculty member's records
// POST /api/attendance/mark-absentees { date }        -> end-of-day absentee sweep

router.get('/', attendanceController.getByDate);
router.get('/faculty/:facultyId', attendanceController.getByFaculty);
router.post('/mark-absentees', attendanceController.markAbsentees);

module.exports = router;
