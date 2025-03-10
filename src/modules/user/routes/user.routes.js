import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { uploadSingle } from "../../../middlewares/upload.middleware.js";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../validations/schemas/user.schema.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get("/profile", userController.getUserProfile);
router.patch(
  "/profile",
  uploadSingle("profileImage"),
  validate(updateProfileSchema),
  userController.updateUserProfile
);
router.patch(
  "/change-password",
  validate(changePasswordSchema),
  userController.changePassword
);

export default router;
