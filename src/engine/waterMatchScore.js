// AquaSwap Water Match Score (AMS) Engine
// Implements the heuristic B2B compatibility formula:
// AMS_ij = (S_j * Q_ij * QualityCompatibility_ij) / (Distance_ij + TreatmentCost_ij + Risk_ij)

import { calculateDistanceKm, applyTreatment, checkQualityCompliance } from './optimizationSolver';
import { TREATMENT_TECHNOLOGIES } from '../data/industrialProfiles';

/**
 * Sector risk weightings (Biosecurity, process contamination, and legal liability risk)
 */
export const SECTOR_RISK_FACTORS = {
  'Pharmaceutical Synthesis': 8.5,
  'Brine / ZLD Concentrate': 5.0,
  'Refinery Process Water': 7.0,
  'Textile Dyeing & Finishing': 4.5,
  'Food & Beverage Processing': 2.5,
  'Municipal / Commercial Greywater': 1.5,
  'Cooling Tower Blowdown': 3.0
};

/**
 * Calculate chemical quality compatibility between 0 and 100
 */
export function calculateQualityCompatibility(effluent, tolerance) {
  let score = 100;

  // Penalize based on how close or over the thresholds the effluent is
  const params = ['TDS', 'COD', 'BOD', 'CHLORIDES', 'SULFATES'];
  params.forEach((p) => {
    if (effluent[p] !== undefined && tolerance[p] !== undefined) {
      const ratio = effluent[p] / tolerance[p];
      if (ratio > 1.0) {
        // Exceeds limit
        score -= Math.min(30, (ratio - 1.0) * 25);
      } else if (ratio > 0.8) {
        // Tight margin
        score -= 5;
      }
    }
  });

  // pH compliance
  if (tolerance.pH_min && effluent.pH < tolerance.pH_min) {
    score -= (tolerance.pH_min - effluent.pH) * 15;
  }
  if (tolerance.pH_max && effluent.pH > tolerance.pH_max) {
    score -= (effluent.pH - tolerance.pH_max) * 15;
  }

  return Math.max(5, Math.min(100, Math.round(score)));
}

/**
 * Compute the AquaSwap Match Score (AMS) for all bilateral pairs
 */
export function computeAllMatchScores(suppliers, buyers, cluster) {
  const matches = [];

  suppliers.forEach((sup) => {
    buyers.forEach((buy) => {
      const distanceKm = calculateDistanceKm(sup.coords, buy.coords);
      const potentialQ = Math.min(sup.capacityW, buy.demandD);
      const scarcityS = buy.scarcityFactorS || cluster.watershedScarcityIndex || 0.7;
      const riskFactor = SECTOR_RISK_FACTORS[sup.sector] || 4.0;

      // Find the best treatment technology for this pair
      let bestTech = TREATMENT_TECHNOLOGIES[0];
      let bestCompat = 0;
      let bestScore = 0;
      let bestTreatedEffluent = sup.effluent;

      TREATMENT_TECHNOLOGIES.forEach((tech) => {
        const treated = applyTreatment(sup.effluent, tech);
        const compat = calculateQualityCompatibility(treated, buy.toleranceM);
        const treatCost = tech.opexPerM3 * 10; // scaled cost index

        // Formula: AMS = (S_j * Q_ij * QualityCompatibility) / (Distance + TreatmentCost + Risk)
        // Scaled to a human-friendly 0-100 index
        const denominator = distanceKm * 0.8 + treatCost + riskFactor;
        const rawScore = (scarcityS * Math.sqrt(potentialQ) * compat) / denominator;
        const normalizedAMS = Math.min(99, Math.max(1, Math.round(rawScore * 2.2)));

        if (normalizedAMS > bestScore) {
          bestScore = normalizedAMS;
          bestTech = tech;
          bestCompat = compat;
          bestTreatedEffluent = treated;
        }
      });

      const compliance = checkQualityCompliance(bestTreatedEffluent, buy.toleranceM);

      matches.push({
        id: `${sup.id}-${buy.id}`,
        supplier: sup,
        buyer: buy,
        amsScore: bestScore,
        potentialFlowM3Day: Math.round(potentialQ),
        potentialFreshwaterSavedYear: Math.round(potentialQ * 365),
        distanceKm,
        recommendedTreatment: bestTech,
        qualityCompatibility: bestCompat,
        riskLevel: riskFactor > 6 ? 'High' : riskFactor > 3.5 ? 'Moderate' : 'Low',
        isCompliantWithTreatment: compliance.isCompliant,
        complianceIssues: compliance.issues,
        economicFeasibility: distanceKm < 15 && bestScore > 60 ? 'Highly Viable' : distanceKm < 35 ? 'Moderate' : 'Challenging'
      });
    });
  });

  // Sort descending by AMS score
  return matches.sort((a, b) => b.amsScore - a.amsScore);
}
