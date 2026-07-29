const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');

// GET    /api/faculty?department=&status=&search=   -> list (with filters)
// GET    /api/faculty/:id                            -> get one
// POST   /api/faculty                                -> create
// PUT    /api/faculty/:id                             -> update
// PATCH  /api/faculty/:id/deactivate                  -> soft delete
// PATCH  /api/faculty/:id/reactivate                  -> restore
// DELETE /api/faculty/:id                             -> hard delete (admin)

router.get('/', facultyController.getAll);
router.get('/:id', facultyController.getById);
router.post('/', facultyController.create);
router.put('/:id', facultyController.update);
router.patch('/:id/deactivate', facultyController.deactivate);
router.patch('/:id/reactivate', facultyController.reactivate);
router.delete('/:id', facultyController.remove);

module.exports = router;
