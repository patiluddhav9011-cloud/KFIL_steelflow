import mongoose from "mongoose";

const PlantInventorySchema = new mongoose.Schema(
  {
    plantName: {
      type: String,
      required: true,
      default: "Jejuri Plant",
      trim: true,
      index: true,
    },
    rawMaterialStock: {
      type: Number, // in MT (billets, scrap, etc.)
      required: true,
      min: 0,
    },
    finishedGoods: {
      type: Number, // in MT
      required: true,
      min: 0,
    },
    reorderLevel: {
      type: Number, // MT threshold that triggers a reorder
      required: true,
      min: 0,
    },
    criticalItems: {
      type: Number, // count of SKUs below reorder level
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Healthy", "Low Stock", "Critical", "Overstocked"],
      default: "Healthy",
    },
  },
  { timestamps: true }
);

// Auto-derive status based on stock vs reorder level
PlantInventorySchema.pre("save", function (next) {
  if (this.rawMaterialStock <= this.reorderLevel * 0.5) {
    this.status = "Critical";
  } else if (this.rawMaterialStock <= this.reorderLevel) {
    this.status = "Low Stock";
  } else if (!this.status) {
    this.status = "Healthy";
  }
  next();
});

PlantInventorySchema.index({ plantName: 1, updatedAt: -1 });

export default mongoose.model("PlantInventory", PlantInventorySchema);