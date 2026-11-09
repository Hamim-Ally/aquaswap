import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, db } from './db/index.js';
import authRouter from './routes/auth.js';
import facilitiesRouter from './routes/facilities.js';
import agreementsRouter from './routes/agreements.js';
import clustersRouter from './routes/clusters.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite Database schema & seed baseline Bangladesh industrial plants
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/agreements', agreementsRouter);
app.use('/api/clusters', clustersRouter);

// Health Check & Stats
app.get('/api/health', (req, res) => {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const facilityCount = db.prepare('SELECT COUNT(*) as count FROM facilities').get().count;
    const agreementCount = db.prepare('SELECT COUNT(*) as count FROM water_agreements').get().count;

    res.json({
      status: 'healthy',
      service: 'AquaSwap Industrial Water Exchange API',
      database: 'SQLite (node:sqlite native)',
      supabaseMigrationReady: true,
      stats: {
        users: userCount,
        facilities: facilityCount,
        agreements: agreementCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AquaSwap Enterprise Backend running at http://localhost:${PORT}`);
  console.log(`📊 SQLite database connected: aquaswap.db`);
  console.log(`🔗 API Ready: /api/auth, /api/facilities, /api/agreements, /api/clusters, /api/health`);
});
