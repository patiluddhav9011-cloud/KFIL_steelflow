import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    product: {
      type: String,
      required: true,
      enum: ["TMT Rebar", "HR Coil", "CR Coil", "Wire Rod", "Billet"]
    },
    quantityMT: { type: Number, required: true, min: 0 },
    orderDate: { type: Date, required: true, default: Date.now },
    requiredByDate: { type: Date, required: true },
    destination: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_production", "dispatched", "delivered", "cancelled"],
      default: "pending"
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
