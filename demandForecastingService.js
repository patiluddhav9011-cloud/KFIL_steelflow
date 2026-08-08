/**
 * Demand Forecasting Service
 * ---------------------------
 * Simplified moving-average + linear-trend model.
 * This is intentionally lightweight (no external ML library) so it's easy
 * to read, run, and later swap out for a real model (Prophet, LightGBM, etc.)
 *
 * How it works:
 * 1. Take historical order quantities (grouped by month) for a product.
 * 2. Smooth the series with a moving average (default window = 3 months)
 *    to reduce noise from any single unusual month.
 * 3. Fit a simple linear trend line through the smoothed series.
 * 4. Project that trend forward N periods to get the forecast.
 */

function movingAverage(series, window = 3) {
  const result = [];
  for (let i = 0; i < series.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1);
    const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

// Ordinary least squares fit of y = a + b*x, x = 0,1,2,...
function linearTrend(series) {
  const n = series.length;
  const xs = series.map((_, i) => i);
  const xMean = xs.reduce((s, v) => s + v, 0) / n;
  const yMean = series.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (series[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

/**
 * @param {number[]} historicalQuantities - e.g. monthly order totals for a product
 * @param {number} periodsAhead - how many future periods to forecast
 * @param {number} maWindow - moving average window size
 * @returns {{ smoothed: number[], forecast: number[], slope: number }}
 */
export function forecastDemand(historicalQuantities, periodsAhead = 3, maWindow = 3) {
  if (!historicalQuantities || historicalQuantities.length < 2) {
    return { smoothed: historicalQuantities || [], forecast: [], slope: 0 };
  }

  const smoothed = movingAverage(historicalQuantities, maWindow);
  const { slope, intercept } = linearTrend(smoothed);

  const forecast = [];
  const n = smoothed.length;
  for (let i = 0; i < periodsAhead; i++) {
    const x = n + i;
    const value = intercept + slope * x;
    forecast.push(Math.max(0, Math.round(value)));
  }

  return { smoothed: smoothed.map((v) => Math.round(v)), forecast, slope: Number(slope.toFixed(2)) };
}
