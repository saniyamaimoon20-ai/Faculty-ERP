const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

// GET    /api/timetable/faculty/:facultyId?academic_year=  -> view (by faculty)
// GET    /api/timetable/room/:roomId                        -> view (by room)
// GET    /api/timetable/:id                                  -> view (single entry)
// POST   /api/timetable                                      -> add
// PUT    /api/timetable/:id                                   -> update
// DELETE /api/timetable/:id                                   -> delete

router.get('/faculty/:facultyId', timetableController.getByFaculty);
router.get('/room/:roomId', timetableController.getByRoom);
router.get('/:id', timetableController.getById);
router.post('/', timetableController.create);
router.put('/:id', timetableController.update);
router.delete('/:id', timetableController.remove);

module.exports = router;
