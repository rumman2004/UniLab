import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, msg } = req.body;

    if (!name || !email || !msg) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ error: 'Server email configuration is missing.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use Gmail as the default service
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const template = `Hello UniLab Support,

I am submitting a new request/query from the UniLab platform.

--- User Details ---
Name:  ${name}
Email: ${email}

--- Request Details ---
${msg}

---------------------
Sent via UniLab Support Form`;

    const mailOptions = {
      from: `"UniLab Platform" <${process.env.SMTP_USER}>`,
      to: 'rumman.ahmed.work+query@gmail.com',
      replyTo: email,
      subject: `UniLab Query from ${name}`,
      text: template,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

export default router;
