const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// GET    /api/rooms?room_type=&building=  -> list (with filters)
// GET    /api/rooms/:id                    -> get one
// POST   /api/rooms                        -> create
// PUT    /api/rooms/:id                     -> update
// DELETE /api/rooms/:id                     -> delete

router.get('/', roomController.getAll);
router.get('/:id', roomController.getById);
router.post('/', roomController.create);
router.put('/:id', roomController.update);
router.delete('/:id', roomController.remove);

module.exports = router;
