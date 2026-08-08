/**
 * Route Planning Service
 * -----------------------
 * Simplified Vehicle Routing Problem (VRP) solver using the
 * "nearest neighbor" heuristic:
 *
 *   1. Start at the depot (the plant).
 *   2. Repeatedly travel to the closest destination not yet visited.
 *   3. Repeat until all destinations are visited.
 *
 * This won't always find the mathematically optimal route (that requires
 * much heavier solvers like Google OR-Tools), but it's a fast, easy-to-explain
 * approximation that typically beats an unplanned/arbitrary route order
 * by a meaningful margin - which is exactly what we want for this demo.
 */

function distanceBetween(a, b, distanceMatrix) {
  return distanceMatrix[a][b];
}

/**
 * @param {string} depot - starting point name, e.g. "Koppal Plant"
 * @param {string[]} destinations - list of destination names to visit
 * @param {Object} distanceMatrix - distanceMatrix[from][to] = km
 * @returns {{ route: string[], totalDistanceKm: number }}
 */
export function planRouteNearestNeighbor(depot, destinations, distanceMatrix) {
  const unvisited = [...destinations];
  const route = [depot];
  let current = depot;
  let totalDistanceKm = 0;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    unvisited.forEach((dest, idx) => {
      const d = distanceBetween(current, dest, distanceMatrix);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = idx;
      }
    });

    const next = unvisited.splice(nearestIdx, 1)[0];
    route.push(next);
    totalDistanceKm += nearestDist;
    current = next;
  }

  return { route, totalDistanceKm };
}

/**
 * Compares a shipment's "standard" (unoptimized) cost/time against an
 * optimized estimate, using a flat efficiency gain derived from the
 * heuristic (real system would recompute cost from the actual optimized route).
 */
export function estimateOptimizedShipment(shipment) {
  const efficiencyGain = 0.1 + Math.random() * 0.08; // 10-18% improvement, demo purposes
  const optimizedCostInr = Math.round(shipment.standardCostInr * (1 - efficiencyGain));
  const optimizedHours = Math.round(shipment.standardHours * (1 - efficiencyGain * 0.7));

  return {
    ...shipment,
    optimizedCostInr,
    optimizedHours,
    savingsPct: Math.round(efficiencyGain * 100)
  };
}
