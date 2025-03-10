import { Router } from "express";
import {
  forgetPassword,
  resetPassword,
  signIn,
  signUp,
  verifyOtp,
  verifyResetOtp,
} from "../controllers/auth.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import {
  signUpSchema,
  signInSchema,
  forgetPasswordSchema,
  verifyOtpSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from "../validations/auth.schema.js";

const router = Router();

//Sign up & verify routes
router.post("/signup", validate(signUpSchema), signUp);
router.post("/verify-email", validate(verifyOtpSchema), verifyOtp);

// Sign in routes
router.post("/signin", validate(signInSchema), signIn);

// Forget password routes
router.post("/forget-password", validate(forgetPasswordSchema), forgetPassword);
router.post(
  "/verify-reset-otp",
  validate(verifyResetOtpSchema),
  verifyResetOtp
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword
);

export default router;
