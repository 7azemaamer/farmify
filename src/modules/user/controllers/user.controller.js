import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { AppError, catchAsync } from "../../../utils/errorHandling.js";

//===========================================
// Get User Profile
//===========================================
export const getUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select(
    "-password -otp -otpExpiresAt"
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

//===========================================
// Update User Profile
//===========================================
export const updateUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { firstName, lastName, phone, country } = req.body;

  // Handle profile image upload
  let updateData = { firstName, lastName, phone, country };

  if (req.file) {
    updateData.profileImage = `/uploads/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password -otp -otpExpiresAt");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

//===========================================
// Change Password
//===========================================
export const changePassword = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  // Find user with password
  const user = await User.findById(userId);

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
