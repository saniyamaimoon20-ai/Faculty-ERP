// =====================================================================
// Timetable REST controller
// =====================================================================
const timetableModel = require('../models/timetableModel');
const handleDbError = require('../utils/handleDbError');

exports.create = async (req, res) => {
    try {
        res.status(201).json(await timetableModel.createTimetable(req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.update = async (req, res) => {
    try {
        res.json(await timetableModel.updateTimetable(req.params.id, req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.remove = async (req, res) => {
    try {
        await timetableModel.deleteTimetable(req.params.id);
        res.status(204).send();
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getById = async (req, res) => {
    try {
        const entry = await timetableModel.getTimetableById(req.params.id);
        if (!entry) return res.status(404).json({ error: 'Timetable entry not found' });
        res.json(entry);
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getByFaculty = async (req, res) => {
    try {
        res.json(await timetableModel.getTimetableByFaculty(req.params.facultyId, req.query.academic_year));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getByRoom = async (req, res) => {
    try {
        res.json(await timetableModel.getTimetableByRoom(req.params.roomId));
    } catch (err) {
        handleDbError(res, err);
    }
};
