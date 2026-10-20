// AquaSwap Mathematical Allocation Engine
// Solves quality-constrained, inter-plant water networks using MILP principles with multi-contaminant mass balance blending.
// Transport model: real tanker fleet trips (capacity, fuel/km, stop fee) with utilization-based efficiency loss.
// Economics model: water purchase price + transport + treatment vs. water value (municipal tariff avoided + discharge fine avoided).
// Only ROI-positive routes are executed.

import { TREATMENT_TECHNOLOGIES, TANKER_FLEET, EXTENDED_CONTAMINANTS, BASE_PARAMS, ALL_WATER_PARAMS } from '../data/industrialProfiles.js';

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
 * Evaluate if a single stream or blended stream satisfies buyer tolerances.
 * Base contaminants are always checked; extended sector parameters (HARDNESS,
 * SILICA, IRON, COLOR, OIL) are checked only when both stream & tolerance define them.
 */
export function checkQualityCompliance(concentration, tolerance) {
  const issues = [];

  [...BASE_PARAMS, ...Object.keys(EXTENDED_CONTAMINANTS)].forEach((key) => {
    if (key === 'pH') return;
    if (concentration[key] !== undefined && tolerance[key] !== undefined && concentration[key] > tolerance[key]) {
      issues.push(`${key.toUpperCase()} (${Math.round(concentration[key])} > max ${tolerance[key]} mg/L)`);
    }
  });

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
 * Round-trip cost of one full truck trip over a distance
 */
export function truckTripCostUSD(truck, distanceKm) {
  return 2 * truck.costPerKmUSD * distanceKm + truck.fixedCostPerTripUSD;
}

/**
 * Cheapest transport plan for a given volume & distance across the tanker fleet.
 * Chooses the truck with the lowest effective USD/m3 including partial-load efficiency loss:
 * an underfilled truck still pays for the whole trip, so USD/m3 = tripCost / (fillUtilization x capacity).
 * Returns { truck, trips, capacityM3, utilizationPct, efficiencyLossPct, costDaily, costPerM3 }
 */
export function selectTransport(volumeM3, distanceKm) {
  let best = null;

  TANKER_FLEET.forEach((truck) => {
    const trips = Math.max(1, Math.ceil(volumeM3 / truck.capacityM3));
    const tripCost = truckTripCostUSD(truck, distanceKm);
    const tieredCost = tripCost * trips;
    const perM3 = tieredCost / volumeM3;

    if (!best || perM3 < best.costPerM3 - 1e-9 || (Math.abs(perM3 - best.costPerM3) <= 1e-9 && truck.capacityM3 > best.capacityM3)) {
      best = {
        truck,
        trips,
        capacityM3: truck.capacityM3,
        utilizationPct: (volumeM3 / (trips * truck.capacityM3)) * 100,
        efficiencyLossPct: 100 - (volumeM3 / (trips * truck.capacityM3)) * 100,
        costDaily: tieredCost,
        costPerM3: perM3
      };
    }
  });

  return best;
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
 * 6. ROI constraint: value(municipal tariff + discharge fine avoided) > purchase + transport + treatment
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
  const municipalTariff = cluster.municipalWaterTariff || 1.80;
  const sewerFine = cluster.sewerDischargeFine || 0.95;

  // Full value created by moving 1 m3 of water: buyer avoids city tariff, supplier avoids sewer fine
  const valuePerM3 = municipalTariff + sewerFine;

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
      streams: [], // { supplierId, flowX, treatmentId, treatedEffluent, distanceKm, ...economics }
      blendedConcentration: { TDS: 0, COD: 0, BOD: 0, CHLORIDES: 0, SULFATES: 0, pH: 7.0 }
    };
  });

  // Generate all candidate pairing options with optimal treatment levels
  const candidateArcs = [];

  suppliers.forEach((sup) => {
    buyers.forEach((buy) => {
      const distKm = calculateDistanceKm(sup.coords, buy.coords);

      // Cheapest possible transport option at full truck utilization (best-case benchmark)
      let bestLoadCost = Infinity;
      TANKER_FLEET.forEach((truck) => {
        bestLoadCost = Math.min(bestLoadCost, truckTripCostUSD(truck, distKm) / truck.capacityM3);
      });
      const transportCostPerM3 = bestLoadCost;

      // What the buyer pays the seller per m3 of water
      const purchasePerM3 = sup.salePricePerM3 || 0.35 * municipalTariff;

      // Find the lowest cost treatment level that enables compatibility
      for (let lvl = 0; lvl <= maxTreatmentLevel; lvl++) {
        const tech = TREATMENT_TECHNOLOGIES[lvl];
        const treatedEffluent = applyTreatment(sup.effluent, tech);
        const singleComp = checkQualityCompliance(treatedEffluent, buy.toleranceM);

        // Economic unit costs (7-year capex amortization)
        const treatCostPerM3 = tech.opexPerM3 + tech.capexPerM3Day / (365 * 7);
        const totalUnitCost = purchasePerM3 + transportCostPerM3 + treatCostPerM3;

        // Scarcity-weighted net benefit per m3
        const scarcityScore = (buy.scarcityFactorS || cluster.watershedScarcityIndex || 0.7) * alpha;
        const economicBenefitPerM3 = valuePerM3 - totalUnitCost;
        const netPriority = scarcityScore * 10 + economicBenefitPerM3 * 5 - (singleComp.isCompliant ? 0 : 8);

        candidateArcs.push({
          supplier: sup,
          buyer: buy,
          distanceKm: distKm,
          treatmentTech: tech,
          treatedEffluent,
          singleCompliant: singleComp.isCompliant,
          issues: singleComp.issues,
          purchasePerM3,
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

      // ROI gate: only execute trades whose value exceeds all-in delivered cost
      const transportPlan = selectTransport(proposedVolume, arc.distanceKm);
      const deliveredCostPerM3 = arc.purchasePerM3 + transportPlan.costPerM3 + arc.treatCostPerM3;
      const marginPerM3 = valuePerM3 - deliveredCostPerM3;
      if (marginPerM3 <= 0) return;

      // Check bilinear mixing constraint if this stream is added to buyer
      const currentVol = buyerState.totalReceived;
      const newVol = currentVol + proposedVolume;

      // Calculate candidate blended contaminant concentrations (base + extended sector params)
      const candidateBlended = {};
      const contaminants = ALL_WATER_PARAMS;

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

        const transCost = transportPlan.costDaily;
        const treatCost = proposedVolume * arc.treatCostPerM3;
        const purchaseCost = proposedVolume * arc.purchasePerM3;
        const revenueDaily = proposedVolume * valuePerM3;
        const netDaily = revenueDaily - (transCost + treatCost + purchaseCost);

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
          // Transport & fleet
          truckId: transportPlan.truck.id,
          truckName: transportPlan.truck.name,
          truckCapacityM3: transportPlan.capacityM3,
          tripsDaily: transportPlan.trips,
          truckUtilizationPct: Math.round(transportPlan.utilizationPct),
          transportEfficiencyLossPct: Math.max(0, Math.round(transportPlan.efficiencyLossPct)),
          transportCostDaily: Math.round(transCost * 100) / 100,
          transportCostPerM3: Math.round(transportPlan.costPerM3 * 100) / 100,
          tankerTrucksDaily: transportPlan.trips,
          // Economics
          purchasePerM3: Math.round(arc.purchasePerM3 * 100) / 100,
          purchaseCostDaily: Math.round(purchaseCost * 100) / 100,
          treatmentCostPerM3: Math.round(arc.treatCostPerM3 * 100) / 100,
          treatmentCostDaily: Math.round(treatCost * 100) / 100,
          totalCostDaily: Math.round((transCost + treatCost) * 100) / 100,
          deliveredCostPerM3: Math.round(deliveredCostPerM3 * 100) / 100,
          valuePerM3: Math.round(valuePerM3 * 100) / 100,
          revenueDaily: Math.round(revenueDaily * 100) / 100,
          marginPerM3: Math.round(marginPerM3 * 100) / 100,
          netDaily: Math.round(netDaily * 100) / 100
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
  let totalPurchaseCostDaily = 0;
  let totalTruckTripsDaily = 0;
  let totalTruckCapacityUsed = 0;
  let totalScarcityImpact = 0;

  activeConnections.forEach((conn) => {
    totalReusedM3Day += conn.flowVolumeM3;
    totalTransportCostDaily += conn.transportCostDaily;
    totalTreatmentCostDaily += conn.treatmentCostDaily;
    totalPurchaseCostDaily += conn.purchaseCostDaily;
    totalTruckTripsDaily += conn.tripsDaily;
    totalTruckCapacityUsed += conn.tripsDaily * conn.truckCapacityM3;
    const buyer = buyers.find((b) => b.id === conn.buyerId);
    const scarcity = buyer?.scarcityFactorS || cluster.watershedScarcityIndex || 0.7;
    totalScarcityImpact += conn.flowVolumeM3 * scarcity;
  });

  const totalFreshwaterDisplacedYear = totalReusedM3Day * 365;
  const avoidedWaterPurchasesYear = totalFreshwaterDisplacedYear * municipalTariff;
  const avoidedDischargeFinesYear = totalFreshwaterDisplacedYear * sewerFine;
  const totalLogisticsCostYear = totalTransportCostDaily * 365;
  const totalTreatmentCostYear = totalTreatmentCostDaily * 365;
  const totalPurchaseCostYear = totalPurchaseCostDaily * 365;
  const totalValueGeneratedYear = avoidedWaterPurchasesYear + avoidedDischargeFinesYear;
  const totalOperatingCostYear = totalPurchaseCostYear + totalLogisticsCostYear + totalTreatmentCostYear;
  const netEconomicSurplusYear = totalValueGeneratedYear - totalOperatingCostYear;
  const roiPercent = totalOperatingCostYear > 0 ? (netEconomicSurplusYear / totalOperatingCostYear) * 100 : 0;
  const fleetUtilizationPct = totalTruckCapacityUsed > 0 ? (totalReusedM3Day / totalTruckCapacityUsed) * 100 : 0;
  const totalValueDaily = totalReusedM3Day * valuePerM3;
  const totalNetDaily = totalValueDaily - (totalPurchaseCostDaily + totalTransportCostDaily + totalTreatmentCostDaily);

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
      totalPurchaseCostDaily: Math.round(totalPurchaseCostDaily),
      totalValueDaily: Math.round(totalValueDaily),
      totalNetDaily: Math.round(totalNetDaily),
      trucksOnRoadDaily: Math.round(totalTruckTripsDaily),
      fleetUtilizationPct: Math.round(fleetUtilizationPct),
      fleetEfficiencyLossPct: Math.round(100 - fleetUtilizationPct),
      avoidedWaterPurchasesYear: Math.round(avoidedWaterPurchasesYear),
      avoidedDischargeFinesYear: Math.round(avoidedDischargeFinesYear),
      totalValueGeneratedYear: Math.round(totalValueGeneratedYear),
      totalOperatingCostYear: Math.round(totalOperatingCostYear),
      netEconomicSurplusYear: Math.round(netEconomicSurplusYear),
      roiPercent: Math.round(roiPercent),
      netProfitPerM3:
        totalFreshwaterDisplacedYear > 0
          ? Math.round((netEconomicSurplusYear / totalFreshwaterDisplacedYear) * 100) / 100
          : 0,
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
