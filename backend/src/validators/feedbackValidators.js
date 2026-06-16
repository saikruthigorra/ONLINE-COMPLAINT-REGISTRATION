const { body, param } = require('express-validator');

const createFeedbackValidator = [
  param('complaintId').isMongoId().withMessage('Invalid complaint id'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
];

module.exports = { createFeedbackValidator };
