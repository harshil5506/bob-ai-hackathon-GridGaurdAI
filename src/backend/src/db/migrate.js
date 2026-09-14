const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigration() {
  console.log('🔄 Running database schema migration...');
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  try {
    await pool.query(sql);
    console.log('✅ Database schema migrated successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;