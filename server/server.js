// server.js
require('dotenv').config(); // Importa las variables de entorno
const express = require('express');
const router = require('express').Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.NODE_SERVER_PORT || 4001;
const HOST = process.env.APP_HOST || '0.0.0.0';

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Agregar ruta para consultar un registro por ID
router.get('/data', async (req, res) => {
    try {
        const { id, table } = req.query; // Leer id y table de los parámetros de consulta
        if (!id || !table) {
            return res.status(400).send('Faltan parámetros requeridos (id o table)');
        }
        // Sanitizar el nombre de la tabla para evitar inyecciones SQL
        const sanitizedTable = table.replace(/[^a-zA-Z0-9_]/g, '').replace('view', 'data');
        console.log('Sanitized table:', sanitizedTable);
        
        // Crear consulta dinámica con la tabla
        const query = `SELECT * FROM sch_postgis.${sanitizedTable} WHERE id = $1 ORDER BY date`;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error en el servidor:', err.message);
        res.status(500).send('Error en el servidor');
    }
});

router.get('/metadata', async (req, res) => {
    try {
        const { id, table } = req.query; // Leer table de los parámetros de consulta
        if (!id || !table) {
            return res.status(400).send('Faltan parámetros requeridos (id o table)');
        }
        
        // Sanitizar el nombre de la tabla para evitar inyecciones SQL
        const sanitizedTable = table.replace(/[^a-zA-Z0-9_]/g, '');
        // Crear consulta dinámica con la tabla
        const query = `SELECT id, height, rmse, mean_velocity, acceleration FROM sch_postgis.${sanitizedTable} WHERE id = $1`;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error en el servidor:', err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Servir dinámicamente la carpeta de resultados compartidos
app.use('/results', express.static(path.join(__dirname, 'shared_outputs')));

// Agregar la ruta principal para Insar API
app.use('/insar', router);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
