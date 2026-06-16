require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Agent = require('./models/Agent');
const Complaint = require('./models/Complaint');
const Feedback = require('./models/Feedback');
const { ROLES, STATUSES, PRIORITIES } = require('./utils/constants');

const seed = async () => {
  await connectDB();

  const fresh = process.argv.includes('--fresh');
  if (fresh) {
    await Promise.all([Feedback.deleteMany(), Complaint.deleteMany(), Agent.deleteMany(), User.deleteMany()]);
  }

  const admin = await User.findOne({ email: 'admin@example.com' }) || await User.create({
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: ROLES.ADMIN,
    phone: '9000000001'
  });

  const agent = await User.findOne({ email: 'agent@example.com' }) || await User.create({
    name: 'Support Agent',
    email: 'agent@example.com',
    password: 'Agent@123',
    role: ROLES.AGENT,
    phone: '9000000002'
  });

  const user = await User.findOne({ email: 'user@example.com' }) || await User.create({
    name: 'Demo User',
    email: 'user@example.com',
    password: 'User@123',
    role: ROLES.USER,
    phone: '9000000003'
  });

  await Agent.findOneAndUpdate(
    { user: agent._id },
    { categories: ['Billing', 'Technical', 'General'], maxOpenComplaints: 10, active: true },
    { upsert: true, new: true }
  );

  const existingComplaint = await Complaint.findOne({ title: 'Internet service is frequently down' });
  if (!existingComplaint) {
    const complaint = await Complaint.create({
      title: 'Internet service is frequently down',
      description: 'The internet connection disconnects multiple times a day and needs urgent attention.',
      category: 'Technical',
      priority: PRIORITIES.HIGH,
      status: STATUSES.ASSIGNED,
      user: user._id,
      agent: agent._id,
      timeline: [
        { status: STATUSES.OPEN, note: 'Complaint registered', updatedBy: user._id },
        { status: STATUSES.ASSIGNED, note: 'Assigned to Support Agent', updatedBy: admin._id }
      ],
      messages: [{ sender: user._id, message: 'Please check this issue as soon as possible.' }]
    });

    await Agent.findOneAndUpdate({ user: agent._id }, { $addToSet: { assignedComplaints: complaint._id } });
  }

  console.log('Seed completed. Demo credentials:');
  console.log('Admin: admin@example.com / Admin@123');
  console.log('Agent: agent@example.com / Agent@123');
  console.log('User : user@example.com / User@123');
  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
