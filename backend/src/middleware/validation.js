import { body, param, validationResult } from 'express-validator';

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Email validation
export const validateEmail = () =>
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters');

// Password validation
export const validatePassword = () =>
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number');

// Name validation
export const validateName = (field = 'name') =>
  body(field)
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage(`${field} must be between 1 and 200 characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${field} must contain only letters, spaces, hyphens, and apostrophes`);

// Event title validation
export const validateEventTitle = () =>
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event title must be between 3 and 200 characters')
    .notEmpty()
    .withMessage('Event title is required');

// Event description validation
export const validateEventDescription = () =>
  body('description')
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters')
    .optional({ nullable: true, checkFalsy: true });

// Capacity validation
export const validateEventCapacity = () =>
  body('capacity')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100000 })
    .withMessage('Capacity must be a positive integer')
    .toInt();

// Date validation
export const validateEventDates = () => [
  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),
  body('endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((value, { req }) => {
      if (req.body.startDate && value && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// UUID validation
export const validateUUID = (param = 'id') =>
  param(param)
    .isUUID()
    .withMessage(`${param} must be a valid UUID`);

// Role validation
export const validateRole = () =>
  body('role')
    .optional()
    .isIn(['student', 'organizer', 'admin'])
    .withMessage('Role must be one of: student, organizer, admin');

// Category validation
export const validateCategory = () =>
  body('category')
    .optional({ nullable: true })
    .isIn(['academic', 'sports', 'cultural', 'technical', 'social', 'workshop', 'other'])
    .withMessage('Invalid category');

// Points validation
export const validatePoints = () =>
  body('points')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 10000 })
    .withMessage('Points must be between 0 and 10000')
    .toInt();

// Bio validation
export const validateBio = () =>
  body('bio')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters');

// URL validation
export const validateImageUrl = () =>
  body('imageUrl')
    .optional({ nullable: true })
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Invalid image URL');

// Reward cost validation
export const validateRewardCost = () =>
  body('cost')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Cost must be a positive integer between 1 and 100000')
    .toInt();
