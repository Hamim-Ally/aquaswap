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

export const TREATMENT_TECHNOLOGIES = [
  {
    id: 0,
    name: 'Direct Bypass (No Treatment)',
    shortName: 'Direct Bypass',
    description: 'Raw effluent transferred directly via dedicated tanker or pipeline.',
    capexPerM3Day: 0,
    opexPerM3: 0.05, // pumping/handling only
    energyKWh: 0.1,
    removals: { TDS: 0.0, COD: 0.0, BOD: 0.0, CHLORIDES: 0.0, SULFATES: 0.0, pH_shift: 0 }
  },
  {
    id: 1,
    name: 'Primary Clarification & Dual-Media Sand Filtration',
    shortName: 'Filtration Skid',
    description: 'Removes suspended solids, large colloids, and particulate organics.',
    capexPerM3Day: 350,
    opexPerM3: 0.35,
    energyKWh: 0.4,
    removals: { TDS: 0.08, COD: 0.25, BOD: 0.30, CHLORIDES: 0.05, SULFATES: 0.05, pH_shift: 0 }
  },
  {
    id: 2,
    name: 'Membrane Bioreactor (MBR) Skid',
    shortName: 'Modular MBR',
    description: 'Ultrafiltration with biological degradation operating at 10,000 mg/L MLSS density.',
    capexPerM3Day: 1800,
    opexPerM3: 1.15,
    energyKWh: 1.1,
    removals: { TDS: 0.15, COD: 0.88, BOD: 0.95, CHLORIDES: 0.08, SULFATES: 0.10, pH_shift: 0 }
  },
  {
    id: 3,
    name: 'Reverse Osmosis (RO) High-Pressure Skid',
    shortName: 'Brackish RO Skid',
    description: 'Polyamide thin-film composite membranes stripping monovalent ions and salts.',
    capexPerM3Day: 3200,
    opexPerM3: 2.10,
    energyKWh: 2.3,
    removals: { TDS: 0.96, COD: 0.98, BOD: 0.99, CHLORIDES: 0.97, SULFATES: 0.98, pH_shift: 0 }
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
    name: 'Dhaka-Gazipur Industrial Corridor',
    region: 'Gazipur & Dhaka, Bangladesh',
    watershedScarcityIndex: 0.88, // Highly stressed Modhupur tract aquifer basin
    municipalWaterTariff: 45.0, // BDT per m3 (Dhaka WASA industrial tariff baseline)
    sewerDischargeFine: 25.0, // BDT per m3 (DoE ECR 2023 non-compliant discharge penalty)
    transportCostPerM3Km: 2.2, // BDT per m3 per km (calibrated for 28m3 tanker logistics)
    coordinates: { lat: 23.998, lng: 90.395, zoom: 12 },
    suppliers: [
      {
        id: 'sup-1',
        name: 'Apex Horizon Textile Mills',
        sector: 'Textile Dyeing & Finishing',
        category: 'Red',
        capacityW: 750, // m3/day
        effluent: {
          TDS: 2200,
          COD: 680,
          BOD: 140,
          CHLORIDES: 420,
          SULFATES: 310,
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
        effluent: {
          TDS: 1100,
          COD: 1850,
          BOD: 390,
          CHLORIDES: 280,
          SULFATES: 190,
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
        effluent: {
          TDS: 34000,
          COD: 80,
          BOD: 15,
          CHLORIDES: 14500,
          SULFATES: 5200,
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
        effluent: {
          TDS: 520,
          COD: 920,
          BOD: 380,
          CHLORIDES: 110,
          SULFATES: 85,
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
          pH_min: 6.0,
          pH_max: 9.0
        },
        coords: { x: 380, y: 460, lat: 23.940, lng: 90.425 },
        description: 'Washdown of quarry aggregates and heavy logistics transport trucks.'
      }
    ]
  },
  {
    id: 'chattogram-karnaphuli',
    name: 'Chattogram-Karnaphuli Heavy Industrial Belt',
    region: 'Chattogram, Bangladesh',
    watershedScarcityIndex: 0.78,
    municipalWaterTariff: 48.0, // BDT per m3 (CWASA industrial water rate)
    sewerDischargeFine: 30.0, // BDT per m3
    transportCostPerM3Km: 2.4, // BDT per m3 per km
    coordinates: { lat: 22.345, lng: 91.835, zoom: 12 },
    suppliers: [
      {
        id: 'sup-ctg-1',
        name: 'BSRM Steel Water Quenching & Cooling Hub',
        sector: 'Steel Rolling & Continuous Casting',
        category: 'Orange',
        capacityW: 650,
        effluent: { TDS: 1400, COD: 90, BOD: 20, CHLORIDES: 380, SULFATES: 420, pH: 7.8 },
        coords: { x: 210, y: 160, lat: 22.370, lng: 91.815 },
        description: 'Continuous billet rolling and cooling circuit bleedoff; stable temperature and neutral pH.'
      },
      {
        id: 'sup-ctg-2',
        name: 'KDS Textiles & Garments Wet Processing',
        sector: 'Textile Dyeing & Wet Finishing',
        category: 'Red',
        capacityW: 480,
        effluent: { TDS: 2100, COD: 720, BOD: 160, CHLORIDES: 450, SULFATES: 290, pH: 8.3 },
        coords: { x: 320, y: 280, lat: 22.340, lng: 91.850 },
        description: 'Treated reactive dye rinse stream with low heavy-metal profile.'
      },
      {
        id: 'sup-ctg-3',
        name: 'Western Marine Shipyard Hydro-Blast Wash',
        sector: 'Marine Engineering & Hull Preparation',
        category: 'Orange',
        capacityW: 320,
        effluent: { TDS: 650, COD: 120, BOD: 30, CHLORIDES: 190, SULFATES: 110, pH: 7.2 },
        coords: { x: 260, y: 390, lat: 22.315, lng: 91.840 },
        description: 'High-pressure surface preparation washdown with low dissolved solids.'
      }
    ],
    buyers: [
      {
        id: 'buy-ctg-1',
        name: 'Premier Cement & Ready-Mix Plant',
        sector: 'Structural Concrete (ASTM C1602)',
        demandD: 580,
        scarcityFactorS: 0.80,
        toleranceM: { TDS: 45000, COD: 500, BOD: 100, CHLORIDES: 1000, SULFATES: 3000, pH_min: 6.0, pH_max: 9.0 },
        coords: { x: 510, y: 200, lat: 22.360, lng: 91.870 },
        description: 'Ready-mix batching plant supplying port terminals and flyover construction.'
      },
      {
        id: 'buy-ctg-2',
        name: 'GPH Ispat Slag Granulation & Dust Misting',
        sector: 'Slag Cooling & Dust Suppression',
        demandD: 500,
        scarcityFactorS: 0.74,
        toleranceM: { TDS: 8000, COD: 300, BOD: 60, CHLORIDES: 1800, SULFATES: 2200, pH_min: 6.0, pH_max: 9.0 },
        coords: { x: 440, y: 350, lat: 22.325, lng: 91.860 },
        description: 'Heavy metallurgical cooling and haulage yard continuous water sprayers.'
      },
      {
        id: 'buy-ctg-3',
        name: 'Chittagong Port Container Yard Washdown',
        sector: 'Port Terminal Fleet Maintenance',
        demandD: 370,
        scarcityFactorS: 0.76,
        toleranceM: { TDS: 12000, COD: 500, BOD: 90, CHLORIDES: 3500, SULFATES: 2800, pH_min: 6.0, pH_max: 9.0 },
        coords: { x: 380, y: 470, lat: 22.290, lng: 91.820 },
        description: 'Heavy equipment chassis and intermodal container chassis washdown bays.'
      }
    ]
  },
  {
    id: 'narayanganj-shitalakshya',
    name: 'Narayanganj-Shitalakshya Industrial Basin',
    region: 'Narayanganj, Bangladesh',
    watershedScarcityIndex: 0.92,
    municipalWaterTariff: 44.0, // BDT per m3
    sewerDischargeFine: 28.0, // BDT per m3
    transportCostPerM3Km: 2.0, // BDT per m3 per km
    coordinates: { lat: 23.623, lng: 90.500, zoom: 12 },
    suppliers: [
      {
        id: 'sup-ng-1',
        name: 'Fakir Knitwears Dyeing & Bleach Unit',
        sector: 'Knitwear Dyeing & Finishing',
        category: 'Red',
        capacityW: 600,
        effluent: { TDS: 1900, COD: 640, BOD: 130, CHLORIDES: 380, SULFATES: 280, pH: 8.2 },
        coords: { x: 210, y: 190, lat: 23.640, lng: 90.485 },
        description: 'High-volume textile dyeing facility with state-of-the-art biological ETP.'
      },
      {
        id: 'sup-ng-2',
        name: 'Robintex Fabrics Finishing Rinse Station',
        sector: 'Export Fabrics Wet Processing',
        category: 'Orange',
        capacityW: 450,
        effluent: { TDS: 580, COD: 820, BOD: 290, CHLORIDES: 130, SULFATES: 95, pH: 6.8 },
        coords: { x: 290, y: 340, lat: 23.610, lng: 90.515 },
        description: 'Clean rinse effluent stream suited for direct construction hydration.'
      }
    ],
    buyers: [
      {
        id: 'buy-ng-1',
        name: 'Shah Cement Ready-Mix Batching Complex',
        sector: 'Structural Concrete (ASTM C1602)',
        demandD: 550,
        scarcityFactorS: 0.90,
        toleranceM: { TDS: 45000, COD: 500, BOD: 100, CHLORIDES: 1000, SULFATES: 3000, pH_min: 6.0, pH_max: 9.0 },
        coords: { x: 490, y: 220, lat: 23.635, lng: 90.540 },
        description: 'Major concrete batching hub supplying mega-infrastructure across Greater Dhaka.'
      },
      {
        id: 'buy-ng-2',
        name: 'Meghna River Precast Block & Sand Wash',
        sector: 'Precast Blocks & River Aggregate',
        demandD: 420,
        scarcityFactorS: 0.85,
        toleranceM: { TDS: 10000, COD: 450, BOD: 80, CHLORIDES: 2500, SULFATES: 2000, pH_min: 6.0, pH_max: 9.0 },
        coords: { x: 440, y: 410, lat: 23.595, lng: 90.530 },
        description: 'Continuous river sand washing and interlocking pavement block fabrication.'
      }
    ]
  }
];
