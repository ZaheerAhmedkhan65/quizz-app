// utils/emailService.js
const Mailjet = require('node-mailjet');

// Initialize Mailjet client
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

// Email sending function
const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.EMAIL_FROM || 'ranazaheerahmed65@gmail.com',
              Name: process.env.EMAIL_FROM_NAME || 'Quiz App'
            },
            To: [
              {
                Email: email,
                Name: email.split('@')[0]
              }
            ],
            Subject: subject,
            TextPart: message,
            HTMLPart: html || message
          }
        ]
      });

    const result = await request;
    console.info(`Email sent to ${email}:`, result.body.Messages[0].Status);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    
    // Fallback to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('=== EMAIL CONTENT (DEV FALLBACK) ===');
      console.log('To:', email);
      console.log('Subject:', subject);
      console.log('Message:', message);
      if (html) console.log('HTML:', html);
      console.log('===============================');
      return true; // Pretend it worked in development
    }
    
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;