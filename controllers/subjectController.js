// =====================================================================
// Subject REST controller
// =====================================================================
const subjectModel = require('../models/subjectModel');
const handleDbError = require('../utils/handleDbError');

exports.create = async (req, res) => {
    try {
        res.status(201).json(await subjectModel.createSubject(req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getAll = async (req, res) => {
    try {
        const { department_id, semester } = req.query;
        res.json(await subjectModel.getAllSubjects({ department_id, semester }));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getById = async (req, res) => {
    try {
        const subject = await subjectModel.getSubjectById(req.params.id);
        if (!subject) return res.status(404).json({ error: 'Subject not found' });
        res.json(subject);
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.update = async (req, res) => {
    try {
        res.json(await subjectModel.updateSubject(req.params.id, req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.remove = async (req, res) => {
    try {
        await subjectModel.deleteSubject(req.params.id);
        res.status(204).send();
    } catch (err) {
        handleDbError(res, err);
    }
};
