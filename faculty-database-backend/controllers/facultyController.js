// =====================================================================
// Faculty REST controller
// Translates HTTP requests <-> facultyModel calls, and maps DB errors
// (duplicate key, custom SIGNALs, validation errors) to clean HTTP
// status codes/messages for the frontend to display.
// =====================================================================
const facultyModel = require('../models/facultyModel');

function handleError(res, err) {
    // Duplicate employee_id / email / biometric_device_id
    if (err.errno === 1062) {
        return res.status(409).json({ error: 'Duplicate value', detail: err.sqlMessage });
    }
    // CHECK constraint failure (bad email/phone format) - MySQL 8.0.16+
    if (err.errno === 3819 || err.errno === 4025) {
        return res.status(400).json({ error: 'Validation failed', detail: err.sqlMessage });
    }
    // Custom SIGNAL raised inside a stored procedure (e.g. record not found)
    if (err.sqlState === '45000') {
        return res.status(404).json({ error: err.sqlMessage });
    }
    // Payload validation thrown in facultyModel.js
    if (err.message && !err.sqlState) {
        return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
}

exports.create = async (req, res) => {
    try {
        const faculty = await facultyModel.createFaculty(req.body);
        res.status(201).json(faculty);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getAll = async (req, res) => {
    try {
        const { department, status, search } = req.query;
        const rows = await facultyModel.getAllFaculty({ department, status, search });
        res.json(rows);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getById = async (req, res) => {
    try {
        const faculty = await facultyModel.getFacultyById(req.params.id);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
        res.json(faculty);
    } catch (err) {
        handleError(res, err);
    }
};

exports.update = async (req, res) => {
    try {
        const faculty = await facultyModel.updateFaculty(req.params.id, req.body);
        res.json(faculty);
    } catch (err) {
        handleError(res, err);
    }
};

// Soft delete (recommended) - sets status = 'Inactive'
exports.deactivate = async (req, res) => {
    try {
        const faculty = await facultyModel.deactivateFaculty(req.params.id);
        res.json(faculty);
    } catch (err) {
        handleError(res, err);
    }
};

exports.reactivate = async (req, res) => {
    try {
        const faculty = await facultyModel.reactivateFaculty(req.params.id);
        res.json(faculty);
    } catch (err) {
        handleError(res, err);
    }
};

// Hard delete (permanent) - admin use only
exports.remove = async (req, res) => {
    try {
        await facultyModel.deleteFaculty(req.params.id);
        res.status(204).send();
    } catch (err) {
        handleError(res, err);
    }
};
