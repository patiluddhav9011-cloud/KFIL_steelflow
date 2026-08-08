/**
 * Inventory Optimization Service
 * -------------------------------
 * Classic, well-established inventory formulas (no ML needed here):
 *
 * Safety Stock = Z * demandStdDev * sqrt(leadTimeDays)
 *   Z is the "service level factor" - how many standard deviations of buffer
 *   you want. Higher service level = less chance of stockout = more buffer.
 *
 * Reorder Point = (avgDailyConsumption * leadTimeDays) + Safety Stock
 *   The stock level at which you should place a new order, so the new
 *   order arrives right as you'd otherwise run out.
 *
 * Days of Cover = currentStock / avgDailyConsumption
 *   How many days the current stock will last at current usage rate.
 */

// Approximate Z-scores for common service levels (from the standard normal distribution)
const Z_SCORES = {
  0.90: 1.28,
  0.95: 1.65,
  0.975: 1.96,
  0.99: 2.33
};

function zScoreForServiceLevel(serviceLevel) {
  const closest = Object.keys(Z_SCORES).reduce((best, key) =>
    Math.abs(key - serviceLevel) < Math.abs(best - serviceLevel) ? Number(key) : best,
  0.95);
  return Z_SCORES[closest];
}

/**
 * @param {Object} item - an Inventory document (or plain object) with:
 *   currentStock, avgDailyConsumption, demandStdDev, leadTimeDays, serviceLevel
 * @returns {Object} analysis result with safetyStock, reorderPoint, daysOfCover, status
 */
export function analyzeInventoryItem(item) {
  const {
    currentStock,
    avgDailyConsumption,
    demandStdDev = 0,
    leadTimeDays,
    serviceLevel = 0.95
  } = item;

  const z = zScoreForServiceLevel(serviceLevel);
  const safetyStock = Math.round(z * demandStdDev * Math.sqrt(leadTimeDays));
  const reorderPoint = Math.round(avgDailyConsumption * leadTimeDays + safetyStock);
  const daysOfCover = avgDailyConsumption > 0
    ? Number((currentStock / avgDailyConsumption).toFixed(1))
    : null;

  let status = "healthy";
  if (currentStock <= reorderPoint * 0.75) status = "critical";
  else if (currentStock <= reorderPoint) status = "watch";

  return {
    itemName: item.itemName,
    currentStock,
    safetyStock,
    reorderPoint,
    daysOfCover,
    status,
    recommendedAction:
      status === "critical"
        ? "Place a purchase order now"
        : status === "watch"
        ? "Plan a purchase order soon"
        : "No action needed"
  };
}

export function analyzeInventoryList(items) {
  return items.map(analyzeInventoryItem);
}
