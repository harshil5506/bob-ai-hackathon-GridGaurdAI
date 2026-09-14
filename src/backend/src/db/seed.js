const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runSeed() {
  console.log('🌱 Seeding deterministic grid telemetry and incident data...');
  const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
  try {
    await pool.query(sql);
    console.log('✅ Database seeded successfully.');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;