// To do: use node mailer for email services
// nodemailer for email services
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//===========================================
// Custom function to send OTP email
//===========================================
export const sendOtpEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: '"Farmify" <no-reply@farmify.com>', // Sender address
      to, // Recipient's email
      subject: "Your OTP Code for Farmify",
      html: `<p>Your OTP code is <b>${otp}</b>. It is valid for <b>10 minutes</b>.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

//===========================================
// Send Emails (generic functions)
//===========================================
export const sendEmail = async ({ to, html, subject, from }) => {
  try {
    const mailOptions = {
      from: from || '"Farmify" <no-reply@farmify.com>', // Sender address
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
