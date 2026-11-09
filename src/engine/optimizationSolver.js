// AquaSwap Mathematical Allocation Engine
// Solves quality-constrained, inter-plant water networks using MILP principles with multi-contaminant mass balance blending

import { TREATMENT_TECHNOLOGIES } from '../data/industrialProfiles.js';

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
 * Track precise factory pinpoint location details including GPS coordinates,
 * industrial district zone, and dedicated intake/discharge bays.
 */
export function getFactoryPinpoint(facility, cluster, type = 'origin') {
  const isDhaka = !cluster?.id || cluster.id.includes('gazipur');
  const lat = facility.coords?.lat || (isDhaka ? 23.965 : 29.72);
  const lng = facility.coords?.lng || (isDhaka ? 90.410 : -95.20);
  
  // Format standard decimal degree representation
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;

  // Zone naming based on sector and facility
  let zone = 'Industrial Corridor';
  let gate = type === 'origin' ? 'Outbound Gate 1 (Discharge Bay)' : 'Inbound Gate 2 (Receiving Bay)';

  if (isDhaka) {
    if (facility.name.includes('Konabari')) {
      zone = 'Konabari Garment & Dyeing Export Zone';
      gate = type === 'origin' ? 'Gate A: Effluent Treatment Outfall Bay' : 'Gate 3: Process Water Reservoir Intake';
    } else if (facility.name.includes('Apex')) {
      zone = 'Apex Industrial Cluster (Shafipur)';
      gate = type === 'origin' ? 'Gate B: Clarified Water Pump Station' : 'Gate 1: Pre-Wash Buffer Intake';
    } else if (facility.name.includes('Crown')) {
      zone = 'Crown Industrial Concrete Depot (N3 North)';
      gate = type === 'origin' ? 'Outbound Terminal Bay 4' : 'Intake Bay #1: ASTM C1602 Batching Silo';
    } else if (facility.name.includes('Seven Rings')) {
      zone = 'Seven Rings Precast Complex (Joydebpur)';
      gate = type === 'origin' ? 'Discharge Manifold Gate 2' : 'Intake Bay #2: Aggregate Wetting Bay';
    } else if (facility.name.includes('Summit')) {
      zone = 'Summit Power Generation Grid (Kodda)';
      gate = type === 'origin' ? 'Effluent Valve Station 3' : 'Cooling Tower Loop Water Intake A';
    } else if (facility.name.includes('Meghna')) {
      zone = 'Meghna Heavy Logistics Park (Tongi)';
      gate = type === 'origin' ? 'Rinse Outbound Platform' : 'Intake Gate 4: Fleet & Quarry Wash Buffer';
    } else {
      zone = 'Gazipur Industrial Corridor Sector 4';
    }
  } else if (cluster?.id?.includes('chattogram') || cluster?.id?.includes('karnaphuli')) {
    // Chattogram
    if (facility.name.includes('BSRM')) {
      zone = 'BSRM Steel Quenching Terminal (Nasirabad)';
      gate = type === 'origin' ? 'Cooling Water Outbound Bay #1' : 'Industrial Makeup Buffer Gate';
    } else if (facility.name.includes('Premier')) {
      zone = 'Premier Cement Ready-Mix Hub (Patenga)';
      gate = type === 'origin' ? 'Outbound Wash Station' : 'Batching Silo Inbound Port A';
    } else if (facility.name.includes('Western Marine')) {
      zone = 'Western Marine Yard (Karnaphuli Riverbank)';
      gate = type === 'origin' ? 'Hydro-Blast Drain Platform' : 'Water Storage Inbound Gate';
    } else {
      zone = 'Chattogram Industrial Corridor';
      gate = 'Main Facility Freight Gate';
    }
  } else {
    // Narayanganj
    if (facility.name.includes('Fakir')) {
      zone = 'Fakir Knitwears ETP Terminal (Fatullah)';
      gate = type === 'origin' ? 'Treated Effluent Valve Manifold' : 'Inbound Water Reservoir';
    } else if (facility.name.includes('Shah Cement')) {
      zone = 'Shah Cement Industrial Port (Mukterpur)';
      gate = type === 'origin' ? 'Port Buffer Tank' : 'ASTM Batching Inflow Gate 1';
    } else {
      zone = 'Narayanganj-Shitalakshya Industrial Zone';
      gate = 'Main Factory Entrance Gate';
    }
  }

  return {
    id: facility.id,
    name: facility.name,
    sector: facility.sector,
    lat,
    lng,
    latStr,
    lngStr,
    coords: facility.coords,
    zone,
    gate
  };
}

/**
 * Identify the optimal transit corridor connecting two pinpointed factory locations
 */
export function getCorridorInfo(originPinpoint, destPinpoint, distanceKm, cluster) {
  const isDhaka = !cluster?.id || cluster.id.includes('gazipur');
  let corridorName = '';
  let roadType = '';
  let roadQuality = '';
  let avgTrafficSpeedKmH = 38;

  if (isDhaka) {
    if (distanceKm <= 3.0) {
      corridorName = 'Konabari-Joydebpur Industrial Link Road';
      roadType = 'Dedicated Dual-Carriageway Industrial Avenue';
      roadQuality = 'Heavy-grade asphalt, wide turning radius for bowsers';
      avgTrafficSpeedKmH = 32;
    } else if (distanceKm <= 7.0) {
      corridorName = 'Dhaka-Mymensingh Arterial Highway (N3 Corridor)';
      roadType = 'National 6-Lane Expressway & Flyover';
      roadQuality = 'Heavy commercial clearance, no low-bridge obstacles';
      avgTrafficSpeedKmH = 42;
    } else {
      corridorName = 'Gazipur Outer Ring Expressway (N105 Bypass)';
      roadType = 'Controlled-Access Freight Expressway';
      roadQuality = 'Grade-separated bypass, rapid heavy tanker route';
      avgTrafficSpeedKmH = 48;
    }
  } else if (cluster?.id?.includes('chattogram') || cluster?.id?.includes('karnaphuli')) {
    // Chattogram
    if (distanceKm <= 4.0) {
      corridorName = 'Port Access Highway (PC Road Corridor)';
      roadType = 'Heavy Port Logistics Expressway';
      roadQuality = 'Reinforced heavy-axle pavement with 24/7 port transport clearance';
      avgTrafficSpeedKmH = 40;
    } else {
      corridorName = 'Dhaka-Chittagong Highway (N1 Coastal Section)';
      roadType = 'National 6-Lane Commercial Highway';
      roadQuality = 'High-capacity heavy tanker route connecting Nasirabad to Patenga';
      avgTrafficSpeedKmH = 46;
    }
  } else {
    // Narayanganj
    if (distanceKm <= 3.5) {
      corridorName = 'Kanchpur-Adamjee EPZ Industrial Link Road';
      roadType = '4-Lane Industrial Freight Corridor';
      roadQuality = 'Smooth industrial asphalt with fast gate access';
      avgTrafficSpeedKmH = 36;
    } else {
      corridorName = 'Dhaka-Narayanganj Link Road (R111 Corridor)';
      roadType = 'Divided Regional Freight Arterial';
      roadQuality = 'High-capacity corridor connecting Mukterpur to Fatullah';
      avgTrafficSpeedKmH = 44;
    }
  }

  return {
    name: corridorName,
    roadType,
    roadQuality,
    avgTrafficSpeedKmH
  };
}

/**
 * Intelligently searches and evaluates the easiest vehicle or transport way to send water
 * between pinpointed factory coordinates (HDPE Pipeline vs 28m³ Heavy Tanker vs 14m³ Bowser vs 8m³ Shuttle).
 */
export function evaluateOptimalTransportWay(distanceKm, volumeM3, supplier, buyer, cluster) {
  const originPinpoint = getFactoryPinpoint(supplier, cluster, 'origin');
  const destPinpoint = getFactoryPinpoint(buyer, cluster, 'dest');
  const corridor = getCorridorInfo(originPinpoint, destPinpoint, distanceKm, cluster);

  // 1. Dedicated Overland HDPE Pipeline
  const pipelineViable = distanceKm <= 2.8 && volumeM3 >= 200;
  let pipelineScore = 0;
  let pipelineReason = '';
  if (pipelineViable) {
    pipelineScore = 98; // Highest ease: 24/7 automated continuous pumping, zero road traffic
    pipelineReason = `Ultra-short distance (${distanceKm} km) and high continuous demand (${volumeM3} m³/day) make a Dedicated Overland HDPE Pipeline the easiest and cleanest way. Continuous automated electric pumping eliminates road traffic delays, driver scheduling, and gate queues completely.`;
  } else if (distanceKm <= 3.5) {
    pipelineScore = 65;
    pipelineReason = `Pipeline is technically feasible but requires municipal right-of-way easement crossing arterial intersections; initial capital setup needed.`;
  } else {
    pipelineScore = 40;
    pipelineReason = `Long haul (${distanceKm} km) across multiple highway crossings makes pipeline installation impractical; road tankers are vastly superior.`;
  }

  // 2. 28 m³ Heavy Vacuum Tanker (Tri-Axle Semi-Trailer)
  const heavyTrips = Math.ceil(volumeM3 / 28);
  const heavyTransitMins = Math.round((distanceKm / corridor.avgTrafficSpeedKmH) * 60) + 12;
  let heavyScore = 0;
  let heavyReason = '';
  if (distanceKm >= 3.5 && volumeM3 >= 120) {
    heavyScore = 95;
    heavyReason = `With a ${distanceKm} km transit along the ${corridor.name}, the 28 m³ Heavy Vacuum Tanker is the easiest way. It cuts daily round-trips to just ${heavyTrips} dispatches (reducing road congestion by 50% vs smaller bowsers), utilizing rapid 18-minute pneumatic suction couplings for seamless turnaround.`;
  } else if (volumeM3 >= 150) {
    heavyScore = 91;
    heavyReason = `High daily volume (${volumeM3} m³) is handled effortlessly with just ${heavyTrips} heavy tanker trips, minimizing gate check-in congestion.`;
  } else {
    heavyScore = 78;
    heavyReason = `28 m³ semi-trailer requires wide factory gate clearance; viable but slightly oversized for smaller batches.`;
  }

  // 3. 14 m³ Compact Industrial Bowser (Rigid Dual-Axle)
  const compactTrips = Math.ceil(volumeM3 / 14);
  const compactTransitMins = Math.round((distanceKm / (corridor.avgTrafficSpeedKmH * 0.9)) * 60) + 8;
  let compactScore = 0;
  let compactReason = '';
  if (distanceKm < 3.5 && volumeM3 < 200) {
    compactScore = 93;
    compactReason = `For a ${distanceKm} km short transfer with ${volumeM3} m³/day, the 14 m³ Compact Industrial Bowser is the easiest way. Its tight turning radius easily accesses narrow factory gates and manufacturing alleyways without blocking facility loading docks, completing turnaround in 12 minutes.`;
  } else if (volumeM3 < 120) {
    compactScore = 92;
    compactReason = `Moderate volume (${volumeM3} m³/day) matches the 14 m³ bowser perfectly with ${compactTrips} manageable trips per day and swift gate offloading.`;
  } else {
    compactScore = 80;
    compactReason = `Requires ${compactTrips} trips/day to fulfill ${volumeM3} m³ demand; heavier tankers reduce trips more efficiently.`;
  }

  // 4. 8 m³ Agile Rapid Shuttle Tanker
  const shuttleTrips = Math.ceil(volumeM3 / 8);
  const shuttleTransitMins = Math.round((distanceKm / (corridor.avgTrafficSpeedKmH * 1.1)) * 60) + 5;
  let shuttleScore = 0;
  let shuttleReason = '';
  if (volumeM3 <= 50) {
    shuttleScore = 89;
    shuttleReason = `Small agile volume (${volumeM3} m³/day) is easiest dispatched via 8 m³ Agile Rapid Shuttle. No commercial road curfew restrictions, immediate on-demand dispatch, and swift 8-minute turnaround.`;
  } else {
    shuttleScore = Math.max(50, 85 - Math.round(volumeM3 / 15));
    shuttleReason = `Would require ${shuttleTrips} trips per day, causing heavy gate queuing. Reserved for small top-ups.`;
  }

  // Compile all evaluated transport options
  const allOptions = [
    {
      mode: 'pipeline',
      name: 'Dedicated Overland HDPE Pipeline',
      shortName: 'Overland Pipeline',
      icon: 'pipeline',
      category: 'Permanent Infrastructure',
      capacityM3: 'Continuous Pumping',
      dailyTrips: 0,
      dailyTripsLabel: 'Continuous Flow (0 Trucks)',
      transitMins: 0,
      turnaroundMins: 0,
      easeScore: pipelineScore,
      viable: pipelineViable,
      reason: pipelineReason
    },
    {
      mode: 'heavy_tanker',
      name: '28 m³ Heavy Vacuum Tanker (Tri-Axle)',
      shortName: '28 m³ Heavy Tanker',
      icon: 'heavy_tanker',
      category: 'Heavy Bulk Semi-Trailer',
      capacityM3: 28,
      dailyTrips: heavyTrips,
      dailyTripsLabel: `${heavyTrips} trips/day`,
      transitMins: heavyTransitMins,
      turnaroundMins: 18,
      easeScore: heavyScore,
      viable: true,
      reason: heavyReason
    },
    {
      mode: 'compact_bowser',
      name: '14 m³ Compact Industrial Bowser',
      shortName: '14 m³ Compact Bowser',
      icon: 'compact_bowser',
      category: 'Rigid Dual-Axle Tanker',
      capacityM3: 14,
      dailyTrips: compactTrips,
      dailyTripsLabel: `${compactTrips} trips/day`,
      transitMins: compactTransitMins,
      turnaroundMins: 12,
      easeScore: compactScore,
      viable: true,
      reason: compactReason
    },
    {
      mode: 'light_shuttle',
      name: '8 m³ Agile Rapid Shuttle Tanker',
      shortName: '8 m³ Rapid Shuttle',
      icon: 'light_shuttle',
      category: 'Light Urban Shuttle',
      capacityM3: 8,
      dailyTrips: shuttleTrips,
      dailyTripsLabel: `${shuttleTrips} trips/day`,
      transitMins: shuttleTransitMins,
      turnaroundMins: 8,
      easeScore: shuttleScore,
      viable: true,
      reason: shuttleReason
    }
  ];

  // Pick the optimal (easiest) transport mode
  const sortedOptions = [...allOptions].sort((a, b) => b.easeScore - a.easeScore);
  const bestOption = sortedOptions[0];

  return {
    recommendedMode: bestOption.mode,
    vehicleName: bestOption.name,
    vehicleShortName: bestOption.shortName,
    vehicleIcon: bestOption.icon,
    vehicleCategory: bestOption.category,
    capacityM3: bestOption.capacityM3,
    dailyTrips: bestOption.dailyTrips,
    dailyTripsLabel: bestOption.dailyTripsLabel,
    transitTimeMins: bestOption.transitMins,
    turnaroundMins: bestOption.turnaroundMins,
    easeScore: bestOption.easeScore,
    easeBadge: `Easiest Way: ${bestOption.shortName}`,
    rationale: bestOption.reason,
    originPinpoint,
    destPinpoint,
    corridor,
    allOptions
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
      let minCompliantFound = false;
      for (let lvl = 0; lvl <= maxTreatmentLevel; lvl++) {
        const tech = TREATMENT_TECHNOLOGIES[lvl];
        const treatedEffluent = applyTreatment(sup.effluent, tech);
        const singleComp = checkQualityCompliance(treatedEffluent, buy.toleranceM);

        // Economic unit costs: amortized over standard industrial 10-year asset life (365 * 10)
        const treatCostPerM3 = tech.opexPerM3 + tech.capexPerM3Day / (365 * 10);
        const totalUnitCost = transportCostPerM3 + treatCostPerM3;

        // Scarcity-weighted net benefit per m3
        // Displacing 1 m3 saves buyer municipal water cost and relieves stressed basin
        const scarcityScore = (buy.scarcityFactorS || cluster.watershedScarcityIndex || 0.7) * alpha;
        const economicBenefitPerM3 = municipalTariff + sewerFine * 0.5 - totalUnitCost * (beta + gamma);
        const netPriority = scarcityScore * 10 + economicBenefitPerM3 * 5 - (singleComp.isCompliant ? 0 : 8);

        const arcData = {
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
        };

        if (lvl === 0) {
          candidateArcs.push(arcData);
          if (singleComp.isCompliant) {
            minCompliantFound = true;
            break; // Direct bypass already meets specifications; no need for higher capex
          }
        } else if (singleComp.isCompliant && !minCompliantFound) {
          candidateArcs.push(arcData);
          minCompliantFound = true;
          break; // Stop at lowest sufficient treatment technology
        }
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

        // Intelligent Pinpoint Tracking and Optimal Vehicle / Way Selection
        const transportWay = evaluateOptimalTransportWay(
          arc.distanceKm,
          proposedVolume,
          arc.supplier,
          arc.buyer,
          cluster
        );

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
          tankerTrucksDaily: transportWay.dailyTrips || Math.ceil(proposedVolume / 25),
          transportWay,
          originPinpoint: transportWay.originPinpoint,
          destPinpoint: transportWay.destPinpoint,
          recommendedVehicle: transportWay.recommendedMode,
          vehicleName: transportWay.vehicleName,
          vehicleShortName: transportWay.vehicleShortName,
          vehicleIcon: transportWay.vehicleIcon,
          vehicleCategory: transportWay.vehicleCategory,
          easeScore: transportWay.easeScore,
          deliveryWayRationale: transportWay.rationale,
          corridorName: transportWay.corridor.name
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
      netEconomicSurplusYear: Math.max(0, Math.round(netEconomicSurplusYear)),
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
