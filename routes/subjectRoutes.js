const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// GET    /api/subjects?department_id=&semester=  -> list (with filters)
// GET    /api/subjects/:id                        -> get one
// POST   /api/subjects                            -> create
// PUT    /api/subjects/:id                         -> update
// DELETE /api/subjects/:id                         -> delete

router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);
router.post('/', subjectController.create);
router.put('/:id', subjectController.update);
router.delete('/:id', subjectController.remove);

module.exports = router;
