import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { uploadSingle } from "../../../middlewares/upload.middleware.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  sendOtpSchema,
} from "../validations/schemas/user.schema.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get("/profile", userController.getProfile);
router.patch(
  "/profile",
  uploadSingle("profileImage"),
  validate(updateProfileSchema),
  userController.updateProfile
);
router.patch(
  "/change-password",
  validate(changePasswordSchema),
  userController.changePassword
);

// Update profile image
router.patch(
  "/profile/image",
  uploadSingle("profileImage"),
  userController.updateProfileImage
);

// Send verification OTP
router.post(
  "/send-verification-otp",
  validate(sendOtpSchema),
  userController.sendVerificationOtp
);

export default router;
