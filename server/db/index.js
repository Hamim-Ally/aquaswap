import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../aquaswap.db');

export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance & integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/**
 * Initializes Database Tables
 * Designed to mirror PostgreSQL / Supabase column structure for easy migration later.
 */
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      facility_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('supplier', 'buyer')),
      cluster_id TEXT NOT NULL,
      sector TEXT NOT NULL,
      daily_volume REAL NOT NULL DEFAULT 500,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('supplier', 'buyer')),
      cluster_id TEXT NOT NULL,
      sector TEXT NOT NULL,
      category TEXT DEFAULT 'Orange',
      capacity_w REAL,
      demand_d REAL,
      effluent_json TEXT,
      tolerance_json TEXT,
      coords_lat REAL,
      coords_lng REAL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS water_agreements (
      id TEXT PRIMARY KEY,
      agreement_code TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      cluster_id TEXT NOT NULL,
      daily_volume REAL NOT NULL,
      tariff_bdt_m3 REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'PENDING', 'COMPLETED', 'TERMINATED')),
      delivery_mode TEXT NOT NULL DEFAULT 'TANKER_FLEET',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES facilities(id) ON DELETE CASCADE,
      FOREIGN KEY (buyer_id) REFERENCES facilities(id) ON DELETE CASCADE
    );
  `);

  seedInitialData();
}

/**
 * Seeds default Bangladesh clusters, demo facilities, and user accounts
 */
function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    return; // Already seeded
  }

  console.log('🌱 Seeding initial AquaSwap database with Bangladesh industrial facilities...');

  const passwordHash = bcrypt.hashSync('password123', 10);

  // 1. Seed Demo Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, facility_name, role, cluster_id, sector, daily_volume)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoUsers = [
    {
      id: 'usr-apex-horizon',
      email: 'plant.ops@apexhorizon.bd',
      facility_name: 'Apex Horizon Textile Mills',
      role: 'supplier',
      cluster_id: 'dhaka-gazipur',
      sector: 'Textile Dyeing & Wet Processing',
      volume: 750
    },
    {
      id: 'usr-crown-readymix',
      email: 'qa.batch@crownreadymix.bd',
      facility_name: 'Crown Ready-Mix Concrete',
      role: 'buyer',
      cluster_id: 'dhaka-gazipur',
      sector: 'Ready-Mix Concrete (ASTM C1602)',
      volume: 550
    },
    {
      id: 'usr-bsrm-steel',
      email: 'water.eng@bsrmsteel.bd',
      facility_name: 'BSRM Steel Re-Rolling',
      role: 'buyer',
      cluster_id: 'chattogram-karnaphuli',
      sector: 'Electric Arc Furnace Cooling',
      volume: 680
    },
    {
      id: 'usr-fakir-knit',
      email: 'etp.manager@fakirknit.bd',
      facility_name: 'Fakir Knitwears Ltd.',
      role: 'supplier',
      cluster_id: 'narayanganj-shitalakshya',
      sector: 'Knit Dyeing & Rinse Effluent',
      volume: 620
    }
  ];

  for (const u of demoUsers) {
    insertUser.run(u.id, u.email, passwordHash, u.facility_name, u.role, u.cluster_id, u.sector, u.volume);
  }

  // 2. Seed Baseline Facilities
  const insertFacility = db.prepare(`
    INSERT INTO facilities (
      id, user_id, name, type, cluster_id, sector, category,
      capacity_w, demand_d, effluent_json, tolerance_json,
      coords_lat, coords_lng, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const baselineFacilities = [
    // Dhaka-Gazipur Suppliers
    {
      id: 'sup-1',
      user_id: 'usr-apex-horizon',
      name: 'Apex Horizon Textile Mills',
      type: 'supplier',
      cluster_id: 'dhaka-gazipur',
      sector: 'Textile Dyeing & Finishing',
      category: 'Red',
      capacity_w: 750,
      effluent: { TDS: 2200, COD: 680, BOD: 140, CHLORIDES: 420, SULFATES: 310, pH: 8.4 },
      lat: 24.015,
      lng: 90.380,
      description: 'Large reactive dye and knit finishing facility generating high COD and alkaline stream.'
    },
    {
      id: 'sup-2',
      name: 'Square Pharma Active Synthesis Plant',
      type: 'supplier',
      cluster_id: 'dhaka-gazipur',
      sector: 'Pharmaceutical Synthesis',
      category: 'Orange',
      capacity_w: 320,
      effluent: { TDS: 1100, COD: 1850, BOD: 390, CHLORIDES: 280, SULFATES: 190, pH: 6.8 },
      lat: 23.982,
      lng: 90.365,
      description: 'Active formulation with solvent traces; high organic load.'
    },
    {
      id: 'sup-3',
      name: 'Bengal Polytex Membrane RO Reject Hub',
      type: 'supplier',
      cluster_id: 'dhaka-gazipur',
      sector: 'Brine / ZLD Concentrate',
      category: 'Orange',
      capacity_w: 420,
      effluent: { TDS: 34000, COD: 80, BOD: 15, CHLORIDES: 14500, SULFATES: 5200, pH: 7.6 },
      lat: 24.030,
      lng: 90.420,
      description: 'Concentrated reject from existing internal 3-stage RO plant; zero organics, immense salinity.'
    },
    {
      id: 'sup-4',
      name: 'Pran Agro Beverage & Dairy Wash',
      type: 'supplier',
      cluster_id: 'dhaka-gazipur',
      sector: 'Food & Beverage Processing',
      category: 'Orange',
      capacity_w: 550,
      effluent: { TDS: 520, COD: 920, BOD: 380, CHLORIDES: 110, SULFATES: 85, pH: 6.6 },
      lat: 23.965,
      lng: 90.410,
      description: 'Clean CIP rinse and tank wash effluent; biodegradable organics and very low salinity.'
    },

    // Dhaka-Gazipur Buyers
    {
      id: 'dem-1',
      user_id: 'usr-crown-readymix',
      name: 'Crown Ready-Mix Concrete Plant',
      type: 'buyer',
      cluster_id: 'dhaka-gazipur',
      sector: 'Ready-Mix Concrete (Structural Batching)',
      category: 'Green',
      demand_d: 550,
      tolerance: { TDS: 50000, COD: 500, BOD: 100, CHLORIDES: 1000, SULFATES: 3000, pH_min: 6.0, pH_max: 9.0 },
      lat: 24.008,
      lng: 90.402,
      description: 'High-volume batching yard supplying major infrastructure; strictly compliant with ASTM C1602.'
    },
    {
      id: 'dem-2',
      name: 'Seven Rings Cement Grinding & Dust Suppression',
      type: 'buyer',
      cluster_id: 'dhaka-gazipur',
      sector: 'Cement Clinker & Dust Suppression',
      category: 'Green',
      demand_d: 380,
      tolerance: { TDS: 65000, COD: 1200, BOD: 300, CHLORIDES: 6000, SULFATES: 4500, pH_min: 5.5, pH_max: 9.5 },
      lat: 23.975,
      lng: 90.425,
      description: 'Clinker grinding and site dust spray requiring coarse non-potable water.'
    },
    {
      id: 'dem-3',
      name: 'Mir Ceramic Tile Body Preparation Unit',
      type: 'buyer',
      cluster_id: 'dhaka-gazipur',
      sector: 'Ceramic Body Slurry Preparation',
      category: 'Orange',
      demand_d: 410,
      tolerance: { TDS: 3000, COD: 250, BOD: 50, CHLORIDES: 400, SULFATES: 500, pH_min: 6.5, pH_max: 8.5 },
      lat: 24.020,
      lng: 90.370,
      description: 'Ball mill clay preparation; sensitive to soluble sulfates and staining iron ions.'
    },
    {
      id: 'dem-4',
      name: 'Monno Fabrics Utility Boiler Feed & Scrubber',
      type: 'buyer',
      cluster_id: 'dhaka-gazipur',
      sector: 'Industrial Boiler Make-Up & Flue Gas Scrubber',
      category: 'Red',
      demand_d: 300,
      tolerance: { TDS: 500, COD: 50, BOD: 10, CHLORIDES: 50, SULFATES: 50, pH_min: 7.0, pH_max: 8.5 },
      lat: 24.035,
      lng: 90.390,
      description: 'Demineralized boiler feed water; strict TDS cap to prevent scale deposition.'
    },

    // Chattogram Karnaphuli
    {
      id: 'ctg-sup-1',
      name: 'KDS Garments & Dyeing Complex',
      type: 'supplier',
      cluster_id: 'chattogram-karnaphuli',
      sector: 'Apparel Dyeing & Wash Hub',
      category: 'Red',
      capacity_w: 820,
      effluent: { TDS: 2400, COD: 710, BOD: 160, CHLORIDES: 480, SULFATES: 340, pH: 8.2 },
      lat: 22.342,
      lng: 91.815,
      description: 'Chittagong port zone dyeing complex.'
    },
    {
      id: 'ctg-dem-1',
      user_id: 'usr-bsrm-steel',
      name: 'BSRM Steel Re-Rolling Mill',
      type: 'buyer',
      cluster_id: 'chattogram-karnaphuli',
      sector: 'Electric Arc Furnace Cooling',
      category: 'Red',
      demand_d: 680,
      tolerance: { TDS: 1500, COD: 100, BOD: 20, CHLORIDES: 250, SULFATES: 300, pH_min: 6.5, pH_max: 8.0 },
      lat: 22.355,
      lng: 91.830,
      description: 'Heavy metallurgy cooling jacket with corrosion inhibitor compatibility requirements.'
    },

    // Narayanganj Shitalakshya
    {
      id: 'nrj-sup-1',
      user_id: 'usr-fakir-knit',
      name: 'Fakir Knitwears Ltd.',
      type: 'supplier',
      cluster_id: 'narayanganj-shitalakshya',
      sector: 'Knit Dyeing & Rinse Effluent',
      category: 'Red',
      capacity_w: 620,
      effluent: { TDS: 1950, COD: 590, BOD: 130, CHLORIDES: 360, SULFATES: 270, pH: 8.1 },
      lat: 23.615,
      lng: 90.510,
      description: 'Composite knit facility discharging along Shitalakshya river basin.'
    },
    {
      id: 'nrj-dem-1',
      name: 'Premier Cement Narayanganj Mill',
      type: 'buyer',
      cluster_id: 'narayanganj-shitalakshya',
      sector: 'Cement Grinding & River Berth Spray',
      category: 'Green',
      demand_d: 490,
      tolerance: { TDS: 55000, COD: 900, BOD: 250, CHLORIDES: 4500, SULFATES: 3500, pH_min: 5.5, pH_max: 9.5 },
      lat: 23.630,
      lng: 90.525,
      description: 'Riverfront clinker grinding plant utilizing non-potable water for ball mill cooling and dust control.'
    }
  ];

  for (const f of baselineFacilities) {
    insertFacility.run(
      f.id,
      f.user_id || null,
      f.name,
      f.type,
      f.cluster_id,
      f.sector,
      f.category || 'Orange',
      f.capacity_w || null,
      f.demand_d || null,
      f.effluent ? JSON.stringify(f.effluent) : null,
      f.tolerance ? JSON.stringify(f.tolerance) : null,
      f.lat || null,
      f.lng || null,
      f.description || null
    );
  }

  // 3. Seed Sample Water Purchase Agreement
  const insertAgreement = db.prepare(`
    INSERT INTO water_agreements (
      id, agreement_code, supplier_id, buyer_id, cluster_id, daily_volume, tariff_bdt_m3, status, delivery_mode, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAgreement.run(
    'wpa-001',
    'WPA-DHAKA-2026-001',
    'sup-1',
    'dem-1',
    'dhaka-gazipur',
    500,
    18.5,
    'ACTIVE',
    'TANKER_FLEET',
    'Bilateral Water Purchase Agreement between Apex Horizon and Crown Ready-Mix compliant with ASTM C1602.'
  );

  console.log('✅ SQLite database initialized with seed records successfully.');
}
