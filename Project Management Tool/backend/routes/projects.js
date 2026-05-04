const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { validate, projectValidators } = require('../middleware/validate');

router.use(authenticate);

router.get('/', projectController.getAll);
router.post('/', projectValidators.create, validate, projectController.create);
router.get('/:id', projectController.getOne);
router.put('/:id', projectValidators.create, validate, projectController.update);
router.delete('/:id', projectController.delete);
router.get('/:id/stats', projectController.getStats);

module.exports = router;