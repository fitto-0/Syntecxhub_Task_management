import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "done"],
      default: "pending"
    },
    dueDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
