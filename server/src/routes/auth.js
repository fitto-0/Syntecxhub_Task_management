import express from "express";
import { protect } from "../middleware/auth.js";
import { validate, userValidation } from "../middleware/validation.js";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from "../controllers/authController.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", validate(userValidation.register), register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validate(userValidation.login), login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, updateProfile);

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put("/password", protect, changePassword);

export default router;
