// db.js
const { Pool } = require('pg');

// Configura tu conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log(pool.options);

module.exports = pool;