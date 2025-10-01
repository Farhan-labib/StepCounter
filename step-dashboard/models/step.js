import mongoose from "mongoose";

const StepSchema = new mongoose.Schema({
  userId: { type: String, default: "user001" },
  stepCount: { type: Number, required: true },
  timestamp: { type: Date, required: true }
});

export default mongoose.models.Step || mongoose.model("Step", StepSchema);
