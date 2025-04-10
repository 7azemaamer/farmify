import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { AppError, catchAsync } from "../../../utils/errorHandling.js";
import { handleMulterError } from "../../../middlewares/upload.middleware.js";
import { sendOtpEmail } from "../../../utils/email.js";
import crypto from "crypto";

//===========================================
// Get User Profile
//===========================================
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "-password -otp -otpExpiresAt"
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

//===========================================
// Update User Profile
//===========================================
export const updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phone, country } = req.body;

  // Create update object with only allowed fields
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (country) updateData.country = country;

  // Handle profile image if uploaded
  if (req.file) {
    updateData.profileImage = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password -otp -otpExpiresAt");

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

//===========================================
// Update Profile Image
//===========================================
export const updateProfileImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image", 400));
  }

  const profileImage = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { profileImage },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -otp -otpExpiresAt");

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

//===========================================
// Change Password
//===========================================
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Find user with password
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if current password is correct
  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    +process.env.SALT_ROUNDS
  );

  // Update password
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

//===========================================
// Send Verification OTP
//===========================================
export const sendVerificationOtp = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if user is already verified
  if (user.isVerified) {
    return next(new AppError("User is already verified", 400));
  }

  // Generate a random OTP
  const otp = crypto.randomInt(100000, 999999);

  // Update user with new OTP
  user.otp = otp;
  user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  await user.save();

  try {
    // Send OTP email
    await sendOtpEmail(user.email, otp);

    res.status(200).json({
      status: "success",
      message: "OTP sent successfully. Please check your email.",
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
