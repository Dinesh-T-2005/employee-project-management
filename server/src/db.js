
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT || 1433),

  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate:
      process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
  },

  connectionTimeout: 15000,
  requestTimeout: 30000,

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

async function connectDB() {
  try {
    if (!process.env.DB_SERVER) {
      throw new Error(
        'DB_SERVER is missing. Please check the server/.env file.'
      );
    }

    if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
      throw new Error(
        'DB_USER or DB_PASSWORD is missing from the server/.env file.'
      );
    }

    if (!poolPromise) {
      const pool = new sql.ConnectionPool(config);

      poolPromise = pool.connect().catch((error) => {
        poolPromise = null;
        throw error;
      });
    }

    const pool = await poolPromise;

    await pool.request().query('SELECT 1 AS connected');

    console.log(' MSSQL database connected successfully');

    return pool;
  } catch (error) {
    poolPromise = null;

    console.error(' MSSQL connection failed:', error.message);

    throw error;
  }
}

module.exports = {
  sql,
  connectDB,
  getPool: connectDB,
};
