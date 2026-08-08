// =====================================================================
// Room Allocation REST controller
// =====================================================================
const allocationModel = require('../models/roomAllocationModel');
const handleDbError = require('../utils/handleDbError');

exports.allocate = async (req, res) => {
    try {
        const allocation_id = await allocationModel.createAllocation(req.body);
        res.status(201).json({ allocation_id, ...req.body });
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.update = async (req, res) => {
    try {
        await allocationModel.updateAllocation(req.params.id, req.body);
        res.json({ allocation_id: req.params.id, ...req.body });
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.remove = async (req, res) => {
    try {
        await allocationModel.deleteAllocation(req.params.id);
        res.status(204).send();
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getCurrent = async (req, res) => {
    try {
        res.json(await allocationModel.getCurrentAllocation(req.params.facultyId));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getByFaculty = async (req, res) => {
    try {
        res.json(await allocationModel.getAllocationsByFaculty(req.params.facultyId));
    } catch (err) {
        handleDbError(res, err);
    }
};
