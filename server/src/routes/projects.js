import express from "express";
import Project from "../models/Project.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/", async (req, res) => {
  const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(projects);
});

router.post("/", async (req, res) => {
  const { title, description, status, dueDate, priority } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title required" });
  }

  const project = await Project.create({
    title,
    description,
    status,
    dueDate,
    priority,
    user: req.user.id
  });
  res.status(201).json(project);
});

router.put("/:id", async (req, res) => {
  const updates = req.body;
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    updates,
    { new: true }
  );
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.json(project);
});

router.delete("/:id", async (req, res) => {
  const deleted = await Project.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });
  if (!deleted) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.json({ message: "Project removed" });
});

export default router;
