import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import ordersRoutes from "./routes/orders.js";
import inventoryRoutes from "./routes/inventory.js";
import suppliersRoutes from "./routes/suppliers.js";
import shipmentsRoutes from "./routes/shipments.js";
import forecastingRoutes from "./routes/forecasting.js";
import erpRoutes from "./routes/erp.js";
import plantRoutes from "./routes/plant.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "KFILSteelFlow SCM API"
  });
});

// API routes
app.use("/api/orders", ordersRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/shipments", shipmentsRoutes);
app.use("/api/forecasting", forecastingRoutes);
app.use("/api/erp", erpRoutes);
app.use("/api/plants", plantRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[KFILSteelFlow] Server running on port ${PORT}`);
      console.log(`[KFILSteelFlow] Health check: /api/health`);
    });
  })
  .catch((error) => {
    console.error("[KFILSteelFlow] Failed to connect to MongoDB:", error);
    process.exit(1);
  });