// GridGuard AI — PostgreSQL Connection Pool
// Uses pg library with connection pooling

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://gridguard:gridguard@localhost:5432/gridguard',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Execute a parameterized query against the database.
 * @param {string} text - SQL query string with $1, $2... placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.APP_ENV === 'development') {
    console.log(`[DB] ${duration}ms | rows=${result.rowCount} | ${text.substring(0, 80)}`);
  }
  return result;
};

/**
 * Check database connectivity.
 * @returns {Promise<boolean>}
 */
const healthCheck = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

module.exports = { pool, query, healthCheck };
