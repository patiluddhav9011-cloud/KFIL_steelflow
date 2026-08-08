import mongoose from "mongoose";

const DispatchSchema = new mongoose.Schema(
  {
    plantName: {
      type: String,
      required: true,
      default: "Jejuri Plant",
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    plannedDispatch: {
      type: Number,
      required: true,
      min: 0,
    },
    completedDispatch: {
      type: Number,
      required: true,
      min: 0,
    },
    pendingDispatch: {
      type: Number,
      min: 0,
    },
    vehiclesRunning: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["On Schedule", "Delayed", "Critical", "Completed"],
      default: "On Schedule",
    },
  },
  { timestamps: true }
);

// Auto-calculate pending dispatch if not provided
DispatchSchema.pre("save", function (next) {
  if (this.pendingDispatch === undefined || this.pendingDispatch === null) {
    this.pendingDispatch = Math.max(
      this.plannedDispatch - this.completedDispatch,
      0
    );
  }
  next();
});

DispatchSchema.index({ plantName: 1, date: -1 });

export default mongoose.model("Dispatch", DispatchSchema);