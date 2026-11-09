import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/agreements
 * Fetch all Water Purchase Agreements (WPAs)
 */
router.get('/', (req, res) => {
  try {
    const { clusterId, status } = req.query;
    let query = `
      SELECT
        wa.*,
        s.name as supplier_name,
        s.sector as supplier_sector,
        b.name as buyer_name,
        b.sector as buyer_sector
      FROM water_agreements wa
      JOIN facilities s ON wa.supplier_id = s.id
      JOIN facilities b ON wa.buyer_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (clusterId) {
      query += ' AND wa.cluster_id = ?';
      params.push(clusterId);
    }

    if (status) {
      query += ' AND wa.status = ?';
      params.push(status);
    }

    query += ' ORDER BY wa.created_at DESC';

    const rows = db.prepare(query).all(...params);

    const agreements = rows.map((r) => ({
      id: r.id,
      code: r.agreement_code,
      clusterId: r.cluster_id,
      supplierId: r.supplier_id,
      supplierName: r.supplier_name,
      supplierSector: r.supplier_sector,
      buyerId: r.buyer_id,
      buyerName: r.buyer_name,
      buyerSector: r.buyer_sector,
      dailyVolumeM3: r.daily_volume,
      tariffBdtM3: r.tariff_bdt_m3,
      status: r.status,
      deliveryMode: r.delivery_mode,
      notes: r.notes,
      createdAt: r.created_at
    }));

    res.json({ agreements, count: agreements.length });
  } catch (err) {
    console.error('Fetch agreements error:', err);
    res.status(500).json({ error: 'Failed to retrieve agreements.' });
  }
});

/**
 * POST /api/agreements
 * Create a new Water Purchase Agreement between two industrial plants
 */
router.post('/', (req, res) => {
  try {
    const {
      supplierId,
      buyerId,
      clusterId = 'dhaka-gazipur',
      dailyVolume,
      tariffBdtM3,
      deliveryMode = 'TANKER_FLEET',
      notes = ''
    } = req.body;

    if (!supplierId || !buyerId || !dailyVolume || !tariffBdtM3) {
      return res.status(400).json({
        error: 'supplierId, buyerId, dailyVolume, and tariffBdtM3 are required.'
      });
    }

    const id = `wpa-${Date.now()}`;
    const code = `WPA-${clusterId.split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;

    db.prepare(`
      INSERT INTO water_agreements (
        id, agreement_code, supplier_id, buyer_id, cluster_id,
        daily_volume, tariff_bdt_m3, status, delivery_mode, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      code,
      supplierId,
      buyerId,
      clusterId,
      Number(dailyVolume),
      Number(tariffBdtM3),
      'ACTIVE',
      deliveryMode,
      notes
    );

    res.status(201).json({
      message: 'Water Purchase Agreement registered in SQLite database.',
      agreement: {
        id,
        code,
        supplierId,
        buyerId,
        clusterId,
        dailyVolumeM3: Number(dailyVolume),
        tariffBdtM3: Number(tariffBdtM3),
        status: 'ACTIVE',
        deliveryMode
      }
    });
  } catch (err) {
    console.error('Create agreement error:', err);
    res.status(500).json({ error: 'Failed to register water agreement.' });
  }
});

/**
 * PATCH /api/agreements/:id/status
 * Update status of an agreement
 */
router.patch('/:id/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'PENDING', 'COMPLETED', 'TERMINATED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid agreement status value.' });
    }

    db.prepare('UPDATE water_agreements SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: `Agreement status updated to ${status}.` });
  } catch (err) {
    console.error('Update agreement status error:', err);
    res.status(500).json({ error: 'Failed to update agreement status.' });
  }
});

export default router;
