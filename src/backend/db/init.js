// GridGuard AI — Database Initialization Script
// Runs schema.sql and seed.sql against the configured PostgreSQL instance

const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('[DB Init] Reading schema...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('[DB Init] Reading seed data...');
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

    console.log('[DB Init] Applying schema...');
    await client.query(schema);
    console.log('[DB Init] Schema applied successfully.');

    // Check if data already exists
    const { rows } = await client.query('SELECT COUNT(*) as count FROM assets');
    if (parseInt(rows[0].count, 10) > 0) {
      console.log('[DB Init] Data already exists, skipping seed. Use --force to re-seed.');
      if (!process.argv.includes('--force')) {
        return;
      }
      console.log('[DB Init] --force flag detected. Truncating and re-seeding...');
      await client.query(`
        TRUNCATE maintenance_plans, risk_scores, incidents, weather_forecasts, sensor_readings, assets CASCADE;
      `);
    }

    console.log('[DB Init] Seeding data...');
    await client.query(seed);
    console.log('[DB Init] Seed data loaded successfully.');

    // Report counts
    const tables = ['assets', 'sensor_readings', 'weather_forecasts', 'incidents'];
    for (const table of tables) {
      const res = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  → ${table}: ${res.rows[0].count} rows`);
    }

    console.log('[DB Init] Database initialization complete!');
  } catch (err) {
    console.error('[DB Init] ERROR:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
