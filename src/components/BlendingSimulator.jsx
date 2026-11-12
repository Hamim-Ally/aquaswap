import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Sliders,
  Building2,
  Truck,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Droplets,
  ExternalLink,
  Compass,
  ChevronRight
} from 'lucide-react';

// Diverse Industry Standards for Factory Quality Tolerances
const INDUSTRY_STANDARDS = {
  reinforced_concrete: {
    id: 'reinforced_concrete',
    name: 'ASTM C1602 Reinforced Concrete',
    badge: 'Structural Buildings & Bridges',
    limits: {
      TDS: 50000,
      CHLORIDES: 1000,
      SULFATES: 3000,
      COD: 500,
      pH_min: 6.0,
      pH_max: 9.0
    },
    description: 'Strict chloride threshold to protect steel reinforcing rebar from pitting corrosion.'
  },
  unreinforced_concrete: {
    id: 'unreinforced_concrete',
    name: 'ASTM C1602 Unreinforced Precast & Paving',
    badge: 'Interlocking Pavers & Curb Blocks',
    limits: {
      TDS: 50000,
      CHLORIDES: 4500,
      SULFATES: 3000,
      COD: 800,
      pH_min: 6.0,
      pH_max: 9.0
    },
    description: 'Higher chloride tolerance for mass concrete and paving elements without embedded rebar.'
  },
  cooling_tower: {
    id: 'cooling_tower',
    name: 'Industrial Cooling Tower Makeup (CTI)',
    badge: 'Thermal Power & Central HVAC',
    limits: {
      TDS: 1200,
      CHLORIDES: 350,
      SULFATES: 400,
      COD: 80,
      pH_min: 6.8,
      pH_max: 8.5
    },
    description: 'Low organic load and controlled salinity to prevent condenser scaling and bio-fouling.'
  },
  textile_rinse: {
    id: 'textile_rinse',
    name: 'Textile Dyeing & Wet Processing Rinse',
    badge: 'Apparel & Fabric Washing',
    limits: {
      TDS: 2000,
      CHLORIDES: 600,
      SULFATES: 500,
      COD: 250,
      pH_min: 6.5,
      pH_max: 8.0
    },
    description: 'Low hardness and controlled salts to preserve fabric color consistency and dye fixation.'
  },
  equipment_wash: {
    id: 'equipment_wash',
    name: 'Heavy Equipment & Quarry Washdown',
    badge: 'Mining & Fleet Washing',
    limits: {
      TDS: 8000,
      CHLORIDES: 2000,
      SULFATES: 1800,
      COD: 450,
      pH_min: 6.0,
      pH_max: 9.0
    },
    description: 'High tolerance utility water for chassis cleaning, dust suppression, and aggregate washing.'
  },
  custom: {
    id: 'custom',
    name: 'Custom Factory Specification',
    badge: 'Bespoke Plant Machinery',
    limits: {
      TDS: 12000,
      CHLORIDES: 1200,
      SULFATES: 1500,
      COD: 350,
      pH_min: 6.5,
      pH_max: 8.5
    },
    description: 'Configure bespoke water quality thresholds tailored to your specific plant machinery.'
  }
};

// Preset options for adding new custom parameters
const PRESET_CUSTOM_PARAMETERS = [
  {
    id: 'turbidity',
    name: 'Turbidity (NTU)',
    key: 'turbidity',
    unit: 'NTU',
    defaultLimit: 50,
    description: 'Water cloudiness / suspended colloidal clarity'
  },
  {
    id: 'tss',
    name: 'Total Suspended Solids (TSS)',
    key: 'tss',
    unit: 'mg/L',
    defaultLimit: 100,
    description: 'Particulate matter in suspension'
  },
  {
    id: 'hardness',
    name: 'Total Hardness (as CaCO3)',
    key: 'hardness',
    unit: 'mg/L',
    defaultLimit: 500,
    description: 'Calcium and magnesium scaling minerals'
  },
  {
    id: 'iron',
    name: 'Iron (Fe)',
    key: 'iron',
    unit: 'mg/L',
    defaultLimit: 3.0,
    description: 'Heavy metal causing staining and catalytic oxidation'
  },
  {
    id: 'silica',
    name: 'Silica (SiO2)',
    key: 'silica',
    unit: 'mg/L',
    defaultLimit: 120,
    description: 'Glass-forming mineral causing stubborn boiler scale'
  }
];

export default function BlendingSimulator({ cluster, optimizationResults, onOpenHowItWorks }) {
  const navigate = useNavigate();

  // Workflow Active View Mode: 'step1' | 'step2' | 'step3'
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('step1');

  // STEP 1: Target Factory / Buyer Selection
  const buyersList = cluster?.buyers || [];
  const suppliersList = cluster?.suppliers || [];
  const [selectedBuyerId, setSelectedBuyerId] = useState(buyersList[0]?.id || 'buy-1');

  // Currently evaluated target factory
  const targetBuyer = useMemo(() => {
    return buyersList.find((b) => b.id === selectedBuyerId) || buyersList[0] || {
      id: 'default-buyer',
      name: 'Crown Ready-Mix Concrete Plant #4',
      sector: 'Structural Concrete (ASTM C1602)',
      demandD: 550,
      toleranceM: { TDS: 45000, COD: 500, BOD: 100, CHLORIDES: 1000, SULFATES: 3000, pH_min: 6.0, pH_max: 9.0 },
      coords: { lat: 24.01, lng: 90.445 }
    };
  }, [buyersList, selectedBuyerId]);

  // Industry Standard Profile state
  const [selectedStandard, setSelectedStandard] = useState('reinforced_concrete');
  const [customThresholds, setCustomThresholds] = useState({
    TDS: 12000,
    CHLORIDES: 1200,
    SULFATES: 1500,
    COD: 350,
    pH_min: 6.5,
    pH_max: 8.5
  });

  // Dynamic Custom Water Parameters
  const [customParams, setCustomParams] = useState([
    {
      id: 'turbidity',
      name: 'Turbidity',
      key: 'turbidity',
      unit: 'NTU',
      limit: 50,
      description: 'Suspended colloidal clarity'
    },
    {
      id: 'tss',
      name: 'Total Suspended Solids (TSS)',
      key: 'tss',
      unit: 'mg/L',
      limit: 100,
      description: 'Solid particulate matter in suspension'
    }
  ]);

  // Modal / Form state for adding a new custom parameter
  const [isAddParamOpen, setIsAddParamOpen] = useState(false);
  const [newParamName, setNewParamName] = useState('');
  const [newParamUnit, setNewParamUnit] = useState('mg/L');
  const [newParamLimit, setNewParamLimit] = useState(150);

  // Registered facility alert check from localStorage
  const [recentRegisteredFacility, setRecentRegisteredFacility] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aquaswap_latest_facility');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecentRegisteredFacility(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Multi-stream ingredients state
  const [streams, setStreams] = useState([
    {
      id: 'stream-1',
      supplierId: 'sup-1',
      name: 'Apex Horizon Textile Mills',
      volume: 260,
      TDS: 2200,
      COD: 680,
      CHLORIDES: 420,
      SULFATES: 310,
      pH: 8.4,
      turbidity: 25,
      tss: 45,
      hardness: 240,
      iron: 0.8,
      silica: 35,
      color: '#0284c7',
      role: 'Primary Recycled Base'
    },
    {
      id: 'stream-2',
      supplierId: 'sup-4',
      name: 'Pran Agro Beverage & Dairy Wash',
      volume: 180,
      TDS: 520,
      COD: 920,
      CHLORIDES: 110,
      SULFATES: 85,
      pH: 6.6,
      turbidity: 15,
      tss: 30,
      hardness: 110,
      iron: 0.3,
      silica: 20,
      color: '#16a34a',
      role: 'Clean Dilution Stream'
    },
    {
      id: 'stream-3',
      supplierId: 'sup-3',
      name: 'Bengal Polytex RO Brine Reject Hub',
      volume: 40,
      TDS: 34000,
      COD: 80,
      CHLORIDES: 14500,
      SULFATES: 5200,
      pH: 7.6,
      turbidity: 10,
      tss: 20,
      hardness: 1100,
      iron: 0.7,
      silica: 130,
      color: '#dc2626',
      role: 'High-Saline Waste Stream'
    },
    {
      id: 'stream-4',
      supplierId: 'groundwater',
      name: 'Fresh Groundwater (Tap / Borehole Backup)',
      volume: 70,
      TDS: 280,
      COD: 10,
      CHLORIDES: 45,
      SULFATES: 30,
      pH: 7.1,
      turbidity: 2,
      tss: 5,
      hardness: 95,
      iron: 0.1,
      silica: 15,
      color: '#64748b',
      role: 'Pure Backup Water'
    }
  ]);

  // Load recently registered factory into streams
  const handleLoadRegisteredFactory = () => {
    if (!recentRegisteredFacility?.facility) return;
    const f = recentRegisteredFacility.facility;
    const eff = f.effluent || {
      TDS: f.toleranceM?.TDS ? Math.round(f.toleranceM.TDS * 0.7) : 2200,
      COD: f.toleranceM?.COD ? Math.round(f.toleranceM.COD * 0.7) : 400,
      CHLORIDES: f.toleranceM?.CHLORIDES ? Math.round(f.toleranceM.CHLORIDES * 0.7) : 450,
      SULFATES: f.toleranceM?.SULFATES ? Math.round(f.toleranceM.SULFATES * 0.7) : 320,
      pH: 7.5
    };

    const newStream = {
      id: `stream-reg-${Date.now()}`,
      supplierId: f.id,
      name: `${f.name} (Registered Factory)`,
      volume: Math.min(100, Math.round((f.capacityW || f.demandD || 300) * 0.4)),
      TDS: eff.TDS,
      COD: eff.COD,
      CHLORIDES: eff.CHLORIDES,
      SULFATES: eff.SULFATES,
      pH: eff.pH || 7.5,
      turbidity: 30,
      tss: 50,
      hardness: 250,
      iron: 0.9,
      silica: 40,
      color: '#d97706',
      role: 'User Registered Stream'
    };

    setStreams((prev) => [newStream, ...prev]);
    setRecentRegisteredFacility(null);
  };

  // Determine current active limit set from target buyer
  const activeLimits = useMemo(() => {
    if (targetBuyer?.toleranceM) {
      return {
        TDS: targetBuyer.toleranceM.TDS,
        CHLORIDES: targetBuyer.toleranceM.CHLORIDES,
        SULFATES: targetBuyer.toleranceM.SULFATES,
        COD: targetBuyer.toleranceM.COD,
        pH_min: targetBuyer.toleranceM.pH_min || 6.0,
        pH_max: targetBuyer.toleranceM.pH_max || 9.0
      };
    }
    return selectedStandard === 'custom'
      ? customThresholds
      : INDUSTRY_STANDARDS[selectedStandard].limits;
  }, [targetBuyer, selectedStandard, customThresholds]);

  // =========================================================================
  // STEP 2: SOURCING INTELLIGENCE & LOGISTICS EFFICIENCY ANALYSIS
  // =========================================================================
  const sourcingAnalysis = useMemo(() => {
    if (!targetBuyer) return [];

    const buyerLat = targetBuyer.coords?.lat || 24.01;
    const buyerLng = targetBuyer.coords?.lng || 90.445;
    const tariff = cluster?.municipalWaterTariff || 45.0;

    return suppliersList.map((sup) => {
      const supLat = sup.coords?.lat || 24.015;
      const supLng = sup.coords?.lng || 90.380;

      const dLat = (supLat - buyerLat) * 111;
      const dLng = (supLng - buyerLng) * 111 * Math.cos((buyerLat * Math.PI) / 180);
      const distKm = Number((Math.sqrt(dLat * dLat + dLng * dLng) * 1.28).toFixed(1));

      let transportMode = '14 m³ Compact Bowser';
      let costPerM3 = Number((distKm * 2.2).toFixed(1));

      if (distKm <= 1.5 && sup.capacityW >= 300) {
        transportMode = 'Dedicated HDPE Pipeline';
        costPerM3 = 1.5;
      } else if (distKm >= 3.5 || sup.capacityW >= 400) {
        transportMode = '28 m³ Heavy Tanker';
        costPerM3 = Number((distKm * 1.8).toFixed(1));
      }

      const eff = sup.effluent;
      const fails = [];
      if (eff.TDS > activeLimits.TDS) fails.push(`TDS (${eff.TDS} > ${activeLimits.TDS})`);
      if (eff.CHLORIDES > activeLimits.CHLORIDES) fails.push(`Chlorides (${eff.CHLORIDES} > ${activeLimits.CHLORIDES})`);
      if (eff.SULFATES > activeLimits.SULFATES) fails.push(`Sulfates (${eff.SULFATES} > ${activeLimits.SULFATES})`);
      if (eff.COD > activeLimits.COD) fails.push(`COD (${eff.COD} > ${activeLimits.COD})`);
      if (eff.pH < activeLimits.pH_min || eff.pH > activeLimits.pH_max) {
        fails.push(`pH (${eff.pH} outside ${activeLimits.pH_min}-${activeLimits.pH_max})`);
      }

      const isDirectCompatible = fails.length === 0;

      const dailyTradeVol = Math.min(sup.capacityW, targetBuyer.demandD);
      const savingsPerM3BDT = Math.max(12, tariff - costPerM3 - 15);
      const dailySavingsBDT = Math.round(dailyTradeVol * savingsPerM3BDT);

      const distanceScore = Math.max(0, 100 - distKm * 10);
      const chemScore = isDirectCompatible ? 100 : Math.max(30, 90 - fails.length * 20);
      const volumeCoverageScore = Math.min(100, Math.round((sup.capacityW / targetBuyer.demandD) * 100));
      const overallEfficiency = Math.round(chemScore * 0.45 + distanceScore * 0.35 + volumeCoverageScore * 0.2);

      return {
        supplier: sup,
        distKm,
        transportMode,
        costPerM3,
        isDirectCompatible,
        fails,
        dailyTradeVol,
        dailySavingsBDT,
        overallEfficiency,
        capacityShare: Math.round((sup.capacityW / targetBuyer.demandD) * 100)
      };
    }).sort((a, b) => b.overallEfficiency - a.overallEfficiency);
  }, [targetBuyer, suppliersList, activeLimits, cluster]);

  // =========================================================================
  // STEP 3: MULTI-FACTORY SOURCING COCKTAILS (2-3 Factory Pooling)
  // =========================================================================
  const multiFactoryCocktails = useMemo(() => {
    if (!targetBuyer || suppliersList.length < 2) return [];

    const demand = targetBuyer.demandD;

    const s1 = suppliersList[0];
    const s2 = suppliersList[3] || suppliersList[1];
    const s3 = suppliersList[2];

    const c1Vol1 = Math.round(demand * 0.55);
    const c1Vol2 = Math.round(demand * 0.35);
    const c1Vol3 = Math.round(demand * 0.10);

    const sortedByDist = [...sourcingAnalysis].sort((a, b) => a.distKm - b.distKm);
    const closest1 = sortedByDist[0]?.supplier || suppliersList[0];
    const closest2 = sortedByDist[1]?.supplier || suppliersList[1];
    const c2Vol1 = Math.round(demand * 0.65);
    const c2Vol2 = Math.round(demand * 0.35);

    const c3Vol1 = Math.round(demand * 0.50);
    const c3Vol2 = Math.round(demand * 0.40);
    const c3VolBackup = Math.round(demand * 0.10);

    return [
      {
        id: 'cocktail-triple-eco',
        title: '3-Factory Balanced Sourcing (100% Recycled)',
        badge: 'Zero Groundwater Tap',
        description: 'Combines 3 local factories to completely eliminate fresh groundwater use and balance salinity with rinse water.',
        sources: [
          { supplier: s1, volume: c1Vol1, share: 55, role: 'Base Recycled Stream' },
          { supplier: s2, volume: c1Vol2, share: 35, role: 'Low-Salinity Dilution' },
          { supplier: s3, volume: c1Vol3, share: 10, role: 'Saline Buffer' }
        ],
        groundwaterNeeded: 0,
        totalVolume: demand,
        dailySavingsBDT: Math.round(demand * (cluster?.municipalWaterTariff || 45) * 0.62),
        efficiencyScore: 96
      },
      {
        id: 'cocktail-dual-proximity',
        title: 'Dual-Source Proximity (Shortest Fleet Haul)',
        badge: 'Minimum Distance',
        description: 'Pumps and hauls from the 2 closest neighboring factories within 2.5 km to minimize transit time and traffic.',
        sources: [
          { supplier: closest1, volume: c2Vol1, share: 65, role: 'Anchor Supplier' },
          { supplier: closest2, volume: c2Vol2, share: 35, role: 'Adjacent Secondary' }
        ],
        groundwaterNeeded: 0,
        totalVolume: demand,
        dailySavingsBDT: Math.round(demand * (cluster?.municipalWaterTariff || 45) * 0.58),
        efficiencyScore: 92
      },
      {
        id: 'cocktail-max-margin',
        title: 'Cost-Optimized Dual-Source + Deep Well Backup',
        badge: 'Maximum Cost Cut',
        description: 'Takes 90% water from the 2 lowest-cost effluent sources and maintains 10% pure tap backup.',
        sources: [
          { supplier: s1, volume: c3Vol1, share: 50, role: 'Bulk Effluent' },
          { supplier: s2, volume: c3Vol2, share: 40, role: 'Organic Rinse' }
        ],
        groundwaterNeeded: c3VolBackup,
        totalVolume: demand,
        dailySavingsBDT: Math.round(demand * 0.9 * (cluster?.municipalWaterTariff || 45) * 0.65),
        efficiencyScore: 89
      }
    ];
  }, [targetBuyer, suppliersList, sourcingAnalysis]);

  // Load a Multi-Factory Cocktail into the Active Blending Simulator Streams
  const handleLoadCocktail = (cocktail) => {
    const newStreams = cocktail.sources.map((src, i) => {
      const colors = ['#0284c7', '#16a34a', '#dc2626', '#475569'];
      const eff = src.supplier.effluent;
      return {
        id: `stream-cocktail-${i}`,
        supplierId: src.supplier.id,
        name: src.supplier.name,
        volume: src.volume,
        TDS: eff.TDS,
        COD: eff.COD,
        CHLORIDES: eff.CHLORIDES,
        SULFATES: eff.SULFATES,
        pH: eff.pH,
        turbidity: 20 + i * 10,
        tss: 30 + i * 15,
        hardness: 200 + i * 50,
        iron: 0.5 + i * 0.2,
        silica: 30 + i * 15,
        color: colors[i % colors.length],
        role: src.role
      };
    });

    if (cocktail.groundwaterNeeded > 0) {
      newStreams.push({
        id: 'stream-groundwater-backup',
        supplierId: 'groundwater',
        name: 'Fresh Groundwater (Tap / Borehole Backup)',
        volume: cocktail.groundwaterNeeded,
        TDS: 280,
        COD: 10,
        CHLORIDES: 45,
        SULFATES: 30,
        pH: 7.1,
        turbidity: 2,
        tss: 5,
        hardness: 95,
        iron: 0.1,
        silica: 15,
        color: '#64748b',
        role: 'Pure Backup Water'
      });
    }

    setStreams(newStreams);
    setActiveWorkflowTab('step3');
  };

  // Mass Balance Blending Engine
  const totalVolume = streams.reduce((acc, s) => acc + s.volume, 0);

  const blended = useMemo(() => {
    const res = { TDS: 0, COD: 0, CHLORIDES: 0, SULFATES: 0, pH: 7.0 };

    ['TDS', 'COD', 'CHLORIDES', 'SULFATES'].forEach((param) => {
      const totalMass = streams.reduce((acc, s) => acc + s.volume * (s[param] || 0), 0);
      res[param] = totalVolume > 0 ? Math.round(totalMass / totalVolume) : 0;
    });

    if (totalVolume > 0) {
      const totalH = streams.reduce((acc, s) => acc + s.volume * Math.pow(10, -(s.pH || 7.0)), 0);
      res.pH = Number((-Math.log10(totalH / totalVolume)).toFixed(1));
    }

    customParams.forEach((cp) => {
      const totalMass = streams.reduce((acc, s) => acc + s.volume * (s[cp.key] || 0), 0);
      res[cp.key] = totalVolume > 0 ? Number((totalMass / totalVolume).toFixed(1)) : 0;
    });

    return res;
  }, [streams, totalVolume, customParams]);

  // Safety Evaluation
  const isTdsPass = blended.TDS <= activeLimits.TDS;
  const isChloridePass = blended.CHLORIDES <= activeLimits.CHLORIDES;
  const isSulfatePass = blended.SULFATES <= activeLimits.SULFATES;
  const isCodPass = blended.COD <= activeLimits.COD;
  const isPhPass = blended.pH >= (activeLimits.pH_min || 6.0) && blended.pH <= (activeLimits.pH_max || 9.0);

  const customParamEvaluations = customParams.map((cp) => {
    const val = blended[cp.key] || 0;
    const isPass = val <= cp.limit;
    return {
      ...cp,
      val,
      isPass
    };
  });

  const isAllCustomPass = customParamEvaluations.every((e) => e.isPass);
  const isAllPass = isTdsPass && isChloridePass && isSulfatePass && isCodPass && isPhPass && isAllCustomPass;

  const targetDemand = targetBuyer.demandD || 550;
  const volumeCoveragePct = Math.min(150, Math.round((totalVolume / targetDemand) * 100));
  const isVolumeSatisfied = totalVolume >= targetDemand;

  const settingTimeHours = Number(
    Math.max(1.2, Math.min(10.5, 3.5 + (blended.COD / 500) * 1.5 - (blended.CHLORIDES / 5000) * 0.8)).toFixed(1)
  );
  const compressiveStrengthPct = Number(
    Math.max(85, Math.min(104, 100 - (blended.COD / 400) * 2.5 - (blended.SULFATES / 3000) * 2.0)).toFixed(1)
  );

  const recycledVolume = streams
    .filter((s) => s.name.indexOf('Fresh Groundwater') === -1)
    .reduce((acc, s) => acc + s.volume, 0);
  const recycledPct = totalVolume > 0 ? Math.round((recycledVolume / totalVolume) * 100) : 0;

  const updateVolume = (idx, val) => {
    const updated = [...streams];
    updated[idx].volume = parseInt(val, 10) || 0;
    setStreams(updated);
  };

  const handleAddCustomParam = (e) => {
    e.preventDefault();
    if (!newParamName.trim()) return;

    const key = newParamName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newP = {
      id: `param-${Date.now()}`,
      name: newParamName.trim(),
      key,
      unit: newParamUnit.trim() || 'mg/L',
      limit: parseFloat(newParamLimit) || 100,
      description: 'Factory-specific process parameter'
    };

    setCustomParams((prev) => [...prev, newP]);

    setStreams((prev) =>
      prev.map((s) => ({
        ...s,
        [key]: s[key] !== undefined ? s[key] : Math.round(newP.limit * 0.6)
      }))
    );

    setNewParamName('');
    setIsAddParamOpen(false);
  };

  const handleSelectPresetParam = (preset) => {
    setNewParamName(preset.name);
    setNewParamUnit(preset.unit);
    setNewParamLimit(preset.defaultLimit);
  };

  const handleRemoveCustomParam = (id) => {
    setCustomParams((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. TOP HEADER & WORKFLOW TABS (All in ONE Single Row) */}
      <div
        className="mobile-stack"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '16px'
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-head, #0f172a)', margin: 0 }}>
              Water Sourcing & Multi-Factory Blender Lab
            </h1>
            <span className="status-pill status-cyan" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
              Engineering Simulator
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '3px 0 0 0' }}>
            Analyze plant water requirements, evaluate local supplier efficiency, and simulate multi-source factory blends.
          </p>
        </div>

        {/* Workflow Phase Tabs - Strictly in ONE Row */}
        <div
          className="mobile-scroll-row"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <button
            type="button"
            className={`tab-pill ${activeWorkflowTab === 'step1' ? 'active' : ''}`}
            onClick={() => setActiveWorkflowTab('step1')}
            style={{ height: '32px', fontSize: '0.78rem', padding: '0 12px', borderRadius: '6px', boxSizing: 'border-box' }}
          >
            1. Demand Analysis
          </button>
          <button
            type="button"
            className={`tab-pill ${activeWorkflowTab === 'step2' ? 'active' : ''}`}
            onClick={() => setActiveWorkflowTab('step2')}
            style={{ height: '32px', fontSize: '0.78rem', padding: '0 12px', borderRadius: '6px', boxSizing: 'border-box' }}
          >
            2. Sourcing Efficiency
          </button>
          <button
            type="button"
            className={`tab-pill ${activeWorkflowTab === 'step3' ? 'active' : ''}`}
            onClick={() => setActiveWorkflowTab('step3')}
            style={{ height: '32px', fontSize: '0.78rem', padding: '0 12px', borderRadius: '6px', boxSizing: 'border-box' }}
          >
            3. Multi-Factory Blender
          </button>
        </div>
      </div>

      {/* Banner for Recently Registered Factory */}
      {recentRegisteredFacility?.facility && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '8px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="#0284c7" />
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                Registered Factory Ready to Source & Blend: {recentRegisteredFacility.facility.name}
              </strong>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                {recentRegisteredFacility.facility.sector} • Volume:{' '}
                {recentRegisteredFacility.facility.capacityW || recentRegisteredFacility.facility.demandD} m³/day
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleLoadRegisteredFactory}
          >
            <FlaskConical size={14} />
            <span>Load Stream in Blender Lab</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: FACTORY DEMAND & QUALITY SPECIFICATION ANALYSIS                   */}
      {/* ========================================================================= */}
      {activeWorkflowTab === 'step1' && (
        <div
          className="ui-card"
          style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} color="#0284c7" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Phase 1 • Quality & Demand Analysis
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Target Factory Water Needs & Tolerance Specification
                </h2>
              </div>
            </div>

            {/* Target Buyer Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Target Factory:</span>
              <select
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  width: 'auto'
                }}
              >
                {buyersList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.sector?.split(' ')[0]}) - {b.demandD} m³/day
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Factory Summary & Quality Analysis Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Required Daily Volume</div>
              <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                {targetBuyer.demandD} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>m³/day</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                {targetBuyer.sector}
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Max Chlorides Allowed</div>
              <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                {activeLimits.CHLORIDES} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>mg/L</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                Prevents rebar pitting corrosion
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Max Sulfates Allowed</div>
              <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                {activeLimits.SULFATES} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>mg/L</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                Prevents ettringite expansion
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Max TDS & Organics (COD)</div>
              <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {activeLimits.TDS.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>TDS</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                COD cap: {activeLimits.COD} mg/L | pH: {activeLimits.pH_min} - {activeLimits.pH_max}
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.82rem', color: '#0369a1', lineHeight: 1.5 }}>
              <strong>Tolerance Profile for {targetBuyer.name}:</strong>{' '}
              {targetBuyer.description || 'Requires high volumes of water with strictly capped chlorides and sulfates to ensure compliance with ASTM structural regulations and prevent machinery scale.'}
            </div>

            {activeWorkflowTab === 'step1' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveWorkflowTab('step2')}
              >
                <span>View Sourcing Efficiency</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SOURCING & LOGISTICS EFFICIENCY INTELLIGENCE                      */}
      {/* ========================================================================= */}
      {activeWorkflowTab === 'step2' && (
        <div
          className="ui-card"
          style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={18} color="#16a34a" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Phase 2 • Local Supplier Sourcing & Logistics
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Supplier Efficiency & Transport Ranking for {targetBuyer.name}
                </h2>
              </div>
            </div>

            <span className="status-pill status-neutral">
              {sourcingAnalysis.length} Potential Local Suppliers
            </span>
          </div>

          {/* Supplier Efficiency Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '12px' }}>
            {sourcingAnalysis.map((item, rankIdx) => (
              <div
                key={item.supplier.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: rankIdx === 0 ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative'
                }}
              >
                {rankIdx === 0 && (
                  <div style={{ position: 'absolute', top: '-9px', right: '12px' }}>
                    <span className="status-pill status-emerald" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                      Rank #1 Best Match
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                      {item.supplier.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {item.supplier.sector} • Output: {item.supplier.capacityW} m³/day
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: item.overallEfficiency >= 85 ? '#16a34a' : '#0284c7' }}>
                      {item.overallEfficiency}%
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Efficiency</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '8px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Distance</div>
                    <div className="mono" style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{item.distKm} km</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Vehicle Mode</div>
                    <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>{item.transportMode.split(' ')[0]}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Daily Savings</div>
                    <div className="mono" style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>৳ {item.dailySavingsBDT.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', color: item.isDirectCompatible ? '#16a34a' : '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.isDirectCompatible ? (
                    <>
                      <CheckCircle2 size={13} color="#16a34a" />
                      <span>Directly compatible. Meets chemical limits.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} color="#d97706" />
                      <span>High salinity/COD. Optimal when blended with rinse water.</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveWorkflowTab('step1')}
            >
              &larr; Back to Step 1 (Demand)
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveWorkflowTab('step3')}
            >
              <span>Proceed to Multi-Factory Sourcing</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: MULTI-FACTORY POOLING & INTERACTIVE BLEND SIMULATOR               */}
      {/* ========================================================================= */}
      {activeWorkflowTab === 'step3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveWorkflowTab('step2')}
            >
              &larr; Back to Step 2 (Sourcing Efficiency)
            </button>
          </div>
          
          {/* Multi-Factory Cocktails Recommendation Box */}
          <div
            className="ui-card"
            style={{
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderTop: '3px solid #0284c7'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} color="#0284c7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Multi-Factory Sourcing Bundles (2-3 Factory Pooling)
                  </div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Sourcing Combinations for {targetBuyer.name} ({targetBuyer.demandD} m³/day)
                  </h2>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Pooling water from 2 to 3 factories ensures volume security and balances chemical salinity.
              </div>
            </div>

            {/* Cocktails Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '12px' }}>
              {multiFactoryCocktails.map((cocktail) => (
                <div
                  key={cocktail.id}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="status-pill status-cyan" style={{ fontSize: '0.68rem' }}>
                        {cocktail.badge}
                      </span>
                      <span className="mono" style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>
                        {cocktail.efficiencyScore}% Efficiency
                      </span>
                    </div>

                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                      {cocktail.title}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                      {cocktail.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                      {cocktail.sources.map((src, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '5px 8px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            fontSize: '0.74rem'
                          }}
                        >
                          <span style={{ color: '#0f172a' }}>
                            {src.supplier.name.split(' ')[0]} ({src.share}%)
                          </span>
                          <span className="mono" style={{ color: '#0284c7', fontWeight: 600 }}>
                            {src.volume} m³/day
                          </span>
                        </div>
                      ))}

                      {cocktail.groundwaterNeeded > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '5px 8px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            fontSize: '0.74rem'
                          }}
                        >
                          <span style={{ color: '#64748b' }}>Municipal Tap Backup</span>
                          <span className="mono" style={{ color: '#64748b', fontWeight: 600 }}>
                            {cocktail.groundwaterNeeded} m³/day
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Daily Savings</div>
                      <div className="mono" style={{ fontSize: '0.88rem', color: '#16a34a', fontWeight: 700 }}>
                        ৳ {cocktail.dailySavingsBDT.toLocaleString()}/day
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleLoadCocktail(cocktail)}
                      style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                    >
                      <Sliders size={12} />
                      <span>Load into Simulator</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Multi-Stream Sliders (Left) & Safety Scorecard (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
            
            {/* Left: Stream Sliders */}
            <div className="ui-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FlaskConical size={16} color="#0284c7" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    Sourced Streams ({streams.length} Factory Sources)
                  </h3>
                </div>

                <div className={`status-pill ${isVolumeSatisfied ? 'status-emerald' : 'status-amber'}`}>
                  {totalVolume} / {targetDemand} m³/day ({volumeCoveragePct}%)
                </div>
              </div>

              {/* Sliders list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {streams.map((stream, idx) => (
                  <div
                    key={stream.id}
                    style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stream.color }} />
                          <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>{stream.name}</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                          {stream.role} • TDS: {stream.TDS.toLocaleString()} mg/L | Cl: {stream.CHLORIDES} mg/L
                        </div>
                      </div>

                      <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#0284c7' }}>
                        {stream.volume} <span style={{ fontSize: '0.72rem', color: '#64748b' }}>m³/day</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="350"
                      step="5"
                      value={stream.volume}
                      onChange={(e) => updateVolume(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Blended Result & Safety Scorecard */}
            <div className="ui-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Blended Recipe Safety Scorecard
                </h3>
                <span className={`status-pill ${isAllPass && isVolumeSatisfied ? 'status-emerald' : 'status-rose'}`}>
                  {isAllPass && isVolumeSatisfied ? 'Fully Compliant & Volume Met' : 'Check Quality / Volume'}
                </span>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  background: isAllPass ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${isAllPass ? '#bbf7d0' : '#fecaca'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {isAllPass ? (
                  <CheckCircle2 size={20} color="#16a34a" />
                ) : (
                  <AlertCircle size={20} color="#dc2626" />
                )}
                <div>
                  <strong style={{ fontSize: '0.88rem', color: isAllPass ? '#15803d' : '#b91c1c' }}>
                    {isAllPass
                      ? `All Safety Checks Passed for ${targetBuyer.name}`
                      : `Recipe Exceeds Permissible Limits`}
                  </strong>
                  <p style={{ fontSize: '0.76rem', color: '#475569', marginTop: '1px' }}>
                    {isAllPass
                      ? `Replaces ${recycledPct}% of fresh groundwater without risking structural strength or scaling.`
                      : 'Adjust the multi-factory volume sliders to dilute exceeding parameters.'}
                  </p>
                </div>
              </div>

              {/* Volume & Physical Performance Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Volume Fulfillment</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: isVolumeSatisfied ? '#16a34a' : '#d97706', marginTop: '2px' }}>
                    {totalVolume} / {targetDemand} m³
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
                    {isVolumeSatisfied ? '100% Demand satisfied' : `Deficit: ${targetDemand - totalVolume} m³/day`}
                  </div>
                </div>

                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>28-Day Strength Rating</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: compressiveStrengthPct >= 95 ? '#16a34a' : '#d97706', marginTop: '2px' }}>
                    {compressiveStrengthPct}%
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
                    Setting time: {settingTimeHours} hrs
                  </div>
                </div>
              </div>

              {/* Chemical Checks Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                    Chemical Checks:
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Blended vs Cap</span>
                </div>

                {/* Chlorides */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>Chlorides (Cl-)</strong>
                    <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Max limit: {activeLimits.CHLORIDES} mg/L</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '0.82rem', color: isChloridePass ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {blended.CHLORIDES} mg/L
                    </span>
                    {isChloridePass ? <CheckCircle2 size={13} color="#16a34a" /> : <AlertCircle size={13} color="#dc2626" />}
                  </div>
                </div>

                {/* Sulfates */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>Sulfates (SO4 2-)</strong>
                    <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Max limit: {activeLimits.SULFATES} mg/L</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '0.82rem', color: isSulfatePass ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {blended.SULFATES} mg/L
                    </span>
                    {isSulfatePass ? <CheckCircle2 size={13} color="#16a34a" /> : <AlertCircle size={13} color="#dc2626" />}
                  </div>
                </div>

                {/* TDS */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>TDS (Total Salinity)</strong>
                    <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Max limit: {activeLimits.TDS} mg/L</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '0.82rem', color: isTdsPass ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {blended.TDS} mg/L
                    </span>
                    {isTdsPass ? <CheckCircle2 size={13} color="#16a34a" /> : <AlertCircle size={13} color="#dc2626" />}
                  </div>
                </div>

                {/* COD */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>COD (Organics)</strong>
                    <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Max limit: {activeLimits.COD} mg/L</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '0.82rem', color: isCodPass ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {blended.COD} mg/L
                    </span>
                    {isCodPass ? <CheckCircle2 size={13} color="#16a34a" /> : <AlertCircle size={13} color="#dc2626" />}
                  </div>
                </div>
              </div>

              {/* Dynamic Custom Parameters */}
              <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                    Custom Parameters ({customParams.length})
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsAddParamOpen(!isAddParamOpen)}
                    style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                  >
                    <Plus size={12} />
                    <span>Add Parameter</span>
                  </button>
                </div>

                {isAddParamOpen && (
                  <form
                    onSubmit={handleAddCustomParam}
                    style={{
                      padding: '10px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      marginBottom: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {PRESET_CUSTOM_PARAMETERS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className="tab-pill"
                          onClick={() => handleSelectPresetParam(preset)}
                          style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Parameter Name"
                        value={newParamName}
                        onChange={(e) => setNewParamName(e.target.value)}
                        style={{ padding: '4px 6px', fontSize: '0.76rem' }}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={newParamUnit}
                        onChange={(e) => setNewParamUnit(e.target.value)}
                        style={{ padding: '4px 6px', fontSize: '0.76rem' }}
                      />
                      <input
                        type="number"
                        placeholder="Limit"
                        value={newParamLimit}
                        onChange={(e) => setNewParamLimit(e.target.value)}
                        style={{ padding: '4px 6px', fontSize: '0.76rem' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddParamOpen(false)} style={{ fontSize: '0.7rem' }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '0.7rem' }}>
                        Save
                      </button>
                    </div>
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {customParamEvaluations.map((cp) => (
                    <div
                      key={cp.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        background: '#f8fafc',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.76rem'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#0f172a' }}>{cp.name}</strong>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', marginLeft: '6px' }}>Max: {cp.limit} {cp.unit}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="mono" style={{ color: cp.isPass ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                          {cp.val} {cp.unit}
                        </span>
                        {cp.isPass ? <CheckCircle2 size={13} color="#16a34a" /> : <AlertCircle size={13} color="#dc2626" />}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomParam(cp.id)}
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Action Button: Apply Multi-Factory Blend to Exchange Network */}
          <div
            className="ui-card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#ffffff'
            }}
          >
            <div>
              <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>
                Multi-Factory Sourcing Plan Configured:
              </strong>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
                Sourcing {totalVolume} m³/day across {streams.length} factories with full chemical compliance for {targetBuyer.name}.
              </div>
            </div>

            <Link
              to="/optimizer"
              className="btn btn-primary"
            >
              <Truck size={15} />
              <span>Deploy Sourcing Plan to Exchange Network</span>
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
