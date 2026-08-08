import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: { type: String, required: true, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    mode: { type: String, enum: ["rail", "road", "barge"], required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    distanceKm: { type: Number, required: true, min: 0 },

    standardCostInr: { type: Number, required: true, min: 0 },
    standardHours: { type: Number, required: true, min: 0 },

    // Filled in once the route planning service has run
    optimizedCostInr: { type: Number, default: null },
    optimizedHours: { type: Number, default: null },
    routeStatus: {
      type: String,
      enum: ["pending", "optimized", "dispatched", "delivered"],
      default: "pending"
    },

    dispatchDate: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Shipment", shipmentSchema);
