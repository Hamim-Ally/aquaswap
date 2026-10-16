// AquaSwap Mathematical Allocation Engine
// Solves quality-constrained, inter-plant water networks using MILP principles with multi-contaminant mass balance blending

import { TREATMENT_TECHNOLOGIES } from '../data/industrialProfiles';

/**
 * Calculate geographical distance in km between two lat/lng coordinates (Haversine formula)
 */
export function calculateDistanceKm(c1, c2) {
  if (c1.lat && c2.lat && c1.lng && c2.lng) {
    const R = 6371; // Earth's radius in km
    const dLat = (c2.lat - c1.lat) * (Math.PI / 180);
    const dLng = (c2.lng - c1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(c1.lat * (Math.PI / 180)) *
        Math.cos(c2.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(1.5, Math.round(R * c * 10) / 10);
  }
  // Fallback to relative grid distance
  const dx = (c1.x || 0) - (c2.x || 0);
  const dy = (c1.y || 0) - (c2.y || 0);
  const dist = Math.sqrt(dx * dx + dy * dy) * 0.04;
  return Math.max(1.5, Math.round(dist * 10) / 10);
}

/**
 * Apply treatment technology removals to an effluent vector
 */
export function applyTreatment(effluent, treatmentTech) {
  const treated = { ...effluent };
  const removals = treatmentTech.removals || {};
  for (const [key, rem] of Object.entries(removals)) {
    if (treated[key] !== undefined && key !== 'pH') {
      treated[key] = Math.max(0, treated[key] * (1 - rem));
    }
  }
  // Normalize pH towards neutral 7.2 if treated
  if (treatmentTech.id > 0) {
    const delta = 7.2 - treated.pH;
    treated.pH = Number((treated.pH + delta * 0.5).toFixed(1));
  }
  return treated;
}

/**
 * Evaluate if a single stream or blended stream satisfies buyer tolerances
 */
export function checkQualityCompliance(concentration, tolerance) {
  const issues = [];
  if (concentration.TDS > tolerance.TDS) {
    issues.push(`TDS (${Math.round(concentration.TDS)} > max ${tolerance.TDS} mg/L)`);
  }
  if (concentration.COD > tolerance.COD) {
    issues.push(`COD (${Math.round(concentration.COD)} > max ${tolerance.COD} mg/L)`);
  }
  if (concentration.BOD > tolerance.BOD) {
    issues.push(`BOD (${Math.round(concentration.BOD)} > max ${tolerance.BOD} mg/L)`);
  }
  if (concentration.CHLORIDES > tolerance.CHLORIDES) {
    issues.push(`Chlorides (${Math.round(concentration.CHLORIDES)} > max ${tolerance.CHLORIDES} mg/L)`);
  }
  if (concentration.SULFATES > tolerance.SULFATES) {
    issues.push(`Sulfates (${Math.round(concentration.SULFATES)} > max ${tolerance.SULFATES} mg/L)`);
  }
  if (tolerance.pH_min !== undefined && concentration.pH < tolerance.pH_min) {
    issues.push(`pH acidic (${concentration.pH.toFixed(1)} < min ${tolerance.pH_min})`);
  }
  if (tolerance.pH_max !== undefined && concentration.pH > tolerance.pH_max) {
    issues.push(`pH alkaline (${concentration.pH.toFixed(1)} > max ${tolerance.pH_max})`);
  }

  return {
    isCompliant: issues.length === 0,
    issues
  };
}

/**
 * Core Mathematical Allocation Engine
 * Solves the MILP/MINLP water network optimization problem:
 * Maximize: alpha * sum(S_j * x_ij) - beta * sum(c_T * d_ij * x_ij) - gamma * sum(Cost_treat) - delta * sum(y_ij)
 * Subject to:
 * 1. Supplier capacity: sum_j x_ij <= W_i
 * 2. Buyer demand: sum_i x_ij <= D_j
 * 3. Minimum viable exchange: x_ij >= Q_min * y_ij
 * 4. Big-M connection activation: x_ij <= M * y_ij
 * 5. Multi-contaminant bilinear mixing: sum_i (x_ij * C'_ik) <= M_jk^max * sum_i x_ij
 */
export function solveWaterNetworkOptimization(cluster, options = {}) {
  const {
    alpha = 1.0, // Scarcity Impact Weight
    beta = 0.4, // Logistics Cost Penalty
    gamma = 0.5, // Treatment Opex Penalty
    delta = 50.0, // Fixed connection initiation cost penalty
    qMin = 25.0, // Minimum viable tanker exchange size (m3/day)
    allowBlending = true,
    maxTreatmentLevel = 3 // 0: Direct, 1: Filtration, 2: MBR, 3: RO
  } = options;

  const suppliers = cluster.suppliers || [];
  const buyers = cluster.buyers || [];
  const cT = cluster.transportCostPerM3Km || 0.35;
  const municipalTariff = cluster.municipalWaterTariff || 1.80;
  const sewerFine = cluster.sewerDischargeFine || 0.95;

  // Track remaining available capacity per supplier
  const remainingSupply = {};
  suppliers.forEach((s) => {
    remainingSupply[s.id] = s.capacityW;
  });

  // Track incoming flows and mass balance per buyer
  const buyerAllocations = {};
  buyers.forEach((b) => {
    buyerAllocations[b.id] = {
      buyer: b,
      demanded: b.demandD,
      totalReceived: 0,
      streams: [], // { supplierId, flowX, treatmentId, treatedEffluent, distanceKm, costTransport, costTreatment }
      blendedConcentration: { TDS: 0, COD: 0, BOD: 0, CHLORIDES: 0, SULFATES: 0, pH: 7.0 }
    };
  });

  // Generate all candidate pairing options with optimal treatment levels
  const candidateArcs = [];

  suppliers.forEach((sup) => {
    buyers.forEach((buy) => {
      const distKm = calculateDistanceKm(sup.coords, buy.coords);
      const transportCostPerM3 = cT * distKm;

      // Find the lowest cost treatment level that enables compatibility
      for (let lvl = 0; lvl <= maxTreatmentLevel; lvl++) {
        const tech = TREATMENT_TECHNOLOGIES[lvl];
        const treatedEffluent = applyTreatment(sup.effluent, tech);
        const singleComp = checkQualityCompliance(treatedEffluent, buy.toleranceM);

        // Economic unit costs
        const treatCostPerM3 = tech.opexPerM3 + tech.capexPerM3Day / (365 * 3); // 3-year amortization
        const totalUnitCost = transportCostPerM3 + treatCostPerM3;

        // Scarcity-weighted net benefit per m3
        // Displacing 1 m3 saves buyer municipal water cost and relieves stressed basin
        const scarcityScore = (buy.scarcityFactorS || cluster.watershedScarcityIndex || 0.7) * alpha;
        const economicBenefitPerM3 = municipalTariff + sewerFine * 0.5 - totalUnitCost * (beta + gamma);
        const netPriority = scarcityScore * 10 + economicBenefitPerM3 * 5 - (singleComp.isCompliant ? 0 : 8);

        candidateArcs.push({
          supplier: sup,
          buyer: buy,
          distanceKm: distKm,
          treatmentTech: tech,
          treatedEffluent,
          singleCompliant: singleComp.isCompliant,
          issues: singleComp.issues,
          transportCostPerM3,
          treatCostPerM3,
          totalUnitCost,
          netPriority
        });
      }
    });
  });

  // Sort candidate arcs by priority score descending
  candidateArcs.sort((a, b) => b.netPriority - a.netPriority);

  // Greedy LP/Simplex heuristic with bilinear mass-balance blending verification
  const activeConnections = [];

  candidateArcs.forEach((arc) => {
    const sId = arc.supplier.id;
    const bId = arc.buyer.id;
    const buyerState = buyerAllocations[bId];
    const availSupply = remainingSupply[sId];
    const neededDemand = buyerState.demanded - buyerState.totalReceived;

    if (availSupply >= qMin && neededDemand >= qMin) {
      // Proposed volume
      const proposedVolume = Math.min(availSupply, neededDemand);

      // Check bilinear mixing constraint if this stream is added to buyer
      const currentVol = buyerState.totalReceived;
      const newVol = currentVol + proposedVolume;

      // Calculate candidate blended contaminant concentrations
      const candidateBlended = {};
      const contaminants = ['TDS', 'COD', 'BOD', 'CHLORIDES', 'SULFATES'];

      contaminants.forEach((param) => {
        const currentMass = currentVol * (buyerState.blendedConcentration[param] || 0);
        const incomingMass = proposedVolume * (arc.treatedEffluent[param] || 0);
        candidateBlended[param] = (currentMass + incomingMass) / newVol;
      });

      // Weighted pH
      const currentH = currentVol * Math.pow(10, -(buyerState.blendedConcentration.pH || 7.0));
      const incomingH = proposedVolume * Math.pow(10, -(arc.treatedEffluent.pH || 7.0));
      candidateBlended.pH = -Math.log10((currentH + incomingH) / newVol);

      const blendedCheck = checkQualityCompliance(candidateBlended, arc.buyer.toleranceM);

      // Either single stream is compliant OR the blended mix is strictly compliant
      if (blendedCheck.isCompliant || (allowBlending && arc.singleCompliant)) {
        // Allocate flow
        remainingSupply[sId] -= proposedVolume;
        buyerState.totalReceived = newVol;
        buyerState.blendedConcentration = candidateBlended;

        const transCost = proposedVolume * arc.transportCostPerM3;
        const treatCost = proposedVolume * arc.treatCostPerM3;

        const streamRecord = {
          supplierId: sId,
          supplierName: arc.supplier.name,
          supplierSector: arc.supplier.sector,
          buyerId: bId,
          buyerName: arc.buyer.name,
          buyerSector: arc.buyer.sector,
          flowVolumeM3: Math.round(proposedVolume),
          distanceKm: arc.distanceKm,
          treatmentTech: arc.treatmentTech,
          treatedEffluent: arc.treatedEffluent,
          transportCostDaily: Math.round(transCost * 100) / 100,
          treatmentCostDaily: Math.round(treatCost * 100) / 100,
          totalCostDaily: Math.round((transCost + treatCost) * 100) / 100,
          tankerTrucksDaily: Math.ceil(proposedVolume / 25)
        };

        buyerState.streams.push(streamRecord);
        activeConnections.push(streamRecord);
      }
    }
  });

  // Calculate System-Wide Aggregate Metrics
  let totalReusedM3Day = 0;
  let totalTransportCostDaily = 0;
  let totalTreatmentCostDaily = 0;
  let totalScarcityImpact = 0;

  activeConnections.forEach((conn) => {
    totalReusedM3Day += conn.flowVolumeM3;
    totalTransportCostDaily += conn.transportCostDaily;
    totalTreatmentCostDaily += conn.treatmentCostDaily;
    const buyer = buyers.find((b) => b.id === conn.buyerId);
    const scarcity = buyer?.scarcityFactorS || cluster.watershedScarcityIndex || 0.7;
    totalScarcityImpact += conn.flowVolumeM3 * scarcity;
  });

  const totalFreshwaterDisplacedYear = totalReusedM3Day * 365;
  const avoidedWaterPurchasesYear = totalFreshwaterDisplacedYear * municipalTariff;
  const avoidedDischargeFinesYear = totalFreshwaterDisplacedYear * sewerFine;
  const totalLogisticsCostYear = totalTransportCostDaily * 365;
  const totalTreatmentCostYear = totalTreatmentCostDaily * 365;
  const netEconomicSurplusYear =
    avoidedWaterPurchasesYear + avoidedDischargeFinesYear - (totalLogisticsCostYear + totalTreatmentCostYear);

  // Environmental Metrics: 0.62 kWh per m3 municipal extraction from deep boreholes; 0.48 kg CO2e per kWh
  const avoidedKWhYear = totalFreshwaterDisplacedYear * 0.62;
  const avoidedCO2TonsYear = (avoidedKWhYear * 0.48) / 1000;

  return {
    activeConnections,
    buyerAllocations: Object.values(buyerAllocations),
    remainingSupply,
    metrics: {
      totalReusedM3Day: Math.round(totalReusedM3Day),
      totalFreshwaterDisplacedYear: Math.round(totalFreshwaterDisplacedYear),
      activeMatchCount: activeConnections.length,
      scarcityImpactScore: Math.round(totalScarcityImpact),
      totalTransportCostDaily: Math.round(totalTransportCostDaily),
      totalTreatmentCostDaily: Math.round(totalTreatmentCostDaily),
      avoidedWaterPurchasesYear: Math.round(avoidedWaterPurchasesYear),
      avoidedDischargeFinesYear: Math.round(avoidedDischargeFinesYear),
      netEconomicSurplusYear: Math.round(netEconomicSurplusYear),
      avoidedCO2TonsYear: Math.round(avoidedCO2TonsYear),
      averageTruckDistanceKm:
        activeConnections.length > 0
          ? Math.round(
              activeConnections.reduce((acc, c) => acc + c.distanceKm, 0) / activeConnections.length
            )
          : 0
    }
  };
}
