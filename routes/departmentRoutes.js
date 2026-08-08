const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// GET    /api/departments      -> list
// GET    /api/departments/:id  -> get one
// POST   /api/departments      -> create
// PUT    /api/departments/:id  -> update
// DELETE /api/departments/:id  -> delete

router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', departmentController.create);
router.put('/:id', departmentController.update);
router.delete('/:id', departmentController.remove);

module.exports = router;
