// =====================================================================
// Attendance REST controller
// =====================================================================
const attendanceModel = require('../models/attendanceModel');
const handleDbError = require('../utils/handleDbError');

exports.getByFaculty = async (req, res) => {
    try {
        res.json(await attendanceModel.getByFaculty(req.params.facultyId, req.query.date));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getByDate = async (req, res) => {
    try {
        res.json(await attendanceModel.getByDate(req.query.date));
    } catch (err) {
        handleDbError(res, err);
    }
};

// POST /api/attendance/mark-absentees  { "date": "2026-07-27" }
// Intended to be called once a day (e.g. by a cron job) after classes end.
exports.markAbsentees = async (req, res) => {
    try {
        await attendanceModel.markAbsentees(req.body.date);
        res.json({ message: `Absentees marked for ${req.body.date}` });
    } catch (err) {
        handleDbError(res, err);
    }
};
