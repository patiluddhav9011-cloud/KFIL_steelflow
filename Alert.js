import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    plantName: {
      type: String,
      required: true,
      default: "Jejuri Plant",
      trim: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["Critical", "Warning", "Info"], // Red / Orange / Green
      required: true,
      default: "Info",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

AlertSchema.index({ plantName: 1, resolved: 1, timestamp: -1 });

export default mongoose.model("Alert", AlertSchema);