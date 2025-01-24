// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db'); // Importamos la conexión a la base de datos

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas CRUD básicas
app.get('/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, date, date_value FROM sch_postgis.horizontal_data LIMIT 100'); // Cambiar tabla
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// app.post('/data', async (req, res) => {
//   try {
//     const { campo1, campo2 } = req.body; // Cambia según los campos de tu tabla
//     const result = await pool.query(
//       'INSERT INTO tu_tabla (campo1, campo2) VALUES ($1, $2) RETURNING *',
//       [campo1, campo2]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Error en el servidor');
//   }
// });

// app.put('/data/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { campo1, campo2 } = req.body; // Cambia según los campos de tu tabla
//     const result = await pool.query(
//       'UPDATE tu_tabla SET campo1 = $1, campo2 = $2 WHERE id = $3 RETURNING *',
//       [campo1, campo2, id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Error en el servidor');
//   }
// });

// app.delete('/data/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query('DELETE FROM tu_tabla WHERE id = $1', [id]);
//     res.send('Registro eliminado');
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Error en el servidor');
//   }
// });

// // Consulta espacial
// app.get('/data/spatial', async (req, res) => {
//   try {
//     const { lon, lat } = req.query; // Coordenadas del punto
//     const query = `
//       SELECT *
//       FROM tu_tabla
//       WHERE ST_Intersects(
//         geom, 
//         ST_SetSRID(ST_MakePoint($1, $2), 4326)
//       )
//     `;
//     const result = await pool.query(query, [lon, lat]);
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Error en el servidor');
//   }
// });

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
