// =====================================================================
// Department REST controller
// =====================================================================
const departmentModel = require('../models/departmentModel');
const handleDbError = require('../utils/handleDbError');

exports.create = async (req, res) => {
    try {
        res.status(201).json(await departmentModel.createDepartment(req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getAll = async (req, res) => {
    try {
        res.json(await departmentModel.getAllDepartments());
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getById = async (req, res) => {
    try {
        const dept = await departmentModel.getDepartmentById(req.params.id);
        if (!dept) return res.status(404).json({ error: 'Department not found' });
        res.json(dept);
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.update = async (req, res) => {
    try {
        res.json(await departmentModel.updateDepartment(req.params.id, req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.remove = async (req, res) => {
    try {
        await departmentModel.deleteDepartment(req.params.id);
        res.status(204).send();
    } catch (err) {
        handleDbError(res, err);
    }
};
