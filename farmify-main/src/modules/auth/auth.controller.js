//service
import User from "../user/user.model.js";
import crypto from "crypto";
import { sendOtpEmail } from "../../utils/email.js";
// Sign-Up Controller
export const signUp = async (req, res) => {
  const { firstName, lastName, phone, email, password, confirmPassword,country} = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and confirm password do not match.' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // Generate a random OTP
    const otp = crypto.randomInt(100000, 999999);

    // Create a new user with the OTP
    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      password,
      country,
      otp, // Save the OTP in the database
      otpExpiresAt: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
      isVerified: false,
    });

    await newUser.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(201).json({ message: 'Sign-up successful. Check your email for the OTP.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

// Verify OTP Controller
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body; // Get email and OTP from the request body

  try {
    const user = await User.findOne({ email }); // Find the user by email
    if (!user) {
      return res.status(404).json({ error: 'User not found.' }); // User does not exist
    }

    // Check if the OTP matches and is still valid
    if (user.otp !== otp || Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // If OTP is valid, verify the user
    user.isVerified = true;
    user.otp = null; // Clear the OTP
    user.otpExpiresAt = null; // Clear the OTP expiry
    await user.save(); // Save the changes

    res.status(200).json({ message: 'Account verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' }); // Handle server errors
  }
};





