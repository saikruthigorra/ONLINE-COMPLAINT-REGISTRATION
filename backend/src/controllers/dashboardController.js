const asyncHandler = require('../middleware/asyncHandler');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { ROLES, STATUSES } = require('../utils/constants');

const asObject = (rows) => rows.reduce((acc, row) => ({ ...acc, [row._id || 'UNSPECIFIED']: row.count }), {});

const getDashboardStats = asyncHandler(async (req, res) => {
  const complaintMatch = {};
  const feedbackMatch = {};

  if (req.user.role === ROLES.USER) {
    complaintMatch.user = req.user._id;
    feedbackMatch.user = req.user._id;
  }

  if (req.user.role === ROLES.AGENT) {
    complaintMatch.agent = req.user._id;
    feedbackMatch.agent = req.user._id;
  }

  const [totalComplaints, statusRows, categoryRows, recentComplaints, feedbackRows] = await Promise.all([
    Complaint.countDocuments(complaintMatch),
    Complaint.aggregate([{ $match: complaintMatch }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $match: complaintMatch }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Complaint.find(complaintMatch)
      .populate('user', 'name email')
      .populate('agent', 'name email')
      .sort({ createdAt: -1 })
      .limit(5),
    Feedback.aggregate([
      { $match: feedbackMatch },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalFeedback: { $sum: 1 } } }
    ])
  ]);

  const stats = {
    totalComplaints,
    byStatus: asObject(statusRows),
    byCategory: asObject(categoryRows),
    recentComplaints,
    feedback: feedbackRows[0] || { averageRating: 0, totalFeedback: 0 }
  };

  if (req.user.role === ROLES.ADMIN) {
    const [users, agents, agentPerformance, unresolvedOlderThan7Days] = await Promise.all([
      User.countDocuments({ role: ROLES.USER }),
      User.countDocuments({ role: ROLES.AGENT, active: true }),
      Complaint.aggregate([
        { $match: { agent: { $ne: null } } },
        {
          $group: {
            _id: '$agent',
            totalAssigned: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $in: ['$status', [STATUSES.RESOLVED, STATUSES.CLOSED]] }, 1, 0] } },
            open: { $sum: { $cond: [{ $in: ['$status', [STATUSES.ASSIGNED, STATUSES.IN_PROGRESS, STATUSES.WAITING_USER]] }, 1, 0] } }
          }
        }
      ]),
      Complaint.countDocuments({
        status: { $in: [STATUSES.OPEN, STATUSES.ASSIGNED, STATUSES.IN_PROGRESS, STATUSES.WAITING_USER] },
        createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const agentIds = agentPerformance.map((row) => row._id);
    const agentUsers = await User.find({ _id: { $in: agentIds } }).select('name email');
    const agentMap = agentUsers.reduce((acc, user) => ({ ...acc, [String(user._id)]: user }), {});

    stats.admin = {
      users,
      agents,
      unresolvedOlderThan7Days,
      agentPerformance: agentPerformance.map((row) => ({ ...row, agent: agentMap[String(row._id)] || null }))
    };
  }

  res.json({ success: true, stats });
});

module.exports = { getDashboardStats };
