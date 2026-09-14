const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/gridguard_db';

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
  max: 10,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = pool;