const { body } = require('express-validator');
const { ROLES } = require('../utils/constants');

const registerValidator = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters')
];

const loginValidator = [
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const createUserValidator = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters'),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('categories').optional().isArray().withMessage('Categories must be an array'),
  body('maxOpenComplaints').optional().isInt({ min: 1 }).withMessage('Max open complaints must be positive')
];

module.exports = { registerValidator, loginValidator, updateProfileValidator, createUserValidator };
