const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validate, taskValidators } = require('../middleware/validate');

router.use(authenticate);

router.get('/my-tasks', taskController.getMyTasks);
router.get('/dashboard-stats', taskController.getDashboardStats);
router.get('/', taskController.getAll);
router.post('/', taskValidators.create, validate, taskController.create);
router.get('/:id', taskController.getOne);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);
router.post('/:id/comments', taskController.addComment);

module.exports = router;