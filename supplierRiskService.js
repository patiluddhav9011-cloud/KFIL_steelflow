/**
 * Supplier Risk Scoring Service
 * -------------------------------
 * Weighted rule-based model (transparent and easy to explain to plant
 * managers - a common real-world alternative to a black-box ML model for
 * this kind of decision).
 *
 * Each supplier is scored 0-100 (100 = highest risk) using 5 weighted factors.
 * Weights sum to 100 and can be tuned per company policy.
 */

const WEIGHTS = {
  onTimeDeliveryRate: 0.30,       // lower on-time rate -> higher risk
  qualityAcceptanceRate: 0.20,    // lower quality acceptance -> higher risk
  financialHealthScore: 0.20,     // lower financial health -> higher risk
  geopoliticalStabilityScore: 0.20, // lower stability -> higher risk
  singleSourceDependency: 0.10    // being a single-source supplier -> higher risk
};

export function scoreSupplierRisk(supplier) {
  const {
    onTimeDeliveryRate,
    qualityAcceptanceRate,
    financialHealthScore,
    geopoliticalStabilityScore,
    singleSourceDependency
  } = supplier;

  // Convert each "goodness" score (0-100) into a "risk contribution" (0-100)
  const riskFromDelivery = (100 - onTimeDeliveryRate) * WEIGHTS.onTimeDeliveryRate;
  const riskFromQuality = (100 - qualityAcceptanceRate) * WEIGHTS.qualityAcceptanceRate;
  const riskFromFinance = (100 - financialHealthScore) * WEIGHTS.financialHealthScore;
  const riskFromGeo = (100 - geopoliticalStabilityScore) * WEIGHTS.geopoliticalStabilityScore;
  const riskFromSourcing = (singleSourceDependency ? 100 : 0) * WEIGHTS.singleSourceDependency;

  const riskScore = Math.round(
    riskFromDelivery + riskFromQuality + riskFromFinance + riskFromGeo + riskFromSourcing
  );

  let riskLevel = "low";
  if (riskScore >= 65) riskLevel = "high";
  else if (riskScore >= 35) riskLevel = "medium";

  return {
    supplierName: supplier.name,
    riskScore,
    riskLevel,
    breakdown: {
      delivery: Math.round(riskFromDelivery),
      quality: Math.round(riskFromQuality),
      financial: Math.round(riskFromFinance),
      geopolitical: Math.round(riskFromGeo),
      sourcingConcentration: Math.round(riskFromSourcing)
    }
  };
}

export function scoreSupplierRiskList(suppliers) {
  return suppliers.map(scoreSupplierRisk);
}
