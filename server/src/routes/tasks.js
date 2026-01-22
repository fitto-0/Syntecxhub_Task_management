import express from "express";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/", async (req, res) => {
  const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title required" });
  }

  const task = await Task.create({
    title,
    description,
    status,
    dueDate,
    user: req.user.id
  });
  res.status(201).json(task);
});

router.put("/:id", async (req, res) => {
  const updates = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    updates,
    { new: true }
  );
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const deleted = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });
  if (!deleted) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.json({ message: "Task removed" });
});

export default router;
