// db.js
const { Pool } = require('pg');

// Configura tu conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Exporta el pool para que pueda ser usado en otros archivos
module.exports = pool;