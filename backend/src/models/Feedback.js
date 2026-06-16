const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    }
  },
  { timestamps: true }
);

FeedbackSchema.index({ complaint: 1, user: 1 }, { unique: true });
FeedbackSchema.index({ agent: 1 });
FeedbackSchema.index({ rating: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
