const asyncHandler = require('../middleware/asyncHandler');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const { ROLES, STATUSES } = require('../utils/constants');

const getObjectId = (value) => String(value?._id || value || '');

const createFeedback = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.complaintId);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (getObjectId(complaint.user) !== getObjectId(req.user._id)) {
    res.status(403);
    throw new Error('You can submit feedback only for your own complaint');
  }

  if (![STATUSES.RESOLVED, STATUSES.CLOSED].includes(complaint.status)) {
    res.status(400);
    throw new Error('Feedback can be submitted after the complaint is resolved');
  }

  const feedback = await Feedback.create({
    complaint: complaint._id,
    user: req.user._id,
    agent: complaint.agent,
    rating: req.body.rating,
    comment: req.body.comment
  });

  res.status(201).json({ success: true, feedback });
});

const getFeedback = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === ROLES.AGENT) query.agent = req.user._id;

  const feedback = await Feedback.find(query)
    .populate('complaint', 'title category status createdAt')
    .populate('user', 'name email')
    .populate('agent', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, feedback });
});

const getFeedbackSummary = asyncHandler(async (req, res) => {
  const match = req.user.role === ROLES.AGENT ? { agent: req.user._id } : {};
  const summary = await Feedback.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$agent',
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
        fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
      }
    }
  ]);

  res.json({ success: true, summary });
});

module.exports = { createFeedback, getFeedback, getFeedbackSummary };
