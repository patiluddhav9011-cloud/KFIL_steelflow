import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["raw_material", "finished_good"],
      required: true
    },
    unit: { type: String, default: "MT" },
    currentStock: { type: Number, required: true, min: 0 },

    // Inputs used by the inventory optimization service
    avgDailyConsumption: { type: Number, required: true, min: 0 },
    demandStdDev: { type: Number, required: true, min: 0, default: 0 }, // day-to-day variability
    leadTimeDays: { type: Number, required: true, min: 0 },
    serviceLevel: { type: Number, default: 0.95 }, // target probability of not stocking out

    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);
