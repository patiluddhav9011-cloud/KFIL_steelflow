/**
 * Lead Time Prediction Service
 * ------------------------------
 * Simple, explainable statistical model:
 *   predictedLeadTime = average of past lead times
 *   variability        = standard deviation of past lead times
 *   confidenceRange    = predictedLeadTime +/- 1 standard deviation
 *
 * This tells procurement not just "expect 12 days" but "expect 12 days,
 * plus or minus 3" - which is far more useful for planning safety stock.
 */

function mean(values) {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values) {
  const avg = mean(values);
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * @param {number[]} pastLeadTimesDays - historical lead times in days
 * @returns {Object} predicted lead time with a confidence range
 */
export function predictLeadTime(pastLeadTimesDays) {
  if (!pastLeadTimesDays || pastLeadTimesDays.length === 0) {
    return { predictedDays: null, variabilityDays: null, rangeLowDays: null, rangeHighDays: null, sampleSize: 0 };
  }

  const avg = mean(pastLeadTimesDays);
  const sd = stdDev(pastLeadTimesDays);

  return {
    predictedDays: Number(avg.toFixed(1)),
    variabilityDays: Number(sd.toFixed(1)),
    rangeLowDays: Math.max(0, Math.round(avg - sd)),
    rangeHighDays: Math.round(avg + sd),
    sampleSize: pastLeadTimesDays.length
  };
}
