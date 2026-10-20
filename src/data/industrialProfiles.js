// Industrial Profiles and Case Study Clusters for AquaSwap
// Calibrated from published industrial wastewater literature, ASTM C1602 standards, and ECR 2023 guidelines.

export const CONTAMINANTS = {
  TDS: { name: 'Total Dissolved Solids', unit: 'mg/L', defaultThreshold: 2000, description: 'Dissolved minerals, salts, and metals' },
  COD: { name: 'Chemical Oxygen Demand', unit: 'mg/L', defaultThreshold: 250, description: 'Total organic content susceptible to oxidation' },
  BOD: { name: 'Biochemical Oxygen Demand', unit: 'mg/L', defaultThreshold: 50, description: 'Biodegradable organic matter' },
  CHLORIDES: { name: 'Chlorides (Cl-)', unit: 'mg/L', defaultThreshold: 500, description: 'Corrosive halides critical for structural reinforcement' },
  SULFATES: { name: 'Sulfates (SO4 2-)', unit: 'mg/L', defaultThreshold: 1000, description: 'Causes internal expansion & cracking in concrete' },
  pH: { name: 'Acidity / Alkalinity', unit: 'pH', min: 6.0, max: 9.0, description: 'Hydrogen ion concentration' }
};

// Sector-dependent water parameters. A param only matters (and is only checked)
// when both the effluent stream and the buyer tolerance define it — so factories
// can register with just the parameters relevant to their industry.
export const EXTENDED_CONTAMINANTS = {
  HARDNESS: { name: 'Hardness (CaCO₃)', unit: 'mg/L', description: 'Scale buildup in boilers, cooling loops & fabric spotting', defaultThreshold: 400 },
  SILICA: { name: 'Silica', unit: 'mg/L', description: 'Hard silicate scale on heat-exchange surfaces', defaultThreshold: 120 },
  IRON: { name: 'Iron & Manganese', unit: 'mg/L', description: 'Rust staining of fabric and color defects in finished goods', defaultThreshold: 0.5 },
  COLOR: { name: 'Color / Dye Residues', unit: 'Pt-Co', description: 'Visible tint transfer into fabrics, concrete & product washes', defaultThreshold: 60 },
  OIL: { name: 'Oil & Grease', unit: 'mg/L', description: 'Slick film that blunts cement bonding & foules membranes', defaultThreshold: 10 }
};

export const BASE_PARAMS = ['TDS', 'COD', 'BOD', 'CHLORIDES', 'SULFATES'];
export const ALL_WATER_PARAMS = [...BASE_PARAMS, ...Object.keys(EXTENDED_CONTAMINANTS)];

// End-use quality targets for the Water Blender Lab — different industries
// demand different parameter enforceability.
export const END_USE_LIMITS = {
  concrete_reinforced: {
    id: 'concrete_reinforced',
    label: '🏢 Reinforced Concrete (ASTM C1602)',
    outcomeType: 'concrete',
    note: 'Steel rebar structures — highest corrosion protection in the standard.',
    limits: { TDS: 50000, COD: 500, BOD: 100, CHLORIDES: 1000, SULFATES: 3000, HARDNESS: 5000, SILICA: 150, IRON: 5, COLOR: 400, OIL: 10, pH_min: 6.0, pH_max: 9.0 }
  },
  concrete_unreinforced: {
    id: 'concrete_unreinforced',
    label: '🛣️ Pavement & Mass Concrete (ASTM C1602)',
    outcomeType: 'concrete',
    note: 'Road blocks & mass pours without embedded steel — relaxed chemistry.',
    limits: { TDS: 50000, COD: 800, BOD: 150, CHLORIDES: 4500, SULFATES: 3000, HARDNESS: 8000, SILICA: 200, IRON: 8, COLOR: 600, OIL: 15, pH_min: 6.0, pH_max: 9.0 }
  },
  cooling: {
    id: 'cooling',
    label: '❄️ Cooling Tower Makeup',
    outcomeType: 'cooling',
    note: 'Evaporative loops — scaling governs uptime more than corrosion.',
    limits: { TDS: 1200, COD: 80, BOD: 20, CHLORIDES: 350, SULFATES: 400, HARDNESS: 400, SILICA: 120, IRON: 0.3, COLOR: 50, OIL: 2, pH_min: 6.5, pH_max: 8.5 }
  },
  textile: {
    id: 'textile',
    label: '👕 Textile Process Water',
    outcomeType: 'textile',
    note: 'Dyeing & finishing quality — color, iron and hardness stain fabric.',
    limits: { TDS: 2000, COD: 200, BOD: 50, CHLORIDES: 300, SULFATES: 300, HARDNESS: 150, SILICA: 60, IRON: 0.5, COLOR: 30, OIL: 3, pH_min: 6.5, pH_max: 8.5 }
  }
};

export const TREATMENT_TECHNOLOGIES = [
  {
    id: 0,
    name: 'Direct Bypass (No Treatment)',
    shortName: 'Direct Bypass',
    description: 'Raw effluent transferred directly via dedicated tanker or pipeline.',
    capexPerM3Day: 0,
    opexPerM3: 0.05, // pumping/handling only
    energyKWh: 0.1,
    removals: { TDS: 0.0, COD: 0.0, BOD: 0.0, CHLORIDES: 0.0, SULFATES: 0.0, HARDNESS: 0.0, SILICA: 0.0, IRON: 0.0, COLOR: 0.0, OIL: 0.0, pH_shift: 0 }
  },
  {
    id: 1,
    name: 'Primary Clarification & Dual-Media Sand Filtration',
    shortName: 'Filtration Skid',
    description: 'Removes suspended solids, large colloids, and particulate organics.',
    capexPerM3Day: 350,
    opexPerM3: 0.35,
    energyKWh: 0.4,
    removals: { TDS: 0.08, COD: 0.25, BOD: 0.30, CHLORIDES: 0.05, SULFATES: 0.05, HARDNESS: 0.05, SILICA: 0.10, IRON: 0.60, COLOR: 0.20, OIL: 0.55, pH_shift: 0 }
  },
  {
    id: 2,
    name: 'Membrane Bioreactor (MBR) Skid',
    shortName: 'Modular MBR',
    description: 'Ultrafiltration with biological degradation operating at 10,000 mg/L MLSS density.',
    capexPerM3Day: 1800,
    opexPerM3: 1.15,
    energyKWh: 1.1,
    removals: { TDS: 0.15, COD: 0.88, BOD: 0.95, CHLORIDES: 0.08, SULFATES: 0.10, HARDNESS: 0.10, SILICA: 0.30, IRON: 0.85, COLOR: 0.85, OIL: 0.90, pH_shift: 0 }
  },
  {
    id: 3,
    name: 'Reverse Osmosis (RO) High-Pressure Skid',
    shortName: 'Brackish RO Skid',
    description: 'Polyamide thin-film composite membranes stripping monovalent ions and salts.',
    capexPerM3Day: 3200,
    opexPerM3: 2.10,
    energyKWh: 2.3,
    removals: { TDS: 0.96, COD: 0.98, BOD: 0.99, CHLORIDES: 0.97, SULFATES: 0.98, HARDNESS: 0.95, SILICA: 0.90, IRON: 0.95, COLOR: 0.95, OIL: 0.95, pH_shift: 0 }
  }
];

// Certified Water Tanker / Bowser Fleet (truck capacity & real round-trip economics)
// A partially filled truck still burns the same fuel -> transportation efficiency loss on underfilled trips.
export const TANKER_FLEET = [
  {
    id: 'mini',
    name: 'Mini Bowser',
    capacityM3: 10,
    costPerKmUSD: 0.70,
    fixedCostPerTripUSD: 4.0,
    description: 'Nimble 10 m³ bowser for alley-scale deliveries.'
  },
  {
    id: 'standard',
    name: 'Standard Tanker',
    capacityM3: 25,
    costPerKmUSD: 1.50,
    fixedCostPerTripUSD: 5.0,
    description: 'Workhorse 25 m³ tanker with 2-compartment load cells.'
  },
  {
    id: 'large',
    name: 'Heavy Water Truck',
    capacityM3: 50,
    costPerKmUSD: 2.00,
    fixedCostPerTripUSD: 6.0,
    description: '50 m³ semi-trailer rig for corridor bulk transfers.'
  }
];

// ASTM C1602 Specification for Concrete Mixing Water
export const ASTM_C1602_LIMITS = {
  reinforced: {
    name: 'Reinforced Structural Concrete',
    TDS: 50000,
    CHLORIDES: 1000,
    SULFATES: 3000,
    COD: 500,
    BOD: 100,
    pH_min: 6.0,
    pH_max: 9.0,
    description: 'ASTM C1602 cap to prevent steel rebar corrosion and delayed ettringite formation'
  },
  unreinforced: {
    name: 'Unreinforced Mass Concrete & Pavement',
    TDS: 50000,
    CHLORIDES: 4500,
    SULFATES: 3000,
    COD: 800,
    BOD: 150,
    pH_min: 6.0,
    pH_max: 9.0,
    description: 'ASTM C1602 higher tolerance for mass pours without embedded steel rebar'
  }
};

// Initial Industrial Symbiosis Clusters
export const INDUSTRIAL_CLUSTERS = [
  {
    id: 'dhaka-gazipur',
    name: 'Dhaka-Gazipur Industrial Symbiosis Corridor',
    region: 'Bangladesh',
    watershedScarcityIndex: 0.85, // Highly stressed aquifer basin
    municipalWaterTariff: 1.80, // USD per m3
    sewerDischargeFine: 0.95, // USD per m3 for non-compliant discharge
    coordinates: { lat: 23.998, lng: 90.395, zoom: 12 },
    suppliers: [
      {
        id: 'sup-1',
        name: 'Apex Horizon Textile Mills',
        sector: 'Textile Dyeing & Finishing',
        category: 'Red',
        capacityW: 750, // m3/day
        salePricePerM3: 0.45, // USD - what a buyer pays the seller per m3
        effluent: {
          TDS: 2200,
          COD: 680,
          BOD: 140,
          CHLORIDES: 420,
          SULFATES: 310,
          HARDNESS: 380,
          SILICA: 40,
          IRON: 1.2,
          COLOR: 450,
          OIL: 6,
          pH: 8.4
        },
        coords: { x: 220, y: 150, lat: 24.015, lng: 90.380 },
        description: 'Large reactive dye and knit finishing facility generating high COD and alkaline stream.'
      },
      {
        id: 'sup-2',
        name: 'Square Pharma Active Synthesis Plant',
        sector: 'Pharmaceutical Synthesis',
        category: 'Orange',
        capacityW: 320, // m3/day
        salePricePerM3: 0.30,
        effluent: {
          TDS: 1100,
          COD: 1850,
          BOD: 390,
          CHLORIDES: 280,
          SULFATES: 190,
          HARDNESS: 240,
          SILICA: 28,
          IRON: 0.4,
          COLOR: 10,
          OIL: 3,
          pH: 6.8
        },
        coords: { x: 140, y: 310, lat: 23.982, lng: 90.365 },
        description: 'Active formulation with solvent traces; high organic load requiring biological oxidation or dilution.'
      },
      {
        id: 'sup-3',
        name: 'Bengal Polytex Membrane RO Reject Hub',
        sector: 'Brine / ZLD Concentrate',
        category: 'Orange',
        capacityW: 420, // m3/day
        salePricePerM3: 0.15,
        effluent: {
          TDS: 34000,
          COD: 80,
          BOD: 15,
          CHLORIDES: 14500,
          SULFATES: 5200,
          HARDNESS: 2200,
          SILICA: 180,
          IRON: 0.8,
          COLOR: 15,
          OIL: 2,
          pH: 7.6
        },
        coords: { x: 380, y: 190, lat: 24.030, lng: 90.420 },
        description: 'Concentrated reject from existing internal 3-stage RO plant; zero organics, immense salinity.'
      },
      {
        id: 'sup-4',
        name: 'Pran Agro Beverage & Dairy Wash',
        sector: 'Food & Beverage Processing',
        category: 'Orange',
        capacityW: 550, // m3/day
        salePricePerM3: 0.20,
        effluent: {
          TDS: 520,
          COD: 920,
          BOD: 380,
          CHLORIDES: 110,
          SULFATES: 85,
          HARDNESS: 260,
          SILICA: 18,
          IRON: 0.3,
          COLOR: 40,
          OIL: 4,
          pH: 6.6
        },
        coords: { x: 290, y: 360, lat: 23.965, lng: 90.410 },
        description: 'Clean CIP rinse and tank wash effluent; biodegradable organics and very low salinity.'
      }
    ],
    buyers: [
      {
        id: 'buy-1',
        name: 'Crown Ready-Mix Concrete Plant #4',
        sector: 'Structural Concrete (ASTM C1602)',
        demandD: 550, // m3/day
        scarcityFactorS: 0.88,
        toleranceM: {
          TDS: 45000,
          COD: 500,
          BOD: 100,
          CHLORIDES: 1000, // Reinforced standard limit
          SULFATES: 3000,
          HARDNESS: 5000,
          SILICA: 150,
          IRON: 5,
          COLOR: 400,
          OIL: 10,
          pH_min: 6.0,
          pH_max: 9.0
        },
        coords: { x: 520, y: 160, lat: 24.010, lng: 90.445 },
        description: 'Supplies high-grade reinforced ready-mix for metro rail and industrial park civil infrastructure.'
      },
      {
        id: 'buy-2',
        name: 'Seven Rings Pavement & Precast Batching',
        sector: 'Unreinforced Precast & Pavers',
        demandD: 480, // m3/day
        scarcityFactorS: 0.82,
        toleranceM: {
          TDS: 50000,
          COD: 750,
          BOD: 150,
          CHLORIDES: 4500, // Unreinforced standard limit
          SULFATES: 3000,
          HARDNESS: 8000,
          SILICA: 200,
          IRON: 8,
          COLOR: 600,
          OIL: 15,
          pH_min: 6.0,
          pH_max: 9.0
        },
        coords: { x: 490, y: 320, lat: 23.975, lng: 90.435 },
        description: 'Manufactures interlocking paving blocks and non-structural architectural elements.'
      },
      {
        id: 'buy-3',
        name: 'Summit Power Cooling Tower Complex',
        sector: 'Industrial Cooling Tower Makeup',
        demandD: 600, // m3/day
        scarcityFactorS: 0.90,
        toleranceM: {
          TDS: 1200,
          COD: 80,
          BOD: 20,
          CHLORIDES: 350,
          SULFATES: 400,
          HARDNESS: 400,
          SILICA: 120,
          IRON: 0.3,
          COLOR: 50,
          OIL: 2,
          pH_min: 6.5,
          pH_max: 8.5
        },
        coords: { x: 650, y: 240, lat: 23.990, lng: 90.470 },
        description: 'Evaporative cooling tower loop requiring low TDS and low organics to avoid biological scaling.'
      },
      {
        id: 'buy-4',
        name: 'Meghna Heavy Equipment & Aggregate Wash',
        sector: 'Aggregate & Equipment Washdown',
        demandD: 350, // m3/day
        scarcityFactorS: 0.75,
        toleranceM: {
          TDS: 8000,
          COD: 400,
          BOD: 80,
          CHLORIDES: 2000,
          SULFATES: 1800,
          HARDNESS: 2000,
          SILICA: 150,
          IRON: 3,
          COLOR: 100,
          OIL: 30,
          pH_min: 6.0,
          pH_max: 9.0
        },
        coords: { x: 380, y: 460, lat: 23.940, lng: 90.425 },
        description: 'Washdown of quarry aggregates and heavy logistics transport trucks.'
      }
    ]
  },
  {
    id: 'houston-petro',
    name: 'Houston Ship Channel & Gulf Coast Eco-Cluster',
    region: 'Texas, USA',
    watershedScarcityIndex: 0.72,
    municipalWaterTariff: 3.10, // USD per m3
    sewerDischargeFine: 1.45,
    coordinates: { lat: 29.720, lng: -95.200, zoom: 12 },
    suppliers: [
      {
        id: 'sup-us-1',
        name: 'Baytown Petrochemical Hydrocarbon Wash',
        sector: 'Refinery Process Water',
        category: 'High-Organics',
        capacityW: 1200,
        salePricePerM3: 0.85,
        effluent: { TDS: 3100, COD: 1400, BOD: 220, CHLORIDES: 850, SULFATES: 650, HARDNESS: 600, SILICA: 60, IRON: 2.5, COLOR: 60, OIL: 85, pH: 7.9 },
        coords: { x: 190, y: 180, lat: 29.740, lng: -95.230 },
        description: 'Desalter and process cooling blowdown with oily organic traces.'
      },
      {
        id: 'sup-us-2',
        name: 'Lone Star Desalination Brine Facility',
        sector: 'High-Recovery SWRO Brine',
        category: 'High-Saline',
        capacityW: 800,
        salePricePerM3: 0.55,
        effluent: { TDS: 42000, COD: 20, BOD: 5, CHLORIDES: 19000, SULFATES: 7200, HARDNESS: 1800, SILICA: 140, IRON: 0.5, COLOR: 5, OIL: 1, pH: 8.1 },
        coords: { x: 260, y: 340, lat: 29.700, lng: -95.210 },
        description: 'Hypersaline brine stream with virtually no biological oxygen demand.'
      }
    ],
    buyers: [
      {
        id: 'buy-us-1',
        name: 'Gulf Coast Ready-Mix Infrastructure Plant',
        sector: 'Structural Concrete (ASTM C1602)',
        demandD: 950,
        scarcityFactorS: 0.75,
        toleranceM: { TDS: 50000, COD: 500, BOD: 100, CHLORIDES: 1000, SULFATES: 3000, HARDNESS: 5000, SILICA: 150, IRON: 5, COLOR: 400, OIL: 10, pH_min: 6.0, pH_max: 9.0 },
        coords: { x: 520, y: 220, lat: 29.730, lng: -95.170 },
        description: 'Highway infrastructure concrete pour seeking non-potable hydration water.'
      },
      {
        id: 'buy-us-2',
        name: 'Channelview Port Dust Suppression & Wash',
        sector: 'Bulk Material Dust Suppression',
        demandD: 700,
        scarcityFactorS: 0.70,
        toleranceM: { TDS: 15000, COD: 600, BOD: 120, CHLORIDES: 5000, SULFATES: 4000, HARDNESS: 2500, SILICA: 200, IRON: 5, COLOR: 500, OIL: 40, pH_min: 6.0, pH_max: 9.0 },
        coords: { x: 480, y: 390, lat: 29.680, lng: -95.180 },
        description: 'Coal and petcoke storage yard continuous misting and dust suppression.'
      }
    ]
  }
];
