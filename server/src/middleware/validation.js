import { body, validationResult } from 'express-validator';

// Validation middleware factory
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }

    next();
  };
};

// Common validation rules
export const userValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces')
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

export const taskValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'done'])
      .withMessage('Status must be: pending, in-progress, or done'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be: low, medium, or high'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date')
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'done'])
      .withMessage('Status must be: pending, in-progress, or done'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be: low, medium, or high'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date')
  ]
};

export const projectValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'done', 'stopped'])
      .withMessage('Status must be: pending, in-progress, done, or stopped'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be: low, medium, or high'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date')
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'done', 'stopped'])
      .withMessage('Status must be: pending, in-progress, done, or stopped'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be: low, medium, or high'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date')
  ]
};

export const monthGoalValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('month')
      .isInt({ min: 1, max: 12 })
      .withMessage('Month must be between 1 and 12'),
    body('year')
      .isInt({ min: 2020, max: 2030 })
      .withMessage('Year must be between 2020 and 2030')
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('completed')
      .optional()
      .isBoolean()
      .withMessage('Completed must be a boolean value')
  ]
};
