import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["Iron Ore", "Coking Coal", "Scrap", "Limestone", "Ferro Alloys"],
      required: true
    },
    location: { type: String, required: true },
    contactEmail: { type: String, default: "" },

    // Inputs used by the supplier risk scoring service (0-100 scale, 100 = best)
    onTimeDeliveryRate: { type: Number, required: true, min: 0, max: 100 },
    qualityAcceptanceRate: { type: Number, required: true, min: 0, max: 100 },
    financialHealthScore: { type: Number, required: true, min: 0, max: 100 },
    geopoliticalStabilityScore: { type: Number, required: true, min: 0, max: 100 },
    singleSourceDependency: { type: Boolean, default: false },

    // Historical lead times in days (used by lead time prediction service)
    pastLeadTimesDays: { type: [Number], default: [] },

    // Cached results from the last risk scoring run
    riskScore: { type: Number, default: null },
    riskLevel: { type: String, enum: ["low", "medium", "high", null], default: null },
    riskLastScoredAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);
