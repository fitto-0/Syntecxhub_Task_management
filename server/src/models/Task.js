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
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Automatically set completedAt when status becomes "done"
taskSchema.pre("save", function setCompletedAt(next) {
  if (this.isModified("status") && this.status === "done" && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.isModified("status") && this.status !== "done") {
    this.completedAt = undefined;
  }
  next();
});

export default mongoose.model("Task", taskSchema);
