const asyncHandler = require('../middleware/asyncHandler');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Agent = require('../models/Agent');
const sendEmail = require('../utils/sendEmail');
const { ROLES, STATUSES, ACTIVE_STATUSES } = require('../utils/constants');

const getObjectId = (value) => String(value?._id || value || '');

const isComplaintOwner = (complaint, user) => getObjectId(complaint.user) === getObjectId(user._id);
const isAssignedAgent = (complaint, user) => getObjectId(complaint.agent) === getObjectId(user._id);

const canAccessComplaint = (complaint, user) => {
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.USER) return isComplaintOwner(complaint, user);
  if (user.role === ROLES.AGENT) return isAssignedAgent(complaint, user);
  return false;
};

const populateComplaint = (query) =>
  query
    .populate('user', 'name email phone')
    .populate('agent', 'name email phone')
    .populate('messages.sender', 'name role')
    .populate('timeline.updatedBy', 'name role');

const findAvailableAgent = async (category) => {
  if (String(process.env.AUTO_ASSIGN).toLowerCase() === 'false') return null;

  const profiles = await Agent.find({
    active: true,
    $or: [{ categories: category }, { categories: { $size: 0 } }]
  }).populate('user', 'name email role active');

  let selected = null;
  let selectedCount = Number.MAX_SAFE_INTEGER;

  for (const profile of profiles) {
    if (!profile.user || !profile.user.active || profile.user.role !== ROLES.AGENT) continue;
    const count = await Complaint.countDocuments({ agent: profile.user._id, status: { $in: ACTIVE_STATUSES } });
    if (count < profile.maxOpenComplaints && count < selectedCount) {
      selected = profile;
      selectedCount = count;
    }
  }

  return selected;
};

const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority, attachments = [], dueDate } = req.body;

  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority,
    attachments,
    dueDate,
    user: req.user._id,
    timeline: [{ status: STATUSES.OPEN, note: 'Complaint registered successfully', updatedBy: req.user._id }]
  });

  const agentProfile = await findAvailableAgent(category);
  if (agentProfile) {
    complaint.agent = agentProfile.user._id;
    complaint.status = STATUSES.ASSIGNED;
    complaint.timeline.push({ status: STATUSES.ASSIGNED, note: `Auto-assigned to ${agentProfile.user.name}`, updatedBy: req.user._id });
    await complaint.save();
    await Agent.findByIdAndUpdate(agentProfile._id, { $addToSet: { assignedComplaints: complaint._id } });

    await sendEmail({
      to: agentProfile.user.email,
      subject: `New complaint assigned: ${complaint.title}`,
      text: `A new complaint (${complaint._id}) has been assigned to you.`
    });
  }

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  res.status(201).json({ success: true, complaint: populated });
});

const getComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, search, page = 1, limit = 20 } = req.query;
  const query = {};

  if (req.user.role === ROLES.USER) query.user = req.user._id;
  if (req.user.role === ROLES.AGENT) query.agent = req.user._id;
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [complaints, total] = await Promise.all([
    populateComplaint(Complaint.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))),
    Complaint.countDocuments(query)
  ]);

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), complaints });
});

const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await populateComplaint(Complaint.findById(req.params.id));

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (!canAccessComplaint(complaint, req.user)) {
    res.status(403);
    throw new Error('You do not have permission to view this complaint');
  }

  res.json({ success: true, complaint });
});

const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const ownerCanEdit = req.user.role === ROLES.USER && isComplaintOwner(complaint, req.user) && complaint.status === STATUSES.OPEN;
  if (!(req.user.role === ROLES.ADMIN || ownerCanEdit)) {
    res.status(403);
    throw new Error('Only admins or the owner of an open complaint can edit complaint details');
  }

  ['title', 'description', 'category', 'priority', 'attachments', 'dueDate'].forEach((field) => {
    if (req.body[field] !== undefined) complaint[field] = req.body[field];
  });

  complaint.timeline.push({ status: complaint.status, note: 'Complaint details updated', updatedBy: req.user._id });
  await complaint.save();

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  res.json({ success: true, complaint: populated });
});

const assignComplaint = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  const [complaint, agentUser] = await Promise.all([
    Complaint.findById(req.params.id),
    User.findById(agentId)
  ]);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (!agentUser || agentUser.role !== ROLES.AGENT || !agentUser.active) {
    res.status(400);
    throw new Error('Selected user is not an active agent');
  }

  if (complaint.agent) {
    await Agent.findOneAndUpdate({ user: complaint.agent }, { $pull: { assignedComplaints: complaint._id } });
  }

  complaint.agent = agentUser._id;
  if (complaint.status === STATUSES.OPEN) complaint.status = STATUSES.ASSIGNED;
  complaint.timeline.push({ status: complaint.status, note: `Assigned to ${agentUser.name}`, updatedBy: req.user._id });
  await complaint.save();

  await Agent.findOneAndUpdate(
    { user: agentUser._id },
    { $addToSet: { assignedComplaints: complaint._id }, $setOnInsert: { user: agentUser._id, active: true, categories: [], maxOpenComplaints: 20 } },
    { upsert: true, new: true }
  );

  await sendEmail({
    to: agentUser.email,
    subject: `Complaint assigned: ${complaint.title}`,
    text: `Complaint ${complaint._id} has been assigned to you.`
  });

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  res.json({ success: true, complaint: populated });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, note = '', resolution = '' } = req.body;
  const complaint = await Complaint.findById(req.params.id).populate('user', 'name email').populate('agent', 'name email');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const userIsOwner = isComplaintOwner(complaint, req.user);
  const agentIsAssigned = isAssignedAgent(complaint, req.user);

  if (req.user.role === ROLES.USER) {
    if (!(userIsOwner && complaint.status === STATUSES.RESOLVED && status === STATUSES.CLOSED)) {
      res.status(403);
      throw new Error('Users can only close their own resolved complaints');
    }
  } else if (req.user.role === ROLES.AGENT) {
    if (!agentIsAssigned) {
      res.status(403);
      throw new Error('Agents can only update complaints assigned to them');
    }
    const agentAllowed = [STATUSES.IN_PROGRESS, STATUSES.WAITING_USER, STATUSES.RESOLVED, STATUSES.REJECTED];
    if (!agentAllowed.includes(status)) {
      res.status(403);
      throw new Error('Agent is not allowed to set this status');
    }
  }

  complaint.status = status;
  if (status === STATUSES.RESOLVED) {
    complaint.resolution = resolution || note || complaint.resolution;
    complaint.resolvedAt = new Date();
  }
  if (status === STATUSES.CLOSED) complaint.closedAt = new Date();

  complaint.timeline.push({ status, note: note || resolution || `Status changed to ${status}`, updatedBy: req.user._id });
  await complaint.save();

  if ([STATUSES.RESOLVED, STATUSES.REJECTED, STATUSES.CLOSED].includes(status) && complaint.user?.email) {
    await sendEmail({
      to: complaint.user.email,
      subject: `Complaint ${status.toLowerCase().replace('_', ' ')}: ${complaint.title}`,
      text: `Your complaint ${complaint._id} status is now ${status}. ${complaint.resolution || note}`
    });
  }

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  res.json({ success: true, complaint: populated });
});

const addMessage = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (!canAccessComplaint(complaint, req.user)) {
    res.status(403);
    throw new Error('You do not have permission to message on this complaint');
  }

  complaint.messages.push({ sender: req.user._id, message: req.body.message });

  if (req.user.role === ROLES.AGENT && complaint.status === STATUSES.ASSIGNED) {
    complaint.status = STATUSES.IN_PROGRESS;
    complaint.timeline.push({ status: STATUSES.IN_PROGRESS, note: 'Agent started working on the complaint', updatedBy: req.user._id });
  }

  await complaint.save();

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  res.status(201).json({ success: true, complaint: populated });
});

const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const ownerCanDelete = req.user.role === ROLES.USER && isComplaintOwner(complaint, req.user) && complaint.status === STATUSES.OPEN;
  if (!(req.user.role === ROLES.ADMIN || ownerCanDelete)) {
    res.status(403);
    throw new Error('Only admins or owners of open complaints can delete complaints');
  }

  if (complaint.agent) {
    await Agent.findOneAndUpdate({ user: complaint.agent }, { $pull: { assignedComplaints: complaint._id } });
  }

  await complaint.deleteOne();
  res.json({ success: true, message: 'Complaint deleted' });
});

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  assignComplaint,
  updateStatus,
  addMessage,
  deleteComplaint
};
