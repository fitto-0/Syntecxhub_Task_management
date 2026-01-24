import express from "express";
import MonthGoal from "../models/MonthGoal.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

// Get goals for current month
router.get("/", async (req, res) => {
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();
  
  const goals = await MonthGoal.find({ 
    user: req.user.id,
    month: currentMonth,
    year: currentYear
  }).sort({ createdAt: 1 });
  
  res.json(goals);
});

// Get goals for specific month/year
router.get("/:month/:year", async (req, res) => {
  const { month, year } = req.params;
  
  const goals = await MonthGoal.find({ 
    user: req.user.id,
    month,
    year: parseInt(year)
  }).sort({ createdAt: 1 });
  
  res.json(goals);
});

// Create new goal
router.post("/", async (req, res) => {
  const { title, month, year } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title required" });
  }

  const now = new Date();
  const goalMonth = month || now.toLocaleString('default', { month: 'long' });
  const goalYear = year || now.getFullYear();

  const goal = await MonthGoal.create({
    title,
    month: goalMonth,
    year: goalYear,
    user: req.user.id
  });
  
  res.status(201).json(goal);
});

// Update goal (toggle completion)
router.put("/:id", async (req, res) => {
  const updates = req.body;
  const goal = await MonthGoal.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    updates,
    { new: true }
  );
  if (!goal) {
    return res.status(404).json({ message: "Goal not found" });
  }
  res.json(goal);
});

// Delete goal
router.delete("/:id", async (req, res) => {
  const deleted = await MonthGoal.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });
  if (!deleted) {
    return res.status(404).json({ message: "Goal not found" });
  }
  res.json({ message: "Goal removed" });
});

export default router;
