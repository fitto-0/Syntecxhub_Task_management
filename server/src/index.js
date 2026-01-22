import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Task Manager API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

connectDb()
  .then(() => {
    app.listen(port, () => console.log(`API listening on ${port}`));
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
