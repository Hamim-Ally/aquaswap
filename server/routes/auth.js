import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new industrial facility and user account
 */
router.post('/signup', async (req, res) => {
  try {
    const {
      email,
      password,
      facility_name,
      role = 'supplier',
      cluster_id = 'dhaka-gazipur',
      sector = 'Industrial Manufacturing',
      daily_volume = 500,
      phone = ''
    } = req.body;

    if (!email || !password || !facility_name) {
      return res.status(400).json({ error: 'Email, password, and facility name are required.' });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const facilityId = `fac-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const volume = Number(daily_volume) || 500;

    // Insert user
    db.prepare(`
      INSERT INTO users (id, email, password_hash, facility_name, role, cluster_id, sector, daily_volume, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      email.toLowerCase().trim(),
      passwordHash,
      facility_name.trim(),
      role,
      cluster_id,
      sector,
      volume,
      phone
    );

    // Auto-create facility entry in database
    const defaultEffluent = role === 'supplier'
      ? JSON.stringify({ TDS: 2200, COD: 450, BOD: 110, CHLORIDES: 380, SULFATES: 300, pH: 7.8 })
      : null;
    const defaultTolerance = role === 'buyer'
      ? JSON.stringify({ TDS: 35000, COD: 500, BOD: 100, CHLORIDES: 1000, SULFATES: 3000, pH_min: 6.0, pH_max: 9.0 })
      : null;

    db.prepare(`
      INSERT INTO facilities (
        id, user_id, name, type, cluster_id, sector, category,
        capacity_w, demand_d, effluent_json, tolerance_json,
        coords_lat, coords_lng, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      facilityId,
      userId,
      facility_name.trim(),
      role,
      cluster_id,
      sector,
      role === 'supplier' ? 'Red' : 'Green',
      role === 'supplier' ? volume : null,
      role === 'buyer' ? volume : null,
      defaultEffluent,
      defaultTolerance,
      23.998,
      90.395,
      `Registered ${sector} operating in ${cluster_id}.`
    );

    const userPayload = {
      id: userId,
      facilityId,
      email: email.toLowerCase().trim(),
      name: facility_name.trim(),
      role,
      clusterId: cluster_id,
      sector,
      volume
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Facility account registered successfully.',
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error registering account.' });
  }
});

/**
 * POST /api/auth/signin
 * Authenticate existing factory user
 */
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    // Fetch linked facility if any
    const facility = db.prepare('SELECT id FROM facilities WHERE user_id = ?').get(user.id);

    const userPayload = {
      id: user.id,
      facilityId: facility?.id || null,
      email: user.email,
      name: user.facility_name,
      role: user.role,
      clusterId: user.cluster_id,
      sector: user.sector,
      volume: user.daily_volume
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Sign in successful.',
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Internal server error authenticating.' });
  }
});

/**
 * POST /api/auth/demo-login
 * 1-Click login for the 4 pre-seeded demo facilities
 */
router.post('/demo-login', (req, res) => {
  try {
    const { email, name, role, clusterId, sector, volume } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Demo email is required.' });
    }

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      // Auto-provision mock facility account in SQLite database on the fly
      const userId = `usr-${email.split('@')[0].replace(/[^a-z0-9]/gi, '-')}`;
      const passwordHash = bcrypt.hashSync('password123', 10);
      db.prepare(`
        INSERT INTO users (id, email, password_hash, facility_name, role, cluster_id, sector, daily_volume)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        email.toLowerCase().trim(),
        passwordHash,
        name || 'Industrial Facility',
        role || 'supplier',
        clusterId || 'dhaka-gazipur',
        sector || 'Industrial Manufacturing',
        volume || 500
      );
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    }

    const facility = db.prepare('SELECT id FROM facilities WHERE user_id = ?').get(user.id);

    const userPayload = {
      id: user.id,
      facilityId: facility?.id || null,
      email: user.email,
      name: user.facility_name,
      role: user.role,
      clusterId: user.cluster_id,
      sector: user.sector,
      volume: user.daily_volume
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Demo login successful.',
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Internal server error in demo login.' });
  }
});

/**
 * GET /api/auth/me
 * Protected route to get the authenticated plant session
 */
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, facility_name, role, cluster_id, sector, daily_volume, phone, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const facility = db.prepare('SELECT * FROM facilities WHERE user_id = ?').get(user.id);

    res.json({
      user: {
        id: user.id,
        facilityId: facility?.id || null,
        email: user.email,
        name: user.facility_name,
        role: user.role,
        clusterId: user.cluster_id,
        sector: user.sector,
        volume: user.daily_volume,
        phone: user.phone,
        createdAt: user.created_at
      },
      facility: facility ? {
        ...facility,
        effluent: facility.effluent_json ? JSON.parse(facility.effluent_json) : null,
        tolerance: facility.tolerance_json ? JSON.parse(facility.tolerance_json) : null
      } : null
    });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ error: 'Failed to fetch current user profile.' });
  }
});

export default router;
