//================================
// Notes for Eman:
//--------------------------------
// 1- (SOLVED) Password saved in db as a plainText and not hashed, this is a sensitve problem, take care :(
// 2- Use the catchAsync wrapper for the try/catch error for the controllers instead of writing them manually for each controller
// and then use inside it the return next(new AppError("Error Message", code)) for better error messages handling and code
// and use a custom error structure only for validation
//=======================================

import crypto from "crypto";
import User from "../../user/models/user.model.js";
import { sendEmail, sendOtpEmail } from "../../../utils/email.js";
import { AppError, catchAsync } from "../../../utils/errorHandling.js";
import bcrypt from "bcrypt";
import { signToken } from "../../../utils/helpers.js";
import jwt from "jsonwebtoken";

//===========================================
// Sign Up
//===========================================
export const signUp = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    phone,
    email,
    password,
    confirmPassword,
    country,
  } = req.body;

  if (password !== confirmPassword) {
    return next(
      new AppError("Password and confirm password do not match.", 400)
    );
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User with this email already exists.", 400));
  }

  //Hashing Password
  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
  // Generate a random OTP
  const otp = crypto.randomInt(100000, 999999);

  // Create a new user with the OTP
  const newUser = new User({
    firstName,
    lastName,
    phone,
    email,
    password: hashedPassword,
    country,
    otp,
    otpExpiresAt: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
    isVerified: false,
  });

  await newUser.save();

  // Send OTP email
  await sendOtpEmail(email, otp);

  res
    .status(201)
    .json({ message: "Sign-up successful. Check your email for the OTP." });
});
//===========================================
// Verify OTP (After sign up)
//===========================================
export const verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  // Check if the OTP matches and is still valid
  console.log(Date.now() > user.otpExpiresAt);
  if (Number(user.otp) !== Number(otp) || Date.now() > user.otpExpiresAt) {
    return next(new AppError("Invalid or expired OTP.", 400));
  }

  // If OTP is valid, verify the user
  user.isVerified = true;
  user.otp = null; // Clear the OTP
  user.otpExpiresAt = null; // Clear the OTP expiry
  await user.save(); //save

  res.status(200).json({ message: "Account verified successfully." });
});
//===========================================
// Sign in
//===========================================
export const signIn = catchAsync(async (req, res, next) => {
  //1- get email, password from body
  const { email, password } = req.body;
  console.log(email,password);
  //2- check if email exists first
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  //3- hash password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  //4-check if hashed password matches the saved hashed password in db
  if (!isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 401));
  }
  //5- generate token
  const token = signToken({ data: {id:user._id },expiresIn:process.env.JWT_RESET_EXPIRES_IN});
  res.status(200).json({
    status: "success",
      token,
  });
});
//===========================================
// Forget Password
//===========================================
export const forgetPassword = catchAsync(async (req, res, next) => {
  //1- get email from body
  const { email } = req.body;

  //2- check if email exists
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Email not found", 404));

  //3- generate token
  const resetToken = signToken({
    data: { id: user._id },
    secret: process.env.JWT_RESET_SECRET,
    expiresIn: process.env.JWT_RESET_EXPIRES_IN,
  });
  //4- create reset password link
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/reset-password/${resetToken}`;

  //5- send email with a reset password link
  // message body & subject
  const html = `
  <h1>Password Reset Request</h1>
  <p>You requested a password reset. Please click the link below to reset your password:</p>
  <a href="${resetUrl}" style="color: blue; text-decoration: underline;">Reset Password</a>
  <p>This link will expire in 10 minutes.</p>
  <p>If you did not request a password reset, please ignore this email.</p>
`;
  const subject = "Farmify - Reset password link";
  console.log(user._id);

  await sendEmail({ to: user.email, html, subject });

  res.status(200).json({
    status: "success",
    message: "Password reset link has been sent to your email.",
  });
});
//===========================================
// Reset Password
//===========================================
export const resetPassword = catchAsync(async (req, res, next) => {
  //1- get password, confirmPassword from body
  const { password, confirmPassword } = req.body;

  //2- get token from params, check
  const { token } = req.params;
  if (!token) {
    return next(new AppError("Reset token is missing.", 400));
  }

  //3- verify token
  const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

  //4- check password & confirmPassword matches
  if (password !== confirmPassword) {
    return next(
      new AppError("Password and confirm password do not match.", 400)
    );
  }

  //5- hash new password
  const hashedPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);

  //6- update password in db
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("User not found.", 404));
  }
  user.password = hashedPassword;
  await user.save();

  //7- send success to the user
  res.status(200).json({
    status: "success",
    message: "Password has been reset successfully.",
  });
});
