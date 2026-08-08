import mongoose from "mongoose";

const ProductionSchema = new mongoose.Schema({
  
    plantName: {
      type: String,
      required: true,
      default: 'Jejuri Plant',
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    targetProduction: {
      type: Number, // in MT
      required: true,
      min: 0,
    },
    actualProduction: {
      type: Number, // in MT
      required: true,
      min: 0,
    },
    efficiency: {
      type: Number, // percentage 0-100
      min: 0,
      max: 100,
    },
    machineUtilization: {
      type: Number, // percentage 0-100
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['On Track', 'Below Target', 'Critical', 'Halted'],
      default: 'On Track',
    },
  },
  { timestamps: true }
);

// Auto-calculate efficiency if not explicitly provided
ProductionSchema.pre('save', function (next) {
  if (this.targetProduction > 0 && (this.efficiency === undefined || this.efficiency === null)) {
    this.efficiency = Number(((this.actualProduction / this.targetProduction) * 100).toFixed(2));
  }
  next();
});

// Always fetch the latest record first
ProductionSchema.index({ plantName: 1, date: -1 });

export default mongoose.model("Production", ProductionSchema);