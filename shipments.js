import { Router } from "express";
import Shipment from "../models/Shipment.js";
import { planRouteNearestNeighbor, estimateOptimizedShipment } from "../services/routePlanningService.js";

const router = Router();

// GET /api/shipments - list all shipments
router.get("/", async (req, res) => {
  const shipments = await Shipment.find().sort({ createdAt: -1 });
  res.json(shipments);
});

// GET /api/shipments/route-plan - run the nearest-neighbor route planner
// across all pending shipment destinations from the plant
router.get("/route-plan", async (req, res) => {
  const shipments = await Shipment.find({ routeStatus: "pending" });
  if (shipments.length === 0) return res.json({ route: [], totalDistanceKm: 0, shipments: [] });

  const depot = "Koppal Plant";
  const destinations = shipments.map((s) => s.destination);

  // Build a simple symmetric distance matrix from each shipment's known distance-from-plant.
  // (A production version would use a real distance/travel-time API or GIS data.)
  const distanceMatrix = { [depot]: {} };
  destinations.forEach((dest, i) => {
    const km = shipments[i].distanceKm;
    distanceMatrix[depot][dest] = km;
    distanceMatrix[dest] = distanceMatrix[dest] || {};
    distanceMatrix[dest][depot] = km;
    destinations.forEach((otherDest, j) => {
      if (i !== j) {
        distanceMatrix[dest][otherDest] = Math.abs(shipments[i].distanceKm - shipments[j].distanceKm) + 20;
      }
    });
  });

  const plan = planRouteNearestNeighbor(depot, destinations, distanceMatrix);

  // Also compute optimized cost/time estimates for each shipment
  const optimizedShipments = shipments.map((s) => estimateOptimizedShipment(s.toObject()));

  res.json({ ...plan, shipments: optimizedShipments });
});

// POST /api/shipments - create a new shipment
router.post("/", async (req, res) => {
  try {
    const shipment = await Shipment.create(req.body);
    res.status(201).json(shipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/shipments/:id - update a shipment (e.g. mark as dispatched, apply optimized route)
router.put("/:id", async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });
    res.json(shipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/shipments/:id
router.delete("/:id", async (req, res) => {
  const shipment = await Shipment.findByIdAndDelete(req.params.id);
  if (!shipment) return res.status(404).json({ error: "Shipment not found" });
  res.json({ message: "Shipment deleted" });
});

export default router;
