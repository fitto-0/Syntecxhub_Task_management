import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
    user: { id: user._id, email: user.email, name: user.name }
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
    user: { id: user._id, email: user.email, name: user.name }
  });
});

export default router;
