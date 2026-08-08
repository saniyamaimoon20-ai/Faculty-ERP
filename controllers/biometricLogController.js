// =====================================================================
// Biometric Log REST controller
// This is the endpoint the biometric device (or its gateway) posts to.
// =====================================================================
const biometricLogModel = require('../models/biometricLogModel');
const handleDbError = require('../utils/handleDbError');

// POST /api/biometric-logs
exports.receiveLog = async (req, res) => {
    try {
        res.status(201).json(await biometricLogModel.createLog(req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

// GET /api/biometric-logs/faculty/:facultyId?date=YYYY-MM-DD
exports.getByFaculty = async (req, res) => {
    try {
        res.json(await biometricLogModel.getLogsByFaculty(req.params.facultyId, req.query.date));
    } catch (err) {
        handleDbError(res, err);
    }
};
