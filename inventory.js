import { Router } from "express";
import Inventory from "../models/Inventory.js";
import { analyzeInventoryItem, analyzeInventoryList } from "../services/inventoryOptimizationService.js";
import { sendLowStockAlert } from "../services/emailService.js";

const router = Router();

// GET /api/inventory - list all inventory items
router.get("/", async (req, res) => {
  const items = await Inventory.find().sort({ itemName: 1 });
  res.json(items);
});

// GET /api/inventory/analysis - run reorder point / safety stock analysis on everything,
// and fire off email alerts for anything critical
router.get("/analysis", async (req, res) => {
  const items = await Inventory.find();
  const analysis = analyzeInventoryList(items);

  const critical = analysis.filter((a) => a.status === "critical");
  await Promise.all(critical.map((item) => sendLowStockAlert(item)));

  res.json({ analysis, criticalCount: critical.length });
});

// POST /api/inventory - create a new inventory item
router.post("/", async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/inventory/:id - update an inventory item (e.g. after a stock count)
router.put("/:id", async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: "Inventory item not found" });

    // Check this one item after the update, and alert if it's now critical
    const analysis = analyzeInventoryItem(item);
    if (analysis.status === "critical") await sendLowStockAlert(analysis);

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/inventory/:id
router.delete("/:id", async (req, res) => {
  const item = await Inventory.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: "Inventory item not found" });
  res.json({ message: "Inventory item deleted" });
});

export default router;
