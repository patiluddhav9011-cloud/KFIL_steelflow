import { Router } from "express";
import Supplier from "../models/Supplier.js";
import { scoreSupplierRisk, scoreSupplierRiskList } from "../services/supplierRiskService.js";
import { predictLeadTime } from "../services/leadTimePredictionService.js";
import { sendSupplierRiskAlert } from "../services/emailService.js";

const router = Router();

// GET /api/suppliers - list all suppliers
router.get("/", async (req, res) => {
  const suppliers = await Supplier.find().sort({ name: 1 });
  res.json(suppliers);
});

// GET /api/suppliers/risk-scores - score every supplier, save the result, and
// send an alert email for any supplier that's now high risk
router.get("/risk-scores", async (req, res) => {
  const suppliers = await Supplier.find();
  const scored = scoreSupplierRiskList(suppliers);

  await Promise.all(
    scored.map(async (result, i) => {
      const supplier = suppliers[i];
      supplier.riskScore = result.riskScore;
      supplier.riskLevel = result.riskLevel;
      supplier.riskLastScoredAt = new Date();
      await supplier.save();

      if (result.riskLevel === "high") await sendSupplierRiskAlert(result);
    })
  );

  res.json(scored);
});

// GET /api/suppliers/:id/lead-time - predicted lead time for one supplier
router.get("/:id/lead-time", async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ error: "Supplier not found" });

  const prediction = predictLeadTime(supplier.pastLeadTimesDays);
  res.json({ supplier: supplier.name, ...prediction });
});

// POST /api/suppliers - create a new supplier
router.post("/", async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/suppliers/:id - update a supplier
router.put("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/suppliers/:id
router.delete("/:id", async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) return res.status(404).json({ error: "Supplier not found" });
  res.json({ message: "Supplier deleted" });
});

export default router;
