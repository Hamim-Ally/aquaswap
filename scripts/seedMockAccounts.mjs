import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { MOCK_ACCOUNTS } from '../src/data/mockAccounts.js';

const db = new DatabaseSync('aquaswap.db');
const passwordHash = bcrypt.hashSync('password123', 10);

const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (id, email, password_hash, facility_name, role, cluster_id, sector, daily_volume)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log('Seeding SQLite database with all 16 mock industrial company accounts...');
for (const acc of MOCK_ACCOUNTS) {
  insertUser.run(
    acc.id,
    acc.email.toLowerCase().trim(),
    passwordHash,
    acc.name,
    acc.role,
    acc.clusterId,
    acc.sector,
    acc.volume
  );
  console.log(`  ✓ Seeded: ${acc.name} (${acc.email}) - [${acc.industry}]`);
}

const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
console.log(`\nSuccess! Total users in SQLite database: ${count}`);

