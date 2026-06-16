const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  active: user.active,
  createdAt: user.createdAt
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ success: true, token, user: publicUser(user) });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const user = await User.create({ name, email, password, phone, role: ROLES.USER });
  sendTokenResponse(user, 201, res);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.active) {
    res.status(403);
    throw new Error('Your account has been disabled. Contact the administrator.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  if (req.body.password) req.user.password = req.body.password;

  await req.user.save();
  res.json({ success: true, user: publicUser(req.user) });
});

module.exports = { register, login, getMe, updateProfile, publicUser };
