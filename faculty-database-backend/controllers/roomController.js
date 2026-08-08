// =====================================================================
// Room REST controller
// =====================================================================
const roomModel = require('../models/roomModel');
const handleDbError = require('../utils/handleDbError');

exports.create = async (req, res) => {
    try {
        res.status(201).json(await roomModel.createRoom(req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getAll = async (req, res) => {
    try {
        const { room_type, building } = req.query;
        res.json(await roomModel.getAllRooms({ room_type, building }));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.getById = async (req, res) => {
    try {
        const room = await roomModel.getRoomById(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json(room);
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.update = async (req, res) => {
    try {
        res.json(await roomModel.updateRoom(req.params.id, req.body));
    } catch (err) {
        handleDbError(res, err);
    }
};

exports.remove = async (req, res) => {
    try {
        await roomModel.deleteRoom(req.params.id);
        res.status(204).send();
    } catch (err) {
        handleDbError(res, err);
    }
};
