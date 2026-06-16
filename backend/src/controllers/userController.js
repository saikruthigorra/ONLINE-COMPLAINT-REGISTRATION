const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Agent = require('../models/Agent');
const { ROLES } = require('../utils/constants');
const { publicUser } = require('./authController');

const getUsers = asyncHandler(async (req, res) => {
  const { role, search, active, page = 1, limit = 20 } = req.query;
  const query = {};

  if (role) query.role = role;
  if (active !== undefined) query.active = active === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query)
  ]);

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), users });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, categories = [], maxOpenComplaints = 20 } = req.body;

  const user = await User.create({ name, email, password, phone, role });

  if (role === ROLES.AGENT) {
    await Agent.create({ user: user._id, categories, maxOpenComplaints });
  }

  res.status(201).json({ success: true, user: publicUser(user) });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, phone, role, active, categories, maxOpenComplaints } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (role !== undefined && !Object.values(ROLES).includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (active !== undefined) user.active = active;
  if (role !== undefined) user.role = role;

  await user.save();

  if (user.role === ROLES.AGENT) {
    await Agent.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          active: active !== undefined ? active : true,
          ...(categories ? { categories } : {}),
          ...(maxOpenComplaints ? { maxOpenComplaints } : {})
        },
        $setOnInsert: { user: user._id }
      },
      { upsert: true, new: true }
    );
  } else {
    await Agent.findOneAndUpdate({ user: user._id }, { active: false });
  }

  res.json({ success: true, user: publicUser(user) });
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.active = false;
  await user.save();

  if (user.role === ROLES.AGENT) {
    await Agent.findOneAndUpdate({ user: user._id }, { active: false });
  }

  res.json({ success: true, message: 'User deactivated' });
});

const getAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.find()
    .populate('user', 'name email phone role active createdAt')
    .populate('assignedComplaints', 'title status priority category createdAt')
    .sort({ createdAt: -1 });

  res.json({ success: true, agents });
});

module.exports = { getUsers, createUser, updateUser, deactivateUser, getAgents };
