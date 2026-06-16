const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    categories: {
      type: [String],
      default: []
    },
    maxOpenComplaints: {
      type: Number,
      default: 20,
      min: 1
    },
    assignedComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint'
      }
    ],
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);


AgentSchema.index({ active: 1 });

module.exports = mongoose.model('Agent', AgentSchema);
