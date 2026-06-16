const mongoose = require('mongoose');
const { STATUSES, PRIORITIES } = require('../utils/constants');

const attachmentSchema = new mongoose.Schema(
  {
    fileName: String,
    url: String,
    mimeType: String,
    size: Number
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(STATUSES),
      required: true
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const ComplaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: 5,
      maxlength: 120
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
      minlength: 10,
      maxlength: 4000
    },
    category: {
      type: String,
      required: [true, 'Complaint category is required'],
      trim: true,
      index: true
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITIES),
      default: PRIORITIES.MEDIUM
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.OPEN,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    resolution: {
      type: String,
      trim: true,
      default: ''
    },
    dueDate: Date,
    resolvedAt: Date,
    closedAt: Date,
    timeline: {
      type: [timelineSchema],
      default: []
    },
    messages: {
      type: [messageSchema],
      default: []
    }
  },
  { timestamps: true }
);

ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ category: 1, status: 1 });
ComplaintSchema.index({ user: 1, createdAt: -1 });
ComplaintSchema.index({ agent: 1, status: 1 });
ComplaintSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Complaint', ComplaintSchema);
