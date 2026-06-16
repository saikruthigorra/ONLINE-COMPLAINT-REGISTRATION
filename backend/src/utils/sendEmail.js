const nodemailer = require('nodemailer');

const isEmailConfigured = () => Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    console.log(`[email skipped] ${subject} -> ${to}`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Complaint Support <no-reply@complaints.local>',
    to,
    subject,
    text,
    html
  });

  return true;
};

module.exports = sendEmail;
