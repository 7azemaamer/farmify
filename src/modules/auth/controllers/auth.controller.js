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
  const hashedPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);
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
  console.log(email, password);
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
  const token = signToken({
    data: {
      id: user._id,
      email: user.email,
    },
  });
  res.status(200).json({
    status: "success",
    token,
  });
});
//===========================================
// Forget Password
//===========================================
export const forgetPassword = catchAsync(async (req, res, next) => {
  // 1- get email from body
  const { email } = req.body;

  // 2- check if email exists
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Email not found", 404));

  // 3- generate OTP
  const otp = crypto.randomInt(100000, 999999);

  // 4- set OTP expiry (10 minutes from now)
  const otpExpiresAt = Date.now() + 10 * 60 * 1000;

  // 5- save OTP to user
  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  // 6- send OTP via email
  try {
    await sendOtpEmail(email, otp);

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email",
    });
  } catch (error) {
    // If email fails, reset the OTP
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return next(
      new AppError("Failed to send OTP email. Please try again.", 500)
    );
  }
});

//===========================================
// Verify OTP for Password Reset
//===========================================
export const verifyResetOtp = catchAsync(async (req, res, next) => {
  // 1- get email and OTP from body
  const { email, otp } = req.body;

  // 2- validate inputs
  if (!email) return next(new AppError("Email is required", 400));
  if (!otp) return next(new AppError("OTP is required", 400));

  // 3- check if user exists
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  // 4- check if OTP exists and is valid
  if (!user.otp)
    return next(
      new AppError("No OTP was requested. Please request a new one.", 400)
    );

  // 5- check if OTP is expired
  if (user.otpExpiresAt < Date.now()) {
    // Clear expired OTP
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return next(
      new AppError("OTP has expired. Please request a new one.", 400)
    );
  }

  // 6- check if OTP matches
  if (user.otp !== parseInt(otp)) {
    return next(new AppError("Invalid OTP", 400));
  }

  // 7- generate reset token
  const resetToken = signToken({
    data: {
      id: user._id,
      email: user.email,
      purpose: "password-reset",
    },
    expiresIn: "15m",
  });

  // 8- return success with reset token
  res.status(200).json({
    status: "success",
    message: "OTP verified successfully",
    resetToken,
  });
});

//===========================================
// Reset Password
//===========================================
export const resetPassword = catchAsync(async (req, res, next) => {
  // 1- get new password and confirm password from body
  const { newPassword, confirmPassword } = req.body;
  const { token } = req.query;

  // 2- validate inputs
  if (!newPassword) return next(new AppError("New password is required", 400));
  if (!confirmPassword)
    return next(new AppError("Confirm password is required", 400));
  if (newPassword !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  // 3- verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
  console.log(decoded.email);
  // 4- check if token is for password reset
  if (!decoded.email || decoded.purpose !== "password-reset") {
    return next(new AppError("Invalid token purpose", 401));
  }

  // 5- find user
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError("User not found", 404));

  // 6- hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    +process.env.SALT_ROUNDS
  );

  // 7- update password and clear OTP
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  // 8- return success
  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});

//===========================================
// Get Current User
//===========================================
export const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = req.user;

  const userData = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    role: user.role,
    isVerified: user.isVerified,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(200).json({
    status: "success",
    data: {
      user: userData,
    },
  });
});
