const express = require('express');
const router = express.Router();
const biometricLogController = require('../controllers/biometricLogController');

// POST /api/biometric-logs                          -> device sends a scan event
// GET  /api/biometric-logs/faculty/:facultyId?date=  -> view raw logs

router.post('/', biometricLogController.receiveLog);
router.get('/faculty/:facultyId', biometricLogController.getByFaculty);

module.exports = router;
