const express = require('express');
const { getUsers, createUser, updateUser, deactivateUser, getAgents } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createUserValidator } = require('../validators/authValidators');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.route('/').get(getUsers).post(createUserValidator, validate, createUser);
router.get('/agents', getAgents);
router.route('/:id').put(updateUser).delete(deactivateUser);

module.exports = router;
