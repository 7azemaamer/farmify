import { Router } from "express";
import {
  forgetPassword,
  resetPassword,
  signIn,
  signUp,
  verifyOtp,
} from "../controllers/auth.controller.js";

const router = Router();

//Sign up & verify routes
router.post("/signup", signUp);
router.post("/verify", verifyOtp);

// Sign in routes
router.post("/signin", signIn);

// Forget password routes
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
