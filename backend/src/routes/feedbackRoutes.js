const express = require('express');
const { createFeedback, getFeedback, getFeedbackSummary } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createFeedbackValidator } = require('../validators/feedbackValidators');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router.get('/', authorize(ROLES.ADMIN, ROLES.AGENT), getFeedback);
router.get('/summary', authorize(ROLES.ADMIN, ROLES.AGENT), getFeedbackSummary);
router.post('/:complaintId', authorize(ROLES.USER), createFeedbackValidator, validate, createFeedback);

module.exports = router;
