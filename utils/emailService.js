// utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail', 'sendgrid', etc.
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email sending function
const sendEmail = async ({ email, subject, message }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Quiz App" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject,
      text: message,
      // You can also add html: for HTML emails
    };

    await transporter.sendMail(mailOptions);
    console.info(`Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;