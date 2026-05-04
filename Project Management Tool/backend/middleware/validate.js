const { validationResult, body, param } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return ApiResponse.validationError(res, formattedErrors);
  }
  next();
};

const authValidators = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],
};

const projectValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Project name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('status')
      .optional()
      .isIn(['planning', 'active', 'on-hold', 'completed', 'archived']).withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('dueDate')
      .optional()
      .isISO8601().withMessage('Invalid date format'),
  ],
};

const taskValidators = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Task title is required')
      .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
    body('project')
      .notEmpty().withMessage('Project ID is required')
      .isMongoId().withMessage('Invalid project ID'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('dueDate')
      .optional()
      .isISO8601().withMessage('Invalid date format'),
  ],
};

module.exports = { validate, authValidators, projectValidators, taskValidators };