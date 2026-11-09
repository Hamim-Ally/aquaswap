import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

const CLUSTER_CONFIGS = [
  {
    id: 'dhaka-gazipur',
    name: 'Dhaka-Gazipur Industrial Corridor',
    region: 'Gazipur & Dhaka, Bangladesh',
    watershedScarcityIndex: 0.88,
    municipalWaterTariff: 45.0,
    sewerDischargeFine: 25.0,
    transportCostPerM3Km: 2.2,
    coordinates: { lat: 23.998, lng: 90.395, zoom: 12 }
  },
  {
    id: 'chattogram-karnaphuli',
    name: 'Chattogram-Karnaphuli Estuary Zone',
    region: 'Karnaphuli & Port Zone, Chattogram, Bangladesh',
    watershedScarcityIndex: 0.72,
    municipalWaterTariff: 52.0,
    sewerDischargeFine: 30.0,
    transportCostPerM3Km: 2.6,
    coordinates: { lat: 22.345, lng: 91.825, zoom: 12 }
  },
  {
    id: 'narayanganj-shitalakshya',
    name: 'Narayanganj-Shitalakshya River Basin',
    region: 'Narayanganj & Fatullah, Bangladesh',
    watershedScarcityIndex: 0.94,
    municipalWaterTariff: 42.0,
    sewerDischargeFine: 28.0,
    transportCostPerM3Km: 2.1,
    coordinates: { lat: 23.620, lng: 90.505, zoom: 12 }
  }
];

function formatFacility(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    sector: row.sector,
    category: row.category,
    capacityW: row.capacity_w,
    demandD: row.demand_d,
    effluent: row.effluent_json ? JSON.parse(row.effluent_json) : undefined,
    tolerance: row.tolerance_json ? JSON.parse(row.tolerance_json) : undefined,
    toleranceM: row.tolerance_json ? JSON.parse(row.tolerance_json) : undefined,
    coords: {
      lat: row.coords_lat || 24.0,
      lng: row.coords_lng || 90.4,
      x: 300,
      y: 250
    },
    description: row.description
  };
}

/**
 * GET /api/clusters
 * Fetch all clusters with live facilities queried from SQLite
 */
router.get('/', (req, res) => {
  try {
    const allFacilities = db.prepare('SELECT * FROM facilities').all();

    const clusters = CLUSTER_CONFIGS.map((cfg) => {
      const clusterFacilities = allFacilities.filter((f) => f.cluster_id === cfg.id);
      const suppliers = clusterFacilities.filter((f) => f.type === 'supplier').map(formatFacility);
      const buyers = clusterFacilities.filter((f) => f.type === 'buyer').map(formatFacility);

      return {
        ...cfg,
        suppliers,
        buyers
      };
    });

    res.json({ clusters });
  } catch (err) {
    console.error('Fetch clusters error:', err);
    res.status(500).json({ error: 'Failed to retrieve clusters.' });
  }
});

export default router;
