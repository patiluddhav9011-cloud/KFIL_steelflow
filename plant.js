import express from "express";

import Production from "../models/Production.js";
import PlantInventory from "../models/PlantInventory.js";
import Dispatch from "../models/Dispatch.js";
import Alert from "../models/Alert.js";

const router = express.Router();
/**
 * Helper: derive an overall plant health score (0-100) from the
 * latest production efficiency, inventory status, and dispatch status.
 */
function computeHealthScore({ production, inventory, dispatch, alerts }) {
  let score = 100;

  if (production && typeof production.efficiency === 'number') {
    score -= Math.max(0, 100 - production.efficiency) * 0.4;
  }

  if (inventory) {
    if (inventory.status === 'Critical') score -= 25;
    else if (inventory.status === 'Low Stock') score -= 12;
  }

  if (dispatch) {
    if (dispatch.status === 'Critical') score -= 20;
    else if (dispatch.status === 'Delayed') score -= 10;
  }

  const unresolvedCritical = (alerts || []).filter(
    (a) => !a.resolved && a.severity === 'Critical'
  ).length;
  score -= unresolvedCritical * 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * GET /api/plants/jejuri
 * Returns the latest snapshot for the Jejuri Plant dashboard:
 * production, inventory, dispatch, and active alerts.
 */
router.get('/jejuri', async (req, res) => {
  try {
    const [production, inventory, dispatch, alerts] = await Promise.all([
      Production.findOne({ plantName: PLANT_NAME }).sort({ date: -1 }).lean(),
      PlantInventory.findOne({ plantName: PLANT_NAME }).sort({ updatedAt: -1 }).lean(),
      Dispatch.findOne({ plantName: PLANT_NAME }).sort({ date: -1 }).lean(),
      Alert.find({ plantName: PLANT_NAME }).sort({ timestamp: -1 }).limit(20).lean(),
    ]);

    return res.status(200).json({
      production: production || {},
      inventory: inventory || {},
      dispatch: dispatch || {},
      alerts: alerts || [],
    });
  } catch (err) {
    console.error('Error fetching Jejuri plant data:', err);
    return res.status(500).json({ error: 'Failed to fetch Jejuri plant data' });
  }
});

/**
 * GET /api/plants/summary
 * Returns an overall plant health summary (used for the "Plant Health" KPI card).
 */
router.get('/summary', async (req, res) => {
  try {
    const [production, inventory, dispatch, alerts] = await Promise.all([
      Production.findOne({ plantName: PLANT_NAME }).sort({ date: -1 }).lean(),
      PlantInventory.findOne({ plantName: PLANT_NAME }).sort({ updatedAt: -1 }).lean(),
      Dispatch.findOne({ plantName: PLANT_NAME }).sort({ date: -1 }).lean(),
      Alert.find({ plantName: PLANT_NAME, resolved: false }).sort({ timestamp: -1 }).lean(),
    ]);

    const healthScore = computeHealthScore({ production, inventory, dispatch, alerts });

    let healthStatus = 'Excellent';
    if (healthScore < 50) healthStatus = 'Critical';
    else if (healthScore < 70) healthStatus = 'Needs Attention';
    else if (healthScore < 90) healthStatus = 'Good';

    return res.status(200).json({
      plantName: PLANT_NAME,
      healthScore,
      healthStatus,
      openAlerts: alerts.length,
      lastUpdated: new Date(),
    });
  } catch (err) {
    console.error('Error computing plant summary:', err);
    return res.status(500).json({ error: 'Failed to compute plant summary' });
  }
});

export default router;