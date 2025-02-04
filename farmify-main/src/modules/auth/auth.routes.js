// controller
import express from 'express';
import { signUp , verifyOtp } from '../auth/auth.controller.js';
const router = express.Router();
router.post('/signup', signUp);
router.post('/verify', verifyOtp);
export default router;

