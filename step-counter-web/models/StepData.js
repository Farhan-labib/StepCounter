import mongoose from 'mongoose';

const StepDataSchema = new mongoose.Schema({
  timestamp: {
    type: Number,
    required: true,
  },
  stepCount: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    default: 'user001'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.StepData || mongoose.model('StepData', StepDataSchema);