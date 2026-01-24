import mongoose from "mongoose";

const monthGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    completed: {
      type: Boolean,
      default: false
    },
    month: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("MonthGoal", monthGoalSchema);
