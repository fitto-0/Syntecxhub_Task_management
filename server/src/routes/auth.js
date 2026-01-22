import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Email, name and password required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({ email, password, name });
  const token = createToken(user._id);
  res.status(201).json({
    token,
    user: { id: user._id, email: user.email, name: user.name, profilePicture: user.profilePicture }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = createToken(user._id);
  res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name, profilePicture: user.profilePicture }
  });
});

// Get current user profile
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    id: user._id,
    email: user.email,
    name: user.name,
    profilePicture: user.profilePicture
  });
});

// Update profile (name, and optional password change)
router.put("/me", auth, async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (name) {
    user.name = name;
  }

  if (req.body.profilePicture !== undefined) {
    user.profilePicture = req.body.profilePicture || null;
  }

  if (newPassword) {
    if (!currentPassword) {
      return res
        .status(400)
        .json({ message: "Current password required to set a new password" });
    }
    const matches = await user.comparePassword(currentPassword);
    if (!matches) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword; // will be hashed by pre-save hook
  }

  await user.save();

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    profilePicture: user.profilePicture
  });
});

export default router;
