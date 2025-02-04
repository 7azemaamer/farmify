// // nodemailer for email services
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
// Configure transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail or another email service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password
    },
    });
    // Function to send OTP email
    export const sendOtpEmail = async (to, otp) => {
    try {
    const mailOptions = {
        from: '"Farmify" <no-reply@farmify.com>', // Sender address
        to, // Recipient's email
        subject: 'Your OTP Code for Farmify',
        html: `<p>Your OTP code is <b>${otp}</b>. It is valid for <b>10 minutes</b>.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
    } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
    }
    };
