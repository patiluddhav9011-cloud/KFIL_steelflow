import { Router } from "express";
import Order from "../models/Order.js";
import { forecastDemand } from "../services/demandForecastingService.js";

const router = Router();

// GET /api/forecasting/:product - forecast demand for a product
// e.g. GET /api/forecasting/TMT%20Rebar?periodsAhead=3
router.get("/:product", async (req, res) => {
  const { product } = req.params;
  const periodsAhead = Number(req.query.periodsAhead) || 3;

  // Pull historical orders for this product, grouped by month
  const orders = await Order.find({ product }).sort({ orderDate: 1 });

  const monthlyTotals = {};
  orders.forEach((order) => {
    const key = `${order.orderDate.getFullYear()}-${String(order.orderDate.getMonth() + 1).padStart(2, "0")}`;
    monthlyTotals[key] = (monthlyTotals[key] || 0) + order.quantityMT;
  });

  const months = Object.keys(monthlyTotals).sort();
  const quantities = months.map((m) => monthlyTotals[m]);

  if (quantities.length < 2) {
    return res.json({
      product,
      message: "Not enough historical order data yet to forecast (need at least 2 months). Add more orders or run the seed script.",
      history: months.map((m, i) => ({ month: m, quantityMT: quantities[i] }))
    });
  }

  const { smoothed, forecast, slope } = forecastDemand(quantities, periodsAhead);

  res.json({
    product,
    history: months.map((m, i) => ({ month: m, quantityMT: quantities[i] })),
    smoothed,
    forecast,
    trend: slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "flat"
  });
});

export default router;
