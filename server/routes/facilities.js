import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Format raw SQLite row to JSON API facility object
 */
function formatFacility(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    clusterId: row.cluster_id,
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
    description: row.description,
    createdAt: row.created_at
  };
}

/**
 * GET /api/facilities
 * List all facilities, optionally filtered by clusterId or type
 */
router.get('/', (req, res) => {
  try {
    const { clusterId, type } = req.query;
    let query = 'SELECT * FROM facilities WHERE 1=1';
    const params = [];

    if (clusterId) {
      query += ' AND cluster_id = ?';
      params.push(clusterId);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params);
    const facilities = rows.map(formatFacility);

    res.json({ facilities, count: facilities.length });
  } catch (err) {
    console.error('Fetch facilities error:', err);
    res.status(500).json({ error: 'Failed to retrieve facilities.' });
  }
});

/**
 * GET /api/facilities/:id
 * Get single facility
 */
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM facilities WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Facility not found.' });
    }
    res.json(formatFacility(row));
  } catch (err) {
    console.error('Fetch facility error:', err);
    res.status(500).json({ error: 'Failed to retrieve facility.' });
  }
});

/**
 * POST /api/facilities
 * Add a new facility (optionally linked to authenticated user)
 */
router.post('/', (req, res) => {
  try {
    const {
      name,
      type,
      clusterId = 'dhaka-gazipur',
      sector = 'Industrial Manufacturing',
      category = 'Orange',
      capacityW,
      demandD,
      effluent,
      tolerance,
      toleranceM,
      coords,
      description
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type (supplier/buyer) are required.' });
    }

    const id = `fac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const effectiveTolerance = tolerance || toleranceM;

    db.prepare(`
      INSERT INTO facilities (
        id, user_id, name, type, cluster_id, sector, category,
        capacity_w, demand_d, effluent_json, tolerance_json,
        coords_lat, coords_lng, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.body.userId || null,
      name.trim(),
      type,
      clusterId,
      sector,
      category,
      type === 'supplier' ? Number(capacityW) || 500 : null,
      type === 'buyer' ? Number(demandD) || 500 : null,
      effluent ? JSON.stringify(effluent) : null,
      effectiveTolerance ? JSON.stringify(effectiveTolerance) : null,
      coords?.lat || 24.0,
      coords?.lng || 90.4,
      description || `Industrial ${sector} operating in ${clusterId}.`
    );

    const created = db.prepare('SELECT * FROM facilities WHERE id = ?').get(id);
    res.status(201).json({
      message: 'Facility created successfully.',
      facility: formatFacility(created)
    });
  } catch (err) {
    console.error('Create facility error:', err);
    res.status(500).json({ error: 'Failed to create facility.' });
  }
});

/**
 * DELETE /api/facilities/:id
 * Delete a facility (protected)
 */
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const facility = db.prepare('SELECT * FROM facilities WHERE id = ?').get(req.params.id);
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found.' });
    }

    db.prepare('DELETE FROM facilities WHERE id = ?').run(req.params.id);
    res.json({ message: 'Facility deleted successfully.' });
  } catch (err) {
    console.error('Delete facility error:', err);
    res.status(500).json({ error: 'Failed to delete facility.' });
  }
});

export default router;
