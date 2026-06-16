const { body, param } = require('express-validator');
const { STATUSES, PRIORITIES } = require('../utils/constants');

const idParamValidator = [param('id').isMongoId().withMessage('Invalid complaint id')];

const createComplaintValidator = [
  body('title').trim().isLength({ min: 5, max: 120 }).withMessage('Title must be 5-120 characters'),
  body('description').trim().isLength({ min: 10, max: 4000 }).withMessage('Description must be 10-4000 characters'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('priority').optional().isIn(Object.values(PRIORITIES)).withMessage('Invalid priority'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array')
];

const updateComplaintValidator = [
  ...idParamValidator,
  body('title').optional().trim().isLength({ min: 5, max: 120 }).withMessage('Title must be 5-120 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 4000 }).withMessage('Description must be 10-4000 characters'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('priority').optional().isIn(Object.values(PRIORITIES)).withMessage('Invalid priority')
];

const assignComplaintValidator = [
  ...idParamValidator,
  body('agentId').isMongoId().withMessage('Valid agent id is required')
];

const updateStatusValidator = [
  ...idParamValidator,
  body('status').isIn(Object.values(STATUSES)).withMessage('Invalid complaint status'),
  body('note').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Note cannot exceed 1000 characters'),
  body('resolution').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage('Resolution cannot exceed 2000 characters')
];

const messageValidator = [
  ...idParamValidator,
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and cannot exceed 1000 characters')
];

module.exports = {
  idParamValidator,
  createComplaintValidator,
  updateComplaintValidator,
  assignComplaintValidator,
  updateStatusValidator,
  messageValidator
};
