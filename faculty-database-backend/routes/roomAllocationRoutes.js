const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/roomAllocationController');

// POST   /api/room-allocation                    -> allocate
// PUT    /api/room-allocation/:id                  -> update
// DELETE /api/room-allocation/:id                  -> remove
// GET    /api/room-allocation/current/:facultyId   -> current room right now
// GET    /api/room-allocation/faculty/:facultyId   -> full history

router.post('/', allocationController.allocate);
router.put('/:id', allocationController.update);
router.delete('/:id', allocationController.remove);
router.get('/current/:facultyId', allocationController.getCurrent);
router.get('/faculty/:facultyId', allocationController.getByFaculty);

module.exports = router;
