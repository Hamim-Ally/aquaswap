import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'aquaswap-demo-secret';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({ id: u.id, email: u.email, company: u.company });

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired, please sign in again' });
  }
};

const parseFacility = (row) => ({
  dbId: row.id,
  type: row.type,
  createdAt: row.createdAt,
  data: JSON.parse(row.data)
});

/* ---------------- AUTH ---------------- */

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, company } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists — try logging in' });
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        company: company ? String(company).trim() : null
      }
    });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error('signup error', err);
    res.status(500).json({ error: 'Signup failed, please try again' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) return res.status(401).json({ error: 'No account found with this email' });
    const ok = await bcrypt.compare(String(password || ''), user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Incorrect password' });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Login failed, please try again' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

/* ---------------- FACILITIES ---------------- */

app.get('/api/facilities', authMiddleware, async (req, res) => {
  try {
    const rows = await prisma.facility.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ facilities: rows.map(parseFacility) });
  } catch (err) {
    console.error('list facilities error', err);
    res.status(500).json({ error: 'Could not load your facilities' });
  }
});

app.post('/api/facilities', authMiddleware, async (req, res) => {
  try {
    const { type, name, sector, data } = req.body || {};
    if (!['supplier', 'buyer'].includes(type)) {
      return res.status(400).json({ error: 'Facility type must be supplier or buyer' });
    }
    if (!name || !sector) {
      return res.status(400).json({ error: 'Facility name and sector are required' });
    }
    const row = await prisma.facility.create({
      data: {
        userId: req.user.id,
        type,
        name: String(name),
        sector: String(sector),
        data: typeof data === 'string' ? data : JSON.stringify(data || {})
      }
    });
    res.status(201).json({ facility: parseFacility(row) });
  } catch (err) {
    console.error('create facility error', err);
    res.status(500).json({ error: 'Could not save the facility' });
  }
});

app.delete('/api/facilities/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await prisma.facility.findUnique({ where: { id } });
    if (!row || row.userId !== req.user.id) {
      return res.status(404).json({ error: 'Facility not found in your account' });
    }
    await prisma.facility.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('delete facility error', err);
    res.status(500).json({ error: 'Could not delete the facility' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'aquaswap-api' }));

app.listen(PORT, () => {
  console.log(`AquaSwap API listening on http://localhost:${PORT}`);
});
