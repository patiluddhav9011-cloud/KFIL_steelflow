import { Router } from "express";

const router = Router();

// In a real deployment, this file would be replaced with an actual connector
// to SAP (via OData/RFC) or Oracle ERP Cloud (via REST APIs). For this demo,
// it simulates what that integration would look like and return.

let lastSync = null;

// GET /api/erp/status - current connection/sync status
router.get("/status", (req, res) => {
  res.json({
    connected: true,
    system: "SAP S/4HANA (simulated)",
    lastSync,
    syncedEntities: ["Purchase Orders", "Material Master", "Vendor Master", "Goods Movements"]
  });
});

// POST /api/erp/sync - simulate pulling the latest data from the ERP system
router.post("/sync", async (req, res) => {
  // Simulate network/processing delay like a real ERP sync would have
  await new Promise((resolve) => setTimeout(resolve, 800));

  lastSync = new Date();

  res.json({
    success: true,
    syncedAt: lastSync,
    summary: {
      purchaseOrdersSynced: Math.floor(20 + Math.random() * 30),
      materialRecordsSynced: Math.floor(50 + Math.random() * 100),
      vendorRecordsSynced: Math.floor(5 + Math.random() * 15),
      warnings: []
    },
    note: "This is a simulated ERP sync for demo purposes. A production build would call SAP's OData services or Oracle ERP Cloud REST APIs here."
  });
});

export default router;
