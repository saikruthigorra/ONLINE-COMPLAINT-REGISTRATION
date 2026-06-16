const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  assignComplaint,
  updateStatus,
  addMessage,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  idParamValidator,
  createComplaintValidator,
  updateComplaintValidator,
  assignComplaintValidator,
  updateStatusValidator,
  messageValidator
} = require('../validators/complaintValidators');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getComplaints)
  .post(authorize(ROLES.USER, ROLES.ADMIN), createComplaintValidator, validate, createComplaint);

router
  .route('/:id')
  .get(idParamValidator, validate, getComplaintById)
  .put(updateComplaintValidator, validate, updateComplaint)
  .delete(idParamValidator, validate, deleteComplaint);

router.patch('/:id/assign', authorize(ROLES.ADMIN), assignComplaintValidator, validate, assignComplaint);
router.patch('/:id/status', updateStatusValidator, validate, updateStatus);
router.post('/:id/messages', messageValidator, validate, addMessage);

module.exports = router;
